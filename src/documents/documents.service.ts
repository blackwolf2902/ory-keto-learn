import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../drizzle/drizzle.service';
import { documents, folders, users } from '../drizzle/schema';
import { KetoService } from '../keto/keto.service';
import { EventPublisherService } from '../events/event-publisher.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { ShareDocumentDto } from './dto/share-document.dto';
import {
    createDocumentCreatedEvent,
    createDocumentUpdatedEvent,
    createDocumentDeletedEvent,
    createDocumentSharedEvent,
    createDocumentUnsharedEvent,
} from './events/document.events';

/**
 * ============================================
 * DOCUMENTS SERVICE - Core Resource Protection
 * ============================================
 */
@Injectable()
export class DocumentsService {
    constructor(
        private readonly drizzle: DrizzleService,
        private readonly ketoService: KetoService,
        private readonly eventPublisher: EventPublisherService,
    ) { }

    /**
     * Create a new document
     */
    async create(createDocumentDto: CreateDocumentDto, userId: string) {
        const [document] = await this.drizzle.db.insert(documents).values({
            title: createDocumentDto.title,
            content: createDocumentDto.content,
            folderId: createDocumentDto.folderId,
            ownerId: userId,
        }).returning();

        // Fetch with relations
        const result = await this.drizzle.db.query.documents.findFirst({
            where: eq(documents.id, document.id),
            with: { folder: true, owner: true },
        });

        // CREATE OWNER RELATION IN KETO
        await this.ketoService.createRelation({
            namespace: 'Document',
            object: document.id,
            relation: 'owner',
            subjectId: `User:${userId}`,
        });

        // If in a folder, CREATE PARENT RELATION for inheritance
        if (document.folderId) {
            await this.ketoService.createRelation({
                namespace: 'Document',
                object: document.id,
                relation: 'parent',
                subjectSet: {
                    namespace: 'Folder',
                    object: document.folderId,
                    relation: 'viewer',
                },
            });
        }

        // EVENT SOURCING: Record document creation
        await this.eventPublisher.publish(
            createDocumentCreatedEvent(document.id, userId, {
                title: document.title,
                content: document.content ?? undefined,
                folderId: document.folderId ?? undefined,
            }),
        );

        return result;
    }

    /**
     * Share a document with a user or group
     */
    async share(documentId: string, shareDto: ShareDocumentDto, requesterId: string) {
        const [document] = await this.drizzle.db.select().from(documents).where(eq(documents.id, documentId));

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        // Verify requester can share (must be owner)
        const canShare = await this.ketoService.checkPermission({
            namespace: 'Document',
            object: documentId,
            relation: 'owner',
            subjectId: `User:${requesterId}`,
        });

        if (!canShare) {
            throw new ForbiddenException('Only owners can share documents');
        }

        if (shareDto.userId) {
            await this.ketoService.createRelation({
                namespace: 'Document',
                object: documentId,
                relation: shareDto.relation,
                subjectId: `User:${shareDto.userId}`,
            });

            await this.eventPublisher.publish(
                createDocumentSharedEvent(documentId, requesterId, {
                    targetType: 'user',
                    targetId: shareDto.userId,
                    relation: shareDto.relation as 'viewer' | 'editor',
                }),
            );

            return {
                success: true,
                message: `Shared with user as ${shareDto.relation}`,
                relation: `Document:${documentId}#${shareDto.relation}@User:${shareDto.userId}`
            };
        } else if (shareDto.groupId) {
            await this.ketoService.createRelation({
                namespace: 'Document',
                object: documentId,
                relation: shareDto.relation,
                subjectSet: this.ketoService.groupMembersSubjectSet(shareDto.groupId),
            });

            await this.eventPublisher.publish(
                createDocumentSharedEvent(documentId, requesterId, {
                    targetType: 'group',
                    targetId: shareDto.groupId,
                    relation: shareDto.relation as 'viewer' | 'editor',
                }),
            );

            return {
                success: true,
                message: `Shared with group members as ${shareDto.relation}`,
                relation: `Document:${documentId}#${shareDto.relation}@Group:${shareDto.groupId}#member`
            };
        }

        throw new Error('Must specify userId or groupId');
    }

    /**
     * Revoke access from a user or group
     */
    async unshare(documentId: string, shareDto: ShareDocumentDto, requesterId: string) {
        const canShare = await this.ketoService.checkPermission({
            namespace: 'Document',
            object: documentId,
            relation: 'owner',
            subjectId: `User:${requesterId}`,
        });

        if (!canShare) {
            throw new ForbiddenException('Only owners can modify sharing');
        }

        if (shareDto.userId) {
            await this.ketoService.deleteRelation({
                namespace: 'Document',
                object: documentId,
                relation: shareDto.relation,
                subjectId: `User:${shareDto.userId}`,
            });

            await this.eventPublisher.publish(
                createDocumentUnsharedEvent(documentId, requesterId, {
                    targetType: 'user',
                    targetId: shareDto.userId,
                    relation: shareDto.relation as 'viewer' | 'editor',
                }),
            );
        } else if (shareDto.groupId) {
            await this.ketoService.deleteRelation({
                namespace: 'Document',
                object: documentId,
                relation: shareDto.relation,
                subjectSet: this.ketoService.groupMembersSubjectSet(shareDto.groupId),
            });

            await this.eventPublisher.publish(
                createDocumentUnsharedEvent(documentId, requesterId, {
                    targetType: 'group',
                    targetId: shareDto.groupId,
                    relation: shareDto.relation as 'viewer' | 'editor',
                }),
            );
        }

        return { success: true, message: 'Access revoked' };
    }

    /**
     * Get who has access to a document
     */
    async getAccessList(documentId: string) {
        const [owners, editors, viewers] = await Promise.all([
            this.ketoService.expandPermission({
                namespace: 'Document',
                object: documentId,
                relation: 'owner',
            }),
            this.ketoService.expandPermission({
                namespace: 'Document',
                object: documentId,
                relation: 'editor',
            }),
            this.ketoService.expandPermission({
                namespace: 'Document',
                object: documentId,
                relation: 'viewer',
            }),
        ]);

        return { owners, editors, viewers };
    }

    /**
     * Check if user has specific permission
     */
    async checkAccess(documentId: string, userId: string, relation: string) {
        const allowed = await this.ketoService.checkPermission({
            namespace: 'Document',
            object: documentId,
            relation,
            subjectId: `User:${userId}`,
        });

        return {
            allowed,
            check: `Document:${documentId}#${relation}@User:${userId}`
        };
    }

    async findAll() {
        return this.drizzle.db.query.documents.findMany({
            with: { folder: true, owner: true },
        });
    }

    /**
     * Get documents owned by a specific user
     * SESSION ISOLATION: Users only see their own documents
     */
    async findAllByOwner(ownerId: string) {
        return this.drizzle.db.query.documents.findMany({
            where: eq(documents.ownerId, ownerId),
            with: { folder: true, owner: true },
        });
    }

    async findOne(id: string) {
        const document = await this.drizzle.db.query.documents.findFirst({
            where: eq(documents.id, id),
            with: { folder: true, owner: true },
        });

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        return document;
    }

    async update(id: string, updateDocumentDto: UpdateDocumentDto, userId?: string) {
        const [document] = await this.drizzle.db.update(documents)
            .set({ ...updateDocumentDto, updatedAt: new Date() })
            .where(eq(documents.id, id))
            .returning();

        const result = await this.drizzle.db.query.documents.findFirst({
            where: eq(documents.id, id),
            with: { folder: true, owner: true },
        });

        if (userId) {
            await this.eventPublisher.publish(
                createDocumentUpdatedEvent(id, userId, {
                    changes: updateDocumentDto,
                }),
            );
        }

        return result;
    }

    async remove(id: string, userId?: string) {
        const [document] = await this.drizzle.db.select().from(documents).where(eq(documents.id, id));

        await this.ketoService.deleteAllRelationsForObject('Document', id);

        await this.drizzle.db.delete(documents).where(eq(documents.id, id));

        if (userId && document) {
            await this.eventPublisher.publish(
                createDocumentDeletedEvent(id, userId, {
                    title: document.title,
                }),
            );
        }

        return { success: true };
    }
}

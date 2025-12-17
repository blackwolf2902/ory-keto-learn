import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
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
 * 
 * This service demonstrates ALL major Keto concepts:
 * 
 * 1. OWNER ASSIGNMENT: Creator gets owner relation
 * 2. DIRECT SHARING: Add viewer/editor relations
 * 3. GROUP SHARING: Share with group members (Subject Sets)
 * 4. PARENT INHERITANCE: Document inherits folder permissions
 * 5. PERMISSION EXPANSION: List who can access a document
 */
@Injectable()
export class DocumentsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly ketoService: KetoService,
        private readonly eventPublisher: EventPublisherService,
    ) { }

    /**
     * Create a new document
     * 
     * KETO INTEGRATION - Creating Owner Relation:
     * When a document is created, we automatically assign
     * the creator as the owner in Keto:
     *   Document:{docId}#owner@User:{userId}
     * 
     * If the document is in a folder, we also create:
     *   Document:{docId}#parent@Folder:{folderId}
     * 
     * This enables PERMISSION INHERITANCE - if you can view
     * the folder, you can view documents in it.
     */
    async create(createDocumentDto: CreateDocumentDto, userId: string) {
        // Create document in database
        const document = await this.prisma.document.create({
            data: {
                title: createDocumentDto.title,
                content: createDocumentDto.content,
                folderId: createDocumentDto.folderId,
                ownerId: userId,
            },
            include: { folder: true, owner: true },
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
                    relation: 'viewer', // Folder viewers become document viewers
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

        return document;
    }

    /**
     * Share a document with a user or group
     * 
     * KETO INTEGRATION - Granting Access:
     * 
     * Share with user:
     *   Document:{docId}#viewer@User:{userId}
     * 
     * Share with group:
     *   Document:{docId}#viewer@Group:{groupId}#member
     * 
     * The group sharing uses SUBJECT SETS - instead of
     * granting to each user, we grant to "members of group X"
     */
    async share(documentId: string, shareDto: ShareDocumentDto, requesterId: string) {
        const document = await this.prisma.document.findUnique({
            where: { id: documentId },
        });

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

        // Create the relation based on share type
        if (shareDto.userId) {
            // DIRECT USER SHARING
            await this.ketoService.createRelation({
                namespace: 'Document',
                object: documentId,
                relation: shareDto.relation,
                subjectId: `User:${shareDto.userId}`,
            });

            // EVENT SOURCING: Record document shared with user
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
            // GROUP SHARING (Subject Set)
            await this.ketoService.createRelation({
                namespace: 'Document',
                object: documentId,
                relation: shareDto.relation,
                subjectSet: this.ketoService.groupMembersSubjectSet(shareDto.groupId),
            });

            // EVENT SOURCING: Record document shared with group
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
        // Verify requester can share (must be owner)
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

            // EVENT SOURCING: Record access revoked from user
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

            // EVENT SOURCING: Record access revoked from group
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
     * 
     * KETO INTEGRATION - Permission Expansion:
     * Uses the expand API to list all subjects with a permission.
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

    // Basic CRUD operations

    async findAll() {
        return this.prisma.document.findMany({
            include: { folder: true, owner: true },
        });
    }

    async findOne(id: string) {
        const document = await this.prisma.document.findUnique({
            where: { id },
            include: { folder: true, owner: true },
        });

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        return document;
    }

    async update(id: string, updateDocumentDto: UpdateDocumentDto, userId?: string) {
        const document = await this.prisma.document.update({
            where: { id },
            data: updateDocumentDto,
            include: { folder: true, owner: true },
        });

        // EVENT SOURCING: Record document update
        if (userId) {
            await this.eventPublisher.publish(
                createDocumentUpdatedEvent(id, userId, {
                    changes: updateDocumentDto,
                }),
            );
        }

        return document;
    }

    async remove(id: string, userId?: string) {
        // Get document info before deletion for event
        const document = await this.prisma.document.findUnique({ where: { id } });

        // Delete all Keto relations for this document
        await this.ketoService.deleteAllRelationsForObject('Document', id);

        // Delete from database
        await this.prisma.document.delete({ where: { id } });

        // EVENT SOURCING: Record document deletion
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

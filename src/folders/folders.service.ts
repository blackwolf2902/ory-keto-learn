import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../drizzle/drizzle.service';
import { folders, users } from '../drizzle/schema';
import { KetoService } from '../keto/keto.service';
import { EventPublisherService } from '../events/event-publisher.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { ShareFolderDto } from './dto/share-folder.dto';
import {
    createFolderCreatedEvent,
    createFolderDeletedEvent,
    createFolderSharedEvent,
    createFolderUnsharedEvent,
} from './events/folder.events';

/**
 * ============================================
 * FOLDERS SERVICE - Hierarchical Permissions
 * ============================================
 */
@Injectable()
export class FoldersService {
    constructor(
        private readonly drizzle: DrizzleService,
        private readonly ketoService: KetoService,
        private readonly eventPublisher: EventPublisherService,
    ) { }

    /**
     * Create a new folder
     */
    async create(createFolderDto: CreateFolderDto, userId: string) {
        const [folder] = await this.drizzle.db.insert(folders).values({
            name: createFolderDto.name,
            description: createFolderDto.description,
            parentId: createFolderDto.parentId,
            ownerId: userId,
        }).returning();

        const result = await this.drizzle.db.query.folders.findFirst({
            where: eq(folders.id, folder.id),
            with: { parent: true, owner: true },
        });

        // Create owner relation
        await this.ketoService.createRelation({
            namespace: 'Folder',
            object: folder.id,
            relation: 'owner',
            subjectId: `User:${userId}`,
        });

        // Create parent relation for inheritance (if has parent)
        if (folder.parentId) {
            await this.ketoService.createRelation({
                namespace: 'Folder',
                object: folder.id,
                relation: 'parent',
                subjectSet: {
                    namespace: 'Folder',
                    object: folder.parentId,
                    relation: 'viewer',
                },
            });
        }

        // EVENT SOURCING: Record folder creation
        await this.eventPublisher.publish(
            createFolderCreatedEvent(folder.id, userId, {
                name: folder.name,
                description: folder.description ?? undefined,
                parentId: folder.parentId ?? undefined,
            }),
        );

        return result;
    }

    /**
     * Share a folder with user or group
     */
    async share(folderId: string, shareDto: ShareFolderDto, requesterId: string) {
        const [folder] = await this.drizzle.db.select().from(folders).where(eq(folders.id, folderId));

        if (!folder) {
            throw new NotFoundException('Folder not found');
        }

        const canShare = await this.ketoService.checkPermission({
            namespace: 'Folder',
            object: folderId,
            relation: 'owner',
            subjectId: `User:${requesterId}`,
        });

        if (!canShare) {
            throw new ForbiddenException('Only owners can share folders');
        }

        if (shareDto.userId) {
            await this.ketoService.createRelation({
                namespace: 'Folder',
                object: folderId,
                relation: shareDto.relation,
                subjectId: `User:${shareDto.userId}`,
            });

            await this.eventPublisher.publish(
                createFolderSharedEvent(folderId, requesterId, {
                    targetType: 'user',
                    targetId: shareDto.userId,
                    relation: shareDto.relation as 'viewer' | 'editor',
                }),
            );

            return {
                success: true,
                message: `Shared folder with user as ${shareDto.relation}`,
                relation: `Folder:${folderId}#${shareDto.relation}@User:${shareDto.userId}`,
                note: 'User now has access to this folder and all nested content',
            };
        } else if (shareDto.groupId) {
            await this.ketoService.createRelation({
                namespace: 'Folder',
                object: folderId,
                relation: shareDto.relation,
                subjectSet: this.ketoService.groupMembersSubjectSet(shareDto.groupId),
            });

            await this.eventPublisher.publish(
                createFolderSharedEvent(folderId, requesterId, {
                    targetType: 'group',
                    targetId: shareDto.groupId,
                    relation: shareDto.relation as 'viewer' | 'editor',
                }),
            );

            return {
                success: true,
                message: `Shared folder with group as ${shareDto.relation}`,
                relation: `Folder:${folderId}#${shareDto.relation}@Group:${shareDto.groupId}#member`,
                note: 'All group members now have access to this folder and all nested content',
            };
        }

        throw new Error('Must specify userId or groupId');
    }

    async findAll() {
        return this.drizzle.db.query.folders.findMany({
            with: {
                parent: true,
                children: true,
                documents: true,
                owner: true,
            },
        });
    }

    /**
     * Get folders owned by a specific user
     * SESSION ISOLATION: Users only see their own folders
     */
    async findAllByOwner(ownerId: string) {
        return this.drizzle.db.query.folders.findMany({
            where: eq(folders.ownerId, ownerId),
            with: {
                parent: true,
                children: true,
                documents: true,
                owner: true,
            },
        });
    }

    async findOne(id: string) {
        const folder = await this.drizzle.db.query.folders.findFirst({
            where: eq(folders.id, id),
            with: {
                parent: true,
                children: true,
                documents: true,
                owner: true,
            },
        });

        if (!folder) {
            throw new NotFoundException('Folder not found');
        }

        return folder;
    }

    /**
     * Revoke access from a user or group
     */
    async unshare(folderId: string, shareDto: ShareFolderDto, requesterId: string) {
        const canShare = await this.ketoService.checkPermission({
            namespace: 'Folder',
            object: folderId,
            relation: 'owner',
            subjectId: `User:${requesterId}`,
        });

        if (!canShare) {
            throw new ForbiddenException('Only owners can modify sharing');
        }

        if (shareDto.userId) {
            await this.ketoService.deleteRelation({
                namespace: 'Folder',
                object: folderId,
                relation: shareDto.relation,
                subjectId: `User:${shareDto.userId}`,
            });

            await this.eventPublisher.publish(
                createFolderUnsharedEvent(folderId, requesterId, {
                    targetType: 'user',
                    targetId: shareDto.userId,
                    relation: shareDto.relation as 'viewer' | 'editor',
                }),
            );
        } else if (shareDto.groupId) {
            await this.ketoService.deleteRelation({
                namespace: 'Folder',
                object: folderId,
                relation: shareDto.relation,
                subjectSet: this.ketoService.groupMembersSubjectSet(shareDto.groupId),
            });

            await this.eventPublisher.publish(
                createFolderUnsharedEvent(folderId, requesterId, {
                    targetType: 'group',
                    targetId: shareDto.groupId,
                    relation: shareDto.relation as 'viewer' | 'editor',
                }),
            );
        }

        return {
            success: true,
            message: 'Access revoked',
            note: 'User/group no longer has direct access to this folder (inherited access may still apply)',
        };
    }

    /**
     * Get who has access to a folder
     */
    async getAccessList(folderId: string) {
        const [folder] = await this.drizzle.db.select().from(folders).where(eq(folders.id, folderId));

        if (!folder) {
            throw new NotFoundException('Folder not found');
        }

        const [owners, editors, viewers] = await Promise.all([
            this.ketoService.expandPermission({
                namespace: 'Folder',
                object: folderId,
                relation: 'owner',
            }),
            this.ketoService.expandPermission({
                namespace: 'Folder',
                object: folderId,
                relation: 'editor',
            }),
            this.ketoService.expandPermission({
                namespace: 'Folder',
                object: folderId,
                relation: 'viewer',
            }),
        ]);

        return { owners, editors, viewers };
    }

    /**
     * Check if user has specific permission on folder
     */
    async checkAccess(folderId: string, userId: string, relation: string) {
        const allowed = await this.ketoService.checkPermission({
            namespace: 'Folder',
            object: folderId,
            relation,
            subjectId: `User:${userId}`,
        });

        return {
            allowed,
            check: `Folder:${folderId}#${relation}@User:${userId}`
        };
    }

    async remove(id: string, userId?: string) {
        const [folder] = await this.drizzle.db.select().from(folders).where(eq(folders.id, id));

        await this.ketoService.deleteAllRelationsForObject('Folder', id);
        await this.drizzle.db.delete(folders).where(eq(folders.id, id));

        if (userId && folder) {
            await this.eventPublisher.publish(
                createFolderDeletedEvent(id, userId, {
                    name: folder.name,
                }),
            );
        }

        return { success: true };
    }
}

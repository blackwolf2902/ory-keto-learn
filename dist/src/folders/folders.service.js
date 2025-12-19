"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoldersService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_service_1 = require("../drizzle/drizzle.service");
const schema_1 = require("../drizzle/schema");
const keto_service_1 = require("../keto/keto.service");
const event_publisher_service_1 = require("../events/event-publisher.service");
const folder_events_1 = require("./events/folder.events");
let FoldersService = class FoldersService {
    drizzle;
    ketoService;
    eventPublisher;
    constructor(drizzle, ketoService, eventPublisher) {
        this.drizzle = drizzle;
        this.ketoService = ketoService;
        this.eventPublisher = eventPublisher;
    }
    async create(createFolderDto, userId) {
        const [folder] = await this.drizzle.db.insert(schema_1.folders).values({
            name: createFolderDto.name,
            description: createFolderDto.description,
            parentId: createFolderDto.parentId,
            ownerId: userId,
        }).returning();
        const result = await this.drizzle.db.query.folders.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.folders.id, folder.id),
            with: { parent: true, owner: true },
        });
        await this.ketoService.createRelation({
            namespace: 'Folder',
            object: folder.id,
            relation: 'owner',
            subjectId: `User:${userId}`,
        });
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
        await this.eventPublisher.publish((0, folder_events_1.createFolderCreatedEvent)(folder.id, userId, {
            name: folder.name,
            description: folder.description ?? undefined,
            parentId: folder.parentId ?? undefined,
        }));
        return result;
    }
    async share(folderId, shareDto, requesterId) {
        const [folder] = await this.drizzle.db.select().from(schema_1.folders).where((0, drizzle_orm_1.eq)(schema_1.folders.id, folderId));
        if (!folder) {
            throw new common_1.NotFoundException('Folder not found');
        }
        const canShare = await this.ketoService.checkPermission({
            namespace: 'Folder',
            object: folderId,
            relation: 'owner',
            subjectId: `User:${requesterId}`,
        });
        if (!canShare) {
            throw new common_1.ForbiddenException('Only owners can share folders');
        }
        if (shareDto.userId) {
            await this.ketoService.createRelation({
                namespace: 'Folder',
                object: folderId,
                relation: shareDto.relation,
                subjectId: `User:${shareDto.userId}`,
            });
            await this.eventPublisher.publish((0, folder_events_1.createFolderSharedEvent)(folderId, requesterId, {
                targetType: 'user',
                targetId: shareDto.userId,
                relation: shareDto.relation,
            }));
            return {
                success: true,
                message: `Shared folder with user as ${shareDto.relation}`,
                relation: `Folder:${folderId}#${shareDto.relation}@User:${shareDto.userId}`,
                note: 'User now has access to this folder and all nested content',
            };
        }
        else if (shareDto.groupId) {
            await this.ketoService.createRelation({
                namespace: 'Folder',
                object: folderId,
                relation: shareDto.relation,
                subjectSet: this.ketoService.groupMembersSubjectSet(shareDto.groupId),
            });
            await this.eventPublisher.publish((0, folder_events_1.createFolderSharedEvent)(folderId, requesterId, {
                targetType: 'group',
                targetId: shareDto.groupId,
                relation: shareDto.relation,
            }));
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
    async findAllByOwner(ownerId) {
        return this.drizzle.db.query.folders.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.folders.ownerId, ownerId),
            with: {
                parent: true,
                children: true,
                documents: true,
                owner: true,
            },
        });
    }
    async findOne(id) {
        const folder = await this.drizzle.db.query.folders.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.folders.id, id),
            with: {
                parent: true,
                children: true,
                documents: true,
                owner: true,
            },
        });
        if (!folder) {
            throw new common_1.NotFoundException('Folder not found');
        }
        return folder;
    }
    async unshare(folderId, shareDto, requesterId) {
        const canShare = await this.ketoService.checkPermission({
            namespace: 'Folder',
            object: folderId,
            relation: 'owner',
            subjectId: `User:${requesterId}`,
        });
        if (!canShare) {
            throw new common_1.ForbiddenException('Only owners can modify sharing');
        }
        if (shareDto.userId) {
            await this.ketoService.deleteRelation({
                namespace: 'Folder',
                object: folderId,
                relation: shareDto.relation,
                subjectId: `User:${shareDto.userId}`,
            });
            await this.eventPublisher.publish((0, folder_events_1.createFolderUnsharedEvent)(folderId, requesterId, {
                targetType: 'user',
                targetId: shareDto.userId,
                relation: shareDto.relation,
            }));
        }
        else if (shareDto.groupId) {
            await this.ketoService.deleteRelation({
                namespace: 'Folder',
                object: folderId,
                relation: shareDto.relation,
                subjectSet: this.ketoService.groupMembersSubjectSet(shareDto.groupId),
            });
            await this.eventPublisher.publish((0, folder_events_1.createFolderUnsharedEvent)(folderId, requesterId, {
                targetType: 'group',
                targetId: shareDto.groupId,
                relation: shareDto.relation,
            }));
        }
        return {
            success: true,
            message: 'Access revoked',
            note: 'User/group no longer has direct access to this folder (inherited access may still apply)',
        };
    }
    async getAccessList(folderId) {
        const [folder] = await this.drizzle.db.select().from(schema_1.folders).where((0, drizzle_orm_1.eq)(schema_1.folders.id, folderId));
        if (!folder) {
            throw new common_1.NotFoundException('Folder not found');
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
    async checkAccess(folderId, userId, relation) {
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
    async remove(id, userId) {
        const [folder] = await this.drizzle.db.select().from(schema_1.folders).where((0, drizzle_orm_1.eq)(schema_1.folders.id, id));
        await this.ketoService.deleteAllRelationsForObject('Folder', id);
        await this.drizzle.db.delete(schema_1.folders).where((0, drizzle_orm_1.eq)(schema_1.folders.id, id));
        if (userId && folder) {
            await this.eventPublisher.publish((0, folder_events_1.createFolderDeletedEvent)(id, userId, {
                name: folder.name,
            }));
        }
        return { success: true };
    }
};
exports.FoldersService = FoldersService;
exports.FoldersService = FoldersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [drizzle_service_1.DrizzleService,
        keto_service_1.KetoService,
        event_publisher_service_1.EventPublisherService])
], FoldersService);
//# sourceMappingURL=folders.service.js.map
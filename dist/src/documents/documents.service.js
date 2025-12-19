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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_service_1 = require("../drizzle/drizzle.service");
const schema_1 = require("../drizzle/schema");
const keto_service_1 = require("../keto/keto.service");
const event_publisher_service_1 = require("../events/event-publisher.service");
const document_events_1 = require("./events/document.events");
let DocumentsService = class DocumentsService {
    drizzle;
    ketoService;
    eventPublisher;
    constructor(drizzle, ketoService, eventPublisher) {
        this.drizzle = drizzle;
        this.ketoService = ketoService;
        this.eventPublisher = eventPublisher;
    }
    async create(createDocumentDto, userId) {
        const [document] = await this.drizzle.db.insert(schema_1.documents).values({
            title: createDocumentDto.title,
            content: createDocumentDto.content,
            folderId: createDocumentDto.folderId,
            ownerId: userId,
        }).returning();
        const result = await this.drizzle.db.query.documents.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.documents.id, document.id),
            with: { folder: true, owner: true },
        });
        await this.ketoService.createRelation({
            namespace: 'Document',
            object: document.id,
            relation: 'owner',
            subjectId: `User:${userId}`,
        });
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
        await this.eventPublisher.publish((0, document_events_1.createDocumentCreatedEvent)(document.id, userId, {
            title: document.title,
            content: document.content ?? undefined,
            folderId: document.folderId ?? undefined,
        }));
        return result;
    }
    async share(documentId, shareDto, requesterId) {
        const [document] = await this.drizzle.db.select().from(schema_1.documents).where((0, drizzle_orm_1.eq)(schema_1.documents.id, documentId));
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        const canShare = await this.ketoService.checkPermission({
            namespace: 'Document',
            object: documentId,
            relation: 'owner',
            subjectId: `User:${requesterId}`,
        });
        if (!canShare) {
            throw new common_1.ForbiddenException('Only owners can share documents');
        }
        if (shareDto.userId) {
            await this.ketoService.createRelation({
                namespace: 'Document',
                object: documentId,
                relation: shareDto.relation,
                subjectId: `User:${shareDto.userId}`,
            });
            await this.eventPublisher.publish((0, document_events_1.createDocumentSharedEvent)(documentId, requesterId, {
                targetType: 'user',
                targetId: shareDto.userId,
                relation: shareDto.relation,
            }));
            return {
                success: true,
                message: `Shared with user as ${shareDto.relation}`,
                relation: `Document:${documentId}#${shareDto.relation}@User:${shareDto.userId}`
            };
        }
        else if (shareDto.groupId) {
            await this.ketoService.createRelation({
                namespace: 'Document',
                object: documentId,
                relation: shareDto.relation,
                subjectSet: this.ketoService.groupMembersSubjectSet(shareDto.groupId),
            });
            await this.eventPublisher.publish((0, document_events_1.createDocumentSharedEvent)(documentId, requesterId, {
                targetType: 'group',
                targetId: shareDto.groupId,
                relation: shareDto.relation,
            }));
            return {
                success: true,
                message: `Shared with group members as ${shareDto.relation}`,
                relation: `Document:${documentId}#${shareDto.relation}@Group:${shareDto.groupId}#member`
            };
        }
        throw new Error('Must specify userId or groupId');
    }
    async unshare(documentId, shareDto, requesterId) {
        const canShare = await this.ketoService.checkPermission({
            namespace: 'Document',
            object: documentId,
            relation: 'owner',
            subjectId: `User:${requesterId}`,
        });
        if (!canShare) {
            throw new common_1.ForbiddenException('Only owners can modify sharing');
        }
        if (shareDto.userId) {
            await this.ketoService.deleteRelation({
                namespace: 'Document',
                object: documentId,
                relation: shareDto.relation,
                subjectId: `User:${shareDto.userId}`,
            });
            await this.eventPublisher.publish((0, document_events_1.createDocumentUnsharedEvent)(documentId, requesterId, {
                targetType: 'user',
                targetId: shareDto.userId,
                relation: shareDto.relation,
            }));
        }
        else if (shareDto.groupId) {
            await this.ketoService.deleteRelation({
                namespace: 'Document',
                object: documentId,
                relation: shareDto.relation,
                subjectSet: this.ketoService.groupMembersSubjectSet(shareDto.groupId),
            });
            await this.eventPublisher.publish((0, document_events_1.createDocumentUnsharedEvent)(documentId, requesterId, {
                targetType: 'group',
                targetId: shareDto.groupId,
                relation: shareDto.relation,
            }));
        }
        return { success: true, message: 'Access revoked' };
    }
    async getAccessList(documentId) {
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
    async checkAccess(documentId, userId, relation) {
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
    async findAllByOwner(ownerId) {
        return this.drizzle.db.query.documents.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.documents.ownerId, ownerId),
            with: { folder: true, owner: true },
        });
    }
    async findOne(id) {
        const document = await this.drizzle.db.query.documents.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.documents.id, id),
            with: { folder: true, owner: true },
        });
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        return document;
    }
    async update(id, updateDocumentDto, userId) {
        const [document] = await this.drizzle.db.update(schema_1.documents)
            .set({ ...updateDocumentDto, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.documents.id, id))
            .returning();
        const result = await this.drizzle.db.query.documents.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.documents.id, id),
            with: { folder: true, owner: true },
        });
        if (userId) {
            await this.eventPublisher.publish((0, document_events_1.createDocumentUpdatedEvent)(id, userId, {
                changes: updateDocumentDto,
            }));
        }
        return result;
    }
    async remove(id, userId) {
        const [document] = await this.drizzle.db.select().from(schema_1.documents).where((0, drizzle_orm_1.eq)(schema_1.documents.id, id));
        await this.ketoService.deleteAllRelationsForObject('Document', id);
        await this.drizzle.db.delete(schema_1.documents).where((0, drizzle_orm_1.eq)(schema_1.documents.id, id));
        if (userId && document) {
            await this.eventPublisher.publish((0, document_events_1.createDocumentDeletedEvent)(id, userId, {
                title: document.title,
            }));
        }
        return { success: true };
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [drizzle_service_1.DrizzleService,
        keto_service_1.KetoService,
        event_publisher_service_1.EventPublisherService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map
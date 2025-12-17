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
const prisma_service_1 = require("../prisma.service");
const keto_service_1 = require("../keto/keto.service");
const event_publisher_service_1 = require("../events/event-publisher.service");
const document_events_1 = require("./events/document.events");
let DocumentsService = class DocumentsService {
    prisma;
    ketoService;
    eventPublisher;
    constructor(prisma, ketoService, eventPublisher) {
        this.prisma = prisma;
        this.ketoService = ketoService;
        this.eventPublisher = eventPublisher;
    }
    async create(createDocumentDto, userId) {
        const document = await this.prisma.document.create({
            data: {
                title: createDocumentDto.title,
                content: createDocumentDto.content,
                folderId: createDocumentDto.folderId,
                ownerId: userId,
            },
            include: { folder: true, owner: true },
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
        return document;
    }
    async share(documentId, shareDto, requesterId) {
        const document = await this.prisma.document.findUnique({
            where: { id: documentId },
        });
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
        return this.prisma.document.findMany({
            include: { folder: true, owner: true },
        });
    }
    async findOne(id) {
        const document = await this.prisma.document.findUnique({
            where: { id },
            include: { folder: true, owner: true },
        });
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        return document;
    }
    async update(id, updateDocumentDto, userId) {
        const document = await this.prisma.document.update({
            where: { id },
            data: updateDocumentDto,
            include: { folder: true, owner: true },
        });
        if (userId) {
            await this.eventPublisher.publish((0, document_events_1.createDocumentUpdatedEvent)(id, userId, {
                changes: updateDocumentDto,
            }));
        }
        return document;
    }
    async remove(id, userId) {
        const document = await this.prisma.document.findUnique({ where: { id } });
        await this.ketoService.deleteAllRelationsForObject('Document', id);
        await this.prisma.document.delete({ where: { id } });
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        keto_service_1.KetoService,
        event_publisher_service_1.EventPublisherService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map
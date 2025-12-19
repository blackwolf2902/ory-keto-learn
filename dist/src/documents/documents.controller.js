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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const documents_service_1 = require("./documents.service");
const create_document_dto_1 = require("./dto/create-document.dto");
const update_document_dto_1 = require("./dto/update-document.dto");
const share_document_dto_1 = require("./dto/share-document.dto");
const keto_guard_1 = require("../common/guards/keto.guard");
const permission_decorator_1 = require("../common/decorators/permission.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let DocumentsController = class DocumentsController {
    documentsService;
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    create(createDocumentDto, user) {
        return this.documentsService.create(createDocumentDto, user.id);
    }
    findAll(user) {
        return this.documentsService.findAllByOwner(user.id);
    }
    findOne(id) {
        return this.documentsService.findOne(id);
    }
    update(id, updateDocumentDto, user) {
        return this.documentsService.update(id, updateDocumentDto, user.id);
    }
    remove(id, user) {
        return this.documentsService.remove(id, user.id);
    }
    share(id, shareDto, user) {
        return this.documentsService.share(id, shareDto, user.id);
    }
    unshare(id, shareDto, user) {
        return this.documentsService.unshare(id, shareDto, user.id);
    }
    getAccessList(id) {
        return this.documentsService.getAccessList(id);
    }
    checkAccess(id, relation, userId, currentUser) {
        const userIdToCheck = userId || currentUser?.id;
        if (!userIdToCheck) {
            return { allowed: false, check: 'No user specified', error: 'Missing userId' };
        }
        return this.documentsService.checkAccess(id, userIdToCheck, relation);
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Post)(),
    (0, permission_decorator_1.SkipPermissionCheck)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new document',
        description: 'Creates document and assigns creator as owner in Keto'
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_document_dto_1.CreateDocumentDto, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permission_decorator_1.SkipPermissionCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all documents (filtered by current user)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permission_decorator_1.RequirePermission)({
        namespace: 'Document',
        relation: 'view',
        objectIdSource: 'params',
        objectIdParam: 'id',
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a document by ID',
        description: 'Requires view permission (owner/editor/viewer/folder access)'
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permission_decorator_1.RequirePermission)({
        namespace: 'Document',
        relation: 'edit',
        objectIdSource: 'params',
        objectIdParam: 'id',
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a document',
        description: 'Requires edit permission (owner/editor)'
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_document_dto_1.UpdateDocumentDto, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permission_decorator_1.RequirePermission)({
        namespace: 'Document',
        relation: 'delete',
        objectIdSource: 'params',
        objectIdParam: 'id',
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete a document',
        description: 'Requires delete permission (owner only)'
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/share'),
    (0, permission_decorator_1.SkipPermissionCheck)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Share a document with a user or group',
        description: 'Creates viewer/editor relation. Only owners can share.'
    }),
    (0, swagger_1.ApiBody)({ type: share_document_dto_1.ShareDocumentDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, share_document_dto_1.ShareDocumentDto, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "share", null);
__decorate([
    (0, common_1.Delete)(':id/share'),
    (0, permission_decorator_1.SkipPermissionCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke access from a user or group' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, share_document_dto_1.ShareDocumentDto, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "unshare", null);
__decorate([
    (0, common_1.Get)(':id/access'),
    (0, permission_decorator_1.RequirePermission)({
        namespace: 'Document',
        relation: 'owner',
        objectIdSource: 'params',
        objectIdParam: 'id',
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Get who has access to a document',
        description: 'Uses Keto expand API. Requires owner permission.'
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "getAccessList", null);
__decorate([
    (0, common_1.Get)(':id/check/:relation'),
    (0, permission_decorator_1.SkipPermissionCheck)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Check if a user has specific permission',
        description: 'For Permission Playground - check any user\'s access'
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('relation')),
    __param(2, (0, common_1.Query)('userId')),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "checkAccess", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, swagger_1.ApiTags)('Documents'),
    (0, common_1.Controller)('documents'),
    (0, common_1.UseGuards)(keto_guard_1.KetoGuard),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map
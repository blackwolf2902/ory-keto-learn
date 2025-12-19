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
exports.FoldersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const folders_service_1 = require("./folders.service");
const create_folder_dto_1 = require("./dto/create-folder.dto");
const share_folder_dto_1 = require("./dto/share-folder.dto");
const keto_guard_1 = require("../common/guards/keto.guard");
const permission_decorator_1 = require("../common/decorators/permission.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let FoldersController = class FoldersController {
    foldersService;
    constructor(foldersService) {
        this.foldersService = foldersService;
    }
    create(createFolderDto, user) {
        return this.foldersService.create(createFolderDto, user.id);
    }
    findAll(user) {
        return this.foldersService.findAllByOwner(user.id);
    }
    findOne(id) {
        return this.foldersService.findOne(id);
    }
    share(id, shareDto, user) {
        return this.foldersService.share(id, shareDto, user.id);
    }
    unshare(id, shareDto, user) {
        return this.foldersService.unshare(id, shareDto, user.id);
    }
    getAccessList(id) {
        return this.foldersService.getAccessList(id);
    }
    checkAccess(id, relation, user) {
        return this.foldersService.checkAccess(id, user.id, relation);
    }
    remove(id, user) {
        return this.foldersService.remove(id, user.id);
    }
};
exports.FoldersController = FoldersController;
__decorate([
    (0, common_1.Post)(),
    (0, permission_decorator_1.SkipPermissionCheck)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new folder',
        description: 'Creates folder and assigns owner. If parent specified, creates inheritance relation.'
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_folder_dto_1.CreateFolderDto, Object]),
    __metadata("design:returntype", void 0)
], FoldersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permission_decorator_1.SkipPermissionCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all folders (filtered by current user)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FoldersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permission_decorator_1.RequirePermission)({
        namespace: 'Folder',
        relation: 'view',
        objectIdSource: 'params',
        objectIdParam: 'id',
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Get folder by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FoldersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/share'),
    (0, permission_decorator_1.SkipPermissionCheck)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Share folder with user or group',
        description: 'Grants access to folder AND all nested content'
    }),
    (0, swagger_1.ApiBody)({ type: share_folder_dto_1.ShareFolderDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, share_folder_dto_1.ShareFolderDto, Object]),
    __metadata("design:returntype", void 0)
], FoldersController.prototype, "share", null);
__decorate([
    (0, common_1.Delete)(':id/share'),
    (0, permission_decorator_1.SkipPermissionCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke access from a user or group' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, share_folder_dto_1.ShareFolderDto, Object]),
    __metadata("design:returntype", void 0)
], FoldersController.prototype, "unshare", null);
__decorate([
    (0, common_1.Get)(':id/access'),
    (0, permission_decorator_1.RequirePermission)({
        namespace: 'Folder',
        relation: 'owner',
        objectIdSource: 'params',
        objectIdParam: 'id',
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Get who has access to a folder',
        description: 'Uses Keto expand API. Requires owner permission.'
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FoldersController.prototype, "getAccessList", null);
__decorate([
    (0, common_1.Get)(':id/check/:relation'),
    (0, permission_decorator_1.SkipPermissionCheck)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Check if user has specific permission on folder',
        description: 'Useful for UI to show/hide actions'
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('relation')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], FoldersController.prototype, "checkAccess", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permission_decorator_1.RequirePermission)({
        namespace: 'Folder',
        relation: 'delete',
        objectIdSource: 'params',
        objectIdParam: 'id',
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a folder' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FoldersController.prototype, "remove", null);
exports.FoldersController = FoldersController = __decorate([
    (0, swagger_1.ApiTags)('Folders'),
    (0, common_1.Controller)('folders'),
    (0, common_1.UseGuards)(keto_guard_1.KetoGuard),
    __metadata("design:paramtypes", [folders_service_1.FoldersService])
], FoldersController);
//# sourceMappingURL=folders.controller.js.map
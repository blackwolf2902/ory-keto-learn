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
exports.GroupsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const groups_service_1 = require("./groups.service");
const create_group_dto_1 = require("./dto/create-group.dto");
const add_member_dto_1 = require("./dto/add-member.dto");
const permission_decorator_1 = require("../common/decorators/permission.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let GroupsController = class GroupsController {
    groupsService;
    constructor(groupsService) {
        this.groupsService = groupsService;
    }
    create(createGroupDto, user) {
        return this.groupsService.create(createGroupDto, user.id);
    }
    findAll(user) {
        return this.groupsService.findAllByCreator(user.id);
    }
    findOne(id) {
        return this.groupsService.findOne(id);
    }
    addMember(id, addMemberDto) {
        return this.groupsService.addMember(id, addMemberDto);
    }
    removeMember(groupId, userId) {
        return this.groupsService.removeMember(groupId, userId);
    }
    getMembersFromKeto(id) {
        return this.groupsService.getMembersFromKeto(id);
    }
};
exports.GroupsController = GroupsController;
__decorate([
    (0, common_1.Post)(),
    (0, permission_decorator_1.SkipPermissionCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new group' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_group_dto_1.CreateGroupDto, Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permission_decorator_1.SkipPermissionCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all groups (filtered by current user)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permission_decorator_1.SkipPermissionCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get a group by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/members'),
    (0, permission_decorator_1.SkipPermissionCheck)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Add a member to a group',
        description: 'Creates a Group:{id}#member@User:{userId} relation in Keto'
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_member_dto_1.AddMemberDto]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "addMember", null);
__decorate([
    (0, common_1.Delete)(':groupId/members/:userId'),
    (0, permission_decorator_1.SkipPermissionCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a member from a group' }),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Get)(':id/members/keto'),
    (0, permission_decorator_1.SkipPermissionCheck)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get group members from Keto (expand API)',
        description: 'Uses Keto expand API to list all subjects with member relation'
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "getMembersFromKeto", null);
exports.GroupsController = GroupsController = __decorate([
    (0, swagger_1.ApiTags)('Groups'),
    (0, common_1.Controller)('groups'),
    __metadata("design:paramtypes", [groups_service_1.GroupsService])
], GroupsController);
//# sourceMappingURL=groups.controller.js.map
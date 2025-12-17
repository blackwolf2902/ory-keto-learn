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
var KetoGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KetoGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const keto_service_1 = require("../../keto/keto.service");
const permission_decorator_1 = require("../decorators/permission.decorator");
let KetoGuard = KetoGuard_1 = class KetoGuard {
    ketoService;
    reflector;
    logger = new common_1.Logger(KetoGuard_1.name);
    constructor(ketoService, reflector) {
        this.ketoService = ketoService;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const skipCheck = this.reflector.getAllAndOverride(permission_decorator_1.SKIP_PERMISSION_CHECK_KEY, [context.getHandler(), context.getClass()]);
        if (skipCheck) {
            this.logger.debug('Permission check skipped due to @SkipPermissionCheck decorator');
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const userId = this.extractUserId(request);
        if (!userId) {
            this.logger.warn('No user ID found in request');
            throw new common_1.ForbiddenException('Authentication required');
        }
        const singleRequirement = this.reflector.get(permission_decorator_1.PERMISSION_METADATA_KEY, context.getHandler());
        if (singleRequirement) {
            const objectId = this.extractObjectId(request, singleRequirement);
            return this.checkPermission(singleRequirement, objectId, userId);
        }
        const anyRequirements = this.reflector.get(permission_decorator_1.PERMISSION_ANY_METADATA_KEY, context.getHandler());
        if (anyRequirements && anyRequirements.length > 0) {
            return this.checkAnyPermission(anyRequirements, request, userId);
        }
        const allRequirements = this.reflector.get(permission_decorator_1.PERMISSION_ALL_METADATA_KEY, context.getHandler());
        if (allRequirements && allRequirements.length > 0) {
            return this.checkAllPermissions(allRequirements, request, userId);
        }
        this.logger.debug('No permission requirements found, allowing request');
        return true;
    }
    extractUserId(request) {
        const headerUserId = request.headers['x-user-id'];
        if (headerUserId) {
            return Array.isArray(headerUserId) ? headerUserId[0] : headerUserId;
        }
        const user = request.user;
        if (user?.id) {
            return user.id;
        }
        return null;
    }
    extractObjectId(request, requirement) {
        const source = requirement.objectIdSource || 'params';
        const param = requirement.objectIdParam || 'id';
        let objectId;
        switch (source) {
            case 'params':
                objectId = request.params[param];
                break;
            case 'body':
                objectId = request.body?.[param];
                break;
            default:
                objectId = request.params[param];
        }
        if (!objectId) {
            throw new common_1.ForbiddenException(`Missing object ID for permission check`);
        }
        return objectId;
    }
    async checkPermission(requirement, objectId, userId) {
        this.logger.debug(`Checking permission: ${requirement.namespace}:${objectId}#${requirement.relation}@User:${userId}`);
        const allowed = await this.ketoService.checkPermission({
            namespace: requirement.namespace,
            object: objectId,
            relation: requirement.relation,
            subjectId: `User:${userId}`,
        });
        if (!allowed) {
            throw new common_1.ForbiddenException(`Insufficient permissions: requires ${requirement.relation} on ${requirement.namespace}:${objectId}`);
        }
        return true;
    }
    async checkAnyPermission(requirements, request, userId) {
        for (const requirement of requirements) {
            try {
                const objectId = this.extractObjectId(request, requirement);
                const allowed = await this.ketoService.checkPermission({
                    namespace: requirement.namespace,
                    object: objectId,
                    relation: requirement.relation,
                    subjectId: `User:${userId}`,
                });
                if (allowed) {
                    return true;
                }
            }
            catch {
            }
        }
        throw new common_1.ForbiddenException('Insufficient permissions');
    }
    async checkAllPermissions(requirements, request, userId) {
        for (const requirement of requirements) {
            const objectId = this.extractObjectId(request, requirement);
            const allowed = await this.ketoService.checkPermission({
                namespace: requirement.namespace,
                object: objectId,
                relation: requirement.relation,
                subjectId: `User:${userId}`,
            });
            if (!allowed) {
                throw new common_1.ForbiddenException(`Insufficient permissions: requires ${requirement.relation} on ${requirement.namespace}:${objectId}`);
            }
        }
        return true;
    }
};
exports.KetoGuard = KetoGuard;
exports.KetoGuard = KetoGuard = KetoGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [keto_service_1.KetoService,
        core_1.Reflector])
], KetoGuard);
//# sourceMappingURL=keto.guard.js.map
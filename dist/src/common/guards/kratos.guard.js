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
var KratosGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KratosGuard = void 0;
const common_1 = require("@nestjs/common");
const kratos_service_1 = require("../../kratos/kratos.service");
const users_service_1 = require("../../users/users.service");
let KratosGuard = KratosGuard_1 = class KratosGuard {
    kratosService;
    usersService;
    logger = new common_1.Logger(KratosGuard_1.name);
    constructor(kratosService, usersService) {
        this.kratosService = kratosService;
        this.usersService = usersService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const cookie = request.headers.cookie;
        const authHeader = request.headers.authorization;
        if (!cookie && !authHeader) {
            this.logger.warn('No session cookie or auth header found');
            throw new common_1.UnauthorizedException('Authentication required');
        }
        const session = await this.kratosService.validateSession(cookie, authHeader);
        if (!session || !session.active) {
            this.logger.warn('Invalid or inactive Kratos session');
            throw new common_1.UnauthorizedException('Invalid session');
        }
        if (!session.identity) {
            this.logger.warn('Kratos session has no identity');
            throw new common_1.UnauthorizedException('Invalid identity');
        }
        request.user = session.identity;
        try {
            await this.usersService.syncUser(session.identity);
        }
        catch (error) {
            this.logger.error(`Failed to sync user ${session.identity.id}`, error.message);
        }
        this.logger.debug(`Authenticated user: ${session.identity.id}`);
        return true;
    }
};
exports.KratosGuard = KratosGuard;
exports.KratosGuard = KratosGuard = KratosGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [kratos_service_1.KratosService,
        users_service_1.UsersService])
], KratosGuard);
//# sourceMappingURL=kratos.guard.js.map
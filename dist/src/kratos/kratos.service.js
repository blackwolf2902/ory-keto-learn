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
var KratosService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KratosService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@ory/client");
let KratosService = KratosService_1 = class KratosService {
    logger = new common_1.Logger(KratosService_1.name);
    frontend;
    admin;
    constructor() {
        const publicConfig = new client_1.Configuration({
            basePath: process.env.KRATOS_PUBLIC_URL || 'http://localhost:4433',
            baseOptions: {
                withCredentials: true,
            },
        });
        const adminConfig = new client_1.Configuration({
            basePath: process.env.KRATOS_ADMIN_URL || 'http://localhost:4434',
        });
        this.frontend = new client_1.FrontendApi(publicConfig);
        this.admin = new client_1.IdentityApi(adminConfig);
    }
    async validateSession(cookie, authorization) {
        try {
            const { data: session } = await this.frontend.toSession({
                cookie,
                xSessionToken: authorization?.replace('Bearer ', ''),
            });
            return session;
        }
        catch (error) {
            this.logger.debug('Session validation failed', error.response?.data || error.message);
            return null;
        }
    }
    async getIdentity(id) {
        try {
            const { data: identity } = await this.admin.getIdentity({ id });
            return identity;
        }
        catch (error) {
            this.logger.error(`Failed to fetch identity ${id}`, error.response?.data || error.message);
            return null;
        }
    }
};
exports.KratosService = KratosService;
exports.KratosService = KratosService = KratosService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], KratosService);
//# sourceMappingURL=kratos.service.js.map
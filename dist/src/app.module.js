"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const kratos_guard_1 = require("./common/guards/kratos.guard");
const drizzle_service_1 = require("./drizzle/drizzle.service");
const keto_module_1 = require("./keto/keto.module");
const users_module_1 = require("./users/users.module");
const groups_module_1 = require("./groups/groups.module");
const documents_module_1 = require("./documents/documents.module");
const folders_module_1 = require("./folders/folders.module");
const events_module_1 = require("./events/events.module");
const kratos_module_1 = require("./kratos/kratos.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            events_module_1.EventsModule,
            keto_module_1.KetoModule,
            users_module_1.UsersModule,
            groups_module_1.GroupsModule,
            documents_module_1.DocumentsModule,
            folders_module_1.FoldersModule,
            kratos_module_1.KratosModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            drizzle_service_1.DrizzleService,
            {
                provide: core_1.APP_GUARD,
                useClass: kratos_guard_1.KratosGuard,
            },
        ],
        exports: [drizzle_service_1.DrizzleService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
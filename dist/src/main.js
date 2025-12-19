"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, cookie_parser_1.default)());
    app.enableCors({
        origin: ['http://localhost:5173', 'http://localhost:3001'],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Ory Keto Learning Project')
        .setDescription(`
## 🎓 Learning Ory Keto with NestJS

This API demonstrates **Relationship-Based Access Control (ReBAC)** using Ory Keto.

### Key Concepts

1. **Relation Tuples**: \`namespace:object#relation@subject\`
2. **Permission Checks**: "Does user X have permission Y on resource Z?"
3. **Subject Sets**: Groups/teams for scalable permissions
4. **Permission Inheritance**: Folder → Document access cascading

### Authentication

All endpoints are now protected by **Ory Kratos**. You can authenticate by:
1. Providing a valid session cookie (handled automatically by the browser/CORS)
2. Providing a session token in the \`Authorization: Bearer <token>\` header

### Testing Kratos Integration

1. Register/Login via Kratos Public API (\`http://localhost:4433\`)
2. Use the session cookie or token in your requests
3. The system will automatically sync your Kratos identity to the local DB
4. Keto permission checks will use your Kratos Identity ID
    `)
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('Users', 'User management')
        .addTag('Groups', 'Team/group management (Subject Sets)')
        .addTag('Documents', 'Protected documents with permission checks')
        .addTag('Folders', 'Hierarchical folders with permission inheritance')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                 🔐 Ory Keto Learning Project                     ║
╟──────────────────────────────────────────────────────────────────╢
║  Application: http://localhost:${port}                            ║
║  Swagger UI: http://localhost:${port}/api                        ║
╟──────────────────────────────────────────────────────────────────╢
║  Keto Read:    ${process.env.KETO_READ_URL || 'http://localhost:4466'}                        ║
║  Keto Write:   ${process.env.KETO_WRITE_URL || 'http://localhost:4467'}                        ║
╟──────────────────────────────────────────────────────────────────╢
║  Kratos Public: http://localhost:4433                             ║
║  Kratos Admin:  http://localhost:4434                             ║
╚══════════════════════════════════════════════════════════════════╝
  `);
}
bootstrap();
//# sourceMappingURL=main.js.map
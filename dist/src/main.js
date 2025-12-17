"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
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

### Testing Authorization

All endpoints require the \`x-user-id\` header to simulate the authenticated user.

\`\`\`bash
# Example: Create a document
curl -X POST http://localhost:3000/documents \\
  -H "x-user-id: user-uuid" \\
  -H "Content-Type: application/json" \\
  -d '{"title": "My Document"}'
\`\`\`

### Permission Flow

1. Create a user → Use their ID in x-user-id
2. Create a document → Creator becomes owner
3. Try accessing as another user → Denied
4. Share with that user → Allowed

    `)
        .setVersion('1.0')
        .addApiKey({ type: 'apiKey', name: 'x-user-id', in: 'header' }, 'x-user-id')
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
║  Application:  http://localhost:${port}                            ║
║  Swagger UI:   http://localhost:${port}/api                        ║
╟──────────────────────────────────────────────────────────────────╢
║  Keto Read:    ${process.env.KETO_READ_URL || 'http://localhost:4466'}                        ║
║  Keto Write:   ${process.env.KETO_WRITE_URL || 'http://localhost:4467'}                        ║
╚══════════════════════════════════════════════════════════════════╝
  `);
}
bootstrap();
//# sourceMappingURL=main.js.map
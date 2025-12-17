import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3001'],
    credentials: true,
  });

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger API documentation
  const config = new DocumentBuilder()
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

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

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

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

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

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

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

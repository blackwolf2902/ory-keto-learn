import { Module, Global } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { KetoModule } from './keto/keto.module';
import { UsersModule } from './users/users.module';
import { GroupsModule } from './groups/groups.module';
import { DocumentsModule } from './documents/documents.module';
import { FoldersModule } from './folders/folders.module';
import { EventsModule } from './events/events.module';

/**
 * ============================================
 * APP MODULE - Application Root
 * ============================================
 * 
 * This is the root module that ties everything together:
 * 
 * - KetoModule: Provides KetoService globally
 * - PrismaService: Database access (global)
 * - UsersModule: User management
 * - GroupsModule: Team-based access (Subject Sets)
 * - DocumentsModule: Protected documents
 * - FoldersModule: Hierarchical permissions
 * 
 * LEARNING: Module Architecture
 * NestJS modules provide good separation of concerns.
 * Each module handles its own domain while sharing
 * common services like Keto and Prisma.
 */
@Global()
@Module({
  imports: [
    EventsModule,
    KetoModule,
    UsersModule,
    GroupsModule,
    DocumentsModule,
    FoldersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
  ],
  exports: [PrismaService],
})
export class AppModule { }

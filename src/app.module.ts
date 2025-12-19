import { Module, Global } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KratosGuard } from './common/guards/kratos.guard';
import { DrizzleService } from './drizzle/drizzle.service';
import { KetoModule } from './keto/keto.module';
import { UsersModule } from './users/users.module';
import { GroupsModule } from './groups/groups.module';
import { DocumentsModule } from './documents/documents.module';
import { FoldersModule } from './folders/folders.module';
import { EventsModule } from './events/events.module';
import { KratosModule } from './kratos/kratos.module';

/**
 * ============================================
 * APP MODULE - Application Root
 * ============================================
 * 
 * This is the root module that ties everything together:
 * 
 * - KetoModule: Provides KetoService globally
 * - DrizzleService: Database access (global)
 * - UsersModule: User management
 * - GroupsModule: Team-based access (Subject Sets)
 * - DocumentsModule: Protected documents
 * - FoldersModule: Hierarchical permissions
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
    KratosModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DrizzleService,
    {
      provide: APP_GUARD,
      useClass: KratosGuard,
    },
  ],
  exports: [DrizzleService],
})
export class AppModule { }

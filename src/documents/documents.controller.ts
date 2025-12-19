import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { ShareDocumentDto } from './dto/share-document.dto';
import { KetoGuard } from '../common/guards/keto.guard';
import { RequirePermission, SkipPermissionCheck } from '../common/decorators/permission.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { KratosIdentity } from '../common/decorators/current-user.decorator';

/**
 * ============================================
 * DOCUMENTS CONTROLLER - Protected Resource API
 * ============================================
 * 
 * USER SESSION ISOLATION:
 * - All document operations are scoped to the authenticated user
 * - @CurrentUser() decorator extracts user from Kratos session
 * - findAll() returns only documents owned by the current user
 */
@ApiTags('Documents')
@Controller('documents')
@UseGuards(KetoGuard)
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    /**
     * Create a new document
     * The current authenticated user becomes the owner
     */
    @Post()
    @SkipPermissionCheck()
    @ApiOperation({
        summary: 'Create a new document',
        description: 'Creates document and assigns creator as owner in Keto'
    })
    create(
        @Body() createDocumentDto: CreateDocumentDto,
        @CurrentUser() user: KratosIdentity,
    ) {
        return this.documentsService.create(createDocumentDto, user.id);
    }

    /**
     * Get all documents for the current user
     * SESSION ISOLATION: Returns only documents owned by the authenticated user
     */
    @Get()
    @SkipPermissionCheck()
    @ApiOperation({ summary: 'Get all documents (filtered by current user)' })
    findAll(@CurrentUser() user: KratosIdentity) {
        return this.documentsService.findAllByOwner(user.id);
    }

    /**
     * Get a specific document
     * PERMISSION CHECK: Document#view
     */
    @Get(':id')
    @RequirePermission({
        namespace: 'Document',
        relation: 'view',
        objectIdSource: 'params',
        objectIdParam: 'id',
    })
    @ApiOperation({
        summary: 'Get a document by ID',
        description: 'Requires view permission (owner/editor/viewer/folder access)'
    })
    findOne(@Param('id') id: string) {
        return this.documentsService.findOne(id);
    }

    /**
     * Update a document
     * PERMISSION CHECK: Document#edit
     */
    @Put(':id')
    @RequirePermission({
        namespace: 'Document',
        relation: 'edit',
        objectIdSource: 'params',
        objectIdParam: 'id',
    })
    @ApiOperation({
        summary: 'Update a document',
        description: 'Requires edit permission (owner/editor)'
    })
    update(
        @Param('id') id: string,
        @Body() updateDocumentDto: UpdateDocumentDto,
        @CurrentUser() user: KratosIdentity,
    ) {
        return this.documentsService.update(id, updateDocumentDto, user.id);
    }

    /**
     * Delete a document
     * PERMISSION CHECK: Document#delete (owner only)
     */
    @Delete(':id')
    @RequirePermission({
        namespace: 'Document',
        relation: 'delete',
        objectIdSource: 'params',
        objectIdParam: 'id',
    })
    @ApiOperation({
        summary: 'Delete a document',
        description: 'Requires delete permission (owner only)'
    })
    remove(@Param('id') id: string, @CurrentUser() user: KratosIdentity) {
        return this.documentsService.remove(id, user.id);
    }

    /**
     * Share a document
     * Permission check is done in service (must be owner to share)
     */
    @Post(':id/share')
    @SkipPermissionCheck()
    @ApiOperation({
        summary: 'Share a document with a user or group',
        description: 'Creates viewer/editor relation. Only owners can share.'
    })
    @ApiBody({ type: ShareDocumentDto })
    share(
        @Param('id') id: string,
        @Body() shareDto: ShareDocumentDto,
        @CurrentUser() user: KratosIdentity,
    ) {
        return this.documentsService.share(id, shareDto, user.id);
    }

    /**
     * Revoke access
     */
    @Delete(':id/share')
    @SkipPermissionCheck()
    @ApiOperation({ summary: 'Revoke access from a user or group' })
    unshare(
        @Param('id') id: string,
        @Body() shareDto: ShareDocumentDto,
        @CurrentUser() user: KratosIdentity,
    ) {
        return this.documentsService.unshare(id, shareDto, user.id);
    }

    /**
     * Get access list for a document
     */
    @Get(':id/access')
    @RequirePermission({
        namespace: 'Document',
        relation: 'owner',
        objectIdSource: 'params',
        objectIdParam: 'id',
    })
    @ApiOperation({
        summary: 'Get who has access to a document',
        description: 'Uses Keto expand API. Requires owner permission.'
    })
    getAccessList(@Param('id') id: string) {
        return this.documentsService.getAccessList(id);
    }

    /**
     * Check if a specific user has a permission on a document
     * PLAYGROUND: Allows checking any user's permission, not just the logged-in user
     */
    @Get(':id/check/:relation')
    @SkipPermissionCheck()
    @ApiOperation({
        summary: 'Check if a user has specific permission',
        description: 'For Permission Playground - check any user\'s access'
    })
    checkAccess(
        @Param('id') id: string,
        @Param('relation') relation: string,
        @Query('userId') userId?: string,
        @CurrentUser() currentUser?: KratosIdentity,
    ) {
        // Use provided userId for playground, or fall back to current user
        const userIdToCheck = userId || currentUser?.id;
        if (!userIdToCheck) {
            return { allowed: false, check: 'No user specified', error: 'Missing userId' };
        }
        return this.documentsService.checkAccess(id, userIdToCheck, relation);
    }
}

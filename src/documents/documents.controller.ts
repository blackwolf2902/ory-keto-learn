import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Headers,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { ShareDocumentDto } from './dto/share-document.dto';
import { KetoGuard } from '../common/guards/keto.guard';
import { RequirePermission, SkipPermissionCheck } from '../common/decorators/permission.decorator';

/**
 * ============================================
 * DOCUMENTS CONTROLLER - Protected Resource API
 * ============================================
 * 
 * This controller demonstrates DECLARATIVE AUTHORIZATION
 * using NestJS guards and custom decorators.
 * 
 * KEY LEARNING POINTS:
 * 
 * 1. @UseGuards(KetoGuard) - Enables permission checking
 * 2. @RequirePermission() - Specifies required permission
 * 3. @SkipPermissionCheck() - Bypasses for public endpoints
 * 
 * The guard automatically:
 * - Extracts user ID from x-user-id header
 * - Extracts object ID from route params
 * - Calls Keto to check permission
 * - Throws ForbiddenException if denied
 */
@ApiTags('Documents')
@Controller('documents')
@UseGuards(KetoGuard)
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    /**
     * Create a new document
     * Anyone authenticated can create documents (they become owner)
     */
    @Post()
    @SkipPermissionCheck()
    @ApiOperation({
        summary: 'Create a new document',
        description: 'Creates document and assigns creator as owner in Keto'
    })
    create(
        @Body() createDocumentDto: CreateDocumentDto,
        @Headers('x-user-id') userId: string,
    ) {
        return this.documentsService.create(createDocumentDto, userId);
    }

    /**
     * Get all documents
     * No permission check - returns all documents
     * (In production, you'd filter by user's accessible documents)
     */
    @Get()
    @SkipPermissionCheck()
    @ApiOperation({ summary: 'Get all documents' })
    findAll() {
        return this.documentsService.findAll();
    }

    /**
     * Get a specific document
     * 
     * PERMISSION CHECK: Document#view
     * User must have view permission on the document.
     * This includes: owner, editor, viewer, or folder access.
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
     * 
     * PERMISSION CHECK: Document#edit
     * Only owners and editors can update.
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
    update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
        return this.documentsService.update(id, updateDocumentDto);
    }

    /**
     * Delete a document
     * 
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
    remove(@Param('id') id: string) {
        return this.documentsService.remove(id);
    }

    /**
     * Share a document
     * 
     * Note: Permission check is done in service (must be owner to share)
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
        @Headers('x-user-id') userId: string,
    ) {
        return this.documentsService.share(id, shareDto, userId);
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
        @Headers('x-user-id') userId: string,
    ) {
        return this.documentsService.unshare(id, shareDto, userId);
    }

    /**
     * Get access list for a document
     * 
     * LEARNING: Uses Keto's expand API to list all subjects
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
     * Check if current user has specific permission
     * 
     * LEARNING: Direct permission check endpoint for testing
     */
    @Get(':id/check/:relation')
    @SkipPermissionCheck()
    @ApiOperation({
        summary: 'Check if user has specific permission',
        description: 'Useful for UI to show/hide actions'
    })
    checkAccess(
        @Param('id') id: string,
        @Param('relation') relation: string,
        @Headers('x-user-id') userId: string,
    ) {
        return this.documentsService.checkAccess(id, userId, relation);
    }
}

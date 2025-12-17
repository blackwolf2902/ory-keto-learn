import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Headers,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { ShareFolderDto } from './dto/share-folder.dto';
import { KetoGuard } from '../common/guards/keto.guard';
import { RequirePermission, SkipPermissionCheck } from '../common/decorators/permission.decorator';

/**
 * FoldersController - Hierarchical Resource Organization
 * 
 * LEARNING: Folder Permissions Cascade
 * 
 * When you grant access to a folder:
 * - User gets access to all documents in the folder
 * - User gets access to all subfolders
 * - User gets access to all documents in subfolders
 * 
 * This is AUTOMATIC through parent relations!
 */
@ApiTags('Folders')
@Controller('folders')
@UseGuards(KetoGuard)
export class FoldersController {
    constructor(private readonly foldersService: FoldersService) { }

    @Post()
    @SkipPermissionCheck()
    @ApiOperation({
        summary: 'Create a new folder',
        description: 'Creates folder and assigns owner. If parent specified, creates inheritance relation.'
    })
    create(
        @Body() createFolderDto: CreateFolderDto,
        @Headers('x-user-id') userId: string,
    ) {
        return this.foldersService.create(createFolderDto, userId);
    }

    @Get()
    @SkipPermissionCheck()
    @ApiOperation({ summary: 'Get all folders' })
    findAll() {
        return this.foldersService.findAll();
    }

    @Get(':id')
    @RequirePermission({
        namespace: 'Folder',
        relation: 'view',
        objectIdSource: 'params',
        objectIdParam: 'id',
    })
    @ApiOperation({ summary: 'Get folder by ID' })
    findOne(@Param('id') id: string) {
        return this.foldersService.findOne(id);
    }

    @Post(':id/share')
    @SkipPermissionCheck()
    @ApiOperation({
        summary: 'Share folder with user or group',
        description: 'Grants access to folder AND all nested content'
    })
    @ApiBody({ type: ShareFolderDto })
    share(
        @Param('id') id: string,
        @Body() shareDto: ShareFolderDto,
        @Headers('x-user-id') userId: string,
    ) {
        return this.foldersService.share(id, shareDto, userId);
    }

    /**
     * Revoke access
     */
    @Delete(':id/share')
    @SkipPermissionCheck()
    @ApiOperation({ summary: 'Revoke access from a user or group' })
    unshare(
        @Param('id') id: string,
        @Body() shareDto: ShareFolderDto,
        @Headers('x-user-id') userId: string,
    ) {
        return this.foldersService.unshare(id, shareDto, userId);
    }

    /**
     * Get access list for a folder
     * 
     * LEARNING: Uses Keto's expand API to list all subjects
     */
    @Get(':id/access')
    @RequirePermission({
        namespace: 'Folder',
        relation: 'owner',
        objectIdSource: 'params',
        objectIdParam: 'id',
    })
    @ApiOperation({
        summary: 'Get who has access to a folder',
        description: 'Uses Keto expand API. Requires owner permission.'
    })
    getAccessList(@Param('id') id: string) {
        return this.foldersService.getAccessList(id);
    }

    /**
     * Check if current user has specific permission
     * 
     * LEARNING: Direct permission check endpoint for testing
     */
    @Get(':id/check/:relation')
    @SkipPermissionCheck()
    @ApiOperation({
        summary: 'Check if user has specific permission on folder',
        description: 'Useful for UI to show/hide actions'
    })
    checkAccess(
        @Param('id') id: string,
        @Param('relation') relation: string,
        @Headers('x-user-id') userId: string,
    ) {
        return this.foldersService.checkAccess(id, userId, relation);
    }

    @Delete(':id')
    @RequirePermission({
        namespace: 'Folder',
        relation: 'delete',
        objectIdSource: 'params',
        objectIdParam: 'id',
    })
    @ApiOperation({ summary: 'Delete a folder' })
    remove(@Param('id') id: string) {
        return this.foldersService.remove(id);
    }
}

import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { ShareFolderDto } from './dto/share-folder.dto';
import { KetoGuard } from '../common/guards/keto.guard';
import { RequirePermission, SkipPermissionCheck } from '../common/decorators/permission.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { KratosIdentity } from '../common/decorators/current-user.decorator';

/**
 * FoldersController - Hierarchical Resource Organization
 * 
 * USER SESSION ISOLATION:
 * - All folder operations are scoped to the authenticated user
 * - @CurrentUser() decorator extracts user from Kratos session
 * - findAll() returns only folders owned by the current user
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
        @CurrentUser() user: KratosIdentity,
    ) {
        return this.foldersService.create(createFolderDto, user.id);
    }

    /**
     * Get all folders for the current user
     * SESSION ISOLATION: Returns only folders owned by the authenticated user
     */
    @Get()
    @SkipPermissionCheck()
    @ApiOperation({ summary: 'Get all folders (filtered by current user)' })
    findAll(@CurrentUser() user: KratosIdentity) {
        return this.foldersService.findAllByOwner(user.id);
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
        @CurrentUser() user: KratosIdentity,
    ) {
        return this.foldersService.share(id, shareDto, user.id);
    }

    @Delete(':id/share')
    @SkipPermissionCheck()
    @ApiOperation({ summary: 'Revoke access from a user or group' })
    unshare(
        @Param('id') id: string,
        @Body() shareDto: ShareFolderDto,
        @CurrentUser() user: KratosIdentity,
    ) {
        return this.foldersService.unshare(id, shareDto, user.id);
    }

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

    @Get(':id/check/:relation')
    @SkipPermissionCheck()
    @ApiOperation({
        summary: 'Check if user has specific permission on folder',
        description: 'Useful for UI to show/hide actions'
    })
    checkAccess(
        @Param('id') id: string,
        @Param('relation') relation: string,
        @CurrentUser() user: KratosIdentity,
    ) {
        return this.foldersService.checkAccess(id, user.id, relation);
    }

    @Delete(':id')
    @RequirePermission({
        namespace: 'Folder',
        relation: 'delete',
        objectIdSource: 'params',
        objectIdParam: 'id',
    })
    @ApiOperation({ summary: 'Delete a folder' })
    remove(@Param('id') id: string, @CurrentUser() user: KratosIdentity) {
        return this.foldersService.remove(id, user.id);
    }
}

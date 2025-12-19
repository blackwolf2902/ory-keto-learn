import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { SkipPermissionCheck } from '../common/decorators/permission.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { KratosIdentity } from '../common/decorators/current-user.decorator';

/**
 * GroupsController - Team Management
 * 
 * USER SESSION ISOLATION:
 * - Groups are scoped to their creator
 * - Each user sees only groups they created
 */
@ApiTags('Groups')
@Controller('groups')
export class GroupsController {
    constructor(private readonly groupsService: GroupsService) { }

    @Post()
    @SkipPermissionCheck()
    @ApiOperation({ summary: 'Create a new group' })
    create(
        @Body() createGroupDto: CreateGroupDto,
        @CurrentUser() user: KratosIdentity,
    ) {
        return this.groupsService.create(createGroupDto, user.id);
    }

    /**
     * Get all groups for the current user
     * SESSION ISOLATION: Returns only groups created by the authenticated user
     */
    @Get()
    @SkipPermissionCheck()
    @ApiOperation({ summary: 'Get all groups (filtered by current user)' })
    findAll(@CurrentUser() user: KratosIdentity) {
        return this.groupsService.findAllByCreator(user.id);
    }

    @Get(':id')
    @SkipPermissionCheck()
    @ApiOperation({ summary: 'Get a group by ID' })
    findOne(@Param('id') id: string) {
        return this.groupsService.findOne(id);
    }

    @Post(':id/members')
    @SkipPermissionCheck()
    @ApiOperation({
        summary: 'Add a member to a group',
        description: 'Creates a Group:{id}#member@User:{userId} relation in Keto'
    })
    addMember(@Param('id') id: string, @Body() addMemberDto: AddMemberDto) {
        return this.groupsService.addMember(id, addMemberDto);
    }

    @Delete(':groupId/members/:userId')
    @SkipPermissionCheck()
    @ApiOperation({ summary: 'Remove a member from a group' })
    removeMember(
        @Param('groupId') groupId: string,
        @Param('userId') userId: string,
    ) {
        return this.groupsService.removeMember(groupId, userId);
    }

    @Get(':id/members/keto')
    @SkipPermissionCheck()
    @ApiOperation({
        summary: 'Get group members from Keto (expand API)',
        description: 'Uses Keto expand API to list all subjects with member relation'
    })
    getMembersFromKeto(@Param('id') id: string) {
        return this.groupsService.getMembersFromKeto(id);
    }
}

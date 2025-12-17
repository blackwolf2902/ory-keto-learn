import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { SkipPermissionCheck } from '../common/decorators/permission.decorator';

/**
 * GroupsController - Team Management
 * 
 * LEARNING NOTE: Groups as Subject Sets
 * 
 * Groups in Keto are a powerful abstraction for team-based access.
 * Instead of managing individual user permissions, you:
 * 
 * 1. Create groups representing teams/roles
 * 2. Add users as members
 * 3. Grant permissions to group members
 * 
 * The "magic" is in SUBJECT SETS:
 *   @Group:engineering#member
 * 
 * This means "anyone who is a member of the engineering group"
 */
@ApiTags('Groups')
@Controller('groups')
export class GroupsController {
    constructor(private readonly groupsService: GroupsService) { }

    @Post()
    @SkipPermissionCheck()
    @ApiOperation({ summary: 'Create a new group' })
    create(@Body() createGroupDto: CreateGroupDto) {
        return this.groupsService.create(createGroupDto);
    }

    @Get()
    @SkipPermissionCheck()
    @ApiOperation({ summary: 'Get all groups' })
    findAll() {
        return this.groupsService.findAll();
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
    @ApiHeader({ name: 'x-user-id', description: 'Current user ID', required: true })
    addMember(@Param('id') id: string, @Body() addMemberDto: AddMemberDto) {
        return this.groupsService.addMember(id, addMemberDto);
    }

    @Delete(':groupId/members/:userId')
    @SkipPermissionCheck()
    @ApiOperation({ summary: 'Remove a member from a group' })
    @ApiHeader({ name: 'x-user-id', description: 'Current user ID', required: true })
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

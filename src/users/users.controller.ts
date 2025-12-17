import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SkipPermissionCheck } from '../common/decorators/permission.decorator';

/**
 * UsersController - User Management
 * 
 * LEARNING NOTE: Users in Keto
 * Users themselves don't have permissions ON them (usually).
 * Instead, users ARE the subjects that have permissions on other objects.
 * 
 * Example:
 * - Document:readme.md#viewer@User:alice
 *   → Alice (user) can view readme.md (document)
 */
@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @SkipPermissionCheck()
    @ApiOperation({ summary: 'Create a new user' })
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @SkipPermissionCheck()
    @ApiOperation({ summary: 'Get all users' })
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @SkipPermissionCheck()
    @ApiOperation({ summary: 'Get a user by ID' })
    @ApiHeader({ name: 'x-user-id', description: 'Current user ID', required: true })
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }
}

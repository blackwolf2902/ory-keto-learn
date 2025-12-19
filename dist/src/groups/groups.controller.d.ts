import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddMemberDto } from './dto/add-member.dto';
import type { KratosIdentity } from '../common/decorators/current-user.decorator';
export declare class GroupsController {
    private readonly groupsService;
    constructor(groupsService: GroupsService);
    create(createGroupDto: CreateGroupDto, user: KratosIdentity): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        creatorId: string | null;
    }>;
    findAll(user: KratosIdentity): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        creatorId: string | null;
        members: {
            id: string;
            createdAt: Date;
            userId: string;
            groupId: string;
            role: string;
            user: {
                id: string;
                email: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
            };
        }[];
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        creatorId: string | null;
        members: {
            id: string;
            createdAt: Date;
            userId: string;
            groupId: string;
            role: string;
            user: {
                id: string;
                email: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
            };
        }[];
    } | undefined>;
    addMember(id: string, addMemberDto: AddMemberDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        };
        group: {
            id: string;
            name: string;
            description: string | null;
            creatorId: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        id: string;
        createdAt: Date;
        userId: string;
        groupId: string;
        role: string;
    }>;
    removeMember(groupId: string, userId: string): Promise<{
        success: boolean;
    }>;
    getMembersFromKeto(id: string): Promise<string[]>;
}

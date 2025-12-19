import { DrizzleService } from '../drizzle/drizzle.service';
import { KetoService } from '../keto/keto.service';
import { EventPublisherService } from '../events/event-publisher.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddMemberDto } from './dto/add-member.dto';
export declare class GroupsService {
    private readonly drizzle;
    private readonly ketoService;
    private readonly eventPublisher;
    constructor(drizzle: DrizzleService, ketoService: KetoService, eventPublisher: EventPublisherService);
    create(createGroupDto: CreateGroupDto, userId?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        creatorId: string | null;
    }>;
    addMember(groupId: string, addMemberDto: AddMemberDto): Promise<{
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
    findAll(): Promise<{
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
    findAllByCreator(creatorId: string): Promise<{
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
    getMembersFromKeto(groupId: string): Promise<string[]>;
}

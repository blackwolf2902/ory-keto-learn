import { PrismaService } from '../prisma.service';
import { KetoService } from '../keto/keto.service';
import { EventPublisherService } from '../events/event-publisher.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddMemberDto } from './dto/add-member.dto';
export declare class GroupsService {
    private readonly prisma;
    private readonly ketoService;
    private readonly eventPublisher;
    constructor(prisma: PrismaService, ketoService: KetoService, eventPublisher: EventPublisherService);
    create(createGroupDto: CreateGroupDto, userId?: string): Promise<{
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    addMember(groupId: string, addMemberDto: AddMemberDto): Promise<{
        user: {
            email: string;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
        group: {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        role: string;
        groupId: string;
    }>;
    removeMember(groupId: string, userId: string): Promise<{
        success: boolean;
    }>;
    findAll(): Promise<({
        members: ({
            user: {
                email: string;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            role: string;
            groupId: string;
        })[];
    } & {
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<({
        members: ({
            user: {
                email: string;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            role: string;
            groupId: string;
        })[];
    } & {
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    getMembersFromKeto(groupId: string): Promise<string[]>;
}

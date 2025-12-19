import { DrizzleService } from '../drizzle/drizzle.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private readonly drizzle;
    constructor(drizzle: DrizzleService);
    create(createUserDto: CreateUserDto & {
        id?: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    syncUser(identity: any): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findAll(): Promise<{
        groups: {
            id: string;
            createdAt: Date;
            userId: string;
            groupId: string;
            role: string;
            group: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                creatorId: string | null;
            };
        }[];
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        groupMemberships: {
            id: string;
            createdAt: Date;
            userId: string;
            groupId: string;
            role: string;
            group: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                creatorId: string | null;
            };
        }[];
    }[]>;
    findOne(id: string): Promise<{
        groups: {
            id: string;
            createdAt: Date;
            userId: string;
            groupId: string;
            role: string;
            group: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                creatorId: string | null;
            };
        }[];
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownedDocuments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            ownerId: string;
            title: string;
            content: string | null;
            folderId: string | null;
        }[];
        ownedFolders: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            parentId: string | null;
            ownerId: string;
        }[];
        groupMemberships: {
            id: string;
            createdAt: Date;
            userId: string;
            groupId: string;
            role: string;
            group: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                creatorId: string | null;
            };
        }[];
    } | null>;
}

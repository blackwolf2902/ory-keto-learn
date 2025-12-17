import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        email: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<({
        groups: ({
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
        })[];
    } & {
        email: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<({
        ownedDocuments: {
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            content: string | null;
            folderId: string | null;
            ownerId: string;
        }[];
        ownedFolders: {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            ownerId: string;
            parentId: string | null;
        }[];
        groups: ({
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
        })[];
    } & {
        email: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
}

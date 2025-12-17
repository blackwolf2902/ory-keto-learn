import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { ShareFolderDto } from './dto/share-folder.dto';
export declare class FoldersController {
    private readonly foldersService;
    constructor(foldersService: FoldersService);
    create(createFolderDto: CreateFolderDto, userId: string): Promise<{
        owner: {
            email: string;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
        parent: {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            ownerId: string;
            parentId: string | null;
        } | null;
    } & {
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
        parentId: string | null;
    }>;
    findAll(): Promise<({
        owner: {
            email: string;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
        children: {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            ownerId: string;
            parentId: string | null;
        }[];
        parent: {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            ownerId: string;
            parentId: string | null;
        } | null;
        documents: {
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            content: string | null;
            folderId: string | null;
            ownerId: string;
        }[];
    } & {
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
        parentId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        owner: {
            email: string;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
        children: {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            ownerId: string;
            parentId: string | null;
        }[];
        parent: {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            ownerId: string;
            parentId: string | null;
        } | null;
        documents: {
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            content: string | null;
            folderId: string | null;
            ownerId: string;
        }[];
    } & {
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
        parentId: string | null;
    }>;
    share(id: string, shareDto: ShareFolderDto, userId: string): Promise<{
        success: boolean;
        message: string;
        relation: string;
        note: string;
    }>;
    unshare(id: string, shareDto: ShareFolderDto, userId: string): Promise<{
        success: boolean;
        message: string;
        note: string;
    }>;
    getAccessList(id: string): Promise<{
        owners: string[];
        editors: string[];
        viewers: string[];
    }>;
    checkAccess(id: string, relation: string, userId: string): Promise<{
        allowed: boolean;
        check: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}

import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { ShareFolderDto } from './dto/share-folder.dto';
import type { KratosIdentity } from '../common/decorators/current-user.decorator';
export declare class FoldersController {
    private readonly foldersService;
    constructor(foldersService: FoldersService);
    create(createFolderDto: CreateFolderDto, user: KratosIdentity): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        parentId: string | null;
        ownerId: string;
        parent: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            parentId: string | null;
            ownerId: string;
        } | null;
        owner: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } | undefined>;
    findAll(user: KratosIdentity): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        parentId: string | null;
        ownerId: string;
        documents: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            ownerId: string;
            title: string;
            content: string | null;
            folderId: string | null;
        }[];
        parent: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            parentId: string | null;
            ownerId: string;
        } | null;
        children: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            parentId: string | null;
            ownerId: string;
        }[];
        owner: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        parentId: string | null;
        ownerId: string;
        documents: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            ownerId: string;
            title: string;
            content: string | null;
            folderId: string | null;
        }[];
        parent: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            parentId: string | null;
            ownerId: string;
        } | null;
        children: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            parentId: string | null;
            ownerId: string;
        }[];
        owner: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    share(id: string, shareDto: ShareFolderDto, user: KratosIdentity): Promise<{
        success: boolean;
        message: string;
        relation: string;
        note: string;
    }>;
    unshare(id: string, shareDto: ShareFolderDto, user: KratosIdentity): Promise<{
        success: boolean;
        message: string;
        note: string;
    }>;
    getAccessList(id: string): Promise<{
        owners: string[];
        editors: string[];
        viewers: string[];
    }>;
    checkAccess(id: string, relation: string, user: KratosIdentity): Promise<{
        allowed: boolean;
        check: string;
    }>;
    remove(id: string, user: KratosIdentity): Promise<{
        success: boolean;
    }>;
}

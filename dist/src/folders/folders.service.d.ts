import { DrizzleService } from '../drizzle/drizzle.service';
import { KetoService } from '../keto/keto.service';
import { EventPublisherService } from '../events/event-publisher.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { ShareFolderDto } from './dto/share-folder.dto';
export declare class FoldersService {
    private readonly drizzle;
    private readonly ketoService;
    private readonly eventPublisher;
    constructor(drizzle: DrizzleService, ketoService: KetoService, eventPublisher: EventPublisherService);
    create(createFolderDto: CreateFolderDto, userId: string): Promise<{
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
    share(folderId: string, shareDto: ShareFolderDto, requesterId: string): Promise<{
        success: boolean;
        message: string;
        relation: string;
        note: string;
    }>;
    findAll(): Promise<{
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
    findAllByOwner(ownerId: string): Promise<{
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
    unshare(folderId: string, shareDto: ShareFolderDto, requesterId: string): Promise<{
        success: boolean;
        message: string;
        note: string;
    }>;
    getAccessList(folderId: string): Promise<{
        owners: string[];
        editors: string[];
        viewers: string[];
    }>;
    checkAccess(folderId: string, userId: string, relation: string): Promise<{
        allowed: boolean;
        check: string;
    }>;
    remove(id: string, userId?: string): Promise<{
        success: boolean;
    }>;
}

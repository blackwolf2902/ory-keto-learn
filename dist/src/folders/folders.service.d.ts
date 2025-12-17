import { PrismaService } from '../prisma.service';
import { KetoService } from '../keto/keto.service';
import { EventPublisherService } from '../events/event-publisher.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { ShareFolderDto } from './dto/share-folder.dto';
export declare class FoldersService {
    private readonly prisma;
    private readonly ketoService;
    private readonly eventPublisher;
    constructor(prisma: PrismaService, ketoService: KetoService, eventPublisher: EventPublisherService);
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
    share(folderId: string, shareDto: ShareFolderDto, requesterId: string): Promise<{
        success: boolean;
        message: string;
        relation: string;
        note: string;
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
    remove(id: string): Promise<{
        success: boolean;
    }>;
}

import { DrizzleService } from '../drizzle/drizzle.service';
import { KetoService } from '../keto/keto.service';
import { EventPublisherService } from '../events/event-publisher.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { ShareDocumentDto } from './dto/share-document.dto';
export declare class DocumentsService {
    private readonly drizzle;
    private readonly ketoService;
    private readonly eventPublisher;
    constructor(drizzle: DrizzleService, ketoService: KetoService, eventPublisher: EventPublisherService);
    create(createDocumentDto: CreateDocumentDto, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
        title: string;
        content: string | null;
        folderId: string | null;
        owner: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        };
        folder: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            parentId: string | null;
            ownerId: string;
        } | null;
    } | undefined>;
    share(documentId: string, shareDto: ShareDocumentDto, requesterId: string): Promise<{
        success: boolean;
        message: string;
        relation: string;
    }>;
    unshare(documentId: string, shareDto: ShareDocumentDto, requesterId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getAccessList(documentId: string): Promise<{
        owners: string[];
        editors: string[];
        viewers: string[];
    }>;
    checkAccess(documentId: string, userId: string, relation: string): Promise<{
        allowed: boolean;
        check: string;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
        title: string;
        content: string | null;
        folderId: string | null;
        owner: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        };
        folder: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            parentId: string | null;
            ownerId: string;
        } | null;
    }[]>;
    findAllByOwner(ownerId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
        title: string;
        content: string | null;
        folderId: string | null;
        owner: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        };
        folder: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            parentId: string | null;
            ownerId: string;
        } | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
        title: string;
        content: string | null;
        folderId: string | null;
        owner: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        };
        folder: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            parentId: string | null;
            ownerId: string;
        } | null;
    }>;
    update(id: string, updateDocumentDto: UpdateDocumentDto, userId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
        title: string;
        content: string | null;
        folderId: string | null;
        owner: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        };
        folder: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            parentId: string | null;
            ownerId: string;
        } | null;
    } | undefined>;
    remove(id: string, userId?: string): Promise<{
        success: boolean;
    }>;
}

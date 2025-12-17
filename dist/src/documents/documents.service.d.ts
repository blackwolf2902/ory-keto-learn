import { PrismaService } from '../prisma.service';
import { KetoService } from '../keto/keto.service';
import { EventPublisherService } from '../events/event-publisher.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { ShareDocumentDto } from './dto/share-document.dto';
export declare class DocumentsService {
    private readonly prisma;
    private readonly ketoService;
    private readonly eventPublisher;
    constructor(prisma: PrismaService, ketoService: KetoService, eventPublisher: EventPublisherService);
    create(createDocumentDto: CreateDocumentDto, userId: string): Promise<{
        folder: {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            ownerId: string;
            parentId: string | null;
        } | null;
        owner: {
            email: string;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        folderId: string | null;
        ownerId: string;
    }>;
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
    findAll(): Promise<({
        folder: {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            ownerId: string;
            parentId: string | null;
        } | null;
        owner: {
            email: string;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        folderId: string | null;
        ownerId: string;
    })[]>;
    findOne(id: string): Promise<{
        folder: {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            ownerId: string;
            parentId: string | null;
        } | null;
        owner: {
            email: string;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        folderId: string | null;
        ownerId: string;
    }>;
    update(id: string, updateDocumentDto: UpdateDocumentDto, userId?: string): Promise<{
        folder: {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            ownerId: string;
            parentId: string | null;
        } | null;
        owner: {
            email: string;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        folderId: string | null;
        ownerId: string;
    }>;
    remove(id: string, userId?: string): Promise<{
        success: boolean;
    }>;
}

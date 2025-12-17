import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { ShareDocumentDto } from './dto/share-document.dto';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
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
    update(id: string, updateDocumentDto: UpdateDocumentDto): Promise<{
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
    remove(id: string): Promise<{
        success: boolean;
    }>;
    share(id: string, shareDto: ShareDocumentDto, userId: string): Promise<{
        success: boolean;
        message: string;
        relation: string;
    }>;
    unshare(id: string, shareDto: ShareDocumentDto, userId: string): Promise<{
        success: boolean;
        message: string;
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
}

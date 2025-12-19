import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { ShareDocumentDto } from './dto/share-document.dto';
import type { KratosIdentity } from '../common/decorators/current-user.decorator';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    create(createDocumentDto: CreateDocumentDto, user: KratosIdentity): Promise<{
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
    findAll(user: KratosIdentity): Promise<{
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
    update(id: string, updateDocumentDto: UpdateDocumentDto, user: KratosIdentity): Promise<{
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
    remove(id: string, user: KratosIdentity): Promise<{
        success: boolean;
    }>;
    share(id: string, shareDto: ShareDocumentDto, user: KratosIdentity): Promise<{
        success: boolean;
        message: string;
        relation: string;
    }>;
    unshare(id: string, shareDto: ShareDocumentDto, user: KratosIdentity): Promise<{
        success: boolean;
        message: string;
    }>;
    getAccessList(id: string): Promise<{
        owners: string[];
        editors: string[];
        viewers: string[];
    }>;
    checkAccess(id: string, relation: string, userId?: string, currentUser?: KratosIdentity): Promise<{
        allowed: boolean;
        check: string;
    }> | {
        allowed: boolean;
        check: string;
        error: string;
    };
}

import { DomainEvent } from '../../events/interfaces/event.interface';
export interface DocumentCreatedPayload {
    [key: string]: unknown;
    title: string;
    content?: string;
    folderId?: string;
}
export interface DocumentUpdatedPayload {
    [key: string]: unknown;
    changes: {
        title?: string;
        content?: string;
        folderId?: string;
    };
    previousValues?: {
        title?: string;
        content?: string;
        folderId?: string;
    };
}
export interface DocumentDeletedPayload {
    [key: string]: unknown;
    title: string;
}
export interface DocumentSharedPayload {
    [key: string]: unknown;
    targetType: 'user' | 'group';
    targetId: string;
    relation: 'viewer' | 'editor';
}
export interface DocumentUnsharedPayload {
    [key: string]: unknown;
    targetType: 'user' | 'group';
    targetId: string;
    relation: 'viewer' | 'editor';
}
export declare const DOCUMENT_EVENTS: {
    readonly CREATED: "DocumentCreated";
    readonly UPDATED: "DocumentUpdated";
    readonly DELETED: "DocumentDeleted";
    readonly SHARED: "DocumentShared";
    readonly UNSHARED: "DocumentUnshared";
};
export declare function createDocumentCreatedEvent(aggregateId: string, userId: string, payload: DocumentCreatedPayload): Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'>;
export declare function createDocumentUpdatedEvent(aggregateId: string, userId: string, payload: DocumentUpdatedPayload): Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'>;
export declare function createDocumentDeletedEvent(aggregateId: string, userId: string, payload: DocumentDeletedPayload): Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'>;
export declare function createDocumentSharedEvent(aggregateId: string, userId: string, payload: DocumentSharedPayload): Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'>;
export declare function createDocumentUnsharedEvent(aggregateId: string, userId: string, payload: DocumentUnsharedPayload): Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'>;

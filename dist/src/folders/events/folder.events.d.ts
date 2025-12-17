import { DomainEvent } from '../../events/interfaces/event.interface';
export interface FolderCreatedPayload {
    [key: string]: unknown;
    name: string;
    description?: string;
    parentId?: string;
}
export interface FolderDeletedPayload {
    [key: string]: unknown;
    name: string;
}
export interface FolderSharedPayload {
    [key: string]: unknown;
    targetType: 'user' | 'group';
    targetId: string;
    relation: 'viewer' | 'editor';
}
export interface FolderUnsharedPayload {
    [key: string]: unknown;
    targetType: 'user' | 'group';
    targetId: string;
    relation: 'viewer' | 'editor';
}
export declare const FOLDER_EVENTS: {
    readonly CREATED: "FolderCreated";
    readonly DELETED: "FolderDeleted";
    readonly SHARED: "FolderShared";
    readonly UNSHARED: "FolderUnshared";
};
export declare function createFolderCreatedEvent(aggregateId: string, userId: string, payload: FolderCreatedPayload): Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'>;
export declare function createFolderDeletedEvent(aggregateId: string, userId: string, payload: FolderDeletedPayload): Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'>;
export declare function createFolderSharedEvent(aggregateId: string, userId: string, payload: FolderSharedPayload): Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'>;
export declare function createFolderUnsharedEvent(aggregateId: string, userId: string, payload: FolderUnsharedPayload): Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'>;

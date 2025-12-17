export interface DomainEvent {
    eventId: string;
    eventType: string;
    aggregateType: string;
    aggregateId: string;
    version: number;
    timestamp: Date;
    userId: string;
    payload: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}
export type EventFactory<T extends DomainEvent> = (params: Omit<T, 'eventId' | 'timestamp' | 'version'>) => T;
export type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => void | Promise<void>;
export type AggregateType = 'Document' | 'Folder' | 'Group' | 'User';
export type EventType = 'DocumentCreated' | 'DocumentUpdated' | 'DocumentDeleted' | 'DocumentShared' | 'DocumentUnshared' | 'FolderCreated' | 'FolderDeleted' | 'FolderShared' | 'FolderUnshared' | 'GroupCreated' | 'MemberAdded' | 'MemberRemoved';

import { DomainEvent } from '../../events/interfaces/event.interface';

/**
 * ============================================
 * FOLDER DOMAIN EVENTS
 * ============================================
 *
 * Events that capture all significant actions on folders.
 */

// ============================================
// LIFECYCLE EVENTS
// ============================================

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

// ============================================
// PERMISSION EVENTS
// ============================================

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

// ============================================
// EVENT TYPE CONSTANTS
// ============================================

export const FOLDER_EVENTS = {
    CREATED: 'FolderCreated',
    DELETED: 'FolderDeleted',
    SHARED: 'FolderShared',
    UNSHARED: 'FolderUnshared',
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

export function createFolderCreatedEvent(
    aggregateId: string,
    userId: string,
    payload: FolderCreatedPayload,
): Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'> {
    return {
        eventType: FOLDER_EVENTS.CREATED,
        aggregateType: 'Folder',
        aggregateId,
        userId,
        payload: payload as Record<string, unknown>,
    };
}

export function createFolderDeletedEvent(
    aggregateId: string,
    userId: string,
    payload: FolderDeletedPayload,
): Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'> {
    return {
        eventType: FOLDER_EVENTS.DELETED,
        aggregateType: 'Folder',
        aggregateId,
        userId,
        payload: payload as Record<string, unknown>,
    };
}

export function createFolderSharedEvent(
    aggregateId: string,
    userId: string,
    payload: FolderSharedPayload,
): Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'> {
    return {
        eventType: FOLDER_EVENTS.SHARED,
        aggregateType: 'Folder',
        aggregateId,
        userId,
        payload: payload as Record<string, unknown>,
    };
}

export function createFolderUnsharedEvent(
    aggregateId: string,
    userId: string,
    payload: FolderUnsharedPayload,
): Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'> {
    return {
        eventType: FOLDER_EVENTS.UNSHARED,
        aggregateType: 'Folder',
        aggregateId,
        userId,
        payload: payload as Record<string, unknown>,
    };
}

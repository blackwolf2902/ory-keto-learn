import { DomainEvent } from '../../events/interfaces/event.interface';

/**
 * ============================================
 * DOCUMENT DOMAIN EVENTS
 * ============================================
 *
 * Events that capture all significant actions on documents.
 *
 * CONCEPT: Domain Events
 * Each event represents something that HAPPENED (past tense).
 * Events are facts - they cannot be changed or deleted.
 */

// ============================================
// LIFECYCLE EVENTS
// ============================================

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
    title: string; // Store title for audit purposes
}

// ============================================
// PERMISSION EVENTS
// ============================================

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

// ============================================
// EVENT TYPE CONSTANTS
// ============================================

export const DOCUMENT_EVENTS = {
    CREATED: 'DocumentCreated',
    UPDATED: 'DocumentUpdated',
    DELETED: 'DocumentDeleted',
    SHARED: 'DocumentShared',
    UNSHARED: 'DocumentUnshared',
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create parameters for a DocumentCreated event
 */
export function createDocumentCreatedEvent(
    aggregateId: string,
    userId: string,
    payload: DocumentCreatedPayload,
): Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'> {
    return {
        eventType: DOCUMENT_EVENTS.CREATED,
        aggregateType: 'Document',
        aggregateId,
        userId,
        payload: payload as Record<string, unknown>,
    };
}

/**
 * Create parameters for a DocumentUpdated event
 */
export function createDocumentUpdatedEvent(
    aggregateId: string,
    userId: string,
    payload: DocumentUpdatedPayload,
): Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'> {
    return {
        eventType: DOCUMENT_EVENTS.UPDATED,
        aggregateType: 'Document',
        aggregateId,
        userId,
        payload: payload as Record<string, unknown>,
    };
}

/**
 * Create parameters for a DocumentDeleted event
 */
export function createDocumentDeletedEvent(
    aggregateId: string,
    userId: string,
    payload: DocumentDeletedPayload,
): Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'> {
    return {
        eventType: DOCUMENT_EVENTS.DELETED,
        aggregateType: 'Document',
        aggregateId,
        userId,
        payload: payload as Record<string, unknown>,
    };
}

/**
 * Create parameters for a DocumentShared event
 */
export function createDocumentSharedEvent(
    aggregateId: string,
    userId: string,
    payload: DocumentSharedPayload,
): Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'> {
    return {
        eventType: DOCUMENT_EVENTS.SHARED,
        aggregateType: 'Document',
        aggregateId,
        userId,
        payload: payload as Record<string, unknown>,
    };
}

/**
 * Create parameters for a DocumentUnshared event
 */
export function createDocumentUnsharedEvent(
    aggregateId: string,
    userId: string,
    payload: DocumentUnsharedPayload,
): Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'> {
    return {
        eventType: DOCUMENT_EVENTS.UNSHARED,
        aggregateType: 'Document',
        aggregateId,
        userId,
        payload: payload as Record<string, unknown>,
    };
}

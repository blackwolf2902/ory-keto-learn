/**
 * ============================================
 * DOMAIN EVENT INTERFACE
 * ============================================
 *
 * Base interface for all domain events in the system.
 *
 * CONCEPT: Event Sourcing
 * Instead of storing only current state, we store a sequence of events.
 * Each event represents something that happened in the domain.
 *
 * Benefits:
 * 1. Complete audit trail of all changes
 * 2. Time-travel debugging (replay events to any point)
 * 3. Event-driven architecture capabilities
 * 4. Analytics on user behavior
 */

/**
 * Base interface all domain events must implement
 */
export interface DomainEvent {
    /** Unique identifier for this event instance */
    eventId: string;

    /** Type of event (e.g., 'DocumentCreated', 'FolderShared') */
    eventType: string;

    /** Type of aggregate this event belongs to (e.g., 'Document', 'Folder') */
    aggregateType: string;

    /** ID of the aggregate (entity) this event affects */
    aggregateId: string;

    /** Sequence number for this aggregate (for ordering) */
    version: number;

    /** When the event occurred */
    timestamp: Date;

    /** ID of the user who triggered the event */
    userId: string;

    /** Event-specific data */
    payload: Record<string, unknown>;

    /** Optional metadata (e.g., IP address, user agent) */
    metadata?: Record<string, unknown>;
}

/**
 * Factory function type for creating events
 */
export type EventFactory<T extends DomainEvent> = (
    params: Omit<T, 'eventId' | 'timestamp' | 'version'>,
) => T;

/**
 * Event handler function type
 */
export type EventHandler<T extends DomainEvent = DomainEvent> = (
    event: T,
) => void | Promise<void>;

/**
 * Supported aggregate types in the system
 */
export type AggregateType = 'Document' | 'Folder' | 'Group' | 'User';

/**
 * All event types in the system
 */
export type EventType =
    // Document events
    | 'DocumentCreated'
    | 'DocumentUpdated'
    | 'DocumentDeleted'
    | 'DocumentShared'
    | 'DocumentUnshared'
    // Folder events
    | 'FolderCreated'
    | 'FolderDeleted'
    | 'FolderShared'
    | 'FolderUnshared'
    // Group events
    | 'GroupCreated'
    | 'MemberAdded'
    | 'MemberRemoved';

import { DomainEvent } from '../../events/interfaces/event.interface';

/**
 * ============================================
 * GROUP DOMAIN EVENTS
 * ============================================
 *
 * Events that capture all significant actions on groups.
 */

// ============================================
// LIFECYCLE EVENTS
// ============================================

export interface GroupCreatedPayload {
    [key: string]: unknown;
    name: string;
    description?: string;
}

// ============================================
// MEMBERSHIP EVENTS
// ============================================

export interface MemberAddedPayload {
    [key: string]: unknown;
    memberId: string;
    role: string;
}

export interface MemberRemovedPayload {
    [key: string]: unknown;
    memberId: string;
}

// ============================================
// EVENT TYPE CONSTANTS
// ============================================

export const GROUP_EVENTS = {
    CREATED: 'GroupCreated',
    MEMBER_ADDED: 'MemberAdded',
    MEMBER_REMOVED: 'MemberRemoved',
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

export function createGroupCreatedEvent(
    aggregateId: string,
    userId: string,
    payload: GroupCreatedPayload,
): Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'> {
    return {
        eventType: GROUP_EVENTS.CREATED,
        aggregateType: 'Group',
        aggregateId,
        userId,
        payload: payload as Record<string, unknown>,
    };
}

export function createMemberAddedEvent(
    aggregateId: string,
    userId: string,
    payload: MemberAddedPayload,
): Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'> {
    return {
        eventType: GROUP_EVENTS.MEMBER_ADDED,
        aggregateType: 'Group',
        aggregateId,
        userId,
        payload: payload as Record<string, unknown>,
    };
}

export function createMemberRemovedEvent(
    aggregateId: string,
    userId: string,
    payload: MemberRemovedPayload,
): Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'> {
    return {
        eventType: GROUP_EVENTS.MEMBER_REMOVED,
        aggregateType: 'Group',
        aggregateId,
        userId,
        payload: payload as Record<string, unknown>,
    };
}

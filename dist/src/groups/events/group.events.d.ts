import { DomainEvent } from '../../events/interfaces/event.interface';
export interface GroupCreatedPayload {
    [key: string]: unknown;
    name: string;
    description?: string;
}
export interface MemberAddedPayload {
    [key: string]: unknown;
    memberId: string;
    role: string;
}
export interface MemberRemovedPayload {
    [key: string]: unknown;
    memberId: string;
}
export declare const GROUP_EVENTS: {
    readonly CREATED: "GroupCreated";
    readonly MEMBER_ADDED: "MemberAdded";
    readonly MEMBER_REMOVED: "MemberRemoved";
};
export declare function createGroupCreatedEvent(aggregateId: string, userId: string, payload: GroupCreatedPayload): Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'>;
export declare function createMemberAddedEvent(aggregateId: string, userId: string, payload: MemberAddedPayload): Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'>;
export declare function createMemberRemovedEvent(aggregateId: string, userId: string, payload: MemberRemovedPayload): Omit<DomainEvent, 'eventId' | 'timestamp' | 'version'>;

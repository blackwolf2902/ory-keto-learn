"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GROUP_EVENTS = void 0;
exports.createGroupCreatedEvent = createGroupCreatedEvent;
exports.createMemberAddedEvent = createMemberAddedEvent;
exports.createMemberRemovedEvent = createMemberRemovedEvent;
exports.GROUP_EVENTS = {
    CREATED: 'GroupCreated',
    MEMBER_ADDED: 'MemberAdded',
    MEMBER_REMOVED: 'MemberRemoved',
};
function createGroupCreatedEvent(aggregateId, userId, payload) {
    return {
        eventType: exports.GROUP_EVENTS.CREATED,
        aggregateType: 'Group',
        aggregateId,
        userId,
        payload: payload,
    };
}
function createMemberAddedEvent(aggregateId, userId, payload) {
    return {
        eventType: exports.GROUP_EVENTS.MEMBER_ADDED,
        aggregateType: 'Group',
        aggregateId,
        userId,
        payload: payload,
    };
}
function createMemberRemovedEvent(aggregateId, userId, payload) {
    return {
        eventType: exports.GROUP_EVENTS.MEMBER_REMOVED,
        aggregateType: 'Group',
        aggregateId,
        userId,
        payload: payload,
    };
}
//# sourceMappingURL=group.events.js.map
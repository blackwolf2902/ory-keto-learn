"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOCUMENT_EVENTS = void 0;
exports.createDocumentCreatedEvent = createDocumentCreatedEvent;
exports.createDocumentUpdatedEvent = createDocumentUpdatedEvent;
exports.createDocumentDeletedEvent = createDocumentDeletedEvent;
exports.createDocumentSharedEvent = createDocumentSharedEvent;
exports.createDocumentUnsharedEvent = createDocumentUnsharedEvent;
exports.DOCUMENT_EVENTS = {
    CREATED: 'DocumentCreated',
    UPDATED: 'DocumentUpdated',
    DELETED: 'DocumentDeleted',
    SHARED: 'DocumentShared',
    UNSHARED: 'DocumentUnshared',
};
function createDocumentCreatedEvent(aggregateId, userId, payload) {
    return {
        eventType: exports.DOCUMENT_EVENTS.CREATED,
        aggregateType: 'Document',
        aggregateId,
        userId,
        payload: payload,
    };
}
function createDocumentUpdatedEvent(aggregateId, userId, payload) {
    return {
        eventType: exports.DOCUMENT_EVENTS.UPDATED,
        aggregateType: 'Document',
        aggregateId,
        userId,
        payload: payload,
    };
}
function createDocumentDeletedEvent(aggregateId, userId, payload) {
    return {
        eventType: exports.DOCUMENT_EVENTS.DELETED,
        aggregateType: 'Document',
        aggregateId,
        userId,
        payload: payload,
    };
}
function createDocumentSharedEvent(aggregateId, userId, payload) {
    return {
        eventType: exports.DOCUMENT_EVENTS.SHARED,
        aggregateType: 'Document',
        aggregateId,
        userId,
        payload: payload,
    };
}
function createDocumentUnsharedEvent(aggregateId, userId, payload) {
    return {
        eventType: exports.DOCUMENT_EVENTS.UNSHARED,
        aggregateType: 'Document',
        aggregateId,
        userId,
        payload: payload,
    };
}
//# sourceMappingURL=document.events.js.map
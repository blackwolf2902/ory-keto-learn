"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FOLDER_EVENTS = void 0;
exports.createFolderCreatedEvent = createFolderCreatedEvent;
exports.createFolderDeletedEvent = createFolderDeletedEvent;
exports.createFolderSharedEvent = createFolderSharedEvent;
exports.createFolderUnsharedEvent = createFolderUnsharedEvent;
exports.FOLDER_EVENTS = {
    CREATED: 'FolderCreated',
    DELETED: 'FolderDeleted',
    SHARED: 'FolderShared',
    UNSHARED: 'FolderUnshared',
};
function createFolderCreatedEvent(aggregateId, userId, payload) {
    return {
        eventType: exports.FOLDER_EVENTS.CREATED,
        aggregateType: 'Folder',
        aggregateId,
        userId,
        payload: payload,
    };
}
function createFolderDeletedEvent(aggregateId, userId, payload) {
    return {
        eventType: exports.FOLDER_EVENTS.DELETED,
        aggregateType: 'Folder',
        aggregateId,
        userId,
        payload: payload,
    };
}
function createFolderSharedEvent(aggregateId, userId, payload) {
    return {
        eventType: exports.FOLDER_EVENTS.SHARED,
        aggregateType: 'Folder',
        aggregateId,
        userId,
        payload: payload,
    };
}
function createFolderUnsharedEvent(aggregateId, userId, payload) {
    return {
        eventType: exports.FOLDER_EVENTS.UNSHARED,
        aggregateType: 'Folder',
        aggregateId,
        userId,
        payload: payload,
    };
}
//# sourceMappingURL=folder.events.js.map
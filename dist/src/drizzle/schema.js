"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.events = exports.documentsRelations = exports.documents = exports.foldersRelations = exports.folders = exports.groupMembersRelations = exports.groupMembers = exports.groupsRelations = exports.groups = exports.usersRelations = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).unique().notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    ownedDocuments: many(exports.documents),
    ownedFolders: many(exports.folders),
    groupMemberships: many(exports.groupMembers),
}));
exports.groups = (0, pg_core_1.pgTable)('groups', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).unique().notNull(),
    description: (0, pg_core_1.text)('description'),
    creatorId: (0, pg_core_1.uuid)('creator_id').references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.groupsRelations = (0, drizzle_orm_1.relations)(exports.groups, ({ one, many }) => ({
    members: many(exports.groupMembers),
    creator: one(exports.users, {
        fields: [exports.groups.creatorId],
        references: [exports.users.id],
    }),
}));
exports.groupMembers = (0, pg_core_1.pgTable)('group_members', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull().references(() => exports.users.id, { onDelete: 'cascade' }),
    groupId: (0, pg_core_1.uuid)('group_id').notNull().references(() => exports.groups.id, { onDelete: 'cascade' }),
    role: (0, pg_core_1.varchar)('role', { length: 50 }).default('member').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.unique)().on(table.userId, table.groupId),
]);
exports.groupMembersRelations = (0, drizzle_orm_1.relations)(exports.groupMembers, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.groupMembers.userId],
        references: [exports.users.id],
    }),
    group: one(exports.groups, {
        fields: [exports.groupMembers.groupId],
        references: [exports.groups.id],
    }),
}));
exports.folders = (0, pg_core_1.pgTable)('folders', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    parentId: (0, pg_core_1.uuid)('parent_id').references(() => exports.folders.id, { onDelete: 'cascade' }),
    ownerId: (0, pg_core_1.uuid)('owner_id').notNull().references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.foldersRelations = (0, drizzle_orm_1.relations)(exports.folders, ({ one, many }) => ({
    parent: one(exports.folders, {
        fields: [exports.folders.parentId],
        references: [exports.folders.id],
        relationName: 'FolderHierarchy',
    }),
    children: many(exports.folders, { relationName: 'FolderHierarchy' }),
    owner: one(exports.users, {
        fields: [exports.folders.ownerId],
        references: [exports.users.id],
    }),
    documents: many(exports.documents),
}));
exports.documents = (0, pg_core_1.pgTable)('documents', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    content: (0, pg_core_1.text)('content'),
    folderId: (0, pg_core_1.uuid)('folder_id').references(() => exports.folders.id, { onDelete: 'set null' }),
    ownerId: (0, pg_core_1.uuid)('owner_id').notNull().references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.documentsRelations = (0, drizzle_orm_1.relations)(exports.documents, ({ one }) => ({
    folder: one(exports.folders, {
        fields: [exports.documents.folderId],
        references: [exports.folders.id],
    }),
    owner: one(exports.users, {
        fields: [exports.documents.ownerId],
        references: [exports.users.id],
    }),
}));
exports.events = (0, pg_core_1.pgTable)('events', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    eventType: (0, pg_core_1.varchar)('event_type', { length: 100 }).notNull(),
    aggregateType: (0, pg_core_1.varchar)('aggregate_type', { length: 100 }).notNull(),
    aggregateId: (0, pg_core_1.varchar)('aggregate_id', { length: 100 }).notNull(),
    version: (0, pg_core_1.integer)('version').notNull(),
    userId: (0, pg_core_1.varchar)('user_id', { length: 100 }).notNull(),
    payload: (0, pg_core_1.jsonb)('payload').notNull(),
    metadata: (0, pg_core_1.jsonb)('metadata'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.index)('events_aggregate_id_idx').on(table.aggregateId),
    (0, pg_core_1.index)('events_aggregate_type_event_type_idx').on(table.aggregateType, table.eventType),
    (0, pg_core_1.index)('events_created_at_idx').on(table.createdAt),
]);
//# sourceMappingURL=schema.js.map
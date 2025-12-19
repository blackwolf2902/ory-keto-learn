import { pgTable, uuid, varchar, text, timestamp, integer, jsonb, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// USERS TABLE
// ============================================
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
    ownedDocuments: many(documents),
    ownedFolders: many(folders),
    groupMemberships: many(groupMembers),
}));

// ============================================
// GROUPS TABLE
// ============================================
export const groups = pgTable('groups', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).unique().notNull(),
    description: text('description'),
    creatorId: uuid('creator_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const groupsRelations = relations(groups, ({ one, many }) => ({
    members: many(groupMembers),
    creator: one(users, {
        fields: [groups.creatorId],
        references: [users.id],
    }),
}));

// ============================================
// GROUP MEMBERS TABLE
// ============================================
export const groupMembers = pgTable('group_members', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    groupId: uuid('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 50 }).default('member').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    unique().on(table.userId, table.groupId),
]);

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
    user: one(users, {
        fields: [groupMembers.userId],
        references: [users.id],
    }),
    group: one(groups, {
        fields: [groupMembers.groupId],
        references: [groups.id],
    }),
}));

// ============================================
// FOLDERS TABLE
// ============================================
export const folders = pgTable('folders', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    parentId: uuid('parent_id').references((): any => folders.id, { onDelete: 'cascade' }),
    ownerId: uuid('owner_id').notNull().references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const foldersRelations = relations(folders, ({ one, many }) => ({
    parent: one(folders, {
        fields: [folders.parentId],
        references: [folders.id],
        relationName: 'FolderHierarchy',
    }),
    children: many(folders, { relationName: 'FolderHierarchy' }),
    owner: one(users, {
        fields: [folders.ownerId],
        references: [users.id],
    }),
    documents: many(documents),
}));

// ============================================
// DOCUMENTS TABLE
// ============================================
export const documents = pgTable('documents', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content'),
    folderId: uuid('folder_id').references(() => folders.id, { onDelete: 'set null' }),
    ownerId: uuid('owner_id').notNull().references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const documentsRelations = relations(documents, ({ one }) => ({
    folder: one(folders, {
        fields: [documents.folderId],
        references: [folders.id],
    }),
    owner: one(users, {
        fields: [documents.ownerId],
        references: [users.id],
    }),
}));

// ============================================
// EVENTS TABLE (Event Sourcing)
// ============================================
export const events = pgTable('events', {
    id: uuid('id').primaryKey().defaultRandom(),
    eventType: varchar('event_type', { length: 100 }).notNull(),
    aggregateType: varchar('aggregate_type', { length: 100 }).notNull(),
    aggregateId: varchar('aggregate_id', { length: 100 }).notNull(),
    version: integer('version').notNull(),
    userId: varchar('user_id', { length: 100 }).notNull(),
    payload: jsonb('payload').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('events_aggregate_id_idx').on(table.aggregateId),
    index('events_aggregate_type_event_type_idx').on(table.aggregateType, table.eventType),
    index('events_created_at_idx').on(table.createdAt),
]);

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;
export type GroupMember = typeof groupMembers.$inferSelect;
export type NewGroupMember = typeof groupMembers.$inferInsert;
export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

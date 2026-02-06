
import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';

export const contacts = sqliteTable('contacts', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    firstName: text('first_name').notNull(),
    lastName: text('last_name'),
    mobileNumber: text('mobile_number'),
    email: text('email'),
    relationType: text('relation_type'), // Family, Friend, Work, etc.
    birthday: text('birthday'), // ISO string YYYY-MM-DD
    profileImageUri: text('profile_image_uri'),
    notes: text('notes'),
    isPrivate: integer('is_private', { mode: 'boolean' }).default(false), // For vault
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const interactions = sqliteTable('interactions', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    contactId: integer('contact_id').references(() => contacts.id).notNull(),
    type: text('type').notNull(), // Call, Meeting, Message
    notes: text('notes'),
    date: integer('date', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    location: text('location'),
    transcript: text('transcript'), // For call summaries
});

export const media = sqliteTable('media', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    contactId: integer('contact_id').references(() => contacts.id).notNull(),
    interactionId: integer('interaction_id').references(() => interactions.id),
    type: text('type').notNull(), // Image, Video, Audio, Document
    uri: text('uri').notNull(),
    mimeType: text('mime_type'),
    fileName: text('file_name'),
    isPrivate: integer('is_private', { mode: 'boolean' }).default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const reminders = sqliteTable('reminders', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    contactId: integer('contact_id').references(() => contacts.id),
    title: text('title').notNull(),
    date: integer('date', { mode: 'timestamp' }).notNull(),
    calendarEventId: text('calendar_event_id'), // For syncing with device calendar
    completed: integer('completed', { mode: 'boolean' }).default(false),
});

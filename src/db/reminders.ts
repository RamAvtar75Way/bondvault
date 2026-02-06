
import { eq, desc } from 'drizzle-orm';
import { db } from './client';
import { reminders } from './schema';

export const getRemindersByContactId = async (contactId: number) => {
    return await db.select()
        .from(reminders)
        .where(eq(reminders.contactId, contactId))
        .orderBy(desc(reminders.date));
};

export const addReminder = async (data: typeof reminders.$inferInsert) => {
    return await db.insert(reminders).values(data).returning();
};

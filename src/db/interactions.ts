
import { eq, desc } from 'drizzle-orm';
import { db } from './client';
import { interactions } from './schema';

// Get all interactions for a contact
export const getInteractionsByContactId = async (contactId: number) => {
    return await db.select()
        .from(interactions)
        .where(eq(interactions.contactId, contactId))
        .orderBy(desc(interactions.date));
};

export const addInteraction = async (data: typeof interactions.$inferInsert) => {
    return await db.insert(interactions).values(data).returning();
};

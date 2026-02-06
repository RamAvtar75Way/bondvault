
import { eq, desc } from 'drizzle-orm';
import { db } from './client';
import { media } from './schema';

export const getMediaByContactId = async (contactId: number) => {
    return await db.select()
        .from(media)
        .where(eq(media.contactId, contactId))
        .orderBy(desc(media.createdAt));
};

export const addMedia = async (data: typeof media.$inferInsert) => {
    return await db.insert(media).values(data).returning();
};

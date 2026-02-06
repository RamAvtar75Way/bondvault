
import { eq } from 'drizzle-orm';
import { db } from './client';
import { contacts } from './schema';

export const getContacts = async (showPrivate = false) => {
    if (showPrivate) {
        return await db.select().from(contacts).where(eq(contacts.isPrivate, true)).orderBy(contacts.firstName);
    }
    return await db.select().from(contacts).where(eq(contacts.isPrivate, false)).orderBy(contacts.firstName);
};

export const getContactById = async (id: number) => {
    const result = await db.select().from(contacts).where(eq(contacts.id, id));
    return result[0];
};

export const addContact = async (data: typeof contacts.$inferInsert) => {
    return await db.insert(contacts).values(data).returning();
};

export const updateContact = async (id: number, data: Partial<typeof contacts.$inferInsert>) => {
    return await db.update(contacts).set(data).where(eq(contacts.id, id)).returning();
};

export const deleteContact = async (id: number) => {
    return await db.delete(contacts).where(eq(contacts.id, id));
};


import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

const expoDb = openDatabaseSync('bondvault.db');
const db = drizzle(expoDb, { schema });

export { db };
export const initializeDb = async () => {
    // Migrations would go here if we were using 'drizzle-kit migrate', 
    // but for expo-sqlite usually we rely on migration tools or simple table creation if not using kit in dev loop thoroughly.
    // Drizzle with Expo often assumes pre-generated migrations or `drizzle-kit push`.
    // For this setup, we might need a manual migration helper if we don't have the kit set up to run against the device.
    // However, Drizzle's `migrate` function for expo-sqlite is efficient.

    // For simplicity in this agentic flow without a separate migration build step, 
    // we'll optimistically assume the tables are created or use a "synchronize" helper if available,
    // OR just use SQL to ensure tables exist for this initial version.

    // In a real app, we'd use `drizzle-kit migrate`. 
    // Let's rely on `drizzle-orm/expo-sqlite/migrator` if possible, or just raw SQL for the initial setup to ensure robustness.

    await expoDb.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT,
            mobile_number TEXT,
            email TEXT,
            relation_type TEXT,
            birthday TEXT,
            profile_image_uri TEXT,
            notes TEXT,
            is_private BOOLEAN DEFAULT 0,
            created_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contact_id INTEGER NOT NULL REFERENCES contacts(id),
            type TEXT NOT NULL,
            notes TEXT,
            date INTEGER NOT NULL,
            location TEXT,
            transcript TEXT
        );
        CREATE TABLE IF NOT EXISTS media (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contact_id INTEGER NOT NULL REFERENCES contacts(id),
            interaction_id INTEGER REFERENCES interactions(id),
            type TEXT NOT NULL,
            uri TEXT NOT NULL,
            mime_type TEXT,
            file_name TEXT,
            is_private BOOLEAN DEFAULT 0,
            created_at INTEGER NOT NULL
        );
         CREATE TABLE IF NOT EXISTS reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contact_id INTEGER REFERENCES contacts(id),
            title TEXT NOT NULL,
            date INTEGER NOT NULL,
            calendar_event_id TEXT,
            completed BOOLEAN DEFAULT 0
        );
    `);
};

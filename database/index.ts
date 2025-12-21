import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { Directory, File, Paths } from 'expo-file-system';
import { mySchema } from '@/model/schema';
import Product from '../model/product';

const DB_NAME = 'watermelon.db';
const SEED_ENDPOINT = 'http://10.0.2.2:5117/api/sync/seed-db';

export async function setupDatabase(): Promise<Database> {
  const sqliteDir = new Directory(Paths.document, 'SQLite');
  const dbFile = new File(sqliteDir, DB_NAME);

  // 1. Initial Seeding Logic
  if (!dbFile.exists) {
    console.log("[DB] File not found. Attempting initial seed from .NET...");

    try {
      if (!sqliteDir.exists) {
        sqliteDir.create();
      }

      // Download the pre-built SQLite file from your .NET API
      const result = await File.downloadFileAsync(SEED_ENDPOINT, dbFile);

      // Check status (if the library provides it) or ensure file now exists
      if (!dbFile.exists) {
        throw new Error("Download completed but file was not saved to disk.");
      }

      console.log("[DB] Initial seed successful.");
    } catch (error: any) {
      console.error("[DB] Initial seed failed:", error);

      // Clean up partial file if download failed to prevent corrupted DB startup
      if (dbFile.exists) {
        dbFile.delete();
      }

      // Throw error up to the UI layer
      throw new Error(`Failed to initialize data from server: ${error.message}`);
    }
  }

  // 2. Initialize WatermelonDB Adapter
  const adapter = new SQLiteAdapter({
    schema: mySchema,
    dbName: 'watermelon', // This should match the DB_NAME base if using standard SQLite
    jsi: true,
  });

  return new Database({
    adapter,
    modelClasses: [Product],
  });
}

export let database: Database;

export const initDB = async () => {
  try {
    database = await setupDatabase();
  } catch (error) {
    // Re-throw to be caught by the App Entry point (App.tsx / layout.tsx)
    throw error;
  }
};
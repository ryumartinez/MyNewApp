import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { Directory, File, Paths } from 'expo-file-system';
import { mySchema } from '@/model/schema';
import Product from '../model/product';

const DB_NAME = 'watermelon.db';
const SEED_ENDPOINT = 'http://10.0.2.2:5117/api/sync/seed-db';

// Helper to format bytes for the log
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = 2;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export async function setupDatabase(): Promise<Database> {
  const sqliteDir = new Directory(Paths.document, 'SQLite');
  const dbFile = new File(sqliteDir, DB_NAME);

  // 1. Initial Seeding Logic
  if (!dbFile.exists) {
    console.log(`[DB] Attempting initial seed from: ${SEED_ENDPOINT}`);

    try {
      if (!sqliteDir.exists) {
        sqliteDir.create();
      }

      const result = await File.downloadFileAsync(SEED_ENDPOINT, dbFile);

      // Verify file exists and log its details
      if (!dbFile.exists) {
        throw new Error("Download completed but file was not saved to disk.");
      }

      // Log Name and Human-Readable Size
      console.log('--- DB SEED STATS ---');
      console.log(`File Name: ${dbFile.name}`);
      console.log(`File Size: ${formatBytes(dbFile.size)}`);
      console.log('---------------------');

      // Safety check: A 100k product DB should likely be > 5MB.
      // If it's only a few KB, the .NET backend might have sent an empty DB.
      if (dbFile.size < 1024) {
        console.warn("[DB] Warning: Downloaded file is suspiciously small.");
      }

    } catch (error: any) {
      console.error("[DB] Initial seed failed:", error);
      if (dbFile.exists) dbFile.delete();
      throw new Error(`Failed to initialize data from server: ${error.message}`);
    }
  } else {
    // Log details even if it already exists for easier debugging
    console.log(`[DB] Using existing database: ${dbFile.name} (${formatBytes(dbFile.size)})`);
  }

  // 2. Initialize WatermelonDB Adapter
  const adapter = new SQLiteAdapter({
    schema: mySchema,
    dbName: 'watermelon',
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
    throw error;
  }
};
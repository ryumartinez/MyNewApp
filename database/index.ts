import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { Directory, File, Paths } from 'expo-file-system'
import { mySchema } from '@/model/schema'
import Product from '../model/product'

const DB_NAME = 'watermelon.db';

export async function setupDatabase(): Promise<Database> {
  // 1. Reference the directory and file objects
  // Paths.document points to the app's internal document storage
  const sqliteDir = new Directory(Paths.document, 'SQLite');
  const dbFile = new File(sqliteDir, DB_NAME);

  // 2. Perform the seeding check
  if (!dbFile.exists) {
    console.log("Seeding initial database...");

    // Create directory if missing (equivalent to makeDirectoryAsync)
    if (!sqliteDir.exists) {
      sqliteDir.create();
    }

    // Download from your .NET Seed Endpoint directly to the file reference
    await File.downloadFileAsync(
      'http://10.0.2.2:5117/api/sync/seed-db',
      dbFile
    );
  }

  // 3. Initialize WatermelonDB
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
  database = await setupDatabase();
};
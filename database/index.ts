import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { Directory, File, Paths } from 'expo-file-system';
import { Asset } from 'expo-asset';
import * as SQLite from 'expo-sqlite';

import { mySchema } from '@/model/schema';
import Product from '../model/product';

const DB_NAME = 'watermelon.db';

/**
 * Diagnostic function to verify the bundled asset's structure
 */
async function inspectDatabase(dbFileName: string) {
  try {
    const db = await SQLite.openDatabaseAsync(dbFileName);
    const tables = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table';"
    );
    const tableNames = tables.map((t) => t.name);

    console.log('--- [DEBUG] ASSET INSPECTION ---');
    console.log(`Tables in bundled file: ${tableNames.join(', ')}`);

    if (tableNames.includes('products')) {
      const result = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM products`
      );
      console.log(`Table 'products' contains: ${result?.count} pre-baked rows.`);
    }
    await db.closeAsync();
  } catch (error) {
    console.error('[DB DEBUG] Inspection Error:', error);
  }
}

export async function setupDatabase(): Promise<Database> {
  const sqliteDir = new Directory(Paths.document, 'SQLite');
  const dbFile = new File(sqliteDir, DB_NAME);

  // 1. Prepopulation Logic: Copy from Assets if it doesn't exist on disk
  if (!dbFile.exists) {
    try {
      console.log(`[DB] First launch: Prepopulating from local assets...`);

      if (!sqliteDir.exists) sqliteDir.create();

      // Load the file from your project's assets folder
      // Make sure the file is actually at ./assets/watermelon.db
      const asset = Asset.fromModule(require('@/assets/watermelon.db'));
      await asset.downloadAsync();

      if (!asset.localUri) {
        throw new Error("Failed to get local URI for bundled database asset.");
      }

      // Copy the asset to the app's internal SQLite directory
      const assetFile = new File(asset.localUri);
      await assetFile.copy(dbFile);

      console.log(`[DB] Successfully copied asset to: ${dbFile.uri}`);

      // RUN NATIVE INSPECTION
      await inspectDatabase(DB_NAME);

    } catch (error: any) {
      console.error("[DB] Prepopulation failed:", error);
      if (dbFile.exists) dbFile.delete();
      throw new Error(`Failed to initialize bundled data: ${error.message}`);
    }
  }

  // 2. Initialize WatermelonDB Adapter
  const adapter = new SQLiteAdapter({
    schema: mySchema,
    dbName: 'watermelon', // Appends .db automatically
    jsi: true, // Recommended for performance [cite: 167, 200]
    onSetUpError: (error) => {
      console.error("WatermelonDB Setup Error:", error);
    }
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
    console.error("[initDB] critical error:", error);
    throw error;
  }
};
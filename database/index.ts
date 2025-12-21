import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { mySchema } from '@/model/schema';
import Product from '../model/product';

// 1. Create the adapter
const adapter = new SQLiteAdapter({
  schema: mySchema,
  jsi: true,            // High performance mode
  dbName: 'watermelon', // This creates 'watermelon.db'
});

// 2. Export the database instance directly
// This ensures that 'import { database }' is never undefined
export const database = new Database({
  adapter,
  modelClasses: [Product],
});
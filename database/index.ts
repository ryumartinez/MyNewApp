import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import Product from "@/database/product";
import {mySchema} from "@/database/schema";
import migrations from "@/database/migrations";
import ProductBatch from "@/database/productBatch";

// 1. Create the adapter
const adapter = new SQLiteAdapter({
  schema: mySchema,
  migrations,
  jsi: true,            // High performance mode
  dbName: 'watermelon', // This creates 'watermelon.db'
});

// 2. Export the database instance directly
// This ensures that 'import { database }' is never undefined
export const database = new Database({
  adapter,
  modelClasses: [Product, ProductBatch]
});
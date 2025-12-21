import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const mySchema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'products',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'price', type: 'number' }, // Changed to string to match your SQL 'TEXT' type
        { name: 'sku', type: 'string' }
      ],
    }),
  ],
});
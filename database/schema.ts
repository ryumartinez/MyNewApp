import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const mySchema = appSchema({
  version: 1, // Incremented version because columns changed
  tables: [
    tableSchema({
      name: 'products',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'item_id', type: 'string', isIndexed: true },
        { name: 'bar_code', type: 'string', isIndexed: true },
        { name: 'brand_code', type: 'string' },
        { name: 'brand_name', type: 'string' },
        { name: 'color_code', type: 'string' },
        { name: 'color_name', type: 'string' },
        { name: 'size_code', type: 'string' },
        { name: 'size_name', type: 'string' },
        { name: 'unit', type: 'string' },
        { name: 'data_area_id', type: 'string', isIndexed: true },
        { name: 'invent_dim_id', type: 'string' },
        { name: 'is_required_batch_id', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'product_batches',
      columns: [
        { name: 'data_area_id', type: 'string', isIndexed: true },
        { name: 'item_number', type: 'string', isIndexed: true },
        { name: 'batch_number', type: 'string', isIndexed: true },
        { name: 'vendor_batch_number', type: 'string', isOptional: true },
        { name: 'vendor_expiration_date', type: 'number', isOptional: true },
        { name: 'batch_expiration_date', type: 'number', isOptional: true },
      ],
    }),
  ],
});
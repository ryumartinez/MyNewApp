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
  ],
});
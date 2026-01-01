//@ts-nocheck

import { Model } from '@nozbe/watermelondb';
import { field, text } from '@nozbe/watermelondb/decorators';

export default class ProductBatch extends Model {
  static table = 'product_batches';

  @text('data_area_id') dataAreaId!: string;
  @text('item_number') itemNumber!: string;
  @text('batch_number') batchNumber!: string;

  @text('vendor_batch_number') vendor_batch_number?: string | null;

  // Using @field because these are stored as long (numbers) in .NET
  @field('vendor_expiration_date') vendor_expiration_date?: number | null;
  @field('batch_expiration_date') batch_expiration_date?: number | null;
}
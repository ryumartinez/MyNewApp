import { Model } from '@nozbe/watermelondb';
import { field, text, date } from '@nozbe/watermelondb/decorators';

export default class ProductBatch extends Model {
  static table = 'product_batches';

  // @ts-ignore
  @text('data_area_id') dataAreaId!: string;
  // @ts-ignore
  @text('item_number') itemNumber!: string;
  // @ts-ignore
  @text('batch_number') batchNumber!: string;

  // @ts-ignore
  @text('vendor_batch_number') vendorBatchNumber?: string;

  // Stored as Unix timestamps (numbers) in your .NET backend
  // @ts-ignore
  @field('vendor_expiration_date') vendorExpirationDate?: number;
  // @ts-ignore
  @field('batch_expiration_date') batchExpirationDate?: number;
}
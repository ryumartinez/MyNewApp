import { Model } from '@nozbe/watermelondb';
import { field, text } from '@nozbe/watermelondb/decorators';

export default class Product extends Model {
  static table = 'products';

  // @ts-ignore
  @text('name') name; // Trims whitespace automatically
  // @ts-ignore
  @field('price') price; // Guaranteed to be a number by the schema [cite: 401]
  // @ts-ignore
  @text('sku') sku;
}
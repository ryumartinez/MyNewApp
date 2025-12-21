import { Model } from '@nozbe/watermelondb';
import { field, text } from '@nozbe/watermelondb/decorators';

export default class Product extends Model {
  static table = 'products';

  // @ts-ignore
  @text('name') name!: string;
  // @ts-ignore
  @field('price') price!: number;
  // @ts-ignore
  @text('sku') sku!: string;
}
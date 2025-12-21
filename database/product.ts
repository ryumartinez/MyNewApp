import { Model } from '@nozbe/watermelondb';
import { field, text } from '@nozbe/watermelondb/decorators';

export default class Product extends Model {
  static table = 'products';

  // @ts-ignore
  @text('name') name!: string;
  // @ts-ignore
  @text('item_id') itemId!: string;
  // @ts-ignore
  @text('bar_code') barCode!: string;
  // @ts-ignore
  @text('brand_code') brandCode!: string;
  // @ts-ignore
  @text('brand_name') brandName!: string;
  // @ts-ignore
  @text('color_code') colorCode!: string;
  // @ts-ignore
  @text('color_name') colorName!: string;
  // @ts-ignore
  @text('size_code') sizeCode!: string;
  // @ts-ignore
  @text('size_name') sizeName!: string;
  // @ts-ignore
  @text('unit') unit!: string;
  // @ts-ignore
  @text('data_area_id') dataAreaId!: string;
  // @ts-ignore
  @text('invent_dim_id') inventDimId!: string;
  // @ts-ignore
  @field('is_required_batch_id') isRequiredBatchId!: boolean;
}
import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class Product extends Model {
  static table = 'products'
  // @ts-ignore
  @field('name') name: string
  // @ts-ignore
  @field('price') price: string
  // @ts-ignore
  @field('sku') sku: string
}
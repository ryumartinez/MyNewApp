import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class Product extends Model {
  static table = 'products'
  // @ts-ignore
  @field('name') name!: string
  // @ts-ignore
  @field('price') price!: number
  // @ts-ignore
  @field('sku') sku!: string
  // @ts-ignore
  @readonly @date('created_at') createdAt!: Date
  // @ts-ignore
  @readonly @date('updated_at') updatedAt!: Date
}
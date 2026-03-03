import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import User from '#models/user'


export default class Url extends BaseModel {

  @column({ isPrimary: true })
  declare id: number
   @column()
  declare originalUrl: string

  @column()
  declare shortCode: string

  @column()
  declare clicks: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
  @belongsTo(()=>User)
  declare user:BelongsTo<typeof User>
}

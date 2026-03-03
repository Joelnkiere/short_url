import  Url  from '#models/url';
import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column,hasMany} from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { HasMany } from '@adonisjs/lucid/types/relations'

// import Role from '#models/role'
// import Actualite from '#models/actualite'
// import Module from '#models/module'
// import Adress from '#models/adress'


const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  //  @hasOne(() => Role)
  // declare role: HasOne<typeof Role>
  @hasMany(()=>Url)
  declare urls:HasMany<typeof Url>
  //  @manyToMany(()=>Module,{pivotTable:'users_modules'})
  //  declare modules:ManyToMany <typeof Module>
  //  @hasOne(()=>Adress)
  //  declare adress:HasOne<typeof Adress>


  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}


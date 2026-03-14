import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    const user = await User.updateOrCreate(
      { email: 'admin@admin.com' },
      {
        name: 'Admin',
        password: 'password',
      }
    )

    await user.related('role').updateOrCreate(
      { userId: user.id },
      {
        name: 'ADMIN',
      }
    )
    
    console.log(`Admin user ${user.email} verified with role ADMIN`)
  }
}
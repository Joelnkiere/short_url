import type { HttpContext } from '@adonisjs/core/http'
import { registerValidator } from '#validators/register'
import { loginValidator } from '#validators/login'
import User from '#models/user'



export default class UsersController {
  async showRegister({ view }: HttpContext) {
    return view.render('pages/register')
  }

  async showLogin({ view }: HttpContext) {
    return view.render('pages/login')
  }


  async store({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)
    const user = await User.create(payload)

    await user.related('role').create({
      name: 'APPRENANTS',
    })

    session.flash('message', 'utilisateur enregisré avec succés')
    return response.redirect('/login')
  }

  async login({ request, response, auth, session }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    try {
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)
      return response.redirect('/urls')
    } catch (error) {
      session.flash('errors.message', 'Identifiants incorrects')
      return response.redirect('/login')
    }
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/')
  }
}

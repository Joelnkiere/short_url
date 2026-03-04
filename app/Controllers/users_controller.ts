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


  async store({ request, response, view }: HttpContext) {
    // const payload = request.only(['name', 'email', 'password'])
    try {
      const payload = await request.validateUsing(registerValidator)

      const newUser = await User.create(payload)

      return view.render('pages/login', { message: 'utilisateur enregisré avec succés', newUser })


    } catch (error) {
      const errors = error.messages ? error.messages : { message: 'Erreur de d\'enregistrement' }
      const fields: any = {}
      if (errors) {
        errors?.map(({ field, message }: any) => {
          fields[field] = message
        })
        return view.render('pages/register', { errors: errors, fields: fields || {} })
        return response.status(400).json({ errors: errors })

      }



    }
  }
  async login({ request, response, auth, view }: HttpContext) {
    try {
      // const { email, password } = await request.validateUsing(loginValidator)
      const { email, password } = await request.validateUsing(loginValidator)

      const user = await User.verifyCredentials(email, password)
      if (user) {
        await auth.use('web').login(user)
        return response.redirect('/login')
      }
      return view.render('pages/login', {
        errors: { message: 'utilisateur non trouvé, veillez vous inscrire' }
      })

    } catch (error) {
      const errors = error.messages ? error.messages : { message: 'erreur de validation' }
      const fields: any = {}
      if (error.messages) {
        error.messages?.map(({ field, message }: any) => {
          fields[field] = message
        })
        return view.render('pages/login', {
          errors: errors,
          fields: fields || {}
        })
      }
      return view.render('pages/login', {
        errors: errors,

      })


    }
  }
}

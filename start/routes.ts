
/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import UrlController from '#controllers/ul_controller'
import UsersController from '#controllers/users_controller'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
// import UrlController from '#Controllers/Http/UrlController'

// router.on('/').render('pages/home')

/*
  Exemples de routes pour l'Exercice "Raccourcisseur d'URL".
  Les lignes ci-dessous sont fournies en commentaire : copiez/activez-les
  dans ce fichier pour brancher vos controllers une fois implémentés.

  Étapes recommandées (ligne-par-ligne) :
  1) Définir la route qui affiche le formulaire (GET /)
    // router.methode de demande des données('/', 'UrlController.showForm')

  2) Définir la route qui reçoit le formulaire (POST /shorten)
    // router.methode d'envoie('/shorten', controller et méthode qui sera exécuté)

  3) Définir la route d'administration / listing (GET /admin)
    // router.methode de demande des données('/admin', controller et méthode qui sera exécuté)

  4) Définir la route dynamique de redirection (GET /:slug)
    // router.methode de demande des données('/:slug', 'UrlController.redirect')

  5) ajouter une route de suppression.
    // Exemple pédagogique (REMARQUE : ne pas forcer un chemin exact ici)
    // Déclarez une route DELETE en choisissant votre chemin :
    // router.delete('/urls/:slug', [UrlController, 'destroy'])
    // Important : le `action` et la `method` du formulaire de suppression
    // dans la view doivent correspondre exactement à la route choisie.

  Instructions supplémentaires :
  - Ne pas oublier d'importer correctement `UrlController` si vous
   changez la configuration par défaut. Les exemples ci-dessus suivent la
   convention Adonis (controller dans app/Controllers/Http/UrlController.ts).
  - Pour l'exercice pédagogique, vous pouvez laisser ces lignes commentées
   et implémenter progressivement les actions du controller avant d'activer
   chaque route.
*/

router.get('/', async ({ auth, response }) => {
  await auth.check()
  if (auth.isAuthenticated) {
    return response.redirect('/urls')
  }
  return response.redirect('/login')
})

router.get('/admin', [UrlController, 'adminIndex']).use(middleware.auth())

router.get('/register', [UsersController, 'showRegister']).use(middleware.guest())
router.post('/users', [UsersController, 'store']).use(middleware.guest())
router.get('/login', [UsersController, 'showLogin']).use(middleware.guest())
router.post('/login', [UsersController, 'login']).use(middleware.guest())
router.post('/logout', [UsersController, 'logout']).use(middleware.auth())

router.get('/qrcodes/:slug', [UrlController, 'qrCode'])
router.post('/shorten', [UrlController, 'store']).use(middleware.auth())
router.get('/urls', [UrlController, 'index']).use(middleware.auth())
router.delete('/urls/:slug', [UrlController, 'destroy']).use(middleware.auth())

router.get('/:slug', [UrlController, 'redirect'])

// édition / mise à jour d'une URL existante
// router.get('/urls/:slug/edit', [UrlController, 'edit'])
// router.put('/urls/:slug', [UrlController, 'update'])

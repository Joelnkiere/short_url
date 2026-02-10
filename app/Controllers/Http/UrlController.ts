/*
  UrlController.ts

  POUR  L'APPRENANT :
  - Ce fichier est volontairement entièrement commenté pour éviter toute
    erreur au lancement de l'application. Ne pas ajouter de code exécutable
    ici tant que vous n'êtes pas prêt à activer les routes.

  OBJECTIF DE L'EXERCICE :
  - Implémenter progressivement les actions d'un raccourcisseur d'URL.
  - Se concentrer sur les `views` et la logique métier (slug, validation, rendu).

  ROUTES RECOMMANDÉES (start/routes.ts) :
    // router.get('/', 'UrlController.showForm')    -> afficher formulaire
    // router.post('/shorten', 'UrlController.store') -> traiter POST
    // router.get('/admin', 'UrlController.index')   -> listing
    // router.get('/:slug', 'UrlController.redirect') -> redirection

  POUR CHAQUE MÉTHODE (instructions concises ) :

  showForm (GET /)
  - But : rendre la vue `url/index` et, si disponible, fournir `result`.
  - Étapes :
    1) Récupérer anciennes valeurs (flash) si besoin.
    2) Construire un objet `result` si vous venez de créer une URL.
    3) return view.render('url.index', { result })

  store (POST /shorten)
  - But : recevoir `url` depuis le formulaire, valider, générer slug, persister, afficher résultat.
  - Étapes :
    1) const original = request.input('url')  // input name = 'url'
    2) valider/normaliser (ajouter http(s) si absent)
    3) générer slug (ex : base62, ou hash tronqué)
    4) persister { slug, original } (ou stock mémoire pour l'exercice)
    5) const shortUrl = `${request.hostname()}/${slug}`
    6) const result = { originalUrl: original, shortUrl, slug, qrImageUrl }
    7) return view.render('url.index', { result })  // ou redirect

  index (GET /admin)
  - But : retourner la liste `urls` vers `url/list`.
  - Contrat : `urls` = [{ originalUrl, shortUrl, slug, qrImageUrl, createdAt, clicks }, ...]
  - Dans la view :
      @if(urls && urls.length)
        @each(url in urls) ... @endeach
      @else
        Aucun élément
      @endif

  redirect (GET /:slug)
  - But : rechercher `slug` et faire `response.redirect(originalUrl)`.
  - Si non trouvé : renvoyer 404 ou rediriger vers `/`.

  destroy / delete (DELETE)
  - But : supprimer une entrée (par exemple via `slug` ou identifiant) et rediriger.
  - Étapes pédagogiques :
    1) Récupérer l'identifiant / `slug` depuis `request.input('slug')` ou `params.slug` selon votre route.
    2) Vérifier l'autorisation si nécessaire (ex : protection CSRF déjà gérée par `@csrf`).
    3) Supprimer l'entrée du stockage (ou du tableau en mémoire pour l'exercice).
    4) Rediriger vers le listing ou renvoyer un message de confirmation.

  Remarque importante sur les routes et formulaires :
  - Si vous utilisez un formulaire HTML pour supprimer, la pratique courante est :
      <form action="<votre_chemin_de_suppression>" method="POST">
        @csrf
        <input type="hidden" name="_method" value="DELETE" />
        <input type="hidden" name="slug" value="..." />
        <button type="submit">Supprimer</button>
      </form>
    Le `action` du formulaire doit correspondre exactement à la route que vous définissez
    dans `start/routes.ts`. Dans votre route, acceptez la méthode DELETE.

  REMARQUES PRATIQUES / RESSOURCES :
  - Nommez l'input du formulaire `url` (cela correspondra à `request.input('url')`).
  - Pour inclure les fragments de view, utilisez `@include('url/index')` et `@include('url/list')`.
  - Documentation Adonis (views + routing) : https://docs.adonisjs.com/

  QUAND RÉ-ACTIVER CES MÉTHODES :
  - Dé-commentez et implémentez une méthode à la fois, puis dé-commentez la route
    correspondante dans `start/routes.ts`.
  - Testez avec `node ace serve --watch` et vérifiez le rendu.

  Exemple succinct (pour le formateur) :
    // public async store({ request, view }) {
    //   const original = request.input('url')
    //   // validation, slug, persistence...
    //
    //   // Exemple d'utilisation d'un helper `generateSlug` situé dans `app/Helpers`
    //   // Créez le fichier `app/Helpers/generateSlug.ts` et importez-le ainsi :
    //   // import generateSlug from 'App/Helpers/generateSlug'
    //   // const slug = generateSlug(6) // ex: 'a1B2c3'
    //   // const shortUrl = `${request.protocol()}://${request.hostname()}/${slug}`
    //   // const result = { originalUrl: original, shortUrl, slug }
    //   // return view.render('url.index', { result })
    // }

  FIN DU BLOC EXPLICATIF. Laissez ce fichier commenté tant que vous
  n'avez pas besoin d'exécuter le controller.
*/

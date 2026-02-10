Configuration (`.env`) et clé API
---------------------------------
Les apprenants doivent créer un fichier `.env` à la racine du projet pour définir
les variables d'environnement locales (ne pas committer ce fichier).

Étapes recommandées :

1. Copier l'exemple fourni (si présent) :

```bash
cp .env.example .env
```

2. Générer une clé d'application (`APP_KEY`) si elle est vide. Deux options :

- Utiliser la commande Ace (préférée si disponible) :

```bash
node ace generate:key
```

- Ou générer une clé aléatoire avec Node :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Collez la valeur obtenue dans `.env` comme `APP_KEY=`.

3. (Optionnel) Ajouter une `QR_API_KEY` si vous prévoyez d'utiliser un service externe
   pour générer les codes QR (ou tout autre service tiers). Exemple de fichier `.env` :

```env
APP_KEY=your_generated_app_key_here
HOST=127.0.0.1
PORT=3333
QR_API_KEY=your_qr_service_api_key_here
```

4. Ne pas committer `.env` dans le dépôt. Si vous souhaitez partager des valeurs
   non sensibles (ex : exemples), utilisez `.env.example`.

Pourquoi faire cela ?
- `APP_KEY` est utilisé par Adonis pour certaines opérations cryptographiques et doit
  être unique à chaque installation.
- `QR_API_KEY` est un exemple : il permet aux apprenants d'expérimenter l'appel à un
  service externe sans stocker la clé dans le dépôt.


Besoin d'aide pour automatiser la création du `.env` dans un script `npm` ? Je peux
fournir un court script `setup` qui crée `.env` et génère `APP_KEY` automatiquement.

Génération et affichage des QR codes
-----------------------------------
Les apprenants auront besoin de générer et d'afficher des codes QR pour chaque URL courte.
Voici une approche simple (locale) et une alternative via un service externe.

1) Installation (package recommandé)

```bash
# dans le dossier du projet
npm install qrcode
```

2) Générer un QR sous forme de data URI (affichage immédiat dans la view)

Exemple (extrait TypeScript à mettre dans `UrlController.store` ou à faire après génération du slug) :

```ts
import QRCode from 'qrcode'
import generateSlug from 'App/Helpers/generateSlug' // importation de generateSlug depuis Helpers car c'est là qu'il est créer. Nota : cette fonction est un exemple voous avez le choix de concevoir votre generateur de slug si vous le souhaité. 

// exemple dans la méthode store
const original = request.input('url')
// ... validation / normalisation de `original` ...

// génération du slug via le helper
const slug = generateSlug()
const shortUrl = `${request.protocol()}://${request.hostname()}/${slug}`

// Génère un Data URI (PNG) que l'on peut envoyer à la view
const qrDataUrl = await QRCode.toDataURL(shortUrl, { width: 256 })

const result = { originalUrl: original, shortUrl, slug, qrDataUrl }
return view.render('url.index', { result })

// === Version robuste : gestion d'erreur autour de l'appel asynchrone ===
// Les services de génération (même la lib locale `qrcode`) font des opérations
// asynchrones qui peuvent échouer. Utiliser `try/catch` évite de casser la route
// et permet d'afficher une interface de repli (ex: pas d'image, message ou
// image placeholder).

let qrDataUrl = null
try {
  qrDataUrl = await QRCode.toDataURL(shortUrl, { width: 256 })
} catch (err) {
  // En environnement pédagogique : loggez et continuez sans QR
  // En production : vous pouvez réessayer, alerter un monitoring ou générer
  // une image placeholder.
  console.error('QR generation failed:', err)
  qrDataUrl = null
}

const result = { originalUrl: original, shortUrl, slug, qrDataUrl }
return view.render('url.index', { result })
```

Dans la view Edge (`resources/views/url/index.edge`) :

```html
@if(result)
  <img src="{{ result.qrDataUrl }}" alt="QR code" style="width:72px;height:72px" />
@endif
```

Explications détaillées (ligne‑par‑ligne)
-------------------------------------
- `original` : valeur récupérée depuis le formulaire (`request.input('url')`). Exemples : `https://example.com/page`, `http://localhost:3000/test`.
- `slug` : chaîne courte issue de votre algorithme (ex : `abc123`). Doit être URL‑safe (alphanumérique, sans espaces). Exemple d'utilisation : `slug = generateSlug()` → `abc123`.
- `request.hostname()` : valeur extraite de la requête HTTP qui représente le nom d'hôte demandé par le client. En développement typique cela vaut `localhost` ou `localhost:3333` (selon comment vous démarrez le serveur). En production, ce sera votre domaine (ex : `example.com` ou `app.example.com`). Ainsi `const shortUrl = `${request.hostname()}/${slug}`` produit des valeurs comme `localhost:3333/abc123` ou `example.com/abc123`.
- `shortUrl` : URL complète que vous souhaitez encoder dans le QR (ex : `https://example.com/abc123` ou `http://localhost:3333/abc123`). Note : si vous utilisez `request.hostname()` seul, pensez à inclure le protocole (`http://` ou `https://`) si nécessaire :
  `const shortUrl = `${request.protocol()}://${request.hostname()}/${slug}``.
- `QRCode.toDataURL(shortUrl)` : renvoie une `Promise<string>` résolue par un Data URI (ex: `data:image/png;base64,iVBORw0KG...`) prêt à être placé dans `src` d'une balise `<img>`.
- `qrDataUrl` : la chaîne Data URI renvoyée par `QRCode.toDataURL`. Dans la view, utilisez ` <img src="{{ result.qrDataUrl }}" /> ` pour afficher l'image sans écrire de fichier disque.

Remarques et exemples concrets
------------------------------
- Exemple concret de `shortUrl` en développement :
  - `request.protocol()` → `http`
  - `request.hostname()` → `localhost:3333`
  - `slug` → `abcd12`
  - `shortUrl` → `http://localhost:3333/abcd12`

- Exemple concret en production :
  - `request.protocol()` → `https`
  - `request.hostname()` → `app.monsite.com`
  - `slug` → `x9y8z7`
  - `shortUrl` → `https://app.monsite.com/x9y8z7`

- `qrDataUrl` début typique : `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...` (très long). Placez-le directement dans `src` d'une `<img>`.

- Si vous sauvegardez un fichier PNG (`QRCode.toFile`), la variable `outPath` est le chemin absolu sur le serveur (ex: `/Users/you/project/public/qrcodes/abcd12.png`) et `qrImageUrl` est la route publique correspondante (ex: `/qrcodes/abcd12.png`). Assurez‑vous que le dossier `public/qrcodes` existe et est accessible en écriture.

- Option `width` dans `toFile` ou `toDataURL` contrôle la taille (en pixels) du PNG généré. Exemple : `{ width: 256 }` donne une image 256×256.

- Sécurité : n'écrivez pas de fichiers dans un dossier non prévu, nettoyez les images temporaires si nécessaire, et ne commettez jamais de clés API dans le dépôt.

3) Sauvegarder un fichier PNG dans `public/` (optionnel)

Si vous préférez créer un fichier image accessible via une URL (ex: `/qrcodes/slug.png`), utilisez :

```ts
import { join } from 'path'
import QRCode from 'qrcode'

const outPath = join(process.cwd(), 'public', 'qrcodes', `${slug}.png`)
await QRCode.toFile(outPath, shortUrl, { width: 256 })
const qrImageUrl = `/qrcodes/${slug}.png`
const result = { originalUrl: original, shortUrl, slug, qrImageUrl }
```

Puis dans la view :

```html
<img src="{{ result.qrImageUrl }}" alt="QR code" />
```

Note : Adonis sert par défaut le dossier `public/`. Assurez-vous que le dossier `public/qrcodes` existe
et est accessible. Donnez les droits d'écriture si vous générez des fichiers depuis le serveur.




5. installation des packages.
  pour installer les packages faire npm install. puis lancé pour voir les interface. 







# AtExercice — Raccourcisseur d'URL (starter pédagogique)

Ce dépôt contient une base AdonisJS créée avec le scaffold officiel. L'objectif pédagogique est de permettre aux apprenants de se concentrer sur les *views*, *controllers* et *routes* sans gérer la persistence avancée.

Fichiers ajoutés pour l'exercice :
- `resources/views/layout.edge` (layout de base n'y touché rien)
- `resources/views/url/index.edge` (formulaire + exemple de résultat)
- `resources/views/url/list.edge` (listing d'exemples)
- `app/Controllers/Http/UrlController.ts` (stub commenté — implémenter ici)
- `start/routes.ts` (exemples de routes commentées)

Consignes claires (à suivre par les apprenants)

1) Routes (start/routes.ts)
  - Décommentez / ajoutez les routes suivantes une fois le controller prêt :
    - `GET /` → `UrlController.showForm` (rendre `resources/views/url/index.edge`)
    - `POST /shorten` → `UrlController.store` (traiter la création)
    - `GET /admin` → `UrlController.index` (rendre `resources/views/url/list.edge`)
    - `GET /:slug` → `UrlController.redirect` (redirection vers l'URL d'origine)

2) Controllers (app/Controllers/Http/UrlController.ts)
  - Chaque méthode contient des instructions ligne-par-ligne (commentées). Suivez l'ordre :
    - `showForm` : préparer/afficher `result` si présent
    - `store` : récupérer `request.input('url')`, valider, normaliser, générer slug, persister (ou simuler), construire `shortUrl` et `qrImageUrl`, rendre ou rediriger
    - `index` : récupérer toutes les entrées et rendre la view `url.list`
    - `redirect` : chercher le slug et `response.redirect(originalUrl)` si trouvé, sinon 404

3) Views (resources/views/url/*)
  - Les fichiers contiennent du HTML/CSS prêt à l'emploi et des placeholders d'exemple.
  - POUR LES FORMULAIRES : Lisez les instructions en tête de `index.edge` — vous devez récupérer `request.input('url')` côté controller.
  - POUR L'AFFICHAGE DES DONNÉES : remplacez les blocs d'exemple par vos données réelles ; les fichiers indiquent exactement à quelles valeurs se substituer (ex : `result.originalUrl`, `result.shortUrl`, `result.qrImageUrl`).
  - NB : les syntaxes Edge (`@if`, `@each`) ne sont pas ajoutées ici volontairement : inscrivez les boucles/conditions vous-même en suivant les commentaires d'emplacement.

Checklist rapide pour valider l'exercice
- Soumettre une URL → voir l'URL courte affichée (structure `shortUrl` correcte).
- Afficher un QR (image ou URL d'image) pour chaque URL courte.
- Listing (GET /admin) montre les entrées (ou exemples si non persisté).

Si vous voulez que je :
- fournisse un exemple d'algorithme de génération de slug (différentes approches), ou
- ajoute des tests unitaires simples pour les controllers,
dites lequel et je l'ajoute comme fichier séparé (ex : `docs/slug-algos.md`).


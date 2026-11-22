# Site de mariage — thème vert & or

Site animé (sans serveur), déployable sur Vercel en quelques minutes.
Le formulaire de présence écrit directement dans un Google Sheet.

```
index.html                  la page
css/style.css               le style (thème vert & or)
js/config.js       ← le SEUL fichier à modifier au quotidien
js/main.js                  animations, galerie, compte à rebours, formulaire
google-apps-script/Code.gs  script à coller dans Google Sheets
assets/photos/              tes photos (à ajouter)
assets/qr/                  le QR code de l'hôtel (à ajouter)
```

---

## Étape 1 — Personnaliser le contenu

Ouvre `js/config.js` et remplace tout ce qui est marqué `TODO` :
prénoms, date, lieu, programme, nom de l'hôtel, date limite de réponse, contact.

C'est le seul fichier à toucher. Le reste du site se met à jour tout seul.

---

## Étape 2 — Connecter le formulaire au Google Sheet

1. Crée un Google Sheet vide (nomme-le « RSVP Mariage »).
2. Dans ce Sheet : **Extensions → Apps Script**.
3. Supprime le code présent, colle tout le contenu de `google-apps-script/Code.gs`, puis **Enregistrer** (💾).
4. **⚠️ Étape à ne pas sauter** — lance la fonction d'installation une fois :
   en haut de l'éditeur, choisis la fonction **`installer`** dans le menu déroulant,
   puis clique **▶ Exécuter**. Autorise l'accès quand Google le demande
   (« Paramètres avancés → Accéder à … » : c'est normal, le script est le tien).
   Cela enregistre ta feuille et crée l'onglet **Réponses** avec ses colonnes.
5. Clique **Déployer → Nouveau déploiement**.
   - Type : **Application Web**
   - Exécuter en tant que : **Moi**
   - Qui a accès : **Tout le monde** ← indispensable, sinon les invités ne peuvent pas envoyer
6. Copie l'**URL de l'application web** (elle finit par `/exec`).
7. Colle-la dans `js/config.js` :

```js
rsvpEndpoint: "https://script.google.com/macros/s/AKfy.../exec",
```

**Vérifier que l'écriture marche** — ajoute `?test=1` à la fin de ton URL et ouvre-la
dans le navigateur :

```
https://script.google.com/macros/s/AKfy.../exec?test=1
```

Tu dois voir `{"ok":true,"message":"Ligne de test écrite..."}` **et** une ligne
« TEST (ligne à supprimer) » apparaître dans l'onglet Réponses. Supprime-la ensuite.
Si tu vois `{"ok":false,"error":...}`, l'erreur t'indique quoi corriger.

Colonnes créées :

| Date | Contact | Email | Nb adultes | Nb enfants | Total | Adultes | Enfants | Allergies | Message |

> Tant que `rsvpEndpoint` est vide, le formulaire tourne en **mode démo** :
> il affiche bien l'écran de remerciement mais n'enregistre rien.

**Recevoir un email à chaque réponse** (facultatif) : dans le Sheet,
**Outils → Règles de notification → M'avertir immédiatement**.

**Important** : si tu modifies `Code.gs` plus tard, refais
**Déployer → Gérer les déploiements → ✏️ (crayon) → Version : Nouvelle version → Déployer**,
sinon l'ancienne version reste active.

---

## Étape 2 bis — Le tableau de bord privé des mariés

Une page élégante (`admin.html`) affiche les réponses aux couleurs du mariage :
compteurs (invités, adultes, enfants), récap des allergies, tableau détaillé et
export CSV. Elle est protégée par un mot de passe.

**1. Définir le mot de passe** (une seule fois, dans les réglages Google — jamais dans le code) :
   - Dans l'éditeur Apps Script, clique l'icône **⚙️ Paramètres du projet** (colonne de gauche).
   - Descends à **Propriétés du script → Ajouter une propriété du script**.
   - Propriété : `ADMIN_KEY` — Valeur : *le mot de passe de ton choix* → **Enregistrer**.

**2. Redéployer** le script (il contient désormais la fonction « liste ») :
   **Déployer → Gérer les déploiements → ✏️ → Nouvelle version → Déployer**.

**3. Accéder au tableau de bord** : ouvre `admin.html` de ton site, par ex.
   `https://nicolas9696-admin.github.io/Mariage_A-Z/admin.html`, et saisis le mot de passe.

> La page `admin.html` n'est reliée à aucun menu du site : les invités ne tombent
> jamais dessus. Seuls ceux qui ont le lien **et** le mot de passe voient les réponses.
> Pour changer le mot de passe plus tard, modifie la valeur de `ADMIN_KEY` dans les
> Propriétés du script (aucun redéploiement nécessaire).

---

## Étape 2 ter — La page des maîtres de cérémonie

Les invités peuvent cocher « Je souhaite préparer une animation/surprise » et décrire
leur idée. Ces demandes vont dans un onglet séparé **« Animations »** et sont
**invisibles pour les mariés** (les surprises restent secrètes). Une page dédiée
`ceremonie.html`, avec **son propre mot de passe**, les affiche pour les maîtres
de cérémonie.

1. **Mot de passe des maîtres de cérémonie** : dans Apps Script → **⚙️ Paramètres du
   projet → Propriétés du script → Ajouter**, propriété `CEREMONIE_KEY`, valeur = un
   mot de passe (différent de celui des mariés).
2. **Redéployer** le script (Déployer → Gérer les déploiements → ✏️ → Nouvelle version).
3. Les maîtres de cérémonie ouvrent `ceremonie.html`, ex.
   `https://nicolas9696-admin.github.io/Mariage_A-Z/ceremonie.html`, et saisissent ce mot de passe.

> L'onglet « Animations » se crée tout seul à la première demande.
> Résumé des trois accès : le **site** (public), `admin.html` (mariés, `ADMIN_KEY`),
> `ceremonie.html` (maîtres de cérémonie, `CEREMONIE_KEY`).

---

## Étape 2 quater — Réserver le formulaire aux invités de la liste

Avant d'ouvrir le formulaire, l'invité tape son prénom. S'il n'est pas sur la liste,
le formulaire reste fermé. À l'envoi, **chaque** personne inscrite (adultes et enfants)
est revérifiée, et le script refuse aussi tout envoi qui contournerait la page.
Les majuscules, accents, espaces et tirets sont ignorés (« anne lise » = « Annelise »).

La liste reste **privée** : elle vit dans le Google Sheet, jamais dans le code du site.

1. Dans le Google Sheet : ajoute un onglet nommé exactement **`Invités`**.
2. Mets-y une colonne avec l'en-tête **`Prénom`** (dans les 10 premières lignes) et un prénom
   par ligne en dessous. Les autres colonnes (Groupe…) sont ignorées.
   Le plus simple : **Fichier → Importer → Importer** le fichier Excel des invités,
   option « Insérer une ou plusieurs feuilles ».
3. Surnoms : si quelqu'un risque de taper « Fred » au lieu de « Frederic », ajoute une ligne « Fred ».
4. Recolle `google-apps-script/Code.gs` dans Apps Script, puis
   **Déployer → Gérer les déploiements → ✏️ → Version : Nouvelle version → Déployer**
   (l'URL `/exec` ne change pas).

Pour ajouter ou retirer un invité plus tard : modifie l'onglet `Invités`, c'est immédiat.

> ⚠️ Sans l'onglet `Invités`, personne ne peut s'inscrire (message « Vérification impossible »).

---

## Étape 3 — Ajouter les photos

1. Mets tes images dans `assets/photos/` (format `.jpg`, largeur ~1600 px, compressées).
2. Liste-les dans `js/config.js` :

```js
photos: [
  { src: "assets/photos/01.jpg", alt: "Nos fiançailles" },
  { src: "assets/photos/02.jpg", alt: "Week-end en Provence" },
],
```

Tant que la liste est vide, des cadres « Photo à venir » s'affichent.
La galerie a un affichage plein écran au clic (flèches ← → et Échap).

---

## Étape 4 — Ajouter le QR code de l'hôtel

Mets l'image dans `assets/qr/hotel.png`, puis dans `js/config.js` :

```js
hotel: {
  nom: "Hôtel du Domaine",
  qrImage: "assets/qr/hotel.png",
  qrLien: "https://…",     // utile : sur mobile on ne peut pas scanner son propre écran
  telephone: "05 56 00 00 00"
}
```

Le `qrLien` est vivement conseillé : un invité qui consulte le site depuis son
téléphone ne peut pas scanner le QR code affiché sur ce même téléphone.

---

## Étape 5 — Mettre en ligne sur Vercel

**Le plus simple (sans Git) :**

1. Va sur [vercel.com](https://vercel.com) et crée un compte gratuit.
2. Installe l'outil puis, depuis le dossier du projet :

```bash
npm i -g vercel
vercel
```

Réponds aux questions (accepte les valeurs par défaut), puis `vercel --prod`
pour la mise en production. Aucun réglage de build : c'est du HTML/CSS/JS.

**Avec GitHub** (recommandé si tu veux mettre à jour souvent) : pousse le dossier
sur un dépôt GitHub, puis sur Vercel « Add New → Project → Import ».
Chaque `git push` redéploie le site automatiquement.

Tu obtiens une URL du type `mariage-az.vercel.app`. Tu peux brancher un
nom de domaine perso dans **Settings → Domains**.

---

## Aperçu en local

Double-clique `index.html` — ça suffit pour tout voir.
Pour être au plus proche du site en ligne :

```bash
npx serve .
```

---

## Ce que contient le site

- Écran d'ouverture avec monogramme
- Hero animé, motif de feuilles doré en mouvement, compte à rebours en direct
- Apparition des blocs au défilement, menu fixe et menu mobile plein écran
- Cartes « Quand / Où / Dress code » avec lien Google Maps
- Programme en frise chronologique
- Galerie avec vue plein écran
- Section hébergement avec QR code encadré
- Formulaire de présence : nom + prénom, email, présent ou non,
  compteurs adultes / enfants, prénoms des invités, allergies et intolérances,
  petit mot — validation en français et écran de remerciement animé
- Respecte `prefers-reduced-motion` (animations coupées si l'invité l'a demandé)

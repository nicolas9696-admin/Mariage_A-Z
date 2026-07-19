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
3. Supprime le code présent, colle tout le contenu de `google-apps-script/Code.gs`, puis **Enregistrer**.
4. Clique **Déployer → Nouveau déploiement**.
   - Type : **Application Web**
   - Exécuter en tant que : **Moi**
   - Qui a accès : **Tout le monde** ← indispensable, sinon les invités ne peuvent pas envoyer
5. Autorise l'accès quand Google le demande (passe par « Paramètres avancés → Accéder à … » : c'est normal, le script est le tien).
6. Copie l'**URL de l'application web** (elle finit par `/exec`).
7. Colle-la dans `js/config.js` :

```js
rsvpEndpoint: "https://script.google.com/macros/s/AKfy.../exec",
```

Pour vérifier : ouvre cette URL dans ton navigateur, tu dois voir
`{"ok":true,"message":"Le script du mariage fonctionne."}`.

L'onglet « Réponses » et ses colonnes sont créés automatiquement à la première réponse :

| Date | Nom et prénom | Email | Présence | Nb adultes | Nb enfants | Total | Prénoms | Allergies | Message |

> Tant que `rsvpEndpoint` est vide, le formulaire tourne en **mode démo** :
> il affiche bien l'écran de remerciement mais n'enregistre rien.

**Recevoir un email à chaque réponse** (facultatif) : dans le Sheet,
**Outils → Règles de notification → M'avertir immédiatement**.

**Important** : si tu modifies `Code.gs` plus tard, refais
**Déployer → Gérer les déploiements → ✏️ → Version : Nouvelle version**,
sinon l'ancienne version reste active.

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

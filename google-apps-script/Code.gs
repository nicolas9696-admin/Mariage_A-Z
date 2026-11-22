/* =====================================================================
   GOOGLE APPS SCRIPT — mariage A & Z
   - reçoit les réponses du formulaire (doPost)
   - fournit les réponses au tableau de bord privé (doGet ?action=list)

   À coller dans Extensions > Apps Script depuis TON Google Sheet.
   Voir README.md, étape 2.
   ===================================================================== */

var ONGLET = 'Réponses';
var ONGLET_ANIM = 'Animations';
var ONGLET_LISTE = 'Invités';     // liste des prénoms autorisés à s'inscrire (privée)   // demandes des invités, réservées aux maîtres de cérémonie

var ENTETES_ANIM = [
  'Date',
  'Invité',
  'Email',
  'Téléphone',
  "Idée d'animation / surprise"
];

var ENTETES = [
  'Date de réponse',
  'Contact',
  'Email',
  'Téléphone',
  'Adresse',
  'Nb adultes',
  'Nb enfants',
  'Total personnes',
  'Hébergement hôtel',
  'Adultes (dès 10 ans)',
  'Enfants (2 à 10 ans)',
  'Allergies / intolérances',
  'Message'
];

/* --------------------------------------------------------------- POST */
/* Appelé par le formulaire du site. */
function doPost(e) {
  var verrou = LockService.getScriptLock();
  verrou.waitLock(20000);

  try {
    var d = (e && e.postData && e.postData.contents)
      ? JSON.parse(e.postData.contents)
      : {};

    if (d.onlyAnimation) {
      // Demande venant du formulaire d'animation séparé -> onglet Animations seul
      ecrireAnimation_(d);
    } else {
      // Seules les personnes de la liste « Invités » peuvent s'inscrire
      var refuses = personnesHorsListe_(d);
      if (refuses.length) {
        return json_({ ok: false, error: 'Hors liste : ' + refuses.join(', ') });
      }
      ecrireLigne_(d);
      // (sécurité) si une animation arrive avec une présence, on la range aussi à part
      if (d.animation && String(d.animation).trim()) ecrireAnimation_(d);
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    verrou.releaseLock();
  }
}

/* ---------------------------------------------------------------- GET */
/* Usages :
   - ?action=list&key=MOT_DE_PASSE   -> renvoie les réponses (pour le tableau de bord)
   - ?action=verifier&prenoms=[...]  -> prénoms absents de la liste « Invités »
   - ?test=1                         -> écrit une ligne de test
   - (rien)                          -> message de bon fonctionnement
   Le paramètre &callback=xxx active le JSONP (évite les blocages CORS). */
function doGet(e) {
  var p = (e && e.parameter) ? e.parameter : {};

  // --- Données pour le tableau de bord des mariés ---
  if (p.action === 'list') {
    if (p.key !== getCle_('ADMIN_KEY')) {
      return sortie_({ ok: false, error: 'Mot de passe incorrect.' }, p.callback);
    }
    try {
      return sortie_({ ok: true, invites: lireReponses_() }, p.callback);
    } catch (err) {
      return sortie_({ ok: false, error: String(err) }, p.callback);
    }
  }

  // --- Vérifie que des prénoms sont sur la liste des invités ---
  //     ?action=verifier&prenoms=["Anaé","Zachary"]  -> { ok, inconnus: [...] }
  if (p.action === 'verifier') {
    try {
      var autorises = prenomsAutorises_();
      var demandes = JSON.parse(p.prenoms || '[]');
      var inconnus = demandes.filter(function (x) {
        return !autorises[normaliser_(x)];
      });
      return sortie_({ ok: true, inconnus: inconnus }, p.callback);
    } catch (err) {
      return sortie_({ ok: false, error: String(err) }, p.callback);
    }
  }

  // --- Demandes d'animation pour les maîtres de cérémonie ---
  if (p.action === 'animations') {
    if (p.key !== getCle_('CEREMONIE_KEY')) {
      return sortie_({ ok: false, error: 'Mot de passe incorrect.' }, p.callback);
    }
    try {
      return sortie_({ ok: true, animations: lireAnimations_() }, p.callback);
    } catch (err) {
      return sortie_({ ok: false, error: String(err) }, p.callback);
    }
  }

  // --- Test d'écriture ---
  if (p.test === '1') {
    try {
      var test = {
        date: new Date().toLocaleString('fr-FR'),
        nom: 'TEST (ligne à supprimer)', email: 'test@exemple.com',
        telephone: '079 000 00 00', adresse: 'Rue de Test 1, 1000 Lausanne, Suisse',
        adultes: 2, enfants: 1, hotel: 'Oui, va réserver',
        listeAdultes: 'Adulte Un, Adulte Deux', listeEnfants: 'Enfant Un (5 ans)',
        allergies: 'aucune', message: 'Écriture de test réussie ✔',
        animation: 'TEST — discours surprise (à supprimer)'
      };
      ecrireLigne_(test);
      ecrireAnimation_(test);
      return sortie_({ ok: true, message: "Lignes de test écrites (Réponses + Animations)." }, p.callback);
    } catch (err) {
      return sortie_({ ok: false, error: String(err) }, p.callback);
    }
  }

  return sortie_({ ok: true, message: 'Le script du mariage fonctionne.' }, p.callback);
}

/* ------------------------------------------- Liste des invités autorisés */
/* Onglet « Invités » du Google Sheet : une colonne dont l'en-tête est « Prénom »
   (cherché dans les 10 premières lignes). Chaque prénom en dessous est autorisé.
   Majuscules, accents, espaces et tirets sont ignorés : « anne lise » = « Anne-Lise ».
   Pour ajouter un surnom (« Fred » en plus de « Frederic »), ajoute simplement une ligne. */
function prenomsAutorises_() {
  var feuille = ouvrirClasseur_().getSheetByName(ONGLET_LISTE);
  if (!feuille || feuille.getLastRow() === 0) {
    throw new Error("Onglet « " + ONGLET_LISTE + " » introuvable ou vide dans le Google Sheet.");
  }
  var valeurs = feuille.getDataRange().getValues();
  var ligneEntete = -1, col = -1;
  for (var r = 0; r < Math.min(10, valeurs.length) && col < 0; r++) {
    for (var c = 0; c < valeurs[r].length; c++) {
      if (normaliser_(valeurs[r][c]) === 'prenom') { ligneEntete = r; col = c; break; }
    }
  }
  if (col < 0) throw new Error("Colonne « Prénom » introuvable dans l'onglet « " + ONGLET_LISTE + " ».");

  var autorises = {};
  for (var i = ligneEntete + 1; i < valeurs.length; i++) {
    var n = normaliser_(valeurs[i][col]);
    if (n) autorises[n] = true;
  }
  return autorises;
}

/* « Anaé-Lou » -> « anaelou » */
function normaliser_(v) {
  return String(v == null ? '' : v)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z]/g, '');
}

/* Personnes d'une réponse dont le prénom n'est pas sur la liste.
   Chaque personne est « Prénom Nom » (enfants : « Prénom Nom (5 ans) ») :
   on accepte si le 1er mot, ou les 2-3 premiers mots (prénoms composés), sont sur la liste. */
function personnesHorsListe_(d) {
  var autorises = prenomsAutorises_();
  var personnes = [].concat(
    String(d.listeAdultes || '').split(','),
    String(d.listeEnfants || '').split(',')
  ).map(function (x) { return x.trim(); }).filter(String);

  if (!personnes.length) return ['(aucun nom)'];

  return personnes.filter(function (pers) {
    var mots = pers.replace(/\(.*\)/, '').trim().split(/\s+/);
    for (var k = 1; k <= Math.min(3, mots.length); k++) {
      if (autorises[normaliser_(mots.slice(0, k).join(' '))]) return false;
    }
    return true;
  });
}

/* ------------------------------------------------ Lecture des réponses */
function lireReponses_() {
  var feuille = getFeuille_();
  var dernier = feuille.getLastRow();
  if (dernier < 2) return [];                 // seulement l'en-tête
  var valeurs = feuille.getRange(2, 1, dernier - 1, ENTETES.length).getValues();

  return valeurs.map(function (r) {
    return {
      date: fmtDate_(r[0]),
      contact: String(r[1] || ''),
      email: String(r[2] || ''),
      telephone: String(r[3] || ''),
      adresse: String(r[4] || ''),
      adultes: Number(r[5]) || 0,
      enfants: Number(r[6]) || 0,
      total: Number(r[7]) || 0,
      hotel: String(r[8] || ''),
      listeAdultes: String(r[9] || ''),
      listeEnfants: String(r[10] || ''),
      allergies: String(r[11] || ''),
      message: String(r[12] || '')
    };
  });
}

/* ------------------------------------------- Lecture des animations */
function lireAnimations_() {
  var feuille = getFeuilleAnim_();
  var dernier = feuille.getLastRow();
  if (dernier < 2) return [];
  var valeurs = feuille.getRange(2, 1, dernier - 1, ENTETES_ANIM.length).getValues();
  return valeurs.map(function (r) {
    return {
      date: fmtDate_(r[0]),
      contact: String(r[1] || ''),
      email: String(r[2] || ''),
      telephone: String(r[3] || ''),
      animation: String(r[4] || '')
    };
  });
}

/* --------------------------------------------------- Écriture commune */
function ecrireAnimation_(d) {
  var feuille = getFeuilleAnim_();
  feuille.appendRow([
    d.date || new Date().toLocaleString('fr-FR'),
    d.nom || '', d.email || '', '',   // téléphone (col 4) posé juste après
    d.animation || ''
  ]);
  feuille.getRange(feuille.getLastRow(), 4).setNumberFormat('@').setValue(String(d.telephone || ''));
}

function ecrireLigne_(d) {
  var feuille = getFeuille_();
  var adultes = Number(d.adultes) || 0;
  var enfants = Number(d.enfants) || 0;

  feuille.appendRow([
    d.date || new Date().toLocaleString('fr-FR'),
    d.nom || '', d.email || '', '', d.adresse || '',   // téléphone (col 4) posé juste après
    adultes, enfants, adultes + enfants, d.hotel || '',
    d.listeAdultes || '', d.listeEnfants || '',
    d.allergies || '', d.message || ''
  ]);
  // téléphone forcé en texte sur la ligne écrite -> préserve le 0 et +33/+213 à coup sûr
  feuille.getRange(feuille.getLastRow(), 4).setNumberFormat('@').setValue(String(d.telephone || ''));
}

function getFeuille_() {
  var classeur = ouvrirClasseur_();
  var feuille = classeur.getSheetByName(ONGLET);
  if (!feuille) feuille = classeur.insertSheet(ONGLET);

  // (Re)crée les en-têtes s'ils manquent OU ne correspondent plus (ancienne structure).
  if (!entetesCorrects_(feuille, ENTETES)) {
    feuille.clear();
    feuille.appendRow(ENTETES);
    feuille.getRange(1, 1, 1, ENTETES.length)
      .setFontWeight('bold').setBackground('#55764c').setFontColor('#f3e3ae');
    feuille.setFrozenRows(1);
    feuille.setColumnWidth(1, 160); feuille.setColumnWidth(2, 190);
    feuille.setColumnWidth(3, 210); feuille.setColumnWidth(4, 130);
    feuille.setColumnWidth(5, 260); feuille.setColumnWidth(9, 150);
    feuille.setColumnWidth(10, 240); feuille.setColumnWidth(11, 240);
    feuille.setColumnWidth(12, 280); feuille.setColumnWidth(13, 300);
  }
  // Téléphone TOUJOURS en texte (préserve le 0 initial et les formats +33 / +213),
  // même si l'onglet existait déjà. Posé avant chaque écriture.
  feuille.getRange(2, 4, feuille.getMaxRows() - 1, 1).setNumberFormat('@');
  return feuille;
}

/* Vrai si la 1re ligne correspond exactement aux en-têtes attendus. */
function entetesCorrects_(feuille, entetes) {
  if (feuille.getLastRow() === 0) return false;
  var actuels = feuille.getRange(1, 1, 1, entetes.length).getValues()[0];
  return actuels.join('|') === entetes.join('|');
}

function getFeuilleAnim_() {
  var classeur = ouvrirClasseur_();
  var feuille = classeur.getSheetByName(ONGLET_ANIM);
  if (!feuille) feuille = classeur.insertSheet(ONGLET_ANIM);

  if (!entetesCorrects_(feuille, ENTETES_ANIM)) {
    feuille.clear();
    feuille.appendRow(ENTETES_ANIM);
    feuille.getRange(1, 1, 1, ENTETES_ANIM.length)
      .setFontWeight('bold').setBackground('#8a6a11').setFontColor('#f7edcb');
    feuille.setFrozenRows(1);
    feuille.setColumnWidth(1, 160); feuille.setColumnWidth(2, 190);
    feuille.setColumnWidth(3, 220); feuille.setColumnWidth(4, 150);
    feuille.setColumnWidth(5, 420);
  }
  feuille.getRange(2, 4, feuille.getMaxRows() - 1, 1).setNumberFormat('@'); // téléphone toujours en texte
  return feuille;
}

function ouvrirClasseur_() {
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  var actif = SpreadsheetApp.getActiveSpreadsheet();
  if (actif) {
    PropertiesService.getScriptProperties().setProperty('SHEET_ID', actif.getId());
    return actif;
  }
  throw new Error("Aucun classeur trouvé : lance une fois « installer » depuis l'éditeur.");
}

/* Mots de passe (stockés dans les propriétés du script, JAMAIS dans le code public) :
   - ADMIN_KEY      : tableau de bord des mariés
   - CEREMONIE_KEY  : page des maîtres de cérémonie (animations)
   Définis dans Paramètres du projet -> Propriétés du script (voir README). */
function getCle_(nom) {
  return PropertiesService.getScriptProperties().getProperty(nom) || '';
}

/* Sortie JSON, ou JSONP si un callback est fourni. */
function sortie_(obj, callback) {
  var body = JSON.stringify(obj);
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + body + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
}
function json_(obj) { return sortie_(obj, null); }

/* Affiche une date proprement (jj/mm/aaaa hh:mm), qu'elle soit stockée
   en objet Date ou déjà en texte. */
function fmtDate_(v) {
  if (v instanceof Date) {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
  }
  return String(v || '');
}

/* =====================================================================
   À LANCER UNE SEULE FOIS depuis l'éditeur (fonction « installer »).
   Enregistre l'ID du Sheet et crée l'onglet Réponses.
   Le mot de passe du tableau de bord se règle SÉPARÉMENT, dans les
   Paramètres du projet (voir README) — jamais dans ce code, pour qu'il
   reste secret même si le fichier est mis en ligne.
   ===================================================================== */
function installer() {
  var actif = SpreadsheetApp.getActiveSpreadsheet();
  PropertiesService.getScriptProperties().setProperty('SHEET_ID', actif.getId());
  getFeuille_();
  Logger.log('OK — Sheet enregistré : ' + actif.getName());
}

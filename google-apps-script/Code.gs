/* =====================================================================
   GOOGLE APPS SCRIPT — mariage A & Z
   - reçoit les réponses du formulaire (doPost)
   - fournit les réponses au tableau de bord privé (doGet ?action=list)

   À coller dans Extensions > Apps Script depuis TON Google Sheet.
   Voir README.md, étape 2.
   ===================================================================== */

var ONGLET = 'Réponses';

var ENTETES = [
  'Date de réponse',
  'Contact',
  'Email',
  'Nb adultes',
  'Nb enfants',
  'Total personnes',
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
    ecrireLigne_(d);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    verrou.releaseLock();
  }
}

/* ---------------------------------------------------------------- GET */
/* Trois usages :
   - ?action=list&key=MOT_DE_PASSE   -> renvoie les réponses (pour le tableau de bord)
   - ?test=1                         -> écrit une ligne de test
   - (rien)                          -> message de bon fonctionnement
   Le paramètre &callback=xxx active le JSONP (évite les blocages CORS). */
function doGet(e) {
  var p = (e && e.parameter) ? e.parameter : {};

  // --- Données pour le tableau de bord privé ---
  if (p.action === 'list') {
    if (p.key !== getCle_()) {
      return sortie_({ ok: false, error: 'Mot de passe incorrect.' }, p.callback);
    }
    try {
      return sortie_({ ok: true, invites: lireReponses_() }, p.callback);
    } catch (err) {
      return sortie_({ ok: false, error: String(err) }, p.callback);
    }
  }

  // --- Test d'écriture ---
  if (p.test === '1') {
    try {
      ecrireLigne_({
        date: new Date().toLocaleString('fr-FR'),
        nom: 'TEST (ligne à supprimer)', email: 'test@exemple.com',
        adultes: 2, enfants: 1,
        listeAdultes: 'Adulte Un, Adulte Deux', listeEnfants: 'Enfant Un (5 ans)',
        allergies: 'aucune', message: 'Écriture de test réussie ✔'
      });
      return sortie_({ ok: true, message: "Ligne de test écrite. Regarde l'onglet Réponses." }, p.callback);
    } catch (err) {
      return sortie_({ ok: false, error: String(err) }, p.callback);
    }
  }

  return sortie_({ ok: true, message: 'Le script du mariage fonctionne.' }, p.callback);
}

/* ------------------------------------------------ Lecture des réponses */
function lireReponses_() {
  var feuille = getFeuille_();
  var dernier = feuille.getLastRow();
  if (dernier < 2) return [];                 // seulement l'en-tête
  var valeurs = feuille.getRange(2, 1, dernier - 1, ENTETES.length).getValues();

  return valeurs.map(function (r) {
    return {
      date: String(r[0] || ''),
      contact: String(r[1] || ''),
      email: String(r[2] || ''),
      adultes: Number(r[3]) || 0,
      enfants: Number(r[4]) || 0,
      total: Number(r[5]) || 0,
      listeAdultes: String(r[6] || ''),
      listeEnfants: String(r[7] || ''),
      allergies: String(r[8] || ''),
      message: String(r[9] || '')
    };
  });
}

/* --------------------------------------------------- Écriture commune */
function ecrireLigne_(d) {
  var feuille = getFeuille_();
  var adultes = Number(d.adultes) || 0;
  var enfants = Number(d.enfants) || 0;

  feuille.appendRow([
    d.date || new Date().toLocaleString('fr-FR'),
    d.nom || '', d.email || '',
    adultes, enfants, adultes + enfants,
    d.listeAdultes || '', d.listeEnfants || '',
    d.allergies || '', d.message || ''
  ]);
}

function getFeuille_() {
  var classeur = ouvrirClasseur_();
  var feuille = classeur.getSheetByName(ONGLET);
  if (!feuille) feuille = classeur.insertSheet(ONGLET);

  if (feuille.getLastRow() === 0) {
    feuille.appendRow(ENTETES);
    feuille.getRange(1, 1, 1, ENTETES.length)
      .setFontWeight('bold').setBackground('#55764c').setFontColor('#f3e3ae');
    feuille.setFrozenRows(1);
    feuille.setColumnWidth(1, 160); feuille.setColumnWidth(2, 190);
    feuille.setColumnWidth(3, 220); feuille.setColumnWidth(7, 240);
    feuille.setColumnWidth(8, 240); feuille.setColumnWidth(9, 280);
    feuille.setColumnWidth(10, 300);
  }
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

/* Mot de passe du tableau de bord (stocké dans les propriétés du script,
   JAMAIS dans le code public). Défini via « installer » ou Paramètres du projet. */
function getCle_() {
  return PropertiesService.getScriptProperties().getProperty('ADMIN_KEY') || '';
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

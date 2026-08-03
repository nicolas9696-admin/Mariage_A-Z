/* =====================================================================
   GOOGLE APPS SCRIPT — reçoit les réponses du formulaire
   et les écrit dans le Google Sheet.

   À coller dans Extensions > Apps Script depuis TON Google Sheet.
   Voir README.md, étape 2.
   ===================================================================== */

// Nom de l'onglet du Sheet où écrire (créé automatiquement s'il n'existe pas)
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
  verrou.waitLock(20000); // évite deux écritures simultanées

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
/* - URL simple            -> message de bon fonctionnement
   - URL avec ?test=1      -> écrit une ligne de test et renvoie le résultat
     (pratique pour vérifier que l'écriture marche, sans passer par le site) */
function doGet(e) {
  if (e && e.parameter && e.parameter.test === '1') {
    try {
      ecrireLigne_({
        date: new Date().toLocaleString('fr-FR'),
        nom: 'TEST (ligne à supprimer)',
        email: 'test@exemple.com',
        adultes: 2,
        enfants: 1,
        listeAdultes: 'Adulte Un, Adulte Deux',
        listeEnfants: 'Enfant Un (5 ans)',
        allergies: 'aucune',
        message: 'Écriture de test réussie ✔'
      });
      return json_({ ok: true, message: "Ligne de test écrite. Regarde l'onglet Réponses." });
    } catch (err) {
      return json_({ ok: false, error: String(err) });
    }
  }
  return json_({ ok: true, message: 'Le script du mariage fonctionne.' });
}

/* --------------------------------------------------- Écriture commune */
function ecrireLigne_(d) {
  var feuille = getFeuille_();
  var adultes = Number(d.adultes) || 0;
  var enfants = Number(d.enfants) || 0;

  feuille.appendRow([
    d.date || new Date().toLocaleString('fr-FR'),
    d.nom || '',
    d.email || '',
    adultes,
    enfants,
    adultes + enfants,
    d.listeAdultes || '',
    d.listeEnfants || '',
    d.allergies || '',
    d.message || ''
  ]);
}

/* Récupère (ou crée) l'onglet avec ses en-têtes mis en forme.
   openById est plus fiable que getActiveSpreadsheet() dans une appli web :
   l'ID est renseigné automatiquement au premier lancement (voir en bas). */
function getFeuille_() {
  var classeur = ouvrirClasseur_();
  var feuille = classeur.getSheetByName(ONGLET);

  if (!feuille) feuille = classeur.insertSheet(ONGLET);

  if (feuille.getLastRow() === 0) {
    feuille.appendRow(ENTETES);
    feuille.getRange(1, 1, 1, ENTETES.length)
      .setFontWeight('bold')
      .setBackground('#55764c')
      .setFontColor('#f3e3ae');
    feuille.setFrozenRows(1);
    feuille.setColumnWidth(1, 160);
    feuille.setColumnWidth(2, 190);
    feuille.setColumnWidth(3, 220);
    feuille.setColumnWidth(7, 240);
    feuille.setColumnWidth(8, 240);
    feuille.setColumnWidth(9, 280);
    feuille.setColumnWidth(10, 300);
  }
  return feuille;
}

/* Ouvre le bon classeur, quelle que soit la façon dont le script est appelé. */
function ouvrirClasseur_() {
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (id) return SpreadsheetApp.openById(id);

  // Repli : contexte lié au Sheet (fonctionne depuis l'éditeur / installation)
  var actif = SpreadsheetApp.getActiveSpreadsheet();
  if (actif) {
    // mémorise l'ID pour que l'appli web l'utilise ensuite de façon fiable
    PropertiesService.getScriptProperties().setProperty('SHEET_ID', actif.getId());
    return actif;
  }
  throw new Error("Aucun classeur trouvé : lance une fois « installer » depuis l'éditeur.");
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* =====================================================================
   À LANCER UNE SEULE FOIS depuis l'éditeur (menu ▶, fonction "installer")
   juste après avoir collé ce code. Cela :
     1. enregistre l'ID du Sheet (pour que l'appli web écrive au bon endroit)
     2. crée l'onglet Réponses avec ses colonnes
   Autorise l'accès quand Google le demande.
   ===================================================================== */
function installer() {
  var actif = SpreadsheetApp.getActiveSpreadsheet();
  PropertiesService.getScriptProperties().setProperty('SHEET_ID', actif.getId());
  getFeuille_();
  Logger.log('OK — Sheet enregistré : ' + actif.getName());
}

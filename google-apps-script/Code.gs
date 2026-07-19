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

function doPost(e) {
  var verrou = LockService.getScriptLock();
  verrou.waitLock(20000); // évite deux écritures simultanées sur la même ligne

  try {
    var d = JSON.parse(e.postData.contents);
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

    return json_({ ok: true });

  } catch (err) {
    return json_({ ok: false, error: String(err) });

  } finally {
    verrou.releaseLock();
  }
}

/* Récupère (ou crée) l'onglet avec ses en-têtes mis en forme */
function getFeuille_() {
  var classeur = SpreadsheetApp.getActiveSpreadsheet();
  var feuille = classeur.getSheetByName(ONGLET);

  if (!feuille) {
    feuille = classeur.insertSheet(ONGLET);
  }

  if (feuille.getLastRow() === 0) {
    feuille.appendRow(ENTETES);
    feuille.getRange(1, 1, 1, ENTETES.length)
      .setFontWeight('bold')
      .setBackground('#1f3d2b')
      .setFontColor('#f0e2b8');
    feuille.setFrozenRows(1);
    feuille.setColumnWidth(1, 160);
    feuille.setColumnWidth(2, 190);
    feuille.setColumnWidth(3, 220);
    feuille.setColumnWidth(7, 240);   // adultes
    feuille.setColumnWidth(8, 240);   // enfants
    feuille.setColumnWidth(9, 280);   // allergies
    feuille.setColumnWidth(10, 300);  // message
  }
  return feuille;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* Vérification rapide dans le navigateur : ouvrir l'URL du script en GET */
function doGet() {
  return json_({ ok: true, message: 'Le script du mariage fonctionne.' });
}

/* Lance cette fonction une fois depuis l'éditeur pour tester l'écriture */
function testerEcriture() {
  doPost({
    postData: {
      contents: JSON.stringify({
        date: new Date().toLocaleString('fr-FR'),
        nom: 'Test Dupont',
        email: 'test@example.com',
        adultes: 2,
        enfants: 1,
        listeAdultes: 'Marie Dupont, Paul Dupont',
        listeEnfants: 'Léa Dupont (5 ans)',
        allergies: 'Sans gluten',
        message: 'Ligne de test — à supprimer.'
      })
    }
  });
}

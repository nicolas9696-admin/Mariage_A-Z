/* =====================================================================
   CONFIGURATION DU SITE — c'est le SEUL fichier à modifier au quotidien.
   Tout le reste du site lit ses valeurs ici.
   ===================================================================== */

window.MARIAGE = {

  /* ---------- Les mariés ---------- */
  mariee:  "Anaé",             // ta belle-sœur
  marie:   "Zachary",          // ton beau-frère
  initiales: "A & Z",

  /* ---------- Date & lieu ---------- */
  // Format ISO : AAAA-MM-JJTHH:MM  (heure de début de la cérémonie)
  dateISO: "2027-10-02T14:00",
  dateTexte: "Samedi 2 octobre 2027",
  lieuNom: "Grand Hôtel des Bains de Lavey",
  lieuAdresse: "Route des Bains 48, 1892 Lavey-Morcles, Suisse",
  lieuMapsUrl: "https://maps.google.com/?q=Grand+H%C3%B4tel+des+Bains+de+Lavey,+Route+des+Bains+48,+1892+Lavey-Morcles",

  /* ---------- Mot d'accueil ---------- */
  motAccueil:
    "Après des années à écrire notre histoire, nous avons choisi de nous dire oui. " +
    "Ce sera une belle journée, et elle le sera encore plus si vous êtes là.",

  /* ---------- Programme de la journée ---------- */
  programme: [
    { heure: "13h30", titre: "Arrivée des invités", texte: "" },
    { heure: "14h00", titre: "Cérémonie",           texte: "" },
    { heure: "16h30", titre: "Vin d'honneur",       texte: "" },
    { heure: "19h00", titre: "Souper",              texte: "" }
  ],

  /* ---------- Hébergement / QR code de l'hôtel ---------- */
  hotel: {
    nom: "Grand Hôtel des Bains de Lavey",
    texte:
      "L'hôtel nous propose un tarif préférentiel pour nos invités. " +
      "Scannez le QR code ci-dessous pour accéder directement à la page de " +
      "réservation au prix réduit.",
    // Mets ton image de QR code dans assets/qr/ et indique le chemin ici.
    // Laisse "" tant que tu ne l'as pas : un encart « bientôt disponible » s'affiche.
    qrImage: "",                       // ex. "assets/qr/hotel.png"
    // Lien cliquable de secours (pour ceux qui sont déjà sur mobile)
    qrLien: "",                        // ex. "https://reservation.hotel.com/xxx"
    telephone: ""                      // ex. "05 56 00 00 00"
  },

  /* ---------- Galerie photos ---------- */
  // Ajoute tes photos dans assets/photos/ puis liste-les ici.
  // Tant que la liste est vide, des cadres décoratifs s'affichent à la place.
  photos: [
    // { src: "assets/photos/01.jpg", alt: "Nos fiançailles" },
    // { src: "assets/photos/02.jpg", alt: "Week-end en Provence" },
  ],

  /* ---------- Formulaire RSVP ---------- */
  // URL du script Google Apps Script déployé en « application web ».
  // Voir README.md, étape 2. Tant que c'est vide, le formulaire est en mode démo.
  rsvpEndpoint: "https://script.google.com/macros/s/AKfycbw6GbOGxhqQ3SQqlFyW9SCJut9x1T8-J6lpS-YNmW4Zlc2EscUxpN3ppCLsOCu13Q1_/exec",

  // Date limite de réponse
  rsvpDeadline: "1er mars 2027",   // TODO

  /* ---------- Contact ---------- */
  contactEmail: "",   // ex. "mariage.az@gmail.com"
  contactTel: ""      // ex. "06 12 34 56 78"
};

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
  dateISO: "2027-10-02T15:00",
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
    { heure: "14h30", titre: "Arrivée des invités", texte: "" },
    { heure: "15h00", titre: "Cérémonie",           texte: "" },
    { heure: "16h30", titre: "Vin d'honneur",       texte: "" },
    { heure: "19h00", titre: "Souper",              texte: "" },
    { heure: "22h30", titre: "Après-soirée",        texte: "" }
  ],

  /* ---------- Hébergement / QR code de l'hôtel ---------- */
  hotel: {
    nom: "Grand Hôtel des Bains de Lavey",
    texte:
      "L'hôtel nous propose un tarif préférentiel pour nos invités. " +
      "Le bouton ci-dessous ouvre la réservation avec les dates et le tarif réduit déjà pré-remplis.",
    // Lien de réservation au tarif préférentiel (bouton cliquable).
    // Laisse "" pour masquer le bouton.
    reservationUrl: "https://hotel.bains-lavey.ch/?checkin=2027-10-02&nights=1&rooms=1&adults=2&bkcode=MAR22",
    boutonTexte: "Réserver au tarif préférentiel",
    telephone: ""                      // ex. "021 000 00 00" (facultatif)
  },

  /* ---------- Cadeau : participation au voyage de noces ---------- */
  // Tant que l'IBAN est vide, seul le texte s'affiche (pas de bouton).
  // Une fois rempli, un bouton « Participer au voyage » dévoile les coordonnées.
  cadeau: {
    titulaire: "",                 // ex. "Anaé Chevalier et Zachary Lebsira"
    iban: "",                      // ex. "CH93 0076 2011 6238 5295 7"
    banque: "",                    // ex. "UBS Switzerland AG" (facultatif)
    communication: "Voyage de noces"
  },

  /* ---------- Galerie photos ---------- */
  // Ajoute tes photos dans assets/photos/ puis liste-les ici.
  // Tant que la liste est vide, des cadres décoratifs s'affichent à la place.
  photos: [
    { src: "assets/photos/01.jpg", alt: "Anaé & Zachary" },
    { src: "assets/photos/02.jpg", alt: "Anaé & Zachary" },
    { src: "assets/photos/03.jpg", alt: "Anaé & Zachary" },
    { src: "assets/photos/04.jpg", alt: "Anaé & Zachary" },
    { src: "assets/photos/05.jpg", alt: "Anaé & Zachary" },
    { src: "assets/photos/07.jpg", alt: "Anaé & Zachary" },
    { src: "assets/photos/08.jpg", alt: "Anaé & Zachary" },
    { src: "assets/photos/09.jpg", alt: "Anaé & Zachary" },
    { src: "assets/photos/11.jpg", alt: "Anaé & Zachary" },
  ],

  /* ---------- Formulaire RSVP ---------- */
  // URL du script Google Apps Script déployé en « application web ».
  // Voir README.md, étape 2. Tant que c'est vide, le formulaire est en mode démo.
  rsvpEndpoint: "https://script.google.com/macros/s/AKfycbw6GbOGxhqQ3SQqlFyW9SCJut9x1T8-J6lpS-YNmW4Zlc2EscUxpN3ppCLsOCu13Q1_/exec",

  // Date limite de réponse
  rsvpDeadline: "1er mai 2027",

  /* ---------- Contact / maîtres de cérémonie ---------- */
  // Pour les invités qui veulent organiser une surprise, un discours, etc.
  contactTexte: "Une surprise, un discours ou un coup de main à organiser ? Nos maîtres de cérémonie sont là pour vous :",
  maitresCeremonie: [
    { nom: "Aliya Hurlimann", tel: "+41 79 935 41 49" },
    { nom: "Allya Monnat",   tel: "+41 77 495 26 85" }
  ]
};

/* =====================================================================
   Page des maîtres de cérémonie — récupère les demandes d'animation
   (JSONP, protégé par un mot de passe distinct : CEREMONIE_KEY).
   Ces données sont invisibles pour les mariés.
   ===================================================================== */
(function () {
  "use strict";

  var C = window.MARIAGE || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var gate = $("#gate"), gateForm = $("#gateForm"), passInput = $("#pass"),
      gateErr = $("#gateErr"), gateBtn = $('#gateForm button[type="submit"]'),
      dash = $("#dash"), content = $("#content");

  var cle = "";

  var eye = $("#eye");
  if (eye) eye.addEventListener("click", function () {
    var estCache = passInput.type === "password";
    passInput.type = estCache ? "text" : "password";
    eye.classList.toggle("is-on", estCache);
    passInput.focus();
  });

  /* ------------------------------------------------ Appel JSONP ------ */
  function chargerDonnees(motDePasse) {
    return new Promise(function (resolve, reject) {
      if (!C.rsvpEndpoint) { reject(new Error("Adresse du script non configurée (rsvpEndpoint).")); return; }

      var cb = "az_anim_" + Date.now();
      var script = document.createElement("script");
      var minuteur = setTimeout(function () {
        nettoyer(); reject(new Error("Délai dépassé. Vérifie ta connexion."));
      }, 15000);

      function nettoyer() {
        clearTimeout(minuteur);
        delete window[cb];
        if (script.parentNode) script.parentNode.removeChild(script);
      }

      window[cb] = function (rep) {
        nettoyer();
        if (rep && rep.ok) resolve(rep.animations || []);
        else reject(new Error((rep && rep.error) || "Erreur inconnue."));
      };
      script.onerror = function () { nettoyer(); reject(new Error("Impossible de joindre le script.")); };

      script.src = C.rsvpEndpoint
        + "?action=animations"
        + "&key=" + encodeURIComponent(motDePasse)
        + "&callback=" + cb
        + "&_=" + Date.now();
      document.body.appendChild(script);
    });
  }

  /* ------------------------------------------------ Connexion -------- */
  gateForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var mdp = passInput.value.trim();
    if (!mdp) { gateErr.textContent = "Entre le mot de passe."; return; }

    gateErr.textContent = "";
    gateBtn.disabled = true;
    gateBtn.classList.add("is-loading");
    $(".btn__label", gateBtn).textContent = "Vérification…";

    chargerDonnees(mdp).then(function (animations) {
      cle = mdp;
      gate.hidden = true;
      dash.hidden = false;
      afficher(animations);
    }).catch(function (err) {
      gateErr.textContent = err.message;
    }).then(function () {
      gateBtn.disabled = false;
      gateBtn.classList.remove("is-loading");
      $(".btn__label", gateBtn).textContent = "Accéder";
    });
  });

  /* ------------------------------------------------ Rendu ------------ */
  var dernieres = [];

  function afficher(animations) {
    dernieres = animations;

    if (!animations.length) {
      content.innerHTML = '<p class="vide">Aucune demande pour le moment. ' +
        "Elles apparaîtront ici dès qu'un invité proposera une animation.</p>";
      return;
    }

    var html = '<p class="compte"><b>' + animations.length + '</b> ' +
      (animations.length > 1 ? "demandes d'animation" : "demande d'animation") + '</p>';

    html += '<div class="cartes">';
    animations.forEach(function (a) {
      var coord = [];
      if (a.email) coord.push('<a href="mailto:' + esc(a.email) + '">' + esc(a.email) + '</a>');
      if (a.telephone) coord.push('<a href="tel:' + esc(a.telephone.replace(/\s/g, "")) + '">' + esc(a.telephone) + '</a>');

      html += '<div class="carte">' +
        '<div class="carte__haut">' +
          '<span class="carte__nom">' + esc(a.contact || "Invité") + '</span>' +
          '<span class="carte__date">' + esc(a.date) + '</span>' +
        '</div>' +
        '<div class="carte__idee">' + esc(a.animation) + '</div>' +
        (coord.length ? '<div class="carte__coord">' + coord.join("") + '</div>' : '') +
      '</div>';
    });
    html += '</div>';
    content.innerHTML = html;
  }

  /* ------------------------------------------------ Actions ---------- */
  $("#refresh").addEventListener("click", function () {
    content.innerHTML = '<p class="loading">Actualisation…</p>';
    chargerDonnees(cle).then(afficher).catch(function (err) {
      content.innerHTML = '<p class="vide">' + esc(err.message) + '</p>';
    });
  });

  $("#export").addEventListener("click", function () {
    if (!dernieres.length) return;
    var entetes = ["Date", "Invité", "Email", "Téléphone", "Idée d'animation"];
    var lignes = dernieres.map(function (a) {
      return [a.date, a.contact, a.email, a.telephone, a.animation].map(csvCase);
    });
    var csv = "﻿" + [entetes.map(csvCase).join(";")]
      .concat(lignes.map(function (l) { return l.join(";"); })).join("\r\n");
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "animations-mariage.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  /* ------------------------------------------------ Utilitaires ------ */
  function csvCase(v) {
    v = String(v == null ? "" : v);
    if (/[";\r\n]/.test(v)) v = '"' + v.replace(/"/g, '""') + '"';
    return v;
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
})();

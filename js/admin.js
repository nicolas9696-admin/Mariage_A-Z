/* =====================================================================
   Tableau de bord privé — récupère les réponses via le script Google
   (JSONP, protégé par mot de passe) et les affiche joliment.
   ===================================================================== */
(function () {
  "use strict";

  var C = window.MARIAGE || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };

  var gate = $("#gate"), gateForm = $("#gateForm"), passInput = $("#pass"),
      gateErr = $("#gateErr"), gateBtn = $("#gateForm button"),
      dash = $("#dash"), content = $("#content");

  var cle = "";  // mot de passe en mémoire (jamais stocké en clair sur le disque)

  /* Afficher / masquer le mot de passe */
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

      var cb = "az_cb_" + Date.now();
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
        if (rep && rep.ok) resolve(rep.invites || []);
        else reject(new Error((rep && rep.error) || "Erreur inconnue."));
      };
      script.onerror = function () { nettoyer(); reject(new Error("Impossible de joindre le script.")); };

      var url = C.rsvpEndpoint
        + "?action=list"
        + "&key=" + encodeURIComponent(motDePasse)
        + "&callback=" + cb
        + "&_=" + Date.now();
      script.src = url;
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

    chargerDonnees(mdp).then(function (invites) {
      cle = mdp;
      gate.hidden = true;
      dash.hidden = false;
      afficher(invites);
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

  function afficher(invites) {
    dernieres = invites;

    if (!invites.length) {
      content.innerHTML =
        '<p class="vide" style="text-align:center;padding:60px 0">' +
        "Aucune réponse pour le moment. Elles apparaîtront ici dès la première inscription.</p>";
      return;
    }

    var foyers = invites.length;
    var adultes = somme(invites, "adultes");
    var enfants = somme(invites, "enfants");
    var total = adultes + enfants;

    var allergies = invites.filter(function (i) { return aReellementAllergie(i.allergies); });

    var html = "";

    // Tuiles
    html +=
      '<div class="stats">' +
        tuile(total, "Invités confirmés") +
        tuile(foyers, foyers > 1 ? "Foyers" : "Foyer") +
        tuile(adultes, "Adultes") +
        tuile(enfants, "Enfants") +
      '</div>';

    // Allergies
    html += '<h2 class="section-titre">Allergies &amp; intolérances' +
            (allergies.length ? ' <span class="pastille">' + allergies.length + '</span>' : '') +
            '</h2>';
    if (allergies.length) {
      html += '<div class="allergies">';
      allergies.forEach(function (i) {
        html += '<div class="allergie"><b>' + esc(i.contact || "—") + '</b> — <span>' +
                esc(i.allergies) + '</span></div>';
      });
      html += '</div>';
    } else {
      html += '<p class="vide">Aucune allergie ou intolérance signalée.</p>';
    }

    // Tableau
    html += '<h2 class="section-titre">Détail des réponses</h2>';
    html += '<div class="tablewrap"><table><thead><tr>' +
      '<th>Contact</th><th>Adultes</th><th>Enfants</th><th>Personnes présentes</th>' +
      '<th>Allergies</th><th>Message</th><th>Reçu le</th></tr></thead><tbody>';

    invites.forEach(function (i) {
      var noms = [];
      if (i.listeAdultes) noms.push(esc(i.listeAdultes));
      if (i.listeEnfants) noms.push('<span class="mini">Enfants : ' + esc(i.listeEnfants) + '</span>');

      html += '<tr>' +
        '<td><span class="nom-fort">' + esc(i.contact || "—") + '</span>' +
          (i.email ? '<br><span class="mini">' + esc(i.email) + '</span>' : '') + '</td>' +
        '<td class="num">' + i.adultes + '</td>' +
        '<td class="num">' + i.enfants + '</td>' +
        '<td>' + (noms.join("<br>") || "—") + '</td>' +
        '<td>' + (aReellementAllergie(i.allergies)
                    ? '<span class="badge-al">' + esc(i.allergies) + '</span>'
                    : '<span class="mini">—</span>') + '</td>' +
        '<td>' + (i.message ? esc(i.message) : '<span class="mini">—</span>') + '</td>' +
        '<td class="mini">' + esc(i.date) + '</td>' +
      '</tr>';
    });

    html += '</tbody></table></div>';
    content.innerHTML = html;
  }

  function tuile(n, label) {
    return '<div class="stat"><b>' + n + '</b><span>' + label + '</span></div>';
  }

  /* ------------------------------------------------ Actions ---------- */
  $("#refresh").addEventListener("click", function () {
    content.innerHTML = '<p class="loading">Actualisation…</p>';
    chargerDonnees(cle).then(afficher).catch(function (err) {
      content.innerHTML = '<p class="vide" style="text-align:center;padding:60px 0">' + esc(err.message) + '</p>';
    });
  });

  $("#export").addEventListener("click", function () {
    if (!dernieres.length) return;
    var entetes = ["Date", "Contact", "Email", "Adultes", "Enfants", "Total",
                   "Noms adultes", "Noms enfants", "Allergies", "Message"];
    var lignes = dernieres.map(function (i) {
      return [i.date, i.contact, i.email, i.adultes, i.enfants, i.total,
              i.listeAdultes, i.listeEnfants, i.allergies, i.message].map(csvCase);
    });
    var csv = "﻿" + [entetes.map(csvCase).join(";")]
      .concat(lignes.map(function (l) { return l.join(";"); })).join("\r\n");

    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "reponses-mariage.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  /* ------------------------------------------------ Utilitaires ------ */
  function somme(arr, cle) {
    return arr.reduce(function (t, x) { return t + (Number(x[cle]) || 0); }, 0);
  }
  function aReellementAllergie(txt) {
    if (!txt) return false;
    var t = String(txt).trim().toLowerCase();
    return t !== "" && t !== "aucune" && t !== "aucun" && t !== "non" && t !== "-" && t !== "rien" && t !== "ras";
  }
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

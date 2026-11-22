/* =====================================================================
   MARIAGE — logique du site
   Rien à modifier ici : toutes les valeurs viennent de js/config.js
   ===================================================================== */
(function () {
  "use strict";

  const C = window.MARIAGE || {};
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ------------------------------------------------ 1. Rideau d'entrée */
  window.addEventListener("load", () => {
    setTimeout(() => $("#curtain").classList.add("is-gone"), 1200);
  });

  /* ------------------------------------------- 2. Injection du contenu */
  const monogramme = C.initiales || `${C.marie} & ${C.mariee}`;
  $$("[data-monogram]").forEach(el => (el.textContent = monogramme));
  $$("[data-marie]").forEach(el => (el.textContent = C.marie || ""));
  $$("[data-mariee]").forEach(el => (el.textContent = C.mariee || ""));
  $$("[data-date-texte]").forEach(el => (el.textContent = C.dateTexte || ""));
  $$("[data-lieu-nom]").forEach(el => (el.textContent = C.lieuNom || ""));
  $$("[data-lieu-adresse]").forEach(el => (el.textContent = C.lieuAdresse || ""));
  $$("[data-lieu]").forEach(el => (el.textContent = C.lieuNom || ""));
  $$("[data-mot-accueil]").forEach(el => (el.textContent = C.motAccueil || ""));
  $$("[data-deadline]").forEach(el => (el.textContent = C.rsvpDeadline || ""));

  const cible = C.dateISO ? new Date(C.dateISO) : null;
  if (cible && !isNaN(cible)) {
    const h = String(cible.getHours()).padStart(2, "0");
    const m = String(cible.getMinutes()).padStart(2, "0");
    // « Dès 14h30 · Cérémonie à 15h00 » (heure de la cérémonie lue dans le programme)
    const ceremonie = (C.programme || []).filter(e => /c[ée]r[ée]monie/i.test(e.titre || ""))[0];
    const texteHeure = `Dès ${h}h${m}` +
      (ceremonie && ceremonie.heure !== `${h}h${m}` ? ` · Cérémonie à ${ceremonie.heure}` : "");
    $$("[data-heure]").forEach(el => (el.textContent = texteHeure));
  }

  $$("[data-maps]").forEach(el => {
    if (C.lieuMapsUrl) el.href = C.lieuMapsUrl;
    else el.remove();
  });

  document.title = `${monogramme} — Notre mariage`;

  /* ------------------------------------------------ 3. Compte à rebours */
  const cd = { j: $("#cd-j"), h: $("#cd-h"), m: $("#cd-m"), s: $("#cd-s") };

  function tick() {
    if (!cible || isNaN(cible)) return;
    let reste = cible - new Date();

    if (reste <= 0) {
      $("#countdown").innerHTML =
        '<p style="font-family:var(--serif);font-size:26px;color:var(--or-clair);margin:0">' +
        "C'est aujourd'hui !</p>";
      clearInterval(timer);
      return;
    }
    const s = Math.floor(reste / 1000);
    cd.j.textContent = Math.floor(s / 86400);
    cd.h.textContent = String(Math.floor(s / 3600) % 24).padStart(2, "0");
    cd.m.textContent = String(Math.floor(s / 60) % 60).padStart(2, "0");
    cd.s.textContent = String(s % 60).padStart(2, "0");
  }
  const timer = setInterval(tick, 1000);
  tick();

  /* ------------------------------------------------------ 4. Programme */
  const tl = $("#timeline");
  (C.programme || []).forEach(e => {
    const li = document.createElement("li");
    li.className = "tl reveal";
    li.innerHTML =
      `<span class="tl__heure">${esc(e.heure)}</span>` +
      `<span class="tl__dot"></span>` +
      `<div class="tl__body"><h3>${esc(e.titre)}</h3>` +
      (e.texte ? `<p>${esc(e.texte)}</p>` : "") + `</div>`;
    tl.appendChild(li);
  });

  /* -------------------------------------------------------- 5. Galerie */
  const gallery = $("#gallery");
  const photos = C.photos || [];

  if (photos.length) {
    photos.forEach((p, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "gallery__item reveal";
      b.dataset.index = i;
      b.innerHTML = `<img src="${esc(p.src)}" alt="${esc(p.alt || "")}" loading="lazy">`;
      gallery.appendChild(b);
    });
  } else {
    for (let i = 0; i < 6; i++) {
      const d = document.createElement("div");
      d.className = "gallery__placeholder reveal";
      d.innerHTML =
        '<div><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/>' +
        '<circle cx="8.5" cy="10" r="1.5"/><path d="M21 16l-5-5-4 4-2-2-4 4"/></svg>' +
        "<span>Photo à venir</span></div>";
      gallery.appendChild(d);
    }
  }

  /* ------------------------------------------------------ 6. Lightbox */
  const lb = $("#lightbox"), lbImg = $("#lightboxImg");
  let idx = 0;

  gallery.addEventListener("click", e => {
    const item = e.target.closest(".gallery__item");
    if (!item) return;
    idx = Number(item.dataset.index);
    ouvrirLightbox();
  });

  function ouvrirLightbox() {
    const p = photos[idx];
    if (!p) return;
    lbImg.src = p.src;
    lbImg.alt = p.alt || "";
    lb.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function fermerLightbox() {
    lb.hidden = true;
    document.body.style.overflow = "";
  }
  function naviguer(d) {
    idx = (idx + d + photos.length) % photos.length;
    ouvrirLightbox();
  }

  $(".lightbox__close").addEventListener("click", fermerLightbox);
  $(".lightbox__nav--prev").addEventListener("click", () => naviguer(-1));
  $(".lightbox__nav--next").addEventListener("click", () => naviguer(1));
  lb.addEventListener("click", e => { if (e.target === lb) fermerLightbox(); });
  document.addEventListener("keydown", e => {
    if (lb.hidden) return;
    if (e.key === "Escape") fermerLightbox();
    if (e.key === "ArrowLeft") naviguer(-1);
    if (e.key === "ArrowRight") naviguer(1);
  });

  /* ------------------------------------------------------ 7. Hôtel/QR */
  const H = C.hotel || {};
  $$("[data-hotel-nom]").forEach(el => (el.textContent = H.nom || ""));
  $$("[data-hotel-texte]").forEach(el => (el.textContent = H.texte || ""));

  const qr = $("#qrBlock");
  if (H.reservationUrl) {
    qr.innerHTML =
      `<a class="btn btn--gold hotel__btn" href="${esc(H.reservationUrl)}" target="_blank" rel="noopener">` +
      `<svg viewBox="0 0 24 24" class="hotel__btn-ico"><path d="M3 21V10l9-6 9 6v11M9 21v-6h6v6"/></svg>` +
      `<span>${esc(H.boutonTexte || "Réserver au tarif préférentiel")}</span></a>`;
  }
  if (H.telephone) {
    qr.insertAdjacentHTML("beforeend",
      `<p class="qr__meta">Ou par téléphone : <a href="tel:${esc(H.telephone.replace(/\s/g, ""))}">${esc(H.telephone)}</a></p>`);
  }

  /* ------------------------------------------------------ 8. Contact */
  const fc = $("#footerContact");
  const mc = C.maitresCeremonie || [];
  if (mc.length) {
    const gens = mc.map(p =>
      `<a class="footer__contact-item" href="tel:${esc((p.tel || "").replace(/\s/g, ""))}">${esc(p.nom)} — ${esc(p.tel)}</a>`
    ).join("");
    fc.innerHTML = (C.contactTexte ? `<span class="footer__contact-intro">${esc(C.contactTexte)}</span>` : "") + `<span class="footer__contact-list">${gens}</span>`;
  } else {
    const bits = [];
    if (C.contactEmail) bits.push(`<a href="mailto:${esc(C.contactEmail)}">${esc(C.contactEmail)}</a>`);
    if (C.contactTel) bits.push(`<a href="tel:${esc(C.contactTel.replace(/\s/g, ""))}">${esc(C.contactTel)}</a>`);
    fc.innerHTML = bits.length ? "Une question ? " + bits.join(" &nbsp;·&nbsp; ") : "";
  }

  /* --------------------------------------------------- 9. Navigation */
  const nav = $("#nav"), burger = $("#burger");

  const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 60);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  burger.addEventListener("click", () => {
    const ouvert = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(ouvert));
    document.body.style.overflow = ouvert ? "hidden" : "";
  });
  $$("#navLinks a").forEach(a =>
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    })
  );

  /* ------------------------------------ 10. Apparition au défilement */
  const io = new IntersectionObserver(
    entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    }),
    { threshold: 0.12, rootMargin: "0px 0px -60px" }
  );
  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 4, 3) * 90}ms`;
    io.observe(el);
  });

  /* --------------------------------------- CADEAU : coordonnées bancaires */
  (function () {
    const K = C.cadeau || {};
    const bloc = $("#cadeauBanque");
    if (!bloc || !K.iban) return;                 // rien tant que l'IBAN n'est pas rempli
    const dl = $("#cadeauIban"), bouton = $("#cadeauBtn");
    const lignes = [
      ["Titulaire", K.titulaire],
      ["Rue et n°", K.rue],
      ["NPA / Localité", K.localite],
      ["IBAN", K.iban, true],
      ["Banque", K.banque],
      ["BIC / SWIFT", K.bic, true],
      ["Communication", K.communication]
    ].filter(l => l[1]);
    dl.innerHTML = lignes.map(([t, v, copie]) =>
      `<div class="iban__ligne"><dt>${esc(t)}</dt><dd>` +
      `<span class="iban__val${copie ? " iban__val--mono" : ""}">${esc(v)}</span>` +
      (copie ? ` <button type="button" class="iban__copier" data-copier="${esc(v.replace(/\s+/g, ""))}">Copier</button>` : "") +
      `</dd></div>`).join("");
    bloc.hidden = false;
    bouton.addEventListener("click", () => {
      dl.hidden = !dl.hidden;
      bouton.setAttribute("aria-expanded", String(!dl.hidden));
      bouton.textContent = dl.hidden ? "Participer au voyage" : "Masquer les coordonnées";
    });
    dl.addEventListener("click", e => {
      const b = e.target.closest("[data-copier]");
      if (!b) return;
      (navigator.clipboard ? navigator.clipboard.writeText(b.dataset.copier) : Promise.reject())
        .then(() => { b.textContent = "Copié ✓"; setTimeout(() => (b.textContent = "Copier"), 1800); })
        .catch(() => { b.textContent = "Sélectionnez le texte"; });
    });
  })();

  /* ----------------------------------------------------- 11. RSVP */
  const form = $("#rsvpForm"),
        statut = $("#formStatus"),
        btn = $("#submitBtn"),
        merci = $("#thanks");

  /* --- Champs de noms générés selon les compteurs --- */
  const listeAdultes = $("#listeAdultes"),
        listeEnfants = $("#listeEnfants"),
        champAdultes = $("#champAdultes"),
        champEnfants = $("#champEnfants");

  // Régénère une liste en conservant ce qui a déjà été saisi
  function rendreInvites(conteneur, nb, type) {
    const anciens = $$("input", conteneur).map(i => i.value);
    conteneur.innerHTML = "";

    for (let i = 0; i < nb; i++) {
      const ligne = document.createElement("div");
      ligne.className = "invite" + (type === "enfant" ? " invite--enfant" : "");

      const prenom = document.createElement("input");
      prenom.type = "text"; prenom.autocomplete = "off";
      prenom.dataset.role = type; prenom.dataset.field = "prenom";
      prenom.placeholder = "Prénom";
      ligne.appendChild(prenom);

      const nom = document.createElement("input");
      nom.type = "text"; nom.autocomplete = "off";
      nom.dataset.role = type; nom.dataset.field = "nom";
      nom.placeholder = "Nom";
      ligne.appendChild(nom);

      if (type === "enfant") {
        const age = document.createElement("input");
        age.type = "number";
        age.min = 2; age.max = 10;
        age.inputMode = "numeric";
        age.dataset.role = "age"; age.dataset.field = "age";
        age.placeholder = "Âge";
        ligne.appendChild(age);
      }
      conteneur.appendChild(ligne);
    }

    // restitution des valeurs précédentes
    $$("input", conteneur).forEach((input, i) => {
      if (anciens[i] !== undefined) input.value = anciens[i];
    });
  }

  function majInvites() {
    const nbAdultes = Number(form.adultes.value) || 0;
    const nbEnfants = Number(form.enfants.value) || 0;
    rendreInvites(listeAdultes, nbAdultes, "adulte");
    rendreInvites(listeEnfants, nbEnfants, "enfant");
    champAdultes.hidden = nbAdultes === 0;   // pas de libellé orphelin
    champEnfants.hidden = nbEnfants === 0;
  }

  /* --- NPA suisse -> localité remplie automatiquement --- */
  var npaHint = $("#npaHint");
  var npaTimer;

  function estSuisse() {
    var p = (form.pays.value || "").trim().toLowerCase();
    return p === "" || p === "suisse" || p === "switzerland" || p === "schweiz" || p === "svizzera" || p === "ch";
  }

  form.npa.addEventListener("input", function () {
    form.npa.value = form.npa.value.replace(/\D/g, "").slice(0, 6);
    clearTimeout(npaTimer);
    npaHint.textContent = "";
    if (estSuisse() && form.npa.value.length === 4) {
      npaHint.textContent = "Recherche de la localité…";
      npaTimer = setTimeout(function () { chercherLocalite(form.npa.value); }, 250);
    }
  });

  // si le pays change, relancer (ou couper) l'auto-remplissage suisse
  form.pays.addEventListener("change", function () {
    if (estSuisse() && form.npa.value.length === 4 &&
        (!form.localite.value.trim() || form.localite.dataset.auto === "1")) {
      chercherLocalite(form.npa.value);
    } else if (!estSuisse()) {
      npaHint.textContent = "";
      if (form.localite.dataset.auto === "1") { form.localite.value = ""; form.localite.dataset.auto = ""; }
    }
  });

  // si l'invité écrit lui-même la localité, on ne l'écrase plus
  form.localite.addEventListener("input", function () { form.localite.dataset.auto = ""; });

  function chercherLocalite(code) {
    fetch("https://openplzapi.org/ch/Localities?postalCode=" + code)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var communes = [];
        (data || []).forEach(function (x) {
          var n = (x.commune && x.commune.name) || x.name;
          if (n && communes.indexOf(n) === -1) communes.push(n);
        });
        if (!communes.length) {
          npaHint.textContent = "NPA inconnu — saisissez la localité à la main.";
          return;
        }
        // remplit tant que l'invité n'a pas tapé sa propre valeur
        if (!form.localite.value.trim() || form.localite.dataset.auto === "1") {
          form.localite.value = communes[0];
          form.localite.dataset.auto = "1";
        }
        npaHint.textContent = communes.length > 1
          ? "Autres localités possibles : " + communes.slice(0, 4).join(", ")
          : "";
      })
      .catch(function () { npaHint.textContent = ""; }); // silencieux : saisie manuelle possible
  }

  // Boutons + / −
  $$(".stepper__btn").forEach(b =>
    b.addEventListener("click", () => {
      const input = $("#" + b.dataset.step);
      const min = Number(input.min), max = Number(input.max);
      input.value = Math.min(max, Math.max(min, Number(input.value || 0) + Number(b.dataset.dir)));
      majInvites();
    })
  );
  [form.adultes, form.enfants].forEach(i => i.addEventListener("change", majInvites));
  majInvites();

  /* --- Liste des invités : vérification des prénoms auprès du script Google --- */
  // Renvoie la liste des prénoms qui ne sont PAS sur la liste (vide = tout est bon).
  function verifierPrenoms(prenoms) {
    return new Promise((resolve, reject) => {
      if (!C.rsvpEndpoint) { resolve([]); return; }          // mode démo
      const cb = "az_verif_" + Date.now() + Math.floor(Math.random() * 1e6);
      const tag = document.createElement("script");
      const minuteur = setTimeout(() => { nettoyer(); reject(new Error("délai")); }, 15000);
      function nettoyer() {
        clearTimeout(minuteur);
        delete window[cb];
        if (tag.parentNode) tag.parentNode.removeChild(tag);
      }
      window[cb] = rep => {
        nettoyer();
        if (rep && rep.ok && Array.isArray(rep.inconnus)) resolve(rep.inconnus);
        else reject(new Error((rep && rep.error) || "réponse inattendue"));
      };
      tag.onerror = () => { nettoyer(); reject(new Error("script injoignable")); };
      tag.src = C.rsvpEndpoint + "?action=verifier"
        + "&prenoms=" + encodeURIComponent(JSON.stringify(prenoms))
        + "&callback=" + cb + "&_=" + Date.now();
      document.body.appendChild(tag);
    });
  }
  const MSG_HORS_LISTE = "Nous ne trouvons pas ce prénom dans la liste des invités. " +
    "Vérifiez l'orthographe, ou contactez Anaé ou Zachary.";
  const MSG_VERIF_KO = "Vérification impossible pour le moment. Réessayez dans un instant.";

  /* --- Étape 1 : prénom -> ouvre le formulaire --- */
  const gate = $("#gateInvite"), gatePrenom = $("#gatePrenom"),
        gateBtn = $("#gateBtn"), gateErr = $("#gateErr");

  async function ouvrirFormulaire() {
    const prenom = gatePrenom.value.trim();
    gateErr.textContent = "";
    gatePrenom.classList.remove("is-error");
    if (!prenom) { gateErr.textContent = "Indiquez votre prénom."; gatePrenom.classList.add("is-error"); return; }

    gateBtn.disabled = true; gateBtn.classList.add("is-loading");
    $(".btn__label", gateBtn).textContent = "Vérification…";
    try {
      const inconnus = await verifierPrenoms([prenom]);
      if (inconnus.length) {
        gateErr.textContent = MSG_HORS_LISTE; gatePrenom.classList.add("is-error");
        return;
      }
      gate.hidden = true;
      form.hidden = false;
      const p1 = $('#listeAdultes [data-field="prenom"]');
      if (p1 && !p1.value) { p1.value = prenom.charAt(0).toUpperCase() + prenom.slice(1);p1.dispatchEvent(new Event("input", { bubbles: true })); }
      form.scrollIntoView({ block: "start", behavior: "smooth" });
    } catch (err) {
      console.error(err);
      gateErr.textContent = MSG_VERIF_KO;
    } finally {
      gateBtn.disabled = false; gateBtn.classList.remove("is-loading");
      $(".btn__label", gateBtn).textContent = "Continuer";
    }
  }
  gateBtn.addEventListener("click", ouvrirFormulaire);
  gatePrenom.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); ouvrirFormulaire(); } });

  function erreur(champ, msg) {
    const el = $(`[data-err-for="${champ}"]`);
    if (el) el.textContent = msg || "";
    const input = form.elements[champ];
    if (input && input.classList) input.classList.toggle("is-error", Boolean(msg));
  }

  function valider() {
    let ok = true;
    ["email", "telephone", "adresse", "pays", "npa", "localite", "hotel", "invites"].forEach(c => erreur(c, ""));

    const mail = form.email.value.trim();
    if (!mail) { erreur("email", "Merci d'indiquer votre email."); ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) { erreur("email", "Cet email ne semble pas valide."); ok = false; }

    if (!form.telephone.value.trim()) { erreur("telephone", "Merci d'indiquer un numéro de téléphone."); ok = false; }
    if (!form.adresse.value.trim()) { erreur("adresse", "Merci d'indiquer votre rue et numéro."); ok = false; }
    if (!form.pays.value.trim()) { erreur("pays", "Merci d'indiquer le pays."); ok = false; }
    if (form.npa.value.trim().length < 4) { erreur("npa", "Code postal invalide."); ok = false; }
    if (!form.localite.value.trim()) { erreur("localite", "Merci d'indiquer la localité."); ok = false; }

    if (!form.querySelector('input[name="hotel"]:checked')) {
      erreur("hotel", "Indiquez si vous réservez une chambre à l'hôtel."); ok = false;
    }

    if (Number(form.adultes.value) + Number(form.enfants.value) < 1) {
      erreur("invites", "Indiquez au moins une personne présente.");
      ok = false;
    }

    // chaque personne annoncée doit avoir un nom
    const manquants = $$('input[data-role="adulte"], input[data-role="enfant"]')
      .filter(i => !i.value.trim());
    manquants.forEach(i => i.classList.add("is-error"));
    $$('input[data-role="adulte"], input[data-role="enfant"]')
      .filter(i => i.value.trim())
      .forEach(i => i.classList.remove("is-error"));

    if (manquants.length) {
      erreur("invites", "Merci d'indiquer le prénom et le nom de chaque personne présente.");
      ok = false;
    }
    return ok;
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    statut.textContent = "";
    statut.className = "form__status";
    if (!valider()) {
      form.querySelector(".is-error, .err:not(:empty)")?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    const nomComplet = (ligne) => {
      const p = $('[data-field="prenom"]', ligne).value.trim();
      const n = $('[data-field="nom"]', ligne).value.trim();
      return (p + " " + n).trim();
    };

    const nomsAdultes = $$(".invite", listeAdultes).map(nomComplet);

    const nomsEnfants = $$(".invite--enfant", listeEnfants).map(l => {
      const nom = nomComplet(l);
      const age = $('[data-field="age"]', l).value.trim();
      return age ? `${nom} (${age} ans)` : nom;
    });

    const donnees = {
      date: new Date().toLocaleString("fr-FR"),
      nom: nomsAdultes[0] || nomsEnfants[0] || "",   // contact principal
      email: form.email.value.trim(),
      telephone: form.telephone.value.trim(),
      adresse: form.adresse.value.trim() + ", " + form.npa.value.trim() + " " +
               form.localite.value.trim() + ", " + form.pays.value.trim(),
      hotel: (form.querySelector('input[name="hotel"]:checked') || {}).value || "",
      adultes: Number(form.adultes.value),
      enfants: Number(form.enfants.value),
      listeAdultes: nomsAdultes.join(", "),
      listeEnfants: nomsEnfants.join(", "),
      allergies: form.allergies.value.trim(),
      message: form.message.value.trim()
    };

    btn.disabled = true;
    btn.classList.add("is-loading");
    $(".btn__label", btn).textContent = "Envoi en cours…";

    try {
      // Chaque personne inscrite doit figurer sur la liste des invités
      const champsPrenoms = $$('#listeAdultes [data-field="prenom"], #listeEnfants [data-field="prenom"]');
      let inconnus;
      try {
        inconnus = await verifierPrenoms(champsPrenoms.map(i => i.value.trim()));
      } catch (err) {
        console.error(err);
        statut.textContent = MSG_VERIF_KO;
        statut.className = "form__status is-error";
        return;
      }
      if (inconnus.length) {
        champsPrenoms.filter(i => inconnus.includes(i.value.trim()))
          .forEach(i => i.classList.add("is-error"));
        erreur("invites", (inconnus.length > 1 ? "Ces prénoms ne sont" : "Ce prénom n'est") +
          " pas sur la liste des invités : " + inconnus.join(", ") +
          ". Vérifiez l'orthographe, ou contactez Anaé ou Zachary.");
        $("#champAdultes").scrollIntoView({ block: "center", behavior: "smooth" });
        return;
      }

      if (!C.rsvpEndpoint) {
        // Mode démo : aucune URL Google Sheets configurée
        await new Promise(r => setTimeout(r, 700));
        console.warn("[RSVP] Mode démo — rsvpEndpoint non configuré dans js/config.js", donnees);
      } else {
        await fetch(C.rsvpEndpoint, {
          method: "POST",
          mode: "no-cors",                       // Apps Script ne renvoie pas d'en-tête CORS
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(donnees)
        });
      }

      form.hidden = true;
      merci.hidden = false;
      $("#thanksMsg").textContent =
        "Votre inscription est bien enregistrée. Nous avons hâte de vous voir !";
      merci.scrollIntoView({ block: "center", behavior: "smooth" });

    } catch (err) {
      console.error(err);
      statut.textContent = "L'envoi a échoué. Vérifiez votre connexion et réessayez.";
      statut.className = "form__status is-error";
    } finally {
      btn.disabled = false;
      btn.classList.remove("is-loading");
      $(".btn__label", btn).textContent = "Envoyer ma réponse";
    }
  });

  $("#againBtn").addEventListener("click", () => {
    form.reset();
    majInvites();
    ["email", "telephone", "adresse", "pays", "npa", "localite", "hotel", "invites"].forEach(c => erreur(c, ""));
    merci.hidden = true;
    form.hidden = false;
    form.scrollIntoView({ block: "center", behavior: "smooth" });
  });

  /* ================================================================
     FORMULAIRE ANIMATION / SURPRISE (séparé)
     - coordonnées reprises automatiquement de la présence
     - envoi vers l'onglet Animations uniquement
     ================================================================ */
  const animForm = $("#animForm"),
        animStatut = $("#animStatus"),
        animBtn = $("#animSubmit"),
        animMerci = $("#animThanks"),
        aPrenom = $("#a_prenom"), aNom = $("#a_nom"),
        aEmail = $("#a_email"), aTel = $("#a_tel"), aIdee = $("#a_idee");

  // --- Auto-remplissage depuis la présence (tant que l'invité n'a pas édité) ---
  function miroir() {
    const p1 = $('#listeAdultes .invite [data-field="prenom"]');
    const n1 = $('#listeAdultes .invite [data-field="nom"]');
    if (!aPrenom.dataset.touched && p1) aPrenom.value = p1.value;
    if (!aNom.dataset.touched && n1) aNom.value = n1.value;
    if (!aEmail.dataset.touched) aEmail.value = form.email.value;
    if (!aTel.dataset.touched) aTel.value = form.telephone.value;
  }
  [form.email, form.telephone].forEach(el => el.addEventListener("input", miroir));
  listeAdultes.addEventListener("input", miroir);
  [aPrenom, aNom, aEmail, aTel].forEach(el =>
    el.addEventListener("input", () => { el.dataset.touched = "1"; }));

  function animErreur(champ, msg) {
    const el = $(`[data-err-for="${champ}"]`);
    if (el) el.textContent = msg || "";
    const input = animForm.querySelector("#" + champ);
    if (input) input.classList.toggle("is-error", Boolean(msg));
  }

  function validerAnim() {
    let ok = true;
    ["a_prenom", "a_nom", "a_email", "a_tel", "a_idee"].forEach(c => animErreur(c, ""));
    if (!aPrenom.value.trim()) { animErreur("a_prenom", "Prénom requis."); ok = false; }
    if (!aNom.value.trim()) { animErreur("a_nom", "Nom requis."); ok = false; }
    const mail = aEmail.value.trim();
    if (!mail || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) { animErreur("a_email", "Email invalide."); ok = false; }
    if (!aTel.value.trim()) { animErreur("a_tel", "Téléphone requis."); ok = false; }
    if (!aIdee.value.trim()) { animErreur("a_idee", "Décrivez votre idée."); ok = false; }
    return ok;
  }

  animForm.addEventListener("submit", async e => {
    e.preventDefault();
    animStatut.textContent = ""; animStatut.className = "form__status";
    if (!validerAnim()) {
      animForm.querySelector(".is-error")?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    const donnees = {
      onlyAnimation: true,
      date: new Date().toLocaleString("fr-FR"),
      nom: (aPrenom.value.trim() + " " + aNom.value.trim()).trim(),
      email: aEmail.value.trim(),
      telephone: aTel.value.trim(),
      animation: aIdee.value.trim()
    };

    animBtn.disabled = true;
    animBtn.classList.add("is-loading");
    $(".btn__label", animBtn).textContent = "Envoi en cours…";

    try {
      if (!C.rsvpEndpoint) {
        await new Promise(r => setTimeout(r, 600));
        console.warn("[Animation] Mode démo — rsvpEndpoint non configuré", donnees);
      } else {
        await fetch(C.rsvpEndpoint, {
          method: "POST", mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(donnees)
        });
      }
      animForm.hidden = true;
      animMerci.hidden = false;
      animMerci.scrollIntoView({ block: "center", behavior: "smooth" });
    } catch (err) {
      console.error(err);
      animStatut.textContent = "L'envoi a échoué. Vérifiez votre connexion et réessayez.";
      animStatut.className = "form__status is-error";
    } finally {
      animBtn.disabled = false;
      animBtn.classList.remove("is-loading");
      $(".btn__label", animBtn).textContent = "Envoyer ma demande";
    }
  });

  $("#animAgainBtn").addEventListener("click", () => {
    aIdee.value = "";
    ["a_prenom", "a_nom", "a_email", "a_tel", "a_idee"].forEach(c => animErreur(c, ""));
    animMerci.hidden = true;
    animForm.hidden = false;
    animForm.scrollIntoView({ block: "center", behavior: "smooth" });
  });

  /* ------------------------------------------------------- Utilitaire */
  function esc(str) {
    return String(str ?? "").replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
})();

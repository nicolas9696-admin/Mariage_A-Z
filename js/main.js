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
    $$("[data-heure]").forEach(el => (el.textContent = `Cérémonie à ${h}h${m}`));
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
      `<a href="tel:${esc((p.tel || "").replace(/\s/g, ""))}">${esc(p.nom)} — ${esc(p.tel)}</a>`
    ).join(" &nbsp;·&nbsp; ");
    fc.innerHTML = (C.contactTexte ? `<span class="footer__contact-intro">${esc(C.contactTexte)}</span><br>` : "") + gens;
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

      const nom = document.createElement("input");
      nom.type = "text";
      nom.autocomplete = "off";
      nom.dataset.role = type;
      nom.placeholder = `${type === "enfant" ? "Enfant" : "Adulte"} ${i + 1} — nom et prénom`;
      ligne.appendChild(nom);

      if (type === "enfant") {
        const age = document.createElement("input");
        age.type = "number";
        age.min = 2; age.max = 10;
        age.inputMode = "numeric";
        age.dataset.role = "age";
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

  /* --- Case « je souhaite préparer une animation » --- */
  var blocAnim = $("#blocAnim");
  form.veutAnimer.addEventListener("change", function () {
    blocAnim.classList.toggle("is-open", form.veutAnimer.checked);
    if (!form.veutAnimer.checked) erreur("animation", "");
  });

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

    if (form.veutAnimer.checked && !form.animation.value.trim()) {
      erreur("animation", "Décrivez votre idée, ou décochez la case."); ok = false;
    }

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
      erreur("invites", "Merci d'indiquer le nom de chaque personne présente.");
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

    const nomsAdultes = $$('input[data-role="adulte"]').map(i => i.value.trim());

    const nomsEnfants = $$(".invite--enfant", listeEnfants).map(l => {
      const nom = $('input[data-role="enfant"]', l).value.trim();
      const age = $('input[data-role="age"]', l).value.trim();
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

  /* ------------------------------------------------------- Utilitaire */
  function esc(str) {
    return String(str ?? "").replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
})();

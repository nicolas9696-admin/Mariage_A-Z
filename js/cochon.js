/* =====================================================================
   🐷 Easter egg — chut, c'est un secret.
   Déclencheurs :
     - taper « cochon » au clavier, n'importe où sur la page ;
     - toucher 3 fois de suite le petit cœur de la section Cadeau.
   Effet : une parade de cochons traverse l'écran, avec des « groin groin ».
   ===================================================================== */
(function () {
  "use strict";

  var enCours = false;

  /* --------------------------------------------------------- style */
  var css = document.createElement("style");
  css.textContent =
    ".cochons{position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden}" +
    ".cochon{position:absolute;right:-90px;font-size:var(--t,46px);line-height:1;" +
    "  animation:cochon-course var(--d,5s) linear forwards;will-change:transform}" +
    ".cochon span{display:inline-block;animation:cochon-saut .42s ease-in-out infinite alternate}" +
    "@keyframes cochon-course{to{transform:translateX(calc(-100vw - 180px))}}" +
    "@keyframes cochon-saut{from{transform:translateY(0) rotate(-6deg)}to{transform:translateY(-16px) rotate(6deg)}}" +
    ".cochon-bulle{position:fixed;left:50%;top:50%;z-index:10000;pointer-events:none;" +
    "  transform:translate(-50%,-50%) scale(.6);opacity:0;text-align:center;" +
    "  background:#fbf7ea;border:1px solid rgba(184,144,31,.45);border-radius:18px;" +
    "  padding:22px 28px;box-shadow:0 24px 60px -30px rgba(19,42,29,.6);" +
    "  font-family:'Cormorant Garamond',Georgia,serif;color:#3d5738;max-width:min(88vw,380px);" +
    "  animation:cochon-bulle 4.2s ease forwards}" +
    ".cochon-bulle b{display:block;font-family:Allura,cursive;font-weight:400;font-size:44px;color:#c46a86;line-height:1.1}" +
    ".cochon-bulle small{display:block;font-size:18px;font-style:italic;margin-top:6px}" +
    ".cochon-bulle i{display:block;font-style:normal;font-size:54px;margin-bottom:4px}" +
    "@keyframes cochon-bulle{0%{opacity:0;transform:translate(-50%,-50%) scale(.6)}" +
    "  10%{opacity:1;transform:translate(-50%,-50%) scale(1.04)}14%{transform:translate(-50%,-50%) scale(1)}" +
    "  85%{opacity:1}100%{opacity:0;transform:translate(-50%,-56%) scale(1)}}" +
    "@media (prefers-reduced-motion:reduce){.cochon{display:none}}";
  document.head.appendChild(css);

  /* --------------------------------------------- « groin groin » */
  function groin(delai) {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      var ctx = groin.ctx || (groin.ctx = new AC());
      var t = ctx.currentTime + (delai || 0);
      [0, 0.2].forEach(function (dt) {             // deux petits grognements
        var o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
        o.type = "sawtooth";
        o.frequency.setValueAtTime(190, t + dt);
        o.frequency.exponentialRampToValueAtTime(95, t + dt + 0.16);
        f.type = "lowpass"; f.frequency.value = 900;
        g.gain.setValueAtTime(0.0001, t + dt);
        g.gain.exponentialRampToValueAtTime(0.18, t + dt + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dt + 0.17);
        o.connect(f); f.connect(g); g.connect(ctx.destination);
        o.start(t + dt); o.stop(t + dt + 0.2);
      });
    } catch (e) { /* pas de son, tant pis */ }
  }

  /* ------------------------------------------------------- parade */
  function parade() {
    if (enCours) return;
    enCours = true;

    var scene = document.createElement("div");
    scene.className = "cochons";
    var emojis = ["🐖", "🐷", "🐖", "🐽", "🐖", "🐷"];
    var n = window.innerWidth < 600 ? 9 : 14;
    for (var i = 0; i < n; i++) {
      var c = document.createElement("div");
      c.className = "cochon";
      var taille = 30 + Math.random() * 34;
      c.style.setProperty("--t", taille + "px");
      c.style.setProperty("--d", (3.6 + Math.random() * 2.4).toFixed(2) + "s");
      c.style.bottom = (4 + Math.random() * 70) + "vh";
      c.style.animationDelay = (i * 0.28 + Math.random() * 0.3).toFixed(2) + "s";
      var s = document.createElement("span");
      s.textContent = emojis[i % emojis.length];
      s.style.animationDelay = (Math.random() * 0.4).toFixed(2) + "s";
      c.appendChild(s);
      scene.appendChild(c);
    }
    document.body.appendChild(scene);

    var bulle = document.createElement("div");
    bulle.className = "cochon-bulle";
    bulle.setAttribute("role", "status");
    bulle.innerHTML = "<i>🐷</i><b>Groin groin !</b>" +
      "<small>La tirelire du voyage de noces vous salue.</small>";
    document.body.appendChild(bulle);

    groin(0); groin(0.9); groin(2.1);

    setTimeout(function () {
      scene.remove(); bulle.remove();
      enCours = false;
    }, 9000);
  }

  /* -------------------------------- déclencheur 1 : taper « cochon » */
  var tampon = "";
  document.addEventListener("keydown", function (e) {
    var cible = e.target;
    if (cible && /^(INPUT|TEXTAREA|SELECT)$/.test(cible.tagName)) return; // pas pendant la saisie du formulaire
    if (!e.key || e.key.length !== 1) return;
    tampon = (tampon + e.key.toLowerCase()).slice(-6);
    if (tampon === "cochon") { tampon = ""; parade(); }
  });

  /* ------------------- déclencheur 2 : 3 touches sur le cœur du Cadeau */
  var coeur = document.querySelector(".cadeau__coeur");
  if (coeur) {
    coeur.style.pointerEvents = "auto";
    var touches = 0, minuteur;
    coeur.addEventListener("click", function () {
      touches++;
      clearTimeout(minuteur);
      minuteur = setTimeout(function () { touches = 0; }, 1500);
      if (touches >= 3) { touches = 0; parade(); }
    });
  }

  /* Petit indice pour les curieux qui ouvrent la console 😉 */
  if (window.console && console.log) {
    console.log("%c🐷 Psst… tape « cochon ».", "font-size:14px;color:#c46a86");
  }
})();

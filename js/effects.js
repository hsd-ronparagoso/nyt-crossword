/* ============================================================
   UnscrambleX — shared visual effects
   Confetti bursts + achievement toasts. Both respect
   prefers-reduced-motion by skipping/softening motion.
   ============================================================ */
(function () {
  "use strict";

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  var COLORS = ["#147860", "#e8b93a", "#e0524a", "#3b7fd6", "#f6f2e8"];

  function confetti(originEl) {
    if (prefersReducedMotion()) return;
    var rect = originEl && originEl.getBoundingClientRect ? originEl.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
    var originX = rect.left + rect.width / 2;
    var originY = rect.top + rect.height / 2;
    var layer = document.createElement("div");
    layer.className = "confetti-layer";
    document.body.appendChild(layer);

    var count = 28;
    for (var i = 0; i < count; i++) {
      var piece = document.createElement("span");
      piece.className = "confetti-piece";
      var angle = Math.random() * Math.PI * 2;
      var dist = 90 + Math.random() * 160;
      var dx = Math.cos(angle) * dist;
      var dy = Math.sin(angle) * dist - 60;
      piece.style.left = originX + "px";
      piece.style.top = originY + "px";
      piece.style.background = COLORS[i % COLORS.length];
      piece.style.setProperty("--dx", dx + "px");
      piece.style.setProperty("--dy", dy + "px");
      piece.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
      piece.style.animationDelay = (Math.random() * 80) + "ms";
      layer.appendChild(piece);
    }
    setTimeout(function () { layer.remove(); }, 1400);
  }

  var toastQueue = [];
  var toastShowing = false;

  function showNextToast() {
    if (toastShowing || !toastQueue.length) return;
    toastShowing = true;
    var achievement = toastQueue.shift();
    var el = document.createElement("div");
    el.className = "achievement-toast";
    el.setAttribute("role", "status");
    el.innerHTML =
      '<span class="achievement-toast__icon"><i class="ph-fill ' + achievement.icon + '"></i></span>' +
      '<span class="achievement-toast__text"><strong>Achievement unlocked</strong><span>' + achievement.title + "</span></span>";
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("is-visible"); });
    setTimeout(function () {
      el.classList.remove("is-visible");
      setTimeout(function () {
        el.remove();
        toastShowing = false;
        showNextToast();
      }, 320);
    }, 3200);
  }

  function achievementToast(achievement) {
    toastQueue.push(achievement);
    showNextToast();
  }

  function xpToast(amount, x, y, unit) {
    if (prefersReducedMotion()) return;
    var el = document.createElement("span");
    el.className = "xp-float";
    var label = unit === "sec" ? "s" : " XP";
    el.textContent = (amount >= 0 ? "+" : "") + amount + label;
    el.style.left = x + "px";
    el.style.top = y + "px";
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 1000);
  }

  function animateCount(el, to, opts) {
    opts = opts || {};
    var from = parseInt((el.textContent || "0").replace(/[^\d-]/g, ""), 10) || 0;
    if (prefersReducedMotion() || from === to) { el.textContent = (opts.prefix || "") + to + (opts.suffix || ""); return; }
    var duration = opts.duration || 500;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(from + (to - from) * eased);
      el.textContent = (opts.prefix || "") + val + (opts.suffix || "");
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  window.Effects = {
    prefersReducedMotion: prefersReducedMotion,
    confetti: confetti,
    achievementToast: achievementToast,
    xpToast: xpToast,
    animateCount: animateCount,
  };

  if (window.PlayerState) {
    window.PlayerState.subscribe(function (event, payload) {
      if (event === "achievement") window.Effects.achievementToast(payload);
    });
  }
})();

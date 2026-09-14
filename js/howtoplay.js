/* ============================================================
   WordArcade — How to Play system
   - A global hub (nav icon) listing every game.
   - A detailed, per-game instructions modal (goal, steps, an
     animated example, scoring, tips, hints) — reopenable any
     time from a persistent "?" button inside each game.
   - A first-time-only onboarding overlay + interactive tutorial,
     gated in front of the actual game so timers never start
     while it's showing.
   ============================================================ */
(function () {
  "use strict";

  var SEEN_KEY = "ux_tutorial_seen_v1";
  var reduced = window.Effects.prefersReducedMotion();

  function seenMap() {
    try { return JSON.parse(localStorage.getItem(SEEN_KEY)) || {}; } catch (e) { return {}; }
  }
  function markSeen(gameId) {
    var m = seenMap();
    m[gameId] = true;
    try { localStorage.setItem(SEEN_KEY, JSON.stringify(m)); } catch (e) {}
  }
  function hasSeen(gameId) { return !!seenMap()[gameId]; }

  /* ---------------- Help modal shell (stacks above the game modal) ---------------- */
  var root = null;
  function ensureRoot() {
    if (root) return root;
    root = document.createElement("div");
    root.className = "help-modal";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.innerHTML =
      '<div class="help-modal__backdrop"></div>' +
      '<div class="help-modal__panel">' +
      '  <div class="help-modal__head">' +
      '    <button type="button" class="help-modal__back" data-help-back hidden><i class="ph-bold ph-arrow-left"></i> All Games</button>' +
      '    <span class="help-modal__spacer"></span>' +
      '    <button type="button" class="help-modal__close" aria-label="Close"><i class="ph-bold ph-x"></i></button>' +
      "  </div>" +
      '  <div class="help-modal__body"></div>' +
      "</div>";
    document.body.appendChild(root);
    root.querySelector(".help-modal__backdrop").addEventListener("click", closeHelp);
    root.querySelector(".help-modal__close").addEventListener("click", closeHelp);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && root.classList.contains("is-open")) closeHelp(); });
    return root;
  }
  function closeHelp() {
    if (!root) return;
    root.classList.remove("is-open");
  }
  function openHelpShell() {
    var r = ensureRoot();
    r.classList.add("is-open");
    return r.querySelector(".help-modal__body");
  }

  /* ---------------- Animated example renderers ---------------- */
  function renderExample(host, type) {
    host.innerHTML = "";
    host.className = "htp-example htp-example--" + type;
    if (type === "wordle") return exampleWordle(host);
    if (type === "scramble") return exampleScramble(host);
    if (type === "timer") return exampleTimer(host);
    if (type === "clues") return exampleClues(host);
    if (type === "crossword") return exampleCrossword(host);
  }

  function exampleWordle(host) {
    var guess = "REACT", target = "CRANE";
    var result = window.scoreWordleGuess(guess, target);
    var row = document.createElement("div");
    row.className = "wg-row htp-wg-row";
    row.style.setProperty("--wg-len", 5);
    guess.split("").forEach(function () {
      var t = document.createElement("div");
      t.className = "wg-tile";
      row.appendChild(t);
    });
    host.appendChild(row);
    var caption = document.createElement("p");
    caption.className = "htp-example__caption";
    caption.textContent = "Guessing “REACT” against the word “CRANE”";
    host.appendChild(caption);

    function play() {
      var tiles = row.querySelectorAll(".wg-tile");
      tiles.forEach(function (t) { t.className = "wg-tile"; t.textContent = ""; });
      guess.split("").forEach(function (ch, i) {
        setTimeout(function () {
          tiles[i].textContent = ch;
          tiles[i].classList.add("wg-tile--pop");
        }, reduced ? 0 : i * 150);
      });
      guess.split("").forEach(function (ch, i) {
        setTimeout(function () {
          tiles[i].classList.add("wg-tile--flip");
          setTimeout(function () { tiles[i].classList.add("wg-tile--" + result[i]); }, reduced ? 0 : 170);
        }, reduced ? 0 : 900 + i * 220);
      });
    }
    play();
    if (!reduced) host._loop = setInterval(play, 4200);
  }

  function exampleScramble(host) {
    var target = "APPLE", scrambled = "PLEAP";
    var slotsRow = document.createElement("div");
    slotsRow.className = "scramble-slots htp-scramble-slots";
    var sourceRow = document.createElement("div");
    sourceRow.className = "scramble-source htp-scramble-source";
    target.split("").forEach(function () {
      var s = document.createElement("div");
      s.className = "scramble-slot";
      slotsRow.appendChild(s);
    });
    scrambled.split("").forEach(function (ch) {
      var t = document.createElement("div");
      t.className = "scramble-tile htp-static-tile";
      t.textContent = ch;
      sourceRow.appendChild(t);
    });
    host.appendChild(slotsRow);
    host.appendChild(sourceRow);
    var caption = document.createElement("p");
    caption.className = "htp-example__caption";
    caption.textContent = "“PLEAP” unscrambles into “APPLE”";
    host.appendChild(caption);

    function play() {
      var slots = slotsRow.querySelectorAll(".scramble-slot");
      var sourceTiles = sourceRow.querySelectorAll(".htp-static-tile");
      slots.forEach(function (s) { s.textContent = ""; s.classList.remove("is-filled"); });
      sourceTiles.forEach(function (t) { t.classList.remove("is-used"); });
      var order = [3, 0, 4, 1, 2]; // indices into "PLEAP" (P,L,E,A,P) spelling APPLE
      order.forEach(function (srcIdx, i) {
        setTimeout(function () {
          slots[i].textContent = target[i];
          slots[i].classList.add("is-filled");
          sourceTiles[srcIdx].classList.add("is-used");
        }, reduced ? 0 : 500 + i * 400);
      });
    }
    play();
    if (!reduced) host._loop = setInterval(play, 4400);
  }

  function exampleTimer(host) {
    host.innerHTML =
      '<div class="htp-timer-bar"><div class="htp-timer-bar__fill"></div></div>' +
      '<div class="htp-timer-score">Score: <span data-htp-score>0</span></div>' +
      '<p class="htp-example__caption">Solve before the bar empties, your score climbs with every word.</p>';
    var fill = host.querySelector(".htp-timer-bar__fill");
    var scoreEl = host.querySelector("[data-htp-score]");
    function play() {
      var score = 0;
      fill.style.transition = "none";
      fill.style.width = "100%";
      void fill.offsetWidth;
      scoreEl.textContent = "0";
      if (reduced) { fill.style.width = "35%"; scoreEl.textContent = "220"; return; }
      fill.style.transition = "width 3.6s linear";
      requestAnimationFrame(function () { fill.style.width = "0%"; });
      [800, 1800, 2800].forEach(function (t, i) {
        setTimeout(function () { score += 100 + i * 20; scoreEl.textContent = score; }, t);
      });
    }
    play();
    if (!reduced) host._loop = setInterval(play, 4200);
  }

  function exampleClues(host) {
    host.innerHTML =
      '<div class="htp-clue-card"><i class="ph-bold ph-shapes"></i> Category: Something in a kitchen</div>' +
      '<div class="htp-clue-card" data-clue-2 hidden><i class="ph-bold ph-flag"></i> First letter: K</div>' +
      '<div class="htp-clue-answer" data-clue-answer hidden><i class="ph-fill ph-check-circle"></i> KNIFE</div>' +
      '<p class="htp-example__caption">Guess right away, or reveal another clue first.</p>';
    function play() {
      var c2 = host.querySelector("[data-clue-2]");
      var ans = host.querySelector("[data-clue-answer]");
      c2.hidden = true; ans.hidden = true;
      setTimeout(function () { c2.hidden = false; }, reduced ? 0 : 1200);
      setTimeout(function () { ans.hidden = false; }, reduced ? 0 : 2400);
    }
    play();
    if (!reduced) host._loop = setInterval(play, 4200);
  }

  function exampleCrossword(host) {
    var word = "TOLD";
    var boxes = document.createElement("div");
    boxes.className = "minicross-boxes htp-minicross-boxes";
    word.split("").forEach(function () {
      var b = document.createElement("div");
      b.className = "minicross-box htp-static-box";
      boxes.appendChild(b);
    });
    host.appendChild(boxes);
    var caption = document.createElement("p");
    caption.className = "htp-example__caption";
    caption.textContent = '“Informed” → T-O-L-D';
    host.appendChild(caption);
    function play() {
      var cells = boxes.querySelectorAll(".htp-static-box");
      cells.forEach(function (c) { c.textContent = ""; c.classList.remove("is-solved"); });
      word.split("").forEach(function (ch, i) {
        setTimeout(function () { cells[i].textContent = ch; cells[i].classList.add("is-solved"); }, reduced ? 0 : i * 350 + 300);
      });
    }
    play();
    if (!reduced) host._loop = setInterval(play, 3600);
  }

  function stopExampleLoop(host) {
    if (host && host._loop) { clearInterval(host._loop); host._loop = null; }
  }

  /* ---------------- Detail view for one game ---------------- */
  function renderDetail(body, gameId) {
    var g = window.HOW_TO_PLAY[gameId];
    if (!g) return;
    body.innerHTML =
      '<div class="htp-detail">' +
      '<div class="htp-detail__head">' +
      '<span class="htp-detail__icon"><i class="ph-fill ' + g.icon + '"></i></span>' +
      "<div><h3>" + g.title + '</h3><span class="chip chip--diff">' + g.difficulty + "</span></div>" +
      "</div>" +
      "<p class=\"htp-detail__tagline\">" + g.tagline + "</p>" +

      '<h4 class="htp-section-title"><i class="ph-bold ph-flag-checkered"></i> Your Goal</h4>' +
      "<p>" + g.goal + "</p>" +

      '<h4 class="htp-section-title"><i class="ph-bold ph-list-numbers"></i> How It Works</h4>' +
      '<ol class="htp-steps">' + g.steps.map(function (s) { return "<li>" + s + "</li>"; }).join("") + "</ol>" +

      '<h4 class="htp-section-title"><i class="ph-bold ph-play-circle"></i> Example</h4>' +
      '<div class="htp-example-host" data-example-host></div>' +

      '<h4 class="htp-section-title"><i class="ph-bold ph-sparkle"></i> Scoring</h4>' +
      '<ul class="htp-bullets">' + g.scoring.map(function (s) { return "<li>" + s + "</li>"; }).join("") + "</ul>" +

      '<h4 class="htp-section-title"><i class="ph-bold ph-lightbulb-filament"></i> Tips</h4>' +
      '<ul class="htp-bullets">' + g.tips.map(function (s) { return "<li>" + s + "</li>"; }).join("") + "</ul>" +

      '<h4 class="htp-section-title"><i class="ph-bold ph-lightbulb"></i> Hints Available</h4>' +
      '<div class="htp-hint-list">' + g.hints.map(function (h) {
        return '<div class="htp-hint-preview"><i class="ph-bold ' + h.icon + '"></i><span><strong>' + h.label + "</strong>, " + h.desc + '</span><span class="htp-hint-preview__cost">−' + h.cost + (h.unit === "sec" ? "s" : " XP") + "</span></div>";
      }).join("") + "</div>" +

      '<button type="button" class="btn btn--primary btn--block htp-play-btn" data-play="' + gameId + '"><i class="ph-fill ph-play"></i> Play ' + g.title + "</button>" +
      "</div>";

    var exHost = body.querySelector("[data-example-host]");
    renderExample(exHost, g.example);
    body.querySelector(".htp-play-btn").addEventListener("click", closeHelp);
  }

  /* ---------------- Hub view (all games) ---------------- */
  function renderHub(body) {
    body.innerHTML =
      '<div class="htp-hub-intro"><i class="ph-fill ph-book-open"></i><p>Pick a game to see exactly how it works, goal, rules, scoring and every hint.</p></div>' +
      '<div class="htp-hub-grid">' +
      window.HOW_TO_PLAY_ORDER.map(function (id) {
        var g = window.HOW_TO_PLAY[id];
        return (
          '<button type="button" class="htp-hub-card" data-open-detail="' + id + '">' +
          '<span class="htp-hub-card__icon"><i class="ph-fill ' + g.icon + '"></i></span>' +
          '<span class="htp-hub-card__title">' + g.title + "</span>" +
          '<span class="htp-hub-card__tagline">' + g.tagline + "</span>" +
          "</button>"
        );
      }).join("") +
      "</div>";
    body.querySelectorAll("[data-open-detail]").forEach(function (btn) {
      btn.addEventListener("click", function () { openDetailFromHub(btn.getAttribute("data-open-detail")); });
    });
  }

  function openDetailFromHub(gameId) {
    var r = ensureRoot();
    var body = r.querySelector(".help-modal__body");
    stopExampleLoop(body.querySelector("[data-example-host]"));
    renderDetail(body, gameId);
    r.querySelector("[data-help-back]").hidden = false;
  }

  function openHub() {
    var body = openHelpShell();
    ensureRoot().querySelector("[data-help-back]").hidden = true;
    renderHub(body);
    var backBtn = ensureRoot().querySelector("[data-help-back]");
    backBtn.onclick = function () {
      stopExampleLoop(body.querySelector("[data-example-host]"));
      renderHub(body);
      backBtn.hidden = true;
    };
  }

  function openDetail(gameId) {
    var body = openHelpShell();
    var backBtn = ensureRoot().querySelector("[data-help-back]");
    backBtn.hidden = false;
    backBtn.onclick = function () {
      stopExampleLoop(body.querySelector("[data-example-host]"));
      renderHub(body);
      backBtn.hidden = true;
    };
    renderDetail(body, gameId);
  }

  /* ---------------- First-time onboarding gate ---------------- */
  function gate(gameId, container, startGame) {
    var g = window.HOW_TO_PLAY[gameId];
    if (!g || hasSeen(gameId)) return startGame();

    var holder = { cleanup: null };
    var overlay = document.createElement("div");
    overlay.className = "onboarding-overlay";
    container.style.position = "relative";
    container.appendChild(overlay);

    function begin() {
      overlay.remove();
      container.style.position = "";
      holder.cleanup = startGame();
    }

    function renderIntro() {
      overlay.innerHTML =
        '<div class="onboarding-card">' +
        '<span class="onboarding-card__icon"><i class="ph-fill ' + g.icon + '"></i></span>' +
        "<h3>New to " + g.title + "?</h3>" +
        "<p>" + g.tagline + "</p>" +
        '<div class="onboarding-card__actions">' +
        '<button type="button" class="btn btn--primary" data-onb-tutorial><i class="ph-fill ph-book-open"></i> How to Play</button>' +
        '<button type="button" class="btn btn--ghost" data-onb-skip>Skip <i class="ph-bold ph-arrow-right"></i></button>' +
        "</div></div>";
      overlay.querySelector("[data-onb-skip]").addEventListener("click", function () { markSeen(gameId); begin(); });
      overlay.querySelector("[data-onb-tutorial]").addEventListener("click", renderStepper);
    }

    function renderStepper() {
      var step = 0;
      var steps = g.tutorial;
      function draw() {
        var s = steps[step];
        overlay.innerHTML =
          '<div class="onboarding-card onboarding-card--stepper">' +
          '<span class="onboarding-step-tag">STEP ' + (step + 1) + " OF " + steps.length + "</span>" +
          "<h3>" + s.title + "</h3>" +
          "<p>" + s.body + "</p>" +
          '<div class="onboarding-dots">' + steps.map(function (_, i) { return '<span class="onboarding-dot' + (i === step ? " is-active" : "") + '"></span>'; }).join("") + "</div>" +
          '<div class="onboarding-card__actions">' +
          (step > 0 ? '<button type="button" class="btn btn--ghost" data-onb-back><i class="ph-bold ph-arrow-left"></i> Back</button>' : "<span></span>") +
          (step < steps.length - 1
            ? '<button type="button" class="btn btn--primary" data-onb-next>Next <i class="ph-bold ph-arrow-right"></i></button>'
            : '<button type="button" class="btn btn--primary" data-onb-done><i class="ph-fill ph-check"></i> Done</button>') +
          "</div></div>";
        var back = overlay.querySelector("[data-onb-back]");
        if (back) back.addEventListener("click", function () { step -= 1; draw(); });
        var next = overlay.querySelector("[data-onb-next]");
        if (next) next.addEventListener("click", function () { step += 1; draw(); });
        var done = overlay.querySelector("[data-onb-done]");
        if (done) done.addEventListener("click", function () { markSeen(gameId); begin(); });
      }
      draw();
    }

    renderIntro();
    return function cleanup() { if (holder.cleanup) holder.cleanup(); };
  }

  /* ---------------- Persistent "Need help?" trigger for reopening ---------------- */
  function attachHelpButton(headEl, gameId) {
    var btn = headEl.querySelector("[data-modal-help]");
    if (!btn) return;
    btn.hidden = false;
    btn.onclick = function () { openDetail(gameId); };
  }

  window.HowToPlay = {
    openHub: openHub,
    open: openDetail,
    gate: gate,
    attachHelpButton: attachHelpButton,
    hasSeen: hasSeen,
  };
})();

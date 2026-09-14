/* ============================================================
   UnscrambleX — homepage interactivity
   ============================================================ */
(function () {
  "use strict";

  var reduced = window.Effects.prefersReducedMotion();
  var SITE_EPOCH = new Date(2024, 0, 1);

  function dayIndex() { return window.PlayerState.dayOfYear(new Date()); }
  function todaysEntry() {
    var bank = window.ANSWER_WORDS;
    return bank[dayIndex() % bank.length];
  }
  function puzzleNumber() {
    return Math.max(1, Math.floor((Date.now() - SITE_EPOCH.getTime()) / 86400000) + 1);
  }
  function diffStars(diff) {
    var map = { Easy: 2, Medium: 3, Tricky: 4, Hard: 5 };
    var n = map[diff] || 3;
    return "★".repeat(n) + "☆".repeat(5 - n);
  }
  function diffTime(diff) {
    var map = { Easy: "~1 min", Medium: "~2 min", Tricky: "~3 min", Hard: "~4 min" };
    return map[diff] || "~2 min";
  }

  /* ---------------- Header / mobile nav ---------------- */
  function initNav() {
    var toggle = document.getElementById("nav-toggle");
    var panel = document.getElementById("mobile-panel");
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    panel.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        panel.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    var header = document.getElementById("site-header");
    var lastY = window.scrollY;
    window.addEventListener("scroll", function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
      lastY = window.scrollY;
    }, { passive: true });
  }

  /* ---------------- Today badge ---------------- */
  function initTodayBadge() {
    var el = document.querySelector("[data-today-badge]");
    var d = new Date();
    var text = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    el.innerHTML = '<span class="dot"></span> ' + text + " · Word #" + puzzleNumber();
  }

  /* ---------------- Gamification header + hero + journey ---------------- */
  function renderGamification() {
    var s = window.PlayerState.get();
    var lp = window.PlayerState.levelProgress(s.xp);

    document.querySelectorAll("[data-streak-val]").forEach(function (el) { el.textContent = s.streakCurrent; });
    document.querySelectorAll("[data-xp-val]").forEach(function (el) { el.textContent = s.xp; });
    document.querySelectorAll("[data-level-val]").forEach(function (el) { el.textContent = lp.level; });

    setText("[data-hs-streak]", s.streakCurrent);
    setText("[data-hs-level]", lp.level);
    setText("[data-hs-solved]", s.wordsSolved);

    setText("[data-ring-level]", lp.level);
    var ring = document.querySelector("[data-xp-ring]");
    if (ring) ring.style.setProperty("--pct", lp.pct);
    var bar = document.querySelector("[data-xp-bar-fill]");
    if (bar) bar.style.width = lp.pct + "%";
    setText("[data-xp-into]", lp.xpIntoLevel);
    setText("[data-xp-need]", lp.xpForLevel);

    setText("[data-jt-streak]", s.streakCurrent);
    setText("[data-jt-best]", s.streakBest);
    setText("[data-jt-games]", s.gamesCompleted);
    setText("[data-jt-words]", s.wordsSolved);
    var acc = window.PlayerState.accuracyPct();
    setText("[data-jt-accuracy]", acc == null ? "—" : acc + "%");

    setText("[data-daily-streaktext]", s.streakCurrent > 0 ? s.streakCurrent + "-day streak" : "No streak yet");
    var cta = document.querySelector("[data-daily-cta]");
    if (cta) {
      var done = window.PlayerState.isDailyDoneToday();
      cta.innerHTML = done
        ? '<i class="ph-fill ph-check-circle"></i> Completed — Play Again Tomorrow'
        : '<i class="ph-fill ph-play"></i> Play Today';
      cta.classList.toggle("btn--done", done);
    }
  }

  function setText(sel, val) {
    document.querySelectorAll(sel).forEach(function (el) { el.textContent = val; });
  }

  /* ---------------- Daily card content ---------------- */
  function initDailyCard() {
    var entry = todaysEntry();
    setText("[data-daily-number]", "UnscrambleX #" + String(puzzleNumber()).padStart(4, "0"));
    setText("[data-daily-diff]", entry.diff);
    setText("[data-daily-time]", diffTime(entry.diff));
    var stars = document.querySelector("[data-daily-stars]");
    if (stars) stars.textContent = diffStars(entry.diff);
  }

  /* ---------------- Countdown to next midnight ---------------- */
  function initCountdown() {
    function tick() {
      var now = new Date();
      var next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      var diff = Math.max(0, next - now);
      var h = Math.floor(diff / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      setText("[data-c-h]", String(h).padStart(2, "0"));
      setText("[data-c-m]", String(m).padStart(2, "0"));
      setText("[data-c-s]", String(s).padStart(2, "0"));
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------------- Hero demo board ---------------- */
  function initHeroBoard() {
    var el = document.querySelector("[data-hero-board]");
    if (!el) return;
    var target = "PLANT";
    var guesses = ["STARE", "CRANE", "PLANT"];
    var rows = guesses.map(function (g) { return { guess: g, result: window.scoreWordleGuess(g, target) }; });

    function buildBoard() {
      var html = "";
      for (var r = 0; r < 4; r++) {
        html += '<div class="wg-row" data-hrow="' + r + '">';
        for (var c = 0; c < 5; c++) html += '<div class="wg-tile" data-hrow="' + r + '" data-hcol="' + c + '"></div>';
        html += "</div>";
      }
      el.innerHTML = html;
    }

    function resetTiles() {
      el.querySelectorAll(".wg-tile").forEach(function (t) {
        t.className = "wg-tile";
        t.textContent = "";
      });
    }

    function playSequence() {
      resetTiles();
      var delayBase = 0;
      rows.forEach(function (row, r) {
        row.guess.split("").forEach(function (ch, c) {
          var tile = el.querySelector('.wg-tile[data-hrow="' + r + '"][data-hcol="' + c + '"]');
          setTimeout(function () {
            tile.textContent = ch;
            tile.classList.add("wg-tile--pop");
          }, delayBase + c * 140);
        });
        var rowRevealStart = delayBase + row.guess.length * 140 + 260;
        row.guess.split("").forEach(function (ch, c) {
          var tile = el.querySelector('.wg-tile[data-hrow="' + r + '"][data-hcol="' + c + '"]');
          setTimeout(function () {
            tile.classList.add("wg-tile--flip");
            setTimeout(function () { tile.classList.add("wg-tile--" + row.result[c]); }, 180);
          }, rowRevealStart + c * 200);
        });
        delayBase = rowRevealStart + row.guess.length * 200 + 500;
      });

      setTimeout(function () {
        el.querySelectorAll('.wg-tile[data-hrow="2"]').forEach(function (t) { t.classList.add("wg-tile--win"); });
        window.Effects.confetti(el);
      }, delayBase);

      if (!reduced) {
        clearTimeout(playSequence._loop);
        playSequence._loop = setTimeout(playSequence, delayBase + 2200);
      }
    }

    buildBoard();
    if (reduced) {
      // Show the final, solved state directly — no looping animation.
      rows.forEach(function (row, r) {
        row.guess.split("").forEach(function (ch, c) {
          var tile = el.querySelector('.wg-tile[data-hrow="' + r + '"][data-hcol="' + c + '"]');
          tile.textContent = ch;
          tile.classList.add("wg-tile--" + row.result[c]);
        });
      });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { playSequence(); io.disconnect(); }
        });
      }, { threshold: 0.4 });
      io.observe(el);
    }
  }

  /* ---------------- Hero particles ---------------- */
  function initHeroParticles() {
    var host = document.querySelector("[data-particles]");
    if (!host || reduced) return;
    var letters = "SCRABBLE".split("");
    for (var i = 0; i < 10; i++) {
      var span = document.createElement("span");
      span.className = "hero-particle";
      span.textContent = letters[i % letters.length];
      span.style.left = (Math.random() * 94 + 2) + "%";
      span.style.top = (Math.random() * 88 + 4) + "%";
      span.style.setProperty("--dur", (7 + Math.random() * 5).toFixed(1) + "s");
      span.style.setProperty("--delay", (Math.random() * 4).toFixed(1) + "s");
      span.style.setProperty("--rot", (Math.random() * 26 - 13) + "deg");
      host.appendChild(span);
    }
  }

  /* ---------------- Hero video: pause off-screen, respect reduced motion ---------------- */
  function initHeroVideo() {
    var video = document.querySelector("[data-hero-video]");
    if (!video) return;
    if (reduced) { video.removeAttribute("autoplay"); video.pause(); return; }
    video.setAttribute("preload", "auto");
    video.play().catch(function () {});
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) video.play().catch(function () {});
        else video.pause();
      });
    }, { threshold: 0.1 });
    io.observe(video);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) video.pause(); else if (!reduced) video.play().catch(function () {});
    });
  }

  /* ---------------- Achievements grid ---------------- */
  function renderAchievements() {
    var host = document.querySelector("[data-achievements]");
    if (!host) return;
    var s = window.PlayerState.get();
    host.innerHTML = window.ACHIEVEMENTS.map(function (a) {
      var unlocked = !!s.unlocked[a.id];
      return (
        '<div class="achievement-card' + (unlocked ? " is-unlocked" : "") + '">' +
        '<div class="achievement-card__icon"><i class="' + (unlocked ? "ph-fill" : "ph-bold") + " " + a.icon + '"></i></div>' +
        '<h4>' + a.title + "</h4>" +
        "<p>" + a.desc + "</p>" +
        '<span class="achievement-card__state">' + (unlocked ? '<i class="ph-fill ph-check-circle"></i> Unlocked' : '<i class="ph-bold ph-lock-simple"></i> Locked') + "</span>" +
        "</div>"
      );
    }).join("");
  }

  /* ---------------- Letter intelligence bars ---------------- */
  function renderLetterBars() {
    var host = document.querySelector("[data-letter-bars]");
    if (!host) return;
    var max = window.LETTER_FREQUENCY[0].pct;
    host.innerHTML = window.LETTER_FREQUENCY.map(function (row) {
      return (
        '<div class="letter-bar" tabindex="0" data-pct="' + row.pct + '">' +
        '<span class="letter-bar__letter">' + row.letter + "</span>" +
        '<span class="letter-bar__track"><span class="letter-bar__fill" style="--w:0%" data-target="' + ((row.pct / max) * 100) + '%"></span></span>' +
        '<span class="letter-bar__pct">' + row.pct + "%</span>" +
        "</div>"
      );
    }).join("");

    var bars = host.querySelectorAll(".letter-bar__fill");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        bars.forEach(function (fill, i) {
          setTimeout(function () { fill.style.setProperty("--w", fill.getAttribute("data-target")); fill.style.width = fill.getAttribute("data-target"); }, reduced ? 0 : i * 70);
        });
        io.disconnect();
      });
    }, { threshold: 0.3 });
    io.observe(host);
  }

  /* ---------------- Word Reveal (mystery word) ---------------- */
  function initMysteryReveal() {
    var tilesHost = document.querySelector("[data-mystery-tiles]");
    var defEl = document.querySelector("[data-mystery-def]");
    var badgesEl = document.querySelector("[data-mystery-badges]");
    var btn = document.querySelector("[data-mystery-btn]");
    if (!tilesHost) return;
    var entry = todaysEntry();
    var revealed = false;

    function buildTiles(showLetters) {
      tilesHost.innerHTML = entry.word.split("").map(function (ch, i) {
        return '<div class="mystery-tile" data-mi="' + i + '">' + (showLetters ? ch : "?") + "</div>";
      }).join("");
    }
    buildTiles(false);

    btn.addEventListener("click", function () {
      if (revealed) return;
      revealed = true;
      var tiles = tilesHost.querySelectorAll(".mystery-tile");
      btn.disabled = true;
      btn.innerHTML = '<i class="ph-fill ph-check"></i> Revealed';

      tiles.forEach(function (t) { t.classList.add("mystery-tile--shake"); });
      setTimeout(function () {
        tiles.forEach(function (t, i) {
          setTimeout(function () {
            t.classList.remove("mystery-tile--shake");
            t.classList.add("mystery-tile--flip");
            setTimeout(function () {
              t.textContent = entry.word[i];
              t.classList.add("mystery-tile--correct");
            }, reduced ? 0 : 170);
          }, reduced ? 0 : i * 160);
        });
        setTimeout(function () {
          defEl.textContent = entry.def;
          defEl.hidden = false;
          badgesEl.hidden = false;
          badgesEl.innerHTML =
            '<span class="chip chip--diff">' + diffStars(entry.diff) + " " + entry.diff + "</span>" +
            '<span class="chip chip--word">' + entry.word.length + " letters</span>";
          window.Effects.confetti(tilesHost);
        }, reduced ? 60 : tiles.length * 160 + 320);
      }, reduced ? 0 : 500);
    });
  }

  /* ---------------- Hint system ---------------- */
  function initHints() {
    var host = document.querySelector("[data-hint-list]");
    if (!host) return;
    var entry = todaysEntry();
    var todayKey = window.PlayerState.todayKey();
    var vowels = entry.word.split("").filter(function (c) { return "AEIOU".indexOf(c) !== -1; }).length;

    var hints = [
      { cost: 10, label: "Reveal the number of vowels", icon: "ph-drop", value: vowels + " vowel" + (vowels === 1 ? "" : "s") },
      { cost: 15, label: "Reveal the first letter", icon: "ph-text-aa", value: "Starts with “" + entry.word[0] + "”" },
      { cost: 25, label: "Reveal the definition", icon: "ph-book-open", value: entry.def },
    ];

    function render() {
      var unlocked = window.PlayerState.hintsUnlockedFor(todayKey);
      var s = window.PlayerState.get();
      host.innerHTML = hints.map(function (h, i) {
        var isUnlocked = unlocked.indexOf(i) !== -1;
        var isLockedByOrder = i > 0 && unlocked.indexOf(i - 1) === -1;
        return (
          '<div class="hint-card' + (isUnlocked ? " is-unlocked" : "") + '">' +
          '<div class="hint-card__icon"><i class="' + (isUnlocked ? "ph-fill" : "ph-bold") + " " + h.icon + '"></i></div>' +
          '<div class="hint-card__body">' +
          "<h4>Hint " + (i + 1) + "</h4>" +
          "<p>" + (isUnlocked ? h.value : h.label) + "</p>" +
          "</div>" +
          (isUnlocked
            ? '<span class="hint-card__done"><i class="ph-fill ph-check-circle"></i></span>'
            : '<button type="button" class="btn btn--ghost btn--sm" data-hint-btn="' + i + '"' + (isLockedByOrder ? " disabled" : "") + ">−" + h.cost + " XP</button>") +
          "</div>"
        );
      }).join("");

      host.querySelectorAll("[data-hint-btn]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var idx = Number(btn.getAttribute("data-hint-btn"));
          if (s.xp < hints[idx].cost) {
            btn.classList.add("is-shake");
            setTimeout(function () { btn.classList.remove("is-shake"); }, 400);
            return;
          }
          window.PlayerState.addXp(-hints[idx].cost, "hint");
          window.PlayerState.unlockHint(todayKey, idx);
          render();
        });
      });
    }
    render();
    window.PlayerState.subscribe(function (evt) { if (evt === "xp") render(); });
  }

  /* ---------------- Word tools ---------------- */
  function initWordTools() {
    var form = document.querySelector("[data-tools-form]");
    if (!form) return;
    var input = form.querySelector("[data-tools-input]");
    var results = document.querySelector("[data-tools-results]");
    var mode = "unscramble";

    document.querySelectorAll("[data-tool-tab]").forEach(function (tab) {
      tab.addEventListener("click", function () {
        document.querySelectorAll("[data-tool-tab]").forEach(function (t) { t.classList.remove("is-active"); t.setAttribute("aria-selected", "false"); });
        tab.classList.add("is-active");
        tab.setAttribute("aria-selected", "true");
        mode = tab.getAttribute("data-tool-tab");
        var placeholders = {
          unscramble: "Type letters, e.g. RATSE",
          anagram: "Type a 5-letter word, e.g. STARE",
          starts: "Type a starting fragment, e.g. CR",
          contains: "Type letters the word contains, e.g. AN",
        };
        input.placeholder = placeholders[mode];
        results.innerHTML = "";
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = input.value.trim();
      if (!val) return;
      results.innerHTML = '<p class="tools-loading">Searching…</p>';
      window.WordBank.load().then(function () {
        var found = [];
        if (mode === "unscramble") found = window.WordBank.findFromLetters(val, { exactLength: val.length >= 5 });
        else if (mode === "anagram") found = window.WordBank.findAnagrams(val);
        else if (mode === "starts") found = window.WordBank.findStartsWith(val);
        else if (mode === "contains") found = window.WordBank.findContains(val);

        found = found.slice(0, 60);
        results.innerHTML = found.length
          ? ('<p class="tools-count">' + found.length + (found.length === 60 ? "+" : "") + " match" + (found.length === 1 ? "" : "es") + "</p>" +
            '<div class="tools-chips">' + found.map(function (w) { return '<span class="tools-chip">' + w + "</span>"; }).join("") + "</div>")
          : '<p class="tools-count">No matches found — try different letters.</p>';
      });
    });
  }

  /* ---------------- FAQ accordion ---------------- */
  function initFaq() {
    document.querySelectorAll(".faq-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".faq-item");
        var open = item.classList.contains("is-open");
        document.querySelectorAll(".faq-item").forEach(function (i) {
          i.classList.remove("is-open");
          i.querySelector(".faq-toggle").setAttribute("aria-expanded", "false");
        });
        if (!open) {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  /* ---------------- Scroll reveal ---------------- */
  function initScrollReveal() {
    var els = document.querySelectorAll(".reveal-on-scroll");
    if (reduced) { els.forEach(function (el) { el.classList.add("is-visible"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- Boot ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initTodayBadge();
    initDailyCard();
    initCountdown();
    initHeroBoard();
    initHeroParticles();
    initHeroVideo();
    renderAchievements();
    renderLetterBars();
    initMysteryReveal();
    initHints();
    initWordTools();
    initFaq();
    initScrollReveal();
    renderGamification();

    window.PlayerState.subscribe(function () { renderGamification(); renderAchievements(); });
  });
})();

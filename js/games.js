/* ============================================================
   WordArcade — game modal shell + mini-game engines
   Every "Play" button on the page routes through GameModal.open,
   which hands a clean container to one of the launch functions
   below. Nothing here ever navigates away from the page.

   Each game is gated behind window.HowToPlay.gate() so a first-
   time player sees the onboarding overlay before anything (a
   timer included) actually starts, and every modal gets a
   persistent "?" button wired to that game's full instructions.
   ============================================================ */
(function () {
  "use strict";

  var reduced = window.Effects.prefersReducedMotion();

  /* ---------------- Modal shell ---------------- */
  var modalRoot = null;
  var activeCleanup = null;
  var lastFocused = null;

  function ensureModal() {
    if (modalRoot) return modalRoot;
    modalRoot = document.createElement("div");
    modalRoot.className = "game-modal";
    modalRoot.setAttribute("role", "dialog");
    modalRoot.setAttribute("aria-modal", "true");
    modalRoot.innerHTML =
      '<div class="game-modal__backdrop"></div>' +
      '<div class="game-modal__panel">' +
      '  <div class="game-modal__head">' +
      '    <span class="game-modal__title"></span>' +
      '    <span class="game-modal__spacer"></span>' +
      '    <button type="button" class="game-modal__help" data-modal-help hidden aria-label="How to play">' +
      '      <i class="ph-bold ph-question"></i>' +
      "    </button>" +
      '    <button type="button" class="game-modal__close" aria-label="Close game">' +
      '      <i class="ph-bold ph-x"></i>' +
      "    </button>" +
      "  </div>" +
      '  <div class="game-modal__body"></div>' +
      "</div>";
    document.body.appendChild(modalRoot);
    modalRoot.querySelector(".game-modal__backdrop").addEventListener("click", closeModal);
    modalRoot.querySelector(".game-modal__close").addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modalRoot.classList.contains("is-open")) closeModal();
    });
    return modalRoot;
  }

  function closeModal() {
    if (!modalRoot || !modalRoot.classList.contains("is-open")) return;
    modalRoot.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    if (activeCleanup) { try { activeCleanup(); } catch (e) {} activeCleanup = null; }
    setTimeout(function () { modalRoot.querySelector(".game-modal__body").innerHTML = ""; }, 220);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function openModal(title, launchFn, gameId) {
    var root = ensureModal();
    lastFocused = document.activeElement;
    root.querySelector(".game-modal__title").textContent = title;
    var body = root.querySelector(".game-modal__body");
    body.innerHTML = "";
    root.classList.add("is-open");
    document.body.classList.add("modal-open");
    if (gameId && window.HowToPlay) window.HowToPlay.attachHelpButton(root, gameId);
    activeCleanup = launchFn(body, closeModal) || null;
    var closeBtn = root.querySelector(".game-modal__close");
    if (closeBtn) closeBtn.focus();
  }

  window.GameModal = { open: openModal, close: closeModal };

  /* ---------------- Shared result panel ---------------- */
  function resultPanel(container, opts) {
    var panel = document.createElement("div");
    panel.className = "game-result";
    panel.innerHTML =
      '<div class="game-result__icon"><i class="ph-fill ' + (opts.icon || "ph-trophy") + '"></i></div>' +
      '<h3 class="game-result__title">' + opts.title + "</h3>" +
      '<p class="game-result__subtitle">' + (opts.subtitle || "") + "</p>" +
      (opts.xp != null ? '<div class="game-result__xp">+' + opts.xp + " XP</div>" : "") +
      (opts.statsHtml || "") +
      (opts.extraHtml || "") +
      (opts.breakdownHtml || "") +
      '<div class="game-result__actions">' +
      (opts.onPlayAgain ? '<button type="button" class="btn btn--primary" data-act="again">Play Again</button>' : "") +
      '<button type="button" class="btn btn--ghost" data-act="more">More Games</button>' +
      '<button type="button" class="btn btn--ghost" data-act="stats"><i class="ph-bold ph-chart-bar"></i> View Stats</button>' +
      "</div>";
    container.appendChild(panel);
    if (opts.onPlayAgain) panel.querySelector('[data-act="again"]').addEventListener("click", opts.onPlayAgain);
    panel.querySelector('[data-act="more"]').addEventListener("click", function () {
      closeModal();
      setTimeout(function () { var el = document.getElementById("play"); if (el) el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); }, 260);
    });
    panel.querySelector('[data-act="stats"]').addEventListener("click", function () {
      closeModal();
      setTimeout(function () { var el = document.getElementById("journey"); if (el) el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); }, 260);
    });
    var speakBtn = panel.querySelector("[data-speak]");
    if (speakBtn) {
      if ("speechSynthesis" in window) {
        speakBtn.addEventListener("click", function () {
          try {
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(speakBtn.getAttribute("data-speak")));
          } catch (e) {}
        });
      } else {
        speakBtn.hidden = true;
      }
    }
    if (!opts.skipConfetti) window.Effects.confetti(panel.querySelector(".game-result__icon"));
    return panel;
  }
  window.GameModal.resultPanel = resultPanel;

  function xpBurstFromEvent(amount, el) {
    if (!el) return;
    var r = el.getBoundingClientRect();
    window.Effects.xpToast(amount, r.left + r.width / 2, r.top);
  }

  /* ---------------- "How you did" + "Word breakdown" (post-game learning) ---------------- */
  function howYouDidHtml(stats) {
    return (
      '<div class="result-stats">' +
      '<div class="result-stat"><i class="ph-bold ph-percent"></i><strong>' + stats.accuracy + '</strong><span>Accuracy</span></div>' +
      '<div class="result-stat"><i class="ph-bold ph-timer"></i><strong>' + stats.time + '</strong><span>Speed</span></div>' +
      '<div class="result-stat"><i class="ph-bold ph-target"></i><strong>' + stats.efficiency + '</strong><span>Efficiency</span></div>' +
      '<div class="result-stat"><i class="ph-bold ph-lightbulb"></i><strong>' + stats.hints + '</strong><span>Hints used</span></div>' +
      "</div>"
    );
  }

  function relatedWords(word) {
    var list = window.WordBank.list();
    if (!list.length) return [];
    var sameStart = list.filter(function (w) { return w !== word && w[0] === word[0]; });
    var pool = sameStart.length >= 4 ? sameStart : list.filter(function (w) { return w !== word; });
    var picks = [];
    var used = {};
    while (picks.length < 4 && picks.length < pool.length) {
      var w = pool[Math.floor(Math.random() * pool.length)];
      if (!used[w]) { used[w] = true; picks.push(w); }
    }
    return picks;
  }

  function wordBreakdownHtml(entry) {
    var ex = entry.ex ? entry.ex.replace("___", "<strong>" + entry.word + "</strong>") : "";
    var related = relatedWords(entry.word);
    return (
      '<div class="result-breakdown">' +
      '<h4><i class="ph-bold ph-book-open"></i> Word Breakdown</h4>' +
      '<div class="result-breakdown__word">' + entry.word +
      '<button type="button" class="result-speak-btn" data-speak="' + entry.word + '" aria-label="Hear pronunciation"><i class="ph-fill ph-speaker-high"></i></button>' +
      "</div>" +
      "<p>" + entry.def + "</p>" +
      (ex ? "<p><em>“" + ex + "”</em></p>" : "") +
      (entry.cat ? '<p class="result-breakdown__cat"><i class="ph-bold ph-shapes"></i> ' + entry.cat + "</p>" : "") +
      (related.length ? '<div class="result-related"><span>Related words:</span>' + related.map(function (w) { return '<span class="tools-chip">' + w + "</span>"; }).join("") + "</div>" : "") +
      "</div>"
    );
  }

  function fmtTime(sec) {
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ":" + String(s).padStart(2, "0");
  }

  /* ============================================================
     Wordle-family: Daily Word + Six Tries
     ============================================================ */
  function pickAnswerOfDay() {
    var bank = window.ANSWER_WORDS;
    var idx = window.PlayerState.dayOfYear(new Date()) % bank.length;
    return bank[idx];
  }
  function pickRandomAnswer(excludeWord) {
    var bank = window.ANSWER_WORDS.filter(function (w) { return w.word !== excludeWord; });
    return bank[Math.floor(Math.random() * bank.length)];
  }

  function launchWordleFamily(container, opts) {
    var entry = opts.entry;
    var hintCfg = window.HOW_TO_PLAY[opts.gameId];

    var intro = document.createElement("div");
    intro.className = "wg-intro";
    intro.innerHTML =
      '<div class="wg-intro__badge">' + opts.badge + '</div>' +
      '<p class="wg-intro__hint">Guess the ' + entry.word.length + '-letter word in ' + opts.maxTries + " tries. " + window.Utils.diffChipHtml(entry.diff) + "</p>";
    container.appendChild(intro);

    var hintHost = document.createElement("div");
    container.appendChild(hintHost);

    var boardWrap = document.createElement("div");
    container.appendChild(boardWrap);

    var revealedLetterIdx = null;
    var hintPanel = window.HintPanel.create(hintHost, {
      hints: hintCfg.hints,
      sequential: true,
      getSpendable: function () { return window.PlayerState.get().xp; },
      use: function (hint) {
        if (hint.id === "vowels") {
          var n = entry.word.split("").filter(function (c) { return "AEIOU".indexOf(c) !== -1; }).length;
          window.PlayerState.addXp(-hint.cost, "hint");
          return { text: "This word contains " + n + " vowel" + (n === 1 ? "" : "s") + "." };
        }
        if (hint.id === "letter") {
          if (revealedLetterIdx == null) revealedLetterIdx = Math.floor(Math.random() * entry.word.length);
          var pattern = entry.word.split("").map(function (ch, i) { return i === revealedLetterIdx ? ch : "_"; }).join(" ");
          window.PlayerState.addXp(-hint.cost, "hint");
          return { text: pattern };
        }
        if (hint.id === "category") {
          window.PlayerState.addXp(-hint.cost, "hint");
          return { text: entry.cat };
        }
        if (hint.id === "first") {
          window.PlayerState.addXp(-hint.cost, "hint");
          return { text: "Starts with “" + entry.word[0] + "”" };
        }
        return null;
      },
    });
    window.HintPanel.attachImStuck(hintHost, hintPanel);

    var correctLetters = 0, totalLetters = 0;
    var game = new window.WordleGame({
      container: boardWrap,
      answer: entry.word,
      maxTries: opts.maxTries,
      reducedMotion: reduced,
      onGuessRow: function (correct, total) {
        window.PlayerState.recordGuessRow(correct, total);
        correctLetters += correct;
        totalLetters += total;
      },
      onWin: function (info) {
        var bonus = (info.maxTries - info.tries) * 10;
        var xp = opts.baseXp + bonus;
        var hintsUsed = hintPanel.usedCount() > 0;
        window.PlayerState.recordWin({
          tries: info.tries, maxTries: info.maxTries, timeSec: info.timeSec,
          hintsUsed: hintsUsed, isDaily: !!opts.isDaily,
        });
        window.PlayerState.addXp(xp, opts.badge);
        setTimeout(function () {
          resultPanel(container, {
            icon: "ph-trophy",
            title: opts.isDaily ? "Daily word solved!" : "Solved it!",
            subtitle: "You got <strong>" + entry.word + "</strong> in " + info.tries + " " + (info.tries === 1 ? "try" : "tries") + ".",
            xp: xp,
            statsHtml: howYouDidHtml({
              accuracy: totalLetters ? Math.round((correctLetters / totalLetters) * 100) + "%" : "—",
              time: fmtTime(info.timeSec),
              efficiency: info.tries + "/" + info.maxTries,
              hints: hintPanel.usedCount() + "/" + hintCfg.hints.length,
            }),
            breakdownHtml: wordBreakdownHtml(entry),
            onPlayAgain: opts.isDaily ? null : function () { relaunch(); },
          });
        }, 700);
      },
      onLose: function (info) {
        setTimeout(function () {
          resultPanel(container, {
            icon: "ph-hourglass-low",
            title: "So close!",
            subtitle: "The word was <strong>" + info.answer + "</strong>.",
            breakdownHtml: wordBreakdownHtml(entry),
            skipConfetti: true,
            onPlayAgain: function () { relaunch(); },
          });
        }, 500);
      },
    });

    function relaunch() {
      if (opts.isDaily) {
        window.GameModal.open(opts.title, function (c) { return launchWordleFamily(c, opts); }, opts.gameId);
      } else {
        window.GameModal.open(opts.title, launchSixTries, "six-tries");
      }
    }

    return function cleanup() { game.destroy(); };
  }

  function launchDaily(container) {
    var entry = pickAnswerOfDay();
    var already = window.PlayerState.isDailyDoneToday();
    if (already) {
      var wrap = document.createElement("div");
      wrap.className = "wg-intro";
      wrap.innerHTML =
        '<div class="wg-intro__badge"><i class="ph-fill ph-check-circle"></i> Already completed today</div>' +
        '<p class="wg-intro__hint">Today\'s word was <strong>' + entry.word + "</strong> — " + entry.def + "</p>" +
        '<p class="wg-intro__hint">Come back after midnight for a new puzzle, or warm up with Six Tries below.</p>';
      container.appendChild(wrap);
      return;
    }
    return launchWordleFamily(container, {
      entry: entry, maxTries: 6, isDaily: true, baseXp: 100, gameId: "daily",
      badge: '<i class="ph-fill ph-calendar-check"></i> Today\'s Challenge', title: "Daily Word",
    });
  }

  function launchSixTries(container) {
    var entry = pickRandomAnswer();
    return launchWordleFamily(container, {
      entry: entry, maxTries: 6, isDaily: false, baseXp: 40, gameId: "six-tries",
      badge: '<i class="ph-fill ph-arrows-clockwise"></i> Practice Round', title: "Six Tries",
    });
  }

  /* ============================================================
     Scramble family: Word Scramble / Blitz / Speed Word
     ============================================================ */
  function shuffleWord(word) {
    var arr = word.split("");
    var shuffled;
    do {
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
      }
      shuffled = arr.join("");
    } while (shuffled === word && word.length > 1);
    return shuffled;
  }

  function modeToGameId(mode) {
    return mode === "scramble" ? "word-scramble" : (mode === "blitz" ? "blitz" : "speed-word");
  }

  function launchScramble(container, mode) {
    var gameId = modeToGameId(mode);
    var hintCfg = window.HOW_TO_PLAY[gameId];
    var pool = window.SCRAMBLE_WORDS.slice();
    var order = pool.sort(function () { return Math.random() - 0.5; });
    var roundIndex = 0;
    var solved = 0;
    var totalXp = 0;
    var combo = 0;
    var lives = mode === "speed" ? 3 : Infinity;
    var timeLeft = mode === "blitz" ? 60 : (mode === "speed" ? 12 : null);
    var urgentAt = mode === "blitz" ? 10 : 4;
    var timerId = null;
    var maxRounds = mode === "scramble" ? 5 : order.length;

    var wrap = document.createElement("div");
    wrap.className = "scramble-game";
    container.appendChild(wrap);

    function endGame(reason) {
      clearInterval(timerId);
      resultPanel(container, {
        icon: solved > 0 ? "ph-trophy" : "ph-smiley-sad",
        title: mode === "scramble" ? "Round complete!" : (reason === "time" ? "Time's up!" : "Out of lives"),
        subtitle: "You solved <strong>" + solved + "</strong> word" + (solved === 1 ? "" : "s") + ".",
        xp: totalXp,
        onPlayAgain: function () {
          window.GameModal.open(document.querySelector(".game-modal__title").textContent, function (c) { return launchScramble(c, mode); }, gameId);
        },
      });
    }

    function nextRound() {
      if (mode === "scramble" && roundIndex >= maxRounds) { endGame("done"); return; }
      if (roundIndex >= order.length) order = order.concat(pool.sort(function () { return Math.random() - 0.5; }));
      var item = order[roundIndex++];
      renderRound(item);
    }

    function renderRound(item) {
      // Each pool tile keeps a stable identity ({ch, id, used}) so
      // shuffling only ever reorders them — it can never desync from
      // which letters are actually already placed (a real bug the
      // old position-indexed version had).
      var poolTiles = shuffleWord(item.word).split("").map(function (ch, i) { return { ch: ch, id: i, used: false }; });
      var slots = new Array(item.word.length).fill(null); // each: { ch, tileId } | null
      var lengthRevealed = mode !== "scramble"; // only Word Scramble hides length behind a hint

      wrap.innerHTML =
        '<div class="scramble-top">' +
        (mode === "scramble" ? '<span class="scramble-progress">Word ' + roundIndex + " / " + maxRounds + "</span>" : '<span class="scramble-progress">Solved: ' + solved + "</span>") +
        (timeLeft != null ? '<span class="scramble-timer" data-timer-wrap><i class="ph-fill ph-timer"></i> <span data-time>' + timeLeft + "s</span></span>" : "") +
        (mode === "speed" ? '<span class="scramble-lives">' + "❤️".repeat(lives) + "</span>" : "") +
        (combo >= 2 ? '<span class="combo-chip"><i class="ph-fill ph-fire"></i> x' + comboMultiplier().toFixed(2).replace(/\.?0+$/, "") + " combo</span>" : "") +
        "</div>" +
        '<div class="scramble-cat" data-cat-line>' + item.cat + (lengthRevealed ? " · " + item.word.length + " letters" : "") + "</div>" +
        '<div class="scramble-slots" data-slots></div>' +
        '<div class="scramble-source" data-source></div>' +
        '<div class="scramble-actions">' +
        '  <button type="button" class="btn btn--ghost btn--sm" data-clear>Clear</button>' +
        '  <button type="button" class="btn btn--ghost btn--sm" data-shuffle><i class="ph-bold ph-shuffle"></i> Shuffle</button>' +
        "</div>" +
        '<div data-hint-host></div>';

      var slotsEl = wrap.querySelector("[data-slots]");
      var sourceEl = wrap.querySelector("[data-source]");
      var catLine = wrap.querySelector("[data-cat-line]");
      applyUrgency();

      function renderSlots() {
        slotsEl.innerHTML = "";
        slots.forEach(function (slot, idx) {
          var d = document.createElement("div");
          d.className = "scramble-slot" + (slot ? " is-filled" : "");
          d.textContent = slot ? slot.ch : "";
          d.setAttribute("data-slot-idx", idx);
          if (slot) {
            d.title = "Tap to send this letter back";
            d.addEventListener("click", function () { clearSlot(idx); });
          }
          slotsEl.appendChild(d);
        });
      }

      function renderSource() {
        sourceEl.innerHTML = "";
        poolTiles.forEach(function (tile) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "scramble-tile" + (tile.used ? " is-used" : "");
          b.textContent = tile.ch;
          b.disabled = tile.used;
          if (!tile.used) attachDrag(b, tile);
          sourceEl.appendChild(b);
        });
      }

      /* Unified tap + drag-and-drop (Pointer Events cover mouse, touch and pen). */
      function attachDrag(b, tile) {
        b.addEventListener("pointerdown", function (e) {
          if (roundOver || b.disabled) return;
          e.preventDefault();
          var startX = e.clientX, startY = e.clientY;
          var rect = b.getBoundingClientRect();
          var offX = startX - rect.left, offY = startY - rect.top;
          var dragging = false;
          try { b.setPointerCapture(e.pointerId); } catch (err) {}

          function clearTargets() {
            slotsEl.querySelectorAll(".scramble-slot").forEach(function (s) { s.classList.remove("is-drop-target"); });
          }
          function hoveredSlot(x, y) {
            b.style.pointerEvents = "none";
            var el = document.elementFromPoint(x, y);
            b.style.pointerEvents = "";
            return el && el.closest ? el.closest(".scramble-slot") : null;
          }
          function onMove(ev) {
            var dx = ev.clientX - startX, dy = ev.clientY - startY;
            if (!dragging && Math.hypot(dx, dy) > 6) {
              dragging = true;
              b.classList.add("scramble-tile--dragging");
              b.style.position = "fixed";
              b.style.left = rect.left + "px";
              b.style.top = rect.top + "px";
              b.style.width = rect.width + "px";
              b.style.height = rect.height + "px";
              b.style.zIndex = "80";
            }
            if (!dragging) return;
            b.style.left = (ev.clientX - offX) + "px";
            b.style.top = (ev.clientY - offY) + "px";
            clearTargets();
            var slot = hoveredSlot(ev.clientX, ev.clientY);
            if (slot && !slot.classList.contains("is-filled")) slot.classList.add("is-drop-target");
          }
          function onUp(ev) {
            document.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerup", onUp);
            document.removeEventListener("pointercancel", onUp);
            if (!dragging) {
              placeAt(slots.findIndex(function (s) { return !s; }), tile);
              return;
            }
            b.classList.remove("scramble-tile--dragging");
            b.style.position = ""; b.style.left = ""; b.style.top = ""; b.style.width = ""; b.style.height = ""; b.style.zIndex = "";
            clearTargets();
            var slot = hoveredSlot(ev.clientX, ev.clientY);
            if (slot && !slot.classList.contains("is-filled")) {
              placeAt(Number(slot.getAttribute("data-slot-idx")), tile);
            }
          }
          document.addEventListener("pointermove", onMove);
          document.addEventListener("pointerup", onUp);
          document.addEventListener("pointercancel", onUp);
        });
      }

      function placeAt(slotIdx, tile) {
        if (slotIdx == null || slotIdx < 0 || slots[slotIdx] || tile.used) return;
        slots[slotIdx] = { ch: tile.ch, tileId: tile.id };
        tile.used = true;
        renderSlots();
        renderSource();
        if (slots.every(Boolean)) checkAnswer();
      }

      function clearSlot(idx) {
        var s = slots[idx];
        if (!s || roundOver) return;
        var tile = poolTiles.filter(function (t) { return t.id === s.tileId; })[0];
        if (tile) tile.used = false;
        slots[idx] = null;
        renderSlots();
        renderSource();
      }

      var roundOver = false;
      function checkAnswer() {
        var guess = slots.map(function (s) { return s.ch; }).join("");
        if (guess === item.word) {
          roundOver = true;
          solved += 1;
          combo += 1;
          var base = mode === "speed" ? 20 : (mode === "blitz" ? 15 : 20);
          var xp = Math.round(base * comboMultiplier());
          totalXp += xp;
          window.PlayerState.addXp(xp, "scramble");
          window.PlayerState.recordWin({ tries: 1, hintsUsed: false });
          xpBurstFromEvent(xp, slotsEl);
          slotsEl.classList.add("is-correct");
          setTimeout(function () {
            if (mode === "scramble" && roundIndex >= maxRounds) endGame("done");
            else nextRound();
          }, 550);
        } else {
          combo = 0;
          slotsEl.classList.add("is-wrong");
          setTimeout(function () {
            slotsEl.classList.remove("is-wrong");
            slots = new Array(item.word.length).fill(null);
            poolTiles.forEach(function (t) { t.used = false; });
            renderSlots();
            renderSource();
          }, 420);
        }
      }

      renderSlots();
      renderSource();
      wrap.querySelector("[data-clear]").addEventListener("click", function () {
        slots = new Array(item.word.length).fill(null);
        poolTiles.forEach(function (t) { t.used = false; });
        renderSlots();
        renderSource();
      });
      wrap.querySelector("[data-shuffle]").addEventListener("click", function () {
        poolTiles.sort(function () { return Math.random() - 0.5; });
        renderSource();
      });

      var hintPanel = window.HintPanel.create(wrap.querySelector("[data-hint-host]"), {
        hints: hintCfg.hints,
        sequential: false,
        getSpendable: function (unit) { return unit === "sec" ? timeLeft : window.PlayerState.get().xp; },
        use: function (hint) {
          if (roundOver) return null;
          if (hint.id === "first") {
            spendHintCost(hint);
            return { text: "Starts with “" + item.word[0] + "”" };
          }
          if (hint.id === "length") {
            lengthRevealed = true;
            catLine.textContent = item.cat + " · " + item.word.length + " letters";
            spendHintCost(hint);
            return { text: "It's a " + item.word.length + "-letter word." };
          }
          if (hint.id === "definition") {
            spendHintCost(hint);
            return { text: item.def || "A word worth knowing." };
          }
          if (hint.id === "placement") {
            var emptyIdx = slots.indexOf(null);
            if (emptyIdx === -1) return null;
            spendHintCost(hint);
            return { text: "Try “" + item.word[emptyIdx] + "” in the next open slot." };
          }
          if (hint.id === "time") {
            timeLeft += 5;
            updateTimerDisplay();
            spendHintCost(hint);
            return { text: "+5 seconds added to the clock!" };
          }
          if (hint.id === "next") {
            var idx2 = slots.indexOf(null);
            if (idx2 === -1) return null;
            var needed = item.word[idx2];
            var tiles = sourceEl.querySelectorAll(".scramble-tile:not(.is-used)");
            for (var k = 0; k < tiles.length; k++) {
              if (tiles[k].textContent === needed) {
                tiles[k].classList.add("scramble-tile--pulse");
                setTimeout(function (el) { el.classList.remove("scramble-tile--pulse"); }, 1600, tiles[k]);
                break;
              }
            }
            spendHintCost(hint);
            return { text: "Look for the highlighted tile." };
          }
          return null;
        },
      });
      function spendHintCost(hint) {
        if (hint.unit === "sec") { timeLeft = Math.max(1, timeLeft - hint.cost); updateTimerDisplay(); }
        else window.PlayerState.addXp(-hint.cost, "hint");
      }
      window.HintPanel.attachImStuck(wrap, hintPanel);

      if (timeLeft != null) {
        timeLeft = mode === "blitz" ? timeLeft : 12;
        updateTimerDisplay();
      }
    }

    function comboMultiplier() {
      return 1 + Math.min(combo, 5) * 0.2; // up to 2x at a 5-streak
    }

    function applyUrgency() {
      var el = wrap.querySelector("[data-timer-wrap]");
      if (el) el.classList.toggle("is-urgent", timeLeft != null && timeLeft <= urgentAt);
    }

    function updateTimerDisplay() {
      var el = wrap.querySelector("[data-time]");
      if (el) el.textContent = timeLeft + "s";
      applyUrgency();
    }

    if (mode === "blitz" || mode === "speed") {
      nextRound();
      timerId = setInterval(function () {
        timeLeft -= 1;
        updateTimerDisplay();
        if (timeLeft <= 0) {
          if (mode === "blitz") { endGame("time"); return; }
          if (mode === "speed") {
            lives -= 1;
            if (lives <= 0) { endGame("lives"); return; }
            timeLeft = 12;
            nextRound();
          }
        }
      }, 1000);
    } else {
      nextRound();
    }

    return function cleanup() { clearInterval(timerId); };
  }

  /* ============================================================
     Letter Rush
     ============================================================ */
  function launchLetterRush(container) {
    var hintCfg = window.HOW_TO_PLAY["letter-rush"];
    var seed = window.LETTER_RUSH_SEEDS[Math.floor(Math.random() * window.LETTER_RUSH_SEEDS.length)];
    var letters = seed.split("").sort(function () { return Math.random() - 0.5; });
    var found = [];
    var current = [];
    var usedIdx = {};
    var timeLeft = 90;
    var score = 0;
    var timerId;

    var wrap = document.createElement("div");
    wrap.className = "letterrush-game";
    wrap.innerHTML =
      '<div class="scramble-top">' +
      '<span class="scramble-progress">Words found: <span data-count>0</span></span>' +
      '<span class="scramble-timer"><i class="ph-fill ph-timer"></i> <span data-time>90s</span></span>' +
      "</div>" +
      '<div class="letterrush-current" data-current></div>' +
      '<div class="letterrush-pool" data-pool></div>' +
      '<div class="scramble-actions">' +
      '  <button type="button" class="btn btn--primary btn--sm" data-submit>Submit Word</button>' +
      '  <button type="button" class="btn btn--ghost btn--sm" data-clear>Clear</button>' +
      "</div>" +
      '<div class="letterrush-found" data-found></div>' +
      '<div data-hint-host></div>';
    container.appendChild(wrap);

    var poolEl = wrap.querySelector("[data-pool]");
    var currentEl = wrap.querySelector("[data-current]");
    var foundEl = wrap.querySelector("[data-found]");
    var countEl = wrap.querySelector("[data-count]");

    function renderPool() {
      poolEl.innerHTML = "";
      letters.forEach(function (ch, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "scramble-tile" + (usedIdx[i] ? " is-used" : "");
        b.textContent = ch;
        b.disabled = !!usedIdx[i];
        b.addEventListener("click", function () {
          current.push(ch);
          usedIdx[i] = true;
          renderPool();
          renderCurrent();
        });
        poolEl.appendChild(b);
      });
    }
    function renderCurrent() {
      currentEl.textContent = current.join("") || "Tap letters to build a word…";
      currentEl.classList.toggle("is-empty", !current.length);
    }
    function resetCurrent() {
      current = [];
      usedIdx = {};
      renderPool();
      renderCurrent();
    }
    async function submit() {
      var word = current.join("");
      if (word.length < 3) { flashCurrent("wrong"); return; }
      if (found.indexOf(word) !== -1) { flashCurrent("wrong"); return; }
      var valid = await window.WordBank.isValidAsync(word);
      if (valid && window.WordBank.canBuildFrom(word, seed)) {
        found.push(word);
        var xp = word.length * 4;
        score += xp;
        window.PlayerState.addXp(xp, "letter-rush");
        xpBurstFromEvent(xp, currentEl);
        flashCurrent("correct");
        var chip = document.createElement("span");
        chip.className = "letterrush-chip";
        chip.textContent = word;
        foundEl.appendChild(chip);
        countEl.textContent = found.length;
      } else {
        flashCurrent("wrong");
      }
      resetCurrent();
    }
    function flashCurrent(cls) {
      currentEl.classList.add("is-" + cls);
      setTimeout(function () { currentEl.classList.remove("is-" + cls); }, 380);
    }

    wrap.querySelector("[data-submit]").addEventListener("click", submit);
    wrap.querySelector("[data-clear]").addEventListener("click", resetCurrent);

    window.WordBank.load().then(function () {
      var hintPanel = window.HintPanel.create(wrap.querySelector("[data-hint-host]"), {
        hints: hintCfg.hints,
        sequential: false,
        getSpendable: function () { return window.PlayerState.get().xp; },
        use: function (hint) {
          var candidates = window.WordBank.list().filter(function (w) {
            return w.length >= 3 && w.length <= seed.length && found.indexOf(w) === -1 && window.WordBank.canBuildFrom(w, seed);
          });
          if (!candidates.length) return null;
          var pick = candidates[Math.floor(Math.random() * candidates.length)];
          if (hint.id === "example") {
            window.PlayerState.addXp(-hint.cost, "hint");
            return { text: "Try building “" + pick + "”." };
          }
          if (hint.id === "start") {
            var startLetter = pick[0];
            var tiles = poolEl.querySelectorAll(".scramble-tile:not(.is-used)");
            for (var i = 0; i < tiles.length; i++) {
              if (tiles[i].textContent === startLetter) {
                tiles[i].classList.add("scramble-tile--pulse");
                setTimeout(function (el) { el.classList.remove("scramble-tile--pulse"); }, 1600, tiles[i]);
                break;
              }
            }
            window.PlayerState.addXp(-hint.cost, "hint");
            return { text: "Try starting with “" + startLetter + "”." };
          }
          if (hint.id === "length") {
            window.PlayerState.addXp(-hint.cost, "hint");
            return { text: "There's a " + pick.length + "-letter word hiding in here." };
          }
          return null;
        },
      });
      window.HintPanel.attachImStuck(wrap, hintPanel);
    });
    renderPool();
    renderCurrent();

    timerId = setInterval(function () {
      timeLeft -= 1;
      wrap.querySelector("[data-time]").textContent = timeLeft + "s";
      if (timeLeft <= 0) {
        clearInterval(timerId);
        window.PlayerState.recordWin({ tries: 1, hintsUsed: false });
        resultPanel(container, {
          icon: found.length ? "ph-trophy" : "ph-smiley-sad",
          title: "Time's up!",
          subtitle: "You found <strong>" + found.length + "</strong> word" + (found.length === 1 ? "" : "s") + " from " + seed.toUpperCase() + ".",
          xp: score,
          extraHtml: found.length ? '<div class="letterrush-found letterrush-found--recap">' + found.map(function (w) { return '<span class="letterrush-chip">' + w + "</span>"; }).join("") + "</div>" : "",
          onPlayAgain: function () { window.GameModal.open("Letter Rush", launchLetterRush, "letter-rush"); },
        });
      }
    }, 1000);

    return function cleanup() { clearInterval(timerId); };
  }

  /* ============================================================
     Guess the Word — progressive clues
     ============================================================ */
  function launchGuessWord(container) {
    var hintCfg = window.HOW_TO_PLAY["guess-word"];
    var entry = pickRandomAnswer();
    var attempts = 0;

    var wrap = document.createElement("div");
    wrap.className = "guessword-game";
    wrap.innerHTML =
      '<div class="guessword-score">Potential reward: <strong>' + (40 + hintCfg.hints.length * 15) + " XP</strong></div>" +
      '<div class="guessword-clue0"><span class="guessword-clue-num">★</span>' + entry.word.length + " letters" + "</div>" +
      '<div data-hint-host></div>' +
      '<form class="guessword-form" data-form>' +
      '  <input type="text" class="guessword-input" data-input placeholder="Type your guess…" autocomplete="off" maxlength="' + entry.word.length + '" aria-label="Your guess">' +
      '  <button type="submit" class="btn btn--primary">Guess</button>' +
      "</form>" +
      '<p class="guessword-feedback" data-feedback aria-live="polite"></p>';
    container.appendChild(wrap);

    function updateScore() {
      var bonus = (hintCfg.hints.length - hintPanel.usedCount()) * 15;
      var el = wrap.querySelector(".guessword-score strong");
      if (el) el.textContent = (40 + bonus) + " XP";
    }

    var hintPanel = window.HintPanel.create(wrap.querySelector("[data-hint-host]"), {
      hints: hintCfg.hints,
      sequential: false,
      getSpendable: function () { return window.PlayerState.get().xp; },
      use: function (hint) {
        var text = null;
        if (hint.id === "category") text = entry.cat;
        if (hint.id === "first") text = "Starts with “" + entry.word[0] + "”";
        if (hint.id === "example") text = entry.ex ? entry.ex.replace("___", "_____") : null;
        if (hint.id === "definition") text = entry.def;
        if (!text) return null;
        window.PlayerState.addXp(-hint.cost, "hint");
        setTimeout(updateScore, 0);
        return { text: text };
      },
    });
    window.HintPanel.attachImStuck(wrap, hintPanel);

    wrap.querySelector("[data-form]").addEventListener("submit", function (e) {
      e.preventDefault();
      var input = wrap.querySelector("[data-input]");
      var guess = input.value.trim().toUpperCase();
      attempts += 1;
      if (guess === entry.word) {
        var bonus = (hintCfg.hints.length - hintPanel.usedCount()) * 15;
        var xp = 40 + bonus;
        window.PlayerState.addXp(xp, "guess-word");
        window.PlayerState.recordWin({ tries: attempts, hintsUsed: hintPanel.usedCount() > 0 });
        resultPanel(container, {
          icon: "ph-trophy",
          title: "Nailed it!",
          subtitle: "The word was <strong>" + entry.word + "</strong>.",
          xp: xp,
          statsHtml: howYouDidHtml({
            accuracy: "—", time: "—", efficiency: attempts + " guess" + (attempts === 1 ? "" : "es"),
            hints: hintPanel.usedCount() + "/" + hintCfg.hints.length,
          }),
          breakdownHtml: wordBreakdownHtml(entry),
          onPlayAgain: function () { window.GameModal.open("Guess the Word", launchGuessWord, "guess-word"); },
        });
      } else {
        var fb = wrap.querySelector("[data-feedback]");
        fb.textContent = "Not quite — try again or reveal a hint.";
        input.value = "";
        input.focus();
      }
    });
  }

  /* ============================================================
     Mini Crossword — typed, interactive version of the
     original "peek at three" teaser mechanic.
     ============================================================ */
  function launchMiniCrossword(container) {
    var clues = window.MINI_CROSSWORD;
    var hintCfg = window.HOW_TO_PLAY["mini-crossword"];
    var solvedCount = 0;
    var recap = [];

    var wrap = document.createElement("div");
    wrap.className = "minicross-game";
    wrap.innerHTML = '<p class="minicross-intro">Type each answer, use arrow keys to move around, or use a hint if you\'re stuck.</p><div class="minicross-list" data-list></div>';
    container.appendChild(wrap);
    var list = wrap.querySelector("[data-list]");
    var rowsMeta = [];

    clues.forEach(function (item, rowIndex) {
      var row = document.createElement("div");
      row.className = "minicross-row";
      var hintButtonsHtml = hintCfg.hints.map(function (h) {
        return '<button type="button" class="minicross-hint-btn" data-mc-hint="' + h.id + '" title="' + h.label + " (−" + h.cost + " XP)\"><i class=\"ph-bold " + h.icon + '"></i></button>';
      }).join("");
      row.innerHTML =
        '<div class="minicross-num">' + item.num + "</div>" +
        '<div class="minicross-body">' +
        '  <div class="minicross-clue" data-clue-text tabindex="0" role="button">' + item.clue + "</div>" +
        '  <div class="minicross-boxes" data-boxes></div>' +
        '  <div class="minicross-hints">' + hintButtonsHtml + "</div>" +
        "</div>";
      list.appendChild(row);

      var boxesEl = row.querySelector("[data-boxes]");
      var clueTextEl = row.querySelector("[data-clue-text]");
      var inputs = [];
      item.answer.split("").forEach(function (_, i) {
        var input = document.createElement("input");
        input.type = "text";
        input.maxLength = 1;
        input.className = "minicross-box";
        input.setAttribute("aria-label", item.num + " letter " + (i + 1));
        input.addEventListener("input", function () {
          input.value = input.value.toUpperCase().replace(/[^A-Z]/g, "");
          if (input.value && inputs[i + 1]) inputs[i + 1].focus();
          checkRow();
        });
        input.addEventListener("keydown", function (e) {
          if (e.key === "Backspace" && !input.value && inputs[i - 1]) inputs[i - 1].focus();
          else if (e.key === "ArrowLeft" && inputs[i - 1]) { e.preventDefault(); inputs[i - 1].focus(); }
          else if (e.key === "ArrowRight" && inputs[i + 1]) { e.preventDefault(); inputs[i + 1].focus(); }
          else if (e.key === "ArrowDown") { e.preventDefault(); focusRow(rowIndex + 1, i); }
          else if (e.key === "ArrowUp") { e.preventDefault(); focusRow(rowIndex - 1, i); }
        });
        input.addEventListener("focusin", function () {
          list.querySelectorAll(".minicross-row.is-active").forEach(function (r) { r.classList.remove("is-active"); });
          row.classList.add("is-active");
        });
        inputs.push(input);
        boxesEl.appendChild(input);
      });

      clueTextEl.addEventListener("click", function () { focusRow(rowIndex, 0); });
      clueTextEl.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); focusRow(rowIndex, 0); }
      });

      function spend(cost) { window.PlayerState.addXp(-cost, "hint"); }

      function lockRow(revealedOnly) {
        inputs.forEach(function (inp) { inp.disabled = true; });
        row.classList.add("is-solved");
        row.querySelector(".minicross-hints").remove();
        recap.push({ num: item.num, clue: item.clue, answer: item.answer, solvedByPlayer: !revealedOnly });
        if (!revealedOnly) {
          solvedCount += 1;
          window.PlayerState.addXp(15, "mini-crossword");
          window.PlayerState.recordWin({ tries: 1, hintsUsed: false });
          xpBurstFromEvent(15, boxesEl);
        }
      }

      function checkRow() {
        var guess = inputs.map(function (i) { return i.value; }).join("");
        if (guess.length === item.answer.length) {
          if (guess === item.answer) {
            lockRow(false);
          } else {
            row.classList.add("is-shake");
            setTimeout(function () { row.classList.remove("is-shake"); }, 400);
          }
        }
      }

      row.querySelectorAll("[data-mc-hint]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-mc-hint");
          var hint = hintCfg.hints.filter(function (h) { return h.id === id; })[0];
          if (window.PlayerState.get().xp < hint.cost) {
            btn.classList.add("is-shake");
            setTimeout(function () { btn.classList.remove("is-shake"); }, 400);
            return;
          }
          if (id === "reveal-letter") {
            var emptyIdx = -1;
            for (var i = 0; i < inputs.length; i++) { if (!inputs[i].value) { emptyIdx = i; break; } }
            if (emptyIdx === -1) return;
            spend(hint.cost);
            inputs[emptyIdx].value = item.answer[emptyIdx];
            if (inputs[emptyIdx + 1]) inputs[emptyIdx + 1].focus();
            checkRow();
          } else if (id === "check-letter") {
            spend(hint.cost);
            inputs.forEach(function (inp, i) {
              if (!inp.value) return;
              inp.classList.remove("is-check-correct", "is-check-wrong");
              inp.classList.add(inp.value === item.answer[i] ? "is-check-correct" : "is-check-wrong");
              setTimeout(function () { inp.classList.remove("is-check-correct", "is-check-wrong"); }, 1400);
            });
          } else if (id === "easy-clue") {
            spend(hint.cost);
            clueTextEl.textContent = item.easyClue || item.clue;
          } else if (id === "reveal-word") {
            spend(hint.cost);
            item.answer.split("").forEach(function (ch, i) { inputs[i].value = ch; });
            lockRow(true);
          }
        });
      });

      rowsMeta.push({ row: row, inputs: inputs });
    });

    function focusRow(rowIndex, preferredCol) {
      if (rowIndex < 0 || rowIndex >= rowsMeta.length) return;
      var meta = rowsMeta[rowIndex];
      if (meta.inputs[0] && meta.inputs[0].disabled) { return; } // already solved/revealed
      var col = Math.min(preferredCol, meta.inputs.length - 1);
      var firstEmpty = meta.inputs.findIndex(function (inp) { return !inp.value; });
      var target = meta.inputs[firstEmpty !== -1 ? firstEmpty : col] || meta.inputs[col];
      if (target) target.focus();
    }

    var finishBar = document.createElement("div");
    finishBar.className = "minicross-finish";
    finishBar.innerHTML = '<button type="button" class="btn btn--primary" data-done>Finish</button>';
    wrap.appendChild(finishBar);
    finishBar.querySelector("[data-done]").addEventListener("click", function () {
      var recapHtml = '<div class="result-breakdown"><h4><i class="ph-bold ph-grid-nine"></i> Answer Recap</h4>' +
        clues.map(function (item) {
          var found = recap.filter(function (r) { return r.num === item.num; })[0];
          var solved = found && found.solvedByPlayer;
          return '<p><strong>' + item.num + " " + item.answer + "</strong> — " + item.clue + (solved ? "" : " <em>(revealed)</em>") + "</p>";
        }).join("") + "</div>";
      resultPanel(container, {
        icon: "ph-trophy",
        title: "Mini crossword wrapped up",
        subtitle: "You solved " + solvedCount + " of " + clues.length + " clues yourself.",
        xp: solvedCount * 15,
        breakdownHtml: recapHtml,
        onPlayAgain: function () { window.GameModal.open("Mini Crossword", launchMiniCrossword, "mini-crossword"); },
      });
    });
  }

  /* ---------------- Registry ---------------- */
  var REGISTRY = {
    "daily": { title: "Daily Word", fn: launchDaily },
    "six-tries": { title: "Six Tries", fn: launchSixTries },
    "word-scramble": { title: "Word Scramble", fn: function (c) { return launchScramble(c, "scramble"); } },
    "blitz": { title: "Blitz", fn: function (c) { return launchScramble(c, "blitz"); } },
    "speed-word": { title: "Speed Word", fn: function (c) { return launchScramble(c, "speed"); } },
    "letter-rush": { title: "Letter Rush", fn: launchLetterRush },
    "guess-word": { title: "Guess the Word", fn: launchGuessWord },
    "mini-crossword": { title: "Mini Crossword", fn: launchMiniCrossword },
  };

  window.Games = {
    launch: function (id) {
      var entry = REGISTRY[id];
      if (!entry) return;
      window.GameModal.open(entry.title, function (body, close) {
        return window.HowToPlay.gate(id, body, function () { return entry.fn(body, close); });
      }, id);
    },
  };

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-play]");
    if (!trigger) return;
    e.preventDefault();
    window.Games.launch(trigger.getAttribute("data-play"));
  });

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-howto]");
    if (!trigger) return;
    e.preventDefault();
    window.HowToPlay.open(trigger.getAttribute("data-howto"));
  });
})();

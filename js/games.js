/* ============================================================
   UnscrambleX — game modal shell + mini-game engines
   Every "Play" button on the page routes through GameModal.open,
   which hands a clean container to one of the launch functions
   below. Nothing here ever navigates away from the page.
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

  function openModal(title, launchFn) {
    var root = ensureModal();
    lastFocused = document.activeElement;
    root.querySelector(".game-modal__title").textContent = title;
    var body = root.querySelector(".game-modal__body");
    body.innerHTML = "";
    root.classList.add("is-open");
    document.body.classList.add("modal-open");
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
      (opts.extraHtml || "") +
      '<div class="game-result__actions">' +
      (opts.onPlayAgain ? '<button type="button" class="btn btn--primary" data-act="again">Play Again</button>' : "") +
      '<button type="button" class="btn btn--ghost" data-act="close">Back to Games</button>' +
      "</div>";
    container.appendChild(panel);
    if (opts.onPlayAgain) panel.querySelector('[data-act="again"]').addEventListener("click", opts.onPlayAgain);
    panel.querySelector('[data-act="close"]').addEventListener("click", closeModal);
    if (!opts.skipConfetti) window.Effects.confetti(panel.querySelector(".game-result__icon"));
    return panel;
  }
  window.GameModal.resultPanel = resultPanel;

  function xpBurstFromEvent(amount, el) {
    if (!el) return;
    var r = el.getBoundingClientRect();
    window.Effects.xpToast(amount, r.left + r.width / 2, r.top);
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
    var intro = document.createElement("div");
    intro.className = "wg-intro";
    intro.innerHTML =
      '<div class="wg-intro__badge">' + opts.badge + '</div>' +
      '<p class="wg-intro__hint">Guess the ' + entry.word.length + '-letter word in ' + opts.maxTries + ' tries. Difficulty: <strong>' + entry.diff + "</strong></p>";
    container.appendChild(intro);

    var boardWrap = document.createElement("div");
    container.appendChild(boardWrap);

    var hintsUsedThisRound = false;
    var game = new window.WordleGame({
      container: boardWrap,
      answer: entry.word,
      maxTries: opts.maxTries,
      reducedMotion: reduced,
      onGuessRow: function (correct, total) { window.PlayerState.recordGuessRow(correct, total); },
      onWin: function (info) {
        var bonus = (info.maxTries - info.tries) * 10;
        var xp = opts.baseXp + bonus;
        window.PlayerState.recordWin({
          tries: info.tries, maxTries: info.maxTries, timeSec: info.timeSec,
          hintsUsed: hintsUsedThisRound, isDaily: !!opts.isDaily,
        });
        window.PlayerState.addXp(xp, opts.badge);
        setTimeout(function () {
          resultPanel(container, {
            icon: "ph-trophy",
            title: opts.isDaily ? "Daily word solved!" : "Solved it!",
            subtitle: "You got <strong>" + entry.word + "</strong> in " + info.tries + " " + (info.tries === 1 ? "try" : "tries") + ".",
            xp: xp,
            extraHtml: '<p class="game-result__def">' + entry.def + "</p>",
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
            extraHtml: '<p class="game-result__def">' + entry.def + "</p>",
            skipConfetti: true,
            onPlayAgain: function () { relaunch(); },
          });
        }, 500);
      },
    });

    function relaunch() {
      if (opts.isDaily) {
        // Retry the same daily word with a fresh board.
        window.GameModal.open(opts.title, function (c) { return launchWordleFamily(c, opts); });
      } else {
        // Practice modes get a brand-new random word each round.
        window.GameModal.open(opts.title, launchSixTries);
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
      entry: entry, maxTries: 6, isDaily: true, baseXp: 100,
      badge: '<i class="ph-fill ph-calendar-check"></i> Today\'s Challenge', title: "Daily Word",
    });
  }

  function launchSixTries(container) {
    var entry = pickRandomAnswer();
    return launchWordleFamily(container, {
      entry: entry, maxTries: 6, isDaily: false, baseXp: 40,
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

  function launchScramble(container, mode) {
    var pool = window.SCRAMBLE_WORDS.slice();
    var order = pool.sort(function () { return Math.random() - 0.5; });
    var roundIndex = 0;
    var solved = 0;
    var totalXp = 0;
    var lives = mode === "speed" ? 3 : Infinity;
    var timeLeft = mode === "blitz" ? 60 : (mode === "speed" ? 12 : null);
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
          window.GameModal.open(document.querySelector(".game-modal__title").textContent, function (c) { return launchScramble(c, mode); });
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
      var scrambled = shuffleWord(item.word);
      var slots = new Array(item.word.length).fill(null);
      var usedSourceIdx = {};

      wrap.innerHTML =
        '<div class="scramble-top">' +
        (mode === "scramble" ? '<span class="scramble-progress">Word ' + roundIndex + " / " + maxRounds + "</span>" : '<span class="scramble-progress">Solved: ' + solved + "</span>") +
        (timeLeft != null ? '<span class="scramble-timer"><i class="ph-fill ph-timer"></i> <span data-time>' + timeLeft + "s</span></span>" : "") +
        (mode === "speed" ? '<span class="scramble-lives">' + "❤️".repeat(lives) + "</span>" : "") +
        "</div>" +
        '<div class="scramble-cat">' + item.cat + " · " + item.word.length + " letters</div>" +
        '<div class="scramble-slots" data-slots></div>' +
        '<div class="scramble-source" data-source></div>' +
        '<div class="scramble-actions">' +
        '  <button type="button" class="btn btn--ghost btn--sm" data-clear>Clear</button>' +
        '  <button type="button" class="btn btn--ghost btn--sm" data-shuffle>Shuffle</button>' +
        "</div>";

      var slotsEl = wrap.querySelector("[data-slots]");
      var sourceEl = wrap.querySelector("[data-source]");

      function renderSlots() {
        slotsEl.innerHTML = "";
        slots.forEach(function (ch) {
          var d = document.createElement("div");
          d.className = "scramble-slot" + (ch ? " is-filled" : "");
          d.textContent = ch || "";
          slotsEl.appendChild(d);
        });
      }
      function renderSource(letters) {
        sourceEl.innerHTML = "";
        letters.split("").forEach(function (ch, i) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "scramble-tile" + (usedSourceIdx[i] ? " is-used" : "");
          b.textContent = ch;
          b.disabled = !!usedSourceIdx[i];
          b.addEventListener("click", function () {
            var emptyIdx = slots.indexOf(null);
            if (emptyIdx === -1) return;
            slots[emptyIdx] = ch;
            usedSourceIdx[i] = true;
            renderSlots();
            renderSource(letters);
            if (slots.indexOf(null) === -1) checkAnswer(letters);
          });
          sourceEl.appendChild(b);
        });
      }

      function checkAnswer(letters) {
        var guess = slots.join("");
        if (guess === item.word) {
          solved += 1;
          var xp = mode === "speed" ? 20 : (mode === "blitz" ? 15 : 20);
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
          slotsEl.classList.add("is-wrong");
          setTimeout(function () {
            slotsEl.classList.remove("is-wrong");
            slots = new Array(item.word.length).fill(null);
            usedSourceIdx = {};
            renderSlots();
            renderSource(letters);
          }, 420);
        }
      }

      renderSlots();
      renderSource(scrambled);
      wrap.querySelector("[data-clear]").addEventListener("click", function () {
        slots = new Array(item.word.length).fill(null);
        usedSourceIdx = {};
        renderSlots();
        renderSource(scrambled);
      });
      wrap.querySelector("[data-shuffle]").addEventListener("click", function () {
        var again = shuffleWord(item.word);
        renderSource(again);
      });

      if (timeLeft != null) {
        timeLeft = mode === "blitz" ? timeLeft : 12;
        updateTimerDisplay();
      }
    }

    function updateTimerDisplay() {
      var el = wrap.querySelector("[data-time]");
      if (el) el.textContent = timeLeft + "s";
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
      '<div class="letterrush-found" data-found></div>';
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

    window.WordBank.load();
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
          onPlayAgain: function () { window.GameModal.open("Letter Rush", launchLetterRush); },
        });
      }
    }, 1000);

    return function cleanup() { clearInterval(timerId); };
  }

  /* ============================================================
     Guess the Word — progressive clues
     ============================================================ */
  function launchGuessWord(container) {
    var entry = pickRandomAnswer();
    var vowels = entry.word.split("").filter(function (c) { return "AEIOU".indexOf(c) !== -1; }).length;
    var clues = [
      entry.word.length + " letters, " + vowels + " vowel" + (vowels === 1 ? "" : "s"),
      "Starts with “" + entry.word[0] + "”",
      "Difficulty: " + entry.diff,
      entry.def,
    ];
    var revealed = 1;
    var score = 100;
    var attempts = 0;

    var wrap = document.createElement("div");
    wrap.className = "guessword-game";
    container.appendChild(wrap);

    function render() {
      wrap.innerHTML =
        '<div class="guessword-score">Potential reward: <strong>' + score + " XP</strong></div>" +
        '<ul class="guessword-clues">' +
        clues.slice(0, revealed).map(function (c, i) { return '<li><span class="guessword-clue-num">' + (i + 1) + "</span>" + c + "</li>"; }).join("") +
        "</ul>" +
        (revealed < clues.length ? '<button type="button" class="btn btn--ghost btn--sm" data-more><i class="ph-fill ph-lightbulb"></i> Reveal next clue (−20 XP)</button>' : "") +
        '<form class="guessword-form" data-form>' +
        '  <input type="text" class="guessword-input" data-input placeholder="Type your guess…" autocomplete="off" maxlength="' + entry.word.length + '" aria-label="Your guess">' +
        '  <button type="submit" class="btn btn--primary">Guess</button>' +
        "</form>" +
        '<p class="guessword-feedback" data-feedback aria-live="polite"></p>';

      var moreBtn = wrap.querySelector("[data-more]");
      if (moreBtn) moreBtn.addEventListener("click", function () {
        revealed += 1;
        score = Math.max(20, score - 20);
        render();
      });
      wrap.querySelector("[data-form]").addEventListener("submit", function (e) {
        e.preventDefault();
        var input = wrap.querySelector("[data-input]");
        var guess = input.value.trim().toUpperCase();
        attempts += 1;
        if (guess === entry.word) {
          window.PlayerState.addXp(score, "guess-word");
          window.PlayerState.recordWin({ tries: attempts, hintsUsed: revealed > 1 });
          resultPanel(container, {
            icon: "ph-trophy",
            title: "Nailed it!",
            subtitle: "The word was <strong>" + entry.word + "</strong>.",
            xp: score,
            onPlayAgain: function () { window.GameModal.open("Guess the Word", launchGuessWord); },
          });
        } else {
          var fb = wrap.querySelector("[data-feedback]");
          fb.textContent = "Not quite — try again or reveal another clue.";
          input.value = "";
          input.focus();
        }
      });
    }
    render();
  }

  /* ============================================================
     Mini Crossword — typed, interactive version of the
     original "peek at three" teaser mechanic.
     ============================================================ */
  function launchMiniCrossword(container) {
    var clues = window.MINI_CROSSWORD;
    var solvedCount = 0;

    var wrap = document.createElement("div");
    wrap.className = "minicross-game";
    wrap.innerHTML = '<p class="minicross-intro">Type each answer, or reveal it if you\'re stuck.</p><div class="minicross-list" data-list></div>';
    container.appendChild(wrap);
    var list = wrap.querySelector("[data-list]");

    clues.forEach(function (item, idx) {
      var row = document.createElement("div");
      row.className = "minicross-row";
      row.innerHTML =
        '<div class="minicross-num">' + item.num + "</div>" +
        '<div class="minicross-body">' +
        '  <div class="minicross-clue">' + item.clue + "</div>" +
        '  <div class="minicross-boxes" data-boxes></div>' +
        "</div>" +
        '<button type="button" class="btn btn--ghost btn--sm minicross-reveal" data-reveal>Reveal</button>';
      list.appendChild(row);

      var boxesEl = row.querySelector("[data-boxes]");
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
        });
        inputs.push(input);
        boxesEl.appendChild(input);
      });

      function lockRow(revealedOnly) {
        inputs.forEach(function (inp) { inp.disabled = true; });
        row.classList.add("is-solved");
        row.querySelector("[data-reveal]").remove();
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

      row.querySelector("[data-reveal]").addEventListener("click", function () {
        item.answer.split("").forEach(function (ch, i) { inputs[i].value = ch; });
        lockRow(true);
      });
    });

    var finishBar = document.createElement("div");
    finishBar.className = "minicross-finish";
    finishBar.innerHTML = '<button type="button" class="btn btn--primary" data-done>Finish</button>';
    wrap.appendChild(finishBar);
    finishBar.querySelector("[data-done]").addEventListener("click", function () {
      resultPanel(container, {
        icon: "ph-trophy",
        title: "Mini crossword wrapped up",
        subtitle: "You solved " + solvedCount + " of " + clues.length + " clues yourself.",
        xp: solvedCount * 15,
        onPlayAgain: function () { window.GameModal.open("Mini Crossword", launchMiniCrossword); },
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
      window.GameModal.open(entry.title, entry.fn);
    },
  };

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-play]");
    if (!trigger) return;
    e.preventDefault();
    window.Games.launch(trigger.getAttribute("data-play"));
  });
})();

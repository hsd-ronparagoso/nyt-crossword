/* ============================================================
   UnscrambleX — reusable Wordle-style board engine
   Renders a board + on-screen keyboard into any container and
   drives guess → score → flip → win/lose, with physical keyboard
   support. Used by Daily Word and Six Tries.
   ============================================================ */
(function () {
  "use strict";

  var KEY_ROWS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"],
  ];

  function scoreGuess(guess, answer) {
    var result = new Array(guess.length).fill("absent");
    var answerLetters = answer.split("");
    var used = new Array(answer.length).fill(false);

    for (var i = 0; i < guess.length; i++) {
      if (guess[i] === answerLetters[i]) {
        result[i] = "correct";
        used[i] = true;
      }
    }
    for (var j = 0; j < guess.length; j++) {
      if (result[j] === "correct") continue;
      var idx = -1;
      for (var k = 0; k < answerLetters.length; k++) {
        if (!used[k] && answerLetters[k] === guess[j]) { idx = k; break; }
      }
      if (idx !== -1) {
        result[j] = "present";
        used[idx] = true;
      }
    }
    return result;
  }

  function WordleGame(opts) {
    this.container = opts.container;
    this.answer = opts.answer.toUpperCase();
    this.maxTries = opts.maxTries || 6;
    this.onWin = opts.onWin || function () {};
    this.onLose = opts.onLose || function () {};
    this.onGuessRow = opts.onGuessRow || function () {};
    this.reducedMotion = opts.reducedMotion || false;
    this.title = opts.title || "";

    this.rows = [];
    this.currentRow = 0;
    this.currentGuess = "";
    this.finished = false;
    this.keyStates = {};
    this.startTime = Date.now();

    this._buildDom();
    this._bindKeys();
  }

  WordleGame.prototype._buildDom = function () {
    var len = this.answer.length;
    var html = '<div class="wg-board" style="--wg-len:' + len + '" role="group" aria-label="Word guess board">';
    for (var r = 0; r < this.maxTries; r++) {
      html += '<div class="wg-row" data-row="' + r + '">';
      for (var c = 0; c < len; c++) {
        html += '<div class="wg-tile" data-row="' + r + '" data-col="' + c + '" aria-hidden="true"></div>';
      }
      html += "</div>";
    }
    html += "</div>";
    html += '<div class="wg-message" aria-live="polite"></div>';
    html += '<div class="wg-keyboard" role="group" aria-label="On-screen keyboard">';
    KEY_ROWS.forEach(function (row) {
      html += '<div class="wg-key-row">';
      row.forEach(function (k) {
        var wide = (k === "ENTER" || k === "BACK") ? " wg-key--wide" : "";
        var label = k === "BACK" ? "⌫" : (k === "ENTER" ? "Enter" : k);
        html += '<button type="button" class="wg-key' + wide + '" data-key="' + k + '" aria-label="' + (k === "BACK" ? "Backspace" : k) + '">' + label + "</button>";
      });
      html += "</div>";
    });
    html += "</div>";
    this.container.innerHTML = html;
    this.boardEl = this.container.querySelector(".wg-board");
    this.messageEl = this.container.querySelector(".wg-message");
    this.keyboardEl = this.container.querySelector(".wg-keyboard");

    var self = this;
    this.keyboardEl.querySelectorAll(".wg-key").forEach(function (btn) {
      btn.addEventListener("click", function () { self._pressKey(btn.getAttribute("data-key")); });
    });
  };

  WordleGame.prototype._bindKeys = function () {
    var self = this;
    this._keydownHandler = function (e) {
      if (self.finished) return;
      if (e.key === "Enter") self._pressKey("ENTER");
      else if (e.key === "Backspace") self._pressKey("BACK");
      else if (/^[a-zA-Z]$/.test(e.key)) self._pressKey(e.key.toUpperCase());
    };
    document.addEventListener("keydown", this._keydownHandler);
  };

  WordleGame.prototype.destroy = function () {
    document.removeEventListener("keydown", this._keydownHandler);
  };

  WordleGame.prototype._setMessage = function (text, tone) {
    this.messageEl.textContent = text;
    this.messageEl.className = "wg-message" + (tone ? " wg-message--" + tone : "");
    if (text) {
      var self = this;
      clearTimeout(this._msgTimeout);
      this._msgTimeout = setTimeout(function () { self.messageEl.textContent = ""; self.messageEl.className = "wg-message"; }, 1600);
    }
  };

  WordleGame.prototype._shakeRow = function (r) {
    var tiles = this.boardEl.querySelectorAll('.wg-tile[data-row="' + r + '"]');
    tiles.forEach(function (t) { t.classList.add("wg-tile--shake"); });
    setTimeout(function () { tiles.forEach(function (t) { t.classList.remove("wg-tile--shake"); }); }, 420);
  };

  WordleGame.prototype._pressKey = function (key) {
    if (this.finished) return;
    var len = this.answer.length;

    if (key === "BACK") {
      this.currentGuess = this.currentGuess.slice(0, -1);
      this._renderCurrentRow();
      return;
    }
    if (key === "ENTER") {
      if (this.currentGuess.length !== len) {
        this._setMessage("Not enough letters", "warn");
        this._shakeRow(this.currentRow);
        return;
      }
      var isValidWord = window.WordBank && window.WordBank.isValid(this.currentGuess);
      var isTargetWord = this.currentGuess === this.answer;
      if (!isValidWord && !isTargetWord && window.WordBank && window.WordBank.list().length) {
        this._setMessage("Not in word list", "warn");
        this._shakeRow(this.currentRow);
        return;
      }
      this._submitRow();
      return;
    }
    if (/^[A-Z]$/.test(key) && this.currentGuess.length < len) {
      this.currentGuess += key;
      this._renderCurrentRow();
    }
  };

  WordleGame.prototype._renderCurrentRow = function () {
    var r = this.currentRow;
    var tiles = this.boardEl.querySelectorAll('.wg-tile[data-row="' + r + '"]');
    var self = this;
    tiles.forEach(function (tile, i) {
      var ch = self.currentGuess[i] || "";
      tile.textContent = ch;
      tile.classList.toggle("wg-tile--filled", !!ch);
      if (ch && !self.reducedMotion) {
        tile.classList.remove("wg-tile--pop");
        void tile.offsetWidth;
        tile.classList.add("wg-tile--pop");
      }
    });
  };

  WordleGame.prototype._submitRow = function () {
    var self = this;
    var r = this.currentRow;
    var guess = this.currentGuess;
    var result = scoreGuess(guess, this.answer);
    var tiles = this.boardEl.querySelectorAll('.wg-tile[data-row="' + r + '"]');
    var correctCount = result.filter(function (s) { return s === "correct"; }).length;

    this.rows.push({ guess: guess, result: result });
    this.onGuessRow(correctCount, guess.length);

    tiles.forEach(function (tile, i) {
      var delay = self.reducedMotion ? 0 : i * 220;
      setTimeout(function () {
        tile.classList.add(self.reducedMotion ? "" : "wg-tile--flip");
        setTimeout(function () {
          tile.classList.add("wg-tile--" + result[i]);
          tile.classList.remove("wg-tile--filled");
        }, self.reducedMotion ? 0 : 180);
      }, delay);

      var ch = guess[i];
      var prev = self.keyStates[ch];
      var rank = { absent: 0, present: 1, correct: 2 };
      if (!prev || rank[result[i]] > rank[prev]) {
        self.keyStates[ch] = result[i];
        var keyBtn = self.keyboardEl.querySelector('[data-key="' + ch + '"]');
        if (keyBtn) {
          keyBtn.classList.remove("wg-key--absent", "wg-key--present", "wg-key--correct");
          keyBtn.classList.add("wg-key--" + result[i]);
        }
      }
    });

    var totalFlipTime = this.reducedMotion ? 0 : (len_(guess) - 1) * 220 + 420;
    setTimeout(function () {
      if (guess === self.answer) {
        self.finished = true;
        tiles.forEach(function (t) { t.classList.add("wg-tile--win"); });
        self._setMessage("Solved!", "win");
        self.onWin({
          tries: r + 1,
          maxTries: self.maxTries,
          timeSec: Math.round((Date.now() - self.startTime) / 1000),
        });
      } else if (r + 1 >= self.maxTries) {
        self.finished = true;
        self._setMessage(self.answer, "lose");
        self.onLose({ answer: self.answer });
      } else {
        self.currentRow += 1;
        self.currentGuess = "";
      }
    }, totalFlipTime + 80);
  };

  function len_(s) { return s.length; }

  window.WordleGame = WordleGame;
  window.scoreWordleGuess = scoreGuess;
})();

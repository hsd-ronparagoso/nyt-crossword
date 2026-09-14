/* ============================================================
   UnscrambleX — player state
   A tiny persisted store (localStorage) + pub/sub so any part of
   the UI can react when XP, streaks or achievements change.
   ============================================================ */
(function () {
  "use strict";

  var STORAGE_KEY = "ux_player_v1";

  var DEFAULT_STATE = {
    xp: 0,
    wordsSolved: 0,
    gamesCompleted: 0,
    guessesTotal: 0,
    guessesCorrectLetters: 0,
    streakCurrent: 0,
    streakBest: 0,
    lastDailyDate: null,       // yyyy-mm-dd of last completed Daily Word
    dailyCompletedCount: 0,
    perfectWins: 0,
    noHintWins: 0,
    fastestSolveSec: null,
    unlocked: {},               // achievement id -> true
    hintsRevealedForDate: {},   // "2026-09-14": [0,1] hint indexes unlocked
  };

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function dayOfYear(d) {
    var start = new Date(d.getFullYear(), 0, 0);
    var diff = d - start;
    return Math.floor(diff / 86400000);
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return Object.assign({}, DEFAULT_STATE);
      var parsed = JSON.parse(raw);
      return Object.assign({}, DEFAULT_STATE, parsed);
    } catch (e) {
      return Object.assign({}, DEFAULT_STATE);
    }
  }

  var state = load();
  var listeners = [];

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* private mode etc */ }
  }

  function emit(event, payload) {
    listeners.forEach(function (fn) {
      try { fn(event, payload, state); } catch (e) { /* no-op */ }
    });
  }

  function levelForXp(xp) {
    var thresholds = window.LEVEL_THRESHOLDS || [0, 100];
    var level = 1;
    for (var i = 0; i < thresholds.length; i++) {
      if (xp >= thresholds[i]) level = i + 1;
    }
    return level;
  }

  function levelProgress(xp) {
    var thresholds = window.LEVEL_THRESHOLDS || [0, 100];
    var level = levelForXp(xp);
    var floor = thresholds[level - 1] || 0;
    var ceil = thresholds[level] != null ? thresholds[level] : floor + 1000;
    return {
      level: level,
      floor: floor,
      ceil: ceil,
      xpIntoLevel: xp - floor,
      xpForLevel: ceil - floor,
      pct: Math.min(100, Math.round(((xp - floor) / (ceil - floor)) * 100)),
      xpToNext: Math.max(0, ceil - xp),
    };
  }

  function checkAchievements() {
    var newlyUnlocked = [];
    (window.ACHIEVEMENTS || []).forEach(function (a) {
      if (!state.unlocked[a.id] && a.check(state)) {
        state.unlocked[a.id] = true;
        newlyUnlocked.push(a);
      }
    });
    if (newlyUnlocked.length) {
      save();
      newlyUnlocked.forEach(function (a) { emit("achievement", a); });
    }
    return newlyUnlocked;
  }

  function addXp(amount, reason) {
    var before = levelForXp(state.xp);
    state.xp = Math.max(0, state.xp + amount);
    var after = levelForXp(state.xp);
    save();
    emit("xp", { amount: amount, reason: reason, total: state.xp });
    if (after > before) emit("levelup", { level: after });
    checkAchievements();
    return state.xp;
  }

  function recordGuessRow(correctCount, totalCount) {
    state.guessesTotal += totalCount;
    state.guessesCorrectLetters += correctCount;
    save();
  }

  function recordWin(opts) {
    // opts: { tries, maxTries, timeSec, hintsUsed, mode, isDaily }
    opts = opts || {};
    state.wordsSolved += 1;
    state.gamesCompleted += 1;
    if (opts.tries === 1) state.perfectWins += 1;
    if (!opts.hintsUsed) state.noHintWins += 1;
    if (opts.timeSec != null && (state.fastestSolveSec == null || opts.timeSec < state.fastestSolveSec)) {
      state.fastestSolveSec = opts.timeSec;
    }

    if (opts.isDaily) {
      var today = todayKey();
      if (state.lastDailyDate !== today) {
        var yest = new Date();
        yest.setDate(yest.getDate() - 1);
        var yKey = yest.getFullYear() + "-" + String(yest.getMonth() + 1).padStart(2, "0") + "-" + String(yest.getDate()).padStart(2, "0");
        state.streakCurrent = (state.lastDailyDate === yKey) ? state.streakCurrent + 1 : 1;
        state.streakBest = Math.max(state.streakBest, state.streakCurrent);
        state.lastDailyDate = today;
        state.dailyCompletedCount += 1;
      }
    }
    save();
    emit("win", opts);
    checkAchievements();
  }

  function isDailyDoneToday() {
    return state.lastDailyDate === todayKey();
  }

  function hintsUnlockedFor(dateKey) {
    return state.hintsRevealedForDate[dateKey] || [];
  }

  function unlockHint(dateKey, hintIndex) {
    var arr = state.hintsRevealedForDate[dateKey] || [];
    if (arr.indexOf(hintIndex) === -1) arr.push(hintIndex);
    state.hintsRevealedForDate[dateKey] = arr;
    save();
    emit("hint", { dateKey: dateKey, hintIndex: hintIndex });
  }

  function accuracyPct() {
    if (!state.guessesTotal) return null;
    return Math.round((state.guessesCorrectLetters / state.guessesTotal) * 100);
  }

  window.PlayerState = {
    get: function () { return state; },
    subscribe: function (fn) { listeners.push(fn); return function () { listeners = listeners.filter(function (l) { return l !== fn; }); }; },
    addXp: addXp,
    recordWin: recordWin,
    recordGuessRow: recordGuessRow,
    checkAchievements: checkAchievements,
    levelForXp: levelForXp,
    levelProgress: levelProgress,
    todayKey: todayKey,
    dayOfYear: dayOfYear,
    isDailyDoneToday: isDailyDoneToday,
    hintsUnlockedFor: hintsUnlockedFor,
    unlockHint: unlockHint,
    accuracyPct: accuracyPct,
    save: save,
  };
})();

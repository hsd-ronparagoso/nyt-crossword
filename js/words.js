/* ============================================================
   WordArcade — dictionary loader + word utilities
   The 14,855-word valid-guess list is fetched lazily (only once
   a game actually needs it) so the initial page stays light.
   ============================================================ */
(function () {
  "use strict";

  var wordSet = null;
  var wordList = null;
  var loadingPromise = null;

  function load() {
    if (wordSet) return Promise.resolve(wordSet);
    if (loadingPromise) return loadingPromise;
    loadingPromise = fetch("data/valid-words.json")
      .then(function (r) { return r.json(); })
      .then(function (arr) {
        wordList = arr;
        wordSet = new Set(arr);
        return wordSet;
      })
      .catch(function () {
        // Offline / blocked fetch fallback: use the curated answer
        // bank so the games still function without the full dictionary.
        wordList = (window.ANSWER_WORDS || []).map(function (w) { return w.word; });
        wordSet = new Set(wordList);
        return wordSet;
      });
    return loadingPromise;
  }

  function letterCounts(str) {
    var counts = {};
    str.toUpperCase().split("").forEach(function (ch) { counts[ch] = (counts[ch] || 0) + 1; });
    return counts;
  }

  function isAnagramOf(a, b) {
    if (a.length !== b.length) return false;
    var ca = letterCounts(a), cb = letterCounts(b);
    return Object.keys(ca).every(function (k) { return ca[k] === cb[k]; }) &&
      Object.keys(cb).every(function (k) { return ca[k] === cb[k]; });
  }

  function canBuildFrom(word, pool) {
    var wc = letterCounts(word), pc = letterCounts(pool);
    return Object.keys(wc).every(function (k) { return pc[k] && pc[k] >= wc[k]; });
  }

  window.WordBank = {
    load: load,
    isValid: function (word) { return !!wordSet && wordSet.has(word.toUpperCase()); },
    isValidAsync: function (word) { return load().then(function (set) { return set.has(word.toUpperCase()); }); },
    list: function () { return wordList || []; },
    letterCounts: letterCounts,
    isAnagramOf: isAnagramOf,
    canBuildFrom: canBuildFrom,

    findAnagrams: function (word) {
      word = word.toUpperCase().replace(/[^A-Z]/g, "");
      if (!wordList) return [];
      return wordList.filter(function (w) { return w !== word && w.length === word.length && isAnagramOf(w, word); });
    },
    findFromLetters: function (letters, opts) {
      opts = opts || {};
      letters = letters.toUpperCase().replace(/[^A-Z]/g, "");
      if (!wordList) return [];
      return wordList.filter(function (w) {
        if (opts.exactLength && w.length !== letters.length) return false;
        return canBuildFrom(w, letters);
      });
    },
    findStartsWith: function (prefix) {
      prefix = prefix.toUpperCase().replace(/[^A-Z]/g, "");
      if (!wordList || !prefix) return [];
      return wordList.filter(function (w) { return w.indexOf(prefix) === 0; });
    },
    findContains: function (fragment) {
      fragment = fragment.toUpperCase().replace(/[^A-Z]/g, "");
      if (!wordList || !fragment) return [];
      return wordList.filter(function (w) { return w.indexOf(fragment) !== -1; });
    },
  };
})();

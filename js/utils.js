/* ============================================================
   UnscrambleX — tiny shared helpers (difficulty display, etc.)
   ============================================================ */
(function () {
  "use strict";

  var STAR_MAP = { Easy: 2, Medium: 3, Tricky: 4, Hard: 4, Expert: 5 };

  function diffStars(diff) {
    var n = STAR_MAP[diff] || 3;
    return "★".repeat(n) + "☆".repeat(5 - n);
  }

  function diffChipHtml(diff) {
    return '<span class="chip chip--diff"><span class="stars stars--sm">' + diffStars(diff) + "</span> " + diff + "</span>";
  }

  window.Utils = { diffStars: diffStars, diffChipHtml: diffChipHtml };
})();

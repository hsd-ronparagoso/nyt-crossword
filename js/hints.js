/* ============================================================
   WordArcade — in-game Hint Panel
   A self-contained, reusable "💡 Hints" card. Every game passes
   its own contextual hint list (from data/how-to-play.js) plus a
   `use(hint)` function that performs the actual reveal — this
   module only owns the UI: locked/unlocked state, afford checks,
   click feedback, and the XP/time deduction animation.
   ============================================================ */
(function () {
  "use strict";

  /**
   * @param {HTMLElement} container
   * @param {Object} config
   *   hints: [{id, icon, label, desc, cost, unit}]
   *   sequential: bool — hint N locked until hint N-1 is unlocked
   *   use: function(hint) -> { text } | null   (null = couldn't afford / failed)
   *   getSpendable: function(unit) -> number   (current XP or seconds-left)
   *   startOpen: bool
   */
  function create(container, config) {
    var hints = config.hints;
    var unlocked = {};
    var revealedText = {};
    var open = !!config.startOpen;

    var root = document.createElement("div");
    root.className = "hint-panel";
    container.appendChild(root);

    function afford(hint) {
      var have = config.getSpendable ? config.getSpendable(hint.unit) : Infinity;
      return have >= hint.cost;
    }
    function sequentialLocked(idx) {
      return !!config.sequential && idx > 0 && !unlocked[hints[idx - 1].id];
    }

    function render() {
      var usedCount = hints.filter(function (h) { return unlocked[h.id]; }).length;
      root.innerHTML =
        '<button type="button" class="hint-panel__head" data-hint-toggle aria-expanded="' + open + '">' +
        '  <span><i class="ph-fill ph-lightbulb"></i> Hints</span>' +
        '  <span class="hint-panel__count">' + usedCount + " / " + hints.length + '<i class="ph-bold ph-caret-down hint-panel__caret"></i></span>' +
        "</button>" +
        '<div class="hint-panel__body"' + (open ? "" : " hidden") + ">" +
        hints.map(function (h, i) {
          var isUnlocked = !!unlocked[h.id];
          var isSeqLocked = sequentialLocked(i);
          var canAfford = afford(h);
          return (
            '<div class="hint-row' + (isUnlocked ? " is-unlocked" : "") + '">' +
            '<span class="hint-row__icon"><i class="' + (isUnlocked ? "ph-fill" : "ph-bold") + " " + h.icon + '"></i></span>' +
            '<span class="hint-row__body">' +
            "<strong>" + h.label + "</strong>" +
            '<span class="hint-row__desc">' + (isUnlocked && revealedText[h.id] ? revealedText[h.id] : h.desc) + "</span>" +
            "</span>" +
            (isUnlocked
              ? '<span class="hint-row__done"><i class="ph-fill ph-check-circle"></i></span>'
              : '<button type="button" class="btn btn--ghost btn--sm hint-row__btn" data-hint-use="' + h.id + '"' +
                (isSeqLocked ? " disabled" : "") + ">" +
                (isSeqLocked ? '<i class="ph-bold ph-lock-simple"></i>' : "−" + h.cost + (h.unit === "sec" ? "s" : " XP")) +
                "</button>") +
            "</div>"
          );
        }).join("") +
        "</div>";

      var head = root.querySelector("[data-hint-toggle]");
      head.addEventListener("click", function () {
        open = !open;
        render();
      });
      root.querySelectorAll("[data-hint-use]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-hint-use");
          var hint = hints.filter(function (h) { return h.id === id; })[0];
          if (!hint || sequentialLocked(hints.indexOf(hint))) return;
          if (!afford(hint)) {
            btn.classList.add("is-shake");
            setTimeout(function () { btn.classList.remove("is-shake"); }, 400);
            return;
          }
          var rect = btn.getBoundingClientRect();
          var result = config.use(hint);
          if (!result) {
            btn.classList.add("is-shake");
            setTimeout(function () { btn.classList.remove("is-shake"); }, 400);
            return;
          }
          unlocked[hint.id] = true;
          revealedText[hint.id] = result.text || hint.desc;
          window.Effects.xpToast(-hint.cost, rect.left + rect.width / 2, rect.top, hint.unit);
          render();
        });
      });
    }

    render();

    return {
      refresh: render,
      pulse: function () {
        open = true;
        render();
        root.scrollIntoView({ behavior: window.Effects.prefersReducedMotion() ? "auto" : "smooth", block: "center" });
        root.classList.remove("hint-panel--pulse");
        void root.offsetWidth;
        root.classList.add("hint-panel--pulse");
      },
      usedCount: function () { return hints.filter(function (h) { return unlocked[h.id]; }).length; },
      isUnlocked: function (id) { return !!unlocked[id]; },
    };
  }

  /* "I'm Stuck" secondary CTA — a friendly nudge toward the hint panel. */
  function attachImStuck(container, hintPanelHandle) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "im-stuck-btn";
    btn.innerHTML = '<i class="ph-fill ph-lifebuoy"></i> Need a little help?';
    btn.addEventListener("click", function () { hintPanelHandle.pulse(); });
    container.appendChild(btn);
    return btn;
  }

  window.HintPanel = { create: create, attachImStuck: attachImStuck };
})();

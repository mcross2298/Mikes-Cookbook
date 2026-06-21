/* ==========================================================================
   cookbook-home.js  —  Phase 2
   --------------------------------------------------------------------------
   Renders the Mike's Cookbook home / browse screen (index.html).
   Reads RECIPES from recipes-data.js, groups them by `source` collection
   (e.g. "Two Meals a Day"), and renders a filterable grid of recipe cards.
   Tapping a card opens recipe.html?id=<recipe_id>.

   Filter chips scope the grid by dish-type category (Breakfast | Salads &
   Slaws | Soups, Stews & Chilis | Casseroles & Bakes | Skillets & Stir-Fries |
   Grilled & Sheet-Pan | Sandwiches), with an "All" default. Each recipe has
   exactly one `dish_category`. Empty collections are hidden under the active
   filter. No framework, no build step.
   ========================================================================== */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var el = function (tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };

  // Dish-type categories in display order (only those present are shown as
  // chips). Each recipe declares exactly one `dish_category`, so the filter is
  // unambiguous — a recipe always has a single home.
  var CATEGORY_ORDER = [
    "Breakfast",
    "Salads & Slaws",
    "Soups, Stews & Chilis",
    "Casseroles & Bakes",
    "Skillets & Stir-Fries",
    "Grilled & Sheet-Pan",
    "Sandwiches"
  ];

  var state = { filter: "All" };

  function recipes() { return window.RECIPES || []; }

  function rgbFromHex(hex) {
    var h = (hex || "").replace("#", "");
    if (h.length !== 6) return "200,122,83";
    return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }).join(",");
  }

  /* ── Filter chips ─────────────────────────────────────────────────── */
  function renderFilters() {
    var bar = $("#filters");
    bar.innerHTML = "";

    var present = CATEGORY_ORDER.filter(function (c) {
      return recipes().some(function (r) { return r.dish_category === c; });
    });
    var chips = ["All"].concat(present);

    chips.forEach(function (c) {
      var chip = el("button", "chip" + (state.filter === c ? " active" : ""), esc(c));
      chip.setAttribute("type", "button");
      chip.addEventListener("click", function () {
        state.filter = c;
        renderFilters();
        renderCollections();
      });
      bar.appendChild(chip);
    });
  }

  /* ── Collections (grouped by source) ──────────────────────────────── */
  function renderCollections() {
    var root = $("#collections");
    root.innerHTML = "";

    var list = recipes().filter(function (r) {
      return state.filter === "All" || r.dish_category === state.filter;
    });

    if (!list.length) {
      root.appendChild(el("p", "empty", "No recipes in this category yet."));
      return;
    }

    // Group by source, preserving first-seen order.
    var order = [], groups = {};
    list.forEach(function (r) {
      var src = r.source || "Other";
      if (!groups[src]) { groups[src] = []; order.push(src); }
      groups[src].push(r);
    });

    order.forEach(function (src) {
      var sec = el("section", "collection");
      var head = el("div", "collection-head");
      head.appendChild(el("h2", "collection-name", esc(src)));
      head.appendChild(el("span", "collection-count",
        groups[src].length + (groups[src].length === 1 ? " recipe" : " recipes")));
      sec.appendChild(head);

      var grid = el("div", "card-grid");
      groups[src].forEach(function (r) { grid.appendChild(recipeCard(r)); });
      sec.appendChild(grid);
      root.appendChild(sec);
    });
  }

  /* ── Recipe card (color-block + icon) ─────────────────────────────── */
  function recipeCard(r) {
    var accent = r.accent || "#C87A53";
    var card = el("a", "rc");
    card.href = "recipe.html?id=" + encodeURIComponent(r.recipe_id);
    card.style.setProperty("--rc-accent", accent);
    card.style.setProperty("--rc-accent-rgb", rgbFromHex(accent));

    var m = (r.macro_profiles && r.macro_profiles.serving_2) || {};
    var totalTime = (r.prep_time_mins || 0) + (r.cook_time_mins || 0);

    var meta = [];
    if (r.dish_category) meta.push(esc(r.dish_category));
    if (totalTime) meta.push(totalTime + " min");

    var macro = [];
    if (m.calories != null) macro.push(m.calories + " cal");
    if (m.protein_g != null) macro.push(m.protein_g + "g protein");

    card.innerHTML =
      '<div class="rc-band"><span class="rc-icon">' + esc(r.icon || "🍽️") + "</span></div>" +
      '<div class="rc-body">' +
        '<h3 class="rc-title">' + esc(r.title) + "</h3>" +
        '<p class="rc-meta">' + meta.join(" · ") + "</p>" +
        (macro.length ? '<p class="rc-macro">' + macro.join(" · ") + "</p>" : "") +
      "</div>";
    return card;
  }

  /* ── Boot ─────────────────────────────────────────────────────────── */
  function init() {
    renderFilters();
    renderCollections();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();

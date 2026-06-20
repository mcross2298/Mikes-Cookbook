/* ==========================================================================
   cookbook.js  —  Phase 1
   --------------------------------------------------------------------------
   Render + state logic for the unified recipe-detail view (recipe.html).
   Consumes RECIPES from recipes-data.js. No framework, no build step.

   State:
     • serving  — active ladder tier (2 | 4). Re-renders macros + ingredients.
     • tab      — active sub-tab ('overview' | 'grocery' | 'steps').
   Check-off state (groceries + steps) persists in localStorage, keyed by
   recipe + serving tier so the two tiers keep independent lists.

   scaleQuantity() is included for FUTURE single-tier recipes (spec §1.2): if a
   recipe only authors one tier, the missing tier can be generated on the fly.
   Phase 1 recipes author both tiers explicitly, so it is unused here but kept
   ready and tested-by-shape.
   ========================================================================== */
(function () {
  "use strict";

  /* ── Tiny helpers ─────────────────────────────────────────────────── */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
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
  var CHECK_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" ' +
    'stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';

  /* ── Quantity scaling (future single-tier recipes) ────────────────── */
  // Parses common fraction/decimal quantities, scales by a factor, and returns
  // a tidy string ("1/2", "1 1/2", "3", "0.75"). Non-numeric quantities (e.g.
  // "to taste") pass through unchanged.
  function scaleQuantity(qty, factor) {
    if (qty == null) return qty;
    var s = String(qty).trim();
    var m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/); // mixed: "1 1/2"
    var val;
    if (m) {
      val = parseInt(m[1], 10) + parseInt(m[2], 10) / parseInt(m[3], 10);
    } else if ((m = s.match(/^(\d+)\/(\d+)$/))) { // simple fraction
      val = parseInt(m[1], 10) / parseInt(m[2], 10);
    } else if (/^-?\d*\.?\d+$/.test(s)) { // integer / decimal
      val = parseFloat(s);
    } else {
      return s; // not numeric — leave alone
    }
    return prettyNumber(val * factor);
  }

  function prettyNumber(v) {
    var whole = Math.floor(v + 1e-9);
    var frac = v - whole;
    var FRACTIONS = [
      [1 / 4, "1/4"], [1 / 3, "1/3"], [1 / 2, "1/2"],
      [2 / 3, "2/3"], [3 / 4, "3/4"]
    ];
    var best = null, bestDiff = 0.06;
    for (var i = 0; i < FRACTIONS.length; i++) {
      var d = Math.abs(frac - FRACTIONS[i][0]);
      if (d < bestDiff) { best = FRACTIONS[i][1]; bestDiff = d; }
    }
    if (frac < 0.06) return String(whole);
    if (frac > 0.94) return String(whole + 1);
    if (best) return (whole > 0 ? whole + " " : "") + best;
    return String(Math.round(v * 100) / 100);
  }

  /* ── Persistence ──────────────────────────────────────────────────── */
  function storeKey(recipeId, serving, kind) {
    return "mc-cookbook:" + recipeId + ":s" + serving + ":" + kind;
  }
  function loadSet(recipeId, serving, kind) {
    try {
      return new Set(JSON.parse(localStorage.getItem(storeKey(recipeId, serving, kind)) || "[]"));
    } catch (e) { return new Set(); }
  }
  function saveSet(recipeId, serving, kind, set) {
    try {
      localStorage.setItem(storeKey(recipeId, serving, kind), JSON.stringify([].slice.call(set)));
    } catch (e) {}
  }

  /* ── App state ────────────────────────────────────────────────────── */
  var state = { recipe: null, serving: 2, tab: "overview" };

  function pickRecipe() {
    var id = new URLSearchParams(location.search).get("id");
    var list = window.RECIPES || [];
    return list.filter(function (r) { return r.recipe_id === id; })[0] || list[0] || null;
  }

  /* ── Header (title, tags, times, servings ladder) ─────────────────── */
  function renderHeader(r) {
    var h = $("#header");
    h.innerHTML = "";

    var eyebrow = el("div", "r-eyebrow");
    eyebrow.appendChild(el("span", "r-tag", esc(r.category)));
    (r.tags || []).slice(0, 1).forEach(function (t) {
      eyebrow.appendChild(el("span", "r-tag sage", esc(t)));
    });
    h.appendChild(eyebrow);

    h.appendChild(el("h1", "r-title", esc(r.title)));

    var meta = el("div", "r-meta");
    meta.innerHTML =
      "<span>Prep <b>" + r.prep_time_mins + " min</b></span>" +
      "<span>Cook <b>" + r.cook_time_mins + " min</b></span>" +
      "<span>Total <b>" + (r.prep_time_mins + r.cook_time_mins) + " min</b></span>";
    h.appendChild(meta);

    // Serving-size ladder
    var ladder = el("div", "servings");
    (r.scaling_options || [2, 4]).forEach(function (n) {
      var b = el("button", "serving-opt" + (n === state.serving ? " active" : ""),
        n + " Serving" + (n === 1 ? "" : "s"));
      b.setAttribute("type", "button");
      b.addEventListener("click", function () {
        if (state.serving === n) return;
        state.serving = n;
        renderHeader(r);          // refresh active pill
        renderMacros(r);
        renderGrocery(r);
        renderRecipe(r);
      });
      ladder.appendChild(b);
    });
    h.appendChild(ladder);
  }

  /* ── Tab 1: Overview & Macros ─────────────────────────────────────── */
  function renderMacros(r) {
    var pane = $("#pane-overview");
    pane.innerHTML = "";

    var about = el("div", "card");
    about.appendChild(el("p", "card-label", "About"));
    about.appendChild(el("p", "desc", esc(r.description)));
    if (r.tags && r.tags.length) {
      var tw = el("div", "culinary-tags");
      r.tags.forEach(function (t) { tw.appendChild(el("span", "culinary-tag", esc(t))); });
      about.appendChild(tw);
    }
    pane.appendChild(about);

    var m = r.macro_profiles["serving_" + state.serving] || {};
    var card = el("div", "card");
    card.appendChild(el("p", "card-label", "Macro Profile · " + state.serving + " servings"));
    var grid = el("div", "macro-grid");
    grid.appendChild(macroCell("cals", m.calories, "kcal", "Calories"));
    grid.appendChild(macroCell("", m.protein_g, "g", "Protein"));
    grid.appendChild(macroCell("", m.fat_g, "g", "Fat"));
    grid.appendChild(macroCell("", m.carbs_g, "g", "Carbs"));
    card.appendChild(grid);
    card.appendChild(el("p", "macro-foot",
      "Totals for the full " + state.serving + "-serving recipe."));
    pane.appendChild(card);
  }
  function macroCell(extra, num, unit, key) {
    var c = el("div", "macro" + (extra ? " " + extra : ""));
    c.innerHTML =
      '<div class="macro-num">' + (num != null ? num : "—") + "</div>" +
      '<div class="macro-unit">' + unit + "</div>" +
      '<div class="macro-key">' + key + "</div>";
    return c;
  }

  /* ── Tab 2: Grocery — a pure shopping list ────────────────────────── */
  // Shows only what you BUY (quantity + item), grouped by aisle. Prep details
  // (e.g. "cooked and chopped") deliberately live on the Recipe tab, not here.
  var CAT_ORDER = ["Meat", "Dairy", "Produce", "Pantry"];
  function renderGrocery(r) {
    var pane = $("#pane-grocery");
    pane.innerHTML = "";

    var list = r.ingredients_by_serving["serving_" + state.serving] || [];
    var done = loadSet(r.recipe_id, state.serving, "grocery");

    // Group by category, preserving CAT_ORDER then any extras.
    var groups = {};
    list.forEach(function (ing, i) {
      (groups[ing.category] = groups[ing.category] || []).push({ ing: ing, idx: i });
    });
    var cats = CAT_ORDER.filter(function (c) { return groups[c]; })
      .concat(Object.keys(groups).filter(function (c) { return CAT_ORDER.indexOf(c) < 0; }));

    var card = el("div", "card grocery-card");
    card.appendChild(el("p", "card-label",
      "Shopping list · " + list.length + " items · " + state.serving + " servings"));

    cats.forEach(function (cat) {
      var sec = el("div", "grocery-cat");
      sec.appendChild(el("div", "grocery-cat-head",
        '<span class="dot"></span>' + esc(cat) +
        '<span class="grocery-cat-count">' + groups[cat].length + "</span>"));
      groups[cat].forEach(function (entry) {
        sec.appendChild(groceryRow(r, entry.ing, entry.idx, done));
      });
      card.appendChild(sec);
    });
    pane.appendChild(card);
  }
  function groceryRow(r, ing, idx, done) {
    var isDone = done.has(idx);
    var row = el("div", "check-row grocery-row" + (isDone ? " done" : ""));
    var qty = [ing.quantity, ing.unit].filter(Boolean).join(" ");
    row.innerHTML =
      '<span class="check-box">' + CHECK_SVG + "</span>" +
      '<span class="grocery-qty">' + (qty ? esc(qty) : "") + "</span>" +
      '<span class="check-text">' + esc(ing.item) + "</span>";
    row.addEventListener("click", function () {
      var set = loadSet(r.recipe_id, state.serving, "grocery");
      if (set.has(idx)) { set.delete(idx); row.classList.remove("done"); }
      else { set.add(idx); row.classList.add("done"); }
      saveSet(r.recipe_id, state.serving, "grocery", set);
    });
    return row;
  }

  /* ── Tab 3: Recipe — mise en place (ingredients + prep) then method ── */
  function renderRecipe(r) {
    var pane = $("#pane-recipe");
    pane.innerHTML = "";

    var list = r.ingredients_by_serving["serving_" + state.serving] || [];
    var miseDone = loadSet(r.recipe_id, state.serving, "mise");
    var stepDone = loadSet(r.recipe_id, state.serving, "steps");
    var steps = r.instructions || [];

    // Mise en place: full ingredient line WITH prep detail.
    var ing = el("div", "card");
    ing.appendChild(el("p", "card-label",
      "Ingredients · " + state.serving + " servings"));
    list.forEach(function (it, i) {
      ing.appendChild(miseRow(r, it, i, miseDone));
    });
    pane.appendChild(ing);

    // Method: the numbered, checkable stepper.
    var method = el("div", "card");
    method.appendChild(el("p", "card-label", "Method"));
    method.appendChild(el("p", "step-progress",
      stepDone.size + " of " + steps.length + " steps complete"));
    var wrap = el("div", "steps");
    steps.forEach(function (st) { wrap.appendChild(stepRow(r, st, stepDone)); });
    method.appendChild(wrap);
    pane.appendChild(method);
  }
  function miseRow(r, ing, idx, done) {
    var isDone = done.has(idx);
    var row = el("div", "check-row" + (isDone ? " done" : ""));
    var qty = [ing.quantity, ing.unit].filter(Boolean).join(" ");
    var label =
      (qty ? '<span class="check-qty">' + esc(qty) + "</span> " : "") +
      esc(ing.item) +
      (ing.prep ? '<span class="check-prep">, ' + esc(ing.prep) + "</span>" : "");
    row.innerHTML =
      '<span class="check-box">' + CHECK_SVG + "</span>" +
      '<span class="check-text">' + label + "</span>";
    row.addEventListener("click", function () {
      var set = loadSet(r.recipe_id, state.serving, "mise");
      if (set.has(idx)) { set.delete(idx); row.classList.remove("done"); }
      else { set.add(idx); row.classList.add("done"); }
      saveSet(r.recipe_id, state.serving, "mise", set);
    });
    return row;
  }
  function stepRow(r, st, done) {
    var isDone = done.has(st.step_number);
    var row = el("div", "step" + (isDone ? " done" : ""));
    row.innerHTML =
      '<div class="step-rail">' +
        '<div class="step-num">' + st.step_number + "</div>" +
        '<div class="step-line"></div>' +
      "</div>" +
      '<div class="step-body">' +
        '<p class="step-title">' + esc(st.title) + "</p>" +
        '<p class="step-detail">' + esc(st.detail) + "</p>" +
      "</div>";
    row.addEventListener("click", function () {
      var set = loadSet(r.recipe_id, state.serving, "steps");
      if (set.has(st.step_number)) { set.delete(st.step_number); }
      else { set.add(st.step_number); }
      saveSet(r.recipe_id, state.serving, "steps", set);
      renderRecipe(r); // refresh progress count + completed marks
    });
    return row;
  }

  /* ── Sub-tab switching (+ swipe) ──────────────────────────────────── */
  var TABS = ["overview", "grocery", "recipe"];
  function setTab(name) {
    state.tab = name;
    TABS.forEach(function (t) {
      $("#tab-" + t).classList.toggle("active", t === name);
      $("#pane-" + t).classList.toggle("active", t === name);
    });
  }
  function wireTabs() {
    TABS.forEach(function (t) {
      $("#tab-" + t).addEventListener("click", function () { setTab(t); });
    });
    // Horizontal swipe across the panes (spec §1.2: swipeable sub-tabs).
    var panes = $("#panes"), x0 = null, y0 = null;
    panes.addEventListener("touchstart", function (e) {
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    panes.addEventListener("touchend", function (e) {
      if (x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0;
      var dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6) {
        var i = TABS.indexOf(state.tab);
        if (dx < 0 && i < TABS.length - 1) setTab(TABS[i + 1]);
        if (dx > 0 && i > 0) setTab(TABS[i - 1]);
      }
      x0 = y0 = null;
    }, { passive: true });
  }

  /* ── Boot ─────────────────────────────────────────────────────────── */
  function init() {
    var r = pickRecipe();
    if (!r) {
      $("#header").innerHTML =
        '<h1 class="r-title">No recipe found</h1>' +
        '<p class="r-meta">Check recipes-data.js.</p>';
      return;
    }
    state.recipe = r;
    state.serving = (r.scaling_options && r.scaling_options[0]) || 2;
    if (r.accent) {
      document.documentElement.style.setProperty("--accent", r.accent);
      // derive rgb for translucent fills
      var hex = r.accent.replace("#", "");
      if (hex.length === 6) {
        document.documentElement.style.setProperty("--accent-rgb",
          [0, 2, 4].map(function (i) { return parseInt(hex.substr(i, 2), 16); }).join(","));
      }
    }
    document.title = r.title + " · Mike's Cookbook";

    renderHeader(r);
    renderMacros(r);
    renderGrocery(r);
    renderRecipe(r);
    wireTabs();
    setTab("overview");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }

  // Expose scaler for future use / testing.
  window.MCCookbook = { scaleQuantity: scaleQuantity };
})();

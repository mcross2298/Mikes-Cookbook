/* ==========================================================================
   cookbook.js  —  Phase 1
   --------------------------------------------------------------------------
   Render + state logic for the unified recipe-detail view (recipe.html).
   Consumes RECIPES from recipes-data.js. No framework, no build step.

   State:
     • serving  — chosen serving count (1..12 via the stepper). Authored tiers
                  (e.g. 2 / 4) are exact; other counts are scaled live from the
                  native tier. Re-renders macros + ingredients.
     • tab      — active sub-tab ('overview' | 'grocery' | 'steps').
   Check-off state (groceries + steps) persists in localStorage, keyed by
   recipe + serving count so each count keeps an independent list.

   scaleQuantity() powers arbitrary serving counts: when a count has no authored
   tier, ingredientsFor() scales the native tier by (target / native). Macros
   are per single serving and constant, so they never scale.
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
  // Retrigger a one-shot animation by removing the class, forcing reflow, re-adding.
  var pop = function (node) {
    node.classList.remove("pop");
    void node.offsetWidth; // eslint-disable-line no-unused-expressions
    node.classList.add("pop");
  };
  var CHECK_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" ' +
    'stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';

  /* ── Inline step timers ───────────────────────────────────────────── */
  // Cooks reach for a separate timer app for "simmer 20 minutes". Parse real
  // durations out of step text and offer a tappable countdown chip that pings
  // and vibrates on completion. A time UNIT is required, so quantities like
  // "20g" or "425°F" never become timers. Everything works offline.
  var DUR_RE = /(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s*(hours?|hrs?|minutes?|mins?|seconds?|secs?)\b/gi;

  function durToSeconds(numStr, unit) {
    var n, m = numStr.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (m) n = parseInt(m[1], 10) + parseInt(m[2], 10) / parseInt(m[3], 10);
    else if ((m = numStr.match(/^(\d+)\/(\d+)$/))) n = parseInt(m[1], 10) / parseInt(m[2], 10);
    else n = parseFloat(numStr);
    unit = unit.toLowerCase();
    if (unit.charAt(0) === "h") return Math.round(n * 3600);
    if (unit.charAt(0) === "m") return Math.round(n * 60);
    return Math.round(n);
  }
  function parseDurations(text) {
    var out = [], seen = {}, m;
    DUR_RE.lastIndex = 0;
    while ((m = DUR_RE.exec(text || ""))) {
      var secs = durToSeconds(m[1], m[2]);
      if (secs <= 0 || secs > 86400 || seen[secs]) continue; // sane bounds, dedupe
      seen[secs] = 1;
      out.push({ label: m[0].replace(/\s+/g, " ").trim(), seconds: secs });
    }
    return out;
  }
  function fmtClock(s) {
    var m = Math.floor(s / 60), sec = s % 60;
    return m + ":" + (sec < 10 ? "0" : "") + sec;
  }

  // Lazy, gesture-primed alert tone (Web Audio) — no asset, works offline.
  var audioCtx = null;
  function primeAudio() {
    try {
      if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    } catch (e) {}
  }
  function ping() {
    try {
      if (!audioCtx) return;
      var t = audioCtx.currentTime;
      [0, 0.3, 0.6].forEach(function (off) {
        var osc = audioCtx.createOscillator(), g = audioCtx.createGain();
        osc.type = "sine"; osc.frequency.value = 880;
        g.gain.setValueAtTime(0.0001, t + off);
        g.gain.exponentialRampToValueAtTime(0.3, t + off + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + off + 0.22);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(t + off); osc.stop(t + off + 0.24);
      });
    } catch (e) {}
  }
  function buzz() { try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (e) {} }

  // A self-contained countdown chip. Tap to start; tap again to cancel/reset.
  function timerChip(seconds, label) {
    var chip = el("button", "timer-chip", "⏱ " + label);
    chip.type = "button";
    var remaining = seconds, intId = null;
    function clear() { if (intId) { clearInterval(intId); intId = null; } }
    function reset() {
      clear(); remaining = seconds;
      chip.className = "timer-chip"; chip.textContent = "⏱ " + label;
    }
    chip.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();        // never toggle the step itself
      if (intId || chip.classList.contains("ringing")) { reset(); return; }
      primeAudio();
      chip.classList.add("running");
      chip.textContent = "⏱ " + fmtClock(remaining);
      intId = setInterval(function () {
        remaining -= 1;
        if (remaining <= 0) {
          clear();
          chip.classList.remove("running");
          chip.classList.add("ringing");
          chip.textContent = "⏰ Time! · tap to reset";
          ping(); buzz();
          return;
        }
        chip.textContent = "⏱ " + fmtClock(remaining);
      }, 1000);
    });
    return chip;
  }
  function appendTimers(parent, text) {
    var times = parseDurations(text);
    if (!times.length) return;
    var wrap = el("div", "timer-wrap");
    times.forEach(function (t) { wrap.appendChild(timerChip(t.seconds, t.label)); });
    parent.appendChild(wrap);
  }

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

  /* ── Favorites (shared store with the home/Favorites tab) ─────────── */
  var FAV_KEY = "mc-cookbook:favorites";
  function loadFavs() {
    try { return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]")); }
    catch (e) { return new Set(); }
  }
  function isFav(id) { return loadFavs().has(id); }
  function toggleFav(id) {
    var set = loadFavs();
    if (set.has(id)) set.delete(id); else set.add(id);
    try { localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(set))); } catch (e) {}
    return set.has(id);
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
      localStorage.setItem(storeKey(recipeId, serving, kind), JSON.stringify(Array.from(set)));
    } catch (e) {}
  }

  /* ── App state ────────────────────────────────────────────────────── */
  var state = { recipe: null, serving: 2, tab: "overview" };

  function pickRecipe() {
    var id = new URLSearchParams(location.search).get("id");
    var list = window.RECIPES || [];
    return list.filter(function (r) { return r.recipe_id === id; })[0] || list[0] || null;
  }

  /* ── Serving scaling (arbitrary counts) ───────────────────────────── */
  // Authored tiers (e.g. serving_2 / serving_4) are used verbatim. Any other
  // serving count is generated on the fly by scaling the recipe's native tier,
  // which is exactly what scaleQuantity() was written (and tested-by-shape) for.
  // Macros are per single serving and constant, so they never scale.
  var SERVING_MIN = 1, SERVING_MAX = 12;

  function nativeServing(r) {
    return r.native_serving || (r.scaling_options && r.scaling_options[0]) || 2;
  }
  function ingredientsFor(r, serving) {
    var by = r.ingredients_by_serving || {};
    var authored = by["serving_" + serving];
    if (authored) return authored;                 // hand-rounded tier — use as-is
    var base = nativeServing(r);
    var baseList = by["serving_" + base] || by[Object.keys(by)[0]] || [];
    var factor = serving / base;
    return baseList.map(function (ing) {
      return {
        item: ing.item,
        prep: ing.prep,
        quantity: scaleQuantity(ing.quantity, factor),
        unit: ing.unit,
        category: ing.category
      };
    });
  }
  function macrosFor(r, serving) {
    var mp = r.macro_profiles || {};
    return mp["serving_" + serving] || mp["serving_" + nativeServing(r)] || {};
  }

  /* ── Header (title, tags, times, servings stepper) ────────────────── */
  function renderHeader(r) {
    var h = $("#header");
    h.innerHTML = "";

    // Back link + favorite toggle row.
    var nav = el("div", "r-nav");
    var back = el("a", "r-back", "‹ Back");
    back.href = document.referrer && /collection\.html|index\.html/.test(document.referrer)
      ? "javascript:history.back()" : "index.html#recipes";
    nav.appendChild(back);
    // Labeled pill so the save control is obvious (not just a bare icon).
    function favLabel(on) {
      return (on ? "❤" : "♡") +
        ' <span class="r-fav-text">' + (on ? "Saved" : "Save") + "</span>";
    }
    var heart = el("button", "fav-toggle r-fav" + (isFav(r.recipe_id) ? " on" : ""),
      favLabel(isFav(r.recipe_id)));
    heart.type = "button";
    heart.setAttribute("aria-label", "Toggle favorite");
    heart.addEventListener("click", function () {
      var on = toggleFav(r.recipe_id);
      heart.classList.toggle("on", on);
      heart.innerHTML = favLabel(on);
      pop(heart);
    });
    nav.appendChild(heart);
    h.appendChild(nav);

    var eyebrow = el("div", "r-eyebrow");
    if (r.dish_category) eyebrow.appendChild(el("span", "r-tag", esc(r.dish_category)));
    if (r.category) eyebrow.appendChild(el("span", "r-tag sage", esc(r.category)));
    h.appendChild(eyebrow);

    h.appendChild(el("h1", "r-title", esc(r.title)));

    var meta = el("div", "r-meta");
    meta.innerHTML =
      "<span>Prep <b>" + r.prep_time_mins + " min</b></span>" +
      "<span>Cook <b>" + r.cook_time_mins + " min</b></span>" +
      "<span>Total <b>" + (r.prep_time_mins + r.cook_time_mins) + " min</b></span>";
    h.appendChild(meta);

    // Serving-size stepper — any count from SERVING_MIN..SERVING_MAX. Authored
    // tiers are exact; in-between counts are scaled live from the native tier.
    function changeServing(n) {
      n = Math.max(SERVING_MIN, Math.min(SERVING_MAX, n));
      if (n === state.serving) return;
      state.serving = n;
      renderHeader(r);          // refresh count + disabled states + note
      renderMacros(r);
      renderGrocery(r);
      renderRecipe(r);
    }

    var ladder = el("div", "servings serving-stepper");

    var minus = el("button", "serving-step", "−");
    minus.type = "button";
    minus.setAttribute("aria-label", "Fewer servings");
    minus.disabled = state.serving <= SERVING_MIN;
    minus.addEventListener("click", function () { changeServing(state.serving - 1); });

    var count = el("div", "serving-count",
      '<span class="serving-num">' + state.serving + "</span>" +
      '<span class="serving-word">Serving' + (state.serving === 1 ? "" : "s") + "</span>");

    var plus = el("button", "serving-step", "+");
    plus.type = "button";
    plus.setAttribute("aria-label", "More servings");
    plus.disabled = state.serving >= SERVING_MAX;
    plus.addEventListener("click", function () { changeServing(state.serving + 1); });

    ladder.appendChild(minus);
    ladder.appendChild(count);
    ladder.appendChild(plus);
    h.appendChild(ladder);

    // Transparency: say whether the amounts are exact or scaled.
    var authored = (r.ingredients_by_serving || {})["serving_" + state.serving];
    h.appendChild(el("p", "serving-note",
      authored ? "Exact amounts from the recipe"
               : "Scaled live from " + nativeServing(r) + " servings"));
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

    // macro_profiles are stored PER SINGLE SERVING and are identical across
    // both tiers — the book's printed macros describe one portion, and the
    // serving size only changes how much the recipe makes, not the macros.
    // User-authored recipes are macro-free, so omit the card entirely when
    // there's nothing to show rather than rendering a grid of em-dashes.
    var m = macrosFor(r, state.serving);
    var hasMacros = ["calories", "protein_g", "fat_g", "carbs_g"].some(function (k) {
      return m[k] != null;
    });
    if (!hasMacros) return;
    var card = el("div", "card");
    card.appendChild(el("p", "card-label", "Macro Profile · Per Serving"));
    var grid = el("div", "macro-grid");
    grid.appendChild(macroCell("cals", m.calories, "kcal", "Calories"));
    grid.appendChild(macroCell("", m.protein_g, "g", "Protein"));
    grid.appendChild(macroCell("", m.fat_g, "g", "Fat"));
    grid.appendChild(macroCell("", m.carbs_g, "g", "Carbs"));
    card.appendChild(grid);
    card.appendChild(el("p", "macro-foot",
      "Per single serving. The serving size changes how much the recipe makes, not the macros."));
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

    var list = ingredientsFor(r, state.serving);
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

    var list = ingredientsFor(r, state.serving);
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
    var wakeInd = el("div", "wake-indicator", '<span class="wake-dot"></span>Screen staying on while you cook');
    wakeInd.id = "wake-indicator";
    wakeInd.setAttribute("aria-hidden", "true");
    method.appendChild(wakeInd);
    method.appendChild(el("p", "step-progress",
      stepDone.size + " of " + steps.length + " steps complete"));
    if (steps.length) {
      var startBtn = el("button", "cook-start", "▸ Start Cooking");
      startBtn.type = "button";
      startBtn.addEventListener("click", function () { enterCook(r); });
      method.appendChild(startBtn);
    }
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
    appendTimers(row.querySelector(".step-body"), st.detail);
    row.addEventListener("click", function () {
      var set = loadSet(r.recipe_id, state.serving, "steps");
      if (set.has(st.step_number)) { set.delete(st.step_number); }
      else { set.add(st.step_number); }
      saveSet(r.recipe_id, state.serving, "steps", set);
      renderRecipe(r); // refresh progress count + completed marks
    });
    return row;
  }

  /* ── Screen Wake Lock — keep the screen awake on the Method tab ─────── */
  // Greasy hands shouldn't have to wake a sleeping screen mid-cook. We hold a
  // wake lock only while the Recipe (Method) tab is active, release it on every
  // other tab, and re-acquire when the user returns to the tab (browsers drop
  // the lock whenever the page is hidden). Silently no-op where unsupported.
  var wake = (function () {
    var supported = "wakeLock" in navigator;
    var sentinel = null;
    var want = false; // whether we currently want the lock held

    function indicator(on) {
      var ind = $("#wake-indicator");
      if (!ind) return;
      ind.classList.toggle("on", !!on);
      ind.setAttribute("aria-hidden", on ? "false" : "true");
    }
    function acquire() {
      if (!supported || sentinel) return;
      navigator.wakeLock.request("screen").then(function (s) {
        sentinel = s;
        indicator(true);
        s.addEventListener("release", function () {
          sentinel = null;
          indicator(false);
        });
      }).catch(function () { indicator(false); }); // denied / low battery → no-op
    }
    function release() {
      indicator(false);
      if (sentinel) { sentinel.release().catch(function () {}); sentinel = null; }
    }
    function set(on) {
      want = !!on;
      if (want) acquire(); else release();
    }
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible" && want) acquire();
    });
    return { set: set };
  })();

  /* ── Cooking Mode (full-screen, one big step at a time) ────────────── */
  // The sanctioned exception to the persistent bottom bar: a distraction-free
  // stepper for hands-busy cooking. Wake lock is on; the bar is hidden; type is
  // large and user-scalable (persisted). Step done-state is the SAME store as
  // the checklist, so progress stays in sync when you exit.
  var COOK_FONT_KEY = "mc-cookbook:cookfont";
  var cook = { active: false, index: 0, recipe: null };

  function cookFont() {
    var v = parseFloat(localStorage.getItem(COOK_FONT_KEY));
    return isNaN(v) ? 1 : Math.max(0.8, Math.min(1.6, v));
  }
  function setCookFont(v) {
    v = Math.max(0.8, Math.min(1.6, Math.round(v * 10) / 10));
    try { localStorage.setItem(COOK_FONT_KEY, String(v)); } catch (e) {}
    var o = $("#cook");
    if (o) o.style.setProperty("--cook-font", v);
    return v;
  }
  function stepsDone(r) { return loadSet(r.recipe_id, state.serving, "steps"); }
  function markStep(r, num, on) {
    var set = stepsDone(r);
    if (on) set.add(num); else set.delete(num);
    saveSet(r.recipe_id, state.serving, "steps", set);
  }

  function enterCook(r) {
    var steps = r.instructions || [];
    if (!steps.length) return;
    cook.active = true; cook.recipe = r;
    // Resume at the first not-yet-done step.
    var done = stepsDone(r), start = 0;
    for (var i = 0; i < steps.length; i++) {
      if (!done.has(steps[i].step_number)) { start = i; break; }
    }
    cook.index = start;
    document.body.classList.add("cooking");
    wake.set(true);
    renderCook();
  }
  function exitCook() {
    cook.active = false;
    document.body.classList.remove("cooking");
    var o = $("#cook");
    if (o) o.parentNode.removeChild(o);
    wake.set(state.tab === "recipe");
    if (cook.recipe) renderRecipe(cook.recipe); // refresh checklist marks + count
  }
  function cookGo(delta) {
    var steps = cook.recipe.instructions || [];
    var n = cook.index + delta;
    if (n < 0) return;
    if (n >= steps.length) { exitCook(); return; } // past the last step → finish
    cook.index = n;
    renderCook();
  }

  function renderCook() {
    var r = cook.recipe, steps = r.instructions || [];
    var st = steps[cook.index];
    var isDone = stepsDone(r).has(st.step_number);
    var last = cook.index === steps.length - 1;

    var o = $("#cook");
    if (!o) {
      o = el("div", "cook");
      o.id = "cook";
      o.style.setProperty("--cook-font", cookFont());
      $("main.app").appendChild(o);
      wireCookSwipe(o);
    }
    o.innerHTML = "";

    // Top: exit · counter · font scale
    var top = el("div", "cook-top");
    var exit = el("button", "cook-exit", "✕ Exit");
    exit.type = "button";
    exit.addEventListener("click", exitCook);
    top.appendChild(exit);
    top.appendChild(el("div", "cook-count", "Step " + (cook.index + 1) + " of " + steps.length));
    var fonts = el("div", "cook-fonts");
    var aMinus = el("button", "cook-font-btn", "A−");
    aMinus.type = "button"; aMinus.setAttribute("aria-label", "Smaller text");
    aMinus.addEventListener("click", function () { setCookFont(cookFont() - 0.1); });
    var aPlus = el("button", "cook-font-btn", "A+");
    aPlus.type = "button"; aPlus.setAttribute("aria-label", "Larger text");
    aPlus.addEventListener("click", function () { setCookFont(cookFont() + 0.1); });
    fonts.appendChild(aMinus); fonts.appendChild(aPlus);
    top.appendChild(fonts);
    o.appendChild(top);

    // Progress
    var prog = el("div", "cook-progress");
    var bar = el("div", "cook-progress-bar");
    bar.style.width = ((cook.index + 1) / steps.length * 100) + "%";
    prog.appendChild(bar);
    o.appendChild(prog);

    // Body — the big step (tap to toggle done, like the checklist)
    var body = el("div", "cook-body" + (isDone ? " done" : ""));
    body.appendChild(el("div", "cook-step-num", isDone ? "✓" : String(st.step_number)));
    body.appendChild(el("h2", "cook-step-title", esc(st.title)));
    body.appendChild(el("p", "cook-step-detail", esc(st.detail)));
    appendTimers(body, st.detail);
    body.appendChild(el("p", "cook-tap-hint", isDone ? "Done · tap to undo" : "Tap to mark this step done"));
    body.addEventListener("click", function () {
      markStep(r, st.step_number, !stepsDone(r).has(st.step_number));
      renderCook();
    });
    o.appendChild(body);

    // Controls — prev · primary (done & next / finish)
    var ctl = el("div", "cook-controls");
    var prev = el("button", "cook-nav", "‹ Prev");
    prev.type = "button"; prev.disabled = cook.index === 0;
    prev.addEventListener("click", function () { cookGo(-1); });
    var next = el("button", "cook-nav primary", last ? "Finish ✓" : "Done & Next ›");
    next.type = "button";
    next.addEventListener("click", function () {
      markStep(r, st.step_number, true); // advancing completes the current step
      cookGo(1);
    });
    ctl.appendChild(prev);
    ctl.appendChild(next);
    o.appendChild(ctl);
  }

  // Horizontal swipe inside cooking mode: left → next, right → prev (no marking).
  function wireCookSwipe(o) {
    var x0 = null, y0 = null;
    o.addEventListener("touchstart", function (e) {
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    o.addEventListener("touchend", function (e) {
      if (x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0;
      var dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6) {
        if (dx < 0) cookGo(1); else cookGo(-1);
      }
      x0 = y0 = null;
    }, { passive: true });
  }

  /* ── Sub-tab switching (+ swipe) ──────────────────────────────────── */
  var TABS = ["overview", "grocery", "recipe"];
  function setTab(name) {
    state.tab = name;
    TABS.forEach(function (t) {
      $("#tab-" + t).classList.toggle("active", t === name);
      $("#pane-" + t).classList.toggle("active", t === name);
    });
    wake.set(name === "recipe"); // hold the screen awake only while cooking
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

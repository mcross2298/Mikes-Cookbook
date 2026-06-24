/* ==========================================================================
   cookbook-home.js  —  Phase 3 (Home-hub shell)
   --------------------------------------------------------------------------
   Drives index.html as a hub-and-spoke PWA shell — no bottom tab bar. Home is
   the hub; you tap a module to drill into a spoke screen, and every spoke has
   a "‹ Home" anchor back:

     Home        — hub: "This Week" planner hero + tappable Categories /
                   Recipes / Favorites modules.
     This Week   — the weekly meal planner. Build a week of meals as a flat
                   list or an optional 7-day × Breakfast/Lunch/Dinner schedule,
                   then get one smart-merged grocery list and the week's
                   recipes — all in the module (localStorage).
     Categories  — the 7 dish-type categories as premium cards. Tapping a
                   category drills into a grid of that category's recipes.
     Recipes     — flagship COLLECTION cards + app-wide search.
     Favorites   — recipes the user ❤'d (localStorage).

   The two standalone deep pages (recipe.html / collection.html) get a single
   persistent Home button from cookbook-nav.js. Active screen is mirrored to
   location.hash (#recipes) so it survives reloads and deep links.
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
  function rgbFromHex(hex) {
    var h = (hex || "").replace("#", "");
    if (h.length !== 6) return "200,122,83";
    return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }).join(",");
  }
  // Retrigger a one-shot animation: drop the class, force reflow, re-add.
  var pop = function (node) {
    node.classList.remove("pop");
    void node.offsetWidth; // eslint-disable-line no-unused-expressions
    node.classList.add("pop");
  };
  var CHECK_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" ' +
    'stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
  function emptyState(emoji, html) {
    return el("div", "empty", '<span class="empty-emoji">' + emoji + "</span>" + html);
  }

  function recipes() { return window.RECIPES || []; }
  function collections() { return window.COLLECTIONS || []; }
  function recipesIn(col) {
    if (!col.source_match) return [];
    return recipes().filter(function (r) { return r.source === col.source_match; });
  }

  /* ── Favorites (shared store, also read by collection.js / recipe page) ── */
  var FAV_KEY = "mc-cookbook:favorites";
  function loadFavs() {
    try { return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]")); }
    catch (e) { return new Set(); }
  }
  function saveFavs(set) {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(set))); } catch (e) {}
  }
  function toggleFav(id) {
    var set = loadFavs();
    if (set.has(id)) set.delete(id); else set.add(id);
    saveFavs(set);
    return set.has(id);
  }

  function recipeById(id) {
    return recipes().filter(function (r) { return r.recipe_id === id; })[0] || null;
  }

  /* ── Mike's Favorites (curated, shipped to EVERYONE) ──────────────────
     Distinct from personal ❤ favorites (per-device, mc-cookbook:favorites).
     The published list ships in recipes-data.js (window.MIKES_FAVORITES) and
     is identical for every visitor. Owner mode lets Mike edit a LOCAL DRAFT
     that overlays the published list on his own device; "Copy list" emits the
     array to paste back into the data file — that commit is the publish step. */
  var MIKE_DRAFT_KEY = "mc-cookbook:mikesFavorites:draft";
  function publishedMikes() { return (window.MIKES_FAVORITES || []).slice(); }
  function loadMikeDraft() {
    try {
      var raw = localStorage.getItem(MIKE_DRAFT_KEY);
      if (raw == null) return null;            // no draft → display the published list
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : null;
    } catch (e) { return null; }
  }
  function saveMikeDraft(list) {
    try { localStorage.setItem(MIKE_DRAFT_KEY, JSON.stringify(list)); } catch (e) {}
  }
  function clearMikeDraft() { try { localStorage.removeItem(MIKE_DRAFT_KEY); } catch (e) {} }
  // The list to DISPLAY: an owner's in-progress draft overlays the published one.
  function mikesList() {
    var d = loadMikeDraft();
    return d != null ? d : publishedMikes();
  }
  function isMikeFav(id) { return mikesList().indexOf(id) >= 0; }
  function toggleMikeFav(id) {
    var list = mikesList().slice();
    var i = list.indexOf(id);
    if (i >= 0) list.splice(i, 1); else list.push(id);
    saveMikeDraft(list);
    return list.indexOf(id) >= 0;
  }
  // "Dirty" = the local draft differs from what currently ships in the repo.
  function mikeDraftDirty() {
    var d = loadMikeDraft();
    if (d == null) return false;
    var pub = publishedMikes();
    if (d.length !== pub.length) return true;
    for (var i = 0; i < d.length; i++) if (d[i] !== pub[i]) return true;
    return false;
  }
  // The exact JS snippet Mike pastes into recipes-data.js to publish his list.
  function mikeExportText() {
    var lines = mikesList().map(function (id) { return '  "' + id + '"'; }).join(",\n");
    return "const MIKES_FAVORITES = [\n" + lines + "\n];";
  }

  /* ── Owner mode (hidden) ──────────────────────────────────────────────
     A public site can't truly authenticate Mike, so owner mode is a quiet,
     device-local unlock: visit with ?owner=1 (or tap the "Mike's" title 5×).
     It only enables the curation UI on THIS device; visitors never see it. */
  var OWNER_KEY = "mc-cookbook:owner";
  function isOwner() {
    try { return localStorage.getItem(OWNER_KEY) === "1"; } catch (e) { return false; }
  }
  function setOwner(on) {
    try {
      if (on) localStorage.setItem(OWNER_KEY, "1");
      else localStorage.removeItem(OWNER_KEY);
    } catch (e) {}
  }
  // Honor ?owner=1 / ?owner=0 in the URL — a shareable bookmark for Mike.
  function syncOwnerFromUrl() {
    var m = location.search.match(/[?&]owner=([01])(?:&|$)/);
    if (m) setOwner(m[1] === "1");
  }
  // Hidden unlock: 5 quick taps on the "Mike's" eyebrow toggles owner mode.
  function wireOwnerUnlock(node) {
    var taps = 0, timer = null;
    node.addEventListener("click", function () {
      taps++;
      clearTimeout(timer);
      timer = setTimeout(function () { taps = 0; }, 1200);
      if (taps >= 5) {
        taps = 0;
        var on = !isOwner();
        setOwner(on);
        window.alert(on
          ? "Owner mode on. Double-tap recipe cards to curate Mike's Favorites."
          : "Owner mode off.");
        setTab("home");
      }
    });
  }
  function mikesBadge() {
    var b = el("span", "mikes-badge", "★");
    b.setAttribute("aria-label", "Mike's pick");
    b.title = "Mike's pick";
    return b;
  }

  /* ══ WEEKLY MEAL PLANNER — data layer ═══════════════════════════════ */
  // The plan is a flat list of meal instances. Each instance is a chosen
  // recipe at a serving tier, optionally tagged with a day + meal-type slot.
  // The flat list is the default view; the day/slot tags drive the optional
  // Schedule view. The same meal set always feeds the grocery list + recipes,
  // so "structure" only changes how meals are organized, not what you buy.
  var PLAN_KEY  = "mc-cookbook:mealplan";          // { meals: [ {uid,id,serving,day,slot} ] }
  var GROC_KEY  = "mc-cookbook:mealplan:grocery";  // [ checked merge-keys ]
  var DAYS      = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  var DAY_LONG  = {
    Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday",
    Fri: "Friday", Sat: "Saturday", Sun: "Sunday"
  };
  var SLOTS     = ["Breakfast", "Lunch", "Dinner"];

  function loadPlan() {
    try {
      var p = JSON.parse(localStorage.getItem(PLAN_KEY) || "{}") || {};
      if (!Array.isArray(p.meals)) p.meals = [];
      return p;
    } catch (e) { return { meals: [] }; }
  }
  function savePlan(p) {
    try { localStorage.setItem(PLAN_KEY, JSON.stringify(p)); } catch (e) {}
  }
  function newUid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }
  function addMeal(id, opts) {
    opts = opts || {};
    var p = loadPlan();
    p.meals.push({
      uid: newUid(), id: id,
      serving: opts.serving || 2,
      day: opts.day || null,
      slot: opts.slot || null
    });
    savePlan(p);
  }
  function updateMeal(uid, patch) {
    var p = loadPlan();
    p.meals.forEach(function (m) { if (m.uid === uid) { for (var k in patch) m[k] = patch[k]; } });
    savePlan(p);
  }
  function removeMeal(uid) {
    var p = loadPlan();
    p.meals = p.meals.filter(function (m) { return m.uid !== uid; });
    savePlan(p);
  }
  function clearPlan() { savePlan({ meals: [] }); }
  function planMeals() { return loadPlan().meals; }
  function planRecipeIds() {                          // unique recipe ids, first-seen order
    var seen = {}, out = [];
    planMeals().forEach(function (m) { if (!seen[m.id]) { seen[m.id] = 1; out.push(m.id); } });
    return out;
  }

  /* ── Grocery check-off store ──────────────────────────────────────── */
  function loadGroc() {
    try { return new Set(JSON.parse(localStorage.getItem(GROC_KEY) || "[]")); }
    catch (e) { return new Set(); }
  }
  function saveGroc(set) {
    try { localStorage.setItem(GROC_KEY, JSON.stringify(Array.from(set))); } catch (e) {}
  }

  /* ── Cook log (read-only here; written on the recipe detail page) ──────
     Drives "made recently" awareness in the planner picker. Entries may be
     bare ISO strings (legacy) or { at, photo } objects. */
  var COOKED_KEY = "mc-cookbook:cooked";
  function loadCookedMap() {
    try { var o = JSON.parse(localStorage.getItem(COOKED_KEY) || "{}"); return (o && typeof o === "object" && !Array.isArray(o)) ? o : {}; }
    catch (e) { return {}; }
  }
  function lastCookedAt(id) {
    var list = loadCookedMap()[id];
    if (!Array.isArray(list) || !list.length) return null;
    var best = null;
    list.forEach(function (e) {
      var t = Date.parse((typeof e === "string" ? e : (e && e.at)) || "");
      if (!isNaN(t) && (best == null || t > best)) best = t;
    });
    return best;
  }
  function daysSinceCooked(id) {
    var t = lastCookedAt(id);
    return t == null ? null : Math.floor((Date.now() - t) / 86400000);
  }

  /* ── Pantry staples (items you always have → off the buy list) ─────────
     mc-cookbook:pantry → array of normalized item names. Keyed by item name
     (not category) so "salt" is a staple everywhere. Part of the mc-cookbook:
     namespace, so it rides along in Home's backup export/import. */
  var PANTRY_KEY = "mc-cookbook:pantry";
  function loadPantry() {
    try { return new Set(JSON.parse(localStorage.getItem(PANTRY_KEY) || "[]")); }
    catch (e) { return new Set(); }
  }
  function savePantry(set) {
    try { localStorage.setItem(PANTRY_KEY, JSON.stringify(Array.from(set))); } catch (e) {}
  }
  function pantryKey(item) { return (item || "").trim().toLowerCase(); }
  function togglePantry(item) {
    var set = loadPantry(), k = pantryKey(item);
    if (set.has(k)) set.delete(k); else set.add(k);
    savePantry(set);
    return set.has(k);
  }

  /* ── Quantity math (parse → sum → pretty) for the merged grocery list ─ */
  // Parses integers, decimals, and simple/mixed fractions ("1", "0.75",
  // "1/2", "1 1/2"). Non-numeric amounts ("to taste") return null and are
  // listed as-is rather than summed.
  function parseQty(qty) {
    if (qty == null) return null;
    var s = String(qty).trim();
    var m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);                 // mixed: "1 1/2"
    if (m) return parseInt(m[1], 10) + parseInt(m[2], 10) / parseInt(m[3], 10);
    if ((m = s.match(/^(\d+)\/(\d+)$/))) return parseInt(m[1], 10) / parseInt(m[2], 10);
    if (/^-?\d*\.?\d+$/.test(s)) return parseFloat(s);
    return null;
  }
  function prettyQty(v) {
    var whole = Math.floor(v + 1e-9), frac = v - whole;
    var FRACTIONS = [[1 / 4, "1/4"], [1 / 3, "1/3"], [1 / 2, "1/2"], [2 / 3, "2/3"], [3 / 4, "3/4"]];
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

  // Unit normalization for the smart merge. We only convert within the small,
  // unambiguous families the data actually uses — volume (tsp↔tbsp↔cup) and
  // weight (oz↔lb). Anything else (counts, "small", "clove", ml, g…) is merged
  // only against the exact same unit string and never cross-summed, so the list
  // can't fabricate a wrong total from incompatible units.
  var UNIT_DEFS = {
    "tsp": { cls: "vol", f: 1 }, "teaspoon": { cls: "vol", f: 1 }, "teaspoons": { cls: "vol", f: 1 },
    "tbsp": { cls: "vol", f: 3 }, "tablespoon": { cls: "vol", f: 3 }, "tablespoons": { cls: "vol", f: 3 },
    "cup": { cls: "vol", f: 48 }, "cups": { cls: "vol", f: 48 },
    "oz": { cls: "wt", f: 1 }, "ounce": { cls: "wt", f: 1 }, "ounces": { cls: "wt", f: 1 },
    "lb": { cls: "wt", f: 16 }, "lbs": { cls: "wt", f: 16 }, "pound": { cls: "wt", f: 16 }, "pounds": { cls: "wt", f: 16 }
  };
  // Display ladders (largest unit first) with a plural label and the smallest
  // value at which we'll use that unit. Volume keeps natural cup-fractions
  // (down to ¼ cup); weight only promotes to lb at a whole pound, since cooks
  // read "4 oz" not "¼ lb". The last (smallest) unit is always the fallback.
  var UNIT_DISPLAY = {
    vol: [{ u: "cup", p: "cups", f: 48, min: 0.25 }, { u: "tbsp", p: "tbsp", f: 3, min: 1 }, { u: "tsp", p: "tsp", f: 1, min: 0 }],
    wt:  [{ u: "lb", p: "lb", f: 16, min: 1 }, { u: "oz", p: "oz", f: 1, min: 0 }]
  };
  function unitInfo(unit) {
    return UNIT_DEFS[(unit || "").trim().toLowerCase()] || null;
  }
  // A value reads cleanly if it's whole or a common kitchen fraction.
  function isCleanAmount(v) {
    var f = v - Math.floor(v + 1e-9);
    if (f < 0.06 || f > 0.94) return true;
    var T = [0.25, 1 / 3, 0.5, 2 / 3, 0.75];
    for (var i = 0; i < T.length; i++) if (Math.abs(f - T[i]) < 0.06) return true;
    return false;
  }
  // Render a convertible bucket's summed base amount in the nicest unit: the
  // largest unit whose value clears its threshold and reads as a clean amount.
  function prettyMeasure(base, cls) {
    var ladder = UNIT_DISPLAY[cls];
    for (var i = 0; i < ladder.length; i++) {
      var v = base / ladder[i].f;
      if (i === ladder.length - 1 || (v >= ladder[i].min - 1e-9 && isCleanAmount(v))) {
        return prettyQty(v) + " " + (v > 1 + 1e-9 ? ladder[i].p : ladder[i].u);
      }
    }
  }

  // Build the combined shopping list across every planned meal. Quantities for
  // the SAME item are merged into per-item buckets: amounts in a compatible
  // unit family are converted to a common base and summed; incompatible units
  // (e.g. "2 small" vs "4 oz") stay as separate sub-amounts on one line rather
  // than being force-summed into a wrong total. Returns categories in aisle
  // order, each holding one row per item keyed for check-off.
  var GROC_CAT_ORDER = ["Meat", "Dairy", "Produce", "Pantry"];
  function buildGrocery() {
    var items = {}, order = [];
    planMeals().forEach(function (meal) {
      var r = recipeById(meal.id);
      if (!r) return;
      var list = (r.ingredients_by_serving && r.ingredients_by_serving["serving_" + meal.serving]) || [];
      list.forEach(function (ing) {
        var item = (ing.item || "").trim();
        if (!item) return;
        var unit = (ing.unit || "").trim();
        var cat  = ing.category || "Other";
        var ikey = cat + "|" + item.toLowerCase();
        var it = items[ikey];
        if (!it) { it = items[ikey] = { key: ikey, item: item, category: cat, buckets: {}, bucketOrder: [], texts: [] }; order.push(ikey); }

        var info = unitInfo(unit);
        var num  = parseQty(ing.quantity);
        var bkey = info ? ("cls:" + info.cls) : ("u:" + unit.toLowerCase());
        var bk = it.buckets[bkey];
        if (!bk) {
          bk = it.buckets[bkey] = info
            ? { kind: "conv", cls: info.cls, base: 0, hasNum: false }
            : { kind: "raw", unit: unit, sum: 0, hasNum: false };
          it.bucketOrder.push(bkey);
        }
        if (num != null) {
          if (info) bk.base += num * info.f; else bk.sum += num;
          bk.hasNum = true;
        } else if (ing.quantity != null && String(ing.quantity).trim()) {
          it.texts.push(String(ing.quantity).trim() + (unit ? " " + unit : ""));
        }
      });
    });

    // Group items into categories (aisle order first, then any extras seen).
    var groups = {};
    order.forEach(function (ikey) {
      var it = items[ikey];
      (groups[it.category] = groups[it.category] || []).push(it);
    });
    var cats = GROC_CAT_ORDER.filter(function (c) { return groups[c]; })
      .concat(Object.keys(groups).filter(function (c) { return GROC_CAT_ORDER.indexOf(c) < 0; }));

    return cats.map(function (cat) {
      return {
        category: cat,
        rows: groups[cat].map(function (it) {
          var parts = [];
          it.bucketOrder.forEach(function (bkey) {
            var bk = it.buckets[bkey];
            if (bk.kind === "conv") {
              if (bk.hasNum && bk.base > 0) parts.push(prettyMeasure(bk.base, bk.cls));
            } else if (bk.hasNum && bk.sum > 0) {
              parts.push(prettyQty(bk.sum) + (bk.unit ? " " + bk.unit : ""));
            }
          });
          if (it.texts.length) {
            var uniq = it.texts.filter(function (t, i) { return it.texts.indexOf(t) === i; });
            parts.push(uniq.join(", "));
          }
          return { key: it.key, item: it.item, qty: parts.join(" · ") };
        })
      };
    });
  }
  function groceryItemCount() {
    var pantry = loadPantry();   // count only what you'd actually buy
    return buildGrocery().reduce(function (n, c) {
      return n + c.rows.filter(function (row) { return !pantry.has(pantryKey(row.item)); }).length;
    }, 0);
  }

  /* ── Dish-type categories ─────────────────────────────────────────── */
  // Each recipe declares exactly one `dish_category`, so a recipe always has a
  // single home. Per-category icon/accent/blurb drive the Categories cards.
  var CATEGORY_ORDER = [
    "Breakfast",
    "Salads & Slaws",
    "Soups, Stews & Chilis",
    "Casseroles & Bakes",
    "Skillets & Stir-Fries",
    "Grilled & Sheet-Pan",
    "Sandwiches"
  ];
  var CATEGORY_META = {
    "Breakfast":             { icon: "🍳", accent: "#E0A458", blurb: "Eggs, hashes, and morning plates to start the day strong." },
    "Salads & Slaws":        { icon: "🥗", accent: "#7D8C77", blurb: "Crisp, bright bowls and big-ass salads." },
    "Soups, Stews & Chilis": { icon: "🥣", accent: "#C0633F", blurb: "Low-and-slow pots, broths, and bowls of comfort." },
    "Casseroles & Bakes":    { icon: "🧀", accent: "#C87A53", blurb: "Bubbling, golden, oven-baked one-dish dinners." },
    "Skillets & Stir-Fries": { icon: "🥘", accent: "#B5894E", blurb: "Fast, high-heat one-pan meals." },
    "Grilled & Sheet-Pan":   { icon: "🔥", accent: "#A65A3A", blurb: "Char, smoke, and hands-off sheet-pan roasts." },
    "Sandwiches":            { icon: "🥪", accent: "#B98A4B", blurb: "Stacked, handheld, low-carb-friendly bites." }
  };
  function presentCategories() {
    return CATEGORY_ORDER.filter(function (c) {
      return recipes().some(function (r) { return r.dish_category === c; });
    });
  }
  function recipesInCategory(cat) {
    return recipes().filter(function (r) { return r.dish_category === cat; });
  }

  /* ── Shared: a recipe card (used by Categories / Recipes / Favorites) ── */
  function recipeCard(r, opts) {
    opts = opts || {};
    var accent = r.accent || "#C87A53";
    var card = el("a", "rc");
    card.href = "recipe.html?id=" + encodeURIComponent(r.recipe_id);
    card.style.setProperty("--rc-accent", accent);
    card.style.setProperty("--rc-accent-rgb", rgbFromHex(accent));

    // macro_profiles are stored as TOTALS for the tier; show per-serving macros
    // on the card (tier total ÷ tier serving count = one individual serving).
    var tier = (opts.serving || (r.scaling_options && r.scaling_options[0]) || 2);
    var m = (r.macro_profiles && r.macro_profiles["serving_" + tier]) || {};
    var totalTime = (r.prep_time_mins || 0) + (r.cook_time_mins || 0);

    var meta = [];
    if (r.dish_category) meta.push(esc(r.dish_category));
    if (totalTime) meta.push(totalTime + " min");
    var macro = [];
    if (m.calories != null) macro.push(Math.round(m.calories / tier) + " cal");
    if (m.protein_g != null) macro.push(Math.round(m.protein_g / tier) + "g protein");

    card.innerHTML =
      '<div class="rc-band"><span class="rc-icon">' + esc(r.icon || "🍽️") + "</span></div>" +
      '<div class="rc-body">' +
        '<h3 class="rc-title">' + esc(r.title) + "</h3>" +
        '<p class="rc-meta">' + meta.join(" · ") + "</p>" +
        (macro.length ? '<p class="rc-macro">' + macro.join(" · ") + "</p>" : "") +
      "</div>";

    // A heart in the card's upper-right corner — favorite straight from the
    // grid. Filled when saved, outline when not; tapping flips it in place. On
    // the Favorites screen, un-saving also drops the card out of the list.
    var saved = loadFavs().has(r.recipe_id);
    var heart = el("button", "fav-toggle" + (saved ? " on" : ""), saved ? "❤" : "♡");
    heart.type = "button";
    heart.setAttribute("aria-label", saved ? "Remove from favorites" : "Add to favorites");
    heart.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      var on = toggleFav(r.recipe_id);
      if (opts.fav) { renderFavorites(); return; }   // drop out of the favorites grid
      heart.classList.toggle("on", on);
      heart.textContent = on ? "❤" : "♡";
      heart.setAttribute("aria-label", on ? "Remove from favorites" : "Add to favorites");
      pop(heart);
    });
    card.appendChild(heart);

    // "Mike's pick" star — visible to EVERYONE on a curated recipe, so Mike's
    // taste reads across the whole app, not just inside the Mike's screen.
    if (isMikeFav(r.recipe_id)) {
      card.classList.add("mikes-pick");
      card.appendChild(mikesBadge());
    }

    // Owner-only curation: double-tap a card to add/remove it from Mike's
    // Favorites. Single tap still opens the recipe — but because the card is a
    // link, in owner mode we hold navigation ~280ms to see if a second tap
    // (the curate gesture) lands first. Visitors never enter this branch.
    if (isOwner()) {
      card.classList.add("owner-curatable");
      var tapTimer = null;
      card.addEventListener("click", function (e) {
        if (e.defaultPrevented) return;          // heart (stopPropagation) handled it
        e.preventDefault();
        if (tapTimer) {                          // second tap → curate
          clearTimeout(tapTimer); tapTimer = null;
          var on = toggleMikeFav(r.recipe_id);
          if (activeScreen() === "mikes") { renderMikes(); return; }
          card.classList.toggle("mikes-pick", on);
          var b = card.querySelector(".mikes-badge");
          if (on && !b) card.appendChild(mikesBadge());
          else if (!on && b) card.removeChild(b);
          pop(card);
        } else {                                 // first tap → maybe a single tap
          tapTimer = setTimeout(function () {
            tapTimer = null;
            window.location.href = card.href;    // confirmed single tap → navigate
          }, 280);
        }
      });
    }
    return card;
  }

  /* ══ HOME screen — the hub ══════════════════════════════════════════ */
  // Each module is a premium glass card (gradient + accent border + soft
  // glow), echoing the "Now Cooking" hero. A per-module accent (--hm) drives
  // the gradient, border, glow, and icon so the three read as a tactile set.
  function homeModule(opts) {
    var accent = opts.accent || "#C87A53";
    var b = el("button", "home-mod");
    b.type = "button";
    b.setAttribute("aria-label", opts.title);
    b.style.setProperty("--hm", accent);
    b.style.setProperty("--hm-rgb", rgbFromHex(accent));
    b.innerHTML =
      '<span class="home-mod-glow"></span>' +
      '<span class="home-mod-icon">' + esc(opts.icon) + "</span>" +
      '<span class="home-mod-text">' +
        '<span class="home-mod-title">' + esc(opts.title) + "</span>" +
        '<span class="home-mod-sub">' + esc(opts.sub) + "</span>" +
      "</span>" +
      '<span class="home-mod-arrow">→</span>';
    b.addEventListener("click", opts.onTap);
    return b;
  }

  /* ══ BACKUP & RESTORE — export/import the whole mc-cookbook: namespace ═
     The app is local-only: every byte of a cook's data (favorites, the weekly
     plan, grocery check-offs, their own recipes, per-recipe step/grocery
     check-offs) lives in localStorage under the mc-cookbook: namespace. This is
     the safety net — one tap writes it all to a portable JSON file, and a
     matching import restores it (also the stop-gap for moving a plan between
     phones until/if real sync ever lands). */
  var NS         = "mc-cookbook:";
  var BACKUP_KEY = "mc-cookbook:lastBackupAt";
  var BACKUP_FMT = 1;                         // backup-file schema version
  var backupBannerDismissed = false;          // per-session dismissal

  function namespacedKeys() {
    var out = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf(NS) === 0) out.push(k);
    }
    return out;
  }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function todayStamp() {
    var d = new Date();
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function exportData() {
    var data = {};
    namespacedKeys().forEach(function (k) { data[k] = localStorage.getItem(k); });
    var payload = {
      app: "mikes-cookbook", version: BACKUP_FMT,
      exportedAt: new Date().toISOString(), data: data
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url  = URL.createObjectURL(blob);
    var a = el("a");
    a.href = url;
    a.download = "mikes-cookbook-backup-" + todayStamp() + ".json";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      if (a.parentNode) a.parentNode.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    try { localStorage.setItem(BACKUP_KEY, new Date().toISOString()); } catch (e) {}
  }

  // Validate → confirm → clean-restore, reporting via done(ok, message). A
  // malformed or wrong-version file is rejected BEFORE anything is written, so
  // a bad import can never corrupt the data already on the device.
  function importData(file, done) {
    var reader = new FileReader();
    reader.onerror = function () { done(false, "Couldn't read that file."); };
    reader.onload = function () {
      var parsed;
      try { parsed = JSON.parse(reader.result); }
      catch (e) { done(false, "That file isn't valid JSON."); return; }
      var data = parsed && parsed.data;
      if (!parsed || parsed.version !== BACKUP_FMT ||
          typeof data !== "object" || data === null || Array.isArray(data)) {
        done(false, "This doesn't look like a Mike's Cookbook backup file.");
        return;
      }
      if (!window.confirm("This replaces your current saved data with the backup. Continue?")) {
        done(false, null);                    // cancelled — no-op, not an error
        return;
      }
      try {
        namespacedKeys().forEach(function (k) { localStorage.removeItem(k); });
        Object.keys(data).forEach(function (k) {
          if (k.indexOf(NS) === 0 && data[k] != null) localStorage.setItem(k, String(data[k]));
        });
        done(true, null);
      } catch (e) {
        done(false, "Couldn't restore — your device storage may be full.");
      }
    };
    reader.readAsText(file);
  }

  function relativeDays(iso) {
    var then = Date.parse(iso || "");
    if (isNaN(then)) return null;
    var days = Math.floor((Date.now() - then) / 86400000);
    if (days <= 0) return "today";
    if (days === 1) return "yesterday";
    return days + " days ago";
  }
  function hasCookData() {
    return planMeals().length > 0 || loadFavs().size > 0 ||
           ((window.MCUser && window.MCUser.count()) || 0) > 0;
  }
  function backupIsStale() {
    var iso;
    try { iso = localStorage.getItem(BACKUP_KEY); } catch (e) { iso = null; }
    var then = Date.parse(iso || "");
    if (isNaN(then)) return true;             // never backed up (or unreadable)
    return (Date.now() - then) >= 14 * 86400000;
  }

  // Dismissible inline nudge: only when a backup is stale AND there's data worth
  // protecting. Dismiss hides it for the session; an export clears it for good.
  function backupBanner() {
    var b = el("div", "backup-banner");
    b.innerHTML =
      '<span class="backup-banner-icon">🛟</span>' +
      '<span class="backup-banner-text">Back up your cookbook so a cleared ' +
        "browser can&rsquo;t wipe your plan &amp; favorites.</span>";
    var cta = el("button", "backup-banner-cta", "Back up →");
    cta.type = "button";
    cta.addEventListener("click", function () {
      var sec = $("#home-backup");
      if (sec) sec.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    var x = el("button", "backup-banner-dismiss", "✕");
    x.type = "button";
    x.setAttribute("aria-label", "Dismiss backup reminder");
    x.addEventListener("click", function () {
      backupBannerDismissed = true;
      if (b.parentNode) b.parentNode.removeChild(b);
    });
    b.appendChild(cta);
    b.appendChild(x);
    return b;
  }

  function renderBackupSection() {
    var wrap = el("div", "home-backup");
    wrap.id = "home-backup";
    wrap.appendChild(el("div", "tier-label", "Backup &amp; Restore"));

    var card = el("div", "card backup-card");
    card.appendChild(el("p", "card-label", "Your cookbook lives on this device"));
    card.appendChild(el("p", "backup-copy",
      "Export a backup file to keep your favorites, weekly plan, grocery " +
      "check-offs, cook log and your own recipes safe — or to move them to " +
      "another phone. Cook-log photos are included, so a backup with photos " +
      "can be several MB. Importing replaces what&rsquo;s on this device."));

    var iso;
    try { iso = localStorage.getItem(BACKUP_KEY); } catch (e) { iso = null; }
    var rel = relativeDays(iso);
    var lastEl = el("p", "backup-last", rel ? "Last backup: " + esc(rel) : "No backup yet.");
    card.appendChild(lastEl);

    var actions = el("div", "backup-actions");
    var exportBtn = el("button", "backup-btn backup-export", "⬇&nbsp; Export backup");
    exportBtn.type = "button";
    var importBtn = el("button", "backup-btn backup-import", "⬆&nbsp; Import backup");
    importBtn.type = "button";
    var fileInput = el("input", "backup-file");
    fileInput.type = "file";
    fileInput.accept = "application/json";
    fileInput.hidden = true;

    var status = el("p", "backup-status", "");

    exportBtn.addEventListener("click", function () {
      exportData();
      lastEl.textContent = "Last backup: today";
      var banner = $(".backup-banner");
      if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
      status.className = "backup-status ok";
      status.textContent = "Backup file downloaded ✓";
    });
    importBtn.addEventListener("click", function () { fileInput.click(); });
    fileInput.addEventListener("change", function () {
      var file = fileInput.files && fileInput.files[0];
      fileInput.value = "";                   // allow re-importing the same file
      if (!file) return;
      importData(file, function (ok, msg) {
        if (ok) {
          status.className = "backup-status ok";
          status.textContent = "Restored ✓ Reloading…";
          // Reload so restored favorites, plan AND user recipes (merged at load)
          // all reflect the imported data immediately.
          setTimeout(function () { window.location.reload(); }, 700);
        } else if (msg) {
          status.className = "backup-status err";
          status.textContent = msg;
        }
      });
    });

    actions.appendChild(exportBtn);
    actions.appendChild(importBtn);
    card.appendChild(actions);
    card.appendChild(fileInput);
    card.appendChild(status);
    wrap.appendChild(card);
    return wrap;
  }

  function renderHome() {
    var s = $("#screen-home");
    s.innerHTML = "";

    var bar = topBar("Mike's", "Cookbook",
      "Heirloom hand-me-downs & performance plates.");
    bar.appendChild(el("p", "home-premise",
      "Whole-food, low-carb cooking — built around a two-meals-a-day rhythm."));
    // Hidden owner unlock lives on the "Mike's" eyebrow (5 quick taps).
    var eyebrow = $(".shell-eyebrow", bar);
    if (eyebrow) wireOwnerUnlock(eyebrow);
    s.appendChild(bar);

    // Safety-net nudge: stale backup + data worth protecting.
    if (!backupBannerDismissed && backupIsStale() && hasCookData()) {
      s.appendChild(backupBanner());
    }

    // Hero — the weekly meal planner entry (replaces the old "Now Cooking"
    // collection spotlight). Reflects the live plan and opens the planner spoke.
    var mealCount   = planMeals().length;
    var recipeCount = planRecipeIds().length;
    var planned     = mealCount > 0;

    var hero = el("div", "home-hero");
    var hc = el("div", "home-hero-card planner-hero");
    hc.innerHTML =
      '<p class="home-hero-eyebrow">This Week</p>' +
      '<h2 class="home-hero-title">' +
        (planned ? mealCount + (mealCount === 1 ? " meal planned" : " meals planned")
                 : "Plan your week") + "</h2>" +
      '<p class="home-hero-text">' +
        (planned
          ? esc(recipeCount + (recipeCount === 1 ? " recipe" : " recipes") +
                " · tap to see your combined grocery list and cook the week.")
          : "Pick meals for the week and get one smart grocery list — with every recipe in the module.") +
      "</p>";
    var cta = el("a", "home-cta", planned ? "Open planner →" : "Start planning →");
    cta.href = "#planner";
    cta.addEventListener("click", function (e) { e.preventDefault(); setTab("planner"); });
    hc.appendChild(cta);
    hero.appendChild(hc);
    s.appendChild(hero);

    // Browse modules — two labeled sections keep the Home screen scannable.
    var browse = el("div", "home-browse");

    // — Explore section: browse the full recipe library —
    browse.appendChild(el("div", "tier-label", "Explore"));
    browse.appendChild(homeModule({
      icon: "🍽️", title: "Categories", accent: "#C87A53",
      sub: presentCategories().length + " dish types",
      onTap: function () { setTab("categories"); }
    }));
    browse.appendChild(homeModule({
      icon: "📖", title: "Recipes", accent: "#D9A05B",
      sub: collections().length + " collections · " + recipes().length + " recipes",
      onTap: function () { setTab("recipes"); }
    }));

    // — Your Library section: personal saves + custom recipes —
    browse.appendChild(el("div", "tier-label", "Your Library"));
    var mikeCount = mikesList().length;
    browse.appendChild(homeModule({
      icon: "⭐", title: "Mike's Favorites", accent: "#E0A458",
      sub: mikeCount
        ? mikeCount + (mikeCount === 1 ? " recipe Mike loves" : " recipes Mike loves")
        : "Recipes Mike has made and loved",
      onTap: function () { setTab("mikes"); }
    }));
    var favCount = loadFavs().size;
    browse.appendChild(homeModule({
      icon: "❤", title: "Favorites", accent: "#FF5A6E",
      sub: favCount ? favCount + (favCount === 1 ? " saved recipe" : " saved recipes")
                    : "Tap the heart on any recipe to save it",
      onTap: function () { setTab("favorites"); }
    }));
    var userCount = (window.MCUser && window.MCUser.count()) || 0;
    browse.appendChild(homeModule({
      icon: "📝", title: "Add Recipe", accent: "#7D8C77",
      sub: userCount
        ? "Your library · " + userCount + (userCount === 1 ? " recipe" : " recipes")
        : "Create your own or add to your library",
      onTap: function () { openRecipeForm(); }
    }));

    // — Help section —
    browse.appendChild(el("div", "tier-label", "Help"));
    browse.appendChild(homeModule({
      icon: "🎬", title: "Quick Tour", accent: "#C87A53",
      sub: "3-min guided walkthrough of the app",
      onTap: function () { location.href = "quick-tour.html"; }
    }));
    s.appendChild(browse);

    s.appendChild(renderBackupSection());
  }

  /* ── Shared spoke top bar with a "‹ <label>" anchor ───────────────── */
  function backTopBar(backLabel, title, sub, onBack) {
    var t = el("div", "shell-top");
    var back = el("button", "col-back", backLabel);
    back.type = "button";
    back.addEventListener("click", onBack);
    t.appendChild(back);
    t.appendChild(el("h1", "shell-title", esc(title)));
    if (sub) t.appendChild(el("p", "shell-sub", esc(sub)));
    return t;
  }

  /* ══ MACRO TRACKER screen — mounts the standalone tracker (tracker.js) ══ */
  // The tracker owns its own calendar / summary / hourly-timeline UI; the shell
  // just provides the "‹ Home" frame and a mount point so back-nav is uniform.
  function renderTracker() {
    var s = $("#screen-tracker");
    if (!s) return;
    s.innerHTML = "";
    s.appendChild(backTopBar("‹ Home", "Macro Tracker", "Track your day, by the hour",
      function () { setTab("home"); }));
    var body = el("div", "tracker-body");
    s.appendChild(body);
    if (window.MCTracker && MCTracker.mount) MCTracker.mount(body);
    else body.appendChild(el("p", "shell-sub", "Tracker is loading — reopen in a moment."));
  }

  /* ══ CATEGORIES screen — the 7 dish types, then a per-category grid ══ */
  // Default view: one premium card per category (reuses the .cat-card look).
  // Tapping a card drills into that category's recipe grid.
  var catState = { open: null };

  function categoryCard(cat) {
    var meta = CATEGORY_META[cat] || {};
    var accent = meta.accent || "#C87A53";
    var n = recipesInCategory(cat).length;

    var card = el("a", "cat-card");
    card.href = "#categories";
    card.style.setProperty("--cc", accent);
    card.style.setProperty("--cc-rgb", rgbFromHex(accent));
    card.innerHTML =
      '<span class="cc-glow"></span>' +
      '<span class="cc-sheen"></span>' +
      '<span class="cat-icon">' + esc(meta.icon || "🍽️") + "</span>" +
      '<div class="cat-tag">Category</div>' +
      '<div class="cat-name">' + esc(cat) + "</div>" +
      '<div class="cat-meta">' + esc(meta.blurb || "") + "</div>" +
      '<div class="cat-count">' + n + (n === 1 ? " Recipe →" : " Recipes →") + "</div>";
    card.addEventListener("click", function (e) {
      e.preventDefault();
      catState.open = cat;
      renderCategories();
      window.scrollTo(0, 0);
    });
    return card;
  }

  function renderCategories() {
    var s = $("#screen-categories");
    s.innerHTML = "";

    if (catState.open) { renderCategoryDetail(s, catState.open); return; }

    s.appendChild(backTopBar("‹ Home", "Categories", "Browse by dish type",
      function () { setTab("home"); }));
    var wrap = el("div", "cards-wrap");
    presentCategories().forEach(function (cat) { wrap.appendChild(categoryCard(cat)); });
    s.appendChild(wrap);
  }

  function renderCategoryDetail(s, cat) {
    var list = recipesInCategory(cat);
    s.appendChild(backTopBar("‹ Categories", cat,
      list.length + (list.length === 1 ? " recipe" : " recipes"),
      function () { catState.open = null; renderCategories(); window.scrollTo(0, 0); }));

    if (!list.length) {
      s.appendChild(el("div", "empty",
        '<span class="empty-emoji">🍽️</span>No recipes in this category yet.'));
      return;
    }
    var grid = el("div", "col-grid");
    list.forEach(function (r) { grid.appendChild(recipeCard(r)); });
    s.appendChild(grid);
  }

  /* ══ RECIPES screen — collection cards + app-wide search ════════════ */
  // Default view = flagship collection cards. Once a search query is active,
  // the screen switches to a flat grid of matching recipe cards drawn from ALL
  // recipes. Dish-type browsing lives on the Categories spoke.
  function recipesMatch(r, q) {
    if (!q) return true;
    q = q.toLowerCase();
    if ((r.title || "").toLowerCase().indexOf(q) >= 0) return true;
    if ((r.dish_category || "").toLowerCase().indexOf(q) >= 0) return true;
    if ((r.category || "").toLowerCase().indexOf(q) >= 0) return true;
    if ((r.tags || []).join(" ").toLowerCase().indexOf(q) >= 0) return true;
    var ing = r.ingredients_by_serving &&
      r.ingredients_by_serving["serving_" + (r.native_serving || 2)];
    if (ing && ing.some(function (i) { return (i.item || "").toLowerCase().indexOf(q) >= 0; })) return true;
    return false;
  }

  function renderRecipes() {
    var s = $("#screen-recipes");
    s.innerHTML = "";
    s.appendChild(backTopBar("‹ Home", "Recipes",
      collections().length + " collections · " + recipes().length + " recipes",
      function () { setTab("home"); }));

    // Search box
    var searchWrap = el("div", "search-wrap");
    var box = el("input", "search-box");
    box.type = "search";
    box.placeholder = "Search all recipes…";
    box.setAttribute("aria-label", "Search all recipes");
    searchWrap.appendChild(box);
    s.appendChild(searchWrap);

    var results = el("div", "browse-results");
    s.appendChild(results);

    function paint() {
      var q = box.value.trim();
      results.innerHTML = "";

      if (!q) {                                       // default: collection cards
        var wrap = el("div", "cards-wrap");
        wrap.appendChild(el("div", "tier-label", "★ Collections"));
        collections().forEach(function (c) { wrap.appendChild(collectionCard(c)); });
        results.appendChild(wrap);
        return;
      }

      var list = recipes().filter(function (r) { return recipesMatch(r, q); });
      if (!list.length) {
        results.appendChild(el("div", "empty",
          '<span class="empty-emoji">🔍</span>No recipes match your search.'));
        return;
      }
      results.appendChild(el("div", "browse-count",
        list.length + (list.length === 1 ? " recipe" : " recipes")));
      var grid = el("div", "col-grid");
      list.forEach(function (r) { grid.appendChild(recipeCard(r)); });
      results.appendChild(grid);
    }

    box.addEventListener("input", paint);
    paint();
  }

  function collectionCard(c) {
    var soon = c.status !== "live";
    var card = el("a", "cat-card" + (soon ? " soon" : ""));
    card.href = "collection.html?c=" + encodeURIComponent(c.id);
    card.style.setProperty("--cc", c.accent);
    card.style.setProperty("--cc-rgb", rgbFromHex(c.accent));

    var count = soon ? "Coming Soon →" : (recipesIn(c).length + " Recipes →");

    card.innerHTML =
      '<span class="cc-glow"></span>' +
      '<span class="cc-sheen"></span>' +
      (soon ? '<span class="soon-badge">Soon</span>' : "") +
      '<span class="cat-icon">' + esc(c.icon || "🍽️") + "</span>" +
      '<div class="cat-tag">' + esc(c.tag) + "</div>" +
      '<div class="cat-name">' + esc(c.title) + "</div>" +
      '<div class="cat-meta">' + esc(c.blurb) + "</div>" +
      '<div class="cat-count">' + count + "</div>" +
      '<div class="cat-designer">' + esc(c.designer || "") + "</div>";
    return card;
  }

  /* ══ FAVORITES screen ═══════════════════════════════════════════════ */
  function renderFavorites() {
    var s = $("#screen-favorites");
    s.innerHTML = "";

    var favs = loadFavs();
    var list = recipes().filter(function (r) { return favs.has(r.recipe_id); });

    s.appendChild(backTopBar("‹ Home", "Favorites",
      (list.length || "No") + (list.length === 1 ? " saved recipe" : " saved recipes"),
      function () { setTab("home"); }));

    if (!list.length) {
      s.appendChild(el("div", "empty",
        '<span class="empty-emoji">❤️</span>' +
        "No favorites yet.<br>Tap the heart on any recipe to save it here."));
      return;
    }
    var grid = el("div", "col-grid");
    list.forEach(function (r) { grid.appendChild(recipeCard(r, { fav: true })); });
    s.appendChild(grid);
  }

  /* ══ MIKE'S FAVORITES screen ════════════════════════════════════════
     The curated, shipped-to-everyone shortlist. Read-only for visitors; in
     owner mode it grows an owner toolbar (curation help + publish/discard). */
  function ownerToolbar() {
    var wrap = el("div", "owner-bar");

    var head = el("div", "owner-bar-head");
    head.appendChild(el("span", "owner-bar-tag", "🔑 Owner mode"));
    var exit = el("button", "owner-bar-exit", "Exit");
    exit.type = "button";
    exit.setAttribute("aria-label", "Exit owner mode");
    exit.addEventListener("click", function () { setOwner(false); setTab("mikes"); });
    head.appendChild(exit);
    wrap.appendChild(head);

    wrap.appendChild(el("p", "owner-bar-help",
      "Double-tap any recipe card to add or remove it. A single tap still opens the recipe."));

    // One-tap migrate: pull the personal ❤ favorites stored on THIS device into
    // the Mike's list (union, keeping current order). This is how "the recipes I
    // already love" move over — the import runs locally where the hearts live,
    // then Copy-list publishes them. Non-destructive: personal hearts are kept.
    var myFavs = loadFavs();
    if (myFavs.size) {
      var imp = el("button", "owner-btn owner-import",
        "＋ Add my ❤ favorites (" + myFavs.size + ")");
      imp.type = "button";
      imp.addEventListener("click", function () {
        var list = mikesList().slice(), added = 0;
        myFavs.forEach(function (id) {
          if (recipeById(id) && list.indexOf(id) < 0) { list.push(id); added++; }
        });
        saveMikeDraft(list);
        renderMikes();
        if (!added) window.alert("Your ❤ favorites are already in Mike's Favorites.");
      });
      wrap.appendChild(imp);
    }

    if (!mikeDraftDirty()) return wrap;

    // Unpublished changes → offer Copy-list (publish) and Discard.
    var pub = el("div", "owner-publish");
    pub.appendChild(el("p", "owner-publish-msg",
      "You have unpublished changes. Copy your list and commit it to recipes-data.js " +
      "to publish it to everyone."));

    var status = el("p", "owner-publish-status", "");
    var ta = null;                              // lazily-shown copy-by-hand fallback
    function showFallback(text) {
      if (ta) { ta.focus(); ta.select(); return; }
      ta = el("textarea", "owner-export-ta");
      ta.readOnly = true; ta.rows = 6; ta.value = text;
      pub.appendChild(ta);
      ta.focus(); ta.select();
    }

    var copy = el("button", "owner-btn owner-copy", "⧉ Copy list");
    copy.type = "button";
    copy.addEventListener("click", function () {
      var text = mikeExportText();
      function ok() {
        status.className = "owner-publish-status ok";
        status.textContent = "Copied ✓ Paste it into recipes-data.js to publish.";
      }
      function fail() {
        status.className = "owner-publish-status err";
        status.textContent = "Couldn't copy automatically — select the text below:";
        showFallback(text);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(ok, fail);
      } else { fail(); }
    });

    var revert = el("button", "owner-btn owner-revert", "↩ Discard");
    revert.type = "button";
    revert.addEventListener("click", function () {
      if (window.confirm("Discard your unpublished changes and revert to the published list?")) {
        clearMikeDraft(); setTab("mikes");
      }
    });

    var actions = el("div", "owner-publish-actions");
    actions.appendChild(copy);
    actions.appendChild(revert);
    pub.appendChild(actions);
    pub.appendChild(status);
    wrap.appendChild(pub);
    return wrap;
  }

  function renderMikes() {
    var s = $("#screen-mikes");
    s.innerHTML = "";

    var list = mikesList().map(recipeById).filter(Boolean);

    s.appendChild(backTopBar("‹ Home", "Mike's Favorites",
      (list.length || "No") + (list.length === 1 ? " recipe Mike loves" : " recipes Mike loves"),
      function () { setTab("home"); }));

    s.appendChild(el("p", "mikes-intro",
      "Mike's favorites from across the whole cookbook — every collection and diet. " +
      "The recipes that actually worked, as a starting point for yours."));

    if (isOwner()) s.appendChild(ownerToolbar());

    if (!list.length) {
      s.appendChild(emptyState("⭐",
        isOwner()
          ? "No favorites yet.<br>Double-tap any recipe card to add it to your list."
          : "Mike hasn't picked any favorites yet.<br>Check back soon."));
      return;
    }
    var grid = el("div", "col-grid");
    list.forEach(function (r) { grid.appendChild(recipeCard(r, { mikes: true })); });
    s.appendChild(grid);
  }

  /* ══ THIS WEEK — the meal planner spoke ═════════════════════════════ */
  // Three sub-views (Plan / Grocery / Recipes). The Plan view itself toggles
  // between a flat List (default) and a 7-day × Breakfast/Lunch/Dinner
  // Schedule. The same meal set feeds all three views.
  var plannerState = { view: "plan", planView: "list", pantryOpen: false };
  function refresh() { renderPlanner(); }

  // Segmented control reusing the recipe page's .servings / .serving-opt look.
  function segControl(cls, items, active, onPick) {
    var wrap = el("div", "servings" + (cls ? " " + cls : ""));
    items.forEach(function (it) {
      var b = el("button", "serving-opt" + (it.value === active ? " active" : ""), esc(it.label));
      b.type = "button";
      b.addEventListener("click", function () { if (it.value !== active) onPick(it.value); });
      wrap.appendChild(b);
    });
    return wrap;
  }

  // Per-meal 2/4 serving toggle.
  function servingToggle(m) {
    var r = recipeById(m.id);
    var opts = (r && r.scaling_options) || [2, 4];
    var wrap = el("div", "plan-serv");
    opts.forEach(function (n) {
      var b = el("button", "plan-serv-opt" + (m.serving === n ? " active" : ""), String(n));
      b.type = "button";
      b.setAttribute("aria-label", n + " servings");
      b.addEventListener("click", function (e) {
        e.preventDefault(); e.stopPropagation();
        if (m.serving !== n) { updateMeal(m.uid, { serving: n }); refresh(); }
      });
      wrap.appendChild(b);
    });
    return wrap;
  }
  function removeBtn(m) {
    var b = el("button", "plan-remove", "✕");
    b.type = "button";
    b.setAttribute("aria-label", "Remove meal");
    b.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      removeMeal(m.uid); refresh();
    });
    return b;
  }

  // Full meal row (List view + Schedule "Unscheduled" tray): icon, title,
  // serving toggle, per-meal Day + Slot pickers, remove.
  function mealRow(m) {
    var r = recipeById(m.id);
    var row = el("div", "plan-meal");

    row.appendChild(el("span", "plan-meal-icon", esc(r ? (r.icon || "🍽️") : "🍽️")));

    var main = el("div", "plan-meal-main");
    var title = el("a", "plan-meal-title", esc(r ? r.title : m.id));
    if (r) title.href = "recipe.html?id=" + encodeURIComponent(r.recipe_id);
    main.appendChild(title);
    var meta = [];
    if (r && r.dish_category) meta.push(r.dish_category);
    var t = r ? (r.prep_time_mins || 0) + (r.cook_time_mins || 0) : 0;
    if (t) meta.push(t + " min");
    if (meta.length) main.appendChild(el("p", "plan-meal-meta", esc(meta.join(" · "))));
    row.appendChild(main);

    var ctrl = el("div", "plan-meal-controls");
    ctrl.appendChild(servingToggle(m));

    var pickers = el("div", "plan-pickers");
    var daySel = el("select", "plan-select");
    daySel.setAttribute("aria-label", "Day");
    daySel.innerHTML = '<option value="">Any day</option>' +
      DAYS.map(function (d) {
        return '<option value="' + d + '"' + (m.day === d ? " selected" : "") + ">" + DAY_LONG[d] + "</option>";
      }).join("");
    daySel.addEventListener("change", function () { updateMeal(m.uid, { day: daySel.value || null }); refresh(); });

    var slotSel = el("select", "plan-select");
    slotSel.setAttribute("aria-label", "Meal");
    slotSel.innerHTML = '<option value="">Any meal</option>' +
      SLOTS.map(function (sl) {
        return '<option value="' + sl + '"' + (m.slot === sl ? " selected" : "") + ">" + sl + "</option>";
      }).join("");
    slotSel.addEventListener("change", function () { updateMeal(m.uid, { slot: slotSel.value || null }); refresh(); });

    pickers.appendChild(daySel);
    pickers.appendChild(slotSel);
    ctrl.appendChild(pickers);
    ctrl.appendChild(removeBtn(m));
    row.appendChild(ctrl);
    return row;
  }

  // Compact chip for a meal placed in a Schedule slot.
  function scheduleChip(m) {
    var r = recipeById(m.id);
    var chip = el("div", "plan-chip");
    chip.appendChild(el("span", "plan-chip-icon", esc(r ? (r.icon || "🍽️") : "🍽️")));
    var t = el("a", "plan-chip-title", esc(r ? r.title : m.id));
    if (r) t.href = "recipe.html?id=" + encodeURIComponent(r.recipe_id);
    chip.appendChild(t);
    chip.appendChild(servingToggle(m));
    chip.appendChild(removeBtn(m));
    return chip;
  }

  function renderPlanList(body, meals) {
    var wrap = el("div", "plan-list");
    meals.forEach(function (m) { wrap.appendChild(mealRow(m)); });
    body.appendChild(wrap);
  }

  function renderPlanSchedule(body, meals) {
    var unsched = meals.filter(function (m) { return !m.day || !m.slot; });
    if (unsched.length) {
      var tray = el("div", "plan-tray");
      tray.appendChild(el("div", "plan-tray-label",
        "Unscheduled — set a Day &amp; Meal, or tap a slot below"));
      var list = el("div", "plan-list");
      unsched.forEach(function (m) { list.appendChild(mealRow(m)); });
      tray.appendChild(list);
      body.appendChild(tray);
    }

    DAYS.forEach(function (d) {
      var dayBlock = el("div", "plan-day");
      dayBlock.appendChild(el("div", "plan-day-head", esc(DAY_LONG[d])));
      SLOTS.forEach(function (slot) {
        var inSlot = meals.filter(function (m) { return m.day === d && m.slot === slot; });
        var slotEl = el("div", "plan-slot");
        slotEl.appendChild(el("div", "plan-slot-label", esc(slot)));
        var cell = el("div", "plan-slot-cell");
        inSlot.forEach(function (m) { cell.appendChild(scheduleChip(m)); });
        var addCell = el("button", "plan-slot-add", inSlot.length ? "＋" : "＋ Add");
        addCell.type = "button";
        addCell.setAttribute("aria-label", "Add to " + DAY_LONG[d] + " " + slot);
        addCell.addEventListener("click", function () { openPicker({ day: d, slot: slot }); });
        cell.appendChild(addCell);
        slotEl.appendChild(cell);
        dayBlock.appendChild(slotEl);
      });
      body.appendChild(dayBlock);
    });
  }

  function renderPlanPane(body) {
    body.appendChild(segControl("plan-modetoggle", [
      { value: "list", label: "List" },
      { value: "schedule", label: "Schedule" }
    ], plannerState.planView, function (v) { plannerState.planView = v; refresh(); }));

    var meals = planMeals();
    if (!meals.length) {
      body.appendChild(emptyState("🗓️",
        "No meals planned yet.<br>Tap <b>Add a meal</b> to start building your week."));
    } else if (plannerState.planView === "list") {
      renderPlanList(body, meals);
    } else {
      renderPlanSchedule(body, meals);
    }

    // The payoff of planning: a live count + one-tap jump straight to the
    // merged grocery list, so the list isn't a tab the cook has to discover.
    if (meals.length) {
      var gcount = groceryItemCount();
      var payoff = el("button", "plan-payoff");
      payoff.type = "button";
      payoff.innerHTML =
        '<span class="plan-payoff-info">' +
          '<span class="plan-payoff-counts">' +
            meals.length + (meals.length === 1 ? " meal" : " meals") + " · " +
            gcount + (gcount === 1 ? " grocery item" : " grocery items") +
          "</span>" +
          '<span class="plan-payoff-sub">Your combined shopping list is ready</span>' +
        "</span>" +
        '<span class="plan-payoff-cta">View list →</span>';
      payoff.addEventListener("click", function () {
        plannerState.view = "grocery"; refresh(); window.scrollTo(0, 0);
      });
      body.appendChild(payoff);
    }

    var add = el("button", "cook-start plan-add", "＋&nbsp;&nbsp;Add a meal");
    add.type = "button";
    add.addEventListener("click", function () { openPicker({}); });
    body.appendChild(add);

    if (meals.length) {
      var clear = el("button", "plan-clear", "Clear week");
      clear.type = "button";
      clear.addEventListener("click", function () {
        if (window.confirm("Clear all meals from this week?")) {
          clearPlan(); saveGroc(new Set()); refresh();
        }
      });
      body.appendChild(clear);
    }
  }

  function groceryRow(row, checked, opts) {
    opts = opts || {};
    var isDone = checked.has(row.key);
    var el2 = el("div", "check-row grocery-row" + (isDone ? " done" : "") +
      (opts.pantry ? " is-staple" : ""));
    el2.innerHTML =
      '<span class="check-box">' + CHECK_SVG + "</span>" +
      '<span class="grocery-qty">' + (row.qty ? esc(row.qty) : "") + "</span>" +
      '<span class="check-text">' + esc(row.item) + "</span>";
    el2.addEventListener("click", function () {
      var set = loadGroc();
      if (set.has(row.key)) { set.delete(row.key); el2.classList.remove("done"); }
      else { set.add(row.key); el2.classList.add("done"); }
      saveGroc(set);
    });
    // Staple toggle: lift an "always have" item off the buy list (or send a
    // staple back to it). Stops propagation so it never toggles the check-off.
    var pin = el("button", "grocery-staple" + (opts.pantry ? " on" : ""),
      opts.pantry ? "↩" : "🧂");
    pin.type = "button";
    pin.setAttribute("aria-label", opts.pantry
      ? "Move " + row.item + " back to the shopping list"
      : "Mark " + row.item + " as a pantry staple");
    pin.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      togglePantry(row.item);
      refresh();
    });
    el2.appendChild(pin);
    return el2;
  }

  function pantryFooter(staples, checked) {
    var wrap = el("div", "pantry-foot" + (plannerState.pantryOpen ? " open" : ""));
    var head = el("button", "pantry-foot-head");
    head.type = "button";
    head.setAttribute("aria-expanded", plannerState.pantryOpen ? "true" : "false");
    head.innerHTML =
      '<span class="pantry-foot-title">🧂 Check your pantry</span>' +
      '<span class="pantry-foot-count">' + staples.length + "</span>" +
      '<span class="pantry-foot-chev">' + (plannerState.pantryOpen ? "▾" : "▸") + "</span>";
    head.addEventListener("click", function () {
      plannerState.pantryOpen = !plannerState.pantryOpen; refresh();
    });
    wrap.appendChild(head);
    if (plannerState.pantryOpen) {
      var list = el("div", "pantry-foot-list");
      staples.forEach(function (row) { list.appendChild(groceryRow(row, checked, { pantry: true })); });
      wrap.appendChild(list);
    }
    return wrap;
  }

  function renderGroceryPane(body) {
    var meals = planMeals();
    if (!meals.length) {
      body.appendChild(emptyState("🛒",
        "No meals planned yet.<br>Add meals and your combined grocery list builds itself."));
      return;
    }
    var cats = buildGrocery();
    var checked = loadGroc();
    var pantry = loadPantry();

    // Split each category's rows into the active buy list vs. pantry staples.
    var buyCats = [], staples = [];
    cats.forEach(function (c) {
      var buy = [];
      c.rows.forEach(function (row) {
        if (pantry.has(pantryKey(row.item))) staples.push(row);
        else buy.push(row);
      });
      if (buy.length) buyCats.push({ category: c.category, rows: buy });
    });
    var total = buyCats.reduce(function (n, c) { return n + c.rows.length; }, 0);

    var card = el("div", "card grocery-card");
    card.appendChild(el("p", "card-label",
      "Shopping list · " + total + (total === 1 ? " item" : " items") +
      " · " + meals.length + (meals.length === 1 ? " meal" : " meals")));

    if (!total) {
      card.appendChild(emptyState("🧂",
        "Everything you need is a pantry staple.<br>Check your pantry below."));
    }
    buyCats.forEach(function (c) {
      var sec = el("div", "grocery-cat");
      sec.appendChild(el("div", "grocery-cat-head",
        '<span class="dot"></span>' + esc(c.category) +
        '<span class="grocery-cat-count">' + c.rows.length + "</span>"));
      c.rows.forEach(function (row) { sec.appendChild(groceryRow(row, checked)); });
      card.appendChild(sec);
    });
    body.appendChild(card);

    if (staples.length) body.appendChild(pantryFooter(staples, checked));

    body.appendChild(el("p", "macro-foot",
      "Quantities combine identical items across your planned meals. " +
      "Tap 🧂 to set aside a staple you always have."));
  }

  function renderRecipesPane(body) {
    var ids = planRecipeIds();
    if (!ids.length) {
      body.appendChild(emptyState("📖",
        "No recipes yet.<br>Add meals to gather the week's recipes here."));
      return;
    }
    body.appendChild(el("div", "browse-count",
      ids.length + (ids.length === 1 ? " recipe" : " recipes") + " this week"));
    var grid = el("div", "col-grid");
    ids.forEach(function (id) { var r = recipeById(id); if (r) grid.appendChild(recipeCard(r)); });
    body.appendChild(grid);
  }

  function renderPlanner() {
    var s = $("#screen-planner");
    s.innerHTML = "";

    var meals = planMeals();
    var sub = meals.length
      ? meals.length + (meals.length === 1 ? " meal" : " meals") +
        " · " + planRecipeIds().length + (planRecipeIds().length === 1 ? " recipe" : " recipes")
      : "Plan a week of meals";
    s.appendChild(backTopBar("‹ Home", "This Week", sub, function () { setTab("home"); }));

    s.appendChild(segControl("planner-nav", [
      { value: "plan", label: "Plan" },
      { value: "grocery", label: "Grocery" },
      { value: "recipes", label: "Recipes" }
    ], plannerState.view, function (v) { plannerState.view = v; refresh(); }));

    var body = el("div", "planner-body");
    if (plannerState.view === "plan") renderPlanPane(body);
    else if (plannerState.view === "grocery") renderGroceryPane(body);
    else if (plannerState.view === "recipes") renderRecipesPane(body);
    s.appendChild(body);
  }

  /* ── Recipe picker overlay (full-screen; add to week / to a slot) ──── */
  function pickCard(r, ctx) {
    var card = el("button", "rc rc-pick");
    card.type = "button";
    card.style.setProperty("--rc-accent", r.accent || "#C87A53");
    card.style.setProperty("--rc-accent-rgb", rgbFromHex(r.accent || "#C87A53"));
    var totalTime = (r.prep_time_mins || 0) + (r.cook_time_mins || 0);
    var meta = [];
    if (r.dish_category) meta.push(esc(r.dish_category));
    if (totalTime) meta.push(totalTime + " min");
    card.innerHTML =
      '<div class="rc-band"><span class="rc-icon">' + esc(r.icon || "🍽️") + "</span></div>" +
      '<div class="rc-body">' +
        '<h3 class="rc-title">' + esc(r.title) + "</h3>" +
        '<p class="rc-meta">' + meta.join(" · ") + "</p>" +
        '<p class="rc-macro">＋ Add to week</p>' +
      "</div>";
    // "Made recently" awareness: flag anything cooked in the last 2 weeks so
    // the cook can steer away from same-meals-every-week fatigue.
    var days = daysSinceCooked(r.recipe_id);
    if (days != null && days <= 14) {
      card.appendChild(el("span", "rc-cooked-badge",
        days <= 0 ? "Cooked today" : "Cooked " + days + "d ago"));
    }
    card.addEventListener("click", function () {
      addMeal(r.recipe_id, { day: ctx.day || null, slot: ctx.slot || null, serving: 2 });
      closePicker();
      refresh();
    });
    return card;
  }
  function closePicker() {
    var ov = document.querySelector(".picker");
    if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
    document.body.classList.remove("picking");
  }
  function openPicker(ctx) {
    ctx = ctx || {};
    closePicker();

    var ov = el("div", "picker");
    var top = el("div", "picker-top");
    top.appendChild(el("div", "picker-title",
      ctx.day ? esc("Add to " + DAY_LONG[ctx.day] + " · " + ctx.slot) : "Add a meal"));
    var done = el("button", "picker-close", "Done");
    done.type = "button";
    done.addEventListener("click", closePicker);
    top.appendChild(done);
    ov.appendChild(top);

    var sw = el("div", "picker-search");
    var box = el("input", "search-box");
    box.type = "search";
    box.placeholder = "Search recipes to add…";
    box.setAttribute("aria-label", "Search recipes to add");
    sw.appendChild(box);
    ov.appendChild(sw);

    // Optional freshness sort: least-recently-cooked (and never-cooked) first,
    // so the week doesn't keep surfacing what you just made.
    var sortFresh = false;
    var sortRow = el("div", "picker-sort");
    var sortBtn = el("button", "picker-sort-btn", "↻ Freshest first");
    sortBtn.type = "button";
    sortBtn.setAttribute("aria-pressed", "false");
    sortBtn.addEventListener("click", function () {
      sortFresh = !sortFresh;
      sortBtn.classList.toggle("active", sortFresh);
      sortBtn.setAttribute("aria-pressed", sortFresh ? "true" : "false");
      paint();
    });
    sortRow.appendChild(sortBtn);
    ov.appendChild(sortRow);

    var results = el("div", "picker-results");
    ov.appendChild(results);

    function paint() {
      var q = box.value.trim();
      results.innerHTML = "";
      var list = recipes().filter(function (r) { return recipesMatch(r, q); });
      if (sortFresh) {
        // never-cooked → 0 → sorts first (freshest); most-recent → last.
        list = list.slice().sort(function (a, b) {
          return (lastCookedAt(a.recipe_id) || 0) - (lastCookedAt(b.recipe_id) || 0);
        });
      }
      if (!list.length) {
        results.appendChild(emptyState("🔍", "No recipes match your search."));
        return;
      }
      var grid = el("div", "col-grid");
      list.forEach(function (r) { grid.appendChild(pickCard(r, ctx)); });
      results.appendChild(grid);
    }
    box.addEventListener("input", paint);
    paint();

    document.body.appendChild(ov);
    document.body.classList.add("picking");
  }

  /* ══ ADD-RECIPE FORM — create your own / add to library ═════════════ */
  // A full-screen overlay (reuses the picker overlay shell) holding a "Medium"
  // recipe form: title, icon, category, structured ingredients (item / qty /
  // unit / Meat·Dairy·Produce·Pantry) and numbered steps — no macros. On save
  // the recipe is persisted via MCUser and merged into the live data layer, so
  // it appears immediately in the "My Recipes" collection, search, Categories
  // and the planner.
  var GROC_CATS = ["Meat", "Dairy", "Produce", "Pantry"];
  var FORM_ACCENTS = ["#7D8C77", "#C87A53", "#B08D57", "#B23A48", "#C0633F", "#E0A458", "#5E6B8C"];

  function rfLabel(text) { return el("label", "rf-label", esc(text)); }
  function rfText(ph, value) {
    var i = el("input", "search-box rf-input");
    i.type = "text";
    i.placeholder = ph || "";
    if (value != null) i.value = value;
    return i;
  }
  function rfNumber(ph) {
    var i = el("input", "search-box rf-input rf-num");
    i.type = "number"; i.min = "0"; i.placeholder = ph || "";
    i.setAttribute("inputmode", "numeric");
    return i;
  }
  function rfArea(ph, value) {
    var t = el("textarea", "search-box rf-textarea");
    t.placeholder = ph || ""; t.rows = 3;
    if (value != null) t.value = value;
    return t;
  }
  function rfField(labelText, control, hint) {
    var f = el("div", "rf-field");
    f.appendChild(rfLabel(labelText));
    f.appendChild(control);
    if (hint) f.appendChild(el("p", "rf-hint", esc(hint)));
    return f;
  }

  function rfIngredientRow() {
    var row = el("div", "rf-ing");
    var qty  = rfText("Qty");  qty.classList.add("rf-ing-qty");
    var unit = rfText("Unit"); unit.classList.add("rf-ing-unit");
    var item = rfText("Ingredient"); item.classList.add("rf-ing-item");
    var cat  = el("select", "plan-select rf-ing-cat");
    GROC_CATS.forEach(function (c) {
      var o = el("option", null, esc(c)); o.value = c; cat.appendChild(o);
    });
    var rm = el("button", "rf-row-remove", "✕");
    rm.type = "button"; rm.setAttribute("aria-label", "Remove ingredient");
    rm.addEventListener("click", function () { if (row.parentNode) row.parentNode.removeChild(row); });
    row.appendChild(qty); row.appendChild(unit); row.appendChild(item);
    row.appendChild(cat); row.appendChild(rm);
    row._read = function () {
      return { quantity: qty.value, unit: unit.value, item: item.value, category: cat.value };
    };
    return row;
  }

  function rfStepRow(stepWrap) {
    var row = el("div", "rf-step");
    var head = el("div", "rf-step-head");
    head.appendChild(el("span", "rf-step-num", ""));
    var rm = el("button", "rf-row-remove", "✕");
    rm.type = "button"; rm.setAttribute("aria-label", "Remove step");
    rm.addEventListener("click", function () {
      if (row.parentNode) { row.parentNode.removeChild(row); rfRenumber(stepWrap); }
    });
    head.appendChild(rm);
    row.appendChild(head);
    var title  = rfText("Step title (optional)");
    var detail = rfArea("What to do… (durations like “simmer 20 minutes” become tap-to-start timers)");
    row.appendChild(title); row.appendChild(detail);
    row._read = function () { return { title: title.value, detail: detail.value }; };
    return row;
  }
  function rfRenumber(stepWrap) {
    var n = 1;
    Array.prototype.forEach.call(stepWrap.children, function (row) {
      var num = row.querySelector(".rf-step-num");
      if (num) num.textContent = String(n++);
    });
  }

  function closeRecipeForm() {
    var ov = document.querySelector(".recipe-form");
    if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
    document.body.classList.remove("picking");
  }

  function openRecipeForm() {
    closePicker();
    closeRecipeForm();

    var selectedAccent = FORM_ACCENTS[0];

    var ov = el("div", "picker recipe-form");

    // Top bar: Cancel · title · Save
    var top = el("div", "picker-top");
    var cancel = el("button", "picker-close rf-cancel", "Cancel");
    cancel.type = "button";
    cancel.addEventListener("click", closeRecipeForm);
    top.appendChild(cancel);
    top.appendChild(el("div", "picker-title", "Add a Recipe"));
    var saveTop = el("button", "picker-close rf-save-top", "Save");
    saveTop.type = "button";
    top.appendChild(saveTop);
    ov.appendChild(top);

    var body = el("div", "rf-body");

    // ── Basics ──
    var titleInput = rfText("e.g. Grandma's Pot Roast");
    body.appendChild(rfField("Title", titleInput));

    var iconInput = rfText("🍽️", "🍽️");
    iconInput.classList.add("rf-icon-input");
    body.appendChild(rfField("Icon", iconInput, "An emoji for the card. Tap to change it."));

    var catSel = el("select", "plan-select rf-select");
    var ph = el("option", null, "Choose a category…"); ph.value = ""; catSel.appendChild(ph);
    CATEGORY_ORDER.forEach(function (c) {
      var o = el("option", null, esc(c)); o.value = c; catSel.appendChild(o);
    });
    body.appendChild(rfField("Category", catSel));

    var descInput = rfArea("A short description (optional)");
    body.appendChild(rfField("Description", descInput));

    var tagsInput = rfText("Spicy, One-Dish, High-Protein");
    body.appendChild(rfField("Tags", tagsInput, "Comma-separated (optional)."));

    // Accent swatches
    var swatches = el("div", "rf-swatches");
    FORM_ACCENTS.forEach(function (hex, i) {
      var sw = el("button", "rf-swatch" + (i === 0 ? " active" : ""));
      sw.type = "button";
      sw.style.background = hex;
      sw.setAttribute("aria-label", "Accent color " + (i + 1));
      sw.addEventListener("click", function () {
        selectedAccent = hex;
        Array.prototype.forEach.call(swatches.children, function (n) { n.classList.remove("active"); });
        sw.classList.add("active");
      });
      swatches.appendChild(sw);
    });
    body.appendChild(rfField("Accent color", swatches));

    // Times + serving size
    var times = el("div", "rf-times");
    var prepInput = rfNumber("0");
    var cookInput = rfNumber("0");
    var servInput = rfNumber("2"); servInput.value = "2";
    times.appendChild(rfField("Prep (min)", prepInput));
    times.appendChild(rfField("Cook (min)", cookInput));
    times.appendChild(rfField("Makes (servings)", servInput));
    body.appendChild(times);

    // ── Ingredients ──
    body.appendChild(el("div", "tier-label rf-section", "Ingredients"));
    body.appendChild(el("p", "rf-hint rf-section-hint",
      "Amounts are for the serving count above; the app scales them automatically."));
    var ingWrap = el("div", "rf-ing-wrap");
    ingWrap.appendChild(rfIngredientRow());
    ingWrap.appendChild(rfIngredientRow());
    body.appendChild(ingWrap);
    var addIng = el("button", "rf-add", "＋ Add ingredient");
    addIng.type = "button";
    addIng.addEventListener("click", function () { ingWrap.appendChild(rfIngredientRow()); });
    body.appendChild(addIng);

    // ── Steps ──
    body.appendChild(el("div", "tier-label rf-section", "Method"));
    var stepWrap = el("div", "rf-step-wrap");
    body.appendChild(stepWrap);
    function addStepRow() { stepWrap.appendChild(rfStepRow(stepWrap)); rfRenumber(stepWrap); }
    addStepRow();
    var addStep = el("button", "rf-add", "＋ Add step");
    addStep.type = "button";
    addStep.addEventListener("click", addStepRow);
    body.appendChild(addStep);

    // Error line + primary Save
    var errBox = el("p", "rf-error", "");
    body.appendChild(errBox);
    var save = el("button", "cook-start rf-save", "Save recipe");
    save.type = "button";
    body.appendChild(save);

    ov.appendChild(body);

    function doSave() {
      errBox.textContent = "";
      var title = titleInput.value.trim();
      if (!title) { errBox.textContent = "Give your recipe a title."; titleInput.focus(); return; }
      if (!catSel.value) { errBox.textContent = "Choose a category."; catSel.focus(); return; }

      var ings = Array.prototype.map.call(ingWrap.children, function (r) {
        return r._read ? r._read() : null;
      }).filter(function (x) { return x && x.item.trim(); });
      if (!ings.length) { errBox.textContent = "Add at least one ingredient."; return; }

      var steps = Array.prototype.map.call(stepWrap.children, function (r) {
        return r._read ? r._read() : null;
      }).filter(function (x) { return x && x.detail.trim(); });
      if (!steps.length) { errBox.textContent = "Add at least one step (with instructions)."; return; }

      window.MCUser.add({
        title: title,
        icon: iconInput.value,
        dish_category: catSel.value,
        description: descInput.value,
        tags: tagsInput.value.split(",").map(function (t) { return t.trim(); }).filter(Boolean),
        accent: selectedAccent,
        prep_time_mins: prepInput.value,
        cook_time_mins: cookInput.value,
        base_serving: servInput.value,
        ingredients: ings,
        steps: steps
      });

      closeRecipeForm();
      setTab("recipes");   // land on the Recipes screen → My Recipes card updated
    }
    save.addEventListener("click", doSave);
    saveTop.addEventListener("click", doSave);

    document.body.appendChild(ov);
    document.body.classList.add("picking");
    titleInput.focus();
  }

  /* ── Shared top bar (brand / titles, no back) ─────────────────────── */
  function topBar(eyebrow, title, sub) {
    var t = el("div", "shell-top");
    t.innerHTML =
      (eyebrow ? '<p class="shell-eyebrow">' + esc(eyebrow) + "</p>" : "") +
      (title ? '<h1 class="shell-title">' + esc(title) + "</h1>" : "") +
      (sub ? '<p class="shell-sub">' + esc(sub) + "</p>" : "");
    return t;
  }

  /* ── Screen switching (hub-and-spoke; mirrored to location.hash) ──── */
  var SCREENS = ["home", "planner", "categories", "recipes", "favorites", "mikes", "tracker"];
  var COOKBOOK_SCREENS = ["home", "planner", "categories", "recipes", "favorites", "mikes"];

  function setTab(name) {
    if (SCREENS.indexOf(name) < 0) name = "home";
    if (name === "categories") catState.open = null;  // re-entry → category grid
    if (name !== "planner") closePicker();             // never leave the picker open

    SCREENS.forEach(function (t) {
      var sc = $("#screen-" + t);
      if (sc) sc.classList.toggle("active", t === name);
    });

    if (name === "home") renderHome();
    if (name === "planner") renderPlanner();
    if (name === "categories") renderCategories();
    if (name === "recipes") renderRecipes();
    if (name === "favorites") renderFavorites();
    if (name === "mikes") renderMikes();
    if (name === "tracker") renderTracker();

    // Sync persistent tab bar
    var tabCookbook = document.getElementById("tab-cookbook");
    var tabTracker  = document.getElementById("tab-tracker");
    var isTracker   = (name === "tracker");
    if (tabCookbook) tabCookbook.classList.toggle("active", !isTracker);
    if (tabTracker)  tabTracker.classList.toggle("active",  isTracker);

    history.replaceState(null, "", name === "home" ? location.pathname : "#" + name);
    window.scrollTo(0, 0);
  }

  // The currently visible screen, read from the DOM so it stays correct even
  // after hash-less home navigation.
  function activeScreen() {
    for (var i = 0; i < SCREENS.length; i++) {
      var sc = $("#screen-" + SCREENS[i]);
      if (sc && sc.classList.contains("active")) return SCREENS[i];
    }
    return "home";
  }

  // Live favorites sync. The recipe view (and any other tab) writes the shared
  // store from a DIFFERENT document, so the `storage` event is our signal to
  // re-render without a manual refresh. Only the favorites-aware screens care;
  // a null key means localStorage was cleared, so refresh defensively.
  function wireFavSync() {
    window.addEventListener("storage", function (e) {
      if (e.key && e.key !== FAV_KEY) return;
      var screen = activeScreen();
      if (screen === "home") renderHome();
      else if (screen === "favorites") renderFavorites();
    });
  }

  /* ── Boot ─────────────────────────────────────────────────────────── */
  function init() {
    syncOwnerFromUrl();
    wireFavSync();

    // Persistent tab bar: Cookbook tab → home; Tracker tab → tracker screen.
    var tabCookbook = document.getElementById("tab-cookbook");
    var tabTracker  = document.getElementById("tab-tracker");
    if (tabCookbook) tabCookbook.addEventListener("click", function () { setTab("home"); });
    if (tabTracker)  tabTracker.addEventListener("click",  function () { setTab("tracker"); });

    setTab((location.hash || "#home").slice(1));
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }

  // Expose favorites API for collection.js / recipe page.
  window.MCFav = { load: loadFavs, toggle: toggleFav, has: function (id) { return loadFavs().has(id); } };
})();

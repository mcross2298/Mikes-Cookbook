/* ==========================================================================
   mc-grocery.js  —  the merged grocery list: quantity math + ingredient keys
   --------------------------------------------------------------------------
   Audit C-08. `cookbook-home.js` was 4,615 lines and 230 top-level functions
   in one IIFE. The audit assumed the planner was the first thing to lift out
   of it — ~1,350 contiguous lines that "only setTab() calls into". Measuring
   the actual coupling said otherwise: that region references **66** names
   defined elsewhere in the file, so extracting it would mean threading a
   66-entry context object through the seam. Contiguous is not the same as
   separable.

   This region is the opposite: 256 lines that need **five** things from the
   host (`recipes`, `recipeById`, `planMeals`, `loadPantry`, `pantryKey`) and
   hand six back. That's a real seam, so it's the one that moved.

   What lives here: parsing an ingredient amount ("1 1/2", "0.75", "to taste"),
   summing amounts across every planned meal, converting to sensible purchase
   units, and rendering all of that back as a readable quantity. Plus the
   ingredient-identity keying (`category|singularized-name`) that both the
   grocery merge AND Smart Week's ingredient-overlap scoring depend on — which
   is exactly why it belongs in one place rather than being reimplemented on
   either side.

   Wire it up with MCGrocery.configure({...}) before first use; every hook is
   required, because unlike the recipe card there is no sensible no-op default
   for "what's in the plan".

   Exposed as window.MCGrocery.
   ========================================================================== */
(function () {
  "use strict";
  if (window.MCGrocery) return;

  /* ── host data hooks ─────────────────────────────────────────────────── */
  var H = {
    recipes:    function () { return window.RECIPES || []; },
    recipeById: function () { return null; },
    planMeals:  function () { return []; },
    loadPantry: function () { return new Set(); },
    pantryKey:  function (s) { return (s || "").trim().toLowerCase(); }
  };
  function configure(hooks) {
    Object.keys(hooks || {}).forEach(function (k) {
      if (typeof hooks[k] === "function") H[k] = hooks[k];
    });
  }
  // Local aliases so the moved code below reads exactly as it did in place.
  function recipes()          { return H.recipes(); }
  function recipeById(id)     { return H.recipeById(id); }
  function planMeals()        { return H.planMeals(); }
  function loadPantry()       { return H.loadPantry(); }
  function pantryKey(item)    { return H.pantryKey(item); }

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

  // Singularize an item name for merge-key purposes only (display keeps the
  // recipe's original wording). Trivial wording differences like "Chicken
  // breast" vs "Chicken breasts" are the SAME shopping item and must merge —
  // but this is intentionally conservative. Broader "near-identical" fuzzy
  // matching (e.g. "Onion" vs "Red onion", "Lemon" vs "Lemon juice") was
  // tested against the real recipe data and rejected: those are genuinely
  // different items to buy, and auto-merging them would silently under-count
  // the list. True synonyms (same product, different wording) belong in
  // ITEM_ALIASES below instead of a generic fuzzy rule.
  function singularizeForMerge(s) {
    if (/sses$/i.test(s)) return s;              // molasses — invariant, not a plural
    if (/us$/i.test(s)) return s;                // hummus, asparagus — invariant
    if (/ss$/i.test(s)) return s;                // swiss, glass — not a plural "s"
    if (/[a-z]oes$/i.test(s)) return s.slice(0, -2);           // tomatoes -> tomato
    if (/[a-z]ies$/i.test(s) && s.length > 4) return s.slice(0, -3) + "y"; // berries -> berry
    if (/(ch|sh|x)es$/i.test(s)) return s.slice(0, -2);        // peaches -> peach
    if (/[a-z]s$/i.test(s) && s.length > 3) return s.slice(0, -1); // breasts -> breast
    return s;
  }
  // Curated synonym table for items that are the same product but authored
  // with different wording across recipes — NOT auto-detected (see above).
  // Add an entry here only when you've confirmed two item names really are
  // interchangeable at the store; keys/values are matched after lowercasing
  // and singularizing. Empty until specific pairs are confirmed.
  var ITEM_ALIASES = {
    // "fajita chicken seasoning": "fajita seasoning"
  };
  function groceryMergeName(item) {
    var norm = singularizeForMerge(item.toLowerCase().trim());
    return ITEM_ALIASES[norm] || norm;
  }

  // ── Purchase-unit rounding ────────────────────────────────────────────
  // A recipe's cooking measurement ("1/4 cup", "1 tbsp") isn't how the item
  // is actually bought. Two independent rules, both round UP (never down —
  // it's always safe to have a little extra):
  //
  // 1. Discrete units (a size word, a package word, or no unit at all) can't
  //    be bought fractionally — "1/2 small" onion means grab 1. Any unit not
  //    on this list is a real cooking measurement (g, ml, tsp not otherwise
  //    converted, etc.) and is left as the merged amount, unrounded.
  // 2. A curated list of pantry items that are always bought as a single
  //    whole product regardless of how much the recipe calls for — a
  //    seasoning blend is a packet, guacamole is a tub — override the whole
  //    line to "1 <purchase unit>". Deliberately conservative: only named
  //    matches or an explicit "season(ing)" in the item name qualify: this
  //    never applies to a normal bulk ingredient (olive oil, honey, rice…)
  //    just because a fraction looks awkward — the rest of buildGrocery
  //    already leaves those as their real called-for amount.
  var DISCRETE_UNIT_RE = /^(|small|medium|large|whole)$|\b(packets?|sachets?|cans?|jars?|boxe?s?|bags?|bottles?|containers?|scoops?|packs?)\b/i;
  function isDiscreteUnit(unit) {
    return DISCRETE_UNIT_RE.test((unit || "").trim().toLowerCase());
  }
  var PANTRY_PURCHASE_UNITS = {
    "ranch dip mix": "packet",
    "taco seasoning": "packet",
    "guacamole": "container",
    "hummus": "container",
    "salsa": "container",
    "prepared salsa": "container",
    "pesto": "container",
    "basil pesto": "container"
  };
  function purchaseUnitFor(item) {
    var norm = groceryMergeName(item);
    if (PANTRY_PURCHASE_UNITS[norm]) return PANTRY_PURCHASE_UNITS[norm];
    if (/season/i.test(item)) return "packet";
    return null;
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
        var ikey = cat + "|" + groceryMergeName(item);
        var it = items[ikey];
        if (!it) { it = items[ikey] = { key: ikey, item: item, category: cat, buckets: {}, bucketOrder: [], texts: [], mealUids: [] }; order.push(ikey); }
        if (it.mealUids.indexOf(meal.uid) < 0) it.mealUids.push(meal.uid);

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
              var shown = isDiscreteUnit(bk.unit) ? Math.ceil(bk.sum - 1e-9) : prettyQty(bk.sum);
              parts.push(shown + (bk.unit ? " " + bk.unit : ""));
            }
          });
          if (it.texts.length) {
            var uniq = it.texts.filter(function (t, i) { return it.texts.indexOf(t) === i; });
            parts.push(uniq.join(", "));
          }
          var qty = parts.join(" · ");
          var pu = parts.length ? purchaseUnitFor(it.item) : null;
          if (pu) qty = "1 " + pu;
          return { key: it.key, item: it.item, qty: qty, mealUids: it.mealUids };
        })
      };
    });
  }
  // True once every meal that contributed this item has been marked
  // completed — the "split-trip" signal that it's already been used up.
  function groceryRowAllDone(row) {
    if (!row.mealUids || !row.mealUids.length) return false;
    var plan = planMeals();
    return row.mealUids.every(function (uid) {
      var m = plan.filter(function (x) { return x.uid === uid; })[0];
      return !!(m && m.completed);
    });
  }
  function groceryItemCount() {
    var pantry = loadPantry();   // count only what you'd still actually need to buy
    return buildGrocery().reduce(function (n, c) {
      return n + c.rows.filter(function (row) {
        return !pantry.has(pantryKey(row.item)) && !groceryRowAllDone(row);
      }).length;
    }, 0);
  }

  // Ingredient identity for overlap scoring below — same items regardless of
  // which authored serving tier we read, since scaling only changes
  // quantity, not what's on the list (see recipes-data.js's data model).
  // Keyed the same way buildGrocery() keys a merged row (category + lower-
  // cased item name) so "shares an ingredient" means the same thing here as
  // it does on the actual grocery list.
  function recipeIngredientKeys(r) {
    var by = r.ingredients_by_serving || {};
    var list = by[Object.keys(by)[0]] || [];
    var keys = {};
    list.forEach(function (ing) {
      var item = (ing.item || "").trim();
      if (!item) return;
      keys[(ing.category || "Other") + "|" + groceryMergeName(item)] = true;
    });
    return keys;
  }
  function mergeIngredientKeys(target, keys) {
    Object.keys(keys).forEach(function (k) { target[k] = true; });
  }
  window.MCGrocery = {
    configure: configure,
    buildGrocery: buildGrocery,
    groceryItemCount: groceryItemCount,
    groceryMergeName: groceryMergeName,
    groceryRowAllDone: groceryRowAllDone,
    recipeIngredientKeys: recipeIngredientKeys,
    mergeIngredientKeys: mergeIngredientKeys,
    // exposed for tests / future callers, not currently used outside
    parseQty: parseQty,
    prettyQty: prettyQty,
    purchaseUnitFor: purchaseUnitFor
  };
})();

#!/usr/bin/env node
/* ==========================================================================
   validate-recipes.js — schema/invariant checks for recipes-data.js
   --------------------------------------------------------------------------
   Loads recipes-data.js the same way the browser does (it self-attaches to
   `window`), by running it in a vm context whose global object doubles as
   `window`. No parser dependency, no npm install — just Node's built-in vm
   module, matching the project's "no build step" constraint.

   Run: node tools/validate-recipes.js
   Exits non-zero (and prints ::error annotations for GitHub Actions) on any
   violation, so a bad copy-paste in recipes-data.js fails CI instead of
   shipping straight to production.
   ========================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DATA_FILE = path.join(__dirname, "..", "recipes-data.js");

// Keep in sync with CATEGORY_ORDER in cookbook-home.js — adding a 12th
// dish_category needs both updated (see CLAUDE.md's data-model section).
const KNOWN_DISH_CATEGORIES = new Set([
  "Breakfast", "Salads & Slaws", "Soups, Stews & Chilis", "Casseroles & Bakes",
  "Skillets & Stir-Fries", "Grilled & Sheet-Pan", "Sandwiches", "Desserts",
  "Salsas & Dips", "Sauces", "Marinades"
]);
const KNOWN_INGREDIENT_CATEGORIES = new Set(["Meat", "Dairy", "Produce", "Pantry"]);
const KNOWN_COLLECTION_STATUS = new Set(["live", "coming-soon"]);
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SERVING_KEY_RE = /^serving_(\d+)$/;

// Recipes are NOT all on the classic serving_2/serving_4 ladder — batch-yield
// items (a whole cheesecake, a single-tray dessert) author one serving_N tier
// matching native_serving/scaling_options instead (see cookbook.js's
// nativeServing()/ingredientsFor()/macrosFor(), which read whichever
// serving_N keys exist generically). So: require *at least one* serving_N
// tier, not specifically 2 and 4 — and when more than one tier exists,
// require the macro sets to agree (macros are per-serving, not per-batch).
function servingTierKeys(obj) {
  return Object.keys(obj || {}).filter(function (k) { return SERVING_KEY_RE.test(k); });
}

function loadData() {
  const src = fs.readFileSync(DATA_FILE, "utf8");
  const sandbox = {};
  sandbox.window = sandbox; // mirrors the browser's `window === globalThis`
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: DATA_FILE });
  return {
    recipes: sandbox.RECIPES,
    collections: sandbox.COLLECTIONS,
    mikesFavorites: sandbox.MIKES_FAVORITES
  };
}

function isNonEmptyString(v) { return typeof v === "string" && v.trim().length > 0; }
function isFiniteNumber(v) { return typeof v === "number" && isFinite(v); }
// fiber_g is optional (re-audit critical gap #05) — required only when the
// recipe actually authors it, but when present it must be a real number,
// same as the four required fields.
function macroProfileShapeOk(mp) {
  if (!mp || !["calories", "protein_g", "fat_g", "carbs_g"].every(function (k) {
    return isFiniteNumber(mp[k]);
  })) return false;
  return mp.fiber_g == null || isFiniteNumber(mp.fiber_g);
}
function macroProfilesEqual(a, b) {
  if (!["calories", "protein_g", "fat_g", "carbs_g"].every(function (k) { return a[k] === b[k]; })) return false;
  // fiber_g only has to agree across tiers when at least one tier authors
  // it — two tiers that both omit it are equal on it by definition.
  if (a.fiber_g == null && b.fiber_g == null) return true;
  return a.fiber_g === b.fiber_g;
}

function validateRecipes(recipes, errors) {
  if (!Array.isArray(recipes) || !recipes.length) {
    errors.push("RECIPES is missing or empty.");
    return { ids: new Set(), sources: new Set() };
  }
  var ids = new Set();
  var sources = new Set();
  recipes.forEach(function (r, i) {
    var where = "RECIPES[" + i + "] (" + (r && r.recipe_id ? r.recipe_id : "no recipe_id") + ")";

    if (!isNonEmptyString(r.recipe_id)) { errors.push(where + ": missing recipe_id"); return; }
    if (!SLUG_RE.test(r.recipe_id)) errors.push(where + ": recipe_id \"" + r.recipe_id + "\" isn't a lowercase-hyphen slug");
    if (ids.has(r.recipe_id)) errors.push(where + ": duplicate recipe_id \"" + r.recipe_id + "\"");
    ids.add(r.recipe_id);

    ["title", "source", "description", "icon", "accent"].forEach(function (field) {
      if (!isNonEmptyString(r[field])) errors.push(where + ": missing/empty \"" + field + "\"");
    });
    if (isNonEmptyString(r.source)) sources.add(r.source);

    // photo is optional (CI initiative 3 / CLAUDE.md's photo hand-off rule) —
    // absent on the recipes that don't have one, never backfilled. When it IS
    // present it must actually resolve, so a typo'd or moved path fails CI
    // instead of rendering a broken image on every card that recipe appears
    // on. Only checked when a value exists; a missing field is not an error.
    if (r.photo != null) {
      if (!isNonEmptyString(r.photo)) {
        errors.push(where + ": \"photo\" must be a non-empty string when present");
      } else if (!fs.existsSync(path.join(__dirname, "..", r.photo))) {
        errors.push(where + ": photo \"" + r.photo + "\" does not exist on disk");
      }
    }

    if (!isNonEmptyString(r.dish_category) || !KNOWN_DISH_CATEGORIES.has(r.dish_category)) {
      errors.push(where + ": dish_category \"" + r.dish_category + "\" isn't one of the known categories");
    }
    if (!isFiniteNumber(r.prep_time_mins) || r.prep_time_mins < 0) errors.push(where + ": prep_time_mins must be a non-negative number");
    if (!isFiniteNumber(r.cook_time_mins) || r.cook_time_mins < 0) errors.push(where + ": cook_time_mins must be a non-negative number");
    if (!isFiniteNumber(r.native_serving) || r.native_serving <= 0) errors.push(where + ": native_serving must be a positive number");
    if (!Array.isArray(r.scaling_options) || !r.scaling_options.length) errors.push(where + ": scaling_options must be a non-empty array");

    var mp = r.macro_profiles || {};
    var mpKeys = servingTierKeys(mp);
    if (!mpKeys.length) {
      errors.push(where + ": macro_profiles has no serving_N tier");
    } else {
      var validMpKeys = [];
      mpKeys.forEach(function (k) {
        if (macroProfileShapeOk(mp[k])) validMpKeys.push(k);
        else errors.push(where + ": macro_profiles." + k + " is missing/malformed");
      });
      for (var m = 1; m < validMpKeys.length; m++) {
        if (!macroProfilesEqual(mp[validMpKeys[0]], mp[validMpKeys[m]])) {
          errors.push(where + ": macro_profiles." + validMpKeys[0] + " and " + validMpKeys[m] +
            " must be identical (macros are per-serving, not per-batch)");
        }
      }
    }

    var ibs = r.ingredients_by_serving || {};
    var ibsKeys = servingTierKeys(ibs);
    if (!ibsKeys.length) {
      errors.push(where + ": ingredients_by_serving has no serving_N tier");
    } else {
      ibsKeys.forEach(function (tier) {
        var list = ibs[tier];
        if (!Array.isArray(list) || !list.length) {
          errors.push(where + ": ingredients_by_serving." + tier + " must be a non-empty array");
          return;
        }
        list.forEach(function (ing, j) {
          var ingWhere = where + ": ingredients_by_serving." + tier + "[" + j + "]";
          if (!isNonEmptyString(ing.item)) errors.push(ingWhere + ": missing \"item\"");
          if (typeof ing.quantity !== "string" && typeof ing.quantity !== "number") errors.push(ingWhere + ": missing \"quantity\"");
          if (typeof ing.unit !== "string") errors.push(ingWhere + ": \"unit\" must be a string (can be empty)");
          if (!KNOWN_INGREDIENT_CATEGORIES.has(ing.category)) {
            errors.push(ingWhere + ": ingredient category \"" + ing.category + "\" isn't Meat/Dairy/Produce/Pantry");
          }
        });
      });
    }

    if (!Array.isArray(r.instructions) || !r.instructions.length) {
      errors.push(where + ": instructions must be a non-empty array");
    } else {
      r.instructions.forEach(function (step, j) {
        var stepWhere = where + ": instructions[" + j + "]";
        if (!isFiniteNumber(step.step_number)) errors.push(stepWhere + ": missing step_number");
        if (!isNonEmptyString(step.title)) errors.push(stepWhere + ": missing title");
        if (!isNonEmptyString(step.detail)) errors.push(stepWhere + ": missing detail");
      });
    }
  });
  return { ids: ids, sources: sources };
}

function validateCollections(collections, sources, errors) {
  if (!Array.isArray(collections) || !collections.length) {
    errors.push("COLLECTIONS is missing or empty.");
    return;
  }
  var ids = new Set();
  collections.forEach(function (c, i) {
    var where = "COLLECTIONS[" + i + "] (" + (c && c.id ? c.id : "no id") + ")";
    if (!isNonEmptyString(c.id)) { errors.push(where + ": missing id"); return; }
    if (ids.has(c.id)) errors.push(where + ": duplicate collection id \"" + c.id + "\"");
    ids.add(c.id);

    if (!isNonEmptyString(c.title)) errors.push(where + ": missing title");
    if (!KNOWN_COLLECTION_STATUS.has(c.status)) errors.push(where + ": status \"" + c.status + "\" must be \"live\" or \"coming-soon\"");

    if (c.source_match !== null && !isNonEmptyString(c.source_match)) {
      errors.push(where + ": source_match must be null or a non-empty string");
    } else if (isNonEmptyString(c.source_match) && !sources.has(c.source_match)) {
      errors.push(where + ": source_match \"" + c.source_match + "\" doesn't match any recipe's \"source\" — this collection would render empty");
    } else if (c.status === "live" && c.source_match === null) {
      errors.push(where + ": status is \"live\" but source_match is null — this collection can never list a recipe");
    }
  });
}

// Audit C-10 — the reverse of the source_match check above. That one proves a
// collection can't render empty; this one proves a recipe can't be stranded.
// Ten recipes across four sources (Eating Healthy Mag, Simple High-Protein
// Recipes, Family Recipes, Clean Eat Guide) had no collection pointing at
// them, so they were reachable only via Categories or search — never from the
// collection cards Home sends a cook to. Nothing caught it because validation
// only ever ran collection -> recipe. Adding a recipe with a brand-new
// `source` and no matching collection now fails here instead of shipping an
// unreachable recipe.
function validateEveryRecipeReachable(recipes, collections, errors) {
  if (!Array.isArray(recipes) || !Array.isArray(collections)) return;
  var liveSources = new Set();
  collections.forEach(function (c) {
    if (c && c.status === "live" && isNonEmptyString(c.source_match)) liveSources.add(c.source_match);
  });
  var orphansBySource = new Map();
  recipes.forEach(function (r) {
    if (!r || !isNonEmptyString(r.source) || liveSources.has(r.source)) return;
    if (!orphansBySource.has(r.source)) orphansBySource.set(r.source, []);
    orphansBySource.get(r.source).push(r.recipe_id);
  });
  orphansBySource.forEach(function (recipeIds, source) {
    errors.push(
      "source \"" + source + "\" has " + recipeIds.length + " recipe(s) but no live COLLECTIONS entry " +
      "matches it — unreachable from the Recipes browse path (" +
      recipeIds.slice(0, 4).join(", ") + (recipeIds.length > 4 ? ", …" : "") + "). " +
      "Add a collection with source_match \"" + source + "\", or change those recipes' source."
    );
  });
}

function validateMikesFavorites(list, ids, errors) {
  if (list === undefined) return; // optional
  if (!Array.isArray(list)) { errors.push("MIKES_FAVORITES must be an array."); return; }
  list.forEach(function (id, i) {
    if (!ids.has(id)) errors.push("MIKES_FAVORITES[" + i + "]: \"" + id + "\" doesn't match any recipe_id");
  });
}

/* ==========================================================================
   Nutrition and scaling coherence (GO LIVE run, protocol §3).
   --------------------------------------------------------------------------
   Two things a kitchen companion cannot get wrong: what the food contains, and
   what happens when you cook more of it. Neither was checked here before, and
   a fleet sweep found real instances of both — an authoring slip lives in ONE
   record, which is exactly what a spot check misses.

   Both checks carry an explicit allowlist of the records that were already
   wrong when the check was written. That is deliberate, and it is not the same
   as passing them: a count ratchet would let a DIFFERENT recipe be swapped in
   for one already counted, whereas a named list says precisely which records
   are known-bad and fails the moment an unnamed one appears. Fixing the listed
   ones means supplying the right number, which is an authoring decision, not
   something a checker may infer — so they are named and left, not guessed at.
   ========================================================================== */

/* Stated calories vs the recipe's OWN macros under the published Atwater
   factors: protein 4 kcal/g, carbohydrate 4, fat 9. A published macro rounds
   to whole grams, so a small disagreement is normal; these eight are 15-24%
   apart, which no rounding produces. Every one of them OVERSTATES the
   calories relative to its own macros, and every one sits in a 3/5/6-serving
   tier — a pattern worth a look when someone comes to correct them. */
var ATWATER_KNOWN = [
  "chicken-enchilada-quinoa/serving_6",
  "crockpot-pizza-chicken-bowls/serving_6",
  "creamy-cajun-chicken-potatoes/serving_5",
  "honey-garlic-chicken-rice/serving_6",
  "buffalo-chicken-tender-salad/serving_3",
  "bbq-beef-short-ribs-corn-succotash-rotini-salad/serving_3",
  "shrimp-baked-mac-and-cheese-sauteed-spinach/serving_3",
  "mixed-grill-skillet-peppers-onions-mashed-potatoes/serving_3"
];

/* Ingredients that do not scale sanely between the smallest and largest
   authored tier. Three of these REDUCE when the recipe doubles — shepherd's
   pie asks for 3 garlic cloves at two servings and 2 at four — so a cook
   following the larger version under-seasons. The rest jump 6-8x at a 2x
   scale, which may be deliberate re-authoring from a different source; they
   are listed rather than judged. */
var SCALING_KNOWN = [
  'lemon-herb-pork-tenderloins-broccoli/Extra-virgin olive oil',
  'shepherds-pie/Garlic cloves',
  'cheesy-beef-taco-potato-bowls/Paprika',
  'korean-beef-fried-rice/Rice vinegar',
  'korean-beef-fried-rice/Soy sauce',
  'garlic-shrimp-fried-rice/Soy sauce',
  'honey-buffalo-chicken-rice-bowls/Salt',
  'honey-buffalo-chicken-rice-bowls/Black pepper',
  'blackened-chicken-tenders-cane-sauce/Garlic powder',
  'one-pan-cheesy-taco-rice/Taco seasoning'
];

/* Conversions written from the definitions rather than read from the app's
   MCUnits, so this check cannot agree with a bug in the converter it is
   meant to be independent of. */
var VOL_TSP = { tsp: 1, teaspoon: 1, teaspoons: 1, tbsp: 3, tablespoon: 3, tablespoons: 3,
                "fl oz": 6, cup: 48, cups: 48, pint: 96, pt: 96, quart: 192, qt: 192, l: 202.9, ml: 0.2029 };
var WT_OZ   = { oz: 1, ounce: 1, ounces: 1, lb: 16, lbs: 16, pound: 16, pounds: 16, g: 0.03527, kg: 35.27 };

function vrParseQty(q) {
  var t = String(q == null ? "" : q).trim();
  if (!t) return null;
  var mixed = t.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)/);
  if (mixed) return +mixed[1] + (+mixed[2] / +mixed[3]);
  var frac = t.match(/^(\d+)\s*\/\s*(\d+)/);
  if (frac) return +frac[1] / +frac[2];
  var dec = t.match(/^[\d.]+/);
  return dec ? parseFloat(dec[0]) : null;
}
function vrCanon(qty, unit) {
  var n = vrParseQty(qty);
  if (n == null) return null;
  var u = String(unit || "").trim().toLowerCase().replace(/\.$/, "");
  if (VOL_TSP[u] != null) return { dim: "vol", v: n * VOL_TSP[u] };
  if (WT_OZ[u]   != null) return { dim: "wt",  v: n * WT_OZ[u] };
  return { dim: "count:" + u, v: n };
}

function validateNutritionCoherence(recipes, errors) {
  var seen = [];
  recipes.forEach(function (r) {
    var profiles = r.macro_profiles || {};
    Object.keys(profiles).forEach(function (tier) {
      var m = profiles[tier];
      if (!m) return;
      var key = r.recipe_id + "/" + tier;
      var atwater = (+m.protein_g || 0) * 4 + (+m.carbs_g || 0) * 4 + (+m.fat_g || 0) * 9;
      var stated = +m.calories || 0;
      var tol = Math.max(60, stated * 0.12);
      if (Math.abs(atwater - stated) <= tol) return;
      seen.push(key);
      if (ATWATER_KNOWN.indexOf(key) === -1) {
        errors.push(key + ": stated " + stated + " kcal but its own macros are " +
          Math.round(atwater) + " kcal (" + m.protein_g + "p/" + m.fat_g + "f/" + m.carbs_g + "c) — " +
          "a macro panel must agree with itself");
      }
    });
  });
  ATWATER_KNOWN.forEach(function (k) {
    if (seen.indexOf(k) === -1) {
      errors.push("ATWATER_KNOWN lists " + k + " but it now reconciles — remove it from the list");
    }
  });
}

function validateScalingCoherence(recipes, errors) {
  var seen = [];
  recipes.forEach(function (r) {
    var opts = (r.scaling_options || []).slice().sort(function (a, b) { return a - b; });
    if (opts.length < 2) return;
    var loT = opts[0], hiT = opts[opts.length - 1], ratio = hiT / loT;
    var byServing = r.ingredients_by_serving || {};
    var lo = byServing["serving_" + loT] || [], hi = byServing["serving_" + hiT] || [];
    lo.forEach(function (l) {
      var h = null;
      for (var i = 0; i < hi.length; i++) {
        if (hi[i].item === l.item && hi[i].category === l.category) { h = hi[i]; break; }
      }
      if (!h) return;
      var a = vrCanon(l.quantity, l.unit), b = vrCanon(h.quantity, h.unit);
      if (!a || !b || a.dim !== b.dim || a.v <= 0) return;   // cross-dimension: not comparable
      var shrank = b.v < a.v, overshot = b.v > a.v * ratio * 2;
      if (!shrank && !overshot) return;
      var key = r.recipe_id + "/" + l.item;
      seen.push(key);
      if (SCALING_KNOWN.indexOf(key) === -1) {
        errors.push(key + ": " + l.quantity + " " + l.unit + " at " + loT + " servings but " +
          h.quantity + " " + h.unit + " at " + hiT + (shrank
            ? " — scaling UP must not use LESS of an ingredient"
            : " — more than twice what a linear scale would ask for"));
      }
    });
  });
  SCALING_KNOWN.forEach(function (k) {
    if (seen.indexOf(k) === -1) {
      errors.push("SCALING_KNOWN lists " + k + " but it now scales sanely — remove it from the list");
    }
  });
}

function main() {
  var data = loadData();
  var errors = [];
  var recipeInfo = validateRecipes(data.recipes, errors);
  validateCollections(data.collections, recipeInfo.sources, errors);
  validateEveryRecipeReachable(data.recipes, data.collections, errors);
  validateMikesFavorites(data.mikesFavorites, recipeInfo.ids, errors);
  validateNutritionCoherence(data.recipes, errors);
  validateScalingCoherence(data.recipes, errors);

  if (errors.length) {
    var inCI = !!process.env.GITHUB_ACTIONS;
    errors.forEach(function (e) {
      if (inCI) console.log("::error file=recipes-data.js::" + e);
      else console.error("FAIL: " + e);
    });
    console.error("\nrecipes-data.js failed validation: " + errors.length + " problem(s).");
    process.exit(1);
  }
  console.log("recipes-data.js OK — " + data.recipes.length + " recipes, " + data.collections.length + " collections.");
}

main();

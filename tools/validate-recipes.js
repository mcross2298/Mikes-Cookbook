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
function macroProfileShapeOk(mp) {
  return mp && ["calories", "protein_g", "fat_g", "carbs_g"].every(function (k) {
    return isFiniteNumber(mp[k]);
  });
}
function macroProfilesEqual(a, b) {
  return ["calories", "protein_g", "fat_g", "carbs_g"].every(function (k) { return a[k] === b[k]; });
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

function validateMikesFavorites(list, ids, errors) {
  if (list === undefined) return; // optional
  if (!Array.isArray(list)) { errors.push("MIKES_FAVORITES must be an array."); return; }
  list.forEach(function (id, i) {
    if (!ids.has(id)) errors.push("MIKES_FAVORITES[" + i + "]: \"" + id + "\" doesn't match any recipe_id");
  });
}

function main() {
  var data = loadData();
  var errors = [];
  var recipeInfo = validateRecipes(data.recipes, errors);
  validateCollections(data.collections, recipeInfo.sources, errors);
  validateMikesFavorites(data.mikesFavorites, recipeInfo.ids, errors);

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

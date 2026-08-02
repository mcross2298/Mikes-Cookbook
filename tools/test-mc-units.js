#!/usr/bin/env node
'use strict';
/* ==========================================================================
   test-mc-units.js — regression coverage for mc-units.js (CI initiative 2,
   "The Ingredient Truth Layer") and a RATCHETING corpus-wide fragmentation
   gate over the real recipes-data.js.

   Two different things, both in this file:

   1. Unit tests of mc-units.js in isolation — exact conversion factors,
      alias/singularize behavior, density lookups, aisle assignment. These
      pin the mechanism.

   2. A measurement over the ACTUAL corpus, using the REAL groceryMergeName()
      from mc-grocery.js (not a reimplementation — a second copy of that
      normalization would drift from production and measure a fiction). For
      every ingredient identity (category|mergeName) across all 318 recipes,
      it computes the same bucket key buildGrocery() would, and counts how
      many identities resolve to more than one bucket — the thing a cook
      actually sees as multiple quantity segments on one shopping-list row.

      That count is a RATCHET, not a fixed assertion: measured at 179 out of
      854 identities the day this file was written (208 before mc-units.js
      existed — see mc-units.js's own header for the two structural fixes
      that produced the difference). The gate fails if it goes UP — a new
      recipe using a unit or item this file doesn't know how to reconcile is
      exactly the case that should be visible in review, not silently
      absorbed. It's allowed to go DOWN freely as DENSITY/UNIT_WORD_ALIASES
      grow; lower the ceiling below when that happens so the ratchet keeps
      its teeth.

   Run: node tools/test-mc-units.js
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
let pass = 0, fail = 0;
function ok(name, cond) { if (cond) { pass++; } else { fail++; console.error('::error::' + name); } }
function eq(name, a, b) { ok(name + ' (got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b) + ')', a === b); }
function close(name, a, b, tol) { ok(name + ' (got ' + a + ', want ~' + b + ')', Math.abs(a - b) <= tol); }

// window === globalThis in this sandbox, exactly like a real browser — not
// `{ window: {} }` with a nested object. That distinction only matters once a
// second module bare-references a global another module set (mc-grocery.js
// reads `MCUnits` directly, matching this codebase's own convention — see
// e.g. cookbook-home.js's `var recipeIconHtml = MCCards.recipeIconHtml;`), so
// `window.X = …` must make bare `X` resolve too, the way it does in a browser.
function freshSandbox() {
  const sb = {};
  sb.window = sb;
  vm.createContext(sb);
  return sb;
}

function loadUnits() {
  const sb = freshSandbox();
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'mc-units.js'), 'utf8'), sb);
  return sb.MCUnits;
}
const U = loadUnits();

/* ── 1. Exact metric conversions — physical constants, not judgment calls ── */
{
  var g = U.unitInfo('g'), oz = U.unitInfo('oz');
  close('1a. 28.3495 g == 1 oz (within the wt family base)', g.f * 28.3495, oz.f, 0.001);
  var ml = U.unitInfo('ml'), tsp = U.unitInfo('tsp');
  close('1b. 4.92892 ml == 1 tsp (within the vol family base)', ml.f * 4.92892, tsp.f, 0.001);
  eq('1c. kg is 1000x g', U.unitInfo('kg').f, U.unitInfo('g').f * 1000);
  eq('1d. l is 1000x ml', U.unitInfo('l').f, U.unitInfo('ml').f * 1000);
  eq('1e. cup is still 48 tsp (unchanged from the original table)', U.unitInfo('cup').f, 48);
  eq('1f. lb is still 16 oz (unchanged)', U.unitInfo('lb').f, 16);
  ok('1g. an unrecognized unit returns null, not a guess', U.unitInfo('bushel') === null);
}

/* ── 2. Unit-word normalization — the fix for clove/cloves ────────────────
   Same normalized form regardless of plural/synonym spelling, so two
   identically-meant units land in the SAME bucket. */
{
  eq('2a. cloves -> clove', U.normalizeUnit('cloves'), 'clove');
  eq('2b. slices -> slice', U.normalizeUnit('slices'), 'slice');
  eq('2c. strip -> slice (explicit synonym, not a plural)', U.normalizeUnit('strip'), 'slice');
  eq('2d. strips -> slice', U.normalizeUnit('strips'), 'slice');
  eq('2e. sachets -> packet', U.normalizeUnit('sachets'), 'packet');
  eq('2f. leaves -> leaf', U.normalizeUnit('leaves'), 'leaf');
  // "pinch"/"pinches" are both literal UNIT_DEFS keys with the same {cls,f}
  // (a convertible unit's plural is handled the same way cup/cups always
  // was), so normalizeUnit legitimately returns each verbatim — what has to
  // hold is that they resolve to the SAME family conversion, which is what
  // actually puts them in one bucket.
  eq('2g. pinch and pinches resolve to the same vol factor',
    U.unitInfo(U.normalizeUnit('pinches')).f, U.unitInfo(U.normalizeUnit('pinch')).f);
  eq('2h. a convertible unit keeps its own literal form (cups, not cup)',
    U.normalizeUnit('cups'), 'cups');
  eq('2i. case-insensitive', U.normalizeUnit('CLOVES'), 'clove');
  eq('2j. blank stays blank', U.normalizeUnit(''), '');
  eq('2k. a parenthetical annotation is stripped before normalizing',
    U.normalizeUnit('can (7.5 oz)'), 'can');
  eq('2l. …so two differently-annotated cans merge to the same bucket',
    U.normalizeUnit('(24 oz) jars'), 'jar');
}

/* ── 3. Density lookups — curated, conservative, and silent when absent ──── */
{
  eq('3a. a garlic clove', U.densityGrams('garlic', 'clove'), 3);
  eq('3b. blank unit uses the item default', U.densityGrams('onion', ''), 110);
  eq('3c. a named size overrides the default', U.densityGrams('onion', 'small'), 70);
  eq('3d. "whole" is a count word too', U.densityGrams('lemon', 'whole'), 58);
  ok('3e. an item with no DENSITY entry returns null, never a guess',
    U.densityGrams('kumquat', 'medium') === null);
  ok('3f. a non-count unit on a known item still returns null (density is ONLY for counts)',
    U.densityGrams('onion', 'cup') === null);
  ok('3g. isCountWord recognizes the size vocabulary',
    U.isCountWord('') && U.isCountWord('small') && U.isCountWord('medium') &&
    U.isCountWord('large') && U.isCountWord('whole') && U.isCountWord('each'));
  ok('3h. isCountWord rejects a real measurement', !U.isCountWord('cup') && !U.isCountWord('tsp'));
}

/* ── 4. resolveUnit — the three-way outcome buildGrocery() bucket-keys on ── */
{
  var a = U.resolveUnit('flour', 'cup', 2);
  eq('4a. a convertible unit resolves to conv/vol', a.kind + '/' + a.cls, 'conv/vol');
  eq('4b. base is quantity * family factor', a.base, 2 * 48);

  var b = U.resolveUnit('onion', 'medium', 1);
  eq('4c. a density-covered count word resolves to conv/wt', b.kind + '/' + b.cls, 'conv/wt');
  ok('4d. …and is flagged as density-derived', b.viaDensity === true);
  close('4e. 1 medium onion ≈ 110 g in oz-base', b.base, 110 * U.OZ_PER_GRAM, 1e-6);

  var c = U.resolveUnit('flour', 'cup', 1);
  ok('4f. a real measurement is never flagged as density-derived', c.viaDensity === false);

  var d = U.resolveUnit('kumquat', 'medium', 2);
  eq('4g. a count word on an item with no density falls to the shared count bucket',
    d.kind, 'count');

  var e = U.resolveUnit('kumquat', 'wedge', 2);
  eq('4h. an unrecognized, non-count unit stays its own raw bucket', e.kind, 'raw');
  eq('4i. …normalized', e.unit, 'wedge');

  var f = U.resolveUnit('salt', 'to taste', null);
  eq('4j. a non-numeric quantity never enters a density lookup', f.kind, 'raw');
}

/* ── 5. Aisle model — category is read, never mutated ─────────────────────
   The four-value ingredient.category enum stays exactly as
   tools/validate-recipes.js expects; aisleFor() only DERIVES a display
   grouping from it plus the item's own name. */
{
  eq('5a. Produce stays Produce', U.aisleFor('Broccoli', 'Produce'), 'Produce');
  eq('5b. Dairy becomes Dairy & Eggs', U.aisleFor('Cheddar cheese', 'Dairy'), 'Dairy & Eggs');
  eq('5c. plain Meat becomes Meat & Poultry', U.aisleFor('Chicken breast', 'Meat'), 'Meat & Poultry');
  eq('5d. Meat + a seafood keyword becomes Seafood', U.aisleFor('Large shrimp', 'Meat'), 'Seafood');
  eq('5e. Pantry + a spice keyword becomes Spices & Seasonings',
    U.aisleFor('Smoked paprika', 'Pantry'), 'Spices & Seasonings');
  eq('5f. Pantry + a condiment keyword becomes Condiments & Sauces',
    U.aisleFor('Yellow mustard', 'Pantry'), 'Condiments & Sauces');
  eq('5g. plain Pantry falls to Dry Goods & Pantry', U.aisleFor('Jasmine rice', 'Pantry'), 'Dry Goods & Pantry');
  eq('5h. "frozen" wins regardless of category', U.aisleFor('Frozen green peas', 'Produce'), 'Frozen');
  eq('5i. …even for Meat', U.aisleFor('Frozen lightly breaded chicken bites', 'Meat'), 'Frozen');
  ok('5j. AISLE_ORDER puts Frozen last (thaw-last shopping order)',
    U.AISLE_ORDER[U.AISLE_ORDER.length - 1] === 'Frozen');
  ok('5k. AISLE_ORDER puts Produce first (perimeter shopping order)',
    U.AISLE_ORDER[0] === 'Produce');
}

/* ── 6. The ratchet: corpus-wide fragmentation must not regress ─────────── */
{
  const sb = freshSandbox();
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'recipes-data.js'), 'utf8'), sb);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'mc-units.js'), 'utf8'), sb);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'mc-grocery.js'), 'utf8'), sb);
  const MCU = sb.MCUnits, MCG = sb.MCGrocery;
  const RECIPES = sb.RECIPES;

  function parseQtyNumber(qty) {
    if (qty == null) return null;
    var s = String(qty).trim();
    var m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (m) return parseInt(m[1], 10) + parseInt(m[2], 10) / parseInt(m[3], 10);
    if ((m = s.match(/^(\d+)\/(\d+)$/))) return parseInt(m[1], 10) / parseInt(m[2], 10);
    if (/^-?\d*\.?\d+$/.test(s)) return parseFloat(s);
    return null;
  }

  // The same bucket key buildGrocery() computes, using the REAL
  // groceryMergeName so this measurement can't drift from production.
  const buckets = {};
  RECIPES.forEach((r) => {
    const by = r.ingredients_by_serving || {};
    const tier = by[Object.keys(by)[0]] || [];
    tier.forEach((ing) => {
      const item = (ing.item || '').trim();
      if (!item) return;
      const cat = ing.category || 'Other';
      const mergeName = MCG.groceryMergeName(item);
      const ikey = cat + '|' + mergeName;
      const num = parseQtyNumber(ing.quantity);
      const res = MCU.resolveUnit(mergeName, ing.unit || '', num);
      const bkey = res.kind === 'conv' ? 'cls:' + res.cls
        : res.kind === 'count' ? 'u:__count__'
        : 'u:' + res.unit;
      (buckets[ikey] = buckets[ikey] || new Set()).add(bkey);
    });
  });

  const totalIdentities = Object.keys(buckets).length;
  const fragmenting = Object.values(buckets).filter((s) => s.size > 1).length;

  const OLD_BASELINE = 208;         // pre-mc-units.js, same corpus, documented in CI-INITIATIVES.md
  const RATCHET_CEILING = 179;      // current measurement — lower this as DENSITY/aliases improve, never raise it

  console.log('  corpus fragmentation: ' + fragmenting + ' / ' + totalIdentities +
    ' identities resolve to >1 quantity bucket (was ' + OLD_BASELINE + ' before mc-units.js)');

  ok('6a. real improvement over the pre-initiative-2 baseline', fragmenting < OLD_BASELINE);
  ok('6b. does not regress past the ratchet ceiling — a new recipe introduced a unit/item ' +
    'this file cannot reconcile; either extend DENSITY/UNIT_WORD_ALIASES or, if it genuinely ' +
    "can't be fixed, lower nothing and raise the ceiling deliberately with a comment explaining why",
    fragmenting <= RATCHET_CEILING);
  ok('6c. identity count is sane (roughly the known corpus size)',
    totalIdentities > 800 && totalIdentities < 900);
}

console.log(fail
  ? 'test-mc-units: ' + fail + ' FAILED, ' + pass + ' passed'
  : 'test-mc-units: all ' + pass + ' assertions passed');
process.exit(fail ? 1 : 0);

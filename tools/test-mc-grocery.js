#!/usr/bin/env node
'use strict';
/* ==========================================================================
   test-mc-grocery.js — regression coverage for mc-grocery.js's `need` field,
   the pantry-quantity comparison feed added alongside mc-pantry.js's first
   UI slice (roadmap: "Real Pantry Inventory").

   Pinned here, not left to be discovered later by hand in cookbook-home.js:
   - A merged row with exactly one contributing bucket exposes a
     re-resolvable (qty, unit) `need` pair — for both a real vol/wt
     conversion bucket and a raw-unit bucket.
   - A row this file itself fragments across TWO unit families (the
     "genuinely harder" case mc-grocery.js's own header calls out) comes
     back `need: null` rather than guessing which bucket is "the" need.
   - The `need` pair round-trips through MCUnits.resolveUnit() to the exact
     same bucket buildGrocery() itself computed — asserted directly by
     feeding it straight into MCPantry.compare() end to end, not just
     checked in isolation.

   Run: node tools/test-mc-grocery.js
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
let pass = 0, fail = 0;
function ok(name, cond) { if (cond) { pass++; } else { fail++; console.error('::error::' + name); } }
function eq(name, a, b) { ok(name + ' (got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b) + ')', a === b); }
function approx(name, a, b, tol) {
  tol = tol == null ? 1e-6 : tol;
  ok(name + ' (got ' + a + ', want ~' + b + ')', typeof a === 'number' && Math.abs(a - b) < tol);
}

function loadApp() {
  const sb = {};
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'mc-units.js'), 'utf8'), sb);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'mc-pantry.js'), 'utf8'), sb);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'mc-grocery.js'), 'utf8'), sb);
  return sb;
}
const app = loadApp();
const G = app.MCGrocery;
const P = app.MCPantry;

/* ── Fixtures: fake recipes + a fake planned week ─────────────────────────
   buildGrocery() only calls recipeById() and planMeals() — see this file's
   own header ("five things from the host"), so those are the only two
   hooks this test needs to supply. */
const RECIPES = {
  r1: { recipe_id: 'r1', ingredients_by_serving: { serving_2: [
    { item: 'Olive Oil', quantity: '2', unit: 'tbsp', category: 'Pantry' }
  ] } },
  r2: { recipe_id: 'r2', ingredients_by_serving: { serving_2: [
    { item: 'Taco Seasoning', quantity: '1', unit: 'packet', category: 'Pantry' }
  ] } },
  // Same merge identity (category + "butter"), two different unit families
  // across two planned meals — buildGrocery() must fragment this into two
  // buckets on one row.
  r3a: { recipe_id: 'r3a', ingredients_by_serving: { serving_2: [
    { item: 'Butter', quantity: '2', unit: 'tbsp', category: 'Dairy' }
  ] } },
  r3b: { recipe_id: 'r3b', ingredients_by_serving: { serving_2: [
    { item: 'Butter', quantity: '4', unit: 'oz', category: 'Dairy' }
  ] } }
};
const PLAN = [
  { uid: 'u1', id: 'r1', serving: 2 },
  { uid: 'u2', id: 'r2', serving: 2 },
  { uid: 'u3', id: 'r3a', serving: 2 },
  { uid: 'u4', id: 'r3b', serving: 2 }
];
G.configure({
  recipeById: function (id) { return RECIPES[id] || null; },
  planMeals: function () { return PLAN; }
});

const cats = G.buildGrocery();
function findRow(item) {
  for (const c of cats) {
    const r = c.rows.filter(function (row) { return row.item === item; })[0];
    if (r) return r;
  }
  return null;
}

/* ── 1. Single conv bucket (vol) exposes a re-resolvable need ────────────── */
{
  const row = findRow('Olive Oil');
  ok('1a. Olive Oil row found', !!row);
  ok('1b. need is present for a single-bucket conv row', !!(row && row.need));
  eq('1c. need.unit is the vol base unit (tsp)', row.need.unit, 'tsp');
  approx('1d. need.qty is the base-unit amount (2 tbsp = 6 tsp)', row.need.qty, 6);

  // Round-trips through MCPantry.compare() exactly like the real bucket would.
  const enoughR = P.compare(G.groceryMergeName(row.item), row.need.qty, row.need.unit, 1, 'cup');
  eq('1e. 1 cup on hand covers a 2 tbsp need (round-tripped through `need`)', enoughR.status, 'enough');
  const shortR = P.compare(G.groceryMergeName(row.item), row.need.qty, row.need.unit, 1, 'tbsp');
  eq('1f. 1 tbsp on hand is short of a 2 tbsp need (round-tripped through `need`)', shortR.status, 'short');
}

/* ── 2. Single raw bucket exposes a re-resolvable need ────────────────────── */
{
  const row = findRow('Taco Seasoning');
  ok('2a. Taco Seasoning row found', !!row);
  ok('2b. need is present for a single-bucket raw row', !!(row && row.need));
  eq('2c. need.unit is the raw unit itself', row.need.unit, 'packet');
  eq('2d. need.qty is the summed amount', row.need.qty, 1);

  const shortR = P.compare(G.groceryMergeName(row.item), row.need.qty, row.need.unit, 0.5, 'packet');
  // 0.5 packets isn't a real input a cook would type, but proves the raw
  // family compares on the exact unit `need` carried through.
  eq('2e. round-tripped raw need compares correctly', shortR.status, 'short');
}

/* ── 3. A row fragmented across two unit families -> need: null ──────────── */
{
  const row = findRow('Butter');
  ok('3a. Butter row found', !!row);
  ok('3b. two buckets actually contributed (2 tbsp vol + 4 oz wt)', row && row.qty.indexOf('·') >= 0);
  eq('3c. need is null for a multi-bucket row — never guess which bucket is "the" need', row && row.need, null);
}

/* ── 4. prettyMeasure is exported for formatting a `short` amount ────────── */
{
  ok('4a. prettyMeasure is exported', typeof G.prettyMeasure === 'function');
  eq('4b. prettyMeasure formats a base-unit vol amount', G.prettyMeasure(6, 'vol'), '2 tbsp');
}

/* ── 5. groceryItemCount() is quantity-aware (roadmap §2.2 follow-up) ────── */
{
  const pantryKey = function (s) { return (s || '').trim().toLowerCase(); };

  // No pantry hooks at all -> the documented default ("no recorded
  // quantities") reproduces the original binary behavior: nothing is
  // marked a staple, so every row (Olive Oil, Taco Seasoning, Butter)
  // still needs buying.
  G.configure({ loadPantry: function () { return new Set(); }, loadPantryQty: function () { return {}; }, pantryKey: pantryKey });
  eq('5a. no pantry data at all -> every row counts', G.groceryItemCount(), 3);

  // Olive oil marked a staple with NO recorded quantity -> falls back to
  // the original "any staple flag suppresses the row" behavior.
  G.configure({
    loadPantry: function () { return new Set([pantryKey('Olive Oil')]); },
    loadPantryQty: function () { return {}; }
  });
  eq('5b. staple with no recorded quantity is still suppressed (binary fallback)', G.groceryItemCount(), 2);

  // Olive oil marked a staple WITH a recorded amount that's short of the
  // week's actual need (need is 6 tsp / 2 tbsp; only 1 tsp on hand) ->
  // quantity-aware: still counts, doesn't silently disappear.
  G.configure({
    loadPantry: function () { return new Set([pantryKey('Olive Oil')]); },
    loadPantryQty: function () { return { 'olive oil': { qty: 1, unit: 'tsp' } }; }
  });
  eq('5c. staple recorded SHORT of the need still counts', G.groceryItemCount(), 3);

  // Same staple, but the recorded amount actually covers the week's need
  // (1 cup on hand vs. a 2 tbsp need) -> suppressed, same as the binary case.
  G.configure({
    loadPantry: function () { return new Set([pantryKey('Olive Oil')]); },
    loadPantryQty: function () { return { 'olive oil': { qty: 1, unit: 'cup' } }; }
  });
  eq('5d. staple recorded ENOUGH for the need is suppressed', G.groceryItemCount(), 2);

  // Butter is the multi-bucket row (need: null) — even with a real
  // recorded quantity, there's nothing to compare against, so it falls
  // back to the binary staple check rather than guessing.
  G.configure({
    loadPantry: function () { return new Set([pantryKey('Butter')]); },
    loadPantryQty: function () { return { butter: { qty: 1, unit: 'oz' } }; }
  });
  eq('5e. a need:null row (fragmented across unit families) falls back to binary', G.groceryItemCount(), 2);

  // Reset to the defaults so this file's own module-load-order doesn't leak
  // pantry state into any test appended after this block in the future.
  G.configure({ loadPantry: function () { return new Set(); }, loadPantryQty: function () { return {}; } });
}

console.log(`test-mc-grocery: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);

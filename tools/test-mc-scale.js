#!/usr/bin/env node
'use strict';
/* ==========================================================================
   test-mc-scale.js — regression coverage for mc-scale.js, the bi-directional
   macro/ingredient scaling engine (FLAGSHIP_COOKBOOK_ROADMAP.md §2.4).

   Pinned here:
   - No target fields at all -> null (nothing to solve for), not a bogus
     scale of 0 or 1.
   - Protein-first priority when multiple targets are given, even when
     calories is listed first in the target object.
   - A recipe with no usable data for the driver field can't be solved ->
     scale stays null rather than dividing by a missing/zero value.
   - The honesty constraint: a target combination whose ratios don't match
     the recipe's own macro ratios comes back `exact: false` with the real
     achieved numbers, never silently presented as a match.
   - A target combination that DOES match the recipe's ratios (scaling a
     recipe's own per-serving profile by a whole number) comes back exact.

   Run: node tools/test-mc-scale.js
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
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'mc-scale.js'), 'utf8'), sb);
  return sb;
}
const app = loadApp();
const S = app.MCScale;

const RECIPE = {
  native_serving: 2,
  macro_profiles: {
    serving_2: { calories: 400, protein_g: 40, fat_g: 15, carbs_g: 20 },
    serving_4: { calories: 400, protein_g: 40, fat_g: 15, carbs_g: 20 }
  }
};

/* ── 1. Nothing to solve for ─────────────────────────────────────────────── */
{
  eq('1a. no target fields -> null', S.solveScaleForTarget(RECIPE, 2, {}), null);
  eq('1b. null target -> null', S.solveScaleForTarget(RECIPE, 2, null), null);
  eq('1c. blank-string target fields -> null', S.solveScaleForTarget(RECIPE, 2, { protein_g: '' }), null);
}

/* ── 2. A single target, exact by construction ───────────────────────────── */
{
  const r = S.solveScaleForTarget(RECIPE, 2, { protein_g: 60 }); // 1.5x
  eq('2a. driver is protein_g', r.driver, 'protein_g');
  approx('2b. scale is 1.5', r.scale, 1.5);
  approx('2c. achieved calories scales with it', r.achieved.calories, 600);
  approx('2d. achieved carbs scales with it', r.achieved.carbs_g, 30);
  eq('2e. a single-field target is always exact', r.exact, true);
}

/* ── 3. Protein-first priority, regardless of key order in the target ────── */
{
  const r = S.solveScaleForTarget(RECIPE, 2, { calories: 4000, protein_g: 80 }); // calories would be 10x, protein is 2x
  eq('3a. protein_g wins over calories as the driver', r.driver, 'protein_g');
  approx('3b. scale follows protein, not calories', r.scale, 2);
}

/* ── 4. Multi-target that matches the recipe's own ratio -> exact ────────── */
{
  // Recipe's real ratio at 2x is calories:800, protein:80 — matches exactly.
  const r = S.solveScaleForTarget(RECIPE, 2, { protein_g: 80, calories: 800 });
  eq('4a. matching ratio -> exact', r.exact, true);
}

/* ── 5. Multi-target that does NOT match the recipe's ratio -> honest miss ── */
{
  // Protein target implies 2x (achieved calories 800), but calories target
  // asks for 500 — the two can't both be hit by one linear scale.
  const r = S.solveScaleForTarget(RECIPE, 2, { protein_g: 80, calories: 500 });
  eq('5a. driver is still protein_g (priority order)', r.driver, 'protein_g');
  approx('5b. scale follows the driver only', r.scale, 2);
  approx('5c. achieved calories is the real (missed) result, not the target', r.achieved.calories, 800);
  eq('5d. mismatched secondary target -> not exact', r.exact, false);
}

/* ── 6. No usable data for the driver field ──────────────────────────────── */
{
  const noProtein = { native_serving: 2, macro_profiles: { serving_2: { calories: 400 } } };
  const r = S.solveScaleForTarget(noProtein, 2, { protein_g: 40 });
  eq('6a. missing driver data -> scale stays null', r.scale, null);
  eq('6b. no achieved numbers either', r.achieved, null);
  eq('6c. not exact', r.exact, false);

  const zeroProtein = { native_serving: 2, macro_profiles: { serving_2: { calories: 400, protein_g: 0 } } };
  const r2 = S.solveScaleForTarget(zeroProtein, 2, { protein_g: 40 });
  eq('6d. zero driver data -> scale stays null (no divide-by-zero)', r2.scale, null);
}

/* ── 7. A macro-free recipe (user-authored, empty macro_profiles) ───────── */
{
  const macroFree = { native_serving: 2, macro_profiles: { serving_2: {}, serving_4: {} } };
  const r = S.solveScaleForTarget(macroFree, 2, { calories: 500 });
  eq('7a. no data at all -> scale stays null', r.scale, null);
}

console.log(`test-mc-scale: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);

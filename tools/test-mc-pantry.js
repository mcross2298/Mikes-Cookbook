#!/usr/bin/env node
'use strict';
/* ==========================================================================
   test-mc-pantry.js — regression coverage for mc-pantry.js, the pantry
   quantity comparison engine (first slice of FLAGSHIP_COOKBOOK_ROADMAP.md's
   "Real Pantry Inventory + Dynamic Substitution").

   Pinned here, not left to be discovered later by the UI-wiring slice:
   - The fourth state ("unquantified") is genuinely different from "short"
     and must never be produced by treating a missing quantity as zero.
   - Comparison reuses mc-units.js's real resolveUnit() — including its
     density bridge (a real "N cloves garlic" case) and its "leave it
     fragmented rather than guess" honesty for a genuine unit-family
     mismatch (a raw-unit case and a conv-vs-count case both must come back
     "unknown", not a wrong number).
   - The "short" amount's shape differs by which family the two sides
     resolved into (conv → {base, cls}; raw/count → {qty, unit}) — both are
     exercised so a UI-wiring slice built against only one shape doesn't
     silently mishandle the other.

   Run: node tools/test-mc-pantry.js
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
  return sb;
}
const app = loadApp();
const P = app.MCPantry;
const OZ_PER_GRAM = app.MCUnits.OZ_PER_GRAM;

/* ── 1. The fourth state: unquantified is not zero ───────────────────────── */
{
  const r = P.compare('salt', 2, 'tsp', null, null);
  eq('1a. no recorded pantry quantity -> "unquantified", not "short"', r.status, 'unquantified');
  eq('1b. unquantified carries no short amount', r.short, null);
}

/* ── 2. An unparseable recipe requirement can't be compared either ───────── */
{
  const r = P.compare('salt', null, 'to taste', 5, 'tsp');
  eq('2a. no recipe quantity -> "unknown"', r.status, 'unknown');
}

/* ── 3. Real vol/wt conversion (mc-units.js's UNIT_DEFS, not density) ────── */
{
  const enoughR = P.compare('olive oil', 2, 'tbsp', 1, 'cup'); // 1 cup = 48 tsp, 2 tbsp = 6 tsp
  eq('3a. 1 cup on hand covers a 2 tbsp need', enoughR.status, 'enough');

  const shortR = P.compare('olive oil', 3, 'tbsp', 1, 'tbsp'); // need 9 tsp, have 3 tsp
  eq('3b. 1 tbsp on hand is short of a 3 tbsp need', shortR.status, 'short');
  eq('3c. short amount is in the vol family', shortR.short && shortR.short.cls, 'vol');
  approx('3d. short amount is exactly the 6 tsp difference', shortR.short && shortR.short.base, 6);
}

/* ── 4. Density-bridged count->weight (mc-units.js's DENSITY table) ─────── */
{
  // garlic: {clove: 3, default: 3} grams per clove.
  const shortR = P.compare('garlic', 3, 'clove', 1, 'clove'); // need 9g, have 3g
  eq('4a. 1 clove on hand is short of a 3-clove need', shortR.status, 'short');
  eq('4b. short amount is in the weight family (density-bridged)', shortR.short && shortR.short.cls, 'wt');
  approx('4c. short amount is exactly the 6g difference, in oz base units',
    shortR.short && shortR.short.base, 6 * OZ_PER_GRAM, 1e-9);

  const enoughR = P.compare('onion', 1, 'medium', 2, 'medium'); // need 110g, have 220g
  eq('4d. 2 medium onions on hand covers a 1-medium need', enoughR.status, 'enough');
}

/* ── 5. Raw units with no conversion family at all ───────────────────────── */
{
  const shortR = P.compare('taco seasoning', 2, 'packet', 1, 'packet');
  eq('5a. 1 packet on hand is short of a 2-packet need', shortR.status, 'short');
  eq('5b. short amount carries the raw unit itself', shortR.short && shortR.short.unit, 'packet');
  eq('5c. short qty is the plain difference', shortR.short && shortR.short.qty, 1);

  const enoughR = P.compare('taco seasoning', 1, 'packet', 3, 'packet');
  eq('5d. more packets on hand than needed -> enough', enoughR.status, 'enough');
}

/* ── 6. Bare counts with no density entry at all ─────────────────────────── */
{
  const shortR = P.compare('gadget', 3, '', 1, '');
  eq('6a. bare counts with no density data still compare, as pure counts', shortR.status, 'short');
  eq('6b. short amount for a pure count has no unit', shortR.short && shortR.short.unit, null);
  eq('6c. short qty is the plain difference', shortR.short && shortR.short.qty, 2);
}

/* ── 7. Genuine incomparability — mc-units.js's own honesty posture ──────── */
{
  const rawVsRaw = P.compare('salsa', 1, 'jar', 1, 'container');
  eq('7a. two different raw units cannot be compared -> "unknown"', rawVsRaw.status, 'unknown');

  const convVsCount = P.compare('gadget', 2, 'cup', 1, ''); // a real vol unit vs a bare, density-less count
  eq('7b. a real measurement vs. an unrelated bare count -> "unknown"', convVsCount.status, 'unknown');
}

console.log(`test-mc-pantry: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);

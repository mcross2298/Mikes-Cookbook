#!/usr/bin/env node
'use strict';
/* ==========================================================================
   test-mc-timeline.js — regression coverage for mc-timeline.js's pure
   critical-path math, computeTimeline() (FLAGSHIP_COOKBOOK_ROADMAP.md §2.3,
   Multi-Dish Cook Timeline Synchronizer).

   Pinned here, against hand-computed expected schedules:
   - The longest single dish anchors the target: it starts earliest (soonest
     start time), everything else gets a shorter lead.
   - Every dish's own start time is exactly (target - itsTotalMins), not a
     relative offset from another dish — verified against hand math, not
     just "smaller dishes start later than the anchor."
   - Output is sorted earliest-start-first, and `anchorId` names the dish
     that actually IS earliest, not just the one with the biggest totalMins
     (same thing here, but the contract is "earliest start", not "biggest
     total" — worth pinning as its own fact).
   - A dish with no usable totalMins (missing, zero, or negative) is routed
     to `manual`, never silently dropped or given a fabricated start time.
   - An all-manual dish list produces an empty schedule, not a crash.
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
let pass = 0, fail = 0;
function ok(name, cond) { if (cond) { pass++; } else { fail++; console.error('::error::' + name); } }
function eq(name, a, b) { ok(name + ' (got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b) + ')', a === b); }

function loadApp() {
  const sb = { localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} } };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'mc-timeline.js'), 'utf8'), sb);
  return sb;
}
const app = loadApp();
const T = app.MCTimeline.computeTimeline;

const TARGET = Date.UTC(2026, 8, 2, 18, 30); // 2026-09-02 18:30 UTC, an arbitrary fixed instant

/* ── 1. Basic back-timing: longest dish anchors, starts earliest ────────── */
{
  const dishes = [
    { recipeId: 'roast', title: 'Pot Roast', icon: '🍖', totalMins: 90 },
    { recipeId: 'mash', title: 'Mashed Potatoes', icon: '🥔', totalMins: 30 },
    { recipeId: 'beans', title: 'Green Beans', icon: '🫛', totalMins: 15 }
  ];
  const r = T(dishes, TARGET);
  eq('1a. all three dishes scheduled, none manual', r.dishes.length, 3);
  eq('1b. anchor is the 90-minute roast', r.anchorId, 'roast');
  eq('1c. sorted earliest-start-first: roast, mash, beans',
    r.dishes.map(d => d.recipeId).join(','), 'roast,mash,beans');
  eq('1d. roast starts exactly 90 min before target', r.dishes[0].startAt, TARGET - 90 * 60000);
  eq('1e. mash starts exactly 30 min before target', r.dishes[1].startAt, TARGET - 30 * 60000);
  eq('1f. beans starts exactly 15 min before target', r.dishes[2].startAt, TARGET - 15 * 60000);
  eq('1g. no manual entries', r.manual.length, 0);
}

/* ── 2. A dish with no timing data is routed to manual, not scheduled ───── */
{
  const dishes = [
    { recipeId: 'steak', title: 'Steak', icon: '🥩', totalMins: 25 },
    { recipeId: 'salad', title: "Grandma's Salad", icon: '🥗', totalMins: 0 },
    { recipeId: 'sauce', title: 'Pan Sauce', icon: null, totalMins: null }
  ];
  const r = T(dishes, TARGET);
  eq('2a. only the steak gets a schedule', r.dishes.length, 1);
  eq('2b. steak is the anchor by default (only scheduled dish)', r.anchorId, 'steak');
  eq('2c. the zero-duration and null-duration dishes both land in manual', r.manual.length, 2);
  eq('2d. manual entries keep their title (for display)', r.manual[0].title, "Grandma's Salad");
}

/* ── 3. All dishes lack timing data -> empty schedule, no crash ─────────── */
{
  const dishes = [
    { recipeId: 'a', title: 'A', totalMins: 0 },
    { recipeId: 'b', title: 'B', totalMins: undefined }
  ];
  const r = T(dishes, TARGET);
  eq('3a. empty schedule', r.dishes.length, 0);
  eq('3b. both routed to manual', r.manual.length, 2);
  eq('3c. no anchor', r.anchorId, null);
}

/* ── 4. A tie in totalMins keeps a stable, deterministic order ──────────── */
{
  const dishes = [
    { recipeId: 'x', title: 'X', totalMins: 20 },
    { recipeId: 'y', title: 'Y', totalMins: 20 }
  ];
  const r = T(dishes, TARGET);
  eq('4a. both scheduled at the same start time', r.dishes[0].startAt, r.dishes[1].startAt);
  eq('4b. original relative order preserved for a tie', r.dishes.map(d => d.recipeId).join(','), 'x,y');
}

console.log(`test-mc-timeline: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);

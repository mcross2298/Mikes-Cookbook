#!/usr/bin/env node
'use strict';
/* ==========================================================================
   test-mc-sync-merge.js — regression coverage for mc-sync.js's real
   sync-conflict merge functions (roadmap B5, cookbook-bridge-roadmap.md in
   4-Weeks-to-Open-). mc-sync.js is a browser IIFE guarded by
   `if (window.__mcSync) return;` etc., so it can't be require()'d directly
   in plain Node (no `window` global -> ReferenceError on that guard line,
   which would abort evaluation before module.exports could be read).

   Instead this sandboxes the ACTUAL source file with vm (same technique as
   4-Weeks-to-Open-'s test-mc-bridge.js / test-mc-sync-merge.js), providing a
   fake window/localStorage/MC_SB so the guards resolve to an early return,
   plus a real `module` object. The file's own module.exports hook (added
   right before the guards, exploiting function-declaration hoisting) runs
   first and captures the merge functions — so these tests exercise the real
   implementation, never a duplicated copy that could drift.

   Run: node tools/test-mc-sync-merge.js
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = fs.readFileSync(path.resolve(__dirname, '../mc-sync.js'), 'utf8');

let pass = 0, fail = 0;
function ok(name, cond) { if (cond) { pass++; } else { fail++; console.error('::error::' + name); } }
function eq(name, a, b) { ok(name, JSON.stringify(a) === JSON.stringify(b)); }

function loadMerge() {
  const sandbox = {
    module: { exports: {} },
    window: { __mcSync: false, MC_SB: null },
    document: { addEventListener: function () {} },
    localStorage: { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} },
    sessionStorage: { getItem: function () { return null; }, setItem: function () {} },
    setInterval: function () {},
    location: {}
  };
  vm.createContext(sandbox);
  vm.runInContext(SRC, sandbox);
  return sandbox.module.exports;
}

const M = loadMerge();
ok('module.exports captured all 6 merge fns', !!(M && M.mergeMacros && M.mergeArrayByField &&
  M.mergePlan && M.mergeStringSet && M.mergeHistoryBySavedAt && M.mergeCookedByRecipe));

// ---- mergeMacros: scalar by top-level ts; per-day entries union by id,
//      greater entry.ts wins (identical contract to the workout app's copy,
//      since mc_macros_v1 is the one store both apps write) ----------------
{
  const local = {
    ts: 100, profile: { local: true }, goals: { kcal: 2000 },
    days: { '2026-01-01': { entries: [{ id: 'e1', kcal: 500, ts: 1 }] } }
  };
  const remote = {
    ts: 200, profile: { remote: true }, goals: { kcal: 2400 },
    days: { '2026-01-01': { entries: [{ id: 'e1', kcal: 600, ts: 2 }, { id: 'e2', kcal: 300, ts: 1 }] } }
  };
  const out = M.mergeMacros(local, remote);
  eq('macros: scalar goals from newer top-level ts (remote)', out.goals, { kcal: 2400 });
  const day = out.days['2026-01-01'].entries;
  eq('macros: same-id entry resolved by greater entry.ts', day.find(e => e.id === 'e1').kcal, 600);
  ok('macros: remote-only entry unioned in', day.some(e => e.id === 'e2'));
}

// ---- mergeArrayByField: generic union-by-field, first occurrence wins ----
{
  const local = [{ uid: 'a', v: 1 }, { uid: 'b', v: 1 }];
  const remote = [{ uid: 'b', v: 2 }, { uid: 'c', v: 1 }];
  const out = M.mergeArrayByField(local, remote, 'uid');
  eq('arrayByField: union of ids', out.map(e => e.uid), ['a', 'b', 'c']);
  eq('arrayByField: local copy wins on conflict', out.find(e => e.uid === 'b').v, 1);
}

// ---- mergePlan: meals array merged by uid ---------------------------------
{
  const local = { meals: [{ uid: 'm1', day: 'Mon' }] };
  const remote = { meals: [{ uid: 'm1', day: 'Mon' }, { uid: 'm2', day: 'Tue' }] };
  const out = M.mergePlan(local, remote);
  eq('plan: meals unioned by uid', out.meals.map(m => m.uid), ['m1', 'm2']);
}

// ---- mergeStringSet: union + dedupe ---------------------------------------
{
  const out = M.mergeStringSet(['a', 'b'], ['b', 'c']);
  eq('stringSet: union+dedupe preserves first-seen order', out, ['a', 'b', 'c']);
}

// ---- mergeHistoryBySavedAt: archival snapshots, union by savedAt ----------
{
  const local = [{ savedAt: 1, label: 'Week 1' }];
  const remote = [{ savedAt: 1, label: 'Week 1' }, { savedAt: 2, label: 'Week 2' }];
  const out = M.mergeHistoryBySavedAt(local, remote);
  eq('historyBySavedAt: unioned, no dup for same savedAt', out.map(h => h.savedAt), [1, 2]);
}

// ---- mergeCookedByRecipe: normalizes legacy string entries, unions by `at` --
{
  const local = { 'r1': ['2026-01-01T00:00:00Z'] }; // legacy bare-string entry
  const remote = { 'r1': [{ at: '2026-01-01T00:00:00Z', photo: null }, { at: '2026-01-02T00:00:00Z', photo: 'p.jpg' }] };
  const out = M.mergeCookedByRecipe(local, remote);
  eq('cookedByRecipe: legacy string normalized + deduped against object form', out.r1.length, 2);
  ok('cookedByRecipe: remote-only entry with photo present', out.r1.some(e => e.photo === 'p.jpg'));
}
{
  const local = {};
  const remote = { 'r2': [{ at: '2026-01-01T00:00:00Z', photo: null }] };
  const out = M.mergeCookedByRecipe(local, remote);
  ok('cookedByRecipe: remote-only recipe id added', out.r2 && out.r2.length === 1);
}

if (fail) { console.error(`\ntest-mc-sync-merge: ${pass} passed, ${fail} FAILED`); process.exit(1); }
console.log(`test-mc-sync-merge: all ${pass} assertions passed`);

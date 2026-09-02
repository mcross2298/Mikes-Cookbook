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

const flush = () => new Promise((r) => setImmediate(r));

// C2 regression: a failed local write during pull() must never advance that
// key's snapshot, and push() must never upload the stale local value over
// what the server already has for a blocked key. Unlike loadMerge() above,
// this needs the module past its `MC_SB.configured` guard — pull/push/
// snapshot/blocked only exist once that guard passes — so it supplies a
// working fake MC_SB + Supabase client instead of loadMerge()'s
// `MC_SB: null` short-circuit, and drives the module's own real init chain
// (MC_SB.ready -> currentUser -> start() -> pull().then(push)) rather than
// calling pull()/push() itself, so this exercises the actual startup path.
async function loadSyncCycle(remoteRows, throwOnKeys, initialStore) {
  const store = Object.assign({}, initialStore); // fake localStorage backing
  const pushedOps = [];
  const fakeClient = {
    from: function () {
      return {
        select: function () {
          return { eq: function () { return Promise.resolve({ data: remoteRows, error: null }); } };
        },
        upsert: function (row) {
          pushedOps.push(row);
          return Promise.resolve({ error: null });
        }
      };
    }
  };
  // mc-sync.js reads both `window.MC_SB` and the bare `MC_SB` (true in a
  // real page, since `window` IS the global object there — assigning
  // window.MC_SB also creates the bare binding). This sandbox's `window` is
  // just a plain object, not the actual global, so both need to point at
  // the same object explicitly or the bare reference throws.
  const mcSB = {
    configured: true,
    ready: Promise.resolve(fakeClient),
    currentUser: function () { return Promise.resolve({ id: 'u1' }); }
  };
  const sandbox = {
    module: { exports: {} },
    MC_SB: mcSB,
    window: { __mcSync: false, MC_SB: mcSB, addEventListener: function () {} },
    document: { addEventListener: function () {} },
    localStorage: {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
      setItem: function (k, v) {
        if (throwOnKeys.indexOf(k) >= 0) throw new Error('QuotaExceededError');
        store[k] = v;
      },
      removeItem: function (k) { delete store[k]; }
    },
    sessionStorage: { getItem: function () { return null; }, setItem: function () {} },
    setInterval: function () { return 0; },
    setTimeout: setTimeout, clearTimeout: clearTimeout,
    console: console,
    location: {}
  };
  sandbox.window.MC_SB.client = fakeClient;
  vm.createContext(sandbox);
  vm.runInContext(SRC, sandbox);
  // Let the module's own MC_SB.ready -> currentUser -> start() ->
  // pull().then(push) chain fully settle — every link is an already-
  // resolved Promise, so a handful of ticks is enough (mirrors the `flush`
  // pattern tools/test-sw-strategy.js uses for the same reason).
  for (let i = 0; i < 20; i++) await flush();
  return { M: sandbox.module.exports, store: store, pushedOps: pushedOps };
}

const M = loadMerge();
ok('module.exports captured all 8 merge fns', !!(M && M.mergeMacros && M.mergeArrayByField &&
  M.mergePlan && M.mergeStringSet && M.mergeHistoryBySavedAt && M.mergeCookedByRecipe &&
  M.mergeReplaceByTs && M.mergeMapByTs));

// ---- whitelist membership (audit C-02) ------------------------------------
// The merge functions were never the problem for favorites and pantry — the
// gap was that neither store was in STORES at all, so nothing ever called a
// merge on them. STORES is a private closure var, so assert against the real
// source text: a future edit that drops one of these should fail here rather
// than quietly un-sync a cook's hearts again.
{
  const stores = SRC.slice(SRC.indexOf('var STORES = {'), SRC.indexOf('var CONSUME = {'));
  [
    'mc_macros_v1', 'mc-cookbook:mealplan', 'mc-cookbook:mealplan:grocery',
    'mc-cookbook:mealplan:history', 'mc-cookbook:mealplan:custom',
    'mc-cookbook:mealplan:macrohistory', 'mc-cookbook:userrecipes',
    'mc-cookbook:cooked', 'mc-cookbook:favorites', 'mc-cookbook:pantry',
    'mc-cookbook:timecheck', 'mc-cookbook:pantryqty'
  ].forEach((key) => ok('STORES whitelist includes ' + key, stores.includes("'" + key + "'")));
  // Never push a store this app only consumes — one writer per store.
  ok('STORES excludes the workout app\'s mc_activity', !stores.includes("'mc_activity'"));
  ok('STORES excludes the workout app\'s mc_workout_log_v1', !stores.includes("'mc_workout_log_v1'"));
  // Image data has no business in a jsonb sync row.
  ok('STORES excludes mc-cookbook:photos', !stores.includes("'mc-cookbook:photos'"));
}

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

// ---- audit C-02: favorites + pantry now ride the same stringSet strategy.
//      Both are Array.from(Set) id lists, so a true cross-device conflict
//      (each phone favorited something different while offline) has to
//      resolve as a union — losing either side would be the bug. --------------
{
  const phoneA = ['chili-verde', 'steak-bowl'];
  const phoneB = ['steak-bowl', 'carnitas'];
  const out = M.mergeStringSet(phoneA, phoneB);
  eq('favorites: divergent devices union, no favorite lost',
    out.sort(), ['carnitas', 'chili-verde', 'steak-bowl']);
}
{
  // First sync from a device that has never pushed: remote is absent/empty.
  eq('favorites: empty remote keeps every local favorite',
    M.mergeStringSet(['chili-verde'], []), ['chili-verde']);
  eq('favorites: empty local adopts the whole remote set',
    M.mergeStringSet([], ['chili-verde']), ['chili-verde']);
  eq('favorites: a non-array store degrades to empty, never throws',
    M.mergeStringSet(null, undefined), []);
}
{
  // Pantry keys are lowercased free text, not slugs — make sure spaces and
  // duplicates across devices behave.
  const out = M.mergeStringSet(['salt', 'olive oil'], ['olive oil', 'black pepper']);
  eq('pantry: staples union without duplicating a multi-word key',
    out, ['salt', 'olive oil', 'black pepper']);
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

// ---- mergeReplaceByTs: mc-cookbook:timecheck — whole-object last-write-wins
{
  const local = { scopeKey: 'all', days: { Mon: 'quick' }, ts: 100 };
  const remote = { scopeKey: 'all', days: { Mon: 'standard', Tue: 'none' }, ts: 200 };
  eq('replaceByTs: newer remote replaces local wholesale',
    M.mergeReplaceByTs(local, remote), remote);
  eq('replaceByTs: newer local wins over stale remote',
    M.mergeReplaceByTs(remote, local), remote);
}
{
  // Equal ts (e.g. two devices racing the same instant) — remote wins by
  // convention, same tie-break direction mergeMacros uses (rts > lts keeps
  // local only on a strict loss, so a tie already favors remote there too).
  const local = { scopeKey: 'all', days: { Mon: 'quick' }, ts: 100 };
  const remote = { scopeKey: 'all', days: { Mon: 'none' }, ts: 100 };
  eq('replaceByTs: a tie favors remote', M.mergeReplaceByTs(local, remote), remote);
}
{
  // Pre-migration data with no ts at all defaults to 0, so any real write —
  // even one with ts 0 explicitly — is treated as at least as new.
  const local = { scopeKey: 'all', days: { Mon: 'quick' } }; // no ts field
  const remote = { scopeKey: 'all', days: { Mon: 'standard' }, ts: 0 };
  eq('replaceByTs: a ts-less local loses to any ts\'d remote',
    M.mergeReplaceByTs(local, remote), remote);
}
{
  eq('replaceByTs: missing local/remote degrade to {}, never throw',
    M.mergeReplaceByTs(null, undefined), {});
}

// ---- mergeMapByTs: mc-cookbook:pantryqty — per-KEY last-write-wins on a
//      flat map, unlike replaceByTs's whole-object rule above. The real
//      scenario this exists for: two devices each set a DIFFERENT staple's
//      quantity while offline — a whole-object strategy would have
//      whichever device happened to sync last silently discard the other's
//      edit to an entirely unrelated ingredient. --------------------------
{
  const local = { salt: { qty: 1, unit: 'box', ts: 100 }, eggs: { qty: 6, unit: '', ts: 300 } };
  const remote = { salt: { qty: 2, unit: 'box', ts: 200 }, garlic: { qty: 1, unit: 'clove', ts: 150 } };
  const out = M.mergeMapByTs(local, remote);
  eq('mapByTs: a key touched only locally survives untouched', out.eggs, local.eggs);
  eq('mapByTs: a key touched only remotely is adopted', out.garlic, remote.garlic);
  eq('mapByTs: a key on both sides resolves by the newer ts (remote here)', out.salt, remote.salt);
}
{
  // The mirror case: local has the newer ts for the conflicting key.
  const local = { flour: { qty: 5, unit: 'cup', ts: 500 } };
  const remote = { flour: { qty: 2, unit: 'cup', ts: 100 } };
  eq('mapByTs: a key on both sides resolves by the newer ts (local here)',
    M.mergeMapByTs(local, remote).flour, local.flour);
}
{
  eq('mapByTs: missing local/remote degrade to {}, never throw',
    M.mergeMapByTs(null, undefined), {});
  eq('mapByTs: empty remote keeps every local entry',
    M.mergeMapByTs({ salt: { qty: 1, unit: null, ts: 1 } }, {}),
    { salt: { qty: 1, unit: null, ts: 1 } });
}

// ---- C2: a failed local write during pull() must not clobber good remote
// data on the next push() -----------------------------------------------
(async () => {
  // Two owned stores come back from the server. Favorites' local write will
  // succeed; pantry's is rigged to throw QuotaExceededError, simulating a
  // full quota mid-pull.
  // Local has a recipe id ("z") the server doesn't have yet, so the union
  // merge genuinely differs from the raw remote value — otherwise cur would
  // equal snapshot post-merge and push() would (correctly) no-op, which
  // would make "push() uploaded favorites" pass for the wrong reason.
  const remoteRows = [
    { store_key: 'mc-cookbook:favorites', data: ['a', 'b'] },
    { store_key: 'mc-cookbook:pantry', data: ['salt', 'pepper'] }
  ];
  const { store, pushedOps } = await loadSyncCycle(
    remoteRows, ['mc-cookbook:pantry'],
    { 'mc-cookbook:favorites': '["a","z"]', 'mc-cookbook:pantry': '["salt"]' }
  );

  ok('C2: the un-blocked key (favorites) did get its merge written locally',
    store['mc-cookbook:favorites'] != null && store['mc-cookbook:favorites'] !== '["a","z"]');
  ok('C2: the blocked key (pantry) keeps its exact pre-pull value — the failed write never partially applied',
    store['mc-cookbook:pantry'] === '["salt"]');
  ok('C2: push() uploaded the successfully-merged favorites store',
    pushedOps.some((op) => op.store_key === 'mc-cookbook:favorites'));
  ok('C2 (the actual bug): push() never uploads the blocked key — the un-merged local value ' +
     'must not overwrite the remote merge that failed to apply on this device',
    !pushedOps.some((op) => op.store_key === 'mc-cookbook:pantry'));

  if (fail) { console.error(`\ntest-mc-sync-merge: ${pass} passed, ${fail} FAILED`); process.exit(1); }
  console.log(`test-mc-sync-merge: all ${pass} assertions passed`);
})();

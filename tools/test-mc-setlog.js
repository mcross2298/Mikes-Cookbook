#!/usr/bin/env node
'use strict';
/* ==========================================================================
   test-mc-setlog.js — the per-item add/remove log behind removal propagation
   (re-audit critical gap #01).

   The property under test is the one the re-audit measured failing: a
   REMOVAL on one device must survive a union merge with a second device
   that still holds the item. mc-sync.js's `stringSet` strategy is a pure
   union and cannot express that on its own; mc-setlog.js carries the
   per-item state and mc-sync.js's reconcileSetStores() subtracts it.

   What's pinned here:
   - diff() records only CHANGED ids, with the right on/off value.
   - `on:1` is load-bearing. A bare tombstone map cannot express
     remove-then-re-add, and test 5 fails against that simpler design.
   - Removal survives a union merge, and CONVERGES — the same answer no
     matter which device is `local` (the exact asymmetry that made the
     original bug permanent rather than transient).
   - prune() drops past the horizon and caps the log, oldest-first.
   - The real storage path (record()) writes through a fake localStorage,
     is a no-op when nothing changed, and doesn't stamp a failed write.

   Run: node tools/test-mc-setlog.js
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
let pass = 0, fail = 0;
function ok(name, cond) { if (cond) { pass++; } else { fail++; console.error('::error::' + name); } }
function eq(name, a, b) {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  ok(name + ' (got ' + A + ', want ' + B + ')', A === B);
}

// The pure half, via the module.exports hook (no window in this context).
const SL = require(path.join(ROOT, 'mc-setlog.js'));

// The merge half — the REAL mergeMapByTs from mc-sync.js, not a copy.
// Same fake-globals shape test-mc-sync-merge.js uses: the guards resolve to
// an early return, but the module.exports hook has already run by then.
const syncSandbox = {
  module: { exports: {} }, console,
  window: { __mcSync: false, MC_SB: null },
  document: { addEventListener: function () {} },
  localStorage: { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} },
  sessionStorage: { getItem: function () { return null; }, setItem: function () {} },
  setInterval: function () {},
  location: {}
};
vm.createContext(syncSandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'mc-sync.js'), 'utf8'), syncSandbox, { filename: 'mc-sync.js' });
const SYNC = syncSandbox.module.exports;
ok('mc-sync.js exposes mergeMapByTs + mergeStringSet', typeof SYNC.mergeMapByTs === 'function' && typeof SYNC.mergeStringSet === 'function');

const T = 1_700_000_000_000;

/* ── 1. diff records only what changed ─────────────────────────────────── */
eq('1a diff: a pure addition',
  SL.diff('fav', ['r1'], ['r1', 'r2'], T),
  { 'fav:r2': { on: 1, ts: T } });

eq('1b diff: a pure removal',
  SL.diff('fav', ['r1', 'r2'], ['r1'], T),
  { 'fav:r2': { on: 0, ts: T } });

eq('1c diff: unchanged set writes nothing',
  SL.diff('fav', ['r1', 'r2'], ['r2', 'r1'], T), {});

eq('1d diff: add and remove in one save',
  SL.diff('gro', ['milk', 'eggs'], ['eggs', 'bread'], T),
  { 'gro:bread': { on: 1, ts: T }, 'gro:milk': { on: 0, ts: T } });

ok('1e diff accepts a Set (what every save() actually passes)',
  JSON.stringify(SL.diff('pan', new Set(['salt']), new Set(['salt', 'pepper']), T)) ===
  JSON.stringify({ 'pan:pepper': { on: 1, ts: T } }));

/* ── 2. the bug, reproduced, then fixed ────────────────────────────────── */
// Phone un-checks milk. Laptop still has it. This is the exact case the
// re-audit ran against the shipped merge function.
const phoneGro = ['eggs'];
const laptopGro = ['milk', 'eggs'];
const union = SYNC.mergeStringSet(phoneGro, laptopGro);
ok('2a the union alone still resurrects milk (the bug is real, not hypothetical)',
  union.indexOf('milk') >= 0);

const phoneLog = SL.diff('gro', ['milk', 'eggs'], ['eggs'], T);   // the un-check
const laptopLog = {};                                             // laptop made no edit
const mergedLog = SYNC.mergeMapByTs(laptopLog, phoneLog);
eq('2b after reconciliation milk is gone',
  SL.applyRemovals(mergedLog, 'gro', union), ['eggs']);

// ...and it must be gone on BOTH devices. Merge order is the thing that made
// the original bug permanent: each device preferred its own copy forever.
const mergedLogOther = SYNC.mergeMapByTs(phoneLog, laptopLog);
const unionOther = SYNC.mergeStringSet(laptopGro, phoneGro);
const fromPhone = SL.applyRemovals(mergedLog, 'gro', union).slice().sort();
const fromLaptop = SL.applyRemovals(mergedLogOther, 'gro', unionOther).slice().sort();
eq('2c converges — same result whichever device is `local`', fromLaptop, fromPhone);
eq('2c-ii ...and that result is the un-checked list', fromLaptop, ['eggs']);

/* ── 3. favourites and pantry, the other two set stores ────────────────── */
{
  const favUnion = SYNC.mergeStringSet(['r1'], ['r1', 'r9']);      // r9 un-favourited locally
  const log = SYNC.mergeMapByTs({}, SL.diff('fav', ['r1', 'r9'], ['r1'], T));
  eq('3a un-favouriting propagates', SL.applyRemovals(log, 'fav', favUnion), ['r1']);

  const panUnion = SYNC.mergeStringSet(['salt'], ['salt', 'paprika']);
  const panLog = SYNC.mergeMapByTs({}, SL.diff('pan', ['salt', 'paprika'], ['salt'], T));
  eq('3b removing a pantry staple propagates', SL.applyRemovals(panLog, 'pan', panUnion), ['salt']);

  // kinds are namespaced — a removal in one store must not touch another
  eq('3c "r9" removed as a favourite does not touch a pantry item of the same id',
    SL.applyRemovals(log, 'pan', ['r1', 'r9']), ['r1', 'r9']);
}

/* ── 4. an item nobody has an entry for is left alone ──────────────────── */
eq('4 untouched ids (written before this store existed) survive reconciliation',
  SL.applyRemovals({}, 'fav', ['r1', 'r2', 'r3']), ['r1', 'r2', 'r3']);

/* ── 5. why `on:1` has to exist ────────────────────────────────────────── */
// Remove r9 at T, then re-add it at T+1000 on the other device. A bare
// tombstone map (no on:1) has nothing newer to out-date the tombstone, so
// the re-added item would be stripped straight back off. This is the test
// that rejects the simpler design.
{
  const removal = SL.diff('fav', ['r1', 'r9'], ['r1'], T);              // {fav:r9 on:0 @T}
  const readd   = SL.diff('fav', ['r1'], ['r1', 'r9'], T + 1000);       // {fav:r9 on:1 @T+1000}
  const merged  = SYNC.mergeMapByTs(removal, readd);
  eq('5a the newer re-add wins over the older removal', merged['fav:r9'], { on: 1, ts: T + 1000 });
  eq('5b and the item survives reconciliation',
    SL.applyRemovals(merged, 'fav', ['r1', 'r9']), ['r1', 'r9']);

  // ...and the reverse order still resolves to the newer edit.
  const merged2 = SYNC.mergeMapByTs(readd, removal);
  eq('5c remove-after-re-add: newest edit still wins', merged2['fav:r9'], { on: 1, ts: T + 1000 });

  const laterRemoval = SL.diff('fav', ['r1', 'r9'], ['r1'], T + 2000);
  eq('5d a removal newer than the re-add wins in turn',
    SL.applyRemovals(SYNC.mergeMapByTs(readd, laterRemoval), 'fav', ['r1', 'r9']), ['r1']);
}

/* ── 6. prune ──────────────────────────────────────────────────────────── */
{
  const DAY = 86400000;
  const log = {
    'fav:fresh': { on: 0, ts: T },
    'fav:stale': { on: 0, ts: T - (SL.PRUNE_DAYS + 1) * DAY },
    'fav:edge':  { on: 1, ts: T - (SL.PRUNE_DAYS - 1) * DAY }
  };
  const out = SL.prune(log, T);
  ok('6a an entry past the horizon is dropped', out['fav:stale'] === undefined);
  ok('6b an entry inside the horizon is kept', !!out['fav:fresh'] && !!out['fav:edge']);
  eq('6c prune does not mutate its input', Object.keys(log).length, 3);

  const big = {};
  for (let i = 0; i < SL.MAX_ENTRIES + 50; i++) big['fav:i' + i] = { on: 0, ts: T - i };
  const capped = SL.prune(big, T);
  eq('6d over the cap, the log is trimmed to MAX_ENTRIES', Object.keys(capped).length, SL.MAX_ENTRIES);
  ok('6e trimming keeps the NEWEST entries (a fresh removal must not be dropped first)',
    capped['fav:i0'] !== undefined && capped['fav:i' + (SL.MAX_ENTRIES + 49)] === undefined);

  ok('6f a malformed entry is discarded rather than crashing prune',
    Object.keys(SL.prune({ 'fav:x': null, 'fav:y': 'nope', 'fav:z': { on: 0, ts: T } }, T)).length === 1);
}

/* ── 7. the real storage path, through a fake localStorage ─────────────── */
{
  const store = {};
  let throwOnWrite = false;
  const sb = {
    console,
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { if (throwOnWrite) { const e = new Error('quota'); e.name = 'QuotaExceededError'; throw e; } store[k] = String(v); },
      removeItem: k => { delete store[k]; }
    }
  };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'mc-setlog.js'), 'utf8'), sb, { filename: 'mc-setlog.js' });
  const L = sb.window.MCSetLog;
  ok('7a mc-setlog.js publishes window.MCSetLog in a browser-shaped context', !!L);

  L.record('fav', new Set(['r1']), new Set(['r1', 'r2']), T);
  eq('7b record() writes the add through to storage',
    JSON.parse(store[L.KEY]), { 'fav:r2': { on: 1, ts: T } });

  L.record('fav', new Set(['r1', 'r2']), new Set(['r1']), T + 5);
  eq('7c a later removal overwrites the same entry',
    JSON.parse(store[L.KEY])['fav:r2'], { on: 0, ts: T + 5 });

  const before = store[L.KEY];
  const wrote = L.record('fav', new Set(['r1']), new Set(['r1']), T + 9);
  ok('7d an unchanged set is a no-op — no write, no churn', wrote === false && store[L.KEY] === before);

  throwOnWrite = true;
  let sawFail = null;
  L.onWriteFail = e => { sawFail = e; };
  const okWrite = L.record('fav', new Set([]), new Set(['r7']), T + 20);
  ok('7e a full quota reports false and fires onWriteFail rather than throwing',
    okWrite === false && sawFail && sawFail.name === 'QuotaExceededError');
  throwOnWrite = false;

  ok('7f a corrupt log reads back as empty instead of throwing',
    (store[L.KEY] = '{not json', Object.keys(L.load()).length === 0));
}

/* ── 8. KINDS maps to the three real store keys ────────────────────────── */
eq('8 KINDS names exactly the three set-shaped stores', SL.KINDS, {
  fav: 'mc-cookbook:favorites',
  pan: 'mc-cookbook:pantry',
  gro: 'mc-cookbook:mealplan:grocery'
});

// Every kind must actually be a store mc-sync.js syncs — a typo here would
// silently reconcile nothing.
{
  const src = fs.readFileSync(path.join(ROOT, 'mc-sync.js'), 'utf8');
  Object.keys(SL.KINDS).forEach(k => {
    ok("8b mc-sync.js syncs '" + SL.KINDS[k] + "' with the union strategy",
      new RegExp("'" + SL.KINDS[k].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "':\\s*'stringSet'").test(src));
  });
  ok("8c mc-sync.js syncs the log itself with mapByTs",
    /'mc-cookbook:setlog':\s*'mapByTs'/.test(src));
}

/* ── 9. end to end, through the REAL reconcileSetStores() ──────────────── */
// Sections 1-8 exercise the pure halves. This one runs mc-sync.js's actual
// reconciliation against a fake localStorage with mc-setlog.js loaded into
// the same sandbox — i.e. the code path that actually ships. The guards make
// mc-sync.js return early (no fake Supabase client here), which is fine:
// reconcileSetStores only touches readRaw/parse/writeVal, all hoisted
// function declarations. Its quota branch also touches `blocked`, which is
// only initialised past the guards, so that branch is left to pullKey's own
// coverage in test-mc-sync-merge.js rather than faked up twice.
{
  const store = {};
  const win = { __mcSync: false, MC_SB: null };
  const sb = {
    console, window: win, module: { exports: {} },
    document: { addEventListener: function () {} },
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; }
    },
    sessionStorage: { getItem: () => null, setItem: () => {} },
    setInterval: function () {}, location: {}
  };
  vm.createContext(sb);
  // mc-setlog.js first — reconcileSetStores reads window.MCSetLog.
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'mc-setlog.js'), 'utf8'), sb, { filename: 'mc-setlog.js' });
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'mc-sync.js'), 'utf8'), sb, { filename: 'mc-sync.js' });
  const reconcile = sb.module.exports.reconcileSetStores;
  ok('9a mc-sync.js exports reconcileSetStores', typeof reconcile === 'function');

  // Post-pull state: every array is the union, the log carries the removals.
  store['mc-cookbook:favorites'] = JSON.stringify(['r1', 'r9']);
  store['mc-cookbook:pantry'] = JSON.stringify(['salt', 'paprika']);
  store['mc-cookbook:mealplan:grocery'] = JSON.stringify(['milk', 'eggs']);
  store['mc-cookbook:setlog'] = JSON.stringify({
    'fav:r9': { on: 0, ts: T },
    'pan:paprika': { on: 0, ts: T },
    'gro:milk': { on: 0, ts: T },
    'gro:eggs': { on: 1, ts: T }
  });

  const changed = reconcile();
  ok('9b reconcile reports that it changed something', changed === true);
  eq('9c favorites: the un-favourited id is gone from disk',
    JSON.parse(store['mc-cookbook:favorites']), ['r1']);
  eq('9d pantry: the removed staple is gone from disk',
    JSON.parse(store['mc-cookbook:pantry']), ['salt']);
  eq('9e grocery: the un-checked row is gone, the checked one stays',
    JSON.parse(store['mc-cookbook:mealplan:grocery']), ['eggs']);

  // Idempotent, and a second pass must not report a phantom change — push()
  // decides what to upload by comparing against its snapshot, so a store this
  // rewrites needlessly would be re-uploaded on every single cycle.
  const again = reconcile();
  ok('9f a second pass is a no-op and reports no change', again === false);
  eq('9g ...and leaves the stores alone',
    JSON.parse(store['mc-cookbook:favorites']), ['r1']);

  // Nothing to remove at all: every array must come back byte-identical.
  store['mc-cookbook:setlog'] = JSON.stringify({ 'fav:r1': { on: 1, ts: T } });
  const beforeFav = store['mc-cookbook:favorites'];
  ok('9h a log with no removals changes nothing',
    reconcile() === false && store['mc-cookbook:favorites'] === beforeFav);

  // Missing / corrupt log: reconciliation must be inert, never destructive.
  delete store['mc-cookbook:setlog'];
  ok('9i no log at all is a safe no-op', reconcile() === false);
  store['mc-cookbook:setlog'] = '{not json';
  ok('9j a corrupt log is a safe no-op (never empties a store)',
    reconcile() === false && JSON.parse(store['mc-cookbook:favorites']).length === 1);

  // And the whole point: this runs before push(), so what gets uploaded is
  // the reconciled array. Assert the real source order rather than trusting
  // the comment, since swapping them would silently re-upload the removals.
  const src = fs.readFileSync(path.join(ROOT, 'mc-sync.js'), 'utf8');
  ok('9k reconcileSetStores() is called inside pull(), before push() is defined',
    src.indexOf('if (reconcileSetStores()) pulledChange = true;') > 0 &&
    src.indexOf('if (reconcileSetStores()) pulledChange = true;') < src.indexOf('function push()'));
}

console.log('test-mc-setlog: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);

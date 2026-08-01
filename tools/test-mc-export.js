#!/usr/bin/env node
'use strict';
/* ==========================================================================
   test-mc-export.js — regression coverage for mc-export.js, the app's single
   manual-backup format (audit C-01/C-03).

   This exists because backup is the one flow where a silent failure is
   unrecoverable: it's what a cook uses after losing a phone. Before the
   consolidation the app shipped two backup implementations that both wrote
   mikes-cookbook-backup-<date>.json stamped app:"mikes-cookbook", in mutually
   unreadable formats — one rejected the other's files outright, and the other
   accepted them and double-encoded every store on the way in. Neither had a
   test. These assertions pin the format contract so that can't recur.

   Same sandboxing technique as test-mc-sync-merge.js: mc-export.js is a
   browser IIFE, so it's vm-run with a fake window and a real `module` object.
   Its module.exports hook (before the window guard, exploiting
   function-declaration hoisting) captures the pure format functions, so these
   tests exercise the REAL implementation rather than a copy that could drift.

   Run: node tools/test-mc-export.js
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = fs.readFileSync(path.resolve(__dirname, '../mc-export.js'), 'utf8');

let pass = 0, fail = 0;
function ok(name, cond) { if (cond) { pass++; } else { fail++; console.error('::error::' + name); } }
function eq(name, a, b) { ok(name, JSON.stringify(a) === JSON.stringify(b)); }

function load() {
  const sandbox = { module: { exports: {} }, window: undefined };
  vm.createContext(sandbox);
  vm.runInContext(SRC, sandbox);
  return sandbox.module.exports;
}

// Storage-alike with the surface mc-export.js touches.
function memStore(seed) {
  const m = Object.assign({}, seed || {});
  return {
    get length() { return Object.keys(m).length; },
    key(i) { return Object.keys(m)[i]; },
    getItem(k) { return Object.prototype.hasOwnProperty.call(m, k) ? m[k] : null; },
    setItem(k, v) { m[k] = String(v); },
    removeItem(k) { delete m[k]; },
    _raw: m
  };
}

const X = load();
ok('module.exports captured the format fns', !!(X && X.buildPayload && X.restorePayload && X.isOwnKey));
eq('format version is 2', X.FORMAT, 2);

// A realistic device: JSON stores AND the bare-string stores that broke the
// old exporter (lastBackupAt is an ISO string, recap-dismissed a week key,
// cookfont a scalar — none of them JSON).
const DEVICE = {
  'mc-cookbook:favorites': '["chili-verde","steak-bowl"]',
  'mc-cookbook:mealplan': '{"meals":[{"uid":"m1","id":"chili-verde","serving":2}]}',
  'mc-cookbook:pantry': '["salt","olive oil"]',
  'mc-cookbook:lastBackupAt': '2026-07-31T12:00:00.000Z',
  'mc-cookbook:mealplan:recap-dismissed': '2026-W31',
  'mc-cookbook:cookfont': 'large',
  'mc_macros_v1': '{"v":1,"ts":42,"goals":{"kcal":2400},"days":{}}',
  // Not ours: the workout app owns these, this app only consumes them.
  'mc_activity': '{"2026-07-31":"legs"}',
  'mc_workout_log_v1': '[{"id":"w1"}]',
  'unrelated_key': 'x'
};

// ---- key ownership --------------------------------------------------------
ok('isOwnKey: mc-cookbook: namespace is ours', X.isOwnKey('mc-cookbook:favorites'));
ok('isOwnKey: the tracker is ours', X.isOwnKey('mc_macros_v1'));
ok('isOwnKey: workout activity is NOT ours', !X.isOwnKey('mc_activity'));
ok('isOwnKey: workout log is NOT ours', !X.isOwnKey('mc_workout_log_v1'));
ok('isOwnKey: unrelated keys are NOT ours', !X.isOwnKey('unrelated_key'));

// ---- export ---------------------------------------------------------------
{
  const p = X.buildPayload(memStore(DEVICE));
  eq('export: stamped app', p.app, 'mikes-cookbook');
  eq('export: stamped version', p.version, 2);
  ok('export: includes the tracker (C-03 — the old Home export did not)',
    p.data['mc_macros_v1'] === DEVICE['mc_macros_v1']);
  ok('export: excludes CONSUME-only workout stores (one writer per store)',
    !('mc_activity' in p.data) && !('mc_workout_log_v1' in p.data));
  ok('export: excludes unrelated keys', !('unrelated_key' in p.data));
  ok('export: values are RAW strings, not parsed',
    typeof p.data['mc-cookbook:favorites'] === 'string' &&
    p.data['mc-cookbook:favorites'] === DEVICE['mc-cookbook:favorites']);
}

// ---- v2 round trip: byte-exact for every store, including bare strings ----
{
  const p = X.buildPayload(memStore(DEVICE));
  const dest = memStore();
  const res = X.restorePayload(JSON.parse(JSON.stringify(p)), dest);
  ok('v2 round trip: reported ok', res.ok);
  let exact = true;
  Object.keys(DEVICE).forEach((k) => {
    if (!X.isOwnKey(k)) return;
    if (dest.getItem(k) !== DEVICE[k]) { exact = false; console.error('  mismatch on ' + k +
      ': got ' + JSON.stringify(dest.getItem(k)) + ' want ' + JSON.stringify(DEVICE[k])); }
  });
  ok('v2 round trip: every owned store restored byte-exact', exact);
  ok('v2 round trip: bare ISO string not re-quoted (the old self-round-trip bug)',
    dest.getItem('mc-cookbook:lastBackupAt') === '2026-07-31T12:00:00.000Z');
  ok('v2 round trip: JSON array still parses to an array',
    Array.isArray(JSON.parse(dest.getItem('mc-cookbook:favorites'))));
  ok('v2 round trip: did not resurrect workout stores', dest.getItem('mc_activity') === null);
}

// ---- v2 is a true replace: stale keys not in the file are cleared ---------
{
  const dest = memStore({ 'mc-cookbook:favorites': '["stale"]', 'mc-cookbook:owner': '1' });
  const p = { app: 'mikes-cookbook', version: 2, data: { 'mc-cookbook:favorites': '["fresh"]' } };
  X.restorePayload(p, dest);
  eq('v2: file value replaces the device value', dest.getItem('mc-cookbook:favorites'), '["fresh"]');
  ok('v2: owned key absent from the file is cleared', dest.getItem('mc-cookbook:owner') === null);
}

// ---- v1 (old cookbook-home.js): same raw-string shape, narrower key set ---
{
  const v1 = {
    app: 'mikes-cookbook', version: 1,
    data: {
      'mc-cookbook:favorites': '["chili-verde"]',
      'mc-cookbook:lastBackupAt': '2026-07-30T00:00:00.000Z'
    }
  };
  const dest = memStore({ 'mc_macros_v1': '{"v":1,"ts":42}' });
  const res = X.restorePayload(v1, dest);
  ok('v1: accepted (the old account-sheet importer rejected these)', res.ok);
  eq('v1: raw strings restored unchanged', dest.getItem('mc-cookbook:favorites'), '["chili-verde"]');
  ok('v1: partial file does NOT wipe the tracker it cannot restore',
    dest.getItem('mc_macros_v1') === '{"v":1,"ts":42}');
}

// ---- unversioned legacy (old mc-export.js): values were JSON.parse-ed -----
{
  const legacy = {
    app: 'mikes-cookbook',
    data: {
      'mc-cookbook:favorites': ['chili-verde', 'steak-bowl'],   // parsed array
      'mc-cookbook:mealplan': { meals: [{ uid: 'm1' }] },        // parsed object
      'mc-cookbook:lastBackupAt': '2026-07-30T00:00:00.000Z',    // parse failed -> string
      'mc_macros_v1': { v: 1, ts: 42 }
    }
  };
  const dest = memStore();
  const res = X.restorePayload(legacy, dest);
  ok('legacy: accepted', res.ok);
  eq('legacy: parsed array re-serialized once, not double-encoded',
    dest.getItem('mc-cookbook:favorites'), '["chili-verde","steak-bowl"]');
  ok('legacy: restored favorites parse back to a real array',
    Array.isArray(JSON.parse(dest.getItem('mc-cookbook:favorites'))));
  eq('legacy: bare string written through untouched, not re-quoted',
    dest.getItem('mc-cookbook:lastBackupAt'), '2026-07-30T00:00:00.000Z');
  ok('legacy: tracker restored', dest.getItem('mc_macros_v1') === '{"v":1,"ts":42}');
}

// ---- rejection paths: nothing is written when validation fails -----------
{
  const cases = [
    ['null payload', null],
    ['no data object', { app: 'mikes-cookbook', version: 2 }],
    ['data is an array', { version: 2, data: [] }],
    ['data has no cookbook keys', { version: 2, data: { some_other_app: '1' } }],
    ['newer format than we understand', { version: 99, data: { 'mc-cookbook:favorites': '[]' } }]
  ];
  cases.forEach(([name, payload]) => {
    const dest = memStore({ 'mc-cookbook:favorites': '["keepme"]' });
    const res = X.restorePayload(payload, dest);
    ok('reject: ' + name, !res.ok && typeof res.message === 'string' && res.message.length > 0);
    ok('reject: ' + name + ' — device data untouched',
      dest.getItem('mc-cookbook:favorites') === '["keepme"]');
  });
}

// ---- the exact cross-import corruption C-01 documented, now impossible ---
{
  // A file written by the OLD cookbook-home.js exporter, fed to this importer.
  const homeFile = { app: 'mikes-cookbook', version: 1, data: { 'mc-cookbook:favorites': '["a","b"]' } };
  const dest = memStore();
  X.restorePayload(homeFile, dest);
  const restored = JSON.parse(dest.getItem('mc-cookbook:favorites'));
  ok('C-01: cross-import yields an array, not a stringified string',
    Array.isArray(restored) && restored.length === 2 && restored[0] === 'a');
}

if (fail) { console.error(`\ntest-mc-export: ${pass} passed, ${fail} FAILED`); process.exit(1); }
console.log(`test-mc-export: all ${pass} assertions passed`);

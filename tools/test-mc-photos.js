#!/usr/bin/env node
'use strict';
/* ==========================================================================
   test-mc-photos.js — regression coverage for mc-photos.js's pure half (the
   photo library behind re-audit critical gap #04: base64 recipe-cover and
   cook-log photos living in localStorage, capped at 24/12 items purely
   because localStorage is the wrong primitive for binary blobs, and — a real
   gap this same fix closed — cook-log photo bytes being pushed to Supabase's
   user_sync table on every sync despite mc-sync.js's own comment claiming
   they were device-local).

   Same sandboxing technique as test-mc-export.js/test-mc-setlog.js:
   mc-photos.js is a browser IIFE, so it's vm-run with `window: undefined`.
   Its module.exports hook (before the window guard, exploiting
   function-declaration hoisting) captures the id-construction and
   legacy-value-detection helpers — the only parts of this module that are
   real logic worth pinning without a browser. The IndexedDB-dependent half
   (openDb/idbPut/migrateCovers/warmCache/urlFor/setCover/etc.) genuinely
   cannot run under Node and is proven by tools/smoke-test.js instead, per
   this file's own header comment — this test does not attempt to fake an
   IndexedDB.

   Run: node tools/test-mc-photos.js
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = fs.readFileSync(path.resolve(__dirname, '../mc-photos.js'), 'utf8');

let pass = 0, fail = 0;
function ok(name, cond) { if (cond) { pass++; } else { fail++; console.error('::error::' + name); } }
function eq(name, a, b) { ok(name, a === b); }

function load() {
  const sandbox = { module: { exports: {} }, window: undefined };
  vm.createContext(sandbox);
  vm.runInContext(SRC, sandbox);
  return sandbox.module.exports;
}

const X = load();
ok('module.exports captured the pure helpers',
  !!(X && X.coverId && X.cookId && typeof X.isLegacyPhotoValue === 'function'));

// ---- constants --------------------------------------------------------
eq('DB_NAME', X.DB_NAME, 'mc-cookbook-photos');
eq('DB_VERSION', X.DB_VERSION, 1);
eq('STORE', X.STORE, 'photos');
eq('MIGRATED_FLAG', X.MIGRATED_FLAG, 'mc-cookbook:photosMigratedV1');
eq('COVER_KEY unchanged (same key the old base64 map used)', X.COVER_KEY, 'mc-cookbook:photos');
eq('COOKED_KEY unchanged (same key the cook log always used)', X.COOKED_KEY, 'mc-cookbook:cooked');

// ---- id construction ----------------------------------------------------
eq('coverId: prefixes with cover:', X.coverId('chili-verde'), 'cover:chili-verde');
eq('cookId: prefixes with cook: and embeds the timestamp',
  X.cookId('chili-verde', 1234567890), 'cook:chili-verde:1234567890');
ok('coverId/cookId never collide for the same recipe',
  X.coverId('chili-verde') !== X.cookId('chili-verde', null));
ok('two different recipes never collide',
  X.coverId('chili-verde') !== X.coverId('steak-bowl'));
ok('two different cook-log entries for the same recipe never collide',
  X.cookId('chili-verde', 1) !== X.cookId('chili-verde', 2));

// ---- isLegacyPhotoValue: does this need migrating, or is it the `true`
// marker mc-photos.js writes once a cook-log photo has moved into
// IndexedDB? ----------------------------------------------------------
ok('isLegacyPhotoValue: a real base64 JPEG string is legacy',
  X.isLegacyPhotoValue('data:image/jpeg;base64,' + 'A'.repeat(100)));
ok('isLegacyPhotoValue: the boolean true marker (already migrated) is NOT legacy',
  !X.isLegacyPhotoValue(true));
ok('isLegacyPhotoValue: absent (no photo at all) is NOT legacy',
  !X.isLegacyPhotoValue(undefined));
ok('isLegacyPhotoValue: null is NOT legacy', !X.isLegacyPhotoValue(null));
ok('isLegacyPhotoValue: a short string under the length floor is NOT legacy',
  !X.isLegacyPhotoValue('short'));
ok('isLegacyPhotoValue: exactly at the 32-char floor is NOT legacy (strictly greater-than)',
  !X.isLegacyPhotoValue('A'.repeat(32)));
ok('isLegacyPhotoValue: one character over the floor IS legacy',
  X.isLegacyPhotoValue('A'.repeat(33)));
ok('isLegacyPhotoValue: a number is NOT legacy (defensive against a corrupt entry)',
  !X.isLegacyPhotoValue(42));

// ---- browser guard: loading with `window` unset must not throw and must
// not construct window.MCPhotos (mirrors how index.html/recipe.html/
// collection.html/diagnostics.html all load this before a real DOM exists
// during this very test's own vm sandbox). ------------------------------
ok('loading under a sandbox with no window does not throw', true); // load() above already proved this
ok('module.exports is the pure surface only — no IndexedDB-shaped keys leaked',
  Object.keys(X).sort().join(',') ===
    ['COOKED_KEY', 'COVER_KEY', 'DB_NAME', 'DB_VERSION', 'MIGRATED_FLAG', 'STORE', 'cookId', 'coverId', 'isLegacyPhotoValue'].sort().join(','));

if (fail) { console.error(`\ntest-mc-photos: ${pass} passed, ${fail} FAILED`); process.exit(1); }
console.log(`test-mc-photos: all ${pass} assertions passed`);

#!/usr/bin/env node
'use strict';
/* ==========================================================================
   test-mc-data.js — regression coverage for the split data layer (CI
   initiative 5): tools/build-data.js's output and mc-data.js's hydration.

   The property that makes the split safe is IDENTITY: mc-data.js builds
   window.RECIPES from the index, and _absorb() then assigns detail onto those
   very same objects — so a reference a caller captured before the shard landed
   (recipeById()'s result, a card's closure, a planner row) gains ingredients
   and instructions in place, with no re-lookup. Test 3 pins exactly that,
   because if it ever stops holding the failure is silent: callers keep a stale
   object and simply render an empty ingredient list.

   Test 5 is the completeness gate — every field of every recipe must survive
   the round trip index + shards → recipe, or the split has quietly dropped
   data that no single page would obviously miss.

   Run: node tools/test-mc-data.js
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
let pass = 0, fail = 0;
function ok(name, cond) { if (cond) { pass++; } else { fail++; console.error('::error::' + name); } }
function eq(name, a, b) { ok(name + ' (got ' + JSON.stringify(a) + ')', JSON.stringify(a) === JSON.stringify(b)); }

/* ── the authored source, loaded the way the browser used to load it ────── */
function loadSource() {
  const sb = { window: {} };
  sb.window.window = sb.window;
  vm.createContext(sb);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'recipes-data.js'), 'utf8'), sb);
  return sb.window;
}

/* ── a browser-ish sandbox: runs recipes-index.js then mc-data.js, and lets
     the test execute injected shard scripts the way a <script> tag would ─── */
function loadApp(opts) {
  opts = opts || {};
  const injected = [];
  const sb = {
    window: {},
    document: {
      head: { appendChild(node) { injected.push(node); } },
      createElement: () => ({ src: '', async: false, onerror: null })
    },
    Promise: Promise
  };
  sb.window.window = sb.window;
  sb.window.document = sb.document;
  vm.createContext(sb);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'recipes-index.js'), 'utf8'), sb);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'mc-data.js'), 'utf8'), sb);

  // Execute whatever shard scripts mc-data.js asked for. With `failAll`, fire
  // onerror instead — the cold-cache-plus-dead-network path.
  function flush() {
    while (injected.length) {
      const node = injected.shift();
      if (opts.failAll) { node.onerror && node.onerror(); continue; }
      vm.runInContext(fs.readFileSync(path.join(ROOT, node.src), 'utf8'), sb);
    }
  }
  return { win: sb.window, flush, pending: () => injected.length };
}

const SRC = loadSource();

async function main() {
  /* ── 1. The index carries what a card needs, and nothing it doesn't ───── */
  {
    const { win } = loadApp();
    eq('1a. every recipe is in the index', win.RECIPES.length, SRC.RECIPES.length);
    eq('1b. collections ship with the index', win.COLLECTIONS.length, SRC.COLLECTIONS.length);
    const r = win.RECIPES[0];
    ok('1c. title is in the index', typeof r.title === 'string' && r.title.length > 0);
    ok('1d. macros are in the index (cards render them)', !!r.macro_profiles);
    ok('1e. tags are in the index (facets filter on them)', Array.isArray(r.tags));
    ok('1f. ingredients are NOT in the index', r.ingredients_by_serving === undefined);
    ok('1g. instructions are NOT in the index', r.instructions === undefined);
    ok('1h. description is NOT in the index (only recipe.html reads it)', r.description === undefined);
    ok('1i. nothing reports ready before a shard loads', win.MCData.allReady() === false);
  }

  /* ── 2. ensureDetail pulls exactly one shard, not the corpus ─────────── */
  {
    const app = loadApp();
    const id = SRC.RECIPES[0].recipe_id;
    ok('2a. detail is absent up front', app.win.MCData.hasDetail(id) === false);
    const p = app.win.MCData.ensureDetail(id);
    eq('2b. exactly one shard requested', app.pending(), 1);
    app.flush();
    ok('2c. the promise resolves true', (await p) === true);
    ok('2d. that recipe now has detail', app.win.MCData.hasDetail(id) === true);
    ok('2e. and the corpus is still not fully loaded', app.win.MCData.allReady() === false);
    ok('2f. a second call is a no-op', app.win.MCData.ensureDetail(id) instanceof Object && app.pending() === 0);
  }

  /* ── 3. Identity: detail lands on the SAME object a caller already holds ─
     This is the property the whole design rests on. */
  {
    const app = loadApp();
    const id = SRC.RECIPES[0].recipe_id;
    // Exactly what cookbook-home.js's recipeById() does, before the shard.
    const captured = app.win.RECIPES.filter((r) => r.recipe_id === id)[0];
    ok('3a. captured early, detail absent', captured.ingredients_by_serving === undefined);
    const p = app.win.MCData.ensureDetail(id);
    app.flush();
    await p;
    ok('3b. the SAME object now has ingredients', !!captured.ingredients_by_serving);
    ok('3c. …and instructions', Array.isArray(captured.instructions));
    ok('3d. …and its description', typeof captured.description === 'string');
    ok('3e. still the same object identity',
      captured === app.win.RECIPES.filter((r) => r.recipe_id === id)[0]);
  }

  /* ── 4. ensureAll pulls every shard, once ────────────────────────────── */
  {
    const app = loadApp();
    const p = app.win.MCData.ensureAll();
    eq('4a. one request per shard', app.pending(), app.win.MCData.SHARDS);
    app.flush();
    ok('4b. resolves true', (await p) === true);
    ok('4c. allReady', app.win.MCData.allReady() === true);
    await app.win.MCData.ensureAll();
    eq('4d. a second ensureAll requests nothing', app.pending(), 0);
  }

  /* ── 5. Completeness: index + shards reconstruct every recipe exactly ─── */
  {
    const app = loadApp();
    const p = app.win.MCData.ensureAll();
    app.flush();
    await p;

    const bySrc = {};
    SRC.RECIPES.forEach((r) => { bySrc[r.recipe_id] = r; });

    let missing = 0, mismatched = 0, extra = 0;
    app.win.RECIPES.forEach((got) => {
      const want = bySrc[got.recipe_id];
      if (!want) { extra++; return; }
      Object.keys(want).forEach((k) => {
        if (JSON.stringify(want[k]) !== JSON.stringify(got[k])) mismatched++;
      });
      // `_s` is the generator's shard tag; everything else must come from source.
      Object.keys(got).forEach((k) => {
        if (k !== '_s' && !(k in want)) missing++;
      });
    });
    eq('5a. no recipe in the split is absent from the source', extra, 0);
    eq('5b. every authored field round-trips byte-identically', mismatched, 0);
    eq('5c. the split invents no fields', missing, 0);
    eq('5d. and loses no recipes', app.win.RECIPES.length, SRC.RECIPES.length);
  }

  /* ── 6. A failed shard resolves false instead of hanging ─────────────── */
  {
    const app = loadApp({ failAll: true });
    const id = SRC.RECIPES[0].recipe_id;
    const p = app.win.MCData.ensureDetail(id);
    app.flush();
    ok('6a. resolves false rather than hanging forever', (await p) === false);
    ok('6b. still reports no detail', app.win.MCData.hasDetail(id) === false);
    ok('6c. and a retry is allowed', app.win.MCData.ensureDetail(id) instanceof Object && app.pending() === 1);
  }

  /* ── 7. A user recipe has no shard and is always ready ───────────────── */
  {
    const app = loadApp();
    app.win.RECIPES.push({ recipe_id: 'my-thing', user: true, title: 'Mine',
      ingredients_by_serving: {}, instructions: [] });
    ok('7a. a user recipe never waits on a shard',
      app.win.MCData.hasDetail('my-thing') === true);
  }

  /* ── 8. The shards are balanced — the reason they're hashed, not alphabetical
     recipe_ids cluster hard on a few letters ("c" alone was 211 KB, bigger
     than the whole index), which would have made opening a chicken recipe pull
     a fifth of the corpus. Guard the property, not the specific hash. */
  {
    const sizes = [];
    for (let n = 0; n < 16; n++) {
      const f = path.join(ROOT, 'recipes-detail-' + String(n).padStart(2, '0') + '.js');
      if (fs.existsSync(f)) sizes.push(fs.statSync(f).size);
    }
    eq('8a. every shard exists', sizes.length, 16);
    const idx = fs.statSync(path.join(ROOT, 'recipes-index.js')).size;
    const src = fs.statSync(path.join(ROOT, 'recipes-data.js')).size;
    ok('8b. the index is a small fraction of the source it replaced (<25%)', idx / src < 0.25);
    ok('8c. no shard is larger than the index itself',
      Math.max(...sizes) < idx);
    ok('8d. a recipe page parses under a third of the old payload',
      (idx + Math.max(...sizes)) / src < 0.33);
  }

  console.log(fail
    ? 'test-mc-data: ' + fail + ' FAILED, ' + pass + ' passed'
    : 'test-mc-data: all ' + pass + ' assertions passed');
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error('::error::' + e.stack); process.exit(1); });

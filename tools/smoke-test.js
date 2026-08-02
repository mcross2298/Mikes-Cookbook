#!/usr/bin/env node
'use strict';
/* ==========================================================================
   smoke-test.js — drives the REAL app in a real browser.

   ROADMAP.md names "no UI smoke test" as this repo's standing CI gap: every
   other gate reasons about source text or runs a module in a vm sandbox, so
   nothing has ever actually opened a page and clicked something. That gap is
   why the two changes this file covers were worth verifying rather than
   assuming — CI initiative 1 moved timer state out of the DOM, and initiative
   5 made recipe detail load asynchronously, and neither is visible to a
   static check.

   **Not wired into CI, deliberately.** It needs Playwright and a Chromium
   binary; this project has no package.json and no npm step, and adding one to
   pages.yml is a change to the project's character that belongs to a separate
   decision, not to the change that happened to need a browser. Run it locally
   before pushing anything that touches load order, Cooking Mode or the timers.

   Usage:
     python3 -m http.server 8765 &
     node tools/smoke-test.js
   ========================================================================== */
const { chromium } = require('playwright');
const B = 'http://localhost:8765';
let fails = 0;
const ok = (n, c) => { console.log((c ? 'PASS ' : 'FAIL ') + n); if (!c) fails++; };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  // Only real JS exceptions count. Network failures here are the sandbox's
  // egress proxy refusing the optional Supabase/CDN calls, not app bugs.
  page.on('console', m => {
    const t = m.text();
    if (m.type() === 'error' && !/net::|Failed to load resource/.test(t)) errors.push('console: ' + t);
  });

  // ── shell ──────────────────────────────────────────────────────────
  await page.goto(B + '/index.html', { waitUntil: 'networkidle' });
  ok('shell: no JS errors', errors.length === 0 || (console.log(errors), false));
  ok('shell: Home rendered', (await page.locator('#screen-home').innerHTML()).length > 500);
  ok('shell: index built RECIPES', await page.evaluate(() => window.RECIPES.length) === 318);
  ok('shell: detail shards all loaded', await page.evaluate(() => window.MCData.allReady()) === true);
  ok('shell: ingredients hydrated in place',
    await page.evaluate(() => !!window.RECIPES[0].ingredients_by_serving));
  const boot = await page.evaluate(() => window.__mcBoot.data);
  console.log('     __mcBoot.data (index parse) = ' + boot.toFixed(1) + ' ms');

  // Browse: search by an INGREDIENT, which only works once shards landed.
  // A same-document hash change does not re-run init(), so force a real load.
  await page.goto(B + '/index.html#recipes', { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const box = page.locator('#screen-recipes .search-box');
  await box.fill('broccoli');
  await page.waitForTimeout(300);
  const hits = await page.locator('#screen-recipes .rc').count();
  ok('shell: ingredient search returns hits (' + hits + ')', hits > 0);

  // ── recipe page ────────────────────────────────────────────────────
  errors.length = 0;
  // Pick a recipe whose FIRST step names a duration, so the timer-chip tests
  // below actually run — they cover the regression this work exists to fix.
  const id = await page.evaluate(() => {
    const RE = /(\d+(?:\.\d+)?)\s*(hours?|hrs?|minutes?|mins?|seconds?|secs?)\b/i;
    const hit = window.RECIPES.find(r => (r.instructions||[]).length &&
      RE.test(r.instructions[0].detail || ''));
    return (hit || window.RECIPES.find(r => (r.instructions||[]).length)).recipe_id;
  });
  await page.goto(B + '/recipe.html?id=' + id, { waitUntil: 'networkidle' });
  ok('recipe: no JS errors', errors.length === 0 || (console.log(errors), false));
  ok('recipe: header painted', (await page.locator('#header').innerHTML()).length > 200);
  ok('recipe: only ONE shard loaded (not the corpus)',
    await page.evaluate(() => window.MCData.allReady()) === false);
  ok('recipe: detail present for this recipe',
    await page.evaluate((i) => window.MCData.hasDetail(i), id) === true);
  await page.click('#tab-recipe');
  ok('recipe: steps rendered', await page.locator('.step-row, .steps .step').count() > 0);
  await page.click('#tab-grocery');
  ok('recipe: grocery rendered', (await page.locator('#pane-grocery').innerHTML()).length > 200);

  // ── ?cook=1 deep link ──────────────────────────────────────────────
  errors.length = 0;
  await page.goto(B + '/recipe.html?id=' + id + '&cook=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  ok('cook=1: no JS errors', errors.length === 0 || (console.log(errors), false));
  ok('cook=1: Cooking Mode opened', await page.locator('#cook').count() === 1);

  // ── timers ─────────────────────────────────────────────────────────
  const chip = page.locator('#cook .timer-chip').first();
  if (await chip.count()) {
    await chip.click();
    await page.waitForTimeout(200);
    ok('timer: rail shows a pill', await page.locator('.mc-rail .mc-pill').count() === 1);
    ok('timer: persisted to the store',
      await page.evaluate(() => JSON.parse(localStorage.getItem('mc-cookbook:timers')).timers.length) === 1);
    // THE regression: advance a step, which blanks the cook overlay.
    await page.click('#cook .cook-nav.primary');
    await page.waitForTimeout(200);
    ok('timer: SURVIVES a step advance (the original bug)',
      await page.locator('.mc-rail .mc-pill').count() === 1);
    // And a full navigation to a different page.
    await page.goto(B + '/index.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    ok('timer: survives a full navigation to the shell',
      await page.locator('.mc-rail .mc-pill').count() === 1);
    ok('timer: rail clears the tab bar', await page.locator('.mc-rail.on-shell').count() === 1);
  } else {
    console.log('SKIP timer chip tests — no duration in this recipe\'s steps');
  }

  // ── collection page ────────────────────────────────────────────────
  errors.length = 0;
  const cid = await page.evaluate(() => window.COLLECTIONS.find(c => c.status === 'live').id);
  await page.goto(B + '/collection.html?c=' + cid, { waitUntil: 'networkidle' });
  ok('collection: no JS errors', errors.length === 0 || (console.log(errors), false));
  ok('collection: grid rendered', await page.locator('#grid .rc').count() > 0);

  await browser.close();
  console.log(fails ? '\n' + fails + ' SMOKE FAILURES' : '\nsmoke: all checks passed');
  process.exit(fails ? 1 : 0);
})();

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

   **Wired into CI as of 2026-08-02** (this comment used to say the opposite
   — pages.yml's `verify` job now installs Playwright + Chromium ad hoc for
   this one step and cleans up afterward, so the repo's real, committed
   footprint stays npm-free; see that workflow's own comment on the step).
   Still worth running locally before pushing anything that touches load
   order, Cooking Mode, the timers, or a write path — CI catches a
   regression either way, but locally is faster to iterate on.

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

  // ── Web Share Target (manifest.json share_target → handleSharedRecipe) ──
  // manifest.json registers index.html as a share target with these three
  // GET params; a share from another app should open the Add Recipe form
  // prefilled rather than the cook retyping a link they just shared in.
  errors.length = 0;
  await page.goto(B + '/index.html?shared_title=' + encodeURIComponent('Grandma\'s Chili') +
    '&shared_text=' + encodeURIComponent('so good') +
    '&shared_url=' + encodeURIComponent('https://example.com/chili'),
    { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  ok('share target: no JS errors', errors.length === 0 || (console.log(errors), false));
  ok('share target: Add Recipe form opened', await page.locator('.recipe-form').count() === 1);
  const sharedTitleVal = await page.locator('.recipe-form .rf-body input').first().inputValue().catch(() => '');
  ok('share target: title prefilled from shared_title', sharedTitleVal === "Grandma's Chili");
  const sharedDescVal = await page.locator('.recipe-form .rf-body textarea').first().inputValue().catch(() => '');
  ok('share target: description carries the shared text and URL',
    sharedDescVal.indexOf('so good') >= 0 && sharedDescVal.indexOf('https://example.com/chili') >= 0);
  ok('share target: the shared_* params are stripped from the URL after opening',
    !/shared_title=/.test(page.url()));

  // ── Recipe capture: "Paste a link" (#146 mc-import.js + #147 the edge
  // function + the chooser/dialog wiring that connects them) ─────────────
  // Real network calls to Supabase are blocked by this environment's own
  // egress policy (the same limitation #147's PR description documents), so
  // only the network boundary — MC_SB.currentUser()/MC_SB.callFunction() —
  // is stubbed here. Everything else runs for real: the chooser, the
  // dialog, mc-import.js's actual parser against a real JSON-LD fixture,
  // and MCRecipeForm's prefill handling.
  errors.length = 0;
  // goto() alone can land on a URL identical to the one the share-target
  // scenario just replaceState'd to, which Chromium treats as a same-
  // document navigation (no reload) — the exact hazard the ingredient-
  // search section above already works around; force a real reload the
  // same way so the previous scenario's .recipe-form doesn't linger.
  await page.goto(B + '/index.html#home', { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  await page.locator('.home-mod', { hasText: 'Add Recipe' }).click();
  await page.waitForTimeout(200);
  ok('import: chooser opens with both entry points',
    await page.locator('.rf-chooser .home-mod', { hasText: 'Type it in' }).count() === 1 &&
    await page.locator('.rf-chooser .home-mod', { hasText: 'Paste a link' }).count() === 1);

  await page.locator('.rf-chooser .home-mod', { hasText: 'Paste a link' }).click();
  await page.waitForTimeout(200);
  ok('import: paste-a-link dialog opens', await page.locator('.import-dialog').count() === 1);

  // Offline is caught client-side before any network attempt.
  await page.evaluate(() => { window.MCNet.isOffline = () => true; });
  await page.locator('.import-dialog input[type="url"]').fill('https://example.com/recipe');
  await page.locator('.import-dialog .rf-save').click();
  await page.waitForTimeout(150);
  ok('import: offline is blocked before any network attempt',
    /offline/i.test(await page.locator('.import-dialog .rf-error').innerText()));
  await page.evaluate(() => { window.MCNet.isOffline = () => false; });

  // A signed-out cook gets a clear, actionable prompt, not a raw failure.
  await page.evaluate(() => { window.MC_SB.currentUser = () => Promise.resolve(null); });
  await page.locator('.import-dialog .rf-save').click();
  await page.waitForTimeout(150);
  ok('import: signed-out shows a sign-in prompt, not a raw error',
    /sign in/i.test(await page.locator('.import-dialog .rf-error').innerText()));

  // The real success path: stub only currentUser()/callFunction(), run the
  // real parser on real (fixture) JSON-LD, land on the real Add Recipe form.
  const fixtureHtml = '<html><head><script type="application/ld+json">' +
    JSON.stringify({ '@context': 'https://schema.org', '@type': 'Recipe',
      name: 'Smoke-Test Skillet Hash', recipeYield: ['4'],
      recipeIngredient: ['2 cups diced potato', '1 lb ground beef'],
      recipeInstructions: [{ '@type': 'HowToStep', text: 'Brown the beef.' }] }) +
    '</' + 'script></head><body></body></html>';
  await page.evaluate((html) => {
    window.MC_SB.currentUser = () => Promise.resolve({ id: 'smoke-test-user' });
    window.MC_SB.callFunction = () => Promise.resolve({ ok: true, html: html, finalUrl: 'https://example.com/hash' });
  }, fixtureHtml);
  await page.locator('.import-dialog .rf-save').click();
  await page.waitForTimeout(300);
  ok('import: a successful fetch closes the dialog and opens Add Recipe prefilled',
    await page.locator('.import-dialog').count() === 0 && await page.locator('.recipe-form').count() === 1);
  const importedTitle = await page.locator('.recipe-form .rf-body input').first().inputValue().catch(() => '');
  ok('import: title comes from the real mc-import.js parse of the fixture', importedTitle === 'Smoke-Test Skillet Hash');
  const importedIngItem = await page.locator('.recipe-form .rf-ing-item').first().inputValue().catch(() => '');
  ok('import: first ingredient parsed into the item field correctly', importedIngItem === 'diced potato');
  const viaNote = await page.locator('.recipe-form .rf-via-hint').innerText().catch(() => '');
  ok('import: "Imported from" attribution note shown', /example\.com/.test(viaNote));
  ok('import: no JS errors across the whole capture flow', errors.length === 0 || (console.log(errors), false));
  await page.locator('.recipe-form .rf-cancel').click();

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

  // ── audit VOC/VOA wave 7: a full quota must not fail silently here ───
  // cookbook-home.js's C-12 fix only wired MCFav.onWriteFail on the shell;
  // this page (and collection.html, below) toggle favorites too and had
  // shipped without it, so a full quota tapping a heart here used to do
  // nothing visible at all.
  errors.length = 0;
  await page.evaluate(() => {
    window.__origSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (k === 'mc-cookbook:favorites') {
        Storage.prototype.setItem = window.__origSetItem;
        throw new DOMException('quota', 'QuotaExceededError');
      }
      return window.__origSetItem.call(this, k, v);
    };
  });
  await page.click('.r-fav');
  await page.waitForTimeout(200);
  const recipeQuotaToast = await page.locator('.mc-toast-msg').first().textContent().catch(() => null);
  ok('recipe: a full quota on a heart tap surfaces the storage-full toast',
    !!recipeQuotaToast && /storage is full/i.test(recipeQuotaToast));
  ok('recipe: no JS errors from the simulated quota failure', errors.length === 0 || (console.log(errors), false));

  // ── ?cook=1 deep link ──────────────────────────────────────────────
  errors.length = 0;
  await page.goto(B + '/recipe.html?id=' + id + '&cook=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  ok('cook=1: no JS errors', errors.length === 0 || (console.log(errors), false));
  ok('cook=1: Cooking Mode opened', await page.locator('#cook').count() === 1);

  // ── gesture containment (B1) ─────────────────────────────────────────
  // A downward drag at the top of the page must never trigger the OS's
  // pull-to-refresh — on Android standalone that reloads the whole app out
  // from under a cook mid-recipe. overscroll-behavior is what stops it;
  // this asserts the computed style actually landed, on both the page body
  // and Cooking Mode's own scroll container.
  ok('gesture: body has overscroll-behavior-y: none',
    await page.evaluate(() => getComputedStyle(document.body).overscrollBehaviorY) === 'none');
  ok('gesture: Cooking Mode\'s scroll container contains its own overscroll',
    await page.evaluate(() => {
      var el = document.querySelector('.cook-body');
      return !!el && getComputedStyle(el).overscrollBehaviorY === 'contain';
    }));

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

  // ── SW update reload deferred while Cooking Mode is active (A3) ────────
  // A deploy landing mid-cook used to reload the page out from under the
  // cook — wake lock released, voice control stopped, dropped back on
  // Overview. Rather than installing a second SW version (real, but the
  // slowest and flakiest way to prove this), this dispatches the exact
  // event cookbook-sw.js's own controllerchange listener reacts to on the
  // REAL, already-active navigator.serviceWorker — indistinguishable to
  // that listener from a genuine update taking control. Needs the SW to
  // already be controlling this client (clients.claim() on activate, from
  // the earlier navigations in this file) so the "update" branch runs
  // rather than the "first install" branch — skips gracefully if the SW
  // hasn't taken control in time rather than flaking CI on real-world SW
  // registration timing.
  // Observed via a REAL navigation event rather than mocking
  // window.location.reload — that property is non-configurable in
  // Chromium, so a page.evaluate() assignment to it silently no-ops
  // (caught for real while writing this test: it made the "deferred"
  // assertion pass for the wrong reason, then let a genuine reload tear
  // down the execution context on the very next assertion).
  errors.length = 0;
  await page.goto(B + '/recipe.html?id=' + id + '&cook=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const swControlling = await page.evaluate(() => !!navigator.serviceWorker.controller);
  if (swControlling && await page.locator('#cook').count() === 1) {
    let navigatedWhileCooking = false;
    page.once('framenavigated', () => { navigatedWhileCooking = true; });
    await page.evaluate(() => navigator.serviceWorker.dispatchEvent(new Event('controllerchange')));
    await page.waitForTimeout(400);
    ok('sw-reload: an update while Cooking Mode is active does not reload immediately',
      !navigatedWhileCooking);

    const exitNav = page.waitForEvent('framenavigated', { timeout: 3000 }).catch(() => null);
    await page.click('.cook-exit');
    const navigatedOnExit = await exitNav;
    ok('sw-reload: exiting Cooking Mode applies the deferred reload', !!navigatedOnExit);
    if (navigatedOnExit) {
      await page.waitForLoadState('networkidle');
      // The URL is stripped of ?cook=1 BEFORE the deferred reload fires
      // (see exitCook()'s own comment on the ordering) — otherwise the
      // fresh load would see ?cook=1 again and immediately re-enter
      // Cooking Mode, undoing the exit the reload was supposed to honor.
      ok('sw-reload: the reload does not land back in Cooking Mode',
        await page.locator('#cook').count() === 0);
    }
    ok('sw-reload: no JS errors', errors.length === 0 || (console.log(errors), false));
  } else {
    console.log('SKIP sw-reload tests — service worker had not taken control of this client in time');
  }

  // ── Initiative 2: aisle grouping + provenance underdot on the grocery pane ─
  errors.length = 0;
  await page.goto(B + '/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  // Plan a meal that carries a density-derived ingredient (onion is in
  // mc-units.js's DENSITY table), then open the planner's Grocery pane.
  await page.evaluate(async () => {
    await window.MCData.ensureAll();
    var withOnion = window.RECIPES.find(function (r) {
      var by = r.ingredients_by_serving || {};
      var tier = by['serving_' + (r.native_serving || 2)] || by[Object.keys(by)[0]] || [];
      return tier.some(function (i) { return /onion/i.test(i.item || ''); });
    });
    if (!withOnion) return;
    var p = { meals: [{ uid: 'smoke1', id: withOnion.recipe_id,
      serving: withOnion.native_serving || 2, day: 'Mon', slot: 'Dinner',
      completed: false, completedAt: null }] };
    localStorage.setItem('mc-cookbook:mealplan', JSON.stringify(p));
  });
  await page.goto(B + '/index.html#planner', { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  // Land on the Grocery sub-view of the planner if there's a view toggle.
  const groceryTab = page.locator('text=Grocery').first();
  if (await groceryTab.count()) { await groceryTab.click(); await page.waitForTimeout(300); }
  ok('grocery: no JS errors', errors.length === 0 || (console.log(errors), false));
  const aisleHeads = await page.locator('.grocery-cat-head').allTextContents();
  console.log('     aisle headers found: ' + JSON.stringify(aisleHeads));
  ok('grocery: at least one real aisle header rendered (not blank)',
    aisleHeads.length > 0 && aisleHeads.every(h => h.trim().length > 0));
  const derivedCount = await page.locator('.grocery-qty.has-derived').count();
  console.log('     rows with a density-derived quantity: ' + derivedCount);
  if (derivedCount > 0) {
    await page.locator('.grocery-qty.has-derived').first().click();
    await page.waitForTimeout(200);
    const toastText = await page.locator('.mc-toast-msg').first().textContent().catch(() => null);
    ok('grocery: tapping a derived quantity shows its provenance', !!toastText && /≈/.test(toastText));
    console.log('     provenance toast: ' + toastText);
  } else {
    console.log('SKIP provenance-tap test — no density-derived row landed in this plan');
  }


  // ── Initiative 4: ranked search + typo tolerance + substitution note ────
  errors.length = 0;
  await page.goto(B + '/index.html#recipes', { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const searchBox = page.locator('#screen-recipes .search-box');
  await searchBox.fill('chiken');
  await page.waitForTimeout(300);
  ok('search: no JS errors', errors.length === 0 || (console.log(errors), false));
  const typoHits = await page.locator('#screen-recipes .rc').count();
  console.log('     "chiken" (typo) hits: ' + typoHits);
  ok('search: typo query returns real results (the documented old-search failure)', typoHits > 0);

  await searchBox.fill('chicken broccoli');
  await page.waitForTimeout(300);
  const multiHits = await page.locator('#screen-recipes .rc').count();
  console.log('     "chicken broccoli" hits: ' + multiHits);
  ok('search: multi-word AND query returns real results (the other documented failure)', multiHits > 0);

  const matchBadges = await page.locator('.rc-match-badge').count();
  console.log('     cards showing a "matched: field" badge: ' + matchBadges);
  ok('search: at least one result shows match provenance', matchBadges > 0);

  // Substitution note on a recipe that uses a curated ingredient.
  errors.length = 0;
  const subId = await page.evaluate(async () => {
    await window.MCData.ensureAll();
    var hit = window.RECIPES.find(function (r) {
      var by = r.ingredients_by_serving || {};
      return Object.values(by).some(function (tier) {
        return (tier || []).some(function (i) { return /sour cream|buttermilk|heavy cream/i.test(i.item || ''); });
      });
    });
    return hit ? hit.recipe_id : null;
  });
  if (subId) {
    await page.goto(B + '/recipe.html?id=' + subId, { waitUntil: 'networkidle' });
    await page.click('#tab-grocery');
    await page.waitForTimeout(300);
    ok('substitution: no JS errors', errors.length === 0 || (console.log(errors), false));
    const subText = await page.locator('.sub-card .sub-row').first().textContent().catch(() => null);
    ok('substitution: "Don\'t have it on hand?" note rendered', !!subText);
    console.log('     substitution note: ' + subText);
  } else {
    console.log('SKIP substitution test — no recipe in the corpus uses a curated ingredient');
  }


  // ── Initiative 3: photo resolution chain + hero + light theme + Counter Mode ─
  errors.length = 0;
  await page.goto(B + '/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const photoRecipe = await page.evaluate((dataUrl) => {
    var r = window.RECIPES[0];
    var map = {}; map[r.recipe_id] = dataUrl;
    localStorage.setItem('mc-cookbook:photos', JSON.stringify(map));
    return { id: r.recipe_id, title: r.title };
  }, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=');

  await page.goto(B + '/index.html#recipes', { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.locator('#screen-recipes .search-box').fill(photoRecipe.title);
  await page.waitForTimeout(300);
  ok('cards: no JS errors', errors.length === 0 || (console.log(errors), false));
  ok('cards: planted cover photo renders in the card band',
    await page.locator('.rc-band.has-photo').count() > 0);
  await page.locator('#screen-recipes .search-box').fill('chicken');
  await page.waitForTimeout(300);
  ok('cards: recipes without a photo still show the emoji band unchanged',
    await page.locator('.rc-band:not(.has-photo) .rc-icon').count() > 0);

  errors.length = 0;
  await page.goto(B + '/recipe.html?id=' + photoRecipe.id, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  ok('hero: no JS errors', errors.length === 0 || (console.log(errors), false));
  ok('hero: renders the cover photo', await page.locator('#hero .r-hero-img').count() === 1);
  ok('hero: eyebrow "add photo" hidden once the hero owns display',
    await page.locator('.r-eyebrow .r-photo').count() === 0);

  const noPhotoId = await page.evaluate(() => window.RECIPES[5].recipe_id);
  await page.goto(B + '/recipe.html?id=' + noPhotoId, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  ok('hero: renders nothing for a recipe with no photo',
    await page.evaluate(() => document.getElementById('hero').offsetHeight) === 0);

  // Light theme
  {
    const lightPage = await browser.newPage({ colorScheme: 'light' });
    await lightPage.goto(B + '/index.html', { waitUntil: 'networkidle' });
    await lightPage.waitForTimeout(300);
    const bg = await lightPage.evaluate(() => getComputedStyle(document.body).backgroundColor);
    ok('light theme: body background flips to the paper tone', bg === 'rgb(247, 245, 241)');
    const tabBarBg = await lightPage.evaluate(() => {
      var el = document.querySelector('.tab-bar');
      return el ? getComputedStyle(el).backgroundColor : null;
    });
    ok('light theme: floating chrome (tab bar) flips too, not just the page bg',
      tabBarBg === 'rgba(247, 245, 241, 0.96)');
    await lightPage.close();
  }

  // Counter Mode
  errors.length = 0;
  const counterRid = await page.evaluate(async () => {
    await window.MCData.ensureAll();
    return window.RECIPES.find(r => (r.instructions || []).length).recipe_id;
  });
  await page.goto(B + '/recipe.html?id=' + counterRid + '&cook=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const counterBtn = page.locator('.cook-counter-btn');
  ok('counter mode: toggle button present in Cooking Mode', await counterBtn.count() === 1);
  await counterBtn.click();
  await page.waitForTimeout(200);
  const cookBg = await page.evaluate(() => getComputedStyle(document.getElementById('cook')).backgroundColor);
  ok('counter mode: background forces to white on toggle', cookBg === 'rgb(255, 255, 255)');
  ok('counter mode: no JS errors', errors.length === 0 || (console.log(errors), false));

  // ── collection page ────────────────────────────────────────────────
  errors.length = 0;
  const cid = await page.evaluate(() => window.COLLECTIONS.find(c => c.status === 'live').id);
  await page.goto(B + '/collection.html?c=' + cid, { waitUntil: 'networkidle' });
  ok('collection: no JS errors', errors.length === 0 || (console.log(errors), false));
  ok('collection: grid rendered', await page.locator('#grid .rc').count() > 0);

  // ── audit VOC/VOA wave 7: same quota check, collection.html's card heart ─
  errors.length = 0;
  await page.evaluate(() => {
    window.__origSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (k === 'mc-cookbook:favorites') {
        Storage.prototype.setItem = window.__origSetItem;
        throw new DOMException('quota', 'QuotaExceededError');
      }
      return window.__origSetItem.call(this, k, v);
    };
  });
  await page.locator('#grid .fav-toggle').first().click();
  await page.waitForTimeout(200);
  const collectionQuotaToast = await page.locator('.mc-toast-msg').first().textContent().catch(() => null);
  ok('collection: a full quota on a card heart tap surfaces the storage-full toast',
    !!collectionQuotaToast && /storage is full/i.test(collectionQuotaToast));
  ok('collection: no JS errors from the simulated quota failure', errors.length === 0 || (console.log(errors), false));

  // ── a shard that fails to load shows the honest error, not an empty pane ──
  // Initiative 5 split recipes-data.js into an index + 16 on-demand detail
  // shards; ensureDetail()'s onerror handler already resolves false rather
  // than hanging, and cookbook.js's init() already renders an explicit
  // "Couldn't load this recipe's ingredients" message rather than a blank
  // pane on that failure — this pins both. A fresh, ISOLATED browser
  // context (no SW registration, no Cache Storage) is used deliberately:
  // every scenario above this one already warmed all 16 shards into the
  // shared page's SW cache via MCData.ensureAll(), so re-using that page
  // would make this indistinguishable from a real cache hit no matter what
  // the network does. Blocking the shard URL here forces a genuine network
  // miss on a cold cache, the exact "captive portal / dead network" case
  // the audit named. Also pins mc-net.js's automatic recovery (finding C3):
  // once the network is genuinely back, the shard reloads and the pane
  // repaints on its own — no manual reload — and the browser's own `online`
  // event (not the route unblock, which Chromium never ties to that event)
  // is what mc-net.js listens for, so this dispatches it directly rather
  // than trying to fake real connectivity loss via routing.
  {
    const freshCtx = await browser.newContext();
    const freshPage = await freshCtx.newPage();
    const freshErrors = [];
    freshPage.on('pageerror', (e) => freshErrors.push('pageerror: ' + e.message));
    freshPage.on('console', (m) => {
      const t = m.text();
      if (m.type() === 'error' && !/net::|Failed to load resource/.test(t)) freshErrors.push('console: ' + t);
    });

    const shardPattern = /\/recipes-detail-\d\d\.js(\?.*)?$/;
    await freshPage.route(shardPattern, (route) => route.abort('failed'));

    await freshPage.goto(B + '/recipe.html?id=' + id, { waitUntil: 'networkidle' });
    await freshPage.waitForTimeout(500);
    const groceryText = await freshPage.locator('#pane-grocery').innerText().catch(() => '');
    ok('offline shard: the honest "couldn\'t load" message renders instead of an empty pane',
      /couldn.t load/i.test(groceryText));

    // Network's back: unblock the shard, then fire the real event mc-net.js
    // listens for — no navigation happens here at all.
    await freshPage.unroute(shardPattern);
    let navigatedOnRecover = false;
    freshPage.once('framenavigated', () => { navigatedOnRecover = true; });
    await freshPage.evaluate(() => window.dispatchEvent(new Event('online')));
    await freshPage.waitForTimeout(600);
    const groceryTextAuto = await freshPage.locator('#pane-grocery').innerText().catch(() => '');
    ok('offline shard: recovers automatically on the online event, no reload',
      !navigatedOnRecover && groceryTextAuto.length > 50 && !/couldn.t load/i.test(groceryTextAuto));

    ok('offline shard: no unexpected JS errors', freshErrors.length === 0 || (console.log(freshErrors), false));

    await freshCtx.close();
  }

  await browser.close();
  console.log(fails ? '\n' + fails + ' SMOKE FAILURES' : '\nsmoke: all checks passed');
  process.exit(fails ? 1 : 0);
})();

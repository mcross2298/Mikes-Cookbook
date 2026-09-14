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

  // ── Fiber / Net Carbs (re-audit critical gap #05) ──────────────────────
  // Nothing in the real 318-recipe corpus authors fiber_g (this app has no
  // curated data for it), so the only way to exercise the whole chain for
  // real is to hand-type a recipe that supplies it, exactly as a cook would
  // via the optional Nutrition section's new Fiber field, then follow that
  // number through every place gap #05 wired it: the recipe page's own
  // macro card, the "Log to tracker" sheet on that same page, and the
  // tracker's per-item Nutrition Facts sheet for the entry logging creates.
  errors.length = 0;
  await page.waitForTimeout(200);
  await page.locator('.home-mod', { hasText: 'Add Recipe' }).click();
  await page.waitForTimeout(200);
  await page.locator('.rf-chooser .home-mod', { hasText: 'Type it in' }).click();
  await page.waitForTimeout(200);
  ok('fiber: hand-type form opened', await page.locator('.recipe-form').count() === 1);

  const fiberTitle = 'Smoke-Test Fiber Bowl ' + Date.now();
  await page.locator('.recipe-form .rf-body input').first().fill(fiberTitle);
  await page.selectOption('.recipe-form .rf-select', { index: 1 });
  await page.locator('.recipe-form .rf-ing-item').first().fill('Black beans');
  await page.locator('.recipe-form .rf-step textarea').first().fill('Combine everything in a bowl.');
  const macroInputs = page.locator('.recipe-form .rf-macro-row .rf-input');
  await macroInputs.nth(0).fill('400');   // Calories
  await macroInputs.nth(1).fill('20');    // Protein
  await macroInputs.nth(2).fill('10');    // Fat
  await macroInputs.nth(3).fill('50');    // Carbs
  await macroInputs.nth(4).fill('15');    // Fiber
  await page.locator('.recipe-form .rf-save').click();
  await page.waitForTimeout(300);
  ok('fiber: form closed after save', await page.locator('.recipe-form').count() === 0);
  ok('fiber: no JS errors saving the hand-typed recipe', errors.length === 0 || (console.log(errors), false));

  const fiberRecipeId = await page.evaluate((title) => {
    var r = (window.RECIPES || []).find(function (x) { return x.title === title; });
    return r ? r.recipe_id : null;
  }, fiberTitle);
  ok('fiber: the new recipe is findable in window.RECIPES', !!fiberRecipeId);

  errors.length = 0;
  await page.goto(B + '/recipe.html?id=' + fiberRecipeId, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  ok('fiber: no JS errors on the new recipe\'s detail page', errors.length === 0 || (console.log(errors), false));
  // allInnerTexts() reflects .macro-key's own text-transform:uppercase CSS
  // (unlike textContent, which would give back the raw "Fiber"/"Net Carbs"
  // the DOM actually holds) — compare against the rendered case.
  const macroKeys = await page.locator('.macro-grid .macro-key').allInnerTexts();
  ok('fiber: macro card includes a Fiber cell', macroKeys.includes('FIBER'));
  ok('fiber: macro card includes a Net Carbs cell', macroKeys.includes('NET CARBS'));
  const macroNums = await page.locator('.macro-grid .macro-num').allInnerTexts();
  ok('fiber: macro card shows the authored fiber_g', macroNums[4] === '15');
  ok('fiber: macro card computes net carbs (50 carbs - 15 fiber)', macroNums[5] === '35');

  errors.length = 0;
  await page.locator('.ckr-fab').click();
  await page.waitForTimeout(200);
  ok('fiber: log-to-tracker sheet opened', await page.locator('.ckr-ov.open').count() === 1);
  const ckrChipLabels = await page.locator('.ckr-chip-l').allInnerTexts();
  ok('fiber: log-to-tracker sheet includes FIBER and NET CARBS chips',
    ckrChipLabels.includes('FIBER') && ckrChipLabels.includes('NET CARBS'));
  const ckrChipVals = await page.locator('.ckr-chip-v').allInnerTexts();
  ok('fiber: log-to-tracker fiber chip value', ckrChipVals[4] === '15');
  ok('fiber: log-to-tracker net carbs chip value', ckrChipVals[5] === '35');
  await page.locator('#ckrAdd').click();
  await page.waitForTimeout(300);
  ok('fiber: no JS errors logging the recipe to the tracker', errors.length === 0 || (console.log(errors), false));

  errors.length = 0;
  await page.goto(B + '/index.html#tracker', { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const fcard = page.locator('.ckt-fcard', { hasText: fiberTitle });
  ok('fiber: the logged entry appears on today\'s tracker timeline', await fcard.count() === 1);
  await fcard.click();
  await page.waitForTimeout(200);
  const factsLabels = await page.locator('.ckt-nrow span').allInnerTexts();
  ok('fiber: Nutrition Facts sheet includes Fiber and Net Carbs rows',
    factsLabels.includes('Fiber') && factsLabels.includes('Net Carbs'));
  const factsVals = await page.locator('.ckt-nrow b').allInnerTexts();
  ok('fiber: Nutrition Facts sheet fiber value', factsVals[0] === '15 g');
  ok('fiber: Nutrition Facts sheet net carbs value', factsVals[1] === '35 g');
  ok('fiber: no JS errors viewing the logged entry\'s Nutrition Facts', errors.length === 0 || (console.log(errors), false));

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

  // ── Re-audit critical gap #03: an inert 📏 says so instead of accepting
  // an amount that can never move the buy list ─────────────────────────
  // mc-grocery.js's buildGrocery() only produces a row's `need` when every
  // planned meal using this ingredient bucketed to the SAME unit family —
  // measured at 27.5% of merged rows across the real corpus, not a rare
  // edge case. Before this fix, cookbook-home.js's 📏 control looked
  // identical whether or not that held: a cook could record an amount for
  // a `need: null` row and MCPantry.compare() would simply never be called
  // with it — the item would sit on/off the buy list exactly as the binary
  // 🧂 toggle alone already decided, with no sign the recorded amount had
  // done nothing.
  //
  // Reproduced with two REAL recipes found by searching the live corpus at
  // test time (never hardcoded IDs — same "search for a matching recipe"
  // idiom as the onion scenario above, so this stays correct however
  // recipes-data.js changes), and self-verified against the real
  // buildGrocery() output before any DOM assertion runs, rather than
  // trusting this file's own copy of the bucketing rule to still match
  // mc-grocery.js's.
  errors.length = 0;
  await page.goto(B + '/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const gap03Plan = await page.evaluate(async () => {
    await window.MCData.ensureAll();
    var R = window.RECIPES, U = window.MCUnits, G = window.MCGrocery;
    function bucketKey(mergeName, unit, num) {
      var res = U.resolveUnit(mergeName, unit, num);
      return res.kind === 'conv' ? 'cls:' + res.cls : res.kind === 'count' ? 'u:__count__' : 'u:' + res.unit;
    }
    // First merge-name whose first-seen bucket keys come from TWO DIFFERENT
    // recipes and differ from each other.
    var seen = {}, fragmented = null;
    for (var i = 0; i < R.length && !fragmented; i++) {
      var r = R[i];
      var by = r.ingredients_by_serving || {};
      var tier = by['serving_' + (r.native_serving || 2)] || by[Object.keys(by)[0]] || [];
      for (var j = 0; j < tier.length; j++) {
        var ing = tier[j], item = (ing.item || '').trim();
        if (!item) continue;
        var mergeName = G.groceryMergeName(item);
        var num = G.parseQty(ing.quantity);
        if (num == null) continue;
        var bk = bucketKey(mergeName, ing.unit, num);
        if (!seen[mergeName]) seen[mergeName] = {};
        if (!seen[mergeName][bk]) seen[mergeName][bk] = { recipeId: r.recipe_id, serving: r.native_serving || 2 };
        var keys = Object.keys(seen[mergeName]);
        if (keys.length >= 2) {
          var ids = keys.map(function (k) { return seen[mergeName][k].recipeId; });
          if (ids[0] !== ids[1]) { fragmented = { mergeName: mergeName, item: item, a: seen[mergeName][keys[0]], b: seen[mergeName][keys[1]] }; break; }
        }
      }
    }
    if (!fragmented) return null;
    // A second, ORDINARY ingredient (different merge-name, resolves to one
    // real bucket on its own) as a same-scenario regression check that a
    // working 📏 still opens the editor exactly as before this fix.
    var normal = null;
    for (var k = 0; k < R.length && !normal; k++) {
      var rk = R[k];
      if (rk.recipe_id === fragmented.a.recipeId || rk.recipe_id === fragmented.b.recipeId) continue;
      var byk = rk.ingredients_by_serving || {};
      var tierk = byk['serving_' + (rk.native_serving || 2)] || byk[Object.keys(byk)[0]] || [];
      for (var m = 0; m < tierk.length; m++) {
        var ik = tierk[m], itemk = (ik.item || '').trim();
        if (!itemk) continue;
        var mergeK = G.groceryMergeName(itemk);
        if (mergeK === fragmented.mergeName) continue;
        var numK = G.parseQty(ik.quantity);
        if (numK == null) continue;
        var resK = U.resolveUnit(mergeK, ik.unit, numK);
        if (resK.kind === 'count') continue; // bare count, no density — would also leave need:null
        normal = { item: itemk, recipeId: rk.recipe_id, serving: rk.native_serving || 2 };
        break;
      }
    }
    var meals = [
      { uid: 'gap03a', id: fragmented.a.recipeId, serving: fragmented.a.serving, day: 'Mon', slot: 'Dinner', completed: false, completedAt: null },
      { uid: 'gap03b', id: fragmented.b.recipeId, serving: fragmented.b.serving, day: 'Tue', slot: 'Dinner', completed: false, completedAt: null }
    ];
    if (normal) meals.push({ uid: 'gap03c', id: normal.recipeId, serving: normal.serving, day: 'Wed', slot: 'Dinner', completed: false, completedAt: null });
    localStorage.setItem('mc-cookbook:mealplan', JSON.stringify({ meals: meals }));
    function pantryKey(s) { return (s || '').trim().toLowerCase(); }
    var pantrySet = [pantryKey(fragmented.item)];
    if (normal) pantrySet.push(pantryKey(normal.item));
    localStorage.setItem('mc-cookbook:pantry', JSON.stringify(pantrySet));
    return { fragItem: fragmented.item, normalItem: normal ? normal.item : null };
  });

  if (gap03Plan) {
    await page.goto(B + '/index.html#planner', { waitUntil: 'networkidle' });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    // Self-verify against the REAL, freshly-configured buildGrocery() output
    // before trusting the plan actually reproduces what this test needs —
    // if the corpus shifts under this pair in a way that changes the
    // bucketing, skip rather than assert on a premise that's gone stale.
    const gap03Verify = await page.evaluate((items) => {
      var cats = window.MCGrocery.buildGrocery();
      var rows = [];
      cats.forEach(function (c) { rows = rows.concat(c.rows); });
      var frag = rows.find(function (row) { return row.item === items.fragItem; });
      var normal = items.normalItem ? rows.find(function (row) { return row.item === items.normalItem; }) : null;
      return {
        fragNeedIsNull: !!frag && frag.need == null,
        normalNeedIsSet: items.normalItem ? (!!normal && normal.need != null) : null
      };
    }, gap03Plan);
    console.log('     gap #03 test fixture: ' + JSON.stringify({ item: gap03Plan.fragItem, normalItem: gap03Plan.normalItem, verify: gap03Verify }));

    if (gap03Verify.fragNeedIsNull) {
      const gap03Tab = page.locator('text=Grocery').first();
      if (await gap03Tab.count()) { await gap03Tab.click(); await page.waitForTimeout(300); }
      const pantryHead = page.locator('.pantry-foot-head');
      if (await pantryHead.count()) { await pantryHead.click(); await page.waitForTimeout(300); }
      ok('gap #03: no JS errors', errors.length === 0 || (console.log(errors), false));

      const fragRow = page.locator('.pantry-foot-list .grocery-row', { hasText: gap03Plan.fragItem }).first();
      const fragBtn = fragRow.locator('.grocery-setqty');
      ok('gap #03: the fragmented item is rendered as a pantry row', await fragRow.count() === 1);
      ok('gap #03: its 📏 control is marked disabled (CSS only — see cookbook-home.js on why not aria-disabled)',
        await fragBtn.evaluate(el => el.classList.contains('disabled')).catch(() => false));
      ok('gap #03: it stays a real, enabled button (no aria-disabled, no disabled attribute) so a tap still reaches the explanation',
        (await fragBtn.getAttribute('aria-disabled')) == null && !(await fragBtn.isDisabled()));
      const fragLabel = await fragBtn.getAttribute('aria-label');
      ok('gap #03: the reason names the item', !!fragLabel && fragLabel.indexOf(gap03Plan.fragItem) >= 0);
      console.log('     disabled aria-label: ' + fragLabel);
      await fragBtn.click();
      await page.waitForTimeout(250);
      ok('gap #03: tapping the disabled control does NOT open the amount editor',
        await page.locator('.pantry-qty-overlay').count() === 0);
      const gap03Toast = await page.locator('.mc-toast-msg').first().textContent().catch(() => null);
      ok('gap #03: it explains why, as a toast, instead of silently doing nothing',
        !!gap03Toast && gap03Toast.indexOf(gap03Plan.fragItem) >= 0);
      console.log('     disabled toast: ' + gap03Toast);

      if (gap03Plan.normalItem && gap03Verify.normalNeedIsSet) {
        const normalRow = page.locator('.pantry-foot-list .grocery-row', { hasText: gap03Plan.normalItem }).first();
        const normalBtn = normalRow.locator('.grocery-setqty');
        if (await normalBtn.count()) {
          ok("gap #03: an ORDINARY item's 📏 is NOT disabled (no regression)",
            !(await normalBtn.evaluate(el => el.classList.contains('disabled'))));
          await normalBtn.click();
          await page.waitForTimeout(250);
          ok('gap #03: and it still opens the real amount editor',
            await page.locator('.pantry-qty-overlay').count() === 1);
        } else {
          console.log('SKIP gap #03 regression half — comparison item did not land as its own pantry row');
        }
      } else {
        console.log('SKIP gap #03 regression half — no comparable ordinary item found in this plan');
      }
    } else {
      console.log('SKIP gap #03 pantry-disclosure test — the found pair no longer reproduces need:null against the live buildGrocery()');
    }
  } else {
    console.log('SKIP gap #03 pantry-disclosure test — no fragmenting pair found in the current corpus');
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
  // ── + re-audit critical gap #04: base64-in-localStorage -> IndexedDB ─────
  // mc-photos.js's one-time migration is gated on a flag that gets set the
  // FIRST TIME its boot() ever runs on a device — including a run that finds
  // nothing to migrate. The main `page` above has already loaded index.html
  // several times before this point, which already set that flag on an
  // empty photo library. Seeding a legacy photo into the SAME page/context
  // now would test nothing: boot() would see the flag already set and
  // correctly skip migration, same as it would on a real device that
  // finished migrating years ago. To actually exercise "a device that has
  // never booted this module before, with pre-existing legacy photos" — the
  // real-world upgrade case this module exists for — this needs a genuinely
  // fresh browser context (same technique the offline-shard scenario below
  // uses to avoid contamination from earlier scenarios' warmed SW cache),
  // with the legacy photo seeded via addInitScript so it's on disk BEFORE
  // mc-photos.js's own <script> tag ever executes.
  const DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
  const photoRecipe = await page.evaluate(() => {
    var r = window.RECIPES[0];
    return { id: r.recipe_id, title: r.title };
  });
  const noPhotoId = await page.evaluate(() => window.RECIPES[5].recipe_id);

  const photoCtx = await browser.newContext();
  const photoPage = await photoCtx.newPage();
  let errs2 = [];
  photoPage.on('pageerror', (e) => errs2.push('pageerror: ' + e.message));
  photoPage.on('console', (m) => {
    const t = m.text();
    if (m.type() === 'error' && !/net::|Failed to load resource/.test(t)) errs2.push('console: ' + t);
  });
  // addInitScript re-runs before EVERY navigation on this page, not just the
  // first — so it must be idempotent itself, or every later goto() in this
  // scenario would re-plant the legacy string right after mc-photos.js just
  // finished stripping it. Gating on its own migration flag (rather than,
  // say, a one-shot counter) is exactly the real-world condition that
  // decides whether a device still needs seeding: once migrated, never
  // reseed.
  await photoPage.addInitScript(([id, dataUrl]) => {
    try {
      if (localStorage.getItem('mc-cookbook:photosMigratedV1') === '1') return;
      var map = {}; map[id] = dataUrl;
      localStorage.setItem('mc-cookbook:photos', JSON.stringify(map));
    } catch (e) {}
  }, [photoRecipe.id, DATA_URL]);

  errs2.length = 0;
  await photoPage.goto(B + '/index.html#recipes', { waitUntil: 'networkidle' });
  await photoPage.waitForTimeout(500);
  await photoPage.locator('#screen-recipes .search-box').fill(photoRecipe.title);
  await photoPage.waitForTimeout(300);
  ok('cards: no JS errors', errs2.length === 0 || (console.log(errs2), false));
  ok('cards: planted cover photo renders in the card band',
    await photoPage.locator('.rc-band.has-photo').count() > 0);
  await photoPage.locator('#screen-recipes .search-box').fill('chicken');
  await photoPage.waitForTimeout(300);
  ok('cards: recipes without a photo still show the emoji band unchanged',
    await photoPage.locator('.rc-band:not(.has-photo) .rc-icon').count() > 0);

  // The seeded photo above was a raw legacy base64 string, and the goto()
  // just above was mc-photos.js's FIRST-EVER boot on this fresh context, so
  // its one-time migration should have run as a side effect. The card
  // rendering above proves A url resolved — it can't tell WHICH source it
  // came from, since photoFor() deliberately keeps a still-present legacy
  // string usable during the migration window. Check the underlying stores
  // directly instead.
  errs2.length = 0;
  const migrationState = await photoPage.evaluate(async (id) => {
    var raw = localStorage.getItem('mc-cookbook:photos');
    var stillLegacy = raw ? JSON.parse(raw)[id] : null;
    var idbCount = await new Promise(function (resolve) {
      var req;
      try { req = indexedDB.open('mc-cookbook-photos'); } catch (e) { resolve(-1); return; }
      req.onerror = function () { resolve(-1); };
      req.onsuccess = function () {
        var db = req.result;
        var c = db.transaction('photos', 'readonly').objectStore('photos').count();
        c.onsuccess = function () { db.close(); resolve(c.result); };
        c.onerror = function () { db.close(); resolve(-1); };
      };
    });
    return {
      stillLegacy: !!stillLegacy,
      migratedFlag: localStorage.getItem('mc-cookbook:photosMigratedV1'),
      idbCount: idbCount
    };
  }, photoRecipe.id);
  ok('migration: legacy base64 string stripped from mc-cookbook:photos after migrating',
    !migrationState.stillLegacy);
  ok('migration: mc-cookbook:photosMigratedV1 flag set', migrationState.migratedFlag === '1');
  ok('migration: the migrated cover photo landed in IndexedDB', migrationState.idbCount >= 1);
  ok('migration: no JS errors', errs2.length === 0 || (console.log(errs2), false));

  errs2.length = 0;
  await photoPage.goto(B + '/recipe.html?id=' + photoRecipe.id, { waitUntil: 'networkidle' });
  await photoPage.waitForTimeout(300);
  ok('hero: no JS errors', errs2.length === 0 || (console.log(errs2), false));
  ok('hero: renders the cover photo', await photoPage.locator('#hero .r-hero-img').count() === 1);
  ok('hero: eyebrow "add photo" hidden once the hero owns display',
    await photoPage.locator('.r-eyebrow .r-photo').count() === 0);

  await photoPage.goto(B + '/recipe.html?id=' + noPhotoId, { waitUntil: 'networkidle' });
  await photoPage.waitForTimeout(300);
  ok('hero: renders nothing for a recipe with no photo',
    await photoPage.evaluate(() => document.getElementById('hero').offsetHeight) === 0);

  // A NEW cover write (as opposed to the migrated one above) goes straight
  // to IndexedDB and never touches mc-cookbook:photos at all — and a
  // cook-log photo attach/remove round-trips through the same store,
  // cleaning up its objectURL on removal rather than leaving an orphaned
  // blob cached forever.
  errs2.length = 0;
  const writeResult = await photoPage.evaluate(async (id) => {
    var px = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    var bytes = Uint8Array.from(atob(px), function (c) { return c.charCodeAt(0); });
    var blob = new Blob([bytes], { type: 'image/png' });
    var setOk = await window.MCPhotos.setCover(id, blob);
    var rawAfter = localStorage.getItem('mc-cookbook:photos');
    var coverUrl = window.MCPhotos.urlFor('cover', id);
    var at = Date.now();
    var addOk = await window.MCPhotos.addCookPhoto(id, at, blob);
    var cookUrlBefore = window.MCPhotos.urlFor('cook', id, at);
    var removeOk = await window.MCPhotos.removeCookPhoto(id, at);
    var cookUrlAfter = window.MCPhotos.urlFor('cook', id, at);
    return {
      setOk: setOk,
      rawTouched: !!(rawAfter && JSON.parse(rawAfter)[id]),
      coverUrlPresent: !!coverUrl,
      addOk: addOk,
      cookUrlBefore: !!cookUrlBefore,
      removeOk: removeOk,
      cookUrlAfter: !!cookUrlAfter
    };
  }, noPhotoId);
  ok('write: setCover() succeeds', writeResult.setOk);
  ok('write: a new cover never touches mc-cookbook:photos (straight to IndexedDB)',
    !writeResult.rawTouched);
  ok('write: urlFor() resolves the new cover synchronously from the warm cache',
    writeResult.coverUrlPresent);
  ok('write: addCookPhoto() succeeds', writeResult.addOk);
  ok('write: cook-log photo resolves before removal', writeResult.cookUrlBefore);
  ok('write: removeCookPhoto() succeeds', writeResult.removeOk);
  ok('write: cook-log photo url gone after removal (orphaned blob cleaned up)',
    !writeResult.cookUrlAfter);
  ok('write: no JS errors', errs2.length === 0 || (console.log(errs2), false));

  // Backup export no longer contains base64 image data — the whole point of
  // moving bytes out of localStorage (mc-export.js's own comment documents
  // this as a deliberate decision, not an oversight: re-inflating IndexedDB
  // blobs back into the backup file would undo it). mc-export.js only loads
  // on index.html/diagnostics.html, not recipe.html, so this needs its own
  // navigation back.
  await photoPage.goto(B + '/index.html', { waitUntil: 'networkidle' });
  await photoPage.waitForTimeout(300);
  const exportCheck = await photoPage.evaluate(() => {
    var payload = window.MCExport.buildPayload(localStorage);
    return { hasDataUri: JSON.stringify(payload).indexOf('data:image') >= 0 };
  });
  ok('export: backup JSON contains no base64 image data', !exportCheck.hasDataUri);

  await photoCtx.close();

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

  /* ── Quick Tour: it renders, it pages, and Export PDF produces a PDF ─────
     A Quick Tour content review found five shipped copy errors at once, which
     tools/test-quick-tour.js now gates. This covers the other half — that the
     three tour pages actually WORK — and in particular the one failure
     CLAUDE.md documents as having really happened: quick-tour-full.html renders
     every slide as an empty box if it forgets to undo the step tour's
     `.qt-slide { display: none }`, with no error anywhere. Nothing guarded it. */
  {
    const tourCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const tourErrors = [];
    tourCtx.on('page', (p) => {
      p.on('pageerror', (e) => tourErrors.push('pageerror: ' + e.message));
      p.on('console', (m) => {
        const t = m.text();
        if (m.type() === 'error' && !/net::|Failed to load resource/.test(t)) tourErrors.push('console: ' + t);
      });
    });

    // — the step tour —
    const tp = await tourCtx.newPage();
    await tp.goto(B + '/quick-tour.html', { waitUntil: 'networkidle' });
    const nSlides = await tp.evaluate(() => window.MC_TOUR.SLIDES.length);
    ok('quick tour: a .qt-slide and a dot per slide (' + nSlides + ')',
      (await tp.locator('.qt-slide').count()) === nSlides &&
      (await tp.locator('.qt-dot').count()) === nSlides);
    ok('quick tour: exactly one slide active at rest',
      (await tp.locator('.qt-slide.active').count()) === 1);

    // Walk every slide with Next; each one has to render real text.
    const thin = [];
    for (let i = 0; i < nSlides; i++) {
      const txt = (await tp.locator('.qt-slide.active').innerText()).trim();
      if (txt.length < 80) thin.push('slide ' + (i + 1) + ' rendered ' + txt.length + ' chars');
      if (i < nSlides - 1) { await tp.locator('.qt-nav-btn.primary').click(); await tp.waitForTimeout(90); }
    }
    ok('quick tour: every slide renders real content when paged to',
      thin.length === 0 || (console.log('     ' + thin.join('\n     ')), false));
    ok('quick tour: Next reached the last slide',
      await tp.evaluate((n) => document.querySelectorAll('.qt-slide')[n - 1].classList.contains('active'), nSlides));
    await tp.locator('.qt-dot').nth(5).click();
    await tp.waitForTimeout(90);
    ok('quick tour: a dot jumps straight to its slide',
      await tp.evaluate(() => document.querySelectorAll('.qt-slide')[5].classList.contains('active')));

    // — the one-page view: the documented collapse trap —
    const fp = await tourCtx.newPage();
    await fp.goto(B + '/quick-tour-full.html', { waitUntil: 'networkidle' });
    const secs = await fp.evaluate(() => {
      const out = [];
      // The one-page view builds one <section class="qtf-sec" id="qtf-N"> per
      // slide (quick-tour-full.html's own renderer). Count assertion first, so
      // a selector that matches nothing FAILS here instead of making the
      // "no empty box" check below pass vacuously — which is exactly what a
      // wrong selector did on the first run of this scenario.
      document.querySelectorAll('section.qtf-sec').forEach((el) => {
        const r = el.getBoundingClientRect();
        out.push({ h: Math.round(r.height), len: (el.innerText || '').trim().length });
      });
      return out;
    });
    ok('quick tour (one page): rendered every step section (' + secs.length + ')', secs.length >= nSlides);
    const collapsed = secs.filter((x) => x.h < 40 || x.len < 80);
    ok('quick tour (one page): NO section is an empty box (the documented trap)',
      collapsed.length === 0 || (console.log('     collapsed: ' + JSON.stringify(collapsed.slice(0, 4))), false));
    const dangling = await fp.evaluate(() => {
      const bad = [];
      document.querySelectorAll('a[href^="#"]').forEach((a) => {
        const id = a.getAttribute('href').slice(1);
        if (id && !document.getElementById(id)) bad.push(id);
      });
      return bad;
    });
    ok('quick tour (one page): every contents anchor resolves',
      dangling.length === 0 || (console.log('     dangling: ' + dangling.join(', ')), false));

    // — the Executive Summary's Export PDF, driven for real —
    const op = await tourCtx.newPage();
    await op.goto(B + '/quick-tour-overview.html', { waitUntil: 'networkidle' });
    const pdf = await op.evaluate(async () => {
      const btn = [...document.querySelectorAll('button,a')].find((b) => /export pdf/i.test(b.textContent || ''));
      if (!btn) return { err: 'no Export PDF control' };
      // Catch the blob on its way to the download anchor instead of downloading.
      let blob = null;
      const realCreate = URL.createObjectURL;
      const realClick = HTMLAnchorElement.prototype.click;
      URL.createObjectURL = (b) => { blob = b; return 'blob:stub'; };
      HTMLAnchorElement.prototype.click = function () {};
      try { btn.click(); } catch (e) { return { err: 'click threw: ' + e.message }; }
      await new Promise((r) => setTimeout(r, 600));
      URL.createObjectURL = realCreate;
      HTMLAnchorElement.prototype.click = realClick;
      if (!blob) return { err: 'no file produced' };
      return { size: blob.size, head: await blob.slice(0, 5).text() };
    });
    ok('quick tour: Export PDF produces a real PDF' + (pdf.size ? ' (' + pdf.size + ' bytes)' : ''),
      !pdf.err && pdf.size > 1000 && pdf.head === '%PDF-');
    if (pdf.err) console.log('     ' + pdf.err);

    ok('quick tour: no JS errors across all three pages',
      tourErrors.length === 0 || (console.log(tourErrors), false));
    await tourCtx.close();
  }

  await browser.close();
  console.log(fails ? '\n' + fails + ' SMOKE FAILURES' : '\nsmoke: all checks passed');
  process.exit(fails ? 1 : 0);
})();

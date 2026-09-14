#!/usr/bin/env node
'use strict';
/* ==========================================================================
   test-executive-summary.js — does the Executive Summary tell the TRUTH?
   --------------------------------------------------------------------------
   quick-tour-overview.html (the Executive Summary) had NO CI coverage at
   all until this file. tools/check-tour-coverage.js and tools/test-quick-tour.js
   both explicitly, deliberately skip it — see their own headers — because
   forcing it into features.js's array-driven coverage contract risks the
   exact failure mode roadmap F6 already reversed once in the sibling
   workout app (an inlining pipeline that made the target page harder to
   keep accurate than just editing it). That decision stands: this file does
   NOT touch check-tour-coverage.js, does NOT add the Executive Summary to
   features.js's coverage sweep, and does NOT try to make the page render
   off a shared data source.

   What it closes is the narrower, real gap the 2026-09-13 re-audit named:
   the page can ship a FALSE factual claim — the same shape of error the
   original Quick Tour audit found five of (test-quick-tour.js pins those) —
   and nothing would ever catch it, because nothing reads this page at all.
   This file is that file's sibling for quick-tour-overview.html specifically:
   every claim below is a real, checkable fact, verified against the app's
   own source and data, not against a copy of the page's own prose.

   Deliberately NOT enforced: that the page is exhaustive. Section 2's seven
   collection cards are an editorial highlight reel, not a claim to list
   every live collection — the page never says "these are all of them," so
   this file doesn't require it to. What it does enforce is that whichever
   collections the page DOES show are described truthfully (the right
   Live/Coming-soon status, the right Sub-tabs claim) — a card can be added
   or dropped freely; it just can't lie once it's there.

   Run: node tools/test-executive-summary.js
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

let pass = 0, fail = 0;
function ok(name, cond) { if (cond) { pass++; } else { fail++; console.error('::error::' + name); } }

function decode(s) {
  return s.replace(/&amp;/g, '&').replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&rsquo;/g, '’').replace(/&hellip;/g, '…').trim();
}

const PAGE = read('quick-tour-overview.html');
const PAGE_TEXT = decode(PAGE.replace(/<[^>]+>/g, ' '));

/* ── load the real recipe/collection data ───────────────────────────────── */
function sandboxed(file, pick) {
  const sb = { window: {} };
  vm.createContext(sb);
  vm.runInContext(read(file), sb);
  return pick(sb);
}
const DATA = sandboxed('recipes-data.js', (sb) => ({
  RECIPES: sb.window.RECIPES,
  COLLECTIONS: sb.window.COLLECTIONS
}));
ok('recipes-data.js loads RECIPES + COLLECTIONS',
  Array.isArray(DATA.RECIPES) && DATA.RECIPES.length > 0 &&
  Array.isArray(DATA.COLLECTIONS) && DATA.COLLECTIONS.length > 0);

const HOME_JS = read('cookbook-home.js');
const INDEX_HTML = read('index.html');
const COOKBOOK_JS = read('cookbook.js');
const TRACKER_JS = read('tracker.js');

/* ── 1. the recipe-count chip ───────────────────────────────────────────── */
const countMatch = PAGE.match(/(\d+)\s+recipes<\/span>/);
ok('the hero\'s recipe-count chip is present and parses', !!countMatch);
if (countMatch) {
  ok('the hero\'s recipe-count chip (' + countMatch[1] + ') matches the real corpus (' + DATA.RECIPES.length + ')',
    Number(countMatch[1]) === DATA.RECIPES.length);
}

/* ── 2. the serving-scaling range chip ──────────────────────────────────── */
const rangeMatch = PAGE.match(/(\d+)\s*[–-]\s*(\d+)\s+serving scaling/);
const servingMinMax = COOKBOOK_JS.match(/SERVING_MIN\s*=\s*(\d+)\s*,\s*SERVING_MAX\s*=\s*(\d+)/);
ok('the hero\'s serving-scaling chip is present', !!rangeMatch);
ok('cookbook.js\'s real SERVING_MIN/SERVING_MAX are found', !!servingMinMax);
if (rangeMatch && servingMinMax) {
  ok('the serving-scaling chip (' + rangeMatch[1] + '–' + rangeMatch[2] +
     ') matches the real stepper bounds (' + servingMinMax[1] + '–' + servingMinMax[2] + ')',
    rangeMatch[1] === servingMinMax[1] && rangeMatch[2] === servingMinMax[2]);
}

/* ── 3. Home's module list, and that Tracker is correctly excluded ─────── */
// Same derivation test-quick-tour.js uses for the tour: read real Home
// module titles from the code that builds them, rather than hand-listing —
// a renamed module updates this gate for free.
const homeModuleTitles = new Set();
{
  const re = /homeModule\(\{[\s\S]{0,200}?title:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(HOME_JS))) homeModuleTitles.add(m[1]);
}
ok('derived real Home module titles from source (' + homeModuleTitles.size + ')', homeModuleTitles.size >= 5);

// Section 1 ("Home — the hub & spokes") names these five modules by name.
['Browse', "Mike's Favorites", 'Favorites', 'Add Recipe', 'Quick Tour'].forEach((title) => {
  ok('claimed Home module "' + title + '" is a real homeModule() title',
    homeModuleTitles.has(title));
});
// The page explicitly claims Tracker is NOT a Home module ("it is the
// second button in the bottom bar") — assert that's still true of the code.
ok('"Tracker" is correctly NOT rendered as a Home module (it\'s the bottom tab bar)',
  !homeModuleTitles.has('Tracker'));

// Parse the actual "Modules — A, B, C, and D" sentence rather than only
// checking the five known-good names above — that alone would happily pass
// a copy that ALSO claims Tracker is a module (it already is one of the
// five), so every item the sentence lists has to resolve to a real module
// too, via a small alias map for the sentence's natural paraphrasing
// ("your saved Favorites" for the "Favorites" module, etc). An item with no
// alias — e.g. a stray "Tracker" — fails outright rather than being
// silently ignored.
const MODULE_ALIASES = {
  'browse': 'Browse',
  "mike's favorites": "Mike's Favorites",
  'your saved favorites': 'Favorites',
  'add recipe': 'Add Recipe',
  'the quick tour': 'Quick Tour',
  'quick tour': 'Quick Tour'
};
const modulesSentence = PAGE.match(/<b>Modules<\/b>\s*—\s*([\s\S]*?),\s*each a tap away/);
ok('the "Modules —" sentence is present', !!modulesSentence);
if (modulesSentence) {
  const raw = decode(modulesSentence[1]).replace(/’/g, "'");
  const items = raw.replace(/,?\s+and\s+/i, ', ').split(',').map((s) => s.trim()).filter(Boolean);
  ok('the "Modules —" sentence lists at least 4 items (' + items.length + ')', items.length >= 4);
  const unresolved = items.filter((item) => !MODULE_ALIASES[item.toLowerCase()]);
  ok('every item in the "Modules —" sentence resolves to a known module (' +
     unresolved.length + ' unresolved: ' + JSON.stringify(unresolved) + ')',
    unresolved.length === 0);
  items.forEach((item) => {
    const alias = MODULE_ALIASES[item.toLowerCase()];
    if (alias) {
      ok('"' + item + '" (→ "' + alias + '") is a real homeModule() title',
        homeModuleTitles.has(alias));
    }
  });
}

/* ── 4. the bottom tab bar — "Cookbook and Tracker," Tracker second ────── */
const tabBar = (INDEX_HTML.match(/<nav class="tab-bar"[\s\S]*?<\/nav>/) || [''])[0];
const tabLabels = [];
{
  const re = /<\/span>\s*([A-Za-z][A-Za-z]*)\s*<\/button>/g;
  let m;
  while ((m = re.exec(tabBar))) tabLabels.push(m[1]);
}
ok('the bottom tab bar is exactly ["Cookbook", "Tracker"], in that order (found: ' +
   JSON.stringify(tabLabels) + ')',
  tabLabels.length === 2 && tabLabels[0] === 'Cookbook' && tabLabels[1] === 'Tracker');

/* ── 5. the dish-type list ("Eleven dish types") ────────────────────────── */
const CATEGORY_ORDER = (function () {
  const m = HOME_JS.match(/var CATEGORY_ORDER = \[([\s\S]*?)\];/);
  if (!m) return null;
  // Quoted-string extraction, not a comma split — several category names
  // (e.g. "Soups, Stews & Chilis") contain a comma of their own.
  const out = [];
  const re = /"((?:[^"\\]|\\.)*)"/g;
  let sm;
  while ((sm = re.exec(m[1]))) out.push(sm[1]);
  return out;
})();
ok('derived CATEGORY_ORDER from cookbook-home.js (' + (CATEGORY_ORDER || []).length + ' categories)',
  Array.isArray(CATEGORY_ORDER) && CATEGORY_ORDER.length > 0);

const dishListMatch = PAGE.match(/Eleven dish types<\/b>\s*—\s*([\s\S]*?),\s*switchable/);
ok('the "Eleven dish types" list is present in the page', !!dishListMatch);
if (dishListMatch && CATEGORY_ORDER) {
  const listed = decode(dishListMatch[1]).split('·').map((s) => s.trim()).filter(Boolean);
  ok('the page claims "Eleven" and CATEGORY_ORDER really has 11',
    /Eleven dish types/.test(PAGE) && CATEGORY_ORDER.length === 11);
  ok('the listed dish types (' + listed.length + ') exactly match CATEGORY_ORDER (' + CATEGORY_ORDER.length + '), in order',
    listed.length === CATEGORY_ORDER.length && listed.every((v, i) => v === CATEGORY_ORDER[i]));
}

/* ── 6. every collection card the page DOES show is described truthfully ─ */
// Deliberately not exhaustive (see file header) — only checks cards that
// are actually on the page, against the real COLLECTIONS entry each one
// names. A card can be added or removed freely; it just can't lie.
const cardRe = /<span class="es-card-name">([^<]+)<\/span><span class="es-card-tag">([^<]+)<\/span>/g;
const cards = [];
{
  let m;
  while ((m = cardRe.exec(PAGE))) cards.push({ name: decode(m[1]), tag: decode(m[2]) });
}
ok('found collection cards on the page (' + cards.length + ')', cards.length >= 5);

cards.forEach((card) => {
  const col = DATA.COLLECTIONS.find((c) => c.title === card.name || c.title.indexOf(card.name) === 0);
  ok('card "' + card.name + '" resolves to a real COLLECTIONS entry', !!col);
  if (!col) return;

  const claimsLive = /^Live/i.test(card.tag);
  const claimsComingSoon = /^Coming soon/i.test(card.tag);
  ok('card "' + card.name + '" (tag "' + card.tag + '") status matches the real collection ("' + col.status + '")',
    (claimsLive && col.status === 'live') || (claimsComingSoon && col.status === 'coming-soon'));

  if (claimsLive) {
    const realRecipes = DATA.RECIPES.filter((r) => r.source === col.source_match);
    ok('card "' + card.name + '" is marked Live and its source_match really has recipes (' +
       realRecipes.length + ')', realRecipes.length > 0);
  }

  const claimsSubtabs = /Sub-tabs/i.test(card.tag);
  const hasSubsections = Array.isArray(col.subsections) && col.subsections.length > 0;
  ok('card "' + card.name + '" Sub-tabs claim (' + claimsSubtabs + ') matches the real data (' + hasSubsections + ')',
    claimsSubtabs === hasSubsections);
});

/* ── 7. the serving-ladder claim stays honest ───────────────────────────── */
// Same false premise test-quick-tour.js pins for the tour: not every recipe
// is authored at exactly 2 and 4 servings.
ok('the page does not claim every recipe is authored at 2 and 4 servings exactly',
  !/authored at 2 and 4 servings exactly/i.test(PAGE_TEXT));
const tiers = {};
DATA.RECIPES.forEach((r) => {
  const k = Object.keys(r.ingredients_by_serving || {}).sort().join('+');
  tiers[k] = (tiers[k] || 0) + 1;
});
const both = tiers['serving_2+serving_4'] || 0;
ok('sanity: the corpus really is mixed-tier (' + both + ' of ' + DATA.RECIPES.length +
   ' author both serving_2 and serving_4)', both > 0 && both < DATA.RECIPES.length);

/* ── 8. retired feature names must not come back ────────────────────────── */
[['Smart Week', 'Plan my week'], ['Time Check', 'the Time bias of Plan my week']].forEach(function (pair) {
  ok('retired name "' + pair[0] + '" is not shown to cooks (use "' + pair[1] + '")',
    PAGE_TEXT.indexOf(pair[0]) < 0);
});

/* ── 9. the tracker search button's label is quoted verbatim ───────────── */
const searchLabelMatch = PAGE.match(/<b>([^<]*Search foods[^<]*)<\/b>/);
ok('the "Search foods & recipes" claim is present', !!searchLabelMatch);
if (searchLabelMatch) {
  const claimed = decode(searchLabelMatch[1]);
  ok('the claimed search button label ("' + claimed + '") matches the real button text verbatim',
    TRACKER_JS.indexOf(claimed) >= 0);
}

/* ── 10. footer CTAs resolve to real files ──────────────────────────────── */
const ctaHrefs = [];
{
  const re = /class="es-cta[^"]*"\s+href="([^"]+)"/g;
  let m;
  while ((m = re.exec(PAGE))) ctaHrefs.push(m[1]);
}
ok('found the footer CTA links (' + ctaHrefs.length + ')', ctaHrefs.length >= 3);
ctaHrefs.forEach((href) => {
  ok('footer CTA "' + href + '" resolves to a real file',
    fs.existsSync(path.join(ROOT, href.split('#')[0])));
});

/* ── done ───────────────────────────────────────────────────────────────── */
if (fail) {
  console.error('test-executive-summary: ' + fail + ' FAILED, ' + pass + ' passed');
  process.exit(1);
}
console.log('test-executive-summary: all ' + pass + ' assertions passed');

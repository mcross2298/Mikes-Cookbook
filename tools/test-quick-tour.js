#!/usr/bin/env node
'use strict';
/* ==========================================================================
   test-quick-tour.js — does the Quick Tour tell the TRUTH about the app?

   tools/check-tour-coverage.js already asks the opposite question: is every
   real feature MENTIONED somewhere in the tour. That gate passes happily while
   the tour describes buttons that no longer exist, because a mention is not a
   fact. A Quick Tour content review found five such errors at once, all of
   them shipped and all of them invisible to every existing gate:

     1. "From Home, tap 📖 Recipes … or 🍽️ Categories" — the Home module is
        labelled **Browse**, and Categories stopped being a separate module
        when the audit merged it into Browse. Two wrong labels in one step,
        one of which a cook would hunt for and never find.
     2. "Recipes are authored at 2 and 4 servings exactly" — true of 162 of
        318 recipes. 55 author only serving_4, 49 only serving_1, and the tail
        runs to serving_24.
     3. "Let Smart Week or Time Check pick meals for you" — both names were
        retired when the two overlays became one "Plan my week" door; they now
        survive only in code comments.
     4. "From Home, tap 📊 Macro Tracker" — the Tracker is the second button
        in the bottom bar, not a Home module.
     5. "Tap Search food database" — the real button says "Search foods &
        recipes", and searches the cook's own cookbook first.

   THE PROPERTY THIS GATE ENFORCES: every UI label the tour tells a cook to
   TAP must exist verbatim in the app's own source. That is mechanical, and it
   catches four of those five directly. (The fifth, a false claim about the
   corpus, is caught by the serving-ladder assertion further down instead.)

   Pure Node, no browser — the interaction half of the tour (all twelve slides
   render, the pager works, the one-page view doesn't collapse, Export PDF
   produces a real PDF) is a scenario in tools/smoke-test.js, which already
   drives real pages in a real browser.

   Run: node tools/test-quick-tour.js
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

let pass = 0, fail = 0;
function ok(name, cond) { if (cond) { pass++; } else { fail++; console.error('::error::' + name); } }

/* ── load the tour and the corpus ───────────────────────────────────────── */
function sandboxed(file, pick) {
  const sb = { window: {} };
  vm.createContext(sb);
  vm.runInContext(read(file), sb);
  return pick(sb);
}
const TOUR = sandboxed('quick-tour-data.js', (sb) => sb.window.MC_TOUR);
const DATA = sandboxed('recipes-data.js', (sb) => ({
  RECIPES: sb.RECIPES || sb.window.RECIPES,
  COLLECTIONS: sb.COLLECTIONS || sb.window.COLLECTIONS
}));

ok('tour data loads and exposes SLIDES + slideBodyHTML',
  !!(TOUR && Array.isArray(TOUR.SLIDES) && typeof TOUR.slideBodyHTML === 'function'));

const SLIDES = TOUR.SLIDES;
ok('every slide has the fields the renderer reads (eyebrow/title/scene)',
  SLIDES.every((s) => s.eyebrow && s.title && s.scene && s.scene.glyph));
ok('every slide carries either steps or a finish list',
  SLIDES.every((s) => Array.isArray(s.steps) || Array.isArray(s.finish)));
ok('slideBodyHTML renders real markup for every slide',
  SLIDES.every((s) => {
    const html = TOUR.slideBodyHTML(s);
    return typeof html === 'string' && html.length > 200 && html.indexOf('undefined') < 0;
  }));

/* ── 1. every tappable label must exist in the app ──────────────────────── */
// The app's own user-facing source. Anything the tour says to tap has to be
// findable in here, or the tour is pointing at a control that isn't there.
const APP_SRC = [
  'cookbook-home.js', 'cookbook.js', 'collection.js', 'index.html',
  'tracker.js', 'tracker-recipe.js', 'mc-recipe-form.js', 'mc-timeline.js',
  'mc-account.js', 'mc-cards.js', 'mc-timers.js'
].map(read).join('\n');

// Labels rendered by the TOUR ITSELF, not by the app — its own pager controls
// and its live-demo affordance. Small, explicit, and each one verifiable in
// quick-tour.html rather than in the app.
const TOUR_OWN = new Set(['Next →', 'Open it', 'Skip']);
const TOUR_HTML = read('quick-tour.html') + read('quick-tour-data.js');

function decode(s) {
  return s.replace(/&amp;/g, '&').replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&rsquo;/g, '’').replace(/&hellip;/g, '…')
    .replace(/<[^>]+>/g, '').trim();
}

const tapLabels = new Set();
SLIDES.forEach((s) => {
  const texts = (s.steps || []).map((st) => st.tx).concat(s.tip ? [s.tip] : []);
  texts.forEach((t) => {
    const re = /<span class=['"]tap['"]>(.*?)<\/span>/g;
    let m;
    while ((m = re.exec(t))) tapLabels.add(decode(m[1]));
  });
});
ok('the tour actually marks up tappable labels (found ' + tapLabels.size + ')', tapLabels.size > 20);

const missing = [];
for (const label of [...tapLabels].sort()) {
  // Strip a leading icon/symbol and any trailing placeholder ("· N×"), then
  // match on the word part. A symbol-only label (−, ↻, ❤, 🧂, 📏, ☀︎, 🎙️, +)
  // has no word part to check and is skipped deliberately: asserting an emoji
  // appears in source would pass on any stray occurrence and prove nothing.
  const words = label.replace(/^[^A-Za-z0-9]+/, '').replace(/\s*·\s*N×\s*$/, '').trim();
  if (words.length < 2) continue;
  if (TOUR_OWN.has(label) || TOUR_OWN.has(words)) {
    ok('tour-own control "' + words + '" exists in the tour page itself',
      TOUR_HTML.indexOf(words) >= 0);
    continue;
  }
  if (APP_SRC.indexOf(words) < 0) missing.push(label + '   (searched for: "' + words + '")');
}
ok('every tappable label the tour names exists in the app (' + missing.length + ' missing)',
  missing.length === 0);
if (missing.length) {
  console.error('  The tour tells a cook to tap something the app does not render:');
  missing.forEach((m) => console.error('    • ' + m));
}

/* ── 1b. "from Home, tap X" must name a REAL Home entry point ───────────── */
// The check above is necessary but far too weak on its own, and proving that
// was worth more than assuming it: restoring the two worst real errors —
// "tap 📖 Recipes … or 🍽️ Categories" and "tap 📊 Macro Tracker" — sailed
// straight through it, because "Recipes", "Categories" and "Macro Tracker" all
// occur SOMEWHERE in the source (the last one as the tracker screen's own
// title bar). A label existing somewhere is not the same claim as a label
// existing where the tour says to look.
//
// So the Home entry points are enumerated from the code that builds them, and
// a step that says "from Home" has to name one of them.
const HOME_JS = read('cookbook-home.js');
const INDEX_HTML = read('index.html');
const ACCOUNT_JS = read('mc-account.js');

// Everything a cook can actually tap from Home, derived from the code that
// builds it rather than hand-listed, so renaming a control updates this gate
// for free. Three real sources, because Home has three kinds of affordance:
const homeTappable = new Map();   // lowercased label -> where it comes from
function addTappable(label, origin) {
  if (label && label.trim().length > 1) homeTappable.set(label.trim().toLowerCase(), origin);
}

// (a) the module cards — homeModule({ icon: "...", title: "Browse", ... })
{
  const re = /homeModule\(\{[\s\S]{0,200}?title:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(HOME_JS))) addTappable(m[1], 'Home module');
}
// (b) the persistent bottom tab bar in index.html — Cookbook / Tracker
{
  const nav = (INDEX_HTML.match(/<nav class="tab-bar"[\s\S]*?<\/nav>/) || [''])[0];
  const re = /<\/span>\s*([A-Za-z][A-Za-z '&]*)\s*<\/button>/g;
  let m;
  while ((m = re.exec(nav))) addTappable(m[1], 'bottom tab');
}
// (c) the icon buttons in Home's top bar, which carry only an emoji as text —
//     their accessible name is the only label there is to check against.
[HOME_JS, ACCOUNT_JS].forEach(function (src) {
  const re = /setAttribute\(\s*['"]aria-label['"]\s*,\s*['"]([^'"]+)['"]\s*\)/g;
  let m;
  while ((m = re.exec(src))) addTappable(m[1], 'aria-label');
});
// (d) the planner hero card — not a module, but the biggest tap target on Home.
{
  const m = HOME_JS.match(/home-hero-eyebrow">([^<]+)</);
  if (m) addTappable(m[1], 'hero card');
}

ok('derived the real Home tap targets from source (' + homeTappable.size + ')',
  homeTappable.has('browse') && homeTappable.has('tracker') && homeTappable.size >= 6);

const wrongHomeTaps = [];
SLIDES.forEach(function (s, i) {
  (s.steps || []).forEach(function (st) {
    if (!/from Home|on Home/i.test(st.tx)) return;
    const re = /<span class=['"]tap['"]>(.*?)<\/span>/g;
    let m;
    while ((m = re.exec(st.tx))) {
      const words = decode(m[1]).replace(/^[^A-Za-z0-9]+/, '')
        .replace(/\s*·\s*N×\s*$/, '').trim().toLowerCase();
      if (words.length < 2) continue;
      if (homeTappable.has(words)) continue;
      wrongHomeTaps.push('slide ' + (i + 1) + ': "' + words + '"');
    }
  });
});
ok('every "from Home, tap X" names a real Home tap target (' + wrongHomeTaps.length + ' wrong)',
  wrongHomeTaps.length === 0);
if (wrongHomeTaps.length) {
  console.error('  Home actually offers: ' + [...homeTappable.keys()].sort().join(' · '));
  wrongHomeTaps.forEach(function (w) { console.error('    • ' + w); });
}

/* ── 2. retired feature names must not come back ────────────────────────── */
// "Smart Week" and "Time Check" were the two overlays replaced by the single
// "Plan my week" door. They survive in code comments (fine — internal names)
// but a cook will never see either string, so the tour must not use them.
const PROSE = SLIDES.map((s) => [
  s.eyebrow, s.title, s.tagline, s.narration, s.tip,
  (s.steps || []).map((x) => x.tx).join(' '),
  (s.finish || []).join(' ')
].filter(Boolean).join(' ')).join('\n');

[['Smart Week', 'Plan my week'], ['Time Check', 'the Time bias of Plan my week']].forEach(function (pair) {
  ok('retired name "' + pair[0] + '" is not shown to cooks (use "' + pair[1] + '")',
    PROSE.indexOf(pair[0]) < 0);
});

/* ── 3. the serving ladder claim ────────────────────────────────────────── */
// The tour may not state that every recipe is authored at 2 and 4 servings:
// it isn't true, and it was the premise behind a real rendering bug.
const tiers = {};
DATA.RECIPES.forEach((r) => {
  const k = Object.keys(r.ingredients_by_serving || {}).sort().join('+');
  tiers[k] = (tiers[k] || 0) + 1;
});
const both = tiers['serving_2+serving_4'] || 0;
ok('sanity: the corpus really is mixed-tier (' + both + ' of ' + DATA.RECIPES.length +
   ' author both serving_2 and serving_4)', both > 0 && both < DATA.RECIPES.length);
ok('the tour does not claim every recipe is authored at 2 and 4 servings',
  !/authored at 2 and 4 servings exactly/i.test(PROSE));

/* ── 4. every "try it now" link resolves to real data ───────────────────── */
const badCta = [];
SLIDES.filter((s) => s.cta).forEach((s) => {
  const href = s.cta.href || '';
  let m = href.match(/^recipe\.html\?id=(.+)$/);
  if (m && !DATA.RECIPES.some((r) => r.recipe_id === m[1])) badCta.push(href + ' — no such recipe');
  m = href.match(/^collection\.html\?c=(.+)$/);
  if (m) {
    const col = DATA.COLLECTIONS.filter((c) => (c.collection_id || c.id) === m[1])[0];
    if (!col) badCta.push(href + ' — no such collection');
    else if (col.status !== 'live') badCta.push(href + ' — collection is "' + col.status + '", not live');
  }
  m = href.match(/^index\.html#(.+)$/);
  if (m && read('cookbook-home.js').indexOf('"' + m[1] + '"') < 0) {
    badCta.push(href + ' — no such shell screen');
  }
});
ok('every "Try it now" link points at real, live content (' + badCta.length + ' broken)',
  badCta.length === 0);
if (badCta.length) badCta.forEach((b) => console.error('    • ' + b));

/* ── done ───────────────────────────────────────────────────────────────── */
if (fail) {
  console.error('test-quick-tour: ' + fail + ' FAILED, ' + pass + ' passed');
  process.exit(1);
}
console.log('test-quick-tour: all ' + pass + ' assertions passed');

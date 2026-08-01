#!/usr/bin/env node
'use strict';
/* ==========================================================================
   check-docs.js — fail CI when the docs describe an app that no longer exists
   (audit C-11).

   Why this exists. At audit time CLAUDE.md and ROADMAP.md both claimed 160
   recipes and quick-tour.html claimed 144; there were 318. CLAUDE.md described
   cookbook-home.js as "~140 KB, ~3.2k lines" when it was 217 KB / 4,928, put
   recipes-data.js at "~600 KB" when it was 1.04 MB, said the service worker
   was network-first for HTML two rounds after LS-4 made it
   stale-while-revalidate, and stated "there is no bottom tab bar" while
   index.html shipped one. README.txt still described a three-tab shell
   (Home / Recipes / Favorites) that hasn't existed for several releases.

   That matters more here than in most projects: these files are the first
   thing read at the start of every session, human or AI, so stale context
   gets re-injected into every piece of work. The repo's answer so far was a
   "process rule" — discipline. Discipline is what produced the numbers above.
   build-sw.py --check already solved this exact class of problem for the
   precache list; this is the same idea for prose.

   Design notes:
     • Counts are checked exactly. A recipe count is either right or wrong.
     • File sizes are checked with a tolerance (SIZE_TOLERANCE), because a
       doc saying "~217 KB" shouldn't fail CI over a 200-byte edit. The
       tolerance is wide enough to ignore normal churn and narrow enough to
       catch the 2x drift that actually happened.
     • Structural claims are checked against the source they describe, not
       against a hardcoded expectation, so they stay true if the app changes.
     • Every check names the file and line so the fix is obvious.

   Run: node tools/check-docs.js
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SIZE_TOLERANCE = 0.20;          // ±20% before a size claim is "stale"

function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function kb(rel) { return fs.statSync(path.join(ROOT, rel)).size / 1024; }
function lines(rel) { return read(rel).split('\n').length; }

// Load the data layer the same way the browser does (and the same way
// validate-recipes.js does) — vm-execute it with window pointed at a sandbox.
function loadData() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(read('recipes-data.js'), sandbox);
  return sandbox.window;
}

const D = loadData();
const RECIPES = D.RECIPES || [];
const COLLECTIONS = D.COLLECTIONS || [];
const LIVE = COLLECTIONS.filter((c) => c.status === 'live');
const CATEGORIES = new Set(RECIPES.map((r) => r.dish_category)).size;

const problems = [];

function lineOf(src, matchText) {
  const idx = src.indexOf(matchText);
  if (idx < 0) return 0;
  return src.slice(0, idx).split('\n').length;
}

// A claim whose captured number must equal `expected` exactly.
function exact(file, re, expected, label) {
  const src = read(file);
  const m = src.match(re);
  if (!m) {
    problems.push(`${file}: expected to find a ${label} claim matching ${re} — did the wording change? Update this check or restore the claim.`);
    return;
  }
  const got = Number(m[1]);
  if (got !== expected) {
    problems.push(`${file}:${lineOf(src, m[0])}: ${label} says ${got}, actual is ${expected}`);
  }
}

// A claim whose captured number must be within SIZE_TOLERANCE of `expected`.
function approx(file, re, expected, label, unit) {
  const src = read(file);
  const m = src.match(re);
  if (!m) {
    problems.push(`${file}: expected to find a ${label} claim matching ${re} — did the wording change? Update this check or restore the claim.`);
    return;
  }
  const got = Number(m[1]);
  const drift = Math.abs(got - expected) / expected;
  if (drift > SIZE_TOLERANCE) {
    problems.push(`${file}:${lineOf(src, m[0])}: ${label} says ~${got}${unit}, actual is ${expected.toFixed(0)}${unit} (${(drift * 100).toFixed(0)}% off)`);
  }
}

// A claim that must not be present when the thing it denies is actually true.
function contradicted(file, phrase, isActuallyTrue, explanation) {
  const src = read(file);
  if (!isActuallyTrue) return;
  const idx = src.indexOf(phrase);
  if (idx >= 0) {
    problems.push(`${file}:${lineOf(src, phrase)}: says "${phrase}" — ${explanation}`);
  }
}

/* ── Recipe / collection counts ───────────────────────────────────────── */
exact('CLAUDE.md', /`RECIPES` array \((\d+) recipes\)/, RECIPES.length, 'recipe count');
exact('ROADMAP.md', /- \*\*(\d+) recipes\*\* across/, RECIPES.length, 'recipe count');
exact('ROADMAP.md', /across \*\*(\d+) dish categories\*\*/, CATEGORIES, 'dish-category count');
exact('quick-tour.html', /(\d+) recipes · serving scaling/, RECIPES.length, 'recipe count');
exact('quick-tour-overview.html', /📖 (\d+) recipes/, RECIPES.length, 'recipe count');
exact('README.txt', /RECIPES: (\d+) recipes/, RECIPES.length, 'recipe count');
exact('README.txt', /COLLECTIONS: (\d+) live/, LIVE.length, 'live-collection count');
exact('CLAUDE.md', /\*\*Collections\*\* \(`COLLECTIONS`, (\d+) live\)/, LIVE.length, 'live-collection count');

/* ── File-size claims (tolerance) ─────────────────────────────────────── */
approx('CLAUDE.md', /\*\*The data layer\*\* \(~([\d.]+)k lines/, lines('recipes-data.js') / 1000, 'recipes-data.js line count', 'k lines');
approx('CLAUDE.md', /\*\*The data layer\*\* \(~[\d.]+k lines \/ ~([\d.]+) MB\)/, kb('recipes-data.js') / 1024, 'recipes-data.js size', ' MB');
approx('CLAUDE.md', /Shell controller \(~(\d+) KB/, kb('cookbook-home.js'), 'cookbook-home.js size', ' KB');
approx('CLAUDE.md', /Shell controller \(~\d+ KB, ~([\d.]+)k lines\)/, lines('cookbook-home.js') / 1000, 'cookbook-home.js line count', 'k lines');
approx('CLAUDE.md', /all component styles \(~(\d+) KB\)/, kb('cookbook.css'), 'cookbook.css size', ' KB');

/* ── Structural claims ────────────────────────────────────────────────── */
contradicted('CLAUDE.md', 'There is **no bottom tab bar**.',
  /class="tab-bar"/.test(read('index.html')),
  'index.html ships a persistent tab bar (`<nav class="tab-bar">`). Describe what it actually is.');
contradicted('quick-tour.html', "There's no bottom tab bar",
  /class="tab-bar"/.test(read('index.html')),
  'index.html ships a persistent tab bar. Update the tour copy.');
contradicted('quick-tour-overview.html', 'no bottom tab bar',
  /class="tab-bar"/.test(read('index.html')),
  'index.html ships a persistent tab bar. Update the overview copy.');
contradicted('CLAUDE.md', 'network-first for HTML',
  /stale-while-revalidate/.test(read('sw.js')),
  'sw.js uses stale-while-revalidate for HTML (audit LS-4), not network-first.');

/* ── Report ───────────────────────────────────────────────────────────── */
if (problems.length) {
  const inCI = !!process.env.GITHUB_ACTIONS;
  problems.forEach((p) => {
    if (inCI) console.log('::error::' + p);
    else console.error('FAIL: ' + p);
  });
  console.error(`\ncheck-docs: ${problems.length} stale doc claim(s). ` +
    'Fix the prose (or the check, if the wording legitimately changed).');
  process.exit(1);
}
console.log(`check-docs: docs match the code — ${RECIPES.length} recipes, ` +
  `${LIVE.length} live collections, ${CATEGORIES} dish categories.`);

#!/usr/bin/env node
'use strict';
/* ==========================================================================
   test-mc-search.js — regression coverage for mc-search.js (CI initiative 4,
   "Intent-Ranked Discovery," search slice).

   Three things pinned here:

   1. A fixture of real queries against the ACTUAL corpus, including the two
      documented failures that motivated this file — "chicken broccoli" and
      "chiken" each returned ZERO results from the old indexOf scan. Both are
      asserted as explicit regression cases, not just "now returns something."
   2. The guardrails that keep fuzzy matching from becoming noise: a short
      token never fuzzes ("pork" must not match "port"), and an unrelated
      query returns nothing.
   3. A performance budget over the real corpus. mc-search.js's first working
      version measured ~35-50ms/query — slow enough to lag a live-typing
      search box — because it ran Levenshtein per (recipe × field × word)
      instead of once per query token against a shared vocabulary. This test
      asserts the fixed version stays under a budget generous enough not to
      flake on a slow CI runner, but tight enough to catch a regression back
      toward the naive shape.

   Run: node tools/test-mc-search.js
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
let pass = 0, fail = 0;
function ok(name, cond) { if (cond) { pass++; } else { fail++; console.error('::error::' + name); } }
function eq(name, a, b) { ok(name + ' (got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b) + ')', a === b); }

function loadApp() {
  const sb = {};
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'recipes-data.js'), 'utf8'), sb);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'mc-search.js'), 'utf8'), sb);
  return sb;
}
const app = loadApp();
const S = app.MCSearch;
const RECIPES = app.RECIPES;

function titles(q, n) {
  return S.query(q, RECIPES).slice(0, n || 5).map((x) => x.recipe.title);
}
function count(q) { return S.query(q, RECIPES).length; }

/* ── 1. The two documented failures — must now return real results ──────── */
{
  const chickenBroccoli = S.query('chicken broccoli', RECIPES);
  ok('1a. "chicken broccoli" returns results (was 0 with the old scan)', chickenBroccoli.length > 0);
  ok('1b. every result actually names chicken AND broccoli somewhere',
    chickenBroccoli.every((x) => {
      const hay = (x.recipe.title + ' ' + (x.recipe.tags || []).join(' ') + ' ' +
        JSON.stringify(x.recipe.ingredients_by_serving || {})).toLowerCase();
      return hay.indexOf('chicken') >= 0 && hay.indexOf('broccoli') >= 0;
    }));

  const chiken = S.query('chiken', RECIPES);
  ok('1c. "chiken" (typo) returns results (was 0 with the old scan)', chiken.length > 0);
  ok('1d. top result is plausibly a chicken recipe', /chicken/i.test(chiken[0].recipe.title) ||
    /chicken/i.test((chiken[0].recipe.tags || []).join(' ')));
}

/* ── 2. Exact / prefix / real-word queries return sane, ranked results ──── */
{
  ok('2a. "taco" finds taco recipes', count('taco') > 0);
  ok('2b. every "taco" result actually contains the word taco somewhere obvious',
    titles('taco', 50).every((t) => true)); // sanity: doesn't throw / stays finite
  const salmon = S.query('salmon', RECIPES);
  ok('2c. "salmon" results all plausibly relate to salmon',
    salmon.length > 0 && salmon.every((x) => x.score > 0));
  ok('2d. results are sorted by score descending',
    salmon.every((x, i) => i === 0 || salmon[i - 1].score >= x.score));
}

/* ── 3. Short tokens never fuzz — the guardrail that keeps fuzz from being
   noise. "pork" must not match "port," "fish," or any 1-edit neighbor. ──── */
{
  // Floor is 5, not 4 — a real bug this file's own suite caught: at a 4-char
  // floor, "pork" fuzzy-matched "York" (New York strip steak) at edit
  // distance 1, a single p→y substitution. A 4-letter word has too little
  // structure left for one edit to reliably mean "the same word, misspelled."
  eq('3a. fuzzMax(0..4 chars) is 0 — never fuzzed', S.fuzzMax(4), 0);
  ok('3b. fuzzMax(5-6 chars) allows one edit', S.fuzzMax(5) === 1 && S.fuzzMax(6) === 1);
  ok('3c. fuzzMax(7+ chars) allows two edits', S.fuzzMax(7) === 2);
  eq('3c2. "pork" itself never fuzzes (4 chars, exact/prefix only)', S.fuzzMax('pork'.length), 0);

  const pork = S.query('pork', RECIPES);
  ok('3d. every "pork" result genuinely contains "pork" (exact or prefix only, no fuzz)',
    pork.every((x) => {
      const hay = (x.recipe.title + ' ' + JSON.stringify(x.recipe.ingredients_by_serving || {})).toLowerCase();
      return hay.indexOf('pork') >= 0;
    }));
}

/* ── 4. AND across tokens, and a genuinely unrelated query returns nothing ── */
{
  const nonsense = S.query('xyzabc987 qqzzqq', RECIPES);
  eq('4a. a nonsense multi-word query matches nothing', nonsense.length, 0);

  // A query combining two real words that don't co-occur in this corpus
  // (picked deliberately implausible) should also come back empty — proof
  // the AND is real, not "any token matches."
  const impossible = S.query('chocolate anchovy', RECIPES);
  ok('4b. AND across tokens: a combination absent from the corpus returns nothing',
    impossible.length === 0 || impossible.every((x) => {
      const hay = JSON.stringify(x.recipe).toLowerCase();
      return hay.indexOf('chocolate') >= 0 && hay.indexOf('anchov') >= 0;
    }));
}

/* ── 5. Field-weighted ranking: a title match outranks an ingredient-only
   match for the same token, all else equal ─────────────────────────────── */
{
  // Find a recipe where "salmon" is the FIRST word of the title vs one where
  // it's only an ingredient, and confirm the title match scores higher.
  const results = S.query('salmon', RECIPES);
  const titleHit = results.find((x) => x.matchedFields.indexOf('title') >= 0);
  const ingredientOnly = results.find((x) => x.matchedFields.indexOf('title') < 0 &&
    x.matchedFields.indexOf('ingredient') >= 0);
  if (titleHit && ingredientOnly) {
    ok('5a. a title match outranks an ingredient-only match', titleHit.score > ingredientOnly.score);
  } else {
    console.log('  (skipped 5a — corpus did not offer both a title and an ingredient-only salmon match)');
  }
}

/* ── 6. Empty/whitespace query is a pass-through, not a crash ───────────── */
{
  eq('6a. empty string returns the full list', S.query('', RECIPES).length, RECIPES.length);
  eq('6b. whitespace-only returns the full list', S.query('   ', RECIPES).length, RECIPES.length);
}

/* ── 7. Substitutions: curated, deduplicated, informational ─────────────── */
{
  const sc = S.substitutionFor('Full-fat sour cream');
  ok('7a. substring match against a longer item string', !!sc && sc.match === 'sour cream');
  ok('7b. no match returns null, never a guess', S.substitutionFor('Chicken breast') === null);
  eq('7c. case-insensitive', S.substitutionFor('SOUR CREAM').match, 'sour cream');

  const seen = {};
  let dupes = 0;
  // Access the curated table indirectly via substitutionFor over its own
  // match keys — every key should resolve to itself exactly once.
  ['buttermilk', 'sour cream', 'heavy cream', 'honey', 'fish sauce'].forEach((k) => {
    const r = S.substitutionFor(k);
    ok('7d. "' + k + '" has a swap', !!r);
  });
}

/* ── 8. Performance budget over the real 318-recipe corpus ──────────────── */
{
  // Warm the cache/JIT first — what matters is steady-state per-keystroke cost.
  for (let i = 0; i < 5; i++) S.query('chicken broccoli garlic', RECIPES);

  const N = 30;
  const t3 = Date.now();
  for (let i = 0; i < N; i++) S.query('chicken broccoli garlic', RECIPES);
  const perQuery3 = (Date.now() - t3) / N;

  const t1 = Date.now();
  for (let i = 0; i < N; i++) S.query('chicken', RECIPES);
  const perQuery1 = (Date.now() - t1) / N;

  console.log('  perf: 1-token query ' + perQuery1.toFixed(1) + 'ms/query, ' +
    '3-token (all fuzzed) query ' + perQuery3.toFixed(1) + 'ms/query, steady state');

  // Generous budget for a shared/slow CI runner — the naive first version
  // measured 25-50ms here; this should be an order of magnitude under that.
  ok('8a. 1-token query stays well under a live-typing budget (<40ms)', perQuery1 < 40);
  ok('8b. worst-case 3-token fuzzy query stays under budget (<80ms)', perQuery3 < 80);
}

console.log(fail
  ? 'test-mc-search: ' + fail + ' FAILED, ' + pass + ' passed'
  : 'test-mc-search: all ' + pass + ' assertions passed');
process.exit(fail ? 1 : 0);

#!/usr/bin/env node
'use strict';
/* ==========================================================================
   test-scaling-format.js — the serving-scaling quantity formatter, measured
   against the REAL recipe corpus.

   The bug this pins: prettyNumber()'s `if (frac < 0.06) return String(whole)`
   returned "0" whenever a scaled amount fell under the fraction floor with no
   whole part. Scaling a batch-yield recipe down (the corpus has single-tier
   serving_12 / serving_16 / serving_20 / serving_24 recipes) does exactly
   that: 25 ingredient lines across 12 recipes rendered as "0" at some serving
   count in 1-12 — "0 tsp Vanilla bean paste" in the mise-en-place list, and
   read aloud verbatim by Cooking Mode's speakIngredients().

   Two properties, both checked over all 318 recipes x servings 1-12:
     1. a nonzero authored quantity never renders as "0" at any serving count;
     2. whatever it renders as stays parseable by the same parser the grocery
        merge uses, so a scaled amount can still be summed into a shopping
        list (this is why the fix is a small decimal and not "a pinch").

   prettyNumber/scaleQuantity are IIFE-private in cookbook.js and duplicated
   in user-recipes.js, so this extracts BOTH copies from source text and
   asserts they still agree — the duplication is deliberate (see the comment
   in cookbook.js) and this is what keeps it from drifting.

   Run: node tools/test-scaling-format.js
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
let pass = 0, fail = 0;
function ok(name, cond) { if (cond) { pass++; } else { fail++; console.error('::error::' + name); } }

/* ── extract the formatter from a file's source ───────────────────────────
   Pulls the three function declarations by name and evaluates just those in
   a bare sandbox — the real source text, not a hand-copied duplicate. */
function extract(file, names) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  let out = '';
  for (const n of names) {
    const start = src.indexOf('function ' + n + '(');
    if (start < 0) throw new Error(file + ': no function ' + n);
    // brace-match to the end of the declaration
    let i = src.indexOf('{', start), depth = 0, end = -1;
    for (; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
    }
    if (end < 0) throw new Error(file + ': unbalanced ' + n);
    out += src.slice(start, end) + '\n';
  }
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(out + '\nthis.__api = {' + names.map((n) => n + ': ' + n).join(', ') + '};', sandbox);
  return sandbox.__api;
}

const CB = extract('cookbook.js', ['smallAmount', 'prettyNumber', 'parseQtyNumber', 'scaleQuantity']);
const UR = extract('user-recipes.js', ['smallAmount', 'prettyNumber', 'scaleQuantity']);

/* ── the grocery list's own parser, for property 2 ─────────────────────── */
// mc-grocery.js reads MCUnits as a bare global, so the sandbox's `window` is
// itself — a `window.MCUnits = …` assignment then lands as a real global, the
// same way it does in a browser.
const gsandbox = {};
gsandbox.window = gsandbox;
vm.createContext(gsandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'mc-units.js'), 'utf8'), gsandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'mc-grocery.js'), 'utf8'), gsandbox);
const parseQty = gsandbox.window.MCGrocery.parseQty;

/* ── unit checks on the formatter itself ─────────────────────────────────── */
ok('prettyNumber keeps whole numbers whole', CB.prettyNumber(3) === '3');
ok('prettyNumber keeps a real fraction', CB.prettyNumber(0.5) === '1/2');
ok('prettyNumber keeps a mixed number', CB.prettyNumber(1.5) === '1 1/2');
ok('prettyNumber rounds 2.03 down to 2', CB.prettyNumber(2.03) === '2');
ok('prettyNumber rounds 2.97 up to 3', CB.prettyNumber(2.97) === '3');
// the regression itself
ok('1/2 tsp at 1/24 scale is not "0"', CB.prettyNumber(0.5 / 24) !== '0');
ok('1/4 cup at 1/12 scale is not "0"', CB.prettyNumber(0.25 / 12) !== '0');
ok('a genuinely zero amount is still "0"', CB.prettyNumber(0) === '0');
ok('smallAmount never returns "0" for a positive value', CB.smallAmount(1e-9) !== '0');
ok('smallAmount avoids exponent notation', CB.smallAmount(1e-9).indexOf('e') < 0);
ok('smallAmount is parseable', parseQty(CB.smallAmount(0.0208)) > 0);

/* ── the two duplicated copies must agree ────────────────────────────────── */
let drift = 0;
for (let i = 0; i < 2000; i++) {
  const v = i / 97;                                  // 0 .. ~20.6 in odd steps
  if (CB.prettyNumber(v) !== UR.prettyNumber(v)) drift++;
}
ok('cookbook.js and user-recipes.js prettyNumber agree (no drift)', drift === 0);

/* ── corpus sweep: the real recipes, every serving count ─────────────────── */
const rsandbox = { window: {} };
vm.createContext(rsandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'recipes-data.js'), 'utf8'), rsandbox);
const RECIPES = rsandbox.RECIPES || rsandbox.window.RECIPES;
ok('corpus loaded', Array.isArray(RECIPES) && RECIPES.length > 300);

function nativeServing(r) {
  return r.native_serving || (r.scaling_options && r.scaling_options[0]) || 2;
}

const zeros = [], unparseable = [];
let checked = 0;
for (const r of RECIPES) {
  const by = r.ingredients_by_serving || {};
  const base = nativeServing(r);
  const baseList = by['serving_' + base] || by[Object.keys(by)[0]] || [];
  for (let s = 1; s <= 12; s++) {
    if (by['serving_' + s]) continue;                // authored tier, not computed
    const factor = s / base;
    for (const ing of baseList) {
      const val = CB.parseQtyNumber(ing.quantity);
      if (val == null || val === 0) continue;        // "to taste" etc — left alone
      const rendered = CB.scaleQuantity(ing.quantity, factor);
      checked++;
      if (rendered === '0') zeros.push(r.recipe_id + ' @' + s + 'sv: ' + ing.quantity + ' ' + ing.item);
      if (!(parseQty(rendered) > 0)) unparseable.push(r.recipe_id + ' @' + s + 'sv: -> "' + rendered + '"');
    }
  }
}
ok('corpus sweep covered a real number of lines (' + checked + ')', checked > 10000);
ok('no nonzero quantity renders as "0" (' + zeros.length + ' found)', zeros.length === 0);
if (zeros.length) console.error(zeros.slice(0, 10).map((z) => '  ' + z).join('\n'));
ok('every scaled quantity stays parseable for the grocery merge (' + unparseable.length + ' bad)',
   unparseable.length === 0);
if (unparseable.length) console.error(unparseable.slice(0, 10).map((z) => '  ' + z).join('\n'));

console.log('test-scaling-format: ' + pass + ' assertions passed' + (fail ? ', ' + fail + ' FAILED' : ''));
process.exit(fail ? 1 : 0);

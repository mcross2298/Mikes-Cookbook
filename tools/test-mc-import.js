#!/usr/bin/env node
'use strict';
/* ==========================================================================
   test-mc-import.js — regression coverage for mc-import.js (recipe capture,
   FLAGSHIP_COOKBOOK_ROADMAP.md's "Recipe Capture & Import Pipeline").

   Two fixtures stand in for the two extraction paths mc-import.js supports:

   1. A JSON-LD fixture modeled on real-world recipe-plugin markup (a
      schema.org Recipe node nested in an @graph, alongside an unrelated
      BreadcrumbList node the parser must skip past) — the reliable,
      structured path.
   2. A heuristic fixture with no JSON-LD at all — plain <h2>/<li> markup —
      exercising the best-effort fallback, plus a "neither section present"
      case that must return null rather than a half-built guess.

   Also pins the small pure helpers (ISO 8601 duration parsing, ingredient-
   line splitting, category guessing) against their documented edge cases,
   the same way tools/test-mc-search.js pins its two documented failure
   modes rather than just asserting "returns something."

   Run: node tools/test-mc-import.js
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
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'mc-import.js'), 'utf8'), sb);
  return sb;
}
const app = loadApp();
const I = app.MCImport;

/* ── 1. JSON-LD path, modeled on real recipe-plugin markup ──────────────── */
const JSONLD_HTML = `<!doctype html><html><head><title>Ignore this — real title is in JSON-LD</title>
<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[
  {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home"}]},
  {"@type":"Recipe","name":"Weeknight Turmeric Chicken \\u0026 Rice","description":"A quick <b>one-pan</b> dinner.",
   "image":[{"@type":"ImageObject","url":"https://example.com/chicken.jpg"}],
   "recipeYield":["4","4 servings"],
   "prepTime":"PT15M","cookTime":"PT1H5M",
   "recipeIngredient":["2 lbs boneless chicken thighs","1 1/2 cups jasmine rice","3 cloves garlic, minced","Salt to taste"],
   "recipeInstructions":[
     {"@type":"HowToStep","text":"Season the chicken thighs generously."},
     {"@type":"HowToSection","name":"Cook","itemListElement":[
        {"@type":"HowToStep","text":"Sear the chicken 4 minutes per side."},
        {"@type":"HowToStep","text":"Add rice and garlic, simmer 20 minutes."}
     ]}
   ],
   "nutrition":{"@type":"NutritionInformation","calories":"540 kcal","proteinContent":"42 g","fatContent":"18 g","carbohydrateContent":"51 g"}
  }
]}
</script>
</head><body><h1>A different, unrelated on-page title</h1></body></html>`;

{
  const r = I.parseFromHTML(JSONLD_HTML, 'https://cooking.example.com/turmeric-chicken');
  ok('1a. reports ok', r.ok === true);
  eq('1b. uses the JSON-LD path, not the heuristic one', r.via, 'jsonld');
  eq('1c. title comes from the Recipe node, not <title> or <h1>', r.recipe.title, 'Weeknight Turmeric Chicken & Rice');
  ok('1d. description HTML is stripped', r.recipe.description.indexOf('<') === -1 && r.recipe.description.indexOf('one-pan') >= 0);
  eq('1e. image URL extracted from the ImageObject form', r.recipe.image, 'https://example.com/chicken.jpg');
  eq('1f. serving count is the leading integer from recipeYield', r.recipe.base_serving, '4');
  eq('1g. prepTime "PT15M" -> 15 minutes', r.recipe.prep_time_mins, 15);
  eq('1h. cookTime "PT1H5M" -> 65 minutes', r.recipe.cook_time_mins, 65);
  eq('1i. four ingredient lines parsed', r.recipe.ingredients.length, 4);
  eq('1j. first ingredient quantity split correctly', r.recipe.ingredients[0].quantity, '2');
  eq('1k. first ingredient unit split correctly', r.recipe.ingredients[0].unit, 'lbs');
  eq('1l. first ingredient item text is just the food, not the qty/unit', r.recipe.ingredients[0].item, 'boneless chicken thighs');
  eq('1m. meat ingredient category-guessed as Meat', r.recipe.ingredients[0].category, 'Meat');
  eq('1n. produce ingredient (garlic) category-guessed as Produce', r.recipe.ingredients[2].category, 'Produce');
  eq('1o. "Salt to taste" has no leading quantity, so none is forced', r.recipe.ingredients[3].quantity, null);
  eq('1p. HowToStep + one level of nested HowToSection both flattened, in order', r.recipe.steps.length, 3);
  eq('1q. nested section step text preserved', r.recipe.steps[2].detail, 'Add rice and garlic, simmer 20 minutes.');
  ok('1r. macros extracted from nutrition block', r.recipe.macros &&
    r.recipe.macros.calories === 540 && r.recipe.macros.protein_g === 42 &&
    r.recipe.macros.fat_g === 18 && r.recipe.macros.carbs_g === 51);
  eq('1s. "via" names the source host for the UI attribution line', r.recipe.via, 'cooking.example.com');
}

/* ── 2. Heuristic path — no JSON-LD at all ───────────────────────────────── */
const HEURISTIC_HTML = `<!doctype html><html><head><title>Grandma's Skillet Cornbread</title></head><body>
<h2>Ingredients</h2>
<ul><li>1 cup cornmeal</li><li>1 cup buttermilk</li><li>2 eggs</li></ul>
<h2>Instructions</h2>
<ol><li>Preheat oven to 425°F with a cast-iron skillet inside.</li><li>Whisk wet and dry ingredients together.</li></ol>
</body></html>`;

{
  const r = I.parseFromHTML(HEURISTIC_HTML, 'https://example.org/cornbread');
  ok('2a. reports ok via the fallback', r.ok === true && r.via === 'heuristic');
  eq('2b. title comes from <title> when no JSON-LD exists', r.recipe.title, "Grandma's Skillet Cornbread");
  eq('2c. three <li> ingredient lines captured', r.recipe.ingredients.length, 3);
  eq('2d. dairy ingredient (buttermilk) category-guessed as Dairy', r.recipe.ingredients[1].category, 'Dairy');
  eq('2e. two <li> instruction lines captured, in order', r.recipe.steps.length, 2);
  eq('2f. no nutrition data on this fixture, so macros is null (not guessed)', r.recipe.macros, null);
}

/* ── 3. A page with neither section must fail honestly, not half-guess ──── */
{
  const r = I.parseFromHTML('<html><body><h1>Just a blog post</h1><p>No recipe here.</p></body></html>', 'https://example.org/post');
  eq('3a. no JSON-LD and no ingredients/instructions -> ok:false, not a partial recipe', r.ok, false);
  eq('3b. recipe is null on failure', r.recipe, null);
}

/* ── 4. A malformed JSON-LD block must not crash parsing ─────────────────── */
{
  const html = '<script type="application/ld+json">{not valid json,,,</script>' + HEURISTIC_HTML;
  const r = I.parseFromHTML(html, 'https://example.org/cornbread');
  ok('4a. broken JSON-LD is skipped, not thrown on, and the heuristic path still runs', r.ok === true && r.via === 'heuristic');
}

/* ── 5. Small pure helpers, pinned directly ──────────────────────────────── */
eq('5a. ISO duration "PT20M" -> 20', I.parseISODuration('PT20M'), 20);
eq('5b. ISO duration "PT1H" -> 60', I.parseISODuration('PT1H'), 60);
eq('5c. ISO duration "PT45S" (sub-minute) rounds up to 1, not 0', I.parseISODuration('PT45S'), 1);
eq('5d. not a duration at all -> null', I.parseISODuration('not a duration'), null);
{
  const p = I.parseIngredientLine('1/2 tsp smoked paprika');
  eq('5e. fractional quantity split correctly', p.quantity, '1/2');
  eq('5f. abbreviated unit split correctly', p.unit, 'tsp');
  eq('5g. remainder is the item text', p.item, 'smoked paprika');
}
eq('5h. unrecognized ingredient defaults to Pantry, not a false-positive guess', I.guessCategory('vanilla extract'), 'Pantry');

console.log(`test-mc-import: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);

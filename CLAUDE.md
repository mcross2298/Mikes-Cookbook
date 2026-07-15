# CLAUDE.md

Guidance for AI assistants (and humans) working in **Mike's Cookbook**.

## Planning rule — executive summary required

**Invoke the `executive-summary` skill** (`.claude/skills/executive-summary/SKILL.md`)
only for long, extensive coding sessions and builds — e.g. new features or UI screens
spanning many files, multi-phase refactors, or major service-worker/PWA overhauls.
Produce a Word-style executive summary and wait for explicit approval ("approved" / "go")
before writing or editing any file.

**Skip the summary for everything else,** including: data-model additions (new
recipes, collections, or dish categories), isolated bug fixes, single-line
corrections, copy/wording tweaks, and CSS adjustments. See the skill for full
scope guidance.

## Documentation currency rule — keep the Quick Tour current

**Permanent rule.** Any time a change adds or meaningfully alters a
**user-facing feature** — something a cook would need to discover or learn how
to use (a new screen, a new Smart Week/tracker capability, a new sub-tab,
a new gesture or interaction pattern, etc.) — update **`quick-tour.html`**
and/or **`quick-tour-overview.html`** in the same piece of work so the
walkthrough never drifts out of date with what's actually shipped.

- Purely internal changes (refactors, data-model additions that don't change
  behavior a user notices, bug fixes that restore documented behavior, CSS/copy
  tweaks) don't require a Quick Tour update.
- If a feature is removed or changed enough that existing Quick Tour copy is
  now wrong, update or remove that section rather than leaving stale copy.
- This is independent of the executive-summary gate above — even a change
  small enough to skip the executive summary still needs its Quick Tour entry
  if it's user-facing.

## Recipe photo hand-off rule

**Permanent rule.** Any time a user hands off a photo for a recipe (a new
recipe or an existing one), upload the photo into the cookbook and update
that recipe's data so the photo actually renders — don't just drop the file
in the repo.

- Save the image under `images/recipes/`, named by `recipe_id` (e.g.
  `images/recipes/jalapeno-chicken-bake.jpg`). Create the `images/recipes/`
  folder the first time this happens.
- Add a `photo` field to that recipe's object in `recipes-data.js` holding
  the relative path (e.g. `photo: "images/recipes/jalapeno-chicken-bake.jpg"`).
  Leave `photo` absent on recipes that don't have one — don't backfill
  placeholders for the rest of `RECIPES`.
- A photo is a new top-level asset: run `tools/build-sw.py` (bump the
  version) afterward per the Service worker & caching rules below.
- If this is the first `photo` field added to the data model, also wire up
  its rendering (e.g. a hero image on `recipe.html`, a card thumbnail
  wherever recipe cards render) instead of leaving the field inert. Keep the
  emoji `icon` as the fallback for recipes without a photo.
- Adding real photos to recipe cards/detail pages is a user-facing change —
  follow the Documentation currency rule above and update the Quick Tour
  once photos are visibly part of the experience.

## What this is

A premium, tactile **mobile cookbook PWA** that bridges cherished heirloom
recipes ("Hand-Me-Downs") and performance nutrition (Primal / Carnivore /
Heritage). It is an installable, offline-capable web app designed to be used
in the kitchen on a phone.

**Stack: vanilla HTML / CSS / JS. No framework. No build step. No bundler, no
npm, no transpiler.** The only "build" tool is a small Python script that
regenerates the service-worker precache list. Keep it this way — do not
introduce a framework, package manager, or build pipeline without explicit
direction.

## Running it

It's a static site. To develop locally, serve the folder root with any static
server and open `index.html`, e.g.:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000/
```

Opening `index.html` directly via `file://` mostly works, but the service
worker and PWA install require an `http(s)` origin.

## Architecture: hybrid SPA shell + standalone deep pages

The app is **hub-and-spoke**. There is **no bottom tab bar**.

- **`index.html`** is a single-page **shell**. It holds seven `<section
  class="screen">` panels (`#screen-home`, `#screen-planner`,
  `#screen-categories`, `#screen-recipes`, `#screen-favorites`,
  `#screen-mikes`, `#screen-tracker`); only the `.active` one is visible.
  `cookbook-home.js` swaps screens via `display` toggles and mirrors the
  active screen to `location.hash` (e.g. `#recipes`) so it survives reloads
  and deep links. **Home is the hub**; each spoke screen has a "‹ Home" anchor
  back.
- **`recipe.html`** and **`collection.html`** are **standalone pages** with
  their own `<main>`. They live outside the shell and get a single persistent
  floating **🏠 Home** button rendered by `cookbook-nav.js`.

A page declares its role with `data-tabbar` on `<main class="app">`:
- `data-tabbar="shell"` → the `index.html` hub (`cookbook-nav.js` renders
  nothing).
- `data-tabbar="page"` → a standalone deep page (gets the Home button).

## File map

| File | Role |
| --- | --- |
| `index.html` | App shell — the seven hub/spoke screens (Home, Planner, Categories, Recipes, Favorites, Mike's Favorites, Tracker). Loads `recipes-data.js`, `user-recipes.js`, `cookbook-home.js`, the tracker module set, `cookbook-sw.js`. |
| `cookbook-home.js` | Shell controller (~140 KB, ~3.2k lines). Renders Home hub, This Week meal planner (Smart Week, Macro Smart Generator, batch-prep suggestion, cook-log + macro history), Categories, Recipes (collection cards + app-wide search), Favorites, Mike's Favorites. Owns meal-plan + favorites logic. |
| `collection.html` / `collection.js` | One collection's recipe list (`collection.html?c=<id>`) + live search; coming-soon placeholder for future collections; also serves the "My Recipes" collection. |
| `recipe.html` / `cookbook.js` | Unified recipe detail: fixed header (title/tags/times/serving stepper) + swipeable sub-tabs (Overview & Macros · Grocery · Recipe). Owns serving scaling (`scaleQuantity`, wired for arbitrary 1–12 servings), check-off state, screen wake lock, and full-screen Cooking Mode. |
| `cookbook-nav.js` | Renders the floating 🏠 Home button on `data-tabbar="page"` pages. Exposes `window.MCNav`. |
| `recipes-data.js` | **The data layer** (~12.4k lines / ~600 KB). `RECIPES` array (160 recipes) + `COLLECTIONS` array. Decoupled from rendering; exposed as `window.RECIPES` / `window.COLLECTIONS`. |
| `user-recipes.js` | "My Recipes" — lets a cook add their own recipes from the Home hub; stored in `localStorage` (`mc-cookbook:userrecipes`) and merged into `window.RECIPES`/`COLLECTIONS` at load so they behave like built-in recipes everywhere (search, planner, favorites, categories). Must load after `recipes-data.js`, before the page controllers. |
| `tracker.js` / `tracker-store.js` / `tracker-calc.js` / `tracker-foodapi.js` / `tracker-barcode.js` / `tracker-recipe.js` | The in-app macro tracker (`#screen-tracker`): week calendar strip, hour-by-hour food log, calorie/macro goals from a suggest-then-adjust calculator, food entry via Open Food Facts search or barcode scan, and direct recipe logging from the recipe page. Store is `mc_macros_v1` — the same key and shape 4-Weeks-to-Open-'s workout app uses, so a signed-in trainee's tracker data is one store, not two (see Client-side state below). Exposed as `window.MCTracker`. |
| `mc-supabase.js` / `mc-sync.js` / `mc-account.js` | Optional login + cross-device sync, ported from 4-Weeks-to-Open- (same Supabase project — one account works in both apps). `mc-supabase.js` is the client + auth (invite-only, no public sign-up); `mc-sync.js` mirrors a whitelist of localStorage stores to Supabase's `user_sync` table per signed-in user — `mc_macros_v1` plus every `mc-cookbook:mealplan*` key, `mc-cookbook:userrecipes`, and `mc-cookbook:cooked` (each with its own merge strategy — see the file header). **Bridge (roadmap B0):** `mc-sync.js` also has a `CONSUME` map that **pulls, read-only,** the workout app's `mc_activity` + `mc_workout_log_v1` from the same `user_sync` table (owner authoritative, `replace` merge, never pushed back — one writer per store); `mc-bridge.js` reads those for a cross-app view. `mc-account.js` is the sign-in-sheet UI, mounted into the Home top bar by `cookbook-home.js` via `window.MCAccount.mount(container)`, and also hosts the Export data / Import data buttons (works whether signed in or not). All three sync modules are no-ops when signed out — nothing changes for a cook who never logs in. `tracker-foodapi.js`/`tracker-calc.js`/`tracker-barcode.js` are generated copies of the workout app's `mc-foodapi.js`/`mc-macrocalc.js`/`mc-barcode.js` via `tools/sync-nutrition-modules.py` in that repo — don't hand-edit them here. |
| `mc-bridge.js` | **Shared cross-app READ layer (cookbook ↔ workout), roadmap B0.** Read-only view over the data both apps share: `todaysMeals()` (from `mc-cookbook:mealplan`, enriched from `window.RECIPES`), `todaysWorkout()` / `recentActivity()` (from the pulled `mc_activity` + `mc_workout_log_v1`), `macroTargets()` (from the shared `mc_macros_v1.goals`), `today()`. Never writes. **Byte-identical to the copy in 4-Weeks-to-Open-** — edit there, copy here; `tools/test-mc-bridge.js` in that repo is the gate. Exposed as `window.MCBridge`. |
| `mc-export.js` | Logged-out (or logged-in) manual backup: exports every `mc-cookbook:*` key plus `mc_macros_v1` as a downloadable JSON file, and restores from one. UI lives in the `mc-account.js` sheet. |
| `cookbook.css` | The entire design system + all component styles (~50 KB). Design tokens live in `:root`. |
| `cookbook-sw.js` | Shared service-worker **registration** + update toasts; included on every page. |
| `sw.js` | The service worker itself. `CACHE_URLS` is **auto-generated** — never hand-edit it. |
| `manifest.json` / `icon.svg` | PWA manifest + app icon. |
| `quick-tour.html` / `quick-tour-overview.html` | Standalone, cookbook-styled walkthroughs of the app's features (Smart Week, Time Check, sub-tabs, etc.); not linked from the shell nav, used for onboarding/demo. |
| `tools/build-sw.py` | Regenerates `sw.js`'s precache list and (optionally) bumps the cache version. |
| `.github/workflows/pages.yml` | CI: `node --check` JS gate → regen SW → deploy to GitHub Pages. |
| `ROADMAP.md` | Phased improvement roadmap; kept current with what's actually shipped — re-read it before proposing new work so you don't re-litigate a finished pillar. |
| `README.txt` | Short human-facing overview. |

## Data model (`recipes-data.js`)

This is the single source of truth. **To add a recipe, append an object to
`RECIPES`; to add a collection, append to `COLLECTIONS`.** No rendering changes
are required — everything else derives from the data.

A `RECIPES` entry includes (see the file header for full notes):
- `recipe_id` (slug, used in `recipe.html?id=<recipe_id>`), `title`,
  `category`, `tags`, `description`.
- `source` — the origin cookbook/collection; **this string is how recipes are
  matched into a collection** (a collection's `source_match` must equal it).
- `dish_category` — exactly **one** of the categories below; drives the
  Categories screen.
- `icon`, `accent` (per-recipe accent color, also themes the detail screen),
  `prep_time_mins`, `cook_time_mins`, `native_serving`, `scaling_options`.
- `macro_profiles` — **per single serving**, identical across every tier a
  recipe authors (all `serving_N` keys present are equal copies). Macros
  never scale with serving count.
- `ingredients_by_serving` — one or more authored `serving_N` tiers (see
  "Serving ladder" below — not every recipe has both `serving_2` and
  `serving_4`). Each ingredient separates `item` (clean shopping-list name →
  Grocery tab) from `prep` (mise-en-place instruction → Recipe tab only),
  plus `quantity`, `unit`, and `category` (one of **Meat · Dairy · Produce ·
  Pantry**, which groups the grocery list).
- `instructions` — array of `{ step_number, title, detail }`.

**Serving ladder.** Most recipes (the 2-meals-a-day style) author a 2-serving
and a 4-serving tier explicitly. **Batch-yield recipes don't** — a whole
cheesecake or a single-tray dessert instead authors **one** `serving_N` tier
matching its `native_serving`/`scaling_options` (e.g. `serving_12` only, for a
12-serving cheesecake). `cookbook.js`'s `nativeServing()` / `ingredientsFor()`
/ `macrosFor()` already read whichever `serving_N` keys exist generically —
don't assume `serving_2`/`serving_4` are always both present. Any requested
count without an authored tier (1–12, via the stepper in `cookbook.js`) is
generated on the fly by scaling the nearest authored/native tier. Macros are
constant per serving and never scale. `tools/validate-recipes.js` enforces
this shape in CI (see `ROADMAP.md` Pillar A).

**Categories** (`CATEGORY_ORDER` in `cookbook-home.js`, 11 total): Breakfast ·
Salads & Slaws · Soups, Stews & Chilis · Casseroles & Bakes · Skillets &
Stir-Fries · Grilled & Sheet-Pan · Sandwiches · Desserts · Salsas & Dips ·
Sauces · Marinades. A category only appears on the Categories screen once a
recipe uses it (`categoriesWithRecipes()`), so adding a 12th needs an entry in
both `CATEGORY_ORDER` and `CATEGORY_META`.

**Collections** (`COLLECTIONS`): each is a flagship card with `status:
"live" | "coming-soon"`. A `live` collection lists every recipe whose `source`
matches its `source_match` and links to `collection.html?c=<id>`. Live
sources today: *Two Meals a Day*, *Chipotle Copycats*, *High-Protein Meal
Prep*, *Desserts*, *Salsas*, *Sauces*, *Marinades*, plus the user-authored
*My Recipes* collection (`user-recipes.js`). Coming soon: *Kelli Cross'
Recipes* (Heritage), *Carnivore*.

## Client-side state (localStorage)

All persistence is `localStorage`, namespaced `mc-cookbook:`. **Sets are
serialized with `Array.from()`** before `JSON.stringify` (a Set does not
JSON-serialize directly — this was a real bug; keep the pattern).

- `mc-cookbook:favorites` — JSON array of favorited `recipe_id`s. Hearts on
  home/collection/recipe all read/write this one key; exposed as `window.MCFav`.
- `mc-cookbook:mealplan` — the This Week planner `{ meals: [...] }`.
- `mc-cookbook:mealplan:grocery` — checked grocery merge-keys for the plan.
- `mc-cookbook:mealplan:history` — saved/archived week blocks.
- `mc-cookbook:mealplan:custom` — ad-hoc (non-recipe) planner line items.
- `mc-cookbook:mealplan:macrohistory` — macro history feeding Smart Week's
  Macro Smart Generator and cook-log awareness.
- `mc_macros_v1` — the macro tracker's whole state (goals, logged food/hour,
  week data); owned by `tracker-store.js`, exposed indirectly via
  `window.MCTracker`. **Not namespaced `mc-cookbook:`** — this is deliberately
  the same key the workout app (`4-Weeks-to-Open-`) uses for its Nutrition
  tab, so `mc-sync.js` can reconcile one trainee's tracker data across both
  apps when they're signed in. Signed out, it's still local-only, same as
  before. A one-time migration in `tracker-store.js` moves any data left
  under the old `mc-cookbook:tracker:v1` key the first time it loads
  post-upgrade.
- `mc-cookbook:userrecipes` — JSON array of full user-authored recipe objects
  (`user-recipes.js`), merged into `window.RECIPES`/`COLLECTIONS` at load.
- `mc-cookbook:cooked` — `{ [recipe_id]: [{ at, photo }] }` cook log, written by
  `logCookEntry()` (recipe detail page + the planner's "Mark Completed"); feeds
  the streak, Smart Week's repeat-avoidance, and the weekly recap's
  planned-vs-cooked stat. Synced via `mc-sync.js` when signed in.
- `mc-cookbook:<recipe_id>:s<serving>:<kind>` — recipe-detail check-off state
  (groceries/steps), keyed by recipe **and** serving count so each count keeps
  an independent checklist.

Favorites re-render across tabs by listening to the `storage` event.

## Service worker & caching

- `sw.js` uses **network-first for HTML** (3s timeout for flaky kitchen Wi-Fi,
  then cache fallback) and **cache-first for everything else**.
- `CACHE_URLS` is delimited by `/* AUTOGEN:URLS START/END */` markers and is
  **generated by `tools/build-sw.py` — never edit it by hand.**
- The SW self-activates (`skipWaiting` + `clients.claim`) and the page reloads
  on `controllerchange`, so fixes reach users without a manual refresh.

**After adding, removing, or renaming any top-level asset, run:**

```bash
python3 tools/build-sw.py            # refresh the precache list
python3 tools/build-sw.py --version v9   # also bump the cache name
python3 tools/build-sw.py --check    # CI-style: fail if sw.js is stale
```

CI regenerates the SW with a version of `ci-<run_number>` on deploy, so the
committed `CACHE_NAME` is informational, but keep the precache list current.

## Conventions

- **Vanilla, no framework, no build step.** IIFE-wrapped modules with
  `"use strict"`. Common helpers are re-declared per file: `$` (querySelector),
  `el(tag, cls, html)`, `esc()` (HTML-escape — **always escape user/data text
  inserted via `innerHTML`**), `rgbFromHex()`, `pop()` (retrigger animation).
- **Accent theming.** Many components are themed by a hex `accent` converted to
  an `r,g,b` CSS variable for glows/borders.
- **Styling lives in `cookbook.css`.** Design tokens are in `:root`;
  `prefers-reduced-motion` and `env(safe-area-inset-*)` are already honored —
  respect them.
- **Mobile-first, portrait, touch-friendly.** This is a phone app used in a
  kitchen; keep tap targets large and interactions tactile.

## CI / deploy

`.github/workflows/pages.yml` runs on push to `main`:
1. `node --check` over every tracked `*.js` (syntax gate — **all JS must
   pass**).
2. Regenerate the service worker (`tools/build-sw.py --version ci-<run>`).
3. Deploy the repo root to GitHub Pages.

Before pushing, sanity-check JS locally:

```bash
for f in $(git ls-files '*.js'); do node --check "$f" || echo "FAIL $f"; done
```

## Git workflow

- **Work from the `main` branch only.** Before making changes, confirm
  `git branch --show-current` returns `main`.
- Do **not** read, reference, or pull from other branches.
- Pushing to `main` triggers the GitHub Pages deploy above — every push is a
  production release. Make sure the `node --check` gate passes and the SW
  precache list is current before pushing.
- Do not open pull requests unless explicitly asked.

## Quick reference

- Add a recipe → append to `RECIPES` in `recipes-data.js`, then
  `python3 tools/build-sw.py` is **not** needed (no new file), but bump the SW
  version if you want returning users to refetch.
- Add/remove a top-level file → **always** run `tools/build-sw.py` and bump the
  cache version.
- Deep links: `recipe.html?id=<recipe_id>`, `collection.html?c=<collection_id>`,
  shell screens via `index.html#<screen>` (e.g. `#favorites`).
- Recipe photo handed off → save to `images/recipes/<recipe_id>.<ext>`, add a
  `photo` field to that recipe in `recipes-data.js`, and run
  `tools/build-sw.py` (bump version). See the Recipe photo hand-off rule above.

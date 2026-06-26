# CLAUDE.md

Guidance for AI assistants (and humans) working in **Mike's Cookbook**.

## Planning rule — executive summary required

**Before implementing any non-trivial code change, invoke the `executive-summary`
skill** (`.claude/skills/executive-summary/SKILL.md`) to produce a Word-style
executive summary and wait for the owner's explicit approval ("approved" / "go")
before writing or editing any file. See the skill for scope guidance on when this
applies and when it can be skipped.

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

- **`index.html`** is a single-page **shell**. It holds five `<section
  class="screen">` panels (`#screen-home`, `#screen-planner`,
  `#screen-categories`, `#screen-recipes`, `#screen-favorites`); only the
  `.active` one is visible. `cookbook-home.js` swaps screens via `display`
  toggles and mirrors the active screen to `location.hash` (e.g. `#recipes`)
  so it survives reloads and deep links. **Home is the hub**; each spoke screen
  has a "‹ Home" anchor back.
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
| `index.html` | App shell — the five hub/spoke screens. Loads `recipes-data.js`, `cookbook-home.js`, `cookbook-sw.js`. |
| `cookbook-home.js` | Shell controller (~40 KB). Renders Home hub, This Week meal planner, Categories, Recipes (collection cards + search), Favorites. Owns the meal-plan + favorites logic. |
| `collection.html` / `collection.js` | One collection's recipe list (`collection.html?c=<id>`) + live search; coming-soon placeholder for future collections. |
| `recipe.html` / `cookbook.js` | Unified recipe detail: fixed header (title/tags/times/serving stepper) + 3 swipeable sub-tabs (Overview & Macros · Grocery · Recipe). Owns serving scaling + check-off state. |
| `cookbook-nav.js` | Renders the floating 🏠 Home button on `data-tabbar="page"` pages. Exposes `window.MCNav`. |
| `recipes-data.js` | **The data layer.** `RECIPES` array (41 recipes) + `COLLECTIONS` array. Decoupled from rendering; exposed as `window.RECIPES` / `window.COLLECTIONS`. |
| `cookbook.css` | The entire design system + all component styles (~50 KB). Design tokens live in `:root`. |
| `cookbook-sw.js` | Shared service-worker **registration** + update toasts; included on every page. |
| `sw.js` | The service worker itself. `CACHE_URLS` is **auto-generated** — never hand-edit it. |
| `manifest.json` / `icon.svg` | PWA manifest + app icon. |
| `tools/build-sw.py` | Regenerates `sw.js`'s precache list and (optionally) bumps the cache version. |
| `.github/workflows/pages.yml` | CI: `node --check` JS gate → regen SW → deploy to GitHub Pages. |
| `ROADMAP.md` | Phased improvement roadmap; "Architecture Reality Check" is good ground-truth reading. |
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
- `dish_category` — exactly **one** of the 7 categories below; drives the
  Categories screen.
- `icon`, `accent` (per-recipe accent color, also themes the detail screen),
  `prep_time_mins`, `cook_time_mins`, `native_serving`, `scaling_options`.
- `macro_profiles` — **per single serving**, identical across tiers (`serving_2`
  / `serving_4` are equal copies). Macros never scale with serving count.
- `ingredients_by_serving` — authored `serving_2` and `serving_4` tiers. Each
  ingredient separates `item` (clean shopping-list name → Grocery tab) from
  `prep` (mise-en-place instruction → Recipe tab only), plus `quantity`,
  `unit`, and `category` (one of **Meat · Dairy · Produce · Pantry**, which
  groups the grocery list).
- `instructions` — array of `{ step_number, title, detail }`.

**Serving ladder.** Recipes author a 2-serving and a 4-serving tier explicitly.
Any other count (1–12, via the stepper in `cookbook.js`) is generated on the
fly by scaling the native tier. Macros are constant per serving and never
scale.

**Categories** (`CATEGORY_ORDER` in `cookbook-home.js`): Breakfast · Salads &
Slaws · Soups, Stews & Chilis · Casseroles & Bakes · Skillets & Stir-Fries ·
Grilled & Sheet-Pan · Sandwiches.

**Collections** (`COLLECTIONS`): each is a flagship card with `status:
"live" | "coming-soon"`. A `live` collection lists every recipe whose `source`
matches its `source_match` and links to `collection.html?c=<id>`. Currently
live: *Two Meals a Day* (Primal). Coming soon: *Kelli Cross' Recipes*
(Heritage), *Carnivore*.

## Client-side state (localStorage)

All persistence is `localStorage`, namespaced `mc-cookbook:`. **Sets are
serialized with `Array.from()`** before `JSON.stringify` (a Set does not
JSON-serialize directly — this was a real bug; keep the pattern).

- `mc-cookbook:favorites` — JSON array of favorited `recipe_id`s. Hearts on
  home/collection/recipe all read/write this one key; exposed as `window.MCFav`.
- `mc-cookbook:mealplan` — the This Week planner `{ meals: [...] }`.
- `mc-cookbook:mealplan:grocery` — checked grocery merge-keys for the plan.
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

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

The app is **hub-and-spoke**, with **one persistent 2-tab bar** at the bottom
of the shell (`<nav class="tab-bar">` in `index.html`) that switches between
**Cookbook** and **Tracker** — nothing else. The seven screens are *not* tabs:
they sit behind the Cookbook tab as hub-and-spoke, reached from Home and
returned to with a "‹ Home" anchor. (This section used to say "there is no
bottom tab bar," which stopped being true when the Tracker shipped;
`tools/check-docs.js` now fails CI if that claim comes back while
`index.html` still has the element.)

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
| `cookbook-home.js` | Shell controller (~220 KB, ~4.9k lines). Renders Home hub, This Week meal planner (Smart Week, Macro Smart Generator, batch-prep suggestion, cook-log + macro history), Categories, Recipes (collection cards + app-wide search), Favorites, Mike's Favorites. Owns meal-plan + favorites logic. **Bridge (roadmap B2):** Smart Week's `smw*` scoring and the Macro Smart Generator's `msg*` budget both read `MCBridge.likelyTrainingDays()` (a real historical weekday-training pattern, not a fabricated schedule) to bias meal selection toward higher protein on likely training days, lighter on rest days; `macroTrendBias()` separately reads `mc-cookbook:mealplan:macrohistory` and bumps the Macro Smart Generator's protein target when the trailing trend is clearly under goal (surfaced as a visible, non-silent reason line in the Smart Week overlay's Macro-Targeted mode). The Home hero's `emptyHeroCopy()` also checks real training signal (`trainingNudgeCopy()`) before falling back to its generic time-of-day copy, and the "Past 7 Days" recap card (`weeklyRecapStats()`) fuses in a workouts-this-week count from the bridge. **Bridge (roadmap B3):** the existing "Today" card (`renderTodayCard()`) gains a real workout-status badge (`todayWorkoutBadge()`) and now renders even with a workout logged but no meals planned (previously returned `null` and silently dropped the signal); Home's topbar gains a persistent reciprocal nav link to the workout app (`.home-workout-btn`), `MARKET:STRIP`/`MARKET:ADD`-gated the same way the workout app's own cookbook link is (absolute URL standalone, relative `../dashboard.html` when mounted in the Rolodex). Turns out the two apps are same-origin (see `4-Weeks-to-Open-/cookbook-bridge-roadmap.md`'s architecture correction), so this link's sign-in continuity needed no extra code. |
| `collection.html` / `collection.js` | One collection's recipe list (`collection.html?c=<id>`) + live search; coming-soon placeholder for future collections; also serves the "My Recipes" collection. |
| `recipe.html` / `cookbook.js` | Unified recipe detail: fixed header (title/tags/times/serving stepper) + swipeable sub-tabs (Overview & Macros · Grocery · Recipe). Owns serving scaling (`scaleQuantity`, wired for arbitrary 1–12 servings), check-off state, screen wake lock, and full-screen Cooking Mode. |
| `cookbook-nav.js` | Renders the floating 🏠 Home button on `data-tabbar="page"` pages. Exposes `window.MCNav`. |
| `recipes-data.js` | **The data layer** (~23.2k lines / ~1.04 MB). `RECIPES` array (318 recipes) + `COLLECTIONS` array. Decoupled from rendering; exposed as `window.RECIPES` / `window.COLLECTIONS`. |
| `user-recipes.js` | "My Recipes" — lets a cook add their own recipes from the Home hub; stored in `localStorage` (`mc-cookbook:userrecipes`) and merged into `window.RECIPES`/`COLLECTIONS` at load so they behave like built-in recipes everywhere (search, planner, favorites, categories). Must load after `recipes-data.js`, before the page controllers. |
| `tracker.js` / `tracker-store.js` / `tracker-calc.js` / `tracker-foodapi.js` / `tracker-barcode.js` / `tracker-recipe.js` | The in-app macro tracker (`#screen-tracker`): week calendar strip, hour-by-hour food log, calorie/macro goals from a suggest-then-adjust calculator, food entry via Open Food Facts search or barcode scan, and direct recipe logging from the recipe page. Store is `mc_macros_v1` — the same key and shape 4-Weeks-to-Open-'s workout app uses, so a signed-in trainee's tracker data is one store, not two (see Client-side state below). Exposed as `window.MCTracker`. |
| `mc-supabase.js` / `mc-sync.js` / `mc-account.js` | Optional login + cross-device sync, ported from 4-Weeks-to-Open- (same Supabase project — one account works in both apps). `mc-supabase.js` is the client + auth (invite-only, no public sign-up); `mc-sync.js` mirrors a whitelist of localStorage stores to Supabase's `user_sync` table per signed-in user — `mc_macros_v1` plus every `mc-cookbook:mealplan*` key, `mc-cookbook:userrecipes`, `mc-cookbook:cooked`, and (**audit C-02**) `mc-cookbook:favorites` + `mc-cookbook:pantry` (each with its own merge strategy — see the file header). Favorites and pantry were absent from the whitelist until C-02: three screens write favorites and Home advertises "☁️ Backed up," but they never left the device. Both are `Array.from(Set)` id lists, so they use the existing `stringSet` union strategy unchanged. **Deliberately still not synced**, with reasons in the file: `:photos` (image data doesn't belong in a jsonb row), `:timecheck` (no timestamp and no union semantics — needs a `ts` field before it can sync honestly), and the device/session-local preferences (`:tourSeen`, `:owner`, `:cookfont`, `:lastScreen`, `:lastBackupAt`, the dismissal stamps, and per-recipe check-offs). **Bridge (roadmap B0):** `mc-sync.js` also has a `CONSUME` map that **pulls, read-only,** the workout app's `mc_activity` + `mc_workout_log_v1` from the same `user_sync` table (owner authoritative, `replace` merge, never pushed back — one writer per store); `mc-bridge.js` reads those for a cross-app view. `mc-account.js` is the sign-in-sheet UI, mounted into the Home top bar by `cookbook-home.js` via `window.MCAccount.mount(container)`, and also hosts the Export data / Import data buttons (works whether signed in or not). All three sync modules are no-ops when signed out — nothing changes for a cook who never logs in. **Roadmap B5:** the merge functions (`mergeMacros`, `mergePlan`, `mergeStringSet`, `mergeHistoryBySavedAt`, `mergeArrayByField`, `mergeCookedByRecipe`) are private closures in a browser-only IIFE, so a `module.exports` hook was added as the literal first statement inside it (before the `window.__mcSync`/`MC_SB` guards) — the merge functions are `function` declarations further down the same closure so they're already hoisted and defined regardless of how the guards resolve. `tools/test-mc-sync-merge.js` sandboxes the real file with `vm` (fake `window`/`MC_SB` so the guards return early right after `module.exports` is set) and asserts real conflicting-fixture behavior — now a blocking CI step, not just a local check. `tracker-foodapi.js`/`tracker-calc.js`/`tracker-barcode.js` are generated copies of the workout app's `mc-foodapi.js`/`mc-macrocalc.js`/`mc-barcode.js` via `tools/sync-shared-modules.py` in that repo (which also enforces the byte-identical copies of `mc-bridge.js`/`mc-install.js`/`mc-backup-status.js`/`tools/test-mc-bridge.js`; a CI drift gate in both repos' `pages.yml` fails on any stale copy) — don't hand-edit them here. |
| `mc-bridge.js` | **Shared cross-app READ layer (cookbook ↔ workout), roadmap B0–B2.** Read-only view over the data both apps share: `todaysMeals()` (from `mc-cookbook:mealplan`, preferring each meal's own denormalized `{title,icon,macros}` snapshot — see `mealSnapshot()` below — and falling back to a live `window.RECIPES` lookup for legacy entries; macros are normalized from recipes-data.js's real `calories/protein_g/fat_g/carbs_g` fields to `{kcal,p,f,c}`, matching `mc_macros_v1`'s native entry shape), `todaysWorkout()` / `recentActivity()` (from the pulled `mc_activity` + `mc_workout_log_v1`), `macroTargets()` (from the shared `mc_macros_v1.goals`), `likelyTrainingDays()` (roadmap B2 — a real historical per-weekday training pattern from `mc_workout_log_v1`, `{}` until enough history exists), `today()`. Never writes. **Byte-identical to the copy in 4-Weeks-to-Open-** — edit there, copy here; `tools/test-mc-bridge.js` runs in **both** repos' CI as of roadmap B5 (previously only 4-Weeks-to-Open- had a copy — a real coverage gap on this repo's own file, closed by copying the test here too). Exposed as `window.MCBridge`. |
| `mc-export.js` | **The app's one manual backup** (logged-out or logged-in): exports every `mc-cookbook:*` key plus `mc_macros_v1` as a downloadable JSON file, and restores from one. Two UIs call it — the `mc-account.js` sheet and Home's "Backup & Restore" card (`cookbook-home.js`'s `renderBackupSection`, which adds a `confirm()` the sheet doesn't). **Audit C-01:** `cookbook-home.js` used to carry a second, independent implementation whose file format was mutually unreadable with this one even though both wrote `mikes-cookbook-backup-<date>.json` — one rejected the other's files, the other accepted them and double-encoded every store. Consolidated here; that file now only holds thin adapters. Format is **v2**, and values are the **raw localStorage strings** — not every store holds JSON (`:lastBackupAt` is a bare ISO stamp, `:mealplan:recap-dismissed` a bare week key), so a parse/stringify round trip corrupts them. v1 (old `cookbook-home.js`) and unversioned (old `mc-export.js`) files still import. `tools/test-mc-export.js` pins all of this in CI. |
| `mc-install.js` | **Roadmap B4 — ported from 4-Weeks-to-Open-, byte-identical.** Captures the native Android `beforeinstallprompt` at page load (loads first thing in `<body>` in `index.html`, since the event only reaches a listener already attached) and exposes `window.MC_INSTALL` (`platform`, `isInstalled()`, `canPrompt()`, `prompt()`, `onChange(fn)`). Fully app-agnostic — no cookbook-specific logic. Consumed by `mc-account.js`'s Install section. |
| `mc-backup-status.js` | **Roadmap B4 — ported from 4-Weeks-to-Open-, byte-identical.** Fills `#backupStatus` (a placeholder `cookbook-home.js`'s `renderHome()` re-creates on every Home visit) with the live "☁️ Backed up · Nm ago" state from `mc-sync.js`. Re-queries the DOM on every `render()` call rather than caching the element once, since this SPA rebuilds Home's whole DOM each visit (the workout app's stable-DOM dashboard would work with either approach); exposes `window.MC_BACKUP_STATUS.refresh()`, which `renderHome()` calls right after re-creating the placeholder so the status shows immediately instead of waiting up to 15s for the next interval tick. |
| `cookbook.css` | The entire design system + all component styles (~108 KB). Design tokens live in `:root`. |
| `cookbook-sw.js` | Shared service-worker **registration** + update toasts; included on every page. |
| `sw.js` | The service worker itself. `CACHE_URLS` is **auto-generated** — never hand-edit it. |
| `manifest.json` / `icon.svg` | PWA manifest + app icon. |
| `quick-tour.html` / `quick-tour-overview.html` | Standalone, cookbook-styled walkthroughs of the app's features (Smart Week, Time Check, sub-tabs, etc.); not linked from the shell nav, used for onboarding/demo. |
| `tools/build-sw.py` | Regenerates `sw.js`'s precache list and (optionally) bumps the cache version. |
| `.github/workflows/pages.yml` | CI, two jobs: **`verify`** (7 blocking gates — syntax, recipe data, bridge + sync-merge tests, SW strategy, backup format, precache freshness, shared-module drift) runs on **pull requests and `main`**; **`deploy`** (`needs: verify`, `main` only) regenerates the SW and publishes to GitHub Pages. See CI / deploy below. |
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

**Collections** (`COLLECTIONS`, 13 live): each is a flagship card with `status:
"live" | "coming-soon"`. A `live` collection lists every recipe whose `source`
matches its `source_match` and links to `collection.html?c=<id>`. Live
sources today: *Two Meals a Day*, *Chipotle Copycats*, *High-Protein Meal
Prep*, *Desserts*, *Salsas*, *Sauces*, *Pasta Sauces*, *Marinades*, *Flexible
Dieting*, *Eating Healthy Mag*, *Simple High-Protein Recipes*, *Family
Recipes*, *Clean Eat Guide*, plus the user-authored *My Recipes* collection
(`user-recipes.js`). Coming soon: *Kelli Cross' Recipes* (Heritage),
*Carnivore*.

**Every recipe must be reachable.** The last four live collections above were
added by audit C-10: their sources had recipes but no collection, so ten
recipes were reachable only via Categories or search, never from the
collection cards Home points at. `tools/validate-recipes.js` checks both
directions now — a `source_match` that resolves to nothing (empty collection)
*and* a recipe `source` that no live collection matches (stranded recipe).
Adding a recipe with a brand-new `source` fails CI until it has a home.

## Client-side state (localStorage)

All persistence is `localStorage`, namespaced `mc-cookbook:`. **Sets are
serialized with `Array.from()`** before `JSON.stringify` (a Set does not
JSON-serialize directly — this was a real bug; keep the pattern).

- `mc-cookbook:favorites` — JSON array of favorited `recipe_id`s. Hearts on
  home/collection/recipe all read/write this one key; exposed as `window.MCFav`.
  Synced via `mc-sync.js` (`stringSet` union) when signed in — added by audit
  C-02, which found it had never been in the whitelist.
- `mc-cookbook:pantry` — JSON array of lowercased staple names; suppresses
  grocery rows and feeds the Recipes screen's "cook what you have" filter.
  Also synced as of C-02.
- `mc-cookbook:mealplan` — the This Week planner `{ meals: [...] }`. Each meal is
  `{uid, id, serving, day, slot, completed, completedAt}` plus, since roadmap B1,
  a denormalized `{title, icon, macros}` snapshot from `mealSnapshot(id, serving)`
  — added by every meal-creation path (`addMeal`, `commitSmartWeek`, the
  plan-history "Reuse" flow) so `mc-bridge.js` can render a meal on the workout
  side, which never loads `recipes-data.js`. `macro_profiles` are per single
  serving and constant across tiers, so the snapshot never goes stale.
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

**The rest of the namespace (audit C-12).** Eleven stores were live in the code
and absent from this list. They're small, but "undocumented" is how a store
ends up outside the sync whitelist and the backup by accident — which is
exactly what happened to favorites (C-02). Full inventory, so the next audit
starts from a true list:

- `mc-cookbook:photos` — `{ [recipe_id]: dataURL }`, one cover photo per
  recipe, written by `cookbook.js`. Each image is downscaled
  (`PHOTO_EDGE` 1024px, quality 0.7) and the map is capped at
  `MAX_RECIPE_PHOTOS` (24, oldest evicted) — the cap was added by C-12; the
  downscale and the storage-full alert already existed. **Not synced** (image
  data doesn't belong in a jsonb row); it *is* in the backup file, which is why
  a backup with photos can run to several MB.
- `mc-cookbook:timecheck` — `{ scopeKey, days }`, the Time Check quiz's
  per-day time buckets. **Not synced:** no timestamp and no union semantics, so
  every merge strategy either loses a local edit or produces nonsense. Needs a
  `ts` field first — see ROADMAP backlog.
- `mc-cookbook:pantry` — see above; synced as of C-02.
- `mc-cookbook:lastBackupAt` — ISO timestamp of the last manual export. Feeds
  the Home card's "Last backup: …" line and the stale-backup nudge. **A bare
  string, not JSON** — this is one of the stores that made the old backup
  format's parse/stringify round trip corrupt data (C-01).
- `mc-cookbook:mealplan:autodraft-dismissed` — ms timestamp; ~7-day cooldown on
  the Home auto-draft offer. Cleared when a real plan is built.
- `mc-cookbook:mealplan:recap-dismissed` — the week key of the dismissed weekly
  recap card. Also a bare string, not JSON.
- `mc-cookbook:tourSeen` — `"1"` once the Quick Tour banner is taken or closed.
- `mc-cookbook:owner` — `"1"` when owner mode is unlocked (`?owner=1`, or five
  taps on the "Mike's" eyebrow). Gates the Mike's Favorites editing toolbar.
- `mc-cookbook:mikesFavorites:draft` — owner-mode local draft of
  `MIKES_FAVORITES` before it's copied out and committed. Owner-only.
- `mc-cookbook:lastScreen` — `sessionStorage`, not localStorage: the shell
  screen to return to from `recipe.html`/`collection.html`'s Home button.
- `mc-cookbook:cookfont` — Cooking Mode font-size preference (`cookbook.js`).
- `mc-cookbook:tracker:v1` — **legacy.** One-time migration source for
  `mc_macros_v1`; `tracker-store.js` reads it once and moves the data. Slated
  for removal (audit C-14).

**Writes go through `writeStore()` in `cookbook-home.js`.** Each store used to
carry its own `try { setItem } catch (e) {}`; fourteen of them swallowed
`QuotaExceededError` in silence, so a full quota looked like favorites and meal
plans just not saving. Swallowing is still correct — a full disk shouldn't
throw a cook out of a recipe — but `writeStore()` now surfaces one toast per
session so the failure is at least visible. Keep new writes on that helper.

Favorites re-render across tabs by listening to the `storage` event.

## Service worker & caching

- `sw.js` uses **stale-while-revalidate for HTML** (audit LS-4 — serve the
  cached page instantly, refresh it behind for next load, fall back to the app
  shell on a cold cache) and **cache-first for everything else**. It was
  network-first with a 3s timeout until LS-4; `tools/test-sw-strategy.js`
  pins the current behavior and `tools/check-docs.js` fails if this paragraph
  drifts back.
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

`.github/workflows/pages.yml` has **two jobs** (split by audit C-16 — before
that the whole thing ran on `push: main` only, so a pull request got no checks
at all and the gates first fired on the merge commit, one step too late to stop
anything reaching production):

- **`verify`** — runs on **pull requests and on `main`**. Seven gates, all
  blocking:
  1. `node --check` over every tracked `*.js` (syntax gate — **all JS must pass**).
  2. `tools/validate-recipes.js` — recipe-data shape (Pillar A).
  3. `tools/test-mc-bridge.js` + `tools/test-mc-sync-merge.js` — cross-app read
     layer and sync-merge logic (roadmap B5, audit C-02).
  4. `tools/test-sw-strategy.js` — service-worker stale-while-revalidate (LS-4).
  5. `tools/test-mc-export.js` — backup format round trip + legacy files (C-01).
  6. `tools/build-sw.py --check` — precache list is current.
  7. Shared-module drift vs the 4-Weeks-to-Open- canonical copies (LS-1).
- **`deploy`** — `needs: verify`, and gated to `main` by
  `github.event_name != 'pull_request' && github.ref == 'refs/heads/main'`, so
  nothing ever deploys from a PR branch. Regenerates the SW with
  `--version ci-<run>` and publishes the repo root to GitHub Pages.

Before pushing, run the same gates locally:

```bash
for f in $(git ls-files '*.js'); do node --check "$f" || echo "FAIL $f"; done
node tools/validate-recipes.js
node tools/test-mc-bridge.js && node tools/test-mc-sync-merge.js
node tools/test-sw-strategy.js && node tools/test-mc-export.js
python3 tools/build-sw.py --check
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

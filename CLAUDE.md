# CLAUDE.md

Guidance for AI assistants (and humans) working in **Mike's Cookbook**.

## Planning rule — artifact + roadmap is sufficient to proceed

For long, extensive coding sessions and builds — e.g. new features or UI
screens spanning many files, multi-phase refactors, or major
service-worker/PWA overhauls — produce a short artifact and/or roadmap
covering scope, affected files, and approach before implementing. Creating
that artifact/roadmap is itself sufficient evidence and direction to
proceed directly to implementation; it replaces the old executive-summary
approval step, so no separate "approved"/"go" reply is required before
writing or editing files.

**Skip the artifact/roadmap step for everything else,** including:
data-model additions (new recipes, collections, or dish categories),
isolated bug fixes, single-line corrections, copy/wording tweaks, and CSS
adjustments.

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
- This is independent of the planning rule above — even a change small
  enough to skip the artifact/roadmap step still needs its Quick Tour entry
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
**Cookbook** and **Tracker** — nothing else. The six screens are *not* tabs:
they sit behind the Cookbook tab as hub-and-spoke, reached from Home and
returned to with a "‹ Home" anchor. (This section used to say "there is no
bottom tab bar," which stopped being true when the Tracker shipped;
`tools/check-docs.js` now fails CI if that claim comes back while
`index.html` still has the element.)

- **`index.html`** is a single-page **shell**. It holds six `<section
  class="screen">` panels (`#screen-home`, `#screen-planner`,
  `#screen-recipes`, `#screen-favorites`, `#screen-mikes`,
  `#screen-tracker`); only the `.active` one is visible. It held seven until
  the audit merged Categories into `#screen-recipes` (now "Browse") — the two
  were separate top-level screens over the same 318 recipes, and Browse
  already carried every dish category as a filter chip. `#categories` still
  resolves as a deep link via `SCREEN_ALIASES` and lands on the "By dish
  type" taxonomy. **Mike's Favorites deliberately kept its own screen** — it
  is the app's editorial surface and hosts the owner publishing toolbar, so
  it was not folded into Favorites.
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
| `index.html` | App shell — the six hub/spoke screens (Home, Planner, Browse, Favorites, Mike's Favorites, Tracker). Loads `recipes-data.js`, `user-recipes.js`, `cookbook-home.js`, the tracker module set, `cookbook-sw.js`. |
| `cookbook-home.js` | Shell controller (~186 KB, ~4.2k lines). Renders Home hub, This Week meal planner (Plan my week, batch-prep suggestion, cook-log + macro history), Browse (collection **or** dish-type taxonomy + app-wide search + facet chips), Favorites, Mike's Favorites. Owns meal-plan + favorites logic. **What did *not* move (audit C-08):** the planner. It is ~1,350 contiguous lines and looks like the obvious first extraction — the audit said so — but it references **66** names defined elsewhere in this file, so lifting it would mean threading a 66-entry context object through the seam. Contiguous is not separable. The two regions that did move needed five and four hooks respectively; that ratio is the test to apply before extracting anything else here. **One planning door (audit C-05):** `openPlanWeek()` is the single overlay behind the Plan pane's "✨ Plan my week" button. It replaced `openSmartWeek` + `openBandwidthQuiz` — two full-screen overlays reached from two sibling buttons, with Smart Week carrying its own Balanced/Macro toggle on top: four entry points for one grid, and the choice was irreversible in the UI (comparing two meant cancelling out and starting from a different button). The bias is now a chip row (**Balanced · Macro · Time**) that regenerates in place; Macro still only appears when real macro goals exist. Time keeps its day-budget quiz, shown inline until at least one day is assigned, with an "‹ Adjust days" way back; assignments still persist in `mc-cookbook:timecheck`. The two overlays also carried a near-identical ~60-line day-grid renderer — that's `pwDayBlocks` now.

**Home ranks, it doesn't stack (audit C-09):** `renderHome()` shows **at most one nudge banner** (tour outranks the stale-backup nudge) and **at most one suggestion card** (Today ▸ auto-draft ▸ recap). Each was previously appended independently; on a Monday with a stale backup, favorites set and a meal planned for today, that really did render 2 banners + 2 cards on top of the hero, the For You carousel and seven browse modules. Ranking replaces accumulation — add new Home cards to the ranking, not after it.

**Week generation is one engine (audit C-04):** `wkGenerateWeek(scopeKey, mode, args)` / `wkRegenerateSlot(...)` over a shared `wkPickForSlot`, with the three biases declared in `WEEK_MODES` — `balanced`, `macro`, `time`. These used to be three near-verbatim namespaces (`smw*` / `msg*` / `tcw*`) producing the identical `{day, slot, id}` grid; Time Check already called Balanced's own scorer, which is what showed the seam. A mode declares only what differs: `prepare()`, `skipDay()`, `narrow()`, `score()`, `track()`. **One asymmetry is deliberate and preserved:** Time Check passes no `dayBias`, so it has never had the training-day protein bias Balanced does — changing that is a product decision, not a refactor. Scoring functions (`smwScoreCandidate`, `msgScoreCandidate`, `msgBudgetFor`, `macroTrendBias`) kept their names. **Bridge (roadmap B2):** Smart Week's `smw*` scoring and the Macro Smart Generator's `msg*` budget both read `MCBridge.likelyTrainingDays()` (a real historical weekday-training pattern, not a fabricated schedule) to bias meal selection toward higher protein on likely training days, lighter on rest days; `macroTrendBias()` separately reads `mc-cookbook:mealplan:macrohistory` and bumps the Macro Smart Generator's protein target when the trailing trend is clearly under goal (surfaced as a visible, non-silent reason line in the Smart Week overlay's Macro-Targeted mode). The Home hero's `emptyHeroCopy()` also checks real training signal (`trainingNudgeCopy()`) before falling back to its generic time-of-day copy, and the "Past 7 Days" recap card (`weeklyRecapStats()`) fuses in a workouts-this-week count from the bridge. **Bridge (roadmap B3):** the existing "Today" card (`renderTodayCard()`) gains a real workout-status badge (`todayWorkoutBadge()`) and now renders even with a workout logged but no meals planned (previously returned `null` and silently dropped the signal); Home's topbar gains a persistent reciprocal nav link to the workout app (`.home-workout-btn`), `MARKET:STRIP`/`MARKET:ADD`-gated the same way the workout app's own cookbook link is (absolute URL standalone, relative `../dashboard.html` when mounted in the Rolodex). Turns out the two apps are same-origin (see `4-Weeks-to-Open-/cookbook-bridge-roadmap.md`'s architecture correction), so this link's sign-in continuity needed no extra code. |
| `collection.html` / `collection.js` | One collection's recipe list (`collection.html?c=<id>`) + live search; coming-soon placeholder for future collections; also serves the "My Recipes" collection. |
| `mc-data.js` | **The recipe data layer: a small index now, detail on demand** (CI initiative 5). `recipes-data.js` is 1.04 MB and all three page types loaded it synchronously, in full, before anything painted — so opening ONE recipe parsed all 318. `tools/build-data.js` splits it into **`recipes-index.js`** (155 KB — 14.5% of the source; every field a card, the planner, Home, Browse, Favorites or a recipe header needs) plus **16 `recipes-detail-NN.js` shards** (33–70 KB) holding `ingredients_by_serving`, `instructions` and `description`. This module builds `window.RECIPES` from the index and injects shards on demand. **`window.RECIPES` keeps its shape, and that is what makes the split safe:** each entry is a real object with the detail fields simply absent, and `_absorb()` assigns them onto **those same objects**, so any reference a caller already captured gains ingredients in place — `recipesIn()`, `recipeById()`, `MCGrocery`, the week generator and `user-recipes.js` all work untouched. What callers *do* have to do is wait: `ensureDetail(id)` (one shard — `recipe.html`), `ensureMany(ids)`, `ensureAll()` (the whole corpus — the shell needs it for ingredient search, the "Use it up" index, the low-shopping filter and the grocery merge), with `hasDetail()`/`allReady()` for a synchronous check. Shards load via injected `<script>` rather than `fetch()` so they ride the SW's cache-first path and still work from `file://`. A failed shard resolves **false** rather than hanging, so callers degrade instead of waiting forever. User recipes carry their detail inline and are always ready. Exposed as `window.MCData`. |
| `mc-fav.js` | **The ❤ favorites store** (`mc-cookbook:favorites`), shared by all three controllers. Audit C-07: each of them carried its own `loadFavs`/`toggleFav` over the same key, and `CLAUDE.md` already *described* it as `window.MCFav` — that was only an export at the bottom of `cookbook-home.js`'s IIFE that the other two never used. This makes the documented thing the real thing. Exposes `MCFav.onWriteFail` so the shell can surface a quota failure (C-12); pages that don't set it behave as before. |
| `mc-timers.js` | **The kitchen timer store + the rail that shows it** (CI initiative 1). A timer used to be a `setInterval` id closed over by `timerChip()` in `cookbook.js` and bound to a DOM node inside the Cooking Mode overlay — and `renderCook()` blanks that overlay (`o.innerHTML = ""`) on every step advance **and every done-toggle**, so a running countdown was silently destroyed the moment a cook swiped forward to read ahead. Three properties replace it: **a timer is an absolute instant, not a countdown** (`endsAt` epoch ms, remaining derived from `Date.now()` on every read — nothing decrements, so nothing can drift, and a timer that expired while the phone was locked reports itself correctly the moment the screen wakes); **the store is the truth, not the DOM** (`mc-cookbook:timers`, so a re-render, a tab switch, or a full navigation from `recipe.html` to `index.html` cannot destroy it); and **one ticker for all timers**, stopped entirely when none are running. Deliberately a 250 ms `setInterval` and **not** `requestAnimationFrame` — rAF is paused completely in a backgrounded tab, which is exactly when noticing an expiry still matters; correctness never depends on either, because of property 1. Renders its own rail (`MCTimers.mountRail()`) so the shell, collection pages, `recipe.html` and Cooking Mode all get one definition of it, and publishes its height as `--mc-rail-h` on `:root` so the bottom-anchored controls in `cookbook.css` clear it. Pinned by `tools/test-mc-timers.js` against a controllable clock. Exposed as `window.MCTimers`. |
| `mc-cards.js` | **The recipe card**, shared by the shell and collection pages (audit C-07). Previously duplicated: ~300 lines each of icon-SVG table, `CARD_PATTERNS`, `clampAccent` (triplicated — `cookbook.js` too), `rgbFromHex`, `hashStr`, `cardPatternFor`, `cardSheenDelay`, `macroStatsHtml`, and the card itself, which had already drifted apart (collection pages grew a user-recipe delete control; the shell grew a pantry badge, serving override, owner double-tap curation and a favorites-screen removal path). One card now renders every surface, with per-call `opts` for what a card *shows* and `MCCards.configure(hooks)` for how a *page* adds to the plan / toasts / curates. Hooks default to no-ops. Behavior is identical to the two it replaced, asymmetries included — delete only where `opts.allowDelete`, curation only on the shell, collection pages keep their flat "Toggle favorite" heart label. Load `mc-fav.js` and `mc-cards.js` before any page controller. |
| `mc-units.js` | **The ingredient truth layer: unit normalization, a metric bridge, a curated count→weight density table, and a real aisle model** (CI initiative 2). Measured against the real 856-identity corpus: 208 ingredient identities (24.4%) resolved to more than one quantity bucket in the merged grocery list — `"3 cloves · 1 clove · 1 tbsp · 6 g"` on one row instead of one buyable number — because `g`, the corpus's 5th-most-common unit, sat outside both the old `vol`/`wt` families, and the unit half of a bucket key was never singularized (`clove` and `cloves` were different buckets by construction). `g`/`kg` and `ml`/`l` now extend those families with exact physical conversions; `UNIT_WORD_ALIASES` + `singularizeUnit()` fix the pluralization gap; a small, explicit `DENSITY` table (average whole-item weights for the corpus's ~30 highest-frequency count-measured items, e.g. "1 medium onion ≈ 110 g") bridges a count word into a real weight **only** for items it's confident about — an item absent from the table is left exactly as fragmented as before, deliberately. Net measured effect: **179/854 (21.0%)** now fragment, a real but modest first slice — most of the remainder is either a genuine cooking-measurement-vs-weight divide (a cup of chopped onion vs. a whole one) this file doesn't attempt to bridge, or a blank-quantity data quirk. Every density conversion is tagged (`viaDensity`) so the UI can show its work rather than present an estimate as fact (see `mc-grocery.js`'s `derived` notes and `cookbook-home.js`'s `.grocery-qty.has-derived` tap-to-reveal). Also derives a **real aisle model** (`aisleFor()`, `AISLE_ORDER`) from `ingredient.category` plus a keyword check — `category` stays the untouched four-value data-integrity enum `tools/validate-recipes.js` enforces; aisles are a display grouping layered on top (Produce → Meat & Poultry / Seafood → Dairy & Eggs → Spices & Seasonings → Condiments & Sauces → Dry Goods & Pantry → Frozen, perimeter-first with frozen deliberately last). Pure, no DOM, no storage — `tools/test-mc-units.js` runs it as a **ratcheting** CI gate over the real corpus (179 is the ceiling; it may only go down). Exposed as `window.MCUnits`. |
| `mc-grocery.js` | **The merged grocery list's quantity math** (audit C-08): parsing an amount (`"1 1/2"`, `"0.75"`, `"to taste"`), summing across planned meals, purchase-unit conversion, and the ingredient-identity keying (`category|singularized-name`) that both the grocery merge **and** Smart Week's ingredient-overlap scoring read — one definition, two callers. **CI initiative 2** moved unit conversion, the density table and aisle assignment out to `mc-units.js`; `buildGrocery()` now bucket-keys each ingredient line through `MCUnits.resolveUnit()` and groups rows by `MCUnits.aisleFor()` instead of the raw category, returning `{ aisle, rows }` (was `{ category, rows }`) with each row optionally carrying `derived` — deduplicated, human-readable notes (`"1/2 each ≈ 29 g"`) for any sub-amount that came from a density estimate rather than an authored quantity. Takes five readers via `MCGrocery.configure()` (`recipes`, `recipeById`, `planMeals`, `loadPantry`, `pantryKey`). |
| `mc-recipe-form.js` | **The "Add Recipe" overlay** (audit C-08) — title, icon, category, structured ingredients and numbered steps, persisted via `MCUser`. Needs four hooks (`categoryOrder`, `closePicker`, `recipes`, `setTab`); `MCRecipeForm.open()` is the single entry point. |
| `recipe.html` / `cookbook.js` | Unified recipe detail: fixed header (title/tags/times/serving stepper) + swipeable sub-tabs (Overview & Macros · Grocery · Recipe). Owns serving scaling (`scaleQuantity`, wired for arbitrary 1–12 servings), check-off state, screen wake lock, and full-screen Cooking Mode. **Timers are no longer owned here** — `timerChip()` is a thin view over `mc-timers.js`, and the Web Audio ping / vibrate / expiry handling moved there with them so one definition serves every surface. `?cook=1` opens Cooking Mode directly (the page used to parse only `?id` and always `setTab("overview")`, so hands-free mode sat four taps deep behind the third sub-tab with no way to link to it); Home's Today card links there. Cooking Mode's voice grammar also covers timers now — *"set a timer for N minutes"*, *"how long left"*, *"stop the timer"* — since setting one was the last thing that still required a tap. |
| `cookbook-nav.js` | Renders the floating 🏠 Home button on `data-tabbar="page"` pages. Exposes `window.MCNav`. |
| `recipes-data.js` | **The data layer** (~23.2k lines / ~1.04 MB). `RECIPES` array (318 recipes) + `COLLECTIONS` array. Still the **single source of truth and the only file you edit to add a recipe** — but as of CI initiative 5 **no page loads it any more**: `tools/build-data.js` generates `recipes-index.js` + 16 detail shards from it, and those are what ship (it's excluded from the SW precache for that reason). `window.RECIPES` / `window.COLLECTIONS` are assembled by `mc-data.js` instead, with the same shape. |
| `user-recipes.js` | "My Recipes" — lets a cook add their own recipes from the Home hub; stored in `localStorage` (`mc-cookbook:userrecipes`) and merged into `window.RECIPES`/`COLLECTIONS` at load so they behave like built-in recipes everywhere (search, planner, favorites, categories). Must load after `recipes-data.js`, before the page controllers. |
| `tracker.js` / `tracker-store.js` / `tracker-calc.js` / `tracker-foodapi.js` / `tracker-barcode.js` / `tracker-recipe.js` | The in-app macro tracker (`#screen-tracker`): week calendar strip, hour-by-hour food log, calorie/macro goals from a suggest-then-adjust calculator, food entry via Open Food Facts search or barcode scan, and direct recipe logging from the recipe page. Store is `mc_macros_v1` — the same key and shape 4-Weeks-to-Open-'s workout app uses, so a signed-in trainee's tracker data is one store, not two (see Client-side state below). Exposed as `window.MCTracker`. |
| `mc-supabase.js` / `mc-sync.js` / `mc-account.js` | Optional login + cross-device sync, ported from 4-Weeks-to-Open- (same Supabase project — one account works in both apps). `mc-supabase.js` is the client + auth (invite-only, no public sign-up); `mc-sync.js` mirrors a whitelist of localStorage stores to Supabase's `user_sync` table per signed-in user — `mc_macros_v1` plus every `mc-cookbook:mealplan*` key, `mc-cookbook:userrecipes`, `mc-cookbook:cooked`, and (**audit C-02**) `mc-cookbook:favorites` + `mc-cookbook:pantry` (each with its own merge strategy — see the file header). Favorites and pantry were absent from the whitelist until C-02: three screens write favorites and Home advertises "☁️ Backed up," but they never left the device. Both are `Array.from(Set)` id lists, so they use the existing `stringSet` union strategy unchanged. **Deliberately still not synced**, with reasons in the file: `:photos` (image data doesn't belong in a jsonb row), `:timecheck` (no timestamp and no union semantics — needs a `ts` field before it can sync honestly), `:timers` (a running timer is device-local by nature — the phone on the counter is cooking, the laptop is not — and no merge strategy works: union would resurrect cancelled timers on the other device, replace would let a backgrounded device wipe the one you're actually cooking on), and the device/session-local preferences (`:tourSeen`, `:owner`, `:cookfont`, `:lastScreen`, `:lastBackupAt`, the dismissal stamps, and per-recipe check-offs). **Bridge (roadmap B0):** `mc-sync.js` also has a `CONSUME` map that **pulls, read-only,** the workout app's `mc_activity` + `mc_workout_log_v1` from the same `user_sync` table (owner authoritative, `replace` merge, never pushed back — one writer per store); `mc-bridge.js` reads those for a cross-app view. `mc-account.js` is the sign-in-sheet UI, mounted into the Home top bar by `cookbook-home.js` via `window.MCAccount.mount(container)`, and also hosts the Export data / Import data buttons (works whether signed in or not). All three sync modules are no-ops when signed out — nothing changes for a cook who never logs in. **Roadmap B5:** the merge functions (`mergeMacros`, `mergePlan`, `mergeStringSet`, `mergeHistoryBySavedAt`, `mergeArrayByField`, `mergeCookedByRecipe`) are private closures in a browser-only IIFE, so a `module.exports` hook was added as the literal first statement inside it (before the `window.__mcSync`/`MC_SB` guards) — the merge functions are `function` declarations further down the same closure so they're already hoisted and defined regardless of how the guards resolve. `tools/test-mc-sync-merge.js` sandboxes the real file with `vm` (fake `window`/`MC_SB` so the guards return early right after `module.exports` is set) and asserts real conflicting-fixture behavior — now a blocking CI step, not just a local check. `tracker-foodapi.js`/`tracker-calc.js`/`tracker-barcode.js` are generated copies of the workout app's `mc-foodapi.js`/`mc-macrocalc.js`/`mc-barcode.js` via `tools/sync-shared-modules.py` in that repo (which also enforces the byte-identical copies of `mc-bridge.js`/`mc-install.js`/`mc-backup-status.js`/`tools/test-mc-bridge.js`; a CI drift gate in both repos' `pages.yml` fails on any stale copy) — don't hand-edit them here. |
| `mc-bridge.js` | **Shared cross-app READ layer (cookbook ↔ workout), roadmap B0–B2.** Read-only view over the data both apps share: `todaysMeals()` (from `mc-cookbook:mealplan`, preferring each meal's own denormalized `{title,icon,macros}` snapshot — see `mealSnapshot()` below — and falling back to a live `window.RECIPES` lookup for legacy entries; macros are normalized from recipes-data.js's real `calories/protein_g/fat_g/carbs_g` fields to `{kcal,p,f,c}`, matching `mc_macros_v1`'s native entry shape), `todaysWorkout()` / `recentActivity()` (from the pulled `mc_activity` + `mc_workout_log_v1`), `macroTargets()` (from the shared `mc_macros_v1.goals`), `likelyTrainingDays()` (roadmap B2 — a real historical per-weekday training pattern from `mc_workout_log_v1`, `{}` until enough history exists), `today()`. Never writes. **Byte-identical to the copy in 4-Weeks-to-Open-** — edit there, copy here; `tools/test-mc-bridge.js` runs in **both** repos' CI as of roadmap B5 (previously only 4-Weeks-to-Open- had a copy — a real coverage gap on this repo's own file, closed by copying the test here too). Exposed as `window.MCBridge`. |
| `mc-export.js` | **The app's one manual backup** (logged-out or logged-in): exports every `mc-cookbook:*` key plus `mc_macros_v1` as a downloadable JSON file, and restores from one. Two UIs call it — the `mc-account.js` sheet and Home's "Backup & Restore" card (`cookbook-home.js`'s `renderBackupSection`, which adds a `confirm()` the sheet doesn't). **Audit C-01:** `cookbook-home.js` used to carry a second, independent implementation whose file format was mutually unreadable with this one even though both wrote `mikes-cookbook-backup-<date>.json` — one rejected the other's files, the other accepted them and double-encoded every store. Consolidated here; that file now only holds thin adapters. Format is **v2**, and values are the **raw localStorage strings** — not every store holds JSON (`:lastBackupAt` is a bare ISO stamp, `:mealplan:recap-dismissed` a bare week key), so a parse/stringify round trip corrupts them. v1 (old `cookbook-home.js`) and unversioned (old `mc-export.js`) files still import. `tools/test-mc-export.js` pins all of this in CI. |
| `mc-install.js` | **Roadmap B4 — ported from 4-Weeks-to-Open-, byte-identical.** Captures the native Android `beforeinstallprompt` at page load (loads first thing in `<body>` in `index.html`, since the event only reaches a listener already attached) and exposes `window.MC_INSTALL` (`platform`, `isInstalled()`, `canPrompt()`, `prompt()`, `onChange(fn)`). Fully app-agnostic — no cookbook-specific logic. Consumed by `mc-account.js`'s Install section. |
| `mc-backup-status.js` | **Roadmap B4 — ported from 4-Weeks-to-Open-, byte-identical.** Fills `#backupStatus` (a placeholder `cookbook-home.js`'s `renderHome()` re-creates on every Home visit) with the live "☁️ Backed up · Nm ago" state from `mc-sync.js`. Re-queries the DOM on every `render()` call rather than caching the element once, since this SPA rebuilds Home's whole DOM each visit (the workout app's stable-DOM dashboard would work with either approach); exposes `window.MC_BACKUP_STATUS.refresh()`, which `renderHome()` calls right after re-creating the placeholder so the status shows immediately instead of waiting up to 15s for the next interval tick. |
| `cookbook.css` | The entire design system + all component styles (~108 KB). Design tokens live in `:root`. |
| `cookbook-sw.js` | Shared service-worker **registration** + update toasts; included on every page. |
| `sw.js` | The service worker itself. `CACHE_URLS` is **auto-generated** — never hand-edit it. |
| `manifest.json` / `icon.svg` | PWA manifest + app icon. |
| `diagnostics.html` | **Device Check** — the real-device half of the audit's verification, which CI can't do. Standalone and unlinked from nav (same precedent as the Quick Tour). Loads the same script set `index.html` does, then self-tests: install/display mode, service-worker registration + control, precache completeness and app-shell-from-cache (offline readiness), every `MC*` shared module, localStorage writability + storage quota + the `:photos` cap, Supabase config/sign-in/last-push-pull, wake lock / BarcodeDetector / camera, safe-area insets — and the **real** `window.__mcBoot` boot number that closes audit C-06. "Copy report" yields a plain-text summary. Open it on each device and mode to fill the PWA matrix. |
| `quick-tour.html` / `quick-tour-overview.html` | Standalone, cookbook-styled walkthroughs of the app's features (Smart Week, Time Check, sub-tabs, etc.); not linked from the shell nav, used for onboarding/demo. |
| `recipes-index.js` / `recipes-detail-NN.js` | **Generated — never hand-edit.** Output of `tools/build-data.js`; see `mc-data.js` above. Regenerate with `node tools/build-data.js` after any `recipes-data.js` change; CI fails on a stale copy (`--check`) and on an orphaned shard left behind by a smaller `SHARDS`. `--report` prints the size table. |
| `tools/build-sw.py` | Regenerates `sw.js`'s precache list and (optionally) bumps the cache version. Skips `recipes-data.js` — see its row above. |
| `tools/smoke-test.js` | **Local only, not in CI.** Drives the real app in Playwright/Chromium: shell boot, detail hydration, ingredient search, `?cook=1`, and the two regressions worth pinning — a timer surviving a step advance and surviving a full page navigation. Needs Playwright, which this repo has no npm step for, so wiring it into `pages.yml` is a separate decision. Run it before pushing anything that touches load order, Cooking Mode or the timers. |
| `.github/workflows/pages.yml` | CI, two jobs: **`verify`** (12 blocking gates — syntax, recipe data, doc-drift check, bridge + sync-merge tests, kitchen-timer store, split data layer, generated-data freshness, ingredient units/aisle model, SW strategy, backup format, precache freshness, shared-module drift) runs on **pull requests and `main`**; **`deploy`** (`needs: verify`, `main` only) regenerates the SW and publishes to GitHub Pages. See CI / deploy below. |
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
  Pantry** — a four-value data-integrity enum enforced by
  `tools/validate-recipes.js`, never edited or extended for display purposes;
  `mc-units.js`'s `aisleFor()` derives the grocery list's actual on-screen
  grouping from it, see that file's row below).
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
- `mc-cookbook:timers` — `{ v: 1, timers: [{ id, recipeId, recipeTitle,
  stepNumber, label, seconds, endsAt, pausedLeft, alerted }] }`, the kitchen
  timers (`mc-timers.js`). **`endsAt` is an absolute epoch instant, not a
  remaining count** — that's the whole design: remaining time is derived from
  `Date.now()` on every read, so nothing decrements and nothing can drift under
  background throttling or a locked screen. `pausedLeft` holds the frozen
  remainder while paused (and `endsAt` is null); `alerted` stops a single expiry
  from pinging on every tick. Capped at `MAX_TIMERS` (8), evicting a finished
  timer before a running one so a cook mid-recipe never loses a live countdown.
  **Not synced** — see the `mc-sync.js` row above.
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
- It also shows the **kitchen timer notification** (`MC_TIMER_DONE` message from
  `mc-timers.js`) and focuses the existing window on `notificationclick`. The
  notification is deliberately posted *by the page*, not scheduled in the SW:
  with no Push service and no backend, a service worker cannot wake itself at a
  future instant. So it fires only while the document is still alive (a
  backgrounded tab, typically Android). When the OS has fully suspended the page
  — iOS with the screen locked — nothing fires, and the timer instead reports
  itself as already finished the moment the app is reopened, because `endsAt` is
  an absolute instant. That degradation is the honest limit of a no-backend PWA.

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

- **`verify`** — runs on **pull requests and on `main`**. Twelve gates, all
  blocking:
  1. `node --check` over every tracked `*.js` (syntax gate — **all JS must pass**).
  2. `tools/validate-recipes.js` — recipe-data shape (Pillar A).
  3. `tools/check-docs.js` — docs match the code: recipe/collection/category
     counts, file-size claims, and structural claims (e.g. tab bar, screen
     count, SW strategy) across `CLAUDE.md`, `README.txt`, `ROADMAP.md`, and
     the Quick Tour pages (audit C-11).
  4. `tools/test-mc-bridge.js` + `tools/test-mc-sync-merge.js` — cross-app read
     layer and sync-merge logic (roadmap B5, audit C-02).
  5. `tools/test-mc-timers.js` — the kitchen timer store (CI initiative 1). Runs
     the real module against a **controllable clock**, so the property the whole
     design rests on — a timer is an absolute instant and therefore survives
     suspension — is asserted directly rather than waited out.
  6. `tools/test-mc-data.js` — the split data layer (CI initiative 5). Its
     round-trip check is the important one: index + shards must reconstruct
     every authored field of every recipe. It caught real data loss while being
     written — `subsection` (236 recipes) had been dropped from the index, and
     nothing else would have noticed until a collection's sub-tabs came up
     empty. The generator's field list is a **deny-list** now for that reason.
  7. `tools/build-data.js --check` — the generated index and shards are current
     (and no orphaned shard is left behind).
  8. `tools/test-mc-units.js` — the ingredient unit/density/aisle model (CI
     initiative 2). Its corpus-wide fragmentation count is a **ratchet, not a
     fixed assertion**: measured at 179 of 854 ingredient identities (was 208
     before this file existed) and allowed to fall freely as `DENSITY` grows,
     but never to rise — a new recipe introducing a unit this file can't
     reconcile should fail review, not disappear into a grocery row silently.
  9. `tools/test-sw-strategy.js` — service-worker stale-while-revalidate (LS-4).
  10. `tools/test-mc-export.js` — backup format round trip + legacy files (C-01).
  11. `tools/build-sw.py --check` — precache list is current.
  12. Shared-module drift vs the 4-Weeks-to-Open- canonical copies (LS-1).
- **`deploy`** — `needs: verify`, and gated to `main` by
  `github.event_name != 'pull_request' && github.ref == 'refs/heads/main'`, so
  nothing ever deploys from a PR branch. Regenerates the SW with
  `--version ci-<run>` and publishes the repo root to GitHub Pages.

Before pushing, run the same gates locally:

```bash
for f in $(git ls-files '*.js'); do node --check "$f" || echo "FAIL $f"; done
node tools/validate-recipes.js
node tools/check-docs.js
node tools/test-mc-bridge.js && node tools/test-mc-sync-merge.js
node tools/test-mc-timers.js && node tools/test-mc-data.js
node tools/test-mc-units.js
node tools/test-sw-strategy.js && node tools/test-mc-export.js
python3 tools/build-sw.py --check && node tools/build-data.js --check
```

## Git workflow

- **Develop on a feature branch, land via pull request.** Recent history is
  entirely PR-based (`claude/<slug>` branches merged into `main`) — this
  section used to say "work from `main` only, don't open PRs," which stopped
  matching practice once audit C-16 put `verify` on pull requests as well as
  `main` specifically so a branch's checks run before merge, not after.
- The `verify` job runs on both the PR and `main`; `deploy` only fires on
  `main` after `verify` passes, so nothing publishes straight from a branch.
- Merging to `main` triggers the GitHub Pages deploy — every merge is a
  production release. Make sure the `node --check` gate and the rest of the
  CI gates above pass, and the SW precache list is current, before merging.

## Quick reference

- Add a recipe → append to `RECIPES` in `recipes-data.js`, then **run
  `node tools/build-data.js`** — no page loads `recipes-data.js` any more, so a
  recipe that isn't regenerated into the index simply won't exist in the app
  (CI fails on it). `python3 tools/build-sw.py` is still not needed for a
  recipe (no new file), but bump the SW version if you want returning users to
  refetch.
- Add/remove a top-level file → **always** run `tools/build-sw.py` and bump the
  cache version.
- Deep links: `recipe.html?id=<recipe_id>`, `collection.html?c=<collection_id>`,
  shell screens via `index.html#<screen>` (e.g. `#favorites`).
- Recipe photo handed off → save to `images/recipes/<recipe_id>.<ext>`, add a
  `photo` field to that recipe in `recipes-data.js`, and run
  `tools/build-sw.py` (bump version). See the Recipe photo hand-off rule above.

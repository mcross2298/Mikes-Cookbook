Mike's Cookbook
===============

A premium, tactile mobile cookbook PWA bridging cherished heirloom recipes
("Hand-Me-Downs") and performance nutrition (Primal / Carnivore / Heritage).
Built to be used in the kitchen, on a phone, offline.

Static HTML/CSS/JS — no framework, no build step, no bundler. Serve the folder
and open index.html. (Installable PWA: manifest + service worker for offline
use; the service worker and the install prompt both need an http(s) origin, so
prefer `python3 -m http.server 8000` over opening the file directly.)

Contents
--------
  RECIPES: 318 recipes across 11 dish categories
  COLLECTIONS: 13 live, 2 coming soon

Structure
---------
index.html        App shell. Six hub-and-spoke screens — Home, Planner,
                  Browse, Favorites, Mike's Favorites, Tracker — plus one
                  persistent 2-tab bar (Cookbook / Tracker). Home is the hub;
                  every spoke has a "< Home" anchor back. Browse folds the
                  old Categories screen's dish-type taxonomy in alongside
                  collections and app-wide search.
cookbook-home.js  Shell controller: screen switching, Home hub, This Week
                  planner ("Plan my week" — Balanced / Macro / Time bias
                  chips over one shared generator, grocery list, cook log),
                  Browse, Favorites, Mike's Favorites.
collection.html   One collection's recipe list (+ live search).
collection.js     Collection render + search; coming-soon state for future
                  collections.
recipe.html       Unified recipe-detail view (header + 3 swipeable sub-tabs).
cookbook.js       Detail render + state (serving ladder, check-off, cook log,
                  screen wake lock, full-screen Cooking Mode).
cookbook.css      Design system + all component styles.
recipes-data.js   RECIPES + COLLECTIONS — the data layer. Everything derives
                  from it; adding a recipe needs no rendering changes.
user-recipes.js   "My Recipes" — cook-authored recipes, stored locally and
                  merged into RECIPES at load.
tracker*.js       In-app macro tracker (food search, barcode scan, goals).
mc-*.js           Shared modules: the recipe card and favorites store, the
                  grocery quantity math, the add-recipe form, plus optional
                  sign-in, cross-device sync, manual backup, install prompt,
                  and the read-only cookbook<->workout bridge.
manifest.json     PWA manifest.  icon.svg  App icon.  sw.js  Service worker.
diagnostics.html  Device Check — real-device PWA/offline/storage self-test,
                  unlinked from nav.
quick-tour.html   Standalone, cookbook-styled feature walkthroughs, unlinked
quick-tour-overview.html  from nav; used for onboarding/demo.
ROADMAP.md        Phased improvement roadmap, kept current with what's shipped.
tools/            build-sw.py (precache list) + the CI test/validation suite,
                  including check-docs.js (fails CI on stale doc claims).
.github/workflows/pages.yml
                  CI: a `verify` job (12 blocking gates) on pull requests and
                  main, then `deploy` to GitHub Pages on main only.

Open:  index.html   ·   recipe.html?id=jalapeno-chicken-bake
       collection.html?c=two-meals-a-day   ·   index.html#planner

Adding things
-------------
Add a recipe:     append to RECIPES in recipes-data.js.
Add a collection: append to COLLECTIONS. Every recipe `source` needs a live
                  collection whose `source_match` equals it, or CI fails —
                  that's what keeps a recipe from becoming unreachable.
Add/remove a top-level file: run `python3 tools/build-sw.py` (bump the version
                  with --version to make returning users refetch).

Before pushing, run the same gates CI does:
  for f in $(git ls-files '*.js'); do node --check "$f" || echo "FAIL $f"; done
  node tools/validate-recipes.js
  node tools/check-docs.js
  node tools/test-mc-bridge.js && node tools/test-mc-sync-merge.js
  node tools/test-sw-strategy.js && node tools/test-mc-export.js
  python3 tools/build-sw.py --check

See CLAUDE.md for the full architecture, data model, and conventions.

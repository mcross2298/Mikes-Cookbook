Mike's Cookbook
===============

A premium, tactile mobile cookbook app bridging cherished heirloom recipes
("Hand-Me-Downs") and performance nutrition (Primal / Carnivore).

Static HTML/CSS/JS — no framework. Serve the folder or open index.html.
(Installable PWA: manifest + service worker for offline use in the kitchen.)

Structure
---------
index.html        Tabbed app shell — Home · Recipes · Favorites (bottom tab
                  bar, mirrors the 4-Weeks-to-Open dashboard).
cookbook-home.js  Shell controller: tab switching + Home / Recipes / Favorites.
collection.html   One collection's recipe list (+ live search).
collection.js     Collection render + search; coming-soon state for future
                  collections.
recipe.html       Unified recipe-detail view (header + 3 swipeable sub-tabs).
cookbook.js       Detail render + state (serving ladder, tabs, check-off, ❤️).
cookbook.css      Design system + all component styles.
recipes-data.js   RECIPE data + COLLECTIONS (the Recipes-tab flagship cards).
manifest.json     PWA manifest.  icon.svg  App icon.  sw.js  Service worker.
tools/build-sw.py Regenerates the SW precache list (run after adding files).
.github/workflows/pages.yml  CI: node --check JS gate → deploy to GitHub Pages.

Recipes tab (collections)
-------------------------
  Two Meals a Day      Primal Diet — live (10 recipes)
  Kelli Cross' Recipes Heritage   — coming soon
  Carnivore            Carnivore  — coming soon

Open:  index.html   ·   recipe.html?id=jalapeno-chicken-bake
Add a recipe: append to RECIPES. Add a collection: append to COLLECTIONS.
After adding/removing files, run:  python3 tools/build-sw.py

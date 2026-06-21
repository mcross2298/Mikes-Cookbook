/* ==========================================================================
   cookbook-home.js  —  Phase 3 (tabbed shell)
   --------------------------------------------------------------------------
   Drives index.html as a 4WTO-style tabbed PWA shell:

     Home        — landing: hero + quick stats + a tappable Favorites module
                   + a featured recipe. Favorites no longer has its own tab;
                   the Favorites module opens the favorites list (#favorites).
     Categories  — the 7 dish-type categories as premium cards (mirrors the
                   Recipes-tab collection cards). Tapping a category drills
                   into a grid of that category's recipes.
     Recipes     — flagship COLLECTION cards + app-wide search.
                   "Two Meals a Day" (live) opens collection.html?c=<id>;
                   coming-soon collections show a placeholder.

   Reads RECIPES + COLLECTIONS from recipes-data.js. No framework, no build.
   Active tab is mirrored to location.hash (#recipes) so it survives reloads
   and returning from collection.html / recipe.html.
   ========================================================================== */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var el = function (tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };
  function rgbFromHex(hex) {
    var h = (hex || "").replace("#", "");
    if (h.length !== 6) return "200,122,83";
    return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }).join(",");
  }

  function recipes() { return window.RECIPES || []; }
  function collections() { return window.COLLECTIONS || []; }
  function recipesIn(col) {
    if (!col.source_match) return [];
    return recipes().filter(function (r) { return r.source === col.source_match; });
  }

  /* ── Favorites (shared store, also read by collection.js / recipe page) ── */
  var FAV_KEY = "mc-cookbook:favorites";
  function loadFavs() {
    try { return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]")); }
    catch (e) { return new Set(); }
  }
  function saveFavs(set) {
    try { localStorage.setItem(FAV_KEY, JSON.stringify([].slice.call(set))); } catch (e) {}
  }
  function toggleFav(id) {
    var set = loadFavs();
    if (set.has(id)) set.delete(id); else set.add(id);
    saveFavs(set);
    return set.has(id);
  }

  /* ── Dish-type categories ─────────────────────────────────────────── */
  // Each recipe declares exactly one `dish_category`, so a recipe always has a
  // single home. Per-category icon/accent/blurb drive the Categories cards.
  var CATEGORY_ORDER = [
    "Breakfast",
    "Salads & Slaws",
    "Soups, Stews & Chilis",
    "Casseroles & Bakes",
    "Skillets & Stir-Fries",
    "Grilled & Sheet-Pan",
    "Sandwiches"
  ];
  var CATEGORY_META = {
    "Breakfast":             { icon: "🍳", accent: "#E0A458", blurb: "Eggs, hashes, and morning plates to start the day strong." },
    "Salads & Slaws":        { icon: "🥗", accent: "#7D8C77", blurb: "Crisp, bright bowls and big-ass salads." },
    "Soups, Stews & Chilis": { icon: "🥣", accent: "#C0633F", blurb: "Low-and-slow pots, broths, and bowls of comfort." },
    "Casseroles & Bakes":    { icon: "🧀", accent: "#C87A53", blurb: "Bubbling, golden, oven-baked one-dish dinners." },
    "Skillets & Stir-Fries": { icon: "🥘", accent: "#B5894E", blurb: "Fast, high-heat one-pan meals." },
    "Grilled & Sheet-Pan":   { icon: "🔥", accent: "#A65A3A", blurb: "Char, smoke, and hands-off sheet-pan roasts." },
    "Sandwiches":            { icon: "🥪", accent: "#B98A4B", blurb: "Stacked, handheld, low-carb-friendly bites." }
  };
  function presentCategories() {
    return CATEGORY_ORDER.filter(function (c) {
      return recipes().some(function (r) { return r.dish_category === c; });
    });
  }
  function recipesInCategory(cat) {
    return recipes().filter(function (r) { return r.dish_category === cat; });
  }

  /* ── Shared: a recipe card (used by Categories / Recipes / Favorites) ── */
  function recipeCard(r, opts) {
    opts = opts || {};
    var accent = r.accent || "#C87A53";
    var card = el("a", "rc");
    card.href = "recipe.html?id=" + encodeURIComponent(r.recipe_id);
    card.style.setProperty("--rc-accent", accent);
    card.style.setProperty("--rc-accent-rgb", rgbFromHex(accent));

    // macro_profiles are stored as TOTALS for the tier; show per-serving macros
    // on the card (tier total ÷ tier serving count = one individual serving).
    var tier = (opts.serving || (r.scaling_options && r.scaling_options[0]) || 2);
    var m = (r.macro_profiles && r.macro_profiles["serving_" + tier]) || {};
    var totalTime = (r.prep_time_mins || 0) + (r.cook_time_mins || 0);

    var meta = [];
    if (r.dish_category) meta.push(esc(r.dish_category));
    if (totalTime) meta.push(totalTime + " min");
    var macro = [];
    if (m.calories != null) macro.push(Math.round(m.calories / tier) + " cal");
    if (m.protein_g != null) macro.push(Math.round(m.protein_g / tier) + "g protein");

    card.innerHTML =
      '<div class="rc-band"><span class="rc-icon">' + esc(r.icon || "🍽️") + "</span></div>" +
      '<div class="rc-body">' +
        '<h3 class="rc-title">' + esc(r.title) + "</h3>" +
        '<p class="rc-meta">' + meta.join(" · ") + "</p>" +
        (macro.length ? '<p class="rc-macro">' + macro.join(" · ") + "</p>" : "") +
      "</div>";

    if (opts.fav) {
      var heart = el("button", "fav-toggle on", "❤");
      heart.type = "button";
      heart.setAttribute("aria-label", "Remove from favorites");
      heart.addEventListener("click", function (e) {
        e.preventDefault(); e.stopPropagation();
        toggleFav(r.recipe_id);
        renderFavorites();           // drop it from the list immediately
      });
      card.appendChild(heart);
    }
    return card;
  }

  /* ══ HOME screen ════════════════════════════════════════════════════ */
  function renderHome() {
    var s = $("#screen-home");
    s.innerHTML = "";

    s.appendChild(topBar("Mike's", "Cookbook",
      "Heirloom hand-me-downs & performance plates."));

    var live = collections().filter(function (c) { return c.status === "live"; });
    var featured = live.length ? recipesIn(live[0])[0] : recipes()[0];

    // Hero
    var hero = el("div", "home-hero");
    var hc = el("div", "home-hero-card");
    hc.innerHTML =
      '<p class="home-hero-eyebrow">Now Cooking</p>' +
      '<h2 class="home-hero-title">' + esc(live[0] ? live[0].title : "Recipes") + "</h2>" +
      '<p class="home-hero-text">' + esc(live[0] ? live[0].blurb : "") + "</p>";
    var cta = el("a", "home-cta", "Browse recipes →");
    cta.href = "#recipes";
    cta.addEventListener("click", function (e) { e.preventDefault(); setTab("recipes"); });
    hc.appendChild(cta);
    hero.appendChild(hc);
    s.appendChild(hero);

    // Quick stats
    var stats = el("div", "home-stats");
    [[recipes().length, "Recipes"], [presentCategories().length, "Categories"], [collections().length, "Collections"]]
      .forEach(function (p) {
        var c = el("div", "home-stat");
        c.innerHTML = '<div class="home-stat-num">' + p[0] + "</div>" +
                      '<div class="home-stat-key">' + p[1] + "</div>";
        stats.appendChild(c);
      });
    s.appendChild(stats);

    // Favorites module — compact, tappable, opens the favorites list.
    var favCount = loadFavs().size;
    var favMod = el("button", "home-fav");
    favMod.type = "button";
    favMod.setAttribute("aria-label", "Open favorites");
    favMod.innerHTML =
      '<span class="home-fav-icon">❤</span>' +
      '<span class="home-fav-text">' +
        '<span class="home-fav-title">Favorites</span>' +
        '<span class="home-fav-sub">' +
          (favCount ? favCount + (favCount === 1 ? " saved recipe" : " saved recipes")
                    : "Tap the heart on any recipe to save it") +
        "</span>" +
      "</span>" +
      '<span class="home-fav-arrow">→</span>';
    favMod.addEventListener("click", function () { setTab("favorites"); });
    s.appendChild(favMod);

    // Featured recipe
    if (featured) {
      var head = el("div", "home-section-head");
      head.innerHTML = "<h2>Featured</h2>";
      var link = el("span", "home-section-link", "All recipes →");
      link.addEventListener("click", function () { setTab("recipes"); });
      head.appendChild(link);
      s.appendChild(head);

      var grid = el("div", "col-grid");
      grid.appendChild(recipeCard(featured));
      s.appendChild(grid);
    }
  }

  /* ══ CATEGORIES screen — the 7 dish types, then a per-category grid ══ */
  // Default view: one premium card per category (reuses the .cat-card look from
  // the Recipes tab). Tapping a card drills into that category's recipe grid.
  var catState = { open: null };

  function categoryCard(cat) {
    var meta = CATEGORY_META[cat] || {};
    var accent = meta.accent || "#C87A53";
    var n = recipesInCategory(cat).length;

    var card = el("a", "cat-card");
    card.href = "#categories";
    card.style.setProperty("--cc", accent);
    card.style.setProperty("--cc-rgb", rgbFromHex(accent));
    card.innerHTML =
      '<span class="cc-glow"></span>' +
      '<span class="cc-sheen"></span>' +
      '<span class="cat-icon">' + esc(meta.icon || "🍽️") + "</span>" +
      '<div class="cat-tag">Category</div>' +
      '<div class="cat-name">' + esc(cat) + "</div>" +
      '<div class="cat-meta">' + esc(meta.blurb || "") + "</div>" +
      '<div class="cat-count">' + n + (n === 1 ? " Recipe →" : " Recipes →") + "</div>";
    card.addEventListener("click", function (e) {
      e.preventDefault();
      catState.open = cat;
      renderCategories();
      window.scrollTo(0, 0);
    });
    return card;
  }

  function renderCategories() {
    var s = $("#screen-categories");
    s.innerHTML = "";

    if (catState.open) { renderCategoryDetail(s, catState.open); return; }

    s.appendChild(topBar(null, "Categories", "Browse by dish type"));
    var wrap = el("div", "cards-wrap");
    presentCategories().forEach(function (cat) { wrap.appendChild(categoryCard(cat)); });
    s.appendChild(wrap);
  }

  function renderCategoryDetail(s, cat) {
    var list = recipesInCategory(cat);

    var top = el("div", "shell-top");
    var back = el("button", "col-back", "‹ Categories");
    back.type = "button";
    back.addEventListener("click", function () {
      catState.open = null;
      renderCategories();
      window.scrollTo(0, 0);
    });
    top.appendChild(back);
    top.appendChild(el("h1", "shell-title", esc(cat)));
    top.appendChild(el("p", "shell-sub",
      list.length + (list.length === 1 ? " recipe" : " recipes")));
    s.appendChild(top);

    if (!list.length) {
      s.appendChild(el("div", "empty",
        '<span class="empty-emoji">🍽️</span>No recipes in this category yet.'));
      return;
    }
    var grid = el("div", "col-grid");
    list.forEach(function (r) { grid.appendChild(recipeCard(r)); });
    s.appendChild(grid);
  }

  /* ══ RECIPES screen — collection cards + app-wide search ════════════ */
  // Default view = flagship collection cards. Once a search query is active,
  // the screen switches to a flat grid of matching recipe cards drawn from ALL
  // recipes. Dish-type browsing now lives on its own Categories tab.
  function recipesMatch(r, q) {
    if (!q) return true;
    q = q.toLowerCase();
    if ((r.title || "").toLowerCase().indexOf(q) >= 0) return true;
    if ((r.dish_category || "").toLowerCase().indexOf(q) >= 0) return true;
    if ((r.category || "").toLowerCase().indexOf(q) >= 0) return true;
    if ((r.tags || []).join(" ").toLowerCase().indexOf(q) >= 0) return true;
    var ing = r.ingredients_by_serving &&
      r.ingredients_by_serving["serving_" + (r.native_serving || 2)];
    if (ing && ing.some(function (i) { return (i.item || "").toLowerCase().indexOf(q) >= 0; })) return true;
    return false;
  }

  function renderRecipes() {
    var s = $("#screen-recipes");
    s.innerHTML = "";
    s.appendChild(topBar(null, "Recipes",
      collections().length + " collections · " + recipes().length + " recipes"));

    // Search box
    var searchWrap = el("div", "search-wrap");
    var box = el("input", "search-box");
    box.type = "search";
    box.placeholder = "Search all recipes…";
    box.setAttribute("aria-label", "Search all recipes");
    searchWrap.appendChild(box);
    s.appendChild(searchWrap);

    var results = el("div", "browse-results");
    s.appendChild(results);

    function paint() {
      var q = box.value.trim();
      results.innerHTML = "";

      if (!q) {                                       // default: collection cards
        var wrap = el("div", "cards-wrap");
        wrap.appendChild(el("div", "tier-label", "★ Collections"));
        collections().forEach(function (c) { wrap.appendChild(collectionCard(c)); });
        results.appendChild(wrap);
        return;
      }

      var list = recipes().filter(function (r) { return recipesMatch(r, q); });
      if (!list.length) {
        results.appendChild(el("div", "empty",
          '<span class="empty-emoji">🔍</span>No recipes match your search.'));
        return;
      }
      results.appendChild(el("div", "browse-count",
        list.length + (list.length === 1 ? " recipe" : " recipes")));
      var grid = el("div", "col-grid");
      list.forEach(function (r) { grid.appendChild(recipeCard(r)); });
      results.appendChild(grid);
    }

    box.addEventListener("input", paint);
    paint();
  }

  function collectionCard(c) {
    var soon = c.status !== "live";
    var card = el("a", "cat-card" + (soon ? " soon" : ""));
    card.href = "collection.html?c=" + encodeURIComponent(c.id);
    card.style.setProperty("--cc", c.accent);
    card.style.setProperty("--cc-rgb", rgbFromHex(c.accent));

    var count = soon ? "Coming Soon →" : (recipesIn(c).length + " Recipes →");

    card.innerHTML =
      '<span class="cc-glow"></span>' +
      '<span class="cc-sheen"></span>' +
      (soon ? '<span class="soon-badge">Soon</span>' : "") +
      '<span class="cat-icon">' + esc(c.icon || "🍽️") + "</span>" +
      '<div class="cat-tag">' + esc(c.tag) + "</div>" +
      '<div class="cat-name">' + esc(c.title) + "</div>" +
      '<div class="cat-meta">' + esc(c.blurb) + "</div>" +
      '<div class="cat-count">' + count + "</div>" +
      '<div class="cat-designer">' + esc(c.designer || "") + "</div>";
    return card;
  }

  /* ══ FAVORITES screen (no tab — opened from the Home module) ═════════ */
  function renderFavorites() {
    var s = $("#screen-favorites");
    s.innerHTML = "";

    var favs = loadFavs();
    var list = recipes().filter(function (r) { return favs.has(r.recipe_id); });

    var top = el("div", "shell-top");
    var back = el("button", "col-back", "‹ Home");
    back.type = "button";
    back.addEventListener("click", function () { setTab("home"); });
    top.appendChild(back);
    top.appendChild(el("h1", "shell-title", "Favorites"));
    top.appendChild(el("p", "shell-sub",
      (list.length || "No") + (list.length === 1 ? " saved recipe" : " saved recipes")));
    s.appendChild(top);

    if (!list.length) {
      s.appendChild(el("div", "empty",
        '<span class="empty-emoji">❤️</span>' +
        "No favorites yet.<br>Tap the heart on any recipe to save it here."));
      return;
    }
    var grid = el("div", "col-grid");
    list.forEach(function (r) { grid.appendChild(recipeCard(r, { fav: true })); });
    s.appendChild(grid);
  }

  /* ── Shared top bar ───────────────────────────────────────────────── */
  function topBar(eyebrow, title, sub) {
    var t = el("div", "shell-top");
    t.innerHTML =
      (eyebrow ? '<p class="shell-eyebrow">' + esc(eyebrow) + "</p>" : "") +
      (title ? '<h1 class="shell-title">' + esc(title) + "</h1>" : "") +
      (sub ? '<p class="shell-sub">' + esc(sub) + "</p>" : "");
    return t;
  }

  /* ── Tab switching ────────────────────────────────────────────────── */
  // Bar tabs are home/categories/recipes. Favorites is a screen with no tab —
  // it's reached from the Home favorites module and keeps Home lit in the bar.
  var SCREENS = ["home", "categories", "recipes", "favorites"];
  var BAR_TABS = ["home", "categories", "recipes"];
  function setTab(name) {
    if (SCREENS.indexOf(name) < 0) name = "home";

    if (name === "categories") catState.open = null;  // tab tap → category grid

    SCREENS.forEach(function (t) {
      var sc = $("#screen-" + t);
      if (sc) sc.classList.toggle("active", t === name);
    });
    var barActive = (name === "favorites") ? "home" : name;
    BAR_TABS.forEach(function (t) {
      $("#tab-" + t).classList.toggle("active", t === barActive);
    });

    if (name === "favorites") renderFavorites();   // refresh live each open
    if (name === "categories") renderCategories();
    if (name === "home") renderHome();             // keep fav count current
    history.replaceState(null, "", name === "home" ? location.pathname : "#" + name);
    window.scrollTo(0, 0);
  }

  /* ── Boot ─────────────────────────────────────────────────────────── */
  function init() {
    // Render the shared bottom bar in shell mode (buttons drive in-page setTab).
    if (window.MCNav) MCNav.render({ mode: "shell", active: (location.hash || "#home").slice(1) });
    renderHome();
    renderCategories();
    renderRecipes();
    renderFavorites();
    document.querySelectorAll(".tab").forEach(function (btn) {
      btn.addEventListener("click", function () { setTab(btn.getAttribute("data-tab")); });
    });
    setTab((location.hash || "#home").slice(1));
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }

  // Expose favorites API for collection.js / recipe page.
  window.MCFav = { load: loadFavs, toggle: toggleFav, has: function (id) { return loadFavs().has(id); } };
})();

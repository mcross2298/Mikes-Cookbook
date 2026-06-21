/* ==========================================================================
   cookbook-home.js  —  Phase 3 (tabbed shell)
   --------------------------------------------------------------------------
   Drives index.html as a 4WTO-style tabbed PWA shell:

     Home       — standalone landing (hero + quick stats + featured recipe)
     Recipes    — flagship COLLECTION cards (mirrors 4WTO's Programs page).
                  "Two Meals a Day" (live) opens collection.html?c=<id>;
                  "Kelli Cross' Recipes" and "Carnivore" are coming-soon.
     Favorites  — recipes the user ❤️'d (localStorage), reusing the recipe card.

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

  /* ── Shared: a recipe card (used by Favorites) ────────────────────── */
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
    [[recipes().length, "Recipes"], [collections().length, "Collections"], [loadFavs().size, "Favorites"]]
      .forEach(function (p) {
        var c = el("div", "home-stat");
        c.innerHTML = '<div class="home-stat-num">' + p[0] + "</div>" +
                      '<div class="home-stat-key">' + p[1] + "</div>";
        stats.appendChild(c);
      });
    s.appendChild(stats);

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

  /* ══ RECIPES screen — collections + app-wide search & filtering ══════ */
  // Default view = flagship collection cards (unchanged). Once a search query
  // or a dish-type filter is active, the screen switches to a flat grid of
  // matching recipe cards drawn from ALL recipes — not just one collection.
  //
  // Filter chips scope by dish-type category (Breakfast | Salads & Slaws |
  // Soups, Stews & Chilis | Casseroles & Bakes | Skillets & Stir-Fries |
  // Grilled & Sheet-Pan | Sandwiches). Each recipe declares exactly one
  // `dish_category`, so the chip bar stays short and the filter is unambiguous
  // — a recipe always has a single home (replaces the old diet + ~40 free-form
  // tag chips). The full descriptive tags still drive search and the detail
  // page.
  var CATEGORY_ORDER = [
    "Breakfast",
    "Salads & Slaws",
    "Soups, Stews & Chilis",
    "Casseroles & Bakes",
    "Skillets & Stir-Fries",
    "Grilled & Sheet-Pan",
    "Sandwiches"
  ];

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
  function facetList() {
    var cats = CATEGORY_ORDER.filter(function (c) {
      return recipes().some(function (r) { return r.dish_category === c; });
    });
    return ["All"].concat(cats);
  }
  function inFacet(r, f) {
    return f === "All" || r.dish_category === f;
  }

  function renderRecipes() {
    var s = $("#screen-recipes");
    s.innerHTML = "";
    s.appendChild(topBar(null, "Recipes",
      collections().length + " collections · " + recipes().length + " recipes"));

    var browse = { facet: "All" };

    // Search box
    var searchWrap = el("div", "search-wrap");
    var box = el("input", "search-box");
    box.type = "search";
    box.placeholder = "Search all recipes…";
    box.setAttribute("aria-label", "Search all recipes");
    searchWrap.appendChild(box);
    s.appendChild(searchWrap);

    // Facet chips (diet + tags), single-select, stacking with the search text.
    var chips = el("nav", "browse-chips");
    function renderChips() {
      chips.innerHTML = "";
      facetList().forEach(function (f) {
        var chip = el("button", "chip" + (browse.facet === f ? " active" : ""), esc(f));
        chip.type = "button";
        chip.addEventListener("click", function () { browse.facet = f; renderChips(); paint(); });
        chips.appendChild(chip);
      });
    }
    renderChips();
    s.appendChild(chips);

    var results = el("div", "browse-results");
    s.appendChild(results);

    function paint() {
      var q = box.value.trim();
      var filtering = q || browse.facet !== "All";
      results.innerHTML = "";

      if (!filtering) {                               // default: collection cards
        var wrap = el("div", "cards-wrap");
        wrap.appendChild(el("div", "tier-label", "★ Collections"));
        collections().forEach(function (c) { wrap.appendChild(collectionCard(c)); });
        results.appendChild(wrap);
        return;
      }

      var list = recipes().filter(function (r) {
        return inFacet(r, browse.facet) && recipesMatch(r, q);
      });
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

  /* ══ FAVORITES screen ═══════════════════════════════════════════════ */
  function renderFavorites() {
    var s = $("#screen-favorites");
    s.innerHTML = "";
    s.appendChild(topBar(null, "Favorites", "Your saved recipes"));

    var favs = loadFavs();
    var list = recipes().filter(function (r) { return favs.has(r.recipe_id); });

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
  var TABS = ["home", "recipes", "favorites"];
  function setTab(name) {
    if (TABS.indexOf(name) < 0) name = "home";
    TABS.forEach(function (t) {
      $("#screen-" + t).classList.toggle("active", t === name);
      $("#tab-" + t).classList.toggle("active", t === name);
    });
    if (name === "favorites") renderFavorites();   // refresh live each open
    if (name === "home") renderHome();             // keep fav count current
    history.replaceState(null, "", name === "home" ? location.pathname : "#" + name);
    window.scrollTo(0, 0);
  }

  /* ── Boot ─────────────────────────────────────────────────────────── */
  function init() {
    // Render the shared bottom bar in shell mode (buttons drive in-page setTab).
    if (window.MCNav) MCNav.render({ mode: "shell", active: (location.hash || "#home").slice(1) });
    renderHome();
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

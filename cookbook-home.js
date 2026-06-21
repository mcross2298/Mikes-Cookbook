/* ==========================================================================
   cookbook-home.js  —  Phase 3 (Home-hub shell)
   --------------------------------------------------------------------------
   Drives index.html as a hub-and-spoke PWA shell — no bottom tab bar. Home is
   the hub; you tap a module to drill into a spoke screen, and every spoke has
   a "‹ Home" anchor back:

     Home        — hub: "This Week" planner hero + tappable Categories /
                   Recipes / Favorites modules.
     This Week   — the weekly meal planner. Build a week of meals as a flat
                   list or an optional 7-day × Breakfast/Lunch/Dinner schedule,
                   then get one smart-merged grocery list and the week's
                   recipes — all in the module (localStorage).
     Categories  — the 7 dish-type categories as premium cards. Tapping a
                   category drills into a grid of that category's recipes.
     Recipes     — flagship COLLECTION cards + app-wide search.
     Favorites   — recipes the user ❤'d (localStorage).

   The two standalone deep pages (recipe.html / collection.html) get a single
   persistent Home button from cookbook-nav.js. Active screen is mirrored to
   location.hash (#recipes) so it survives reloads and deep links.
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
  // Retrigger a one-shot animation: drop the class, force reflow, re-add.
  var pop = function (node) {
    node.classList.remove("pop");
    void node.offsetWidth; // eslint-disable-line no-unused-expressions
    node.classList.add("pop");
  };
  var CHECK_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" ' +
    'stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
  function emptyState(emoji, html) {
    return el("div", "empty", '<span class="empty-emoji">' + emoji + "</span>" + html);
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

  function recipeById(id) {
    return recipes().filter(function (r) { return r.recipe_id === id; })[0] || null;
  }

  /* ══ WEEKLY MEAL PLANNER — data layer ═══════════════════════════════ */
  // The plan is a flat list of meal instances. Each instance is a chosen
  // recipe at a serving tier, optionally tagged with a day + meal-type slot.
  // The flat list is the default view; the day/slot tags drive the optional
  // Schedule view. The same meal set always feeds the grocery list + recipes,
  // so "structure" only changes how meals are organized, not what you buy.
  var PLAN_KEY  = "mc-cookbook:mealplan";          // { meals: [ {uid,id,serving,day,slot} ] }
  var GROC_KEY  = "mc-cookbook:mealplan:grocery";  // [ checked merge-keys ]
  var DAYS      = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  var DAY_LONG  = {
    Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday",
    Fri: "Friday", Sat: "Saturday", Sun: "Sunday"
  };
  var SLOTS     = ["Breakfast", "Lunch", "Dinner"];

  function loadPlan() {
    try {
      var p = JSON.parse(localStorage.getItem(PLAN_KEY) || "{}") || {};
      if (!Array.isArray(p.meals)) p.meals = [];
      return p;
    } catch (e) { return { meals: [] }; }
  }
  function savePlan(p) {
    try { localStorage.setItem(PLAN_KEY, JSON.stringify(p)); } catch (e) {}
  }
  function newUid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }
  function addMeal(id, opts) {
    opts = opts || {};
    var p = loadPlan();
    p.meals.push({
      uid: newUid(), id: id,
      serving: opts.serving || 2,
      day: opts.day || null,
      slot: opts.slot || null
    });
    savePlan(p);
  }
  function updateMeal(uid, patch) {
    var p = loadPlan();
    p.meals.forEach(function (m) { if (m.uid === uid) { for (var k in patch) m[k] = patch[k]; } });
    savePlan(p);
  }
  function removeMeal(uid) {
    var p = loadPlan();
    p.meals = p.meals.filter(function (m) { return m.uid !== uid; });
    savePlan(p);
  }
  function clearPlan() { savePlan({ meals: [] }); }
  function planMeals() { return loadPlan().meals; }
  function planRecipeIds() {                          // unique recipe ids, first-seen order
    var seen = {}, out = [];
    planMeals().forEach(function (m) { if (!seen[m.id]) { seen[m.id] = 1; out.push(m.id); } });
    return out;
  }

  /* ── Grocery check-off store ──────────────────────────────────────── */
  function loadGroc() {
    try { return new Set(JSON.parse(localStorage.getItem(GROC_KEY) || "[]")); }
    catch (e) { return new Set(); }
  }
  function saveGroc(set) {
    try { localStorage.setItem(GROC_KEY, JSON.stringify([].slice.call(set))); } catch (e) {}
  }

  /* ── Quantity math (parse → sum → pretty) for the merged grocery list ─ */
  // Parses integers, decimals, and simple/mixed fractions ("1", "0.75",
  // "1/2", "1 1/2"). Non-numeric amounts ("to taste") return null and are
  // listed as-is rather than summed.
  function parseQty(qty) {
    if (qty == null) return null;
    var s = String(qty).trim();
    var m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);                 // mixed: "1 1/2"
    if (m) return parseInt(m[1], 10) + parseInt(m[2], 10) / parseInt(m[3], 10);
    if ((m = s.match(/^(\d+)\/(\d+)$/))) return parseInt(m[1], 10) / parseInt(m[2], 10);
    if (/^-?\d*\.?\d+$/.test(s)) return parseFloat(s);
    return null;
  }
  function prettyQty(v) {
    var whole = Math.floor(v + 1e-9), frac = v - whole;
    var FRACTIONS = [[1 / 4, "1/4"], [1 / 3, "1/3"], [1 / 2, "1/2"], [2 / 3, "2/3"], [3 / 4, "3/4"]];
    var best = null, bestDiff = 0.06;
    for (var i = 0; i < FRACTIONS.length; i++) {
      var d = Math.abs(frac - FRACTIONS[i][0]);
      if (d < bestDiff) { best = FRACTIONS[i][1]; bestDiff = d; }
    }
    if (frac < 0.06) return String(whole);
    if (frac > 0.94) return String(whole + 1);
    if (best) return (whole > 0 ? whole + " " : "") + best;
    return String(Math.round(v * 100) / 100);
  }

  // Build the combined shopping list across every planned meal, smart-merging
  // identical item+unit lines and summing their numeric quantities. Returns
  // categories in aisle order, each holding rows keyed for check-off.
  var GROC_CAT_ORDER = ["Meat", "Dairy", "Produce", "Pantry"];
  function buildGrocery() {
    var merged = {}, order = [];
    planMeals().forEach(function (meal) {
      var r = recipeById(meal.id);
      if (!r) return;
      var list = (r.ingredients_by_serving && r.ingredients_by_serving["serving_" + meal.serving]) || [];
      list.forEach(function (ing) {
        var item = (ing.item || "").trim();
        if (!item) return;
        var unit = (ing.unit || "").trim();
        var cat  = ing.category || "Other";
        var key  = cat + "|" + item.toLowerCase() + "|" + unit.toLowerCase();
        var entry = merged[key];
        if (!entry) { entry = merged[key] = { key: key, item: item, unit: unit, category: cat, sum: 0, hasNum: false, texts: [] }; order.push(key); }
        var num = parseQty(ing.quantity);
        if (num != null) { entry.sum += num; entry.hasNum = true; }
        else if (ing.quantity != null && String(ing.quantity).trim()) { entry.texts.push(String(ing.quantity).trim()); }
      });
    });

    // Group into categories (aisle order first, then any extras seen).
    var groups = {};
    order.forEach(function (key) {
      var e = merged[key];
      (groups[e.category] = groups[e.category] || []).push(e);
    });
    var cats = GROC_CAT_ORDER.filter(function (c) { return groups[c]; })
      .concat(Object.keys(groups).filter(function (c) { return GROC_CAT_ORDER.indexOf(c) < 0; }));

    return cats.map(function (cat) {
      return {
        category: cat,
        rows: groups[cat].map(function (e) {
          var parts = [];
          if (e.hasNum && e.sum > 0) parts.push(prettyQty(e.sum) + (e.unit ? " " + e.unit : ""));
          if (e.texts.length) {
            var uniq = e.texts.filter(function (t, i) { return e.texts.indexOf(t) === i; });
            parts.push(uniq.join(", "));
          }
          return { key: e.key, item: e.item, qty: parts.join(" · ") };
        })
      };
    });
  }
  function groceryItemCount() {
    return buildGrocery().reduce(function (n, c) { return n + c.rows.length; }, 0);
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

    // A heart in the card's upper-right corner — favorite straight from the
    // grid. Filled when saved, outline when not; tapping flips it in place. On
    // the Favorites screen, un-saving also drops the card out of the list.
    var saved = loadFavs().has(r.recipe_id);
    var heart = el("button", "fav-toggle" + (saved ? " on" : ""), saved ? "❤" : "♡");
    heart.type = "button";
    heart.setAttribute("aria-label", saved ? "Remove from favorites" : "Add to favorites");
    heart.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      var on = toggleFav(r.recipe_id);
      if (opts.fav) { renderFavorites(); return; }   // drop out of the favorites grid
      heart.classList.toggle("on", on);
      heart.textContent = on ? "❤" : "♡";
      heart.setAttribute("aria-label", on ? "Remove from favorites" : "Add to favorites");
      pop(heart);
    });
    card.appendChild(heart);
    return card;
  }

  /* ══ HOME screen — the hub ══════════════════════════════════════════ */
  // Each module is a premium glass card (gradient + accent border + soft
  // glow), echoing the "Now Cooking" hero. A per-module accent (--hm) drives
  // the gradient, border, glow, and icon so the three read as a tactile set.
  function homeModule(opts) {
    var accent = opts.accent || "#C87A53";
    var b = el("button", "home-mod");
    b.type = "button";
    b.setAttribute("aria-label", opts.title);
    b.style.setProperty("--hm", accent);
    b.style.setProperty("--hm-rgb", rgbFromHex(accent));
    b.innerHTML =
      '<span class="home-mod-glow"></span>' +
      '<span class="home-mod-icon">' + esc(opts.icon) + "</span>" +
      '<span class="home-mod-text">' +
        '<span class="home-mod-title">' + esc(opts.title) + "</span>" +
        '<span class="home-mod-sub">' + esc(opts.sub) + "</span>" +
      "</span>" +
      '<span class="home-mod-arrow">→</span>';
    b.addEventListener("click", opts.onTap);
    return b;
  }

  function renderHome() {
    var s = $("#screen-home");
    s.innerHTML = "";

    s.appendChild(topBar("Mike's", "Cookbook",
      "Heirloom hand-me-downs & performance plates."));

    // Hero — the weekly meal planner entry (replaces the old "Now Cooking"
    // collection spotlight). Reflects the live plan and opens the planner spoke.
    var mealCount   = planMeals().length;
    var recipeCount = planRecipeIds().length;
    var planned     = mealCount > 0;

    var hero = el("div", "home-hero");
    var hc = el("div", "home-hero-card planner-hero");
    hc.innerHTML =
      '<p class="home-hero-eyebrow">This Week</p>' +
      '<h2 class="home-hero-title">' +
        (planned ? mealCount + (mealCount === 1 ? " meal planned" : " meals planned")
                 : "Plan your week") + "</h2>" +
      '<p class="home-hero-text">' +
        (planned
          ? esc(recipeCount + (recipeCount === 1 ? " recipe" : " recipes") +
                " · tap to see your combined grocery list and cook the week.")
          : "Pick meals for the week and get one smart grocery list — with every recipe in the module.") +
      "</p>";
    var cta = el("a", "home-cta", planned ? "Open planner →" : "Start planning →");
    cta.href = "#planner";
    cta.addEventListener("click", function (e) { e.preventDefault(); setTab("planner"); });
    hc.appendChild(cta);
    hero.appendChild(hc);
    s.appendChild(hero);

    // Browse modules — the spokes. Each drills into a full-screen card view.
    // Per-module accents keep the trio cohesive with the warm hero palette.
    var browse = el("div", "home-browse");
    browse.appendChild(el("div", "tier-label", "Browse"));

    browse.appendChild(homeModule({
      icon: "🍽️", title: "Categories", accent: "#C87A53",
      sub: presentCategories().length + " dish types",
      onTap: function () { setTab("categories"); }
    }));
    browse.appendChild(homeModule({
      icon: "📖", title: "Recipes", accent: "#D9A05B",
      sub: collections().length + " collections · " + recipes().length + " recipes",
      onTap: function () { setTab("recipes"); }
    }));
    var favCount = loadFavs().size;
    browse.appendChild(homeModule({
      icon: "❤", title: "Favorites", accent: "#FF5A6E",
      sub: favCount ? favCount + (favCount === 1 ? " saved recipe" : " saved recipes")
                    : "Tap the heart on any recipe to save it",
      onTap: function () { setTab("favorites"); }
    }));
    s.appendChild(browse);
  }

  /* ── Shared spoke top bar with a "‹ <label>" anchor ───────────────── */
  function backTopBar(backLabel, title, sub, onBack) {
    var t = el("div", "shell-top");
    var back = el("button", "col-back", backLabel);
    back.type = "button";
    back.addEventListener("click", onBack);
    t.appendChild(back);
    t.appendChild(el("h1", "shell-title", esc(title)));
    if (sub) t.appendChild(el("p", "shell-sub", esc(sub)));
    return t;
  }

  /* ══ CATEGORIES screen — the 7 dish types, then a per-category grid ══ */
  // Default view: one premium card per category (reuses the .cat-card look).
  // Tapping a card drills into that category's recipe grid.
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

    s.appendChild(backTopBar("‹ Home", "Categories", "Browse by dish type",
      function () { setTab("home"); }));
    var wrap = el("div", "cards-wrap");
    presentCategories().forEach(function (cat) { wrap.appendChild(categoryCard(cat)); });
    s.appendChild(wrap);
  }

  function renderCategoryDetail(s, cat) {
    var list = recipesInCategory(cat);
    s.appendChild(backTopBar("‹ Categories", cat,
      list.length + (list.length === 1 ? " recipe" : " recipes"),
      function () { catState.open = null; renderCategories(); window.scrollTo(0, 0); }));

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
  // recipes. Dish-type browsing lives on the Categories spoke.
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
    s.appendChild(backTopBar("‹ Home", "Recipes",
      collections().length + " collections · " + recipes().length + " recipes",
      function () { setTab("home"); }));

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

  /* ══ FAVORITES screen ═══════════════════════════════════════════════ */
  function renderFavorites() {
    var s = $("#screen-favorites");
    s.innerHTML = "";

    var favs = loadFavs();
    var list = recipes().filter(function (r) { return favs.has(r.recipe_id); });

    s.appendChild(backTopBar("‹ Home", "Favorites",
      (list.length || "No") + (list.length === 1 ? " saved recipe" : " saved recipes"),
      function () { setTab("home"); }));

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

  /* ══ THIS WEEK — the meal planner spoke ═════════════════════════════ */
  // Three sub-views (Plan / Grocery / Recipes). The Plan view itself toggles
  // between a flat List (default) and a 7-day × Breakfast/Lunch/Dinner
  // Schedule. The same meal set feeds all three views.
  var plannerState = { view: "plan", planView: "list" };
  function refresh() { renderPlanner(); }

  // Segmented control reusing the recipe page's .servings / .serving-opt look.
  function segControl(cls, items, active, onPick) {
    var wrap = el("div", "servings" + (cls ? " " + cls : ""));
    items.forEach(function (it) {
      var b = el("button", "serving-opt" + (it.value === active ? " active" : ""), esc(it.label));
      b.type = "button";
      b.addEventListener("click", function () { if (it.value !== active) onPick(it.value); });
      wrap.appendChild(b);
    });
    return wrap;
  }

  // Per-meal 2/4 serving toggle.
  function servingToggle(m) {
    var r = recipeById(m.id);
    var opts = (r && r.scaling_options) || [2, 4];
    var wrap = el("div", "plan-serv");
    opts.forEach(function (n) {
      var b = el("button", "plan-serv-opt" + (m.serving === n ? " active" : ""), String(n));
      b.type = "button";
      b.setAttribute("aria-label", n + " servings");
      b.addEventListener("click", function (e) {
        e.preventDefault(); e.stopPropagation();
        if (m.serving !== n) { updateMeal(m.uid, { serving: n }); refresh(); }
      });
      wrap.appendChild(b);
    });
    return wrap;
  }
  function removeBtn(m) {
    var b = el("button", "plan-remove", "✕");
    b.type = "button";
    b.setAttribute("aria-label", "Remove meal");
    b.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      removeMeal(m.uid); refresh();
    });
    return b;
  }

  // Full meal row (List view + Schedule "Unscheduled" tray): icon, title,
  // serving toggle, per-meal Day + Slot pickers, remove.
  function mealRow(m) {
    var r = recipeById(m.id);
    var row = el("div", "plan-meal");

    row.appendChild(el("span", "plan-meal-icon", esc(r ? (r.icon || "🍽️") : "🍽️")));

    var main = el("div", "plan-meal-main");
    var title = el("a", "plan-meal-title", esc(r ? r.title : m.id));
    if (r) title.href = "recipe.html?id=" + encodeURIComponent(r.recipe_id);
    main.appendChild(title);
    var meta = [];
    if (r && r.dish_category) meta.push(r.dish_category);
    var t = r ? (r.prep_time_mins || 0) + (r.cook_time_mins || 0) : 0;
    if (t) meta.push(t + " min");
    if (meta.length) main.appendChild(el("p", "plan-meal-meta", esc(meta.join(" · "))));
    row.appendChild(main);

    var ctrl = el("div", "plan-meal-controls");
    ctrl.appendChild(servingToggle(m));

    var pickers = el("div", "plan-pickers");
    var daySel = el("select", "plan-select");
    daySel.setAttribute("aria-label", "Day");
    daySel.innerHTML = '<option value="">Any day</option>' +
      DAYS.map(function (d) {
        return '<option value="' + d + '"' + (m.day === d ? " selected" : "") + ">" + DAY_LONG[d] + "</option>";
      }).join("");
    daySel.addEventListener("change", function () { updateMeal(m.uid, { day: daySel.value || null }); refresh(); });

    var slotSel = el("select", "plan-select");
    slotSel.setAttribute("aria-label", "Meal");
    slotSel.innerHTML = '<option value="">Any meal</option>' +
      SLOTS.map(function (sl) {
        return '<option value="' + sl + '"' + (m.slot === sl ? " selected" : "") + ">" + sl + "</option>";
      }).join("");
    slotSel.addEventListener("change", function () { updateMeal(m.uid, { slot: slotSel.value || null }); refresh(); });

    pickers.appendChild(daySel);
    pickers.appendChild(slotSel);
    ctrl.appendChild(pickers);
    ctrl.appendChild(removeBtn(m));
    row.appendChild(ctrl);
    return row;
  }

  // Compact chip for a meal placed in a Schedule slot.
  function scheduleChip(m) {
    var r = recipeById(m.id);
    var chip = el("div", "plan-chip");
    chip.appendChild(el("span", "plan-chip-icon", esc(r ? (r.icon || "🍽️") : "🍽️")));
    var t = el("a", "plan-chip-title", esc(r ? r.title : m.id));
    if (r) t.href = "recipe.html?id=" + encodeURIComponent(r.recipe_id);
    chip.appendChild(t);
    chip.appendChild(servingToggle(m));
    chip.appendChild(removeBtn(m));
    return chip;
  }

  function renderPlanList(body, meals) {
    var wrap = el("div", "plan-list");
    meals.forEach(function (m) { wrap.appendChild(mealRow(m)); });
    body.appendChild(wrap);
  }

  function renderPlanSchedule(body, meals) {
    var unsched = meals.filter(function (m) { return !m.day || !m.slot; });
    if (unsched.length) {
      var tray = el("div", "plan-tray");
      tray.appendChild(el("div", "plan-tray-label",
        "Unscheduled — set a Day &amp; Meal, or tap a slot below"));
      var list = el("div", "plan-list");
      unsched.forEach(function (m) { list.appendChild(mealRow(m)); });
      tray.appendChild(list);
      body.appendChild(tray);
    }

    DAYS.forEach(function (d) {
      var dayBlock = el("div", "plan-day");
      dayBlock.appendChild(el("div", "plan-day-head", esc(DAY_LONG[d])));
      SLOTS.forEach(function (slot) {
        var inSlot = meals.filter(function (m) { return m.day === d && m.slot === slot; });
        var slotEl = el("div", "plan-slot");
        slotEl.appendChild(el("div", "plan-slot-label", esc(slot)));
        var cell = el("div", "plan-slot-cell");
        inSlot.forEach(function (m) { cell.appendChild(scheduleChip(m)); });
        var addCell = el("button", "plan-slot-add", inSlot.length ? "＋" : "＋ Add");
        addCell.type = "button";
        addCell.setAttribute("aria-label", "Add to " + DAY_LONG[d] + " " + slot);
        addCell.addEventListener("click", function () { openPicker({ day: d, slot: slot }); });
        cell.appendChild(addCell);
        slotEl.appendChild(cell);
        dayBlock.appendChild(slotEl);
      });
      body.appendChild(dayBlock);
    });
  }

  function renderPlanPane(body) {
    body.appendChild(segControl("plan-modetoggle", [
      { value: "list", label: "List" },
      { value: "schedule", label: "Schedule" }
    ], plannerState.planView, function (v) { plannerState.planView = v; refresh(); }));

    var meals = planMeals();
    if (!meals.length) {
      body.appendChild(emptyState("🗓️",
        "No meals planned yet.<br>Tap <b>Add a meal</b> to start building your week."));
    } else if (plannerState.planView === "list") {
      renderPlanList(body, meals);
    } else {
      renderPlanSchedule(body, meals);
    }

    var add = el("button", "cook-start plan-add", "＋&nbsp;&nbsp;Add a meal");
    add.type = "button";
    add.addEventListener("click", function () { openPicker({}); });
    body.appendChild(add);

    if (meals.length) {
      var clear = el("button", "plan-clear", "Clear week");
      clear.type = "button";
      clear.addEventListener("click", function () {
        if (window.confirm("Clear all meals from this week?")) {
          clearPlan(); saveGroc(new Set()); refresh();
        }
      });
      body.appendChild(clear);
    }
  }

  function groceryRow(row, checked) {
    var isDone = checked.has(row.key);
    var el2 = el("div", "check-row grocery-row" + (isDone ? " done" : ""));
    el2.innerHTML =
      '<span class="check-box">' + CHECK_SVG + "</span>" +
      '<span class="grocery-qty">' + (row.qty ? esc(row.qty) : "") + "</span>" +
      '<span class="check-text">' + esc(row.item) + "</span>";
    el2.addEventListener("click", function () {
      var set = loadGroc();
      if (set.has(row.key)) { set.delete(row.key); el2.classList.remove("done"); }
      else { set.add(row.key); el2.classList.add("done"); }
      saveGroc(set);
    });
    return el2;
  }

  function renderGroceryPane(body) {
    var meals = planMeals();
    if (!meals.length) {
      body.appendChild(emptyState("🛒",
        "No meals planned yet.<br>Add meals and your combined grocery list builds itself."));
      return;
    }
    var cats = buildGrocery();
    var checked = loadGroc();
    var total = cats.reduce(function (n, c) { return n + c.rows.length; }, 0);

    var card = el("div", "card grocery-card");
    card.appendChild(el("p", "card-label",
      "Shopping list · " + total + (total === 1 ? " item" : " items") +
      " · " + meals.length + (meals.length === 1 ? " meal" : " meals")));

    cats.forEach(function (c) {
      var sec = el("div", "grocery-cat");
      sec.appendChild(el("div", "grocery-cat-head",
        '<span class="dot"></span>' + esc(c.category) +
        '<span class="grocery-cat-count">' + c.rows.length + "</span>"));
      c.rows.forEach(function (row) { sec.appendChild(groceryRow(row, checked)); });
      card.appendChild(sec);
    });
    body.appendChild(card);
    body.appendChild(el("p", "macro-foot",
      "Quantities combine identical items across your planned meals."));
  }

  function renderRecipesPane(body) {
    var ids = planRecipeIds();
    if (!ids.length) {
      body.appendChild(emptyState("📖",
        "No recipes yet.<br>Add meals to gather the week's recipes here."));
      return;
    }
    body.appendChild(el("div", "browse-count",
      ids.length + (ids.length === 1 ? " recipe" : " recipes") + " this week"));
    var grid = el("div", "col-grid");
    ids.forEach(function (id) { var r = recipeById(id); if (r) grid.appendChild(recipeCard(r)); });
    body.appendChild(grid);
  }

  function renderPlanner() {
    var s = $("#screen-planner");
    s.innerHTML = "";

    var meals = planMeals();
    var sub = meals.length
      ? meals.length + (meals.length === 1 ? " meal" : " meals") +
        " · " + planRecipeIds().length + (planRecipeIds().length === 1 ? " recipe" : " recipes")
      : "Plan a week of meals";
    s.appendChild(backTopBar("‹ Home", "This Week", sub, function () { setTab("home"); }));

    s.appendChild(segControl("planner-nav", [
      { value: "plan", label: "Plan" },
      { value: "grocery", label: "Grocery" },
      { value: "recipes", label: "Recipes" }
    ], plannerState.view, function (v) { plannerState.view = v; refresh(); }));

    var body = el("div", "planner-body");
    if (plannerState.view === "plan") renderPlanPane(body);
    else if (plannerState.view === "grocery") renderGroceryPane(body);
    else if (plannerState.view === "recipes") renderRecipesPane(body);
    s.appendChild(body);
  }

  /* ── Recipe picker overlay (full-screen; add to week / to a slot) ──── */
  function pickCard(r, ctx) {
    var card = el("button", "rc rc-pick");
    card.type = "button";
    card.style.setProperty("--rc-accent", r.accent || "#C87A53");
    card.style.setProperty("--rc-accent-rgb", rgbFromHex(r.accent || "#C87A53"));
    var totalTime = (r.prep_time_mins || 0) + (r.cook_time_mins || 0);
    var meta = [];
    if (r.dish_category) meta.push(esc(r.dish_category));
    if (totalTime) meta.push(totalTime + " min");
    card.innerHTML =
      '<div class="rc-band"><span class="rc-icon">' + esc(r.icon || "🍽️") + "</span></div>" +
      '<div class="rc-body">' +
        '<h3 class="rc-title">' + esc(r.title) + "</h3>" +
        '<p class="rc-meta">' + meta.join(" · ") + "</p>" +
        '<p class="rc-macro">＋ Add to week</p>' +
      "</div>";
    card.addEventListener("click", function () {
      addMeal(r.recipe_id, { day: ctx.day || null, slot: ctx.slot || null, serving: 2 });
      closePicker();
      refresh();
    });
    return card;
  }
  function closePicker() {
    var ov = document.querySelector(".picker");
    if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
    document.body.classList.remove("picking");
  }
  function openPicker(ctx) {
    ctx = ctx || {};
    closePicker();

    var ov = el("div", "picker");
    var top = el("div", "picker-top");
    top.appendChild(el("div", "picker-title",
      ctx.day ? esc("Add to " + DAY_LONG[ctx.day] + " · " + ctx.slot) : "Add a meal"));
    var done = el("button", "picker-close", "Done");
    done.type = "button";
    done.addEventListener("click", closePicker);
    top.appendChild(done);
    ov.appendChild(top);

    var sw = el("div", "picker-search");
    var box = el("input", "search-box");
    box.type = "search";
    box.placeholder = "Search recipes to add…";
    box.setAttribute("aria-label", "Search recipes to add");
    sw.appendChild(box);
    ov.appendChild(sw);

    var results = el("div", "picker-results");
    ov.appendChild(results);

    function paint() {
      var q = box.value.trim();
      results.innerHTML = "";
      var list = recipes().filter(function (r) { return recipesMatch(r, q); });
      if (!list.length) {
        results.appendChild(emptyState("🔍", "No recipes match your search."));
        return;
      }
      var grid = el("div", "col-grid");
      list.forEach(function (r) { grid.appendChild(pickCard(r, ctx)); });
      results.appendChild(grid);
    }
    box.addEventListener("input", paint);
    paint();

    document.body.appendChild(ov);
    document.body.classList.add("picking");
  }

  /* ── Shared top bar (brand / titles, no back) ─────────────────────── */
  function topBar(eyebrow, title, sub) {
    var t = el("div", "shell-top");
    t.innerHTML =
      (eyebrow ? '<p class="shell-eyebrow">' + esc(eyebrow) + "</p>" : "") +
      (title ? '<h1 class="shell-title">' + esc(title) + "</h1>" : "") +
      (sub ? '<p class="shell-sub">' + esc(sub) + "</p>" : "");
    return t;
  }

  /* ── Screen switching (hub-and-spoke; mirrored to location.hash) ──── */
  var SCREENS = ["home", "planner", "categories", "recipes", "favorites"];
  function setTab(name) {
    if (SCREENS.indexOf(name) < 0) name = "home";
    if (name === "categories") catState.open = null;  // re-entry → category grid
    if (name !== "planner") closePicker();             // never leave the picker open

    SCREENS.forEach(function (t) {
      var sc = $("#screen-" + t);
      if (sc) sc.classList.toggle("active", t === name);
    });

    if (name === "home") renderHome();
    if (name === "planner") renderPlanner();
    if (name === "categories") renderCategories();
    if (name === "recipes") renderRecipes();
    if (name === "favorites") renderFavorites();

    history.replaceState(null, "", name === "home" ? location.pathname : "#" + name);
    window.scrollTo(0, 0);
  }

  // The currently visible screen, read from the DOM so it stays correct even
  // after hash-less home navigation.
  function activeScreen() {
    for (var i = 0; i < SCREENS.length; i++) {
      var sc = $("#screen-" + SCREENS[i]);
      if (sc && sc.classList.contains("active")) return SCREENS[i];
    }
    return "home";
  }

  // Live favorites sync. The recipe view (and any other tab) writes the shared
  // store from a DIFFERENT document, so the `storage` event is our signal to
  // re-render without a manual refresh. Only the favorites-aware screens care;
  // a null key means localStorage was cleared, so refresh defensively.
  function wireFavSync() {
    window.addEventListener("storage", function (e) {
      if (e.key && e.key !== FAV_KEY) return;
      var screen = activeScreen();
      if (screen === "home") renderHome();
      else if (screen === "favorites") renderFavorites();
    });
  }

  /* ── Boot ─────────────────────────────────────────────────────────── */
  function init() {
    wireFavSync();
    setTab((location.hash || "#home").slice(1));
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }

  // Expose favorites API for collection.js / recipe page.
  window.MCFav = { load: loadFavs, toggle: toggleFav, has: function (id) { return loadFavs().has(id); } };
})();

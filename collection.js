/* ==========================================================================
   collection.js  —  Phase 3
   --------------------------------------------------------------------------
   Renders collection.html?c=<id>: the recipe list for one COLLECTION, with a
   live search box (Tier 2). For a coming-soon collection it shows a friendly
   placeholder instead of a list — so all three Recipes-tab cards are tappable.

   Reuses the .rc recipe card and the ❤️ favorite store (mc-cookbook:favorites)
   so favoriting here shows up in the Home favorites list. No framework, no build.
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
  // Retrigger a one-shot animation by removing the class, forcing reflow, re-adding.
  var pop = function (node) {
    node.classList.remove("pop");
    void node.offsetWidth;
    node.classList.add("pop");
  };
  function rgbFromHex(hex) {
    var h = (hex || "").replace("#", "");
    if (h.length !== 6) return "200,122,83";
    return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }).join(",");
  }
  // Authored accents range down to near-black; used as literal text/border color
  // on dark surfaces, so floor the lightness before it's ever set as a CSS var.
  function clampAccent(hex) {
    var h = (hex || "").replace("#", "");
    if (h.length !== 6) return hex || "#C87A53";
    var r = parseInt(h.substr(0, 2), 16) / 255;
    var g = parseInt(h.substr(2, 2), 16) / 255;
    var b = parseInt(h.substr(4, 2), 16) / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
    if (l >= 0.45) return "#" + h;
    var d = max - min;
    var s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    var hue = 0;
    if (d !== 0) {
      if (max === r) hue = ((g - b) / d) % 6;
      else if (max === g) hue = (b - r) / d + 2;
      else hue = (r - g) / d + 4;
      hue *= 60; if (hue < 0) hue += 360;
    }
    l = 0.45;
    var c = (1 - Math.abs(2 * l - 1)) * s;
    var x = c * (1 - Math.abs((hue / 60) % 2 - 1));
    var m = l - c / 2, rp, gp, bp;
    if (hue < 60) { rp = c; gp = x; bp = 0; }
    else if (hue < 120) { rp = x; gp = c; bp = 0; }
    else if (hue < 180) { rp = 0; gp = c; bp = x; }
    else if (hue < 240) { rp = 0; gp = x; bp = c; }
    else if (hue < 300) { rp = x; gp = 0; bp = c; }
    else { rp = c; gp = 0; bp = x; }
    function toHex(v) { var n = Math.round((v + m) * 255); return (n < 16 ? "0" : "") + n.toString(16); }
    return "#" + toHex(rp) + toHex(gp) + toHex(bp);
  }
  // Mirrors icon.svg's book + page-lines motif for recipe cards with no
  // authored icon, instead of falling back to a raw platform emoji.
  var DEFAULT_RECIPE_ICON =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<rect x="5" y="4" width="14" height="16" rx="2.4" fill="#F9F8F6"/>' +
      '<rect x="8" y="8" width="8" height="1.6" rx="0.8" fill="#2A2C2E" fill-opacity="0.55"/>' +
      '<rect x="8" y="11.4" width="8" height="1.6" rx="0.8" fill="#2A2C2E" fill-opacity="0.4"/>' +
      '<rect x="8" y="14.8" width="5" height="1.6" rx="0.8" fill="#2A2C2E" fill-opacity="0.3"/>' +
    "</svg>";
  function recipeIconHtml(icon) {
    return icon ? esc(icon) : DEFAULT_RECIPE_ICON;
  }

  /* ── Favorites store (same key as cookbook-home.js) ───────────────── */
  var FAV_KEY = "mc-cookbook:favorites";
  function loadFavs() {
    try { return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]")); }
    catch (e) { return new Set(); }
  }
  function toggleFav(id) {
    var set = loadFavs();
    if (set.has(id)) set.delete(id); else set.add(id);
    try { localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(set))); } catch (e) {}
    return set.has(id);
  }

  function collections() { return window.COLLECTIONS || []; }
  function recipes() { return window.RECIPES || []; }

  function pickCollection() {
    var id = new URLSearchParams(location.search).get("c");
    return collections().filter(function (c) { return c.id === id; })[0] || collections()[0] || null;
  }

  /* Search across title, tags and ingredient items. */
  function matches(r, q) {
    if (!q) return true;
    q = q.toLowerCase();
    if ((r.title || "").toLowerCase().indexOf(q) >= 0) return true;
    if ((r.tags || []).join(" ").toLowerCase().indexOf(q) >= 0) return true;
    var first = r.ingredients_by_serving &&
      r.ingredients_by_serving["serving_" + (r.native_serving || 2)];
    if (first && first.some(function (i) {
      return (i.item || "").toLowerCase().indexOf(q) >= 0;
    })) return true;
    return false;
  }

  // Compact bottom stat row for a recipe card — one authored serving's
  // Cal/Protein/Fat/Carbs, matching recipe.html's macro card exactly (no
  // division by serving count; see macrosFor() in cookbook.js).
  function macroStatsHtml(m) {
    var stats = [
      { cls: "cal", v: m.calories, label: "Cal" },
      { cls: "", v: m.protein_g, label: "Protein" },
      { cls: "", v: m.fat_g, label: "Fat" },
      { cls: "", v: m.carbs_g, label: "Carbs" }
    ].filter(function (s) { return s.v != null; });
    if (!stats.length) return "";
    return '<div class="rc-stats">' + stats.map(function (s) {
      return '<div class="rc-stat ' + s.cls + '">' +
        '<span class="rc-stat-num">' + Math.round(s.v) + "</span>" +
        '<span class="rc-stat-label">' + s.label + "</span></div>";
    }).join("") + "</div>";
  }

  function recipeCard(r, onChange) {
    var accent = clampAccent(r.accent || "#C87A53");
    var card = el("a", "rc");
    card.href = "recipe.html?id=" + encodeURIComponent(r.recipe_id);
    card.style.setProperty("--rc-accent", accent);
    card.style.setProperty("--rc-accent-rgb", rgbFromHex(accent));

    // macro_profiles are stored PER SINGLE SERVING and are identical across
    // every authored tier (see recipes-data.js / CLAUDE.md) — show them as-is,
    // the same way recipe.html's macro card does.
    var tier = (r.scaling_options && r.scaling_options[0]) || r.native_serving || 2;
    var m = (r.macro_profiles && r.macro_profiles["serving_" + tier]) ||
      (r.macro_profiles && r.macro_profiles["serving_" + (r.native_serving || 2)]) || {};

    card.innerHTML =
      '<div class="rc-band"><span class="rc-icon">' + recipeIconHtml(r.icon) + "</span></div>" +
      '<div class="rc-body">' +
        '<h3 class="rc-title">' + esc(r.title) + "</h3>" +
        macroStatsHtml(m) +
      "</div>";

    var on = loadFavs().has(r.recipe_id);
    var heart = el("button", "fav-toggle" + (on ? " on" : ""), on ? "❤" : "♡");
    heart.type = "button";
    heart.setAttribute("aria-label", "Toggle favorite");
    heart.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      var nowOn = toggleFav(r.recipe_id);
      heart.classList.toggle("on", nowOn);
      heart.textContent = nowOn ? "❤" : "♡";
      pop(heart);
    });
    card.appendChild(heart);

    // "Mike's pick" star — the curated, shipped list (window.MIKES_FAVORITES)
    // reads here too, so a visitor sees Mike's picks while browsing a collection.
    if ((window.MIKES_FAVORITES || []).indexOf(r.recipe_id) >= 0) {
      card.classList.add("mikes-pick");
      var mb = el("span", "mikes-badge", "★");
      mb.setAttribute("aria-label", "Mike's pick");
      mb.title = "Mike's pick";
      card.appendChild(mb);
    }

    // User-authored recipes get a delete control so the personal library is
    // manageable. Removal updates the shared store + the live list.
    if (r.user && window.MCUser) {
      var del = el("button", "rc-delete", "✕");
      del.type = "button";
      del.setAttribute("aria-label", "Delete this recipe");
      del.addEventListener("click", function (e) {
        e.preventDefault(); e.stopPropagation();
        if (window.confirm("Delete “" + r.title + "” from your recipes?")) {
          window.MCUser.remove(r.recipe_id);
          if (onChange) onChange();
        }
      });
      card.appendChild(del);
    }
    return card;
  }

  /* ── Desserts: "similar desserts" grouping ───────────────────────────
     Desserts collection only. Groups the current (subtab-filtered) list
     into clusters of 2-3 recipes that share several ingredients, so
     browsing 28+ sweets surfaces the ones worth comparing side by side
     instead of one long flat list. Reuses the same ingredient-identity
     keying cookbook-home.js's Smart Week overlap scoring uses (category +
     lowercased item name), just applied here as pure similarity instead
     of a planner bonus. Anything that doesn't cluster still shows, under
     a "More Desserts" divider — nothing is hidden. */
  var DESSERT_CLUSTER_MIN_SHARED = 3;
  function dessertIngredientEntries(r) {
    var by = r.ingredients_by_serving || {};
    var list = by[Object.keys(by)[0]] || [];
    var map = {};
    list.forEach(function (ing) {
      var item = (ing.item || "").trim();
      if (!item) return;
      var key = (ing.category || "Other") + "|" + item.toLowerCase();
      if (!map[key]) map[key] = item;
    });
    return map;
  }
  function sharedKeyCount(a, b) {
    var n = 0;
    Object.keys(a).forEach(function (k) { if (b[k]) n++; });
    return n;
  }
  // Names the cluster after ingredients common to every member; falls back
  // to the seed pair's overlap, then a generic label, so it never breaks.
  function dessertClusterLabel(members) {
    var maps = members.map(dessertIngredientEntries);
    var common = Object.keys(maps[0]).filter(function (k) {
      return maps.every(function (m) { return m[k]; });
    });
    if (!common.length && maps.length > 1) {
      common = Object.keys(maps[0]).filter(function (k) { return maps[1][k]; });
    }
    if (!common.length) return "🔗 Similar Desserts";
    return "🔗 Similar · " + common.slice(0, 2).map(function (k) { return maps[0][k]; }).join(", ");
  }
  // Greedy pairing: each unclustered recipe grabs up to 2 unclustered
  // recipes that share the most ingredients with it (min threshold above).
  // Whatever's left over is a "single" and renders in the flat list as usual.
  function buildDessertClusters(items) {
    var entries = {};
    items.forEach(function (r) { entries[r.recipe_id] = dessertIngredientEntries(r); });
    var remaining = items.slice();
    var clusters = [], singles = [];
    while (remaining.length) {
      var seed = remaining.shift();
      var ranked = remaining
        .map(function (r) { return { r: r, n: sharedKeyCount(entries[seed.recipe_id], entries[r.recipe_id]) }; })
        .filter(function (m) { return m.n >= DESSERT_CLUSTER_MIN_SHARED; })
        .sort(function (a, b) { return b.n - a.n; })
        .slice(0, 2);
      if (ranked.length) {
        ranked.forEach(function (m) { remaining.splice(remaining.indexOf(m.r), 1); });
        clusters.push([seed].concat(ranked.map(function (m) { return m.r; })));
      } else {
        singles.push(seed);
      }
    }
    return { clusters: clusters, singles: singles };
  }
  function renderDessertGroups(grid, items, onChange) {
    var built = buildDessertClusters(items);
    built.clusters.forEach(function (members) {
      grid.appendChild(el("p", "cluster-label", esc(dessertClusterLabel(members))));
      members.forEach(function (r) { grid.appendChild(recipeCard(r, onChange)); });
    });
    if (built.singles.length) {
      if (built.clusters.length) {
        grid.appendChild(el("p", "cluster-label cluster-label-more", "More Desserts"));
      }
      built.singles.forEach(function (r) { grid.appendChild(recipeCard(r, onChange)); });
    }
  }

  /* ── Render ───────────────────────────────────────────────────────── */
  function init() {
    var c = pickCollection();
    var top = $("#top"), grid = $("#grid"), searchWrap = $("#searchWrap");

    if (!c) {
      top.innerHTML = '<a class="col-back" href="index.html#recipes">‹ Recipes</a>' +
        '<h1 class="col-title">Collection not found</h1>';
      return;
    }

    // Global override is intentional here, same reasoning as cookbook.js:
    // collection.html themes exactly one collection per page load, unlike
    // cookbook-home.js's multi-card grids which need per-card scoped vars.
    var pageAccent = clampAccent(c.accent);
    document.documentElement.style.setProperty("--accent", pageAccent);
    document.documentElement.style.setProperty("--accent-rgb", rgbFromHex(pageAccent));
    document.title = c.title + " · Mike's Cookbook";

    // Recompute on demand so deletes (user recipes) reflect immediately.
    function currentList() {
      return (c.status === "live" && c.source_match)
        ? recipes().filter(function (r) { return r.source === c.source_match; })
        : [];
    }
    var list = currentList();

    function paintHead() {
      var n = currentList().length;
      top.innerHTML =
        '<a class="col-back" href="index.html#recipes">‹ Recipes</a>' +
        '<h1 class="col-title">' + esc(c.title) + "</h1>" +
        '<p class="col-sub">' + esc(c.tag.replace(/^★\s*/, "")) +
          (n ? " · " + n + " recipes" : "") + "</p>";
    }
    paintHead();

    // Coming-soon collections: friendly placeholder, no list / search.
    if (c.status !== "live") {
      searchWrap.innerHTML = "";
      grid.className = "";
      grid.innerHTML = "";
      grid.appendChild(el("div", "empty",
        '<span class="empty-emoji">' + esc(c.icon || "🍽️") + "</span>" +
        "<strong>" + esc(c.title) + "</strong> is coming soon.<br>" +
        esc(c.blurb)));
      return;
    }

    // Live: search box + grid.
    var box = el("input", "search-box");
    box.type = "search";
    box.placeholder = "Search " + c.title + "…";
    box.setAttribute("aria-label", "Search recipes");
    searchWrap.appendChild(box);

    // Sub-tabs (optional): a collection can define c.subsections to split its
    // list into an "All" tab plus one tab per subsection key. A recipe with no
    // matching subsection only shows under "All". No-op for collections that
    // don't define subsections — everything renders exactly as before.
    var activeSub = "";
    var subtabButtons = [];
    if (c.subsections && c.subsections.length) {
      var subtabsBar = el("div", "subtabs");
      [{ key: "", label: "All" }].concat(c.subsections).forEach(function (t) {
        var btn = el("button", "subtab" + (t.key === activeSub ? " active" : ""), esc(t.label));
        btn.type = "button";
        btn.addEventListener("click", function () {
          if (activeSub === t.key) return;
          activeSub = t.key;
          subtabButtons.forEach(function (b) { b.el.classList.toggle("active", b.key === activeSub); });
          paint();
        });
        subtabButtons.push({ key: t.key, el: btn });
        subtabsBar.appendChild(btn);
      });
      searchWrap.parentNode.insertBefore(subtabsBar, searchWrap.nextSibling);
      // .col-top is also sticky at top:0; offset the tab bar by its rendered
      // height so the two stack instead of overlapping when both are stuck.
      var positionSubtabs = function () { subtabsBar.style.top = top.offsetHeight + "px"; };
      positionSubtabs();
      window.addEventListener("resize", positionSubtabs);
    }

    function paint() {
      var q = box.value.trim();
      grid.innerHTML = "";
      list = currentList();
      if (activeSub) list = list.filter(function (r) { return r.subsection === activeSub; });
      paintHead();

      // A live collection with nothing in it yet (e.g. "My Recipes" before you
      // add anything): show a friendly invitation rather than a "no match".
      if (!list.length && !q) {
        var empty = el("div", "empty",
          '<span class="empty-emoji">' + esc(c.icon || "🍽️") + "</span>" +
          "No recipes here yet.<br>" +
          (c.source_match === (window.MCUser && window.MCUser.SOURCE)
            ? "Tap <b>Add Recipe</b> on the Home screen to start your library."
            : esc(c.blurb)));
        if (c.source_match === (window.MCUser && window.MCUser.SOURCE)) {
          var add = el("a", "cook-start", "＋ Add a recipe");
          add.href = "index.html#home";
          empty.appendChild(add);
        }
        grid.appendChild(empty);
        return;
      }

      var shown = list.filter(function (r) { return matches(r, q); });
      if (!shown.length) {
        grid.appendChild(el("div", "empty",
          '<span class="empty-emoji">🔍</span>No recipes match “' + esc(q) + "”."));
        return;
      }
      if (c.id === "desserts" && !q) {
        renderDessertGroups(grid, shown, paint);
      } else {
        shown.forEach(function (r) { grid.appendChild(recipeCard(r, paint)); });
      }
    }
    box.addEventListener("input", paint);
    paint();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();

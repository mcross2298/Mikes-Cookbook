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

  function recipeCard(r) {
    var accent = r.accent || "#C87A53";
    var card = el("a", "rc");
    card.href = "recipe.html?id=" + encodeURIComponent(r.recipe_id);
    card.style.setProperty("--rc-accent", accent);
    card.style.setProperty("--rc-accent-rgb", rgbFromHex(accent));

    var tier = (r.scaling_options && r.scaling_options[0]) || 2;
    var m = (r.macro_profiles && r.macro_profiles["serving_" + tier]) || {};
    var totalTime = (r.prep_time_mins || 0) + (r.cook_time_mins || 0);

    var meta = [];
    if (r.dish_category) meta.push(esc(r.dish_category));
    if (totalTime) meta.push(totalTime + " min");
    var macro = [];
    if (m.calories != null) macro.push(m.calories + " cal");
    if (m.protein_g != null) macro.push(m.protein_g + "g protein");

    card.innerHTML =
      '<div class="rc-band"><span class="rc-icon">' + esc(r.icon || "🍽️") + "</span></div>" +
      '<div class="rc-body">' +
        '<h3 class="rc-title">' + esc(r.title) + "</h3>" +
        '<p class="rc-meta">' + meta.join(" · ") + "</p>" +
        (macro.length ? '<p class="rc-macro">' + macro.join(" · ") + "</p>" : "") +
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
    return card;
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

    document.documentElement.style.setProperty("--accent", c.accent);
    document.documentElement.style.setProperty("--accent-rgb", rgbFromHex(c.accent));
    document.title = c.title + " · Mike's Cookbook";

    var list = (c.status === "live" && c.source_match)
      ? recipes().filter(function (r) { return r.source === c.source_match; })
      : [];

    top.innerHTML =
      '<a class="col-back" href="index.html#recipes">‹ Recipes</a>' +
      '<h1 class="col-title">' + esc(c.title) + "</h1>" +
      '<p class="col-sub">' + esc(c.tag.replace(/^★\s*/, "")) +
        (list.length ? " · " + list.length + " recipes" : "") + "</p>";

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

    function paint() {
      var q = box.value.trim();
      grid.innerHTML = "";
      var shown = list.filter(function (r) { return matches(r, q); });
      if (!shown.length) {
        grid.appendChild(el("div", "empty",
          '<span class="empty-emoji">🔍</span>No recipes match “' + esc(q) + "”."));
        return;
      }
      shown.forEach(function (r) { grid.appendChild(recipeCard(r)); });
    }
    box.addEventListener("input", paint);
    paint();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();

/* ==========================================================================
   cookbook-nav.js  —  Phase 2 (Pillar 1: persistent navigation)
   --------------------------------------------------------------------------
   One source of truth for the bottom tab bar (Home · Categories · Recipes),
   shared across the whole hybrid app:

     index.html       SPA shell — buttons that drive in-page setTab() (no reload)
     recipe.html      standalone page — links back to index.html#<tab>
     collection.html  standalone page — links back to index.html#<tab>

   A page opts in with `data-tabbar` on <main class="app">:
     data-tabbar="shell"     → the shell renders & wires its own (see cookbook-home.js)
     data-tabbar="recipes"   → render a link-mode bar with "Recipes" active
     data-tabbar="home" | "categories" → same, different active tab

   Standalone pages auto-render on load. The shell calls MCNav.render() itself
   so button wiring stays in cookbook-home.js. No framework, no build step.
   ========================================================================== */
(function () {
  "use strict";

  // The canonical tabs, in display order. Markup mirrors the original
  // index.html bar so the existing .tab-bar / .tab / .tab-icon CSS applies.
  var TABS = [
    { id: "home",       icon: "🏠", label: "Home" },
    { id: "categories", icon: "🍽️", label: "Categories" },
    { id: "recipes",    icon: "📖", label: "Recipes" }
  ];

  function build(active, mode) {
    var nav = document.createElement("nav");
    nav.className = "tab-bar";
    nav.setAttribute("role", "tablist");
    nav.setAttribute("aria-label", "Primary");

    TABS.forEach(function (t) {
      var on = t.id === active;
      var node;
      if (mode === "shell") {
        // In the shell, tabs are buttons wired to in-page screen swaps.
        node = document.createElement("button");
        node.type = "button";
        node.id = "tab-" + t.id;
        node.setAttribute("data-tab", t.id);
      } else {
        // On standalone pages, tabs navigate back to the shell at the hash.
        node = document.createElement("a");
        node.href = "index.html#" + t.id;
      }
      node.className = "tab" + (on ? " active" : "");
      node.setAttribute("role", "tab");
      if (on) node.setAttribute("aria-current", "page");
      node.innerHTML =
        '<span class="tab-icon">' + t.icon + "</span>" + t.label;
      nav.appendChild(node);
    });
    return nav;
  }

  // Render (or re-render) the bar into <main.app>, replacing any existing bar.
  function render(opts) {
    opts = opts || {};
    var mount = document.querySelector("main.app");
    if (!mount) return null;
    var prev = mount.querySelector(".tab-bar");
    if (prev) prev.parentNode.removeChild(prev);
    var bar = build(opts.active || "home", opts.mode || "link");
    mount.appendChild(bar);
    return bar;
  }

  // Standalone pages opt in via data-tabbar; the shell ("shell") wires itself.
  function autoInit() {
    var mount = document.querySelector("main.app[data-tabbar]");
    if (!mount) return;
    var active = mount.getAttribute("data-tabbar");
    if (active === "shell") return; // cookbook-home.js owns the shell bar
    render({ active: active, mode: "link" });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit);
  } else {
    autoInit();
  }

  window.MCNav = { render: render, TABS: TABS };
})();

# Mike's Cookbook — Continuous Improvement Roadmap

> **Audience:** solo dev (you). Every item is a ticket: problem → approach → acceptance criteria → effort.
> **Constraints:** vanilla HTML/CSS/JS, no framework, no build step. PWA additions allowed.
> **Sequencing:** quick wins first. Items already shipped are marked ✅ so we don't re-litigate.
> **Process:** one phase per PR. This document is **Phase 1**. Each pillar's tickets become later phases.

---

## 0. Architecture Reality Check

This is the ground truth the roadmap is built on (read the code, not the marketing):

- **Hybrid SPA + MPA.** `index.html` is a single-page **shell** with three swappable screens
  (`#screen-home`, `#screen-recipes`, `#screen-favorites`) and it owns the fixed
  `<nav class="tab-bar">`. But `recipe.html` and `collection.html` are **standalone pages**
  with their own `<main>` and **no tab bar** — only a back link.
- **No native runtime.** There is no React Native nav stack, no router. "Screens" are
  `display:none` toggles driven by `cookbook-home.js#setTab()`, mirrored to `location.hash`.
- **Already shipped & solid:**
  - ✅ **PWA / offline** — `manifest.json` (standalone, portrait), `sw.js` (network-first HTML
    with a 3s kitchen-WiFi timeout, cache-first assets), registered on all three pages,
    precache list + cache version auto-generated in CI by `tools/build-sw.py`.
  - ✅ **Favorites** — shared `localStorage` key `mc-cookbook:favorites`, hearts on
    home/collection/recipe, exposed as `window.MCFav`.
  - ✅ **41 recipes**, a Collections model (`live` / `coming-soon`), in-collection live search
    (`collection.js#matches()` across title, tags, ingredients).
  - ✅ **CI** — GitHub Pages deploy, `node --check` JS syntax gate, SW regen on deploy.
  - ✅ **Design tokens** — full palette/type/radii system in `cookbook.css :root`,
    `prefers-reduced-motion` already honored, `env(safe-area-inset-bottom)` respected.

**Implication:** the headline bug ("tab bar doesn't show on every screen") is **not** a layout
constraint or state bug — it's that the persistent nav lives only inside the `index.html` shell
and was never ported to the two standalone pages. That reframes Pillar 1 from "fix a bug" to
"establish one shared nav contract across the hybrid."

---

## Pillar 1 — Persistent Bottom Navigation (the foundation)

### Problem
The bottom tab bar (Home / Recipes / Favorites) renders on the `index.html` shell but
**vanishes** the moment a user opens a collection (`collection.html`) or a recipe
(`recipe.html`). Navigation orientation is lost; the only way back is a single "‹" link.

### Root causes (this codebase, ranked)
1. **No shared nav component.** The tab bar markup is hard-coded *inside* `index.html`.
   The standalone pages were authored without it. There is one source of truth and it
   isn't shared. *(primary)*
2. **Hybrid SPA/MPA seam.** `index.html` switches screens in-place; the other two are real
   page loads. A persistent bar therefore must survive a full navigation, not just a tab toggle.
3. **Active-state coupling.** `setTab()` derives active state from in-page screen IDs, which
   don't exist on the standalone pages — so even a copy-pasted bar wouldn't light up correctly.

### Recommended fix — one shared nav contract
Extract the bar into a tiny shared module rather than copy-pasting markup.

- **New file `cookbook-nav.js`** exporting `renderTabBar(active)` that builds the exact
  existing `.tab-bar` markup and appends it to `document.querySelector('main.app')`.
- **Active state by context, not screen ID:**
  - on `index.html`, the current `#hash` (existing behavior) drives active;
  - on `recipe.html` / `collection.html`, pass `active: 'recipes'` (both live under the
    Recipes branch).
- **Tabs deep-link across pages:** on a standalone page, a tab is an `<a>` to
  `index.html#home | #recipes | #favorites`. On the shell, tabs keep calling `setTab()`
  (no full reload). One render function, two wiring modes.
- **Reuse, don't restyle.** `.tab-bar` / `.tab` / `.tab-icon` CSS already exists and is
  safe-area aware; the standalone pages only need the `.app` → `.app.shell` bottom-padding
  rule applied so content clears the fixed bar.

### Standard exceptions (where the bar *should* hide)
- **Cooking Mode** (Pillar 2): full-screen, distraction-free stepping → bar hidden, replaced
  by large prev/next affordances. The one sanctioned exception.
- **Modals / full-screen image viewers** (if added): bar stays but is visually behind the scrim.
- Everywhere else: **bar is always present.**

### Implementation checklist (→ becomes the Phase 2 PR)
- [ ] Create `cookbook-nav.js` with `renderTabBar(active)`; move markup out of `index.html`.
- [ ] Call it from `index.html` (active via hash), `recipe.html`, `collection.html` (active `recipes`).
- [ ] Standalone pages: add `class="app shell"` (or a `.has-tabbar` padding rule) so content
      clears the 64px `--tab-h` bar + safe area.
- [ ] Standalone tabs are `<a href="index.html#...">`; shell tabs keep `setTab()`.
- [ ] Add `cookbook-nav.js` to the `sw.js` precache (run `tools/build-sw.py`).
- [ ] Accessibility: `role="tablist"`, `aria-current="page"` on active tab.
- [ ] **Acceptance:** bar visible & correctly highlighted on all of `index/recipe/collection`;
      tapping a tab from a recipe lands on the right shell screen; no content hidden behind the
      bar on any screen or device with a home-indicator; `node --check` passes; SW check passes.

**Effort:** Low–Med · **Impact:** High (it's the spine everything else hangs on).

---

## Pillar 2 — Core Cooking UX (3 high-impact, friction-down)

The flow is Discovery → Selection → Prep → **Cook**. The cook step is where hands are messy,
the screen sleeps, and text is too small at arm's length. These three target exactly that.

### 2.1 — Screen Wake Lock (top quick win) ⚡
- **Problem:** the phone/iPad sleeps mid-cook; user taps with greasy hands to wake it.
- **Approach:** `navigator.wakeLock.request('screen')` engaged when the **Recipe (Method)**
  sub-tab is active in `cookbook.js`; release on tab change / `visibilitychange`; re-acquire on
  return. Feature-detect and no-op silently where unsupported.
- **Acceptance:** screen stays awake on the Method tab; lock released when leaving it; no errors
  on unsupported browsers; a subtle "stay-awake" indicator shows it's active.
- **Effort:** Low · **Impact:** High.

### 2.2 — Cooking Mode (full-screen stepper)
- **Problem:** the checklist view is dense; while actively cooking you want **one step, huge.**
- **Approach:** a "Start Cooking" button on the Method tab enters a full-screen mode showing the
  current step large; advance via the **existing swipe handler** in `cookbook.js#wireTabs()`
  (generalize it) or big prev/next buttons. **Hides the Pillar 1 tab bar** (the sanctioned
  exception). Includes a **font-scale control** (A−/A+) writing a `--cook-font` CSS var to
  `localStorage`. Pairs with 2.1 (wake lock on by default in this mode).
- **Acceptance:** enter/exit cleanly; step state stays in sync with the checklist; font scale
  persists; reduced-motion respected; bar correctly hidden in-mode and restored on exit.
- **Effort:** Med · **Impact:** High.

### 2.3 — Inline step timers + auto-advance focus
- **Problem:** steps say "simmer 20 min" but the user reaches for a separate timer app.
- **Approach:** lightweight parse of durations in `instruction.detail` ("20 min", "1 hour") →
  render a tappable timer chip that counts down (with a completion ping / vibration via
  `navigator.vibrate`). Auto-scroll the active step into view as the user checks steps off.
- **Acceptance:** durations detected without mangling text; timer runs and notifies; works
  offline; no false positives on quantities like "20g".
- **Effort:** Med · **Impact:** Med–High.

---

## Pillar 3 — Next-Gen Features (3, practical kitchen utility)

No generic AI chat. Each leans on a real device/web capability and the cook's actual context.

### 3.1 — Arbitrary serving scaling (unlock latent code)
- **Problem:** recipes only offer authored 2/4 tiers; a cook wants 3, 6, 8.
- **Approach:** `scaleQuantity()` **already exists and is tested-by-shape** in `cookbook.js`
  but is unused. Wire a "custom servings" stepper that scales from a recipe's native tier using
  it, regenerating ingredients + grocery list on the fly. Macros stay per-serving (existing note).
- **Acceptance:** any serving count yields tidy fractions ("1 1/2"); "to taste" passes through;
  grocery + mise lists update; check-off state keyed correctly per chosen count.
- **Effort:** Low–Med · **Impact:** High (big utility, code already written).

### 3.2 — Offline level-up (build on shipped PWA)
- **Problem:** offline works, but there's no "new version available" signal and updates can feel
  stale; kitchen WiFi flaps mid-session.
- **Approach:** add an **update toast** — when `sw.js` detects a new `CACHE_NAME`, post a message
  to clients; show a "Tap to refresh" banner. Optionally precache **favorited recipes' assets**
  eagerly so a user's go-to recipes are guaranteed offline. (Offline core is ✅; this is polish.)
- **Acceptance:** toast appears on new deploy, dismissable, refreshes to new SW; no double-reload
  loops; favorites reliably open with no network.
- **Effort:** Med · **Impact:** Med.

### 3.3 — App-wide search & multi-tag organization
- **Problem:** search today is **scoped to one collection** (`collection.js`). There's no global
  search and no cross-cutting filtering by diet/tag across the 41 recipes.
- **Approach:** a global search entry on the Recipes screen reusing `matches()`; add a tag/diet
  filter rail (Primal / Carnivore / Heritage + free tags) that combines with search. Pure client
  filter over `window.RECIPES` — no backend.
- **Acceptance:** global query searches all recipes by title/tag/ingredient; tag filters stack
  with search; empty states handled; deep-links to a recipe from results.
- **Effort:** Med · **Impact:** High (discovery scales with the catalog).

---

## Pillar 4 — Premium Visuals & Aesthetic Polish

The bones are good (cohesive tokens, serif display, cream-on-slate). Polish is about **motion,
hierarchy, and tactile feedback** — making it *feel* engineered.

### Visual hierarchy
- Tighten the type scale around the existing `--serif` display: one clear hero size, one card
  title size, one meta size. Increase contrast between `--ink` and `--ink-dim` on dense lists.
- Give the active serving pill and active tab a stronger, single accent treatment (avoid
  competing accents on one screen — one focal accent per view).

### Micro-interactions (tactile, sub-200ms)
- **Favorite heart:** a small scale-pop + brief radial burst on toggle (respect reduced-motion).
- **Check-off:** the existing checkbox should animate the stroke draw (the `CHECK_SVG` path is
  already there — animate `stroke-dashoffset`), plus a subtle row settle.
- **Tab / serving change:** crossfade or slide the pane (generalize from the swipe handler), not
  an instant swap.
- **Press feedback:** cards get a 0.98 scale-down on `:active` for a physical feel.

### Motion system
- Add **motion tokens** to `:root`: `--ease-out: cubic-bezier(.2,.8,.2,1)`,
  `--dur-fast: 120ms`, `--dur: 200ms`. Use them everywhere instead of ad-hoc values.
- Everything wrapped by the **existing** `@media (prefers-reduced-motion: reduce)` block.

### Acceptance
- No animation exceeds ~250ms; all motion disabled under reduced-motion; one focal accent per
  screen; 60fps on a mid-range phone (transform/opacity only, no layout thrash).

**Effort:** Low–Med (incremental) · **Impact:** Med–High (this is the "elite feel").

---

## Prioritization Matrix (Impact × Effort)

```
            LOW EFFORT                         HIGH EFFORT
        ┌───────────────────────────┬───────────────────────────┐
  HIGH  │  ★ DO FIRST (quick wins)  │  PLAN (big bets)          │
 IMPACT │  • 2.1 Wake Lock          │  • 2.2 Cooking Mode       │
        │  • 1   Persistent nav     │  • 3.3 App-wide search    │
        │  • 3.1 Serving scaling    │                           │
        ├───────────────────────────┼───────────────────────────┤
  MED   │  FILL-IN                  │  LATER / EVALUATE         │
 IMPACT │  • 4   Polish (incl.)     │  • 2.3 Inline timers      │
        │                           │  • 3.2 Offline level-up   │
        └───────────────────────────┴───────────────────────────┘
```

### Sequenced phases (one PR each)
| Phase | Ticket | Why this order | Effort | Impact |
|------:|--------|----------------|:------:|:------:|
| **1** | This roadmap | Align before building | — | — |
| **2** | **Pillar 1** persistent nav | Foundation; Cooking Mode depends on owning the bar | Low–Med | High |
| **3** | **2.1** Wake Lock | Highest impact-per-line; standalone | Low | High |
| **4** | **3.1** Serving scaling | Code already exists; fast big win | Low–Med | High |
| **5** | **4** Polish pass | Cheap, compounds the above visually | Low–Med | Med–High |
| **6** | **2.2** Cooking Mode | Needs Phase 2 (bar ownership) + Phase 3 (wake lock) | Med | High |
| **7** | **3.3** App-wide search | Scales discovery as catalog grows | Med | High |
| **8** | **2.3** Inline timers | Nice-to-have; self-contained | Med | Med–High |
| **9** | **3.2** Offline level-up | Core offline already ✅; pure refinement | Med | Med |

**Already done (no work):** PWA install, offline service worker + CI regen, favorites store,
collections, in-collection search, design-token system, reduced-motion support.

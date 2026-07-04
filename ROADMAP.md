# Mike's Cookbook — Continuous Improvement Roadmap (v2)

> **Audience:** solo dev (you). Every item is a ticket: problem → approach → acceptance criteria → effort.
> **Constraints:** vanilla HTML/CSS/JS, no framework, no build step. PWA additions allowed.
> **Sequencing:** quick wins first. Items already shipped are marked ✅ so we don't re-litigate.
> **Supersedes v1.** Everything v1 called Pillars 1–4 (persistent nav, wake lock, Cooking Mode,
> arbitrary serving scaling, app-wide search, visual polish) is **done** — see §0. This version
> replaces those with the next set of tickets, chosen from a July 2026 codebase evaluation.
> **Process rule going forward:** the last step of any phase that ships user-visible or
> architectural change is a short pass over this file and `CLAUDE.md` to keep them truthful.
> Doc drift is what made v1 stale (see §0) — don't repeat it.

---

## 0. Architecture Reality Check (refreshed)

Ground truth as of this evaluation — read the code, not the last roadmap:

- **160 recipes** across **11 dish categories** (Breakfast, Salads & Slaws, Soups/Stews/Chilis,
  Casseroles & Bakes, Skillets & Stir-Fries, Grilled & Sheet-Pan, Sandwiches, Desserts, Salsas &
  Dips, Sauces, Marinades) — up from the 41 recipes / 7 categories the previous docs described.
- **7 shell screens**, not 5: Home, Planner, Categories, Recipes, Favorites, **Mike's Favorites**,
  and a full **macro Tracker** (`tracker.js` + 5 supporting modules — food search via Open Food
  Facts, barcode scan, goal calculator, recipe-to-log bridge).
- **`user-recipes.js`** ("My Recipes") lets Mike add his own recipes from the Home hub; they're
  stored in `localStorage` and merged into the same data layer everything else reads, so they
  behave like built-in recipes everywhere (search, planner, favorites, categories).
- **v1's Pillars 1–3 are shipped:** persistent nav (`cookbook-nav.js`), screen wake lock +
  full-screen Cooking Mode (`cookbook.js`), arbitrary 1–12 serving scaling (`scaleQuantity`, now
  wired in, not dead code), app-wide search. The meal planner has grown well past what v1
  described: **Smart Week** (scope-driven 7-day generator), a **Macro Smart Generator** (opt-in
  macro-targeted variant), **batch-prep day suggestion**, meal-completion → **cook log**, and
  **macro history** feeding back into generation.
- **Zero automated verification.** CI (`.github/workflows/pages.yml`) is a `node --check` syntax
  gate + service-worker regen + deploy — nothing validates the 12.4k-line `recipes-data.js`
  (unique `recipe_id`, valid `dish_category`/ingredient-`category` enums, `source_match`
  resolvability, `serving_2`/`serving_4` macro equality) and there is no UI smoke test. This
  wasn't picked as this round's priority but is flagged here as a known gap — see §Backlog.

**Implication:** the app is materially ahead of what its own docs described. The risk this round
isn't a missing feature, it's that **the planner's smart features are all pull-based** — Mike has
to open the app and tap a button for any of them to do something. Pillars B and C below target
that directly, per the alignment discussion for this roadmap.

---

## Pillar A — Data & Doc Integrity (backlog, not started this round)

Kept here as a named ticket rather than dropped, since it underwrites Pillar C's trust story
(an auto-generated plan needs the same data guarantees a validation script would enforce) —
but it was explicitly **not** picked as this round's priority, so treat it as backlog:

- A recipe-data validation script (plain Node or Python, no new dependency) run in CI alongside
  `node --check`, checking the invariants listed in §0.
- A CLAUDE.md/ROADMAP.md freshness check folded into the "process rule" above rather than a new
  tool — i.e. discipline, not automation, for now.

**Effort:** Low–Med · **Impact:** Med (protective, not user-visible).

---

## Pillar B — Proactive Scheduling & Reminders

### Problem
Every smart feature in the app — Smart Week, the Macro Smart Generator, batch-prep suggestions,
the macro tracker's goal tracking — only acts when Mike opens the app and taps something. Nothing
reaches out to him. There's no backend and no accounts, so this can't be "the app pushes a
notification" in the traditional sense without new infrastructure.

### Approach
This session's environment (Claude Code Remote) already has a scheduling primitive that's
**independent of the app's codebase**: a cron-style trigger can fire into a Claude session on a
schedule and message Mike directly. That's the mechanism this pillar uses — it's automation
*around* the cookbook, not a new app feature.

Two tiers, in order of how soon they're buildable:

1. **"Dumb" reminders (buildable now, no data bridge needed).** A weekly trigger (e.g. Sunday
   evening) that messages Mike a nudge — "plan/batch-prep for the week," "log today's macros if
   you haven't." No awareness of his actual plan or tracker state; a templated prompt.
2. **"Informed" reminders (needs a data bridge — open design question).** A trigger that
   references Mike's *actual* current meal plan, macro history, or tracker gaps to make the nudge
   specific ("3 of this week's meals share a sheet-pan step — batch those Sunday"). The app's
   state lives in `localStorage` in Mike's phone browser; a scheduled trigger running server-side
   has no way to read that today. Shipping tier 2 requires deciding *how* state gets out —
   candidates: Mike pastes a quick status when asked, a periodic export to somewhere the trigger
   can read (e.g. a synced file/sheet), or deferring until there's a reason to add a lightweight
   sync layer. **Do not build a backend for this without a separate, explicit go-ahead** — it's
   the one item in this roadmap that would break the "no backend" constraint if done carelessly.

### Acceptance (first slice — tier 1 only)
- A recurring trigger fires on a chosen cadence and delivers a specific, useful reminder message
  (not generic "don't forget to eat healthy" filler).
- No app code changes required to ship this slice.
- Mike can adjust or cancel the cadence without touching code (trigger update/delete).

**Effort:** Low (tier 1) / Med–High (tier 2, blocked on the data-bridge decision).
**Impact:** Med–High.

---

## Pillar C — Smarter, Proactive Meal Planning

### Problem
Smart Week and the Macro Smart Generator are Mike's most differentiated features and they're
push-button only — opening Home to an empty planner on a Monday shows silence, not a suggestion.
Macro history is already tracked (`mc-cookbook:mealplan:macrohistory`) but doesn't feed back into
generation automatically.

### Approach (client-side only — no backend needed for any of this)
- **Auto-drafted week on Home.** If the planner is empty and it's the start of a new week, run
  the existing Smart Week scoring path automatically and surface the result on Home as a
  **draft to review/accept/discard**, instead of requiring Mike to find and tap the button first.
  This is a UX trigger change on top of code that already exists (`smw*` scoring in
  `cookbook-home.js`), not new generation logic.
- **Macro-trend bias.** Read `mc-cookbook:mealplan:macrohistory` before generating and nudge the
  Macro Smart Generator's targets if a trend is clear (e.g. protein consistently under goal →
  bias selection toward higher-protein recipes next week). Surface *why* a recipe was picked
  ("+protein vs. last week") so it doesn't feel like a black box.
- **Pairs with Pillar B:** the tier-1 weekly reminder is a natural moment to tell Mike a draft is
  ready to review, once this pillar ships.

### Acceptance
- Opening Home on/after the start of a new week with an empty plan shows a ready-to-review draft,
  not an empty state.
- Accepting a draft behaves like the existing "commit" flow; discarding it clears cleanly with no
  orphaned state.
- Any macro-trend bias is visible in the UI (a short reason string), not silent.
- No regression to the existing on-demand Smart Week / Macro Smart Generator flows — this adds an
  automatic trigger for the same code path, it doesn't replace manual use.

**Effort:** Med · **Impact:** High (this is the app's most differentiated feature, currently
under-surfaced because it's opt-in only).

---

## Sequenced phases

| Phase | Ticket | Why this order | Effort | Impact |
|------:|--------|----------------|:------:|:------:|
| **1** | This roadmap + `CLAUDE.md` refresh | Align before building (done as part of this pass) | — | — |
| **2** | **Pillar B, tier 1** — dumb weekly reminder trigger | No app-code risk, ships immediately, gives fast feedback on whether reminders are actually useful before investing further | Low | Med–High |
| **3** | **Pillar C** — auto-drafted week + macro-trend bias | Builds on code that already exists; biggest differentiation payoff | Med | High |
| **4** | **Pillar B, tier 2** — informed reminders | Only after the data-bridge design question is resolved; revisit once Phase 2/3 show reminders are worth deepening | Med–High | Med–High |
| **Backlog** | **Pillar A** — data validation script | Not urgent, not user-visible; pick up opportunistically or once recipe-intake automation raises the stakes for bad data slipping through | Low–Med | Med |

**Already done (no work):** persistent nav, screen wake lock, Cooking Mode, arbitrary serving
scaling, app-wide search, visual/motion polish (all v1 Pillars 1–4), Smart Week, Macro Smart
Generator, batch-prep suggestion, cook log, macro tracker (goals/food search/barcode scan),
"My Recipes", PWA install + offline service worker + CI regen, favorites store, collections,
design-token system.

## Open questions before Phase 4
- How should app state (meal plan, macro history) get from the phone's `localStorage` to
  somewhere a scheduled trigger can read it, if at all? Resolve this only once tier-1 reminders
  have proven useful enough to justify it.

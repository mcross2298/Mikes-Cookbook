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

## Pillar A — Data & Doc Integrity ✅ (validation script shipped)

**Status:** ✅ **Shipped.** `tools/validate-recipes.js` loads `recipes-data.js` the same way the
browser does (vm-executes it with `window` pointed at the sandbox, no parser dependency) and
checks: unique/slug-shaped `recipe_id`s, required fields, `dish_category` against the known
11-value enum, ingredient `category` against Meat/Dairy/Produce/Pantry, every `COLLECTIONS`
`source_match` actually resolving to a recipe (a `live` collection can't render empty), and
`MIKES_FAVORITES` slugs resolving to real recipes. Wired into `.github/workflows/pages.yml` as a
**hard-fail** gate (per Mike's call) right after the `node --check` step, before the SW regen.

Building it surfaced something CLAUDE.md's data-model section doesn't mention: recipes aren't all
on the classic `serving_2`/`serving_4` ladder — batch-yield items (a whole cheesecake, a
single-tray dessert) author **one** `serving_N` tier matching `native_serving`/`scaling_options`
instead (`cookbook.js`'s `nativeServing()`/`ingredientsFor()`/`macrosFor()` already handle this
generically). The validator requires *at least one* `serving_N` tier rather than specifically 2
and 4, and only enforces macro-equality *across whichever tiers a recipe actually has*. Verified
against a mutated copy of the real data (typo'd `dish_category`, mismatched macro tiers, a bad
ingredient category, a duplicated `recipe_id`) to confirm it actually catches these classes of
bug, not just passes vacuously.

- A CLAUDE.md/ROADMAP.md freshness check folded into the "process rule" above rather than a new
  tool — i.e. discipline, not automation, for now.

**Effort:** Low–Med · **Impact:** Med (protective, not user-visible).

---

## Pillar B — Proactive Scheduling & Reminders ✅ (tier 1 + tier 2 shipped)

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
2. **"Informed" reminders — ✅ shipped as "ask-when-it-fires."** Rather than build a data bridge
   out of `localStorage` (which would risk the "no backend" constraint), the trigger's prompt
   was changed so the weekly check-in **asks Mike a specific question** ("is next week's plan
   set?", "want a fresh Smart Week draft?", "hitting your macro goals lately?") instead of
   guessing at his state or sending a generic blast. If Mike replies, the session uses his actual
   answer to respond usefully (batch-prep timing, recipe suggestions, etc.). Zero new app code,
   zero new infrastructure — the informedness comes from asking, not from reading state
   remotely. A real data-bridge/export/sync mechanism remains **un-built and un-scoped**; revisit
   only if ask-when-it-fires proves insufficient, and still not without a separate go-ahead.

### Acceptance (first slice — tier 1 only)
- A recurring trigger fires on a chosen cadence and delivers a specific, useful reminder message
  (not generic "don't forget to eat healthy" filler).
- No app code changes required to ship this slice.
- Mike can adjust or cancel the cadence without touching code (trigger update/delete).

**Status:** ✅ **Shipped** — a weekly Claude Code Remote trigger ("Cookbook Sunday planning
nudge") fires `0 23 * * 0` (cron, UTC — 18:00 **EST**) and sends a push notification varying its
wording each week, per the acceptance criteria above. Note: the cron clock is a fixed UTC offset,
so it holds 18:00 EST (UTC−5) exactly but drifts to 19:00 during EDT (UTC−4, roughly
mid-March–early November) since cron doesn't observe DST. Not corrected for automatically —
nudge it another hour via `update_trigger` for the summer half of the year if that 1-hour drift
matters.

**Effort:** Low (tier 1) / Med–High (tier 2, blocked on the data-bridge decision).
**Impact:** Med–High.

---

## Pillar C — Smarter, Proactive Meal Planning ✅ (auto-draft shipped, bias deferred)

### Problem
Smart Week and the Macro Smart Generator are Mike's most differentiated features and they're
push-button only — opening Home to an empty planner on a Monday shows silence, not a suggestion.
Macro history is already tracked (`mc-cookbook:mealplan:macrohistory`) but doesn't feed back into
generation automatically.

### Approach (client-side only — no backend needed for any of this)
- **Auto-drafted week on Home.** ✅ **Shipped.** If the planner is empty (and the offer isn't on a
  ~7-day dismissal cooldown), Home now runs the existing Smart Week scoring path automatically
  and surfaces the result as a **draft to review/accept/discard** (Use this week / Regenerate /
  Not now), instead of requiring Mike to find and tap the button first. A UX trigger change on
  top of code that already existed (`smw*` scoring in `cookbook-home.js`), not new generation
  logic. New `mc-cookbook:mealplan:autodraft-dismissed` key backs the cooldown; it clears the
  moment a real plan is built.
- **Macro-trend bias.** *Not started — deferred fast-follow.* Read
  `mc-cookbook:mealplan:macrohistory` before generating and nudge the Macro Smart Generator's
  targets if a trend is clear (e.g. protein consistently under goal → bias selection toward
  higher-protein recipes next week). Surface *why* a recipe was picked ("+protein vs. last week")
  so it doesn't feel like a black box. The auto-draft ships plain (Balanced only) until this
  lands.
- **Pairs with Pillar B:** the shipped weekly check-in already asks whether Mike wants a fresh
  Smart Week draft, which naturally points at this feature — not formally wired together (the
  trigger's question is templated, not aware the auto-draft card exists), but conceptually
  aligned.

### Acceptance
- Opening Home on/after the start of a new week with an empty plan shows a ready-to-review draft,
  not an empty state. ✅
- Accepting a draft behaves like the existing "commit" flow; discarding it clears cleanly with no
  orphaned state. ✅ (verified in a headless-browser pass: accept/regenerate/dismiss/reload/re-empty
  all behave as specified)
- Any macro-trend bias is visible in the UI (a short reason string), not silent. — N/A until the
  bias fast-follow ships.
- No regression to the existing on-demand Smart Week / Macro Smart Generator flows — this adds an
  automatic trigger for the same code path, it doesn't replace manual use. ✅

**Effort:** Med · **Impact:** High (this is the app's most differentiated feature, currently
under-surfaced because it's opt-in only).

---

## Sequenced phases

| Phase | Ticket | Why this order | Effort | Impact |
|------:|--------|----------------|:------:|:------:|
| **1** | ✅ This roadmap + `CLAUDE.md` refresh | Align before building (done as part of this pass) | — | — |
| **2** | ✅ **Pillar B, tier 1** — dumb weekly reminder trigger | No app-code risk, ships immediately, gives fast feedback on whether reminders are actually useful before investing further | Low | Med–High |
| **3** | ✅ **Pillar C** — auto-drafted week (macro-trend bias not yet) | Builds on code that already exists; biggest differentiation payoff | Med | High |
| **4** | ✅ **Pillar B, tier 2** — informed reminders, shipped as "ask-when-it-fires" | Sidesteps the data-bridge question entirely by asking Mike directly instead of reading his state remotely | Low | Med–High |
| **5** | ✅ **Pillar A** — recipe-data validation script | Greenlit alongside Phase 4; hard-fail gate in CI, `tools/validate-recipes.js` | Low–Med | Med |
| **Backlog** | Macro-trend bias (Pillar C fast-follow) | Deferred by choice in Phase 3 — ship once the plain auto-draft has been used for a bit | Med | Med–High |
| **Backlog** | A real data-bridge/export/sync mechanism for Pillar B | Only if ask-when-it-fires proves insufficient — still requires a separate go-ahead per the "no backend" constraint | Med–High | Med–High |

**Already done (no work):** persistent nav, screen wake lock, Cooking Mode, arbitrary serving
scaling, app-wide search, visual/motion polish (all v1 Pillars 1–4), Smart Week, Macro Smart
Generator, batch-prep suggestion, cook log, macro tracker (goals/food search/barcode scan),
"My Recipes", PWA install + offline service worker + CI regen, favorites store, collections,
design-token system.

## Open questions (backlog only)
- How should app state (meal plan, macro history) get from the phone's `localStorage` to
  somewhere a scheduled trigger can read it, if at all — only relevant if "ask-when-it-fires"
  (Pillar B tier 2, shipped) turns out to be insufficient and a real data bridge is wanted.
- Should the two backlog items (macro-trend bias, a real data bridge) be picked up next, or is
  this round of continuous improvement done for now?

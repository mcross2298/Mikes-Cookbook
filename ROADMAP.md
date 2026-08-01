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

- **318 recipes** across **11 dish categories** (Breakfast, Salads & Slaws, Soups/Stews/Chilis,
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
- ~~**Zero automated verification.**~~ **Superseded.** As of Pillar A + Pillar E phase 1, CI is a
  `verify` job with **7 blocking gates** (syntax, `validate-recipes.js`, the bridge + sync-merge
  tests, SW strategy, backup format, precache freshness, shared-module drift) running on pull
  requests *and* `main`, with `deploy` gated behind it. There is still **no UI smoke test** —
  that remains the open gap. See Pillar E, C-16.

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

## Pillar C — Smarter, Proactive Meal Planning ✅ (auto-draft + macro-trend bias both shipped)

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
- **Macro-trend bias.** ✅ **Shipped (2026-07-15, via bridge roadmap B2).** Reads
  `mc-cookbook:mealplan:macrohistory` (last 14 days, needs ≥4 days of real data to trust a trend)
  and bumps the Macro Smart Generator's per-day protein target +12g when the trailing average is
  clearly under goal (<85%). Surfaced as a visible reason line ("📈 Trending under on protein
  lately — meals biased +12g") in the Smart Week overlay's Macro-Targeted mode — never silent,
  absent entirely with no real trend to report. Additive with (not a replacement for) B2's
  training-day protein bump on the same target.
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
- Any macro-trend bias is visible in the UI (a short reason string), not silent. ✅ (the
  Macro-Targeted overlay's trend callout, present only when a real trend is detected)
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
| **3** | ✅ **Pillar C** — auto-drafted week | Builds on code that already exists; biggest differentiation payoff | Med | High |
| **4** | ✅ **Pillar B, tier 2** — informed reminders, shipped as "ask-when-it-fires" | Sidesteps the data-bridge question entirely by asking Mike directly instead of reading his state remotely | Low | Med–High |
| **5** | ✅ **Pillar A** — recipe-data validation script | Greenlit alongside Phase 4; hard-fail gate in CI, `tools/validate-recipes.js` | Low–Med | Med |
| **6** | ✅ **Pillar C fast-follow** — macro-trend bias | Shipped via bridge roadmap B2, once real cross-app training signal existed to bias alongside it | Med | Med–High |
| **Backlog** | A real data-bridge/export/sync mechanism for Pillar B | Only if ask-when-it-fires proves insufficient — still requires a separate go-ahead per the "no backend" constraint | Med–High | Med–High |

**Already done (no work):** persistent nav, screen wake lock, Cooking Mode, arbitrary serving
scaling, app-wide search, visual/motion polish (all v1 Pillars 1–4), Smart Week, Macro Smart
Generator, batch-prep suggestion, cook log, macro tracker (goals/food search/barcode scan),
"My Recipes", PWA install + offline service worker + CI regen, favorites store, collections,
design-token system.

## Pillar D — Cookbook ↔ Workout data bridge (governed by the joint roadmap)

**Status:** 🔄 In progress — **B0 (foundation & data contract)**, **B1 (cookbook→workout:
meals inform training)**, **B2 (workout→cookbook: training informs meals)**, **B3
(unified "Today" view & reciprocal nav)**, and **B4 (suite UI/UX unification)** shipped
2026-07-15; **B5 (joint launch hardening)**'s session-verifiable half shipped 2026-07-16
— real-device QA and production Supabase reconciliation remain, and only the owner can
close those. Approved 2026-07-15 as a phased,
two-way bridge toward a **joint launch** of the cookbook and 4 Weeks to Open as **two linked
PWAs**. B0 added a pull-only `CONSUME` map to `mc-sync.js` (this app pulls `mc_activity` +
`mc_workout_log_v1` read-only from the workout app; never pushed) and `mc-bridge.js`, the
shared read-only cross-app view. B1 added `cookbook-home.js`'s `mealSnapshot()` — every meal
added to the plan (`addMeal`, `commitSmartWeek`, and the plan-history "Reuse" flow) now
denormalizes `{title, icon, macros}` onto the meal entry itself, since the workout app never
loads `recipes-data.js` and has no other way to resolve a bare `recipe_id`; this is what makes
the workout app's new "Today's Planned Meals" card (in `4-Weeks-to-Open-/mc-macros.js`) able
to show a real title and macros instead of a bare id. Purely additive to the plan's data shape
— no cookbook UI changed, so no Quick Tour update was needed for B1. This resolves the
"real data bridge" open question below: the bridge is the signed-in Supabase sync layer both
apps already share (`user_sync` table, `mc_macros_v1` already reconciled), widened so each app
*pulls* the other's stores read-only. It is **not** a way for a scheduled trigger to read
`localStorage` — that idea stays retired; ask-when-it-fires (Pillar B tier 2) remains the
reminder mechanism.

The full phased plan (B0 foundation/data-contract → B1 cookbook→workout → B2 workout→cookbook
→ B3 unified "Today" view → B4 suite UI/UX → B5 joint launch hardening) lives in the master
repo: **`4-Weeks-to-Open-/cookbook-bridge-roadmap.md`**. Cookbook-side phases (B0 sync-whitelist
widening + `mc-bridge.js`, B2 training-aware Smart Week, B3 Today strip + reciprocal nav, B4
docs) land here in `Mikes-Cookbook` on their own branch; each needs its own executive summary
and owner approval before code, same gate as every phase here.

**B2 shipped (2026-07-15) — training informs meals.** `mc-bridge.js` gained
`likelyTrainingDays()` (a real historical weekday-training pattern from `mc_workout_log_v1`,
not a fabricated future schedule) feeding a protein-up/kcal-lighter bias into both Smart Week's
`smw*` scoring and the Macro Smart Generator's per-day protein target. **Also absorbed the
deferred macro-trend-bias fast-follow** (Pillar C backlog below) into the same
`msgDayProteinGoal()` seam — biasing on real cross-app training signal turned out to be the
natural home for both. The cookbook Home hero also gained a workout-aware nudge (specific line
when trained today or on a real streak, e.g. "Legs today — plan meals that fuel the recovery"),
and the "Past 7 Days" recap card now fuses in workouts completed the same week. All verified
live in headless Chromium against the real app + real recipe data (statistically confirmed
protein bias, Home-nudge branches, recap fusion, and the trend-bias callout's presence/absence).

**B3 shipped (2026-07-15) — unified "Today" view & reciprocal nav.** A real architecture
finding first: the two apps are actually **same-origin** (`mcross2298.github.io`, different
path — not two separate origins as B0 assumed), so same-device `localStorage` and the Supabase
session are already shared by the browser natively; the sync bridge (B0–B2) remains necessary
for cross-device use and isn't made redundant by this. The existing "Today" card
(`renderTodayCard()`) gained a real workout-status badge (`todayWorkoutBadge()`) and now
renders even on a day with a workout logged but no meals planned — previously it returned
`null` in that case, silently dropping the signal. Home's topbar gained a persistent,
reciprocal nav link to the workout app (`.home-workout-btn`), `MARKET:STRIP`/`MARKET:ADD`-gated
the same way the workout app's own cookbook-nav link already is (absolute URL in the standalone
build, relative `../dashboard.html` when mounted in the Rolodex market build) — verified by
running the actual market-build regex transform against the file, confirming clean toggling.
Sign-in continuity across the new link needed zero extra code, per the same-origin finding.

**B4 shipped (2026-07-15) — suite UI/UX unification.** An audit-first pass: checked what
already existed before building, and found two real parity gaps plus one real defect rather
than doing a purely cosmetic pass. This app had **no install-prompt mechanism at all** —
`mc-install.js` (fully app-agnostic) ported byte-identical from the workout repo and wired into
`mc-account.js`'s new Install section. Also had **no ambient sync-status indicator** — the
workout app's persistent "☁️ Backed up · Nm ago" line on Home had no cookbook equivalent;
`mc-backup-status.js` ported too, but adapted at the shared-module level first: the original
cached its target element once at load, which would have gone stale after this app's very first
Home re-render (this is a hub-and-spoke SPA that rebuilds Home's whole DOM on every visit) — now
re-queries the DOM on every `render()` call, plus a new `refresh()` hook this app calls
immediately after each Home render instead of waiting up to 15s for the interval. **A real
defect found and fixed:** the new `.home-workout-btn` from B3 silently overlapped the
pre-existing `.home-account-btn` at the identical position — since the account button mounts
after it in Home's render order, it fully occluded the workout-nav icon. Moved to its own slot,
verified via an actual bounding-rect check in headless Chromium. Sign-in copy is now symmetric
in both directions (this app's copy already mentioned the workout app; the workout app's own
copy didn't mention this one — now it does). `quick-tour-overview.html` gained an explicit
suite-framing sentence and stat chip (previously the workout app was only ever mentioned
feature-by-feature); fixed a stale recipe count noticed in the same paragraph (144 → 318).

**B5 shipped (2026-07-16) — joint launch hardening, session-verifiable half.** `mc-sync.js`
gained a `module.exports` hook (before its `window.__mcSync`/`MC_SB` guards, exploiting that
the merge functions are hoisted `function` declarations further down the same closure) so
`tools/test-mc-sync-merge.js` can regression-test the real merge logic — `mergeMacros`,
`mergePlan`, `mergeStringSet`, `mergeHistoryBySavedAt`, `mergeArrayByField`,
`mergeCookedByRecipe` — via a `vm`-sandboxed real file, not a duplicated copy. A real CI gap
was found: this repo never ran `test-mc-bridge.js` at all (no copy of the file even existed
here, despite this repo owning a byte-identical `mc-bridge.js`) and neither repo's CI ran
either bridge test before now — both fixed, both test files now blocking steps in
`pages.yml`. A full cross-app QA loop was verified headlessly end-to-end for the first time
(prior phases were each tested in isolation) — seeded workout activity into this app and
confirmed the Home Today card's workout-badge-with-zero-planned-meals path (the exact B3 fix)
renders correctly, cross-checked against `MCBridge.todaysWorkout()` directly, zero console
errors. Offline behavior verified live in headless Chromium: kill the network, reload, the
shell **and** the bridge modules still work from the SW cache. `mc-export.js` reconfirmed to
already exclude the CONSUME-only workout stores (`mc_activity`, `mc_workout_log_v1`) from both
export and import, zero code changes needed — one-writer-per-store holds through a manual
backup round-trip too. **Not done, and can't be from a headless session:** the real-device QA
matrix (iOS Safari, Android Chrome, installed-PWA mode) and confirming actual Supabase row
reconciliation across two signed-in physical devices. Full breakdown in
`4-Weeks-to-Open-/cookbook-bridge-roadmap.md`'s B5 section.

**Effort:** Med–High (phased) · **Impact:** High (this is the joint-launch product).

## Pillar E — Cookbook-interior waste audit (findings C-01 – C-15)

**Source:** a Lean Six Sigma waste audit of this repo's interior, 2026-07-31, weighted to the
cook's own value stream. Distinct from the 2026-07-21 suite-level audit (`W-01`–`W-23`, of which
`LS-1` and `LS-4` shipped here) — that one measured the cookbook from the outside as the small
side of a two-app suite and never opened `cookbook-home.js` or walked the cook's journey.
16 findings: 4 high, 9 medium, 3 low — C-16 was found while watching phase 1's own PR.
Phases 1–5 are shipped (C-01 – C-12 and C-16). Only C-13 – C-15 remain — phase 6 hygiene.

### Phase 1 ✅ (shipped 2026-07-31) — the findings that were broken for a real cook

- **C-01 · Two backup systems, incompatible formats.** The app shipped two complete backup
  implementations, both reachable from Home, both writing `mikes-cookbook-backup-<date>.json`
  stamped `app:"mikes-cookbook"`. Neither could read the other's files: the account-sheet file
  was rejected outright by Home's importer (no `version` field), and the Home file was *accepted*
  by the account-sheet importer and silently corrupted — it `JSON.stringify`-ed values that were
  already JSON strings, so favorites restored as the string `"[\"a\",\"b\"]"`. Reproduced, not
  inferred. Consolidated into `mc-export.js`; `cookbook-home.js` keeps only thin adapters and its
  `confirm()` step. **Found while fixing:** the old `mc-export.js` also corrupted bare-string
  stores round-tripping its *own* file — `:lastBackupAt` (ISO stamp) and
  `:mealplan:recap-dismissed` (week key) aren't JSON, so parse-then-stringify re-quoted them.
  Format v2 therefore stores **raw localStorage strings**, the only round trip correct for every
  store. v1 and unversioned legacy files still import, so no backup already on a phone is
  orphaned.
- **C-03 · Home's backup omitted the entire macro tracker.** It prefix-scanned `mc-cookbook:`
  and the tracker is deliberately `mc_macros_v1`. Fixed by the consolidation (this is why
  `mc-export.js` was the copy to keep); card copy now names the tracker.
- **C-02 · Favorites and pantry never synced.** Neither was in `mc-sync.js`'s `STORES`, so a
  signed-in cook watching "☁️ Backed up · 2m ago" wasn't having their hearts backed up. Both are
  `Array.from(Set)` id lists, so the existing `stringSet` union strategy applied unchanged. The
  still-excluded stores (`:photos`, `:timecheck`, and the device-local preferences) now carry
  written reasons in the file so the omissions read as decisions. `:timecheck` specifically needs
  a `ts` field on the store before it can sync honestly — logged below.

- **C-16 · CI never ran on pull requests** — found while watching this phase's own PR, not in the
  original audit sweep. `pages.yml` triggered on `push: branches: ["main"]` alone, so a PR got
  **zero checks**: all six gates fired only on the merge commit, by which point a failure was
  already live on the production origin. The gates were real, they just ran one step too late to
  protect anything. Split into `verify` (7 gates, runs on pull requests **and** `main`) and
  `deploy` (`needs: verify`, gated to `main`, never runs from a PR branch). `build-sw.py --check`
  was promoted to a real gate in the process — the deploy job regenerates `sw.js` anyway, so a
  stale precache list had never been able to fail anything, and on a PR it's the only signal that
  a new top-level asset was never wired in. This is the developer stream's counterpart to C-01:
  a safety net that existed but wasn't positioned where it could catch a fall.

**Verification:** `tools/test-mc-export.js` (new, 39 assertions, blocking CI step) pins the format
contract — round trip, both legacy shapes, every rejection path, and the exact C-01 corruption.
`tools/test-mc-sync-merge.js` gained favorites/pantry conflict fixtures plus a source-level
assertion on `STORES` membership, since the merge logic was never the problem — the whitelist was.
The whole flow was then driven end-to-end in headless Chromium against the real app: export from
Home's card, wipe the device, re-import, and confirm the app reads real arrays back (20/20).

**Not verified from this session:** actual Supabase row reconciliation for the two newly-synced
stores across two signed-in physical devices — same owner-only gate B5 documented.

### Phase 2 ✅ (shipped 2026-08-01) — stop the drift, reach every recipe

- **C-11 · The docs described an app that no longer existed.** CLAUDE.md and ROADMAP.md said
  160 recipes and quick-tour.html said 144; there were **318**. CLAUDE.md also had
  `cookbook-home.js` at "~140 KB, ~3.2k lines" (220 KB / 4.9k), `recipes-data.js` at "~600 KB"
  (1.04 MB), `cookbook.css` at "~50 KB" (108 KB), the service worker as network-first two rounds
  after LS-4 made it stale-while-revalidate, and "there is **no bottom tab bar**" while
  `index.html` shipped one. **README.txt was the worst of it** — it still described a three-tab
  shell (Home · Recipes · Favorites) that hasn't existed for several releases, and put Two Meals
  a Day at 10 recipes (41). All corrected, and README.txt rewritten against the real code.
  The durable half is **`tools/check-docs.js`** (new, blocking CI gate): counts checked exactly,
  file sizes with a ±20% tolerance so normal churn doesn't fail CI, and structural claims checked
  *against the source they describe* — the "no bottom tab bar" line fails only while
  `index.html` actually has a `.tab-bar`, so it stays correct if the app changes. Mutation-tested
  against five seeded drifts: four caught, and the deliberately-small size drift correctly passed.
  The repo's answer to doc drift until now was the "process rule" — discipline. Discipline is what
  produced the numbers above; `build-sw.py --check` already proved the automated version of this
  idea works for the precache list.
- **C-10 · Ten recipes were unreachable from the Recipes browse path.** Four sources
  (*Eating Healthy Mag* 5, *Simple High-Protein Recipes* 3, *Family Recipes* 1,
  *Clean Eat Guide* 1) had recipes but no collection, so they could only be found via Categories
  or search — never from the collection cards Home points at. *Family Recipes* was the sharpest
  case: a single handed-down lasagna, in the app whose whole premise is hand-me-downs, with no way
  to browse to it. **Provenance was deliberately not rewritten** — re-`source`ing those recipes
  into an existing collection would have been a one-line fix and would have destroyed where they
  actually came from — so each origin got its own card, including the two holding one recipe
  today. `validate-recipes.js` now checks **both** directions (an empty collection *and* a
  stranded recipe); mutation-tested by deleting a collection and confirming it fails.
- **C-12 · Eleven stores were undocumented; fourteen writers swallowed quota failures.** All
  eleven are now in CLAUDE.md's state section. **Correction to the audit's own claim:**
  `mc-cookbook:photos` was described as uncapped *and* silent — only the first half was right.
  Each image was already downscaled and a failed write already alerted; what was missing was a
  ceiling on *how many* recipes could hold a cover photo (318 possible, against a 5–10 MB shared
  quota). `MAX_RECIPE_PHOTOS = 24` applies the cook log's own evict-oldest pattern. The real
  silent-failure finding was elsewhere: fourteen `try { setItem } catch (e) {}` blocks in
  `cookbook-home.js` — favorites, plan, grocery, cook log, pantry, history — meaning a full quota
  looked like changes just not saving. All routed through one `writeStore()` helper that keeps the
  swallow (correct — a full disk shouldn't throw a cook out of a recipe) but surfaces one toast
  per session.

**Verification:** every gate green, plus a live headless-Chromium pass (15/15): all four new
collection cards render on the Recipes screen, each collection page lists exactly its recipes, all
318 recipes resolve to a live collection, a formerly-orphaned recipe opens and renders, and a
simulated `QuotaExceededError` produces exactly one visible toast — not zero, and not one per
write.

### Phase 3 ✅ (shipped 2026-08-01) — stop maintaining the same code twice

- **C-04 · Three near-verbatim week generators → one.** `smw*` (Balanced), `msg*` (Macro-Targeted)
  and `tcw*` (Time Check) were three implementations of one algorithm: same eligible pool, same
  `excludeId` filter, same `SMW_HARD_EXCLUDE_DAYS` freshness filter with the same fallback, same
  argmax loop. Time Check already called Balanced's own scorer — that's what proved the seam was
  there. Now one `wkPickForSlot` + `wkGenerateWeek` + `wkRegenerateSlot`, with the three biases
  declared in a `WEEK_MODES` table (`prepare` / `skipDay` / `narrow` / `score` / `track`).
  **A deliberate asymmetry was preserved, not "fixed":** Time Check passes no `dayBias`, so it has
  never had Balanced's training-day protein bias. Changing that is a product decision.
  **Honest accounting:** this removed **31 code lines**, not the ~235 the audit projected. That
  estimate counted the whole 375-line span, most of which was genuinely mode-specific logic
  (`msgMacroFit`, `msgDayConsumed`, `macroTrendBias`, `smwTrainBias`, the scorers) that had to
  stay. The real win is structural — 9 functions became 3 plus a declarative table, so a fix to
  repeat-avoidance or seasonality now lands in one place instead of up to three.
- **C-07 · The recipe card was maintained twice.** ~300 duplicated lines per file: a byte-identical
  121-line icon-SVG table, `CARD_PATTERNS`, `clampAccent` (triplicated — `cookbook.js` too),
  `rgbFromHex`, `hashStr`, `cardPatternFor`, `cardSheenDelay`, `macroStatsHtml`, and the card
  itself — which had **already drifted**: collection pages had grown a user-recipe delete control
  while the shell had grown a pantry badge, serving override, owner double-tap curation and a
  favorites-screen removal path. New `mc-cards.js` (one card, per-call `opts` for what a card
  shows + `configure(hooks)` for how a page behaves) and `mc-fav.js` (the favorites store, which
  `CLAUDE.md` already described as `window.MCFav` even though two of the three files never used
  it). `cookbook-home.js` 4,953 → 4,662 lines; `collection.js` 629 → 377 (−40%).

**Verification — this phase was the riskiest so far, so both halves were proved, not argued:**

- **C-04, golden-output diff.** Generation carries deliberate `Math.random` jitter, so a seeded
  PRNG made it comparable. A harness captured **54 cases / 600 grid cells** (3 modes × 3 state
  variants × 6 scopes, plus regenerate calls and the macro-fit readout) from the *pre-refactor*
  code, seeding every input the scorers read — cook log, favorites, macro goals, macro history,
  and a stubbed training pattern. Two baseline runs were byte-identical first, so the comparison
  meant something. Post-refactor output: **byte-identical across all 54 cases.**
- **C-07, DOM snapshot diff.** 13 card-rendering surfaces captured before and after (shell
  Recipes / Favorites / Mike's / Categories / category detail / Low-shopping filter / Home, four
  collection pages, and both heart-tap paths, which behave differently by design). **12 of 13
  byte-identical.** The 13th, Home, differs *run-to-run on identical code* — the For You
  carousel's own jitter — confirmed with a control run; masking the carousel makes Home identical
  too.
- The C-04 golden set was re-run **after** the card extraction and still matched, so the two
  changes don't interact.
- Every writer's assumption was checked against real source rather than inferred: a first draft of
  `mc-cards.js` written from memory got `clampAccent`, `macroStatsHtml`, `recipeIconHtml`,
  `rgbFromHex`, `hashStr` and `CARD_PATTERNS` **all wrong**, and `recipeIconHtml` turned out to
  depend on a 121-line SVG table that wasn't in the plan. The shipped file moves the real bytes.

### Phase 4 ✅ (shipped 2026-08-01) — one decision instead of four

- **C-05 · Four ways to fill a week became one.** The Plan pane had two sibling buttons — *✨ Smart
  Week* and *⏱️ Time Check* — and Smart Week carried its own Balanced/Macro-Targeted toggle on top.
  Four entry points, one `{day, slot, id}` grid, and the choice was **irreversible in the UI**:
  seeing a Balanced week and wondering what Time Check would give meant cancelling out and starting
  from a different button. Now one *✨ Plan my week* button opens one overlay whose bias is a chip
  row (**Balanced · Macro · Time**) that regenerates in place — the cook picks *after* there's a
  result to compare. Macro still only appears with real goals set. Time keeps its day-budget quiz,
  shown inline until a day is assigned, with an "‹ Adjust days" way back; assignments still persist.
  The two overlays also carried a near-identical ~60-line day-grid renderer — now `pwDayBlocks`.
- **C-09 · Home ranks instead of stacking.** At most one nudge banner (tour ▸ stale-backup) and at
  most one suggestion card (Today ▸ auto-draft ▸ recap). Each was appended independently before.

**Verification (23/23 in headless Chromium):** every bias chip renders and regenerates in place
without opening a second overlay; Macro shows its per-day protein readout and is absent without
goals; Time gates "Generate" until a day is assigned, produces a grid covering only assigned days,
returns to the quiz, and persists buckets; committing writes a plan whose meals carry the roadmap-B1
bridge snapshot.

**A note on how C-09 was verified, because the first attempt was wrong.** The initial test asserted
"≤1 nudge, ≤1 suggestion" and passed — but a control run against the *pre-change* code passed too,
so it proved nothing. The scenario couldn't stack: `hasCookData()` needs favorites or a plan (the
cook log alone doesn't count), and the recap card **only renders on Sunday or Monday** — the test
ran on a Saturday. Rebuilt with favorites seeded, a meal planned for today, and `Date` pinned to a
Monday before any app script runs, the pre-change code produces **2 banners and 2 cards** and the
post-change code produces **1 and 1**. That is the assertion that ships.

**Screen rationalization — decided 2026-08-01, and the audit's own recommendation changed.** The
audit proposed 7→5: merge Categories + Recipes into one faceted Browse, *and* fold Mike's Favorites
into Favorites. Reading the code changed that call, and the owner agreed:

- **Categories + Recipes merged ✅ (7 → 6 screens).** These were two top-level screens over the same
  318 recipes, and the Recipes screen **already carried every dish category as a filter chip** — so
  Categories was a second, prettier door to a facet that already lived there. One **Browse** screen
  now, with a taxonomy switch (*By collection* / *By dish type*); tapping a dish-type card sets the
  category facet instead of navigating. Both taxonomies collapse to the same result grid the moment
  a search or facet is active, so the switch hides rather than sitting there doing nothing.
  `#categories` still resolves as a deep link (`SCREEN_ALIASES`) and lands on *By dish type*. Home's
  Explore section drops from two modules to one.
- **Mike's Favorites kept ❌ (not merged).** The audit called for folding it in; that was a call made
  at a distance. It holds 11 curated recipes, hosts the owner publishing toolbar, and is the app's
  editorial voice — "recipes Mike has actually made and loved" — which is plausibly what makes the
  cookbook read as authored rather than generic for the joint launch. Against that, the waste it
  represents is ~25 lines of render code and one Home module. Poor trade. The ⭐ "Mike's pick" badge
  in `mc-cards.js` already surfaces his picks on every card app-wide, so his taste reads across the
  app whether or not the screen exists.

**Verification (15/15 headless):** Home offers one Browse module and no Categories module while
keeping Mike's Favorites; the taxonomy switch shows both axes; *By dish type* renders all 11
category cards; tapping one filters in place without navigating; the switch hides once a facet is
active; `#screen-categories` no longer exists; the `#categories` deep link still works and lands on
the dish-type view; app-wide search still works; Mike's Favorites still renders. Phase 4's own 23
assertions were re-run and still pass.

**`tools/check-docs.js` gained three assertions** while fixing the docs for this, because the Quick
Tour turned out to be independently stale again — it claimed "5 live collections · 9 categories"
against a real 13 and 11. Both counts are now gated, plus a structural check that CLAUDE.md's
shell screen-count matches the number of `<section class="screen">` panels `index.html` ships. All
three mutation-tested.

### Phase 5 ✅ (shipped 2026-08-01) — measure first, then split where there's actually a seam

- **C-06 · `recipes-data.js`: measured, and left alone.** The audit extrapolated "28 ms here × 5 ≈
  140 ms on a phone" from a Node `new Function()` compile — which is not how a browser loads a
  script (V8 lazily compiles, and a mark at the top of the file measures execution *after* parse,
  missing it entirely). Measured properly instead, with CDP CPU throttling and an A/B against the
  same page with the file stubbed to an empty array:

  | CPU | page | parse+exec | file's cost to DOMContentLoaded |
  |---|---|---:|---:|
  | 1× | index.html | 27 ms | 81 ms |
  | 4× | index.html | 45 ms | 136 ms |
  | 6× | index.html | 69 ms | 244 ms |
  | 4× | recipe.html | 41 ms | 73 ms |
  | 6× | recipe.html | 48 ms | 73 ms |

  4× ≈ a good mid-range Android, 6× ≈ a slow one. **Decision: do not split.** Three reasons. The
  shell genuinely needs all 318 recipes — app-wide search, Smart Week generation, Browse's
  taxonomies and favorites all iterate the whole set, so a per-collection split would defer the
  load and then pull everything back on the first search. `recipe.html` — the case the audit called
  out as most wasteful — turns out to be the *cheapest* at a flat ~73 ms, because it parses the
  data and uses one record. And the service worker serves it cache-first, so the download is once
  per deploy; only the parse recurs. A one-line `window.__mcBoot` instrument now ships on all three
  pages so a **real** device number can be read from a console rather than modelled — that was the
  audit's own acceptance criterion and it's now satisfiable.
- **C-08 · Split `cookbook-home.js` — but not where the audit said.** The audit named the planner
  as "the first and cleanest extraction: ~1,500 contiguous lines that only `setTab()` calls into."
  Measuring the coupling before moving anything showed that's wrong: the planner region references
  **66** names defined elsewhere in the file. Extracting it would have replaced one big file with
  one big file plus a 66-entry context object. **Contiguous is not separable.** The dependency
  counts across candidate regions:

  | region | lines | needs from outside | hands back |
  |---|---:|---:|---:|
  | Planner + overlays | 1,347 | **66** | 12 |
  | "For You" carousel | 247 | 36 | 1 |
  | Grocery quantity math | 257 | **5** | 6 |
  | Add-recipe form | 233 | **6** | 1 |

  The bottom two moved: **`mc-grocery.js`** (quantity parsing/summing/pretty-printing, purchase
  units, and the ingredient-identity keying the grocery merge *and* Smart Week's overlap scoring
  both read) and **`mc-recipe-form.js`**. `cookbook-home.js` 4,615 → 4,183 lines, 230 → 208
  top-level functions. The planner stays put, with the reason written into `CLAUDE.md` so the next
  pass doesn't re-litigate it.

**Verification (20/20 headless):** the quantity math is checked against exact expectations
(`"1 1/2"` → 1.5, `"3/4"` → 0.75, `"to taste"` → null so it's listed rather than summed, and
plural/singular merge-names collapsing together); the Grocery tab still builds aisle-grouped rows
from a real plan; the ingredient keys still feed Plan my week; the Add Recipe form opens, populates
its category dropdown from `CATEGORY_ORDER`, saves to `mc-cookbook:userrecipes`, and the saved
recipe appears in the live data layer. Two new top-level assets → SW regenerated, cache **v26**.

*(One note on that run: three assertions failed at first and it was the harness, not the code — it
was filling the form by guessing at placeholder text. Confirmed by reading the real validation path
rather than assuming a regression.)*

### Phase 6 (not started)

| Phase | IDs | Work |
|------:|-----|------|
| 6 | C-13 · C-14 · C-15 | Photo-precedence note, migration expiry date, delete 13 dead CSS classes, `/favicon.ico` |

**Effort:** Phase 1 Low, Phase 2 Low · **Impact:** Critical (phase 1, disaster recovery) then High
(phase 2 — doc drift is the developer stream's highest-frequency waste, and it now can't recur
silently).

## Open questions (backlog only)
- **`mc-cookbook:timecheck` needs a `ts` field** before it can join the sync whitelist (C-02).
  Today it's `{ scopeKey, days }` with no timestamp and no union semantics, so every available
  merge strategy either loses a local edit or produces a meaningless result. Small data-shape
  change; do it whenever Time Check is next touched — likely Phase 4.
- **`/favicon.ico` 404s on every cold load.** Chromium probes it by default and the repo has no
  `favicon.ico` and no `<link rel="icon">` (the manifest and apple-touch-icon both point at
  `icon.svg`). Pre-existing, cosmetic, noticed during Phase 1 verification. One line in each
  page's `<head>`, plus an SW precache regen — batch it with Phase 6 hygiene.
- ~~Macro-trend bias (Pillar C fast-follow)~~ **Resolved** — shipped 2026-07-15 via bridge
  roadmap B2, biased on real training signal per the note above, not as a standalone tweak.
- ~~How should app state get from `localStorage` to a scheduled trigger / a real data bridge?~~
  **Resolved** by Pillar D: the bridge is signed-in Supabase sync, not trigger-readable
  `localStorage`. See `4-Weeks-to-Open-/cookbook-bridge-roadmap.md`.

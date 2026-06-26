---
name: executive-summary
description: >
  Generate a Word-document-style executive summary of any planned code change or
  improvement and obtain explicit user approval before implementing. Use this skill
  at the start of every non-trivial implementation task — feature additions,
  refactors, bug fixes that touch multiple files, data-model changes, CSS/design
  overhauls, and service-worker or PWA updates.
---

# Executive Summary Skill

Before writing a single line of code, produce a structured executive summary for the user to review and approve. Only proceed after receiving explicit approval.

---

## Workflow

### 0. Align on requirements first (AskUserQuestion)

**Before researching or planning**, use `AskUserQuestion` to resolve any ambiguity
in the request. Ask only what you genuinely cannot infer — scope, preferred approach,
or a key constraint. One to three focused questions maximum. Skip this step only when
the request is already fully specified and unambiguous.

Example questions to consider:
- Which screen / component should this appear on?
- Should this persist across sessions (localStorage) or be session-only?
- Any specific design constraints (colour, icon, placement)?

### 1. Research the task

Use Glob, Grep, and Read to understand:
- Which files will be touched and why
- What existing patterns you must follow (check CLAUDE.md first)
- Any constraints or risks (data migration, cache invalidation, mobile UX, etc.)

### 2. Draft the executive summary

Render it using the exact template below. Keep each section tight — one to three
sentences or a short bullet list. This is a summary, not a design doc.

---

## Executive Summary Template

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 EXECUTIVE SUMMARY — [TASK TITLE IN CAPS]
 Project : [project name]
 Date    : [today's date]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OBJECTIVE
[One sentence: what problem does this solve or what value does it deliver?]

SCOPE OF CHANGES
Files affected:
  • [file path] — [what changes and why]
  • [file path] — [what changes and why]
  (list every file; mark NEW if creating, DEL if removing)

IMPLEMENTATION PHASES  (omit if single-phase)
  Phase 1 — [label]: [what gets built]
  Phase 2 — [label]: [what gets built]
  (break multi-part work into discrete phases the owner can approve one at a time)

IMPLEMENTATION APPROACH
[Two to four bullet points describing HOW you will implement it —
algorithms, data structures, rendering strategy, state management, etc.]

DESIGN & UX NOTES  (omit if no UI/CSS change)
[Any mobile-first, touch, accent-theming, or PWA considerations.]

RISKS & MITIGATIONS
  • [Risk] → [Mitigation]
  • [Risk] → [Mitigation]
  (include service-worker cache, localStorage migration, node --check gate, etc. as relevant)

ESTIMATED EFFORT
  Complexity : Low | Medium | High
  Files      : N files changed
  Key concern: [the one thing most likely to go wrong]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ACTION REQUIRED
 Reply "approved" or "go" to proceed with Phase 1 (or the full plan).
 Reply with feedback to revise the plan before any code is written.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3. Wait for approval

**Do not write, edit, or create any file until the user explicitly approves.**

- If the user replies with revisions, update the summary and re-present it.
- If the user approves, thank them briefly and begin Phase 1 (or full implementation).
- If the task turns out to be simpler than expected (single-line fix, obvious typo),
  note that in the summary and ask if a full plan is still needed.

### 4. Implement — phase gate (AskUserQuestion between phases)

For **multi-phase work**: complete Phase 1, then **pause and use `AskUserQuestion`**
before starting the next phase. Show what was just completed and confirm the owner
is happy to continue. Example:

> "Phase 1 (Data model) is complete — `recipes-data.js` updated and tested.
> Ready to move to Phase 2 (UI rendering in `cookbook-home.js`)?"

Only proceed to the next phase after explicit confirmation. This gives the owner a
natural checkpoint to course-correct, reprioritise, or stop early.

For **single-phase work**: implement continuously without mid-task interruptions.

If you discover a material deviation from the approved plan at any point, pause,
describe the change, and confirm before continuing.

---

## Scope guidance

**Always generate a summary for:**
- New features or UI screens
- Recipe / collection data-model changes
- Changes to `cookbook.js`, `cookbook-home.js`, `collection.js` logic
- Any CSS token or layout change touching more than one component
- Service-worker or `sw.js` changes
- `recipes-data.js` structural changes (not just appending a recipe)

**Summary optional (use judgement) for:**
- Appending a single new recipe object to `RECIPES`
- Pure copy/wording fixes in one file
- Running `tools/build-sw.py` after a file addition

---

## Example invocation

User: "Add a print-recipe button to the recipe detail page"

You:
1. AskUserQuestion — "Should the print view include macros and grocery list, or recipe steps only?"
2. Research `cookbook.js`, `recipe.html`, `cookbook.css`
3. Render executive summary → wait for "approved"
4. Implement (single phase) → done.

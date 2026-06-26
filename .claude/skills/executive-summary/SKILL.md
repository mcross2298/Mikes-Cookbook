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

### 1. Research the task

Use Glob, Grep, and Read to understand:
- Which files will be touched and why
- What existing patterns you must follow (check CLAUDE.md first)
- Any constraints or risks (data migration, cache invalidation, mobile UX, etc.)

### 2. Draft the executive summary

Render it using the exact template below. Keep each section tight — one to three sentences or a short bullet list. This is a summary, not a design doc.

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
 Reply "approved" or "go" to proceed.
 Reply with feedback to revise the plan before any code is written.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3. Wait for approval

**Do not write, edit, or create any file until the user explicitly approves.**

- If the user replies with revisions, update the summary and re-present it.
- If the user approves, thank them briefly and begin implementation.
- If the task turns out to be simpler than expected mid-implementation (single-line fix, obvious typo), you may note that in the summary and ask if a full plan is still needed.

### 4. Implement

Follow the approved plan exactly. If you discover a material deviation is needed, pause, note the change, and confirm before continuing.

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

You: [research cookbook.js, recipe.html, cookbook.css] → render executive summary → wait for "approved" → implement.

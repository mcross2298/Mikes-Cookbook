#!/usr/bin/env node
'use strict';
/* ==========================================================================
   check-write-paths.js — Gate 17. Fails on a NEW localStorage.setItem() call
   left inside an empty `catch (e) {}` anywhere in the app's real source.

   Why this exists: audit C-12 built the right mechanism (writeStore() /
   onWriteFail hooks) and wired it into two stores. The "runtime invisibles"
   audit (2026-08-31) found four more genuinely silent write paths that had
   shipped since — a hand-typed recipe, a logged tracker entry, a plan-add,
   and a check-off — each failing a full quota with zero signal to the cook.
   Every one of those bugs has the exact same shape: `try { setItem(...) }
   catch (e) {}`. This gate is that shape, caught mechanically instead of by
   the next audit finding it by hand a year later.

   Design: a store that's genuinely fine to fail silently still exists (a
   device-local preference, a random device id, a performance cache) — this
   is a RATCHET, same shape as tools/test-mc-units.js's fragmentation count
   and tools/check-a11y.mjs's touch-target ceiling: ALLOWED_SILENT is the
   complete, reasoned list of today's exceptions and may only shrink. A new
   empty-catch setItem() that isn't on it fails review, not silently ships.

   Method (deliberately not a real parser — see the reasoning below):
     1. Strip block-style ("slash-star ... star-slash") comments (safe: a
        block comment's opening delimiter never appears in a URL or any
        string literal in this codebase, so span-detection here can't
        false-positive) so a setItem(...) call quoted inside doc-comment
        prose (cookbook-home.js's own C-12 writeup does exactly this) is
        never mistaken for real code.
     2. For each remaining `localStorage.setItem(` call, find its innermost
        enclosing `try { }` by brace-matching, then find the `catch (e) { }`
        immediately following it.
     3. A catch body is "empty" once ALSO stripped of `//` line comments —
        using a `://`-aware heuristic (skip a `//` immediately preceded by
        `:`) so a Supabase https:// URL elsewhere on the same line can't be
        misread as starting a comment — and then trimmed of whitespace.
     4. A call with no enclosing try/catch at all is flagged as the same bug
        (a write with no failure handling whatsoever is worse than an empty
        catch, not better).

   This is a lint over real, known source files, not a general-purpose JS
   parser — it doesn't handle a `{`/`}` embedded in a string literal near one
   of these sites, which would throw off the brace count. None of the app's
   actual setItem call sites do that today (verified by hand against every
   hit this file currently finds); a future one that does would need a real
   AST-based rewrite, not a patch to this heuristic.

   Run: node tools/check-write-paths.js
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

// file -> first-argument text of a call whose empty catch is a deliberate,
// reasoned exception. Only ever consulted for a call this script actually
// flags (empty catch, or no catch at all) — see each entry's reasoning.
const ALLOWED_SILENT = [
  // Device-local preferences (CLAUDE.md's own "deliberately still not
  // synced" list) — losing one just means a toggle/size resets; the cook
  // can set it again in one tap, and nothing about their data changes.
  { file: 'cookbook-home.js', arg: 'OWNER_KEY' },
  { file: 'cookbook.js', arg: 'COOK_FONT_KEY' },
  { file: 'cookbook.js', arg: 'COOK_COUNTER_KEY' },
  // A bare ISO timestamp feeding the "Last backup: …" line — cosmetic;
  // losing it means the nudge fires a little early next time, nothing more.
  { file: 'mc-export.js', arg: 'BACKUP_KEY' },
  // One-time legacy-key migration (audit C-14, slated for deletion
  // 2027-01-08 per tracker-store.js's own header). Self-healing: a failure
  // here just means the migration is retried on the next load, and the
  // source data at OLD_KEY is left untouched either way — nothing is lost,
  // only deferred.
  { file: 'tracker-store.js', arg: 'KEY' },
  // A search-results cache keyed by query text — pure performance, not
  // data. A failed write just means the next identical search re-fetches
  // instead of hitting the cache.
  { file: 'tracker-foodapi.js', arg: 'CACHE_KEY' }
];

function stripBlockComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

// Is the localStorage.setItem(...) at `idx` itself commented out by a `//`
// earlier on the same line? Skips a `//` immediately preceded by `:` so
// `'https://...'` elsewhere on the line isn't mistaken for a comment start.
function isLineCommented(src, idx) {
  const lineStart = src.lastIndexOf('\n', idx) + 1;
  const line = src.slice(lineStart, idx);
  let search = 0;
  while (true) {
    const p = line.indexOf('//', search);
    if (p === -1) return false;
    if (line[p - 1] !== ':') return true;
    search = p + 2;
  }
}

function matchBrace(src, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) return i; }
  }
  return -1;
}

// Innermost try{...} whose body contains callIdx, or null.
function findEnclosingTry(src, callIdx) {
  const tryRe = /\btry\s*\{/g;
  let best = null, bestSpan = Infinity, m;
  while ((m = tryRe.exec(src))) {
    const openIdx = m.index + m[0].length - 1;
    if (openIdx > callIdx) continue;
    const closeIdx = matchBrace(src, openIdx);
    if (closeIdx === -1) continue;
    if (callIdx > openIdx && callIdx < closeIdx) {
      const span = closeIdx - openIdx;
      if (span < bestSpan) { bestSpan = span; best = { openIdx, closeIdx }; }
    }
  }
  return best;
}

function findCatchAfter(src, tryCloseIdx) {
  const rest = src.slice(tryCloseIdx + 1);
  const m = /^\s*catch\s*\([^)]*\)\s*\{/.exec(rest);
  if (!m) return null;
  const openIdx = tryCloseIdx + 1 + m[0].length - 1;
  const closeIdx = matchBrace(src, openIdx);
  if (closeIdx === -1) return null;
  return { openIdx, closeIdx };
}

function lineOf(src, idx) {
  return src.slice(0, idx).split('\n').length;
}

// First argument's raw text (up to the top-level comma), for allowlist
// matching — e.g. `OWNER_KEY` out of `setItem(OWNER_KEY, "1")`.
function firstArgText(src, callParenIdx) {
  let depth = 0;
  for (let i = callParenIdx; i < src.length; i++) {
    const ch = src[i];
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth--;
    else if (ch === ',' && depth === 1) return src.slice(callParenIdx + 1, i).trim();
  }
  return null;
}

function checkFile(file) {
  const abs = path.join(ROOT, file);
  const raw = fs.readFileSync(abs, 'utf8');
  const src = stripBlockComments(raw); // positions/newlines preserved
  const findings = [];

  const callRe = /localStorage\.setItem\s*\(/g;
  let m;
  while ((m = callRe.exec(src))) {
    const callIdx = m.index;
    if (isLineCommented(src, callIdx)) continue;

    const parenIdx = callIdx + m[0].length - 1;
    const arg = firstArgText(src, parenIdx);
    const tryBlock = findEnclosingTry(src, callIdx);

    let emptyCatch = true;
    if (tryBlock) {
      const catchBlock = findCatchAfter(src, tryBlock.closeIdx);
      if (catchBlock) {
        const body = src.slice(catchBlock.openIdx + 1, catchBlock.closeIdx);
        emptyCatch = body.trim().length === 0;
      }
      // A try with no catch at all (only possible with try/finally) is not
      // this bug's shape — leave it alone; `try` with a `finally` and no
      // `catch` still throws, which is loud, not silent.
      else emptyCatch = false;
    }
    // No enclosing try at all: an uncaught setItem() throws all the way up
    // — loud in the console, but still a raw QuotaExceededError with no
    // cook-facing message and (depending on the caller) a broken feature.
    // Flag it the same way; the allowlist can still clear a reasoned case.

    if (emptyCatch) {
      const allowed = ALLOWED_SILENT.some((a) => a.file === file && a.arg === arg);
      if (!allowed) {
        findings.push({ line: lineOf(raw, callIdx), arg: arg || '(unresolved)', hadTry: !!tryBlock });
      }
    }
  }
  return findings;
}

function main() {
  const tracked = execSync('git ls-files "*.js"', { cwd: ROOT, encoding: 'utf8' })
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    // tools/*.js are build/test scripts, not shipped app runtime — smoke-test.js
    // in particular plants localStorage fixtures inside page.evaluate() for
    // its own tests, which read exactly like an app write path to a text scan.
    .filter((f) => !f.startsWith('tools/'))
    // Generated/data files never call localStorage.setItem; skip for speed.
    .filter((f) => !/^recipes-(data|index|detail-\d+)\.js$/.test(f));

  let failures = 0;
  tracked.forEach((file) => {
    const findings = checkFile(file);
    findings.forEach((f) => {
      failures++;
      const reason = f.hadTry
        ? `empty catch around localStorage.setItem(${f.arg}, …) — a full quota fails with no signal to the cook`
        : `localStorage.setItem(${f.arg}, …) with no try/catch at all — an uncaught QuotaExceededError`;
      console.error(`::error file=${file},line=${f.line}::${reason}`);
    });
  });

  if (failures) {
    console.error(`\ncheck-write-paths: ${failures} silent write path(s) found. ` +
      `Either surface the failure (see mc-fav.js's onWriteFail pattern) or, ` +
      `if it's genuinely fine to lose (a device-local preference, a cache), ` +
      `add a reasoned entry to ALLOWED_SILENT in this file.`);
    process.exit(1);
  }
  console.log(`check-write-paths: all localStorage.setItem() call sites handle a full quota (checked ${tracked.length} files).`);
}

main();

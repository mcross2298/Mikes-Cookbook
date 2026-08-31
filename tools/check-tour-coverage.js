#!/usr/bin/env node
/* check-tour-coverage.js — C-I4, VOC/VOA Kaizen audit.
   ---------------------------------------------------------------------------
   Converts CLAUDE.md's "keep the Quick Tour current" rule from prose into a
   mechanism: every entry in features.js's MC_FEATURES array must be
   mentioned somewhere in quick-tour.html's real text, or this fails.

   Deliberately does NOT check quick-tour-overview.html (the Executive
   Summary) — features.js is a coverage contract for the tour specifically,
   per the audit's own initiative text ("asserting every registered screen
   appears in quick-tour.html"). The Executive Summary stays hand-authored,
   same reasoning as roadmap F6's reversal in the sibling workout app:
   forcing a second surface to render off the same array risks becoming a
   second, harder-to-edit copy rather than a single source of truth.

   A feature passes if AT LEAST ONE of its declared `keywords` appears
   (case-insensitive substring) anywhere in quick-tour.html's source ---
   the tour's own SLIDES text, not just visible strings, so eyebrow/title/
   narration/steps all count.

   Usage:
     node tools/check-tour-coverage.js          # report only, exit 0
     node tools/check-tour-coverage.js --check  # CI: exit 1 on any miss
*/
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHECK = process.argv.includes('--check');

function loadFeatures() {
  const src = fs.readFileSync(path.join(ROOT, 'features.js'), 'utf8');
  // features.js assigns window.MC_FEATURES = [...]; extract that array
  // literal without needing a DOM -- same technique this repo's other
  // vm-sandboxed test tools use for browser-only files.
  const sandbox = { window: {} };
  const vm = require('vm');
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  const features = sandbox.window.MC_FEATURES;
  if (!Array.isArray(features) || !features.length) {
    throw new Error('features.js did not produce a non-empty window.MC_FEATURES array');
  }
  return features;
}

function main() {
  const features = loadFeatures();
  const tourText = fs.readFileSync(path.join(ROOT, 'quick-tour.html'), 'utf8').toLowerCase();

  const missing = [];
  for (const f of features) {
    if (!f.id || !f.name || !Array.isArray(f.keywords) || !f.keywords.length) {
      throw new Error(`features.js entry is malformed (needs id, name, keywords[]): ${JSON.stringify(f)}`);
    }
    const covered = f.keywords.some((kw) => tourText.includes(String(kw).toLowerCase()));
    if (!covered) missing.push(f);
  }

  if (missing.length) {
    console.error(`\n${missing.length} feature(s) in features.js are not mentioned in quick-tour.html:\n`);
    for (const f of missing) {
      console.error(`  - ${f.id} (${f.name}) — none of [${f.keywords.join(', ')}] found`);
    }
    console.error('\nEither quick-tour.html needs a mention of this feature (CLAUDE.md\'s');
    console.error('Documentation currency rule), or the keyword list in features.js is stale.');
    if (CHECK) process.exit(1);
    return;
  }

  console.log(`check-tour-coverage: OK — ${features.length} registered feature(s), all mentioned in quick-tour.html.`);
}

main();

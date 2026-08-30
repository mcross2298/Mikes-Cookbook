#!/usr/bin/env node
/* Accessibility gate — renders every screen and standalone page and fails
   on a touch-target regression.

   Loosely ported from Cross-Household-'s scripts/check-a11y.mjs (VOC/VOA
   Kaizen audit, initiative C-I1) — same "measure, don't assume"
   philosophy, adapted to this app's shape: a hub-and-spoke shell
   (index.html#<screen>) plus standalone pages (recipe.html,
   collection.html, the Quick Tour) instead of a single hash-routed SPA, so
   the route list below is hand-maintained rather than parsed out of a
   routing table. Cooking Mode (recipe.html?...&cook=1) is deliberately its
   own route, not just something incidentally reached while walking
   recipe.html — it's the screen this gate exists for (wave 6 fixed three
   of its controls; this gate is what keeps them fixed).

   Touch targets only — no contrast check, unlike the finance apps'
   version. The source audit's own "Method & limits" section is explicit
   about why: this kind of session runs in a sandbox with webfonts blocked
   at the browser level, so "no contrast or visual ratchet was re-baselined
   here, and none should be" — a threshold tuned against sandbox rendering
   could read cleanly here and still be wrong against the real CI runner
   that will actually enforce it. Touch targets are unaffected (they come
   from explicit CSS px, not font metrics) so they're safe to gate now;
   contrast is left for a follow-up initiative that can baseline it from a
   real CI run instead of this sandbox.

   A raw getBoundingClientRect() on the element itself is the wrong
   measurement for this codebase, though. cookbook.css's own Phase 3 pass
   already gives several compact controls (the serving stepper, Cooking
   Mode's font/exit/voice/daylight buttons, the card heart/plan toggle) a
   real 44px+ hit area via a centered, invisible ::before — visual size
   unchanged, so the VISIBLE box stays under 44px on purpose. A gate that
   only reads the real element's box would report every one of those as
   broken the day it lands — a false failure on a control that's already
   fixed, which is worse than no gate at all (see the source audit's own
   W-I4 finding about a green gate measuring the wrong thing). So a
   control's effective size here is max(own box, its ::before's rendered
   box) when that ::before has real content and is absolutely positioned —
   which is exactly what the CSS pattern produces, no per-selector
   exemption list to keep in sync with it.

   Serves the repo itself, so there is nothing to start first.
   Run:  npm i --no-save playwright && npx playwright install --with-deps chromium
         node tools/check-a11y.mjs
   Set CHROMIUM_PATH to point at an existing browser build when running locally. */

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const PORT = +(process.env.PORT || 8098);
const ROOT = process.cwd();

/* Known-good exemptions, each with a reason and a numeric check — not just
   a class-name match, so an exemption can't accidentally hide a REAL
   regression that happens to share a class with an intentional one. */
const TARGET_EXEMPT = [
  {
    // The card heart/add-to-plan pair (cookbook.css's Phase 3 + wave-6
    // comment above the shared floor rule): stacked 40px apart center to
    // center, so each is deliberately capped to 40px tall (not the full
    // 44) to avoid a floor overlap that would steal the other's edge
    // taps. Excludes the recipe-page header pills (.r-fav/.r-plan), which
    // aren't part of that pair and have no such cap — a genuine miss on
    // those, or a plan-toggle that regresses back to having NO floor at
    // all (its pre-wave-6 shape, real 34x34 with nothing to catch it),
    // still fails: only the exact intentional 40x44 shape passes.
    match: /\b(fav|plan)-toggle\b/,
    ok: (t) => !/\br-(fav|plan)\b/.test(t.cls) && t.h >= 40 && t.w >= 44,
    why: 'card heart/add-to-plan pair capped to 40px tall by design — a full 44 floor on each would overlap its stacked sibling'
  }
];

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };

const server = createServer(async (req, res) => {
  try {
    const rel = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
    const file = join(ROOT, rel === '/' ? 'index.html' : rel);
    const body = await readFile(file);   // read first — writing headers before this
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(body);                       // makes a miss unrecoverable
  } catch { res.writeHead(404).end('not found'); }
});
await new Promise(r => server.listen(PORT, r));

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);

// Pick a real recipe/collection id from the live data rather than hardcoding
// one — the same approach tools/smoke-test.js already uses.
const idPage = await browser.newPage();
await idPage.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle' });
const sampleId = await idPage.evaluate(() => {
  const RE = /(\d+(?:\.\d+)?)\s*(hours?|hrs?|minutes?|mins?|seconds?|secs?)\b/i;
  const withTimer = window.RECIPES.find(r => (r.instructions || []).length &&
    RE.test((r.instructions[0] || {}).detail || ''));
  return (withTimer || window.RECIPES.find(r => (r.instructions || []).length)).recipe_id;
});
const sampleCollection = await idPage.evaluate(() =>
  window.COLLECTIONS.find(c => c.status === 'live').id);
await idPage.close();

// Hub-and-spoke shell screens (mirrored to location.hash — cookbook-home.js's
// setTab() reads it on init()), then the standalone pages. Cooking Mode is
// its own explicit entry, not folded into the recipe.html row above it.
const routes = [
  { name: 'shell#home',          url: '/index.html#home' },
  { name: 'shell#planner',       url: '/index.html#planner' },
  { name: 'shell#recipes',       url: '/index.html#recipes' },
  { name: 'shell#favorites',     url: '/index.html#favorites' },
  { name: 'shell#mikes',         url: '/index.html#mikes' },
  { name: 'shell#tracker',       url: '/index.html#tracker' },
  { name: 'recipe',              url: `/recipe.html?id=${sampleId}` },
  { name: 'recipe cooking-mode', url: `/recipe.html?id=${sampleId}&cook=1` },
  { name: 'collection',          url: `/collection.html?c=${sampleCollection}` },
  { name: 'quick-tour',          url: '/quick-tour.html' },
  { name: 'quick-tour-overview', url: '/quick-tour-overview.html' }
];

const failures = [];
const jsErrors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
page.on('pageerror', e => jsErrors.push(e.message));

for (const route of routes) {
  await page.goto(`http://localhost:${PORT}${route.url}`, { waitUntil: 'networkidle' });
  // Hash-only navigations within the shell don't re-run init(), and a fresh
  // load is what actually exercises setTab() reading location.hash — same
  // reload tools/smoke-test.js already relies on for this reason.
  if (route.url.includes('#')) await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(200);

  const targets = await page.evaluate(() => {
    const found = [];
    document.querySelectorAll('button,a[href],input,select,[role=button]').forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') return;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;

      // A control's effective hit area includes its own invisible ::before
      // floor when cookbook.css's Phase 3 pattern applies — see this
      // file's header comment.
      const before = getComputedStyle(el, '::before');
      const hasFloor = before.content !== 'none' && before.position === 'absolute';
      const effW = hasFloor ? Math.max(r.width, parseFloat(before.width) || 0) : r.width;
      const effH = hasFloor ? Math.max(r.height, parseFloat(before.height) || 0) : r.height;
      if (effH < 44 || effW < 44) {
        found.push({ cls: (el.className.toString() || el.tagName).slice(0, 40),
          h: Math.round(effH), w: Math.round(effW),
          label: (el.textContent || el.getAttribute('aria-label') || el.id || '').trim().slice(0, 30) });
      }
    });
    return found;
  });

  for (const t of targets) {
    if (TARGET_EXEMPT.some(e => e.match.test(t.cls) && (!e.ok || e.ok(t)))) continue;
    failures.push(`[target] ${route.name} .${t.cls} — ${t.h}x${t.w}px, needs 44 ("${t.label}")`);
  }
}
await ctx.close();

await browser.close();
server.close();

if (jsErrors.length) {
  console.error(`\ncheck-a11y: ${jsErrors.length} JS error(s) while walking the routes\n`);
  for (const e of new Set(jsErrors)) console.error('  • ' + e);
  console.error('');
  process.exit(1);
}

/* This is a ratchet, not a zero-tolerance gate (same shape as mc-units.js's
   corpus-fragmentation check): the fleet-wide VOC/VOA audit measured real
   under-floor controls across nearly every screen (topbar icons, the
   planner's segmented toggles, category chips, the tracker's own icon
   row…), and fixing all of them is much more than waves 6/8's scope. This
   gate's job is narrower — be the first thing in this repo that can even
   SEE a touch-target regression, and make sure it can never regress past
   today's count. KNOWN_FAILURES is that count, recorded on the tree wave 6
   left behind; it may only fall from here, never rise. A jump above it
   (e.g. wave 6's Cooking Mode fix, or the exemption above, silently
   regressing) fails the build; a drop is fine without touching this
   number — nothing here enforces the exact count stays in sync. */
const KNOWN_FAILURES = 84;

const unique = [...new Set(failures)];
console.log(`check-a11y: ${unique.length} touch-target problem(s) across ${routes.length} routes ` +
  `(ratchet ceiling: ${KNOWN_FAILURES})`);
for (const f of unique) console.log('  • ' + f);
if (unique.length > KNOWN_FAILURES) {
  console.error(`\ncheck-a11y: ${unique.length} exceeds the recorded ceiling of ${KNOWN_FAILURES} — ` +
    'a control regressed under the 44px floor. Fix it, or if it\'s a deliberate, reasoned ' +
    'exception, add it to TARGET_EXEMPT above rather than raising this number.\n');
  process.exit(1);
}
console.log('check-a11y: within the ratchet ceiling, no JS errors.');

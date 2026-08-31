#!/usr/bin/env node
'use strict';
/* ==========================================================================
   test-manifest.js — Gate 18. PWA manifest + icon correctness, pure file
   reads and byte checks, no browser.

   Exists because the "runtime invisibles" audit (2026-08-31) found the
   manifest had shipped with defects only a real install ever surfaces:

     - apple-touch-icon pointed at icon.svg. iOS ignores SVG for the home
       screen icon entirely and falls back to a screenshot of the page —
       there is no error, no console warning, nothing to catch by opening
       the app in a browser. The only way to notice is installing on an
       actual iPhone.
     - manifest.json's icons[] had no maskable entry and no raster ≥512px,
       so an Android install could letterbox the icon under an adaptive-icon
       mask.
     - manifest.json had no "id", so a future start_url change would orphan
       every existing install.

   That feedback loop — install on a real device, notice, fix, redeploy,
   reinstall to confirm — is the slowest one in this project. Everything
   this file checks is knowable from bytes on disk in milliseconds; the
   real-device check stays diagnostics.html's job (see its own header),
   this just keeps a REGRESSION here from ever reaching that slow loop again.

   Run: node tools/test-manifest.js
   ========================================================================== */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;
function ok(name, cond) { if (cond) { pass++; } else { fail++; console.error('::error::' + name); } }

function readJSON(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
}
function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}
// A real PNG, not just a plausible extension — checks the 8-byte signature
// every PNG file starts with, so a truncated/corrupt/mislabeled file (e.g.
// an SVG saved with a .png extension by mistake) is still caught.
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
function isRealPNG(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return false;
  const fd = fs.openSync(abs, 'r');
  const buf = Buffer.alloc(8);
  fs.readSync(fd, buf, 0, 8, 0);
  fs.closeSync(fd);
  return buf.equals(PNG_SIGNATURE);
}
// Reads a PNG's IHDR chunk (always the first chunk, always 13 bytes of data
// starting at byte 16) for its real pixel dimensions, rather than trusting
// the filename or the manifest's own "sizes" claim.
function pngDimensions(rel) {
  const abs = path.join(ROOT, rel);
  const fd = fs.openSync(abs, 'r');
  const buf = Buffer.alloc(24);
  fs.readSync(fd, buf, 0, 24, 0);
  fs.closeSync(fd);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

const manifest = readJSON('manifest.json');

// ---- manifest.json structure ----------------------------------------------
ok('manifest has an "id" (so a future start_url change can\'t orphan an existing install)',
  typeof manifest.id === 'string' && manifest.id.length > 0);

ok('manifest icons[] is a non-empty array', Array.isArray(manifest.icons) && manifest.icons.length > 0);

const maskable = (manifest.icons || []).find((i) => String(i.purpose || '').split(/\s+/).includes('maskable'));
ok('manifest icons[] has a maskable entry', !!maskable);
if (maskable) {
  ok('the maskable icon\'s src resolves to a real file on disk', exists(maskable.src));
  if (exists(maskable.src)) {
    ok('the maskable icon is a real PNG (signature check, not just the extension)', isRealPNG(maskable.src));
    if (isRealPNG(maskable.src)) {
      const dim = pngDimensions(maskable.src);
      ok('the maskable icon is at least 512x512 (declared: ' + maskable.sizes + ', actual: ' + dim.width + 'x' + dim.height + ')',
        dim.width >= 512 && dim.height >= 512);
      ok('the maskable icon\'s declared "sizes" matches its real dimensions',
        maskable.sizes === dim.width + 'x' + dim.height);
    }
  }
}

const anyRaster512 = (manifest.icons || []).some((i) => {
  if (String(i.purpose || 'any').split(/\s+/).indexOf('any') === -1) return false;
  if (!/^image\/png$/.test(i.type || '')) return false;
  const m = /^(\d+)x(\d+)$/.exec(i.sizes || '');
  return m && +m[1] >= 512 && +m[2] >= 512;
});
ok('manifest icons[] has at least one ≥512px PNG raster with purpose "any" (an SVG-only icon set relies on every install surface supporting SVG, which not all do)',
  anyRaster512);

// ---- apple-touch-icon across every page ------------------------------------
// iOS Safari ignores an SVG apple-touch-icon outright and falls back to a
// screenshot of the page as the home-screen icon — this is the exact defect
// the audit found, and it produces no error anywhere a browser DevTools
// console would show it.
const htmlFiles = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
ok('at least one HTML page found to check', htmlFiles.length > 0);

htmlFiles.forEach((file) => {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const m = /<link\s+rel="apple-touch-icon"\s+href="([^"]+)"\s*\/?>/.exec(html);
  ok(file + ': has an apple-touch-icon link', !!m);
  if (!m) return;
  const href = m[1];
  ok(file + ': apple-touch-icon is not an .svg (iOS ignores SVG touch icons)', !/\.svg$/i.test(href));
  ok(file + ': apple-touch-icon href resolves to a real file on disk', exists(href));
  if (exists(href) && /\.png$/i.test(href)) {
    ok(file + ': apple-touch-icon is a real PNG (signature check)', isRealPNG(href));
  }
});

// ---- theme-color: every page carries both the light and dark variant ------
// The manifest's own theme_color/background_color are static (a PWA
// manifest can't be conditional), so the light/dark split has to live in
// each page's own <meta name="theme-color"> pair — one page missing the
// light variant means a light-mode Safari/Chrome tab shows the dark chrome
// color instead of matching the app's own light theme.
htmlFiles.forEach((file) => {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const dark = /<meta\s+name="theme-color"[^>]*media="\(prefers-color-scheme:\s*dark\)"/.test(html);
  const light = /<meta\s+name="theme-color"[^>]*media="\(prefers-color-scheme:\s*light\)"/.test(html);
  ok(file + ': has both a dark and a light theme-color meta', dark && light);
});

if (fail) { console.error(`\ntest-manifest: ${pass} passed, ${fail} FAILED`); process.exit(1); }
console.log(`test-manifest: all ${pass} assertions passed (${htmlFiles.length} HTML pages checked)`);

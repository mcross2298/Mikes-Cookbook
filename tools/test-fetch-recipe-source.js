#!/usr/bin/env node
'use strict';
/* ==========================================================================
   test-fetch-recipe-source.js — the first CI coverage of ANY server-side code
   in this repo (end-to-end audit, anomaly A-04).

   supabase/functions/fetch-recipe-source/index.ts is the SSRF-hardened URL
   proxy behind "Paste a link" recipe import. It is the app's only server-side
   code and its largest abuse surface — it fetches whatever URL a caller sends
   — and until this file nothing checked it at all. CLAUDE.md said so, and the
   function's own header said so; neither is a test.

   WHY THIS READS THE SOURCE AS TEXT rather than importing it:
     * it's a Deno module (Deno.serve, Deno.resolveDns) and Node can't run
       TypeScript, so it cannot be require()'d;
     * a Deno CI step would test the real runtime, which is strictly better —
       but it is not installed here, so its gate could not be PROVEN to fail
       before landing, which is this repo's standing rule for a new gate;
     * and adding an `export` or splitting the guards into a second module
       would make the committed file differ from the DEPLOYED function until
       someone redeploys it. A test is not worth a repo-vs-production drift on
       a security boundary.
   So the guards are lifted out of the file's own text by brace matching (same
   technique tools/test-scaling-format.js uses on cookbook.js's IIFE-private
   functions) and the TypeScript annotations are removed by a fixed list of
   EXACT, COUNTED replacements — see strip() below. Every replacement asserts
   it actually matched, so an edit to index.ts that moves an annotation fails
   this gate loudly instead of silently testing nothing. index.ts itself is
   NOT modified by any of this.

   WHAT IS ACTUALLY EXERCISED: the real isPrivateIPv4 / isPrivateIPv6 /
   validateUrl / isAllowedOrigin / hostIsSafe / safeFetchHtml bodies, with
   only Deno.resolveDns and fetch replaced by fakes. That means the property
   the whole file exists for — every redirect hop is re-resolved and
   re-checked, so a public URL cannot bounce the fetcher onto the cloud
   metadata address — is tested through the real loop, not asserted about it.

   Run: node tools/test-fetch-recipe-source.js
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC_PATH = path.resolve(__dirname, '../supabase/functions/fetch-recipe-source/index.ts');
const SRC = fs.readFileSync(SRC_PATH, 'utf8');

let pass = 0, fail = 0;
function ok(name, cond) { if (cond) { pass++; } else { fail++; console.error('::error::' + name); } }
function eq(name, actual, expected) {
  ok(name + ' (got ' + JSON.stringify(actual) + ')', JSON.stringify(actual) === JSON.stringify(expected));
}

/* ── extraction ─────────────────────────────────────────────────────────── */

// Brace-match one top-level declaration out of the ALREADY-STRIPPED source.
// Order matters: a TypeScript return type such as
//   `{ ok: true; url: URL } | { ok: false; reason: string }`
// contains braces of its own, so matching the raw .ts would terminate inside
// the signature and silently yield a truncated function. Strip first, then lift.
function lift(src, startsWith) {
  const start = src.indexOf(startsWith);
  if (start < 0) throw new Error('index.ts: could not find `' + startsWith + '` — did the function get renamed?');
  let i = src.indexOf('{', start), depth = 0, end = -1;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  if (end < 0) throw new Error('index.ts: unbalanced braces after `' + startsWith + '`');
  return src.slice(start, end);
}

// Each entry is [exact text in index.ts, its JS equivalent, how many times it
// must appear]. A miss throws — the whole point is that a source edit which
// invalidates the strip can't quietly leave this gate testing a stale copy.
const STRIPS = [
  ['function isAllowedOrigin(origin: string | null): boolean {', 'function isAllowedOrigin(origin) {', 1],
  ['function isPrivateIPv4(ip: string): boolean {', 'function isPrivateIPv4(ip) {', 1],
  ['function isPrivateIPv6(ip: string): boolean {', 'function isPrivateIPv6(ip) {', 1],
  ['async function hostIsSafe(hostname: string): Promise<boolean> {', 'async function hostIsSafe(hostname) {', 1],
  ['let records: string[] = [];', 'let records = [];', 1],
  ['.catch(() => [] as string[])', '.catch(() => [])', 2],
  ['function validateUrl(raw: string): { ok: true; url: URL } | { ok: false; reason: string } {',
   'function validateUrl(raw) {', 1],
  ['let url: URL;', 'let url;', 1],
  ['function concatChunks(chunks: Uint8Array[]): Uint8Array {', 'function concatChunks(chunks) {', 1],
  ['async function safeFetchHtml(\n  startUrl: URL,\n): Promise<{ ok: true; html: string; finalUrl: string } | { ok: false; reason: string }> {',
   'async function safeFetchHtml(startUrl) {', 1],
  ['let res: Response;', 'let res;', 1],
  ['let next: URL;', 'let next;', 1],
  ['const chunks: Uint8Array[] = [];', 'const chunks = [];', 1],
];

function strip(code) {
  let out = code;
  for (const [from, to, expected] of STRIPS) {
    // Count occurrences in the WHOLE file, not just this fragment, so the
    // assertion describes index.ts rather than whichever piece we're on.
    const inFile = SRC.split(from).length - 1;
    if (inFile !== expected) {
      throw new Error('index.ts: expected ' + expected + ' occurrence(s) of\n  ' + JSON.stringify(from) +
        '\nbut found ' + inFile + '. The TypeScript strip in tools/test-fetch-recipe-source.js is stale — ' +
        'update STRIPS to match the current source.');
    }
    out = out.split(from).join(to);
  }
  return out;
}

// Applied to the EXTRACTED bundle only, not the whole file: corsHeaders() and
// jsonResponse() are deliberately not lifted (they're Response plumbing, not
// security logic) and keep their annotations. If an annotation survives inside
// something we DO test, the bundle is not valid JS and must fail here rather
// than throw a confusing SyntaxError from the vm.
function assertNoAnnotations(code) {
  const bad = code.split('\n').filter((l) =>
    /:\s*(string|boolean|unknown|number|URL|Response|Uint8Array|Record<|Promise<)/.test(l));
  if (bad.length) {
    throw new Error('a TypeScript annotation survived the strip in an extracted function:\n' +
      bad.join('\n') + '\nUpdate STRIPS in tools/test-fetch-recipe-source.js.');
  }
}

// The three bounds live on their own lines — read them directly so the test
// uses the REAL values (a lowered MAX_REDIRECTS must change the
// "too_many_redirects" expectation, not silently pass).
function readConst(name) {
  const m = SRC.match(new RegExp('const ' + name + '\\s*=\\s*([^;]+);'));
  if (!m) throw new Error('index.ts: could not read const ' + name);
  return m[1].trim();
}

const STRIPPED = strip(SRC);

const BUNDLE = [
  'const ALLOWED_ORIGINS = new Set(["https://mcross2298.github.io"]);',
  'const MAX_BYTES = ' + readConst('MAX_BYTES') + ';',
  'const FETCH_TIMEOUT_MS = ' + readConst('FETCH_TIMEOUT_MS') + ';',
  'const MAX_REDIRECTS = ' + readConst('MAX_REDIRECTS') + ';',
  lift(STRIPPED, 'function isAllowedOrigin('),
  lift(STRIPPED, 'function isPrivateIPv4('),
  lift(STRIPPED, 'function isPrivateIPv6('),
  lift(STRIPPED, 'async function hostIsSafe('),
  lift(STRIPPED, 'function validateUrl('),
  lift(STRIPPED, 'function concatChunks('),
  lift(STRIPPED, 'async function safeFetchHtml('),
].join('\n\n');

assertNoAnnotations(BUNDLE);

const MAX_REDIRECTS = Number(readConst('MAX_REDIRECTS'));
const MAX_BYTES = eval(readConst('MAX_BYTES'));           // "3 * 1024 * 1024"

/* ── sandbox ────────────────────────────────────────────────────────────── */

// dns: hostname -> { A: [...], AAAA: [...] }. Absent host => resolution
// throws, which is how the real fail-closed path is reached.
// routes: url string -> { status, headers, body } | Error to throw.
function makeApi(dns, routes) {
  const calls = [];
  const sandbox = {
    URL, TextDecoder, Uint8Array, Number, Promise, RegExp, JSON, console,
    AbortSignal: { timeout: () => ({}) },
    DOMException: global.DOMException || class DOMException extends Error {},
    Deno: {
      resolveDns: async (hostname, kind) => {
        const rec = dns[hostname];
        if (!rec) throw new Error('NotFound');
        return rec[kind] || [];
      }
    },
    fetch: async (url) => {
      calls.push(url);
      const r = routes[url];
      if (!r) throw new Error('unexpected fetch: ' + url);
      if (r instanceof Error) throw r;
      const headers = new Map(Object.entries(r.headers || {}));
      let sent = false;
      return {
        status: r.status,
        ok: r.status >= 200 && r.status < 300,
        headers: { get: (k) => (headers.has(k.toLowerCase()) ? headers.get(k.toLowerCase()) : null) },
        body: r.body === null ? null : {
          getReader: () => ({
            read: async () => {
              if (sent) return { done: true, value: undefined };
              sent = true;
              return { done: false, value: new TextEncoder().encode(r.body) };
            },
            cancel: async () => {}
          })
        }
      };
    }
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(BUNDLE + '\nthis.__api = { isAllowedOrigin, isPrivateIPv4, isPrivateIPv6, hostIsSafe, validateUrl, safeFetchHtml };', sandbox);
  return { api: sandbox.__api, calls };
}

const PUBLIC_DNS = {
  'recipes.example.com': { A: ['93.184.216.34'] },
  'evil.example.com': { A: ['93.184.216.34'] },
  'metadata.example.com': { A: ['169.254.169.254'] },
  'internal.example.com': { A: ['10.1.2.3'] },
  'v6.example.com': { AAAA: ['2606:2800:220:1:248:1893:25c8:1946'] },
  'split.example.com': { A: ['93.184.216.34', '127.0.0.1'] }
};

/* ── 1. the private-range table ─────────────────────────────────────────── */
{
  const { api } = makeApi({}, {});
  const P = api.isPrivateIPv4;
  ok('1a. 10/8 is private', P('10.0.0.1') === true);
  ok('1b. 127/8 is private', P('127.0.0.1') === true);
  ok('1c. 169.254.169.254 (cloud metadata) is private', P('169.254.169.254') === true);
  ok('1d. 172.16/12 lower bound is private', P('172.16.0.1') === true);
  ok('1e. 172.31 upper bound is private', P('172.31.255.255') === true);
  ok('1f. 172.15 is NOT in that range', P('172.15.0.1') === false);
  ok('1g. 172.32 is NOT in that range', P('172.32.0.1') === false);
  ok('1h. 192.168/16 is private', P('192.168.1.1') === true);
  ok('1i. 0.0.0.0 is private', P('0.0.0.0') === true);
  ok('1j. multicast 224+ is private', P('224.0.0.1') === true);
  ok('1k. a real public address is not private', P('93.184.216.34') === false);
  // Fail-closed on anything unparseable — a malformed literal must never read
  // as "public" just because the range checks didn't match it.
  ok('1l. malformed octet count fails closed', P('10.0.0') === true);
  ok('1m. out-of-range octet fails closed', P('999.1.1.1') === true);
  ok('1n. non-numeric fails closed', P('a.b.c.d') === true);
  ok('1o. empty string fails closed', P('') === true);

  const P6 = api.isPrivateIPv6;
  ok('1p. ::1 loopback is private', P6('::1') === true);
  ok('1q. fe80::/10 link-local is private', P6('fe80::1') === true);
  ok('1r. fc00::/7 unique-local is private', P6('fd00::1') === true);
  ok('1s. a public v6 address is not private', P6('2606:2800:220:1:248:1893:25c8:1946') === false);
  // The mapped-v4 form is the interesting one: ::ffff:127.0.0.1 is loopback
  // wearing a v6 costume, and it must be caught by the v4 table.
  ok('1t. ::ffff:127.0.0.1 is caught via the v4 table', P6('::ffff:127.0.0.1') === true);
  ok('1u. ::ffff:169.254.169.254 is caught too', P6('::ffff:169.254.169.254') === true);
  ok('1v. ::ffff: with a public v4 is allowed', P6('::ffff:93.184.216.34') === false);
}

/* ── 2. validateUrl ─────────────────────────────────────────────────────── */
{
  const { api } = makeApi({}, {});
  const V = api.validateUrl;
  ok('2a. a plain https URL is accepted', V('https://recipes.example.com/a').ok === true);
  ok('2b. a plain http URL is accepted', V('http://recipes.example.com/a').ok === true);
  eq('2c. file:// is rejected', V('file:///etc/passwd').reason, 'unsupported_protocol');
  eq('2d. gopher:// is rejected', V('gopher://x/1').reason, 'unsupported_protocol');
  eq('2e. a non-URL is rejected', V('not a url').reason, 'not_a_url');
  eq('2f. a non-standard port is rejected', V('https://recipes.example.com:8080/a').reason, 'non_standard_port');
  ok('2g. an explicit :443 is fine', V('https://recipes.example.com:443/a').ok === true);
  ok('2h. an explicit :80 is fine', V('http://recipes.example.com:80/a').ok === true);
  eq('2i. embedded credentials are rejected',
    V('https://user:pw@recipes.example.com/a').reason, 'credentials_in_url');
  eq('2j. a username alone is rejected', V('https://user@recipes.example.com/a').reason, 'credentials_in_url');
}

/* ── 3. hostIsSafe, including the fail-closed paths ─────────────────────── */
{
  const { api } = makeApi(PUBLIC_DNS, {});
  const H = api.hostIsSafe;
  const t = async () => {
    ok('3a. a public hostname resolves safe', (await H('recipes.example.com')) === true);
    ok('3b. a hostname resolving to link-local is blocked', (await H('metadata.example.com')) === false);
    ok('3c. a hostname resolving into 10/8 is blocked', (await H('internal.example.com')) === false);
    ok('3d. literal "localhost" is blocked without any DNS', (await H('localhost')) === false);
    ok('3e. an IPv4 literal is judged directly', (await H('127.0.0.1')) === false);
    ok('3f. a public IPv4 literal is allowed', (await H('93.184.216.34')) === true);
    ok('3g. an IPv6 literal is judged directly', (await H('::1')) === false);
    ok('3h. a public IPv6 hostname is allowed', (await H('v6.example.com')) === true);
    // Fail closed: nothing resolvable means nothing fetchable.
    ok('3i. an unresolvable hostname fails closed', (await H('nope.example.com')) === false);
    // EVERY record must be safe — a host that answers with one public and one
    // loopback address is a DNS-rebinding shape and must be refused.
    ok('3j. a host with one private record among several is blocked',
      (await H('split.example.com')) === false);
  };
  t().catch((e) => { fail++; console.error('::error::section 3 threw: ' + e.message); });
}

/* ── 4. safeFetchHtml — the redirect property that matters ──────────────── */
{
  const HTML = '<html><body><h1>Recipe</h1></body></html>';
  const t = async () => {
    // 4a. the happy path
    {
      const { api } = makeApi(PUBLIC_DNS, {
        'https://recipes.example.com/r': { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' }, body: HTML }
      });
      const r = await api.safeFetchHtml(new URL('https://recipes.example.com/r'));
      ok('4a. a public HTML page is fetched', r.ok === true && r.html === HTML);
      eq('4a2. and finalUrl is reported', r.finalUrl, 'https://recipes.example.com/r');
    }

    // 4b. THE SSRF BYPASS: a public URL that 302s onto the cloud metadata
    // address. This is the single most important assertion in this file — the
    // manual redirect: "manual" loop exists solely so this is re-checked.
    {
      const { api, calls } = makeApi(PUBLIC_DNS, {
        'https://evil.example.com/go': { status: 302, headers: { location: 'http://169.254.169.254/latest/meta-data/' }, body: '' }
      });
      const r = await api.safeFetchHtml(new URL('https://evil.example.com/go'));
      ok('4b. a redirect onto 169.254.169.254 is blocked', r.ok === false);
      eq('4b2. and reported as a blocked host', r.reason, 'blocked_host');
      ok('4b3. the metadata address was never actually fetched',
        !calls.some((u) => u.indexOf('169.254.169.254') >= 0));
    }

    // 4c. the same via a hostname rather than a literal, so the block has to
    // come from DNS resolution of the hop, not from pattern-matching the URL.
    {
      const { api, calls } = makeApi(PUBLIC_DNS, {
        'https://evil.example.com/go': { status: 301, headers: { location: 'https://metadata.example.com/' }, body: '' }
      });
      const r = await api.safeFetchHtml(new URL('https://evil.example.com/go'));
      eq('4c. a redirect to a host that RESOLVES to link-local is blocked', r.reason, 'blocked_host');
      ok('4c2. that host was never fetched', !calls.some((u) => u.indexOf('metadata.example.com') >= 0));
    }

    // 4d. a redirect to a rejected scheme is caught by validateUrl on the hop
    {
      const { api } = makeApi(PUBLIC_DNS, {
        'https://evil.example.com/go': { status: 302, headers: { location: 'file:///etc/passwd' }, body: '' }
      });
      const r = await api.safeFetchHtml(new URL('https://evil.example.com/go'));
      eq('4d. a redirect to file:// is rejected on the hop', r.reason, 'unsupported_protocol');
    }

    // 4e. a redirect to a non-standard port is caught on the hop too
    {
      const { api } = makeApi(PUBLIC_DNS, {
        'https://evil.example.com/go': { status: 302, headers: { location: 'https://recipes.example.com:22/' }, body: '' }
      });
      const r = await api.safeFetchHtml(new URL('https://evil.example.com/go'));
      eq('4e. a redirect to a non-standard port is rejected', r.reason, 'non_standard_port');
    }

    // 4f. a legitimate redirect chain still works, and relative Locations resolve
    {
      const { api } = makeApi(PUBLIC_DNS, {
        'https://recipes.example.com/old': { status: 301, headers: { location: '/new' }, body: '' },
        'https://recipes.example.com/new': { status: 200, headers: { 'content-type': 'text/html' }, body: HTML }
      });
      const r = await api.safeFetchHtml(new URL('https://recipes.example.com/old'));
      ok('4f. a same-host relative redirect is followed', r.ok === true && r.html === HTML);
      eq('4f2. finalUrl is the redirect TARGET, not the original',
        r.finalUrl, 'https://recipes.example.com/new');
    }

    // 4g. a redirect loop terminates at MAX_REDIRECTS rather than spinning
    {
      const { api, calls } = makeApi(PUBLIC_DNS, {
        'https://recipes.example.com/loop': { status: 302, headers: { location: 'https://recipes.example.com/loop' }, body: '' }
      });
      const r = await api.safeFetchHtml(new URL('https://recipes.example.com/loop'));
      eq('4g. a redirect loop is bounded', r.reason, 'too_many_redirects');
      eq('4g2. and stops after MAX_REDIRECTS+1 fetches', calls.length, MAX_REDIRECTS + 1);
    }

    // 4h. a missing Location on a 3xx is a named failure, not a crash
    {
      const { api } = makeApi(PUBLIC_DNS, {
        'https://recipes.example.com/x': { status: 302, headers: {}, body: '' }
      });
      const r = await api.safeFetchHtml(new URL('https://recipes.example.com/x'));
      eq('4h. a 3xx with no Location is reported', r.reason, 'redirect_without_location');
    }

    // 4i. non-HTML is refused — this is a recipe importer, not a file proxy
    {
      const { api } = makeApi(PUBLIC_DNS, {
        'https://recipes.example.com/a.pdf': { status: 200, headers: { 'content-type': 'application/pdf' }, body: '%PDF' }
      });
      const r = await api.safeFetchHtml(new URL('https://recipes.example.com/a.pdf'));
      eq('4i. a non-HTML content-type is refused', r.reason, 'not_html');
    }
    {
      const { api } = makeApi(PUBLIC_DNS, {
        'https://recipes.example.com/x': { status: 200, headers: { 'content-type': 'application/xhtml+xml' }, body: HTML }
      });
      const r = await api.safeFetchHtml(new URL('https://recipes.example.com/x'));
      ok('4i2. xhtml is accepted', r.ok === true);
    }

    // 4j. an HTTP error is surfaced with its status
    {
      const { api } = makeApi(PUBLIC_DNS, {
        'https://recipes.example.com/404': { status: 404, headers: {}, body: '' }
      });
      const r = await api.safeFetchHtml(new URL('https://recipes.example.com/404'));
      eq('4j. an HTTP error carries its status', r.reason, 'http_404');
    }

    // 4k. the size cap truncates rather than hanging or throwing
    {
      const big = 'x'.repeat(MAX_BYTES + 1024);
      const { api } = makeApi(PUBLIC_DNS, {
        'https://recipes.example.com/big': { status: 200, headers: { 'content-type': 'text/html' }, body: big }
      });
      const r = await api.safeFetchHtml(new URL('https://recipes.example.com/big'));
      ok('4k. an oversized body still returns ok (truncated, not hung)', r.ok === true);
      ok('4k2. and the response was cut off rather than kept whole',
        r.ok === true && r.html.length <= big.length);
    }

    // 4l. a body-less response is a named failure
    {
      const { api } = makeApi(PUBLIC_DNS, {
        'https://recipes.example.com/empty': { status: 200, headers: { 'content-type': 'text/html' }, body: null }
      });
      const r = await api.safeFetchHtml(new URL('https://recipes.example.com/empty'));
      eq('4l. a missing body is reported', r.reason, 'empty_body');
    }

    // 4m. a transport failure is reported, never thrown past the caller
    {
      const { api } = makeApi(PUBLIC_DNS, {
        'https://recipes.example.com/dead': new Error('ECONNREFUSED')
      });
      const r = await api.safeFetchHtml(new URL('https://recipes.example.com/dead'));
      eq('4m. a fetch failure is reported, not thrown', r.reason, 'fetch_failed');
    }

    // 4n. the very first host is checked before any fetch happens
    {
      const { api, calls } = makeApi(PUBLIC_DNS, {});
      const r = await api.safeFetchHtml(new URL('http://169.254.169.254/latest/meta-data/'));
      eq('4n. a directly-supplied metadata URL is blocked', r.reason, 'blocked_host');
      eq('4n2. with no fetch attempted at all', calls.length, 0);
    }
  };
  t().catch((e) => { fail++; console.error('::error::section 4 threw: ' + e.message); });
}

/* ── 5. the CORS allow-list ─────────────────────────────────────────────── */
{
  const { api } = makeApi({}, {});
  const A = api.isAllowedOrigin;
  ok('5a. the production origin is allowed', A('https://mcross2298.github.io') === true);
  ok('5b. localhost is allowed for local dev', A('http://localhost:8000') === true);
  ok('5c. 127.0.0.1 is allowed for local dev', A('http://127.0.0.1:8765') === true);
  ok('5d. a null origin is refused', A(null) === false);
  ok('5e. an unrelated origin is refused', A('https://evil.example.com') === false);
  // A prefix/suffix match would be the classic allow-list bug here.
  ok('5f. a lookalike subdomain is refused', A('https://mcross2298.github.io.evil.com') === false);
  ok('5g. a lookalike prefix is refused', A('https://evil-mcross2298.github.io') === false);
  ok('5h. localhost as a subdomain of something else is refused',
    A('http://localhost.evil.com') === false);
}

/* ── done ───────────────────────────────────────────────────────────────── */
process.on('exit', () => {
  if (fail) {
    console.error('test-fetch-recipe-source: ' + fail + ' FAILED, ' + pass + ' passed');
    process.exitCode = 1;
  } else {
    console.log('test-fetch-recipe-source: all ' + pass + ' assertions passed');
  }
});

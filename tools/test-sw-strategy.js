#!/usr/bin/env node
'use strict';
/* ==========================================================================
   test-sw-strategy.js — LS-4 (audit W-12) regression test for sw.js's
   stale-while-revalidate HTML strategy, run against the REAL source.

   sw.js self-activates and registers its handlers on the SW global, so it
   can't be required() directly. This sandboxes the real file with `vm` (the
   same technique as tools/test-mc-bridge.js), captures the actual 'fetch'
   listener, and drives it with a fake navigation FetchEvent plus a fake
   fetch/caches — asserting the four cases that matter:

     1. cache HIT            -> serve cache instantly; refresh cache behind
     2. cache MISS, net OK   -> serve network; populate cache
     3. cache MISS, net FAIL -> fall back to the app shell (./index.html)
     4. cache HIT, net FAIL  -> still serve cache instantly (no throw)

   Offline reload on the real SW still wants a device check on the deployed
   origin (see the audit's LS-4 note) — this covers the branch logic.
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
const key = req => (typeof req === 'string' ? req : (req && req.url) || String(req));

let checks = 0, failures = 0;
function assert(cond, msg) { checks++; if (!cond) { failures++; console.error('  ✗ ' + msg); } }
const flush = () => new Promise(r => setImmediate(r));

function loadFetchHandler(fetchImpl, store) {
    const listeners = {};
    const sandbox = {
        self: { addEventListener: (t, fn) => { listeners[t] = fn; }, registration: {}, clients: {}, skipWaiting() {} },
        caches: {
            open: async () => ({ put: async (req, resp) => { store.set(key(req), resp); } }),
            match: async req => store.get(key(req)),
            keys: async () => [], delete: async () => true,
        },
        fetch: fetchImpl,
        Response: class { constructor(b, i) { this.body = b; this.status = (i && i.status) || 200; } clone() { return this; } },
        setTimeout, clearTimeout, console,
    };
    vm.createContext(sandbox);
    vm.runInContext(SRC, sandbox, { filename: 'sw.js' });
    if (typeof listeners.fetch !== 'function') { console.error('FAIL: no fetch listener registered'); process.exit(1); }
    return listeners.fetch;
}

// A navigation request + a fake FetchEvent that captures respondWith/waitUntil.
function navEvent(url) {
    const req = { method: 'GET', mode: 'navigate', url, headers: { get: () => 'text/html' } };
    const ev = { request: req, respondWith(p) { this._resp = p; }, waitUntil(p) { this._wait = p; } };
    return ev;
}
const netResp = tag => ({ status: 200, tag, clone() { return this; } });

(async () => {
    // 1. cache HIT
    {
        const store = new Map([['/p', { tag: 'CACHED' }]]);
        const fn = loadFetchHandler(async () => netResp('NET'), store);
        const ev = navEvent('/p'); fn(ev);
        const r = await ev._resp;
        assert(r && r.tag === 'CACHED', '1: cache hit serves cached page instantly');
        if (ev._wait) await ev._wait; await flush();
        assert(store.get('/p').tag === 'NET', '1: cache refreshed to network copy behind');
    }
    // 2. cache MISS, network OK
    {
        const store = new Map();
        const fn = loadFetchHandler(async () => netResp('NET'), store);
        const ev = navEvent('/q'); fn(ev);
        const r = await ev._resp;
        assert(r && r.tag === 'NET', '2: cache miss serves network');
        if (ev._wait) await ev._wait; await flush();
        assert(store.get('/q') && store.get('/q').tag === 'NET', '2: network page cached');
    }
    // 3. cache MISS, network FAIL -> app shell
    {
        const store = new Map([['./index.html', { tag: 'SHELL' }]]);
        const fn = loadFetchHandler(async () => { throw new Error('offline'); }, store);
        const ev = navEvent('/r'); fn(ev);
        const r = await ev._resp;
        assert(r && r.tag === 'SHELL', '3: cache miss + net fail falls back to app shell');
    }
    // 4. cache HIT, network FAIL
    {
        const store = new Map([['/s', { tag: 'CACHED' }]]);
        const fn = loadFetchHandler(async () => { throw new Error('offline'); }, store);
        const ev = navEvent('/s'); fn(ev);
        const r = await ev._resp;
        assert(r && r.tag === 'CACHED', '4: cache hit + net fail still serves cache');
        let threw = false;
        try { if (ev._wait) await ev._wait; } catch (e) { threw = true; }
        assert(!threw, '4: failed revalidation does not reject');
    }

    if (failures) { console.error(`\ntest-sw-strategy: ${failures} FAILED of ${checks}`); process.exit(1); }
    console.log(`test-sw-strategy: all ${checks} assertions passed`);
})();

/* ==========================================================================
   mc-sync.js  —  cross-device sync of the signed-in user's cookbook data
   --------------------------------------------------------------------------
   Trimmed port of 4-Weeks-to-Open-'s mc-sync.js, same mechanism: mirrors a
   whitelist of localStorage stores to the shared Supabase table
     user_sync(user_id, store_key, data jsonb, updated_at, device_id)
   keyed by (user_id, store_key), RLS-isolated per user. A trainee signed in
   here is the same identity as in the workout app, so mc_macros_v1 (the
   tracker) reconciles across both apps instead of living in two places that
   never talk to each other.

   Runs ONLY when a Supabase user is signed in (MC_SB.currentUser()). When
   nobody is signed in, the app stays exactly as it was — local only — and
   this module is a no-op, same as today.

   Cycle: on load → pull (merge server into local) → push (upload changed
   stores). Also pushes on tab-hide / pagehide and on a periodic timer.
   ========================================================================== */
(function () {
  "use strict";
  if (window.__mcSync) return;
  window.__mcSync = true;
  if (!window.MC_SB || !MC_SB.configured) return;

  var TABLE = 'user_sync';
  // store_key -> merge strategy. Extended in Phase 1.3 with meal-plan/
  // macro-history/user-recipe keys.
  var STORES = {
    'mc_macros_v1': 'macros'
  };
  var PUSH_MS = 30000;

  var client = null, user = null;
  var snapshot = {};            // store_key -> JSON string last in sync with server
  var pulledChange = false;
  var status = { lastPush: 0, lastPull: 0, signedIn: false };

  function pendingCount() {
    var n = 0;
    Object.keys(STORES).forEach(function (key) {
      var cur = readRaw(key);
      if (cur != null && cur !== snapshot[key]) n++;
    });
    return n;
  }

  function readRaw(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function parse(s) { try { return JSON.parse(s); } catch (e) { return null; } }
  function writeVal(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  function deviceId() {
    try {
      var d = localStorage.getItem('mc_device_id');
      if (!d) { d = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('mc_device_id', d); }
      return d;
    } catch (e) { return 'dev'; }
  }
  var DEVICE = deviceId();

  // macros: { ts, profile, goals, days:{ "date":{entries:[{id,ts,...}]} } }.
  // Scalar parts (profile + goals) resolve by the top-level ts (last edit wins);
  // each day's entries union by id, and within an id the greater entry.ts wins.
  function mergeMacros(local, remote) {
    local = local || {}; remote = remote || {};
    var lts = local.ts || 0, rts = remote.ts || 0;
    var newer = rts > lts ? remote : local;
    var out = { v: 1, ts: Math.max(lts, rts), profile: newer.profile, goals: newer.goals, days: {} };
    var ld = local.days || {}, rd = remote.days || {}, dates = {}, d;
    for (d in ld) dates[d] = 1;
    for (d in rd) dates[d] = 1;
    for (d in dates) {
      var le = (ld[d] && ld[d].entries) || [], re = (rd[d] && rd[d].entries) || [];
      var seen = {}, list = [];
      le.concat(re).forEach(function (e) {
        var id = e && e.id;
        if (id == null) { list.push(e); return; }
        if (seen[id] == null) { seen[id] = list.length; list.push(e); }
        else if ((e.ts || 0) > (list[seen[id]].ts || 0)) list[seen[id]] = e;
      });
      out.days[d] = { entries: list };
    }
    return out;
  }

  function mergeStore(strategy, local, remote) {
    if (strategy === 'macros') return mergeMacros(local, remote);
    return remote != null ? remote : local;
  }

  // ---- sync cycle ----------------------------------------------------------
  function pull() {
    return client.from(TABLE).select('store_key, data').eq('user_id', user.id)
      .then(function (r) {
        if (r.error) throw r.error;
        var remoteByKey = {};
        (r.data || []).forEach(function (row) { remoteByKey[row.store_key] = row.data; });
        Object.keys(STORES).forEach(function (key) {
          var local = parse(readRaw(key));
          var remote = remoteByKey[key];
          var before = readRaw(key);
          if (remote != null) {
            var merged = mergeStore(STORES[key], local, remote);
            writeVal(key, merged);
          }
          var after = readRaw(key);
          if (after !== before) pulledChange = true;
          snapshot[key] = remote != null ? JSON.stringify(remote) : null;
        });
        status.lastPull = Date.now();
      });
  }

  function push() {
    var ops = [];
    Object.keys(STORES).forEach(function (key) {
      var cur = readRaw(key);
      if (cur == null) return;
      if (cur === snapshot[key]) return;
      var data = parse(cur);
      if (data == null) return;
      ops.push(client.from(TABLE).upsert({
        user_id: user.id, store_key: key, data: data,
        updated_at: new Date().toISOString(), device_id: DEVICE
      }, { onConflict: 'user_id,store_key' }).then(function (r) {
        if (!r.error) { snapshot[key] = cur; status.lastPush = Date.now(); }
      }));
    });
    return ops.length ? Promise.all(ops) : Promise.resolve();
  }

  // a fresh device pulls data the already-rendered page can't show; reload once
  function maybeReload() {
    if (!pulledChange) return;
    try {
      if (sessionStorage.getItem('mc_sync_reloaded') === '1') return;
      sessionStorage.setItem('mc_sync_reloaded', '1');
      location.reload();
    } catch (e) {}
  }

  function start() {
    pull()
      .then(function () { maybeReload(); return push(); })
      .catch(function () {});
    var flush = function () { push().catch(function () {}); };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') flush(); });
    setInterval(flush, PUSH_MS);
  }

  // public hook for manual triggering: kick() starts syncing after a
  // mid-session sign-in (from the account sheet) without a page reload.
  window.MC_SYNC = {
    pull: function () { return pull(); },
    push: function () { return push(); },
    status: function () {
      return { lastPush: status.lastPush, lastPull: status.lastPull,
               pending: pendingCount(), signedIn: !!user };
    },
    kick: function () {
      if (user || !client) return;
      MC_SB.currentUser().then(function (u) { if (u) { user = u; start(); } }).catch(function () {});
    }
  };

  MC_SB.ready
    .then(function (c) { if (!c) return null; client = c; return MC_SB.currentUser(); })
    .then(function (u) { if (u && client) { user = u; start(); } })
    .catch(function () {});
})();

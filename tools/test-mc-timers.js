#!/usr/bin/env node
'use strict';
/* ==========================================================================
   test-mc-timers.js — regression coverage for mc-timers.js, the kitchen timer
   store behind the Continuous Cook Session (CI initiative 1).

   Loads the ACTUAL source file in a mocked browser (it's an IIFE, not a
   CommonJS module) with a **controllable clock**, so the property the whole
   module exists for — that a timer is an absolute instant and therefore
   survives suspension, throttling and re-renders — is tested directly instead
   of being waited out in real time.

   The regression that motivated this file: timers used to live in a closure
   bound to a DOM node that renderCook() blanked on every step advance, so a
   running countdown vanished silently. Test 5 pins the replacement property —
   the store is the truth, and a fresh page load recovers the timer exactly.

   Run: node tools/test-mc-timers.js
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = fs.readFileSync(path.resolve(__dirname, '../mc-timers.js'), 'utf8');

let pass = 0, fail = 0;
function ok(name, cond) { if (cond) { pass++; } else { fail++; console.error('::error::' + name); } }
function eq(name, a, b) { ok(name + ' (got ' + JSON.stringify(a) + ')', JSON.stringify(a) === JSON.stringify(b)); }

const MIN = 60 * 1000;

// A sandbox whose clock the test moves by hand. `store` is passed in so a
// second load can share it — that's how "a full page navigation" is simulated.
function load(store, startAt) {
  const clock = { t: startAt || 1700000000000 };
  const noop = () => {};
  const sandbox = {
    window: {
      addEventListener: noop,
      setInterval: () => 1,
      clearInterval: noop
    },
    document: { hidden: false, addEventListener: noop, body: null, querySelector: () => null },
    navigator: {},
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; }
    },
    Date: { now: () => clock.t }
  };
  sandbox.window.window = sandbox.window;
  vm.createContext(sandbox);
  vm.runInContext(SRC, sandbox);
  return {
    T: sandbox.window.MCTimers,
    advance: ms => { clock.t += ms; },
    now: () => clock.t
  };
}

/* ── 1. The headline case: a 20-minute timer survives a 30-minute gap ─────
   No ticks happen in between — the page is suspended, exactly as it is when
   the phone locks. Nothing was counting, so nothing drifted. */
{
  const store = {};
  const { T, advance } = load(store);
  T.start({ seconds: 20 * 60, label: '20 minutes', recipeId: 'braise', stepNumber: 3 });
  eq('1a. one timer running', T.count(), 1);
  eq('1b. full duration remaining', T.list()[0].remainingMs, 20 * MIN);
  ok('1c. not ringing yet', T.list()[0].ringing === false);

  advance(30 * MIN);                      // suspended for half an hour
  const t = T.list()[0];
  ok('1d. reports itself ringing after the gap', t.ringing === true);
  eq('1e. remaining floors at zero, never negative', t.remainingMs, 0);
  eq('1f. tick alerts for it exactly once', T.tick(), 1);
  eq('1g. and does not alert again', T.tick(), 0);
}

/* ── 2. Two concurrent timers expire independently ───────────────────────
   The real kitchen case the old one-interval-per-chip design could not do:
   rice on, chicken resting, sauce reducing. */
{
  const store = {};
  const { T, advance } = load(store);
  T.start({ seconds: 5 * 60, label: 'rice', recipeId: 'a', stepNumber: 1 });
  T.start({ seconds: 12 * 60, label: 'chicken', recipeId: 'a', stepNumber: 2 });
  eq('2a. two timers', T.count(), 2);

  advance(6 * MIN);
  const byLabel = Object.fromEntries(T.list().map(t => [t.label, t]));
  ok('2b. the short one is ringing', byLabel.rice.ringing === true);
  ok('2c. the long one is not', byLabel.chicken.ringing === false);
  eq('2d. long one has 6 minutes left', byLabel.chicken.remainingMs, 6 * MIN);
  eq('2e. exactly one alert fired', T.tick(), 1);

  advance(6 * MIN);
  eq('2f. the second alert fires on its own schedule', T.tick(), 1);
}

/* ── 3. Pause holds the remaining time; resume re-anchors it ─────────────
   A paused timer must not keep burning down while the cook deals with
   something else — which is only expressible because pausing converts an
   absolute instant back into a duration. */
{
  const store = {};
  const { T, advance } = load(store);
  const id = T.start({ seconds: 10 * 60, label: '10 minutes' }).id;

  advance(4 * MIN);
  ok('3a. pause succeeds', T.pause(id) === true);
  eq('3b. remaining frozen at 6 minutes', T.get(id).remainingMs, 6 * MIN);
  ok('3c. reports as paused', T.get(id).paused === true);

  advance(60 * MIN);                      // an hour goes by, paused
  eq('3d. still 6 minutes after an hour paused', T.get(id).remainingMs, 6 * MIN);
  ok('3e. a paused timer never rings', T.get(id).ringing === false);

  ok('3f. resume succeeds', T.resume(id) === true);
  advance(6 * MIN);
  ok('3g. rings 6 minutes after resuming', T.get(id).ringing === true);
}

/* ── 4. Restart re-runs the original duration and re-arms the alert ─────── */
{
  const store = {};
  const { T, advance } = load(store);
  const id = T.start({ seconds: 3 * 60, label: '3 minutes' }).id;
  advance(4 * MIN);
  eq('4a. alerted once', T.tick(), 1);
  T.restart(id);
  eq('4b. full duration back', T.get(id).remainingMs, 3 * MIN);
  ok('4c. no longer ringing', T.get(id).ringing === false);
  advance(3 * MIN);
  eq('4d. alerts again after the restart', T.tick(), 1);
}

/* ── 5. The store is the truth, not the DOM (the original regression) ────
   Load the module a second time against the same localStorage — the same
   thing a full navigation from recipe.html to index.html does, and the same
   thing the old closure-bound interval could not survive. */
{
  const store = {};
  const first = load(store, 1700000000000);
  first.T.start({ seconds: 15 * 60, label: '15 minutes', recipeId: 'stew', stepNumber: 2 });

  // A new document, 5 minutes later, sharing only localStorage.
  const second = load(store, 1700000000000 + 5 * MIN);
  eq('5a. the timer survived the navigation', second.T.count(), 1);
  eq('5b. with the right time left', second.T.list()[0].remainingMs, 10 * MIN);
  eq('5c. and its step context intact', second.T.list()[0].stepNumber, 2);
  eq('5d. and its recipe', second.T.list()[0].recipeId, 'stew');
}

/* ── 6. Cancel, clearRinging, clearAll ──────────────────────────────────── */
{
  const store = {};
  const { T, advance } = load(store);
  const a = T.start({ seconds: 60, label: 'a' }).id;
  T.start({ seconds: 30 * 60, label: 'b' });
  advance(2 * MIN);                       // a is ringing, b is not
  ok('6a. clearRinging removes the finished one', T.clearRinging() === true);
  eq('6b. leaving the running one', T.count(), 1);
  eq('6c. and it is the right one', T.list()[0].label, 'b');
  ok('6d. clearRinging is a no-op with nothing ringing', T.clearRinging() === false);
  ok('6e. cancel of a stale id returns false', T.cancel(a) === false);
  T.clearAll();
  eq('6f. clearAll empties the store', T.count(), 0);
}

/* ── 7. The store stays bounded, and evicts a finished timer first ───────
   A cook mid-recipe must never lose a live countdown to a cap. */
{
  const store = {};
  const { T, advance } = load(store);
  T.start({ seconds: 60, label: 'finished' });
  advance(2 * MIN);                       // that one is now ringing
  for (let i = 0; i < T.MAX_TIMERS; i++) T.start({ seconds: 60 * MIN, label: 'live' + i });
  eq('7a. capped at MAX_TIMERS', T.count(), T.MAX_TIMERS);
  ok('7b. the finished timer was the one evicted',
    T.list().every(t => t.label !== 'finished'));
}

/* ── 8. Clock formatting rounds UP ──────────────────────────────────────
   A timer started for 20 minutes must read 20:00, not 19:59 — the off-by-one
   that makes a countdown look broken the instant it starts. */
{
  const { T } = load({});
  eq('8a. exact minute rounds up, not down', T.fmtClock(20 * MIN), '20:00');
  eq('8b. a fraction of a second still rounds up', T.fmtClock(59_001), '1:00');
  eq('8c. sub-minute pads seconds', T.fmtClock(9_000), '0:09');
  eq('8d. hours appear only when needed', T.fmtClock(90 * MIN), '1:30:00');
  eq('8e. and pad minutes once they do', T.fmtClock(65 * MIN), '1:05:00');
  eq('8f. zero is zero', T.fmtClock(0), '0:00');
  eq('8g. negative never renders as negative', T.fmtClock(-5000), '0:00');
}

/* ── 9. A corrupt store degrades to empty instead of throwing ───────────
   localStorage is shared with everything else in the mc-cookbook: namespace
   and can be edited, truncated by a quota failure, or restored from an older
   backup. None of that may take a cook out of a recipe. */
{
  ok('9a. garbage JSON', load({ 'mc-cookbook:timers': '{not json' }).T.count() === 0);
  ok('9b. wrong shape', load({ 'mc-cookbook:timers': '[1,2,3]' }).T.count() === 0);
  ok('9c. null', load({ 'mc-cookbook:timers': 'null' }).T.count() === 0);
  ok('9d. entries missing an end instant are dropped',
    load({ 'mc-cookbook:timers': JSON.stringify({ v: 1, timers: [{ id: 'x' }] }) }).T.count() === 0);
}

/* ── 10. A zero/absent duration never creates a timer ───────────────────── */
{
  const { T } = load({});
  ok('10a. no seconds', T.start({ label: 'nope' }) === null);
  ok('10b. zero seconds', T.start({ seconds: 0, label: 'nope' }) === null);
  eq('10c. store untouched', T.count(), 0);
}

console.log(fail
  ? 'test-mc-timers: ' + fail + ' FAILED, ' + pass + ' passed'
  : 'test-mc-timers: all ' + pass + ' assertions passed');
process.exit(fail ? 1 : 0);

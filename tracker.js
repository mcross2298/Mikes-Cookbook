/* ==========================================================================
   tracker.js — Mike's Cookbook macro tracker (standalone, in-app)
   --------------------------------------------------------------------------
   The cookbook's own macro tracker screen (#screen-tracker), mounted by
   cookbook-home.js. Mirrors the workout app's day-based flow but themed to the
   cookbook (cream cards, terracotta accent) and fully standalone — localStorage
   only, no login (see tracker-store.js).

   Layout:
     1. a live WEEK CALENDAR strip (past / future days),
     2. the MACRO TRACKER bar (calories + P/F/C vs. goals) for the picked day,
     3. an HOUR-BY-HOUR TIMELINE where foods log into the hour eaten.

   Add food via Open Food Facts search (tracker-foodapi.js), barcode scan
   (tracker-barcode.js), or manual entry; goals come from the suggest-then-
   adjust calculator (tracker-calc.js). Recipes are logged straight in from the
   recipe page (tracker-recipe.js). Exposed as window.MCTracker.
   ========================================================================== */
(function () {
  "use strict";
  if (window.MCTracker) return;

  var S = window.MCTrackerStore;
  var host = null;

  // macro colors tuned for cream cards (terracotta cal + on-brand hues)
  var COL = { kcal: "#C87A53", p: "#6D5BD0", f: "#C99A2E", c: "#5B8C5A" };
  var WD = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function num(v, d) { var n = parseFloat(v); return isFinite(n) ? n : (d || 0); }

  var selKey = S.todayKey();
  var addSlotMs = null;

  function defaultSlot() {
    if (selKey === S.todayKey()) return Date.now();
    var d = S.dateFromKey(selKey); d.setHours(12, 0, 0, 0); return d.getTime();
  }
  function hourSlot(hour) { var d = S.dateFromKey(selKey); d.setHours(hour, 0, 0, 0); return d.getTime(); }
  function entryHour(e) { return new Date(e.at || e.ts || Date.now()).getHours(); }

  // ====================================================================== //
  //  MOUNT / RENDER                                                         //
  // ====================================================================== //
  function mount(container) { host = container; injectStyles(); render(); }

  function render() {
    if (!host) return;
    var goals = S.getGoals();
    var entries = S.entriesFor(selKey);
    var totals = S.totalsOf(entries);

    host.innerHTML = "";
    var root = el("div", "ckt");
    root.appendChild(renderToolbar());
    root.appendChild(renderCalendar());
    root.appendChild(renderSummary(totals, goals));
    root.appendChild(renderFind());
    root.appendChild(renderTimeline(entries));
    host.appendChild(root);
  }

  function renderToolbar() {
    var bar = el("div", "ckt-toolbar");
    bar.appendChild(el("div", "ckt-toolbar-date", esc(S.prettyDay(selKey))));
    var actions = el("div", "ckt-toolbar-actions");
    var today = el("button", "ckt-ico", "◎"); today.title = "Jump to today";
    today.onclick = function () { selKey = S.todayKey(); render(); };
    var gear = el("button", "ckt-ico", "⚙"); gear.title = "Goals";
    gear.onclick = openCalculator;
    actions.appendChild(today); actions.appendChild(gear);
    bar.appendChild(actions);
    return bar;
  }

  function renderCalendar() {
    var cal = el("div", "ckt-cal");
    var prev = el("button", "ckt-cal-nav", "‹");
    prev.onclick = function () { selKey = S.addDays(selKey, -7); render(); };
    var next = el("button", "ckt-cal-nav", "›");
    next.onclick = function () { selKey = S.addDays(selKey, 7); render(); };
    var days = el("div", "ckt-cal-days");
    var start = S.mondayOf(selKey), tk = S.todayKey();
    for (var i = 0; i < 7; i++) {
      (function (k) {
        var d = S.dateFromKey(k);
        var cls = "ckt-day" + (k === selKey ? " sel" : "") + (k === tk ? " today" : "");
        var cell = el("div", cls,
          '<div class="ckt-day-wd">' + WD[(d.getDay() + 6) % 7] + "</div>" +
          '<div class="ckt-day-num">' + d.getDate() + "</div>" +
          '<div class="ckt-day-dot"></div>');
        cell.onclick = function () { selKey = k; render(); };
        days.appendChild(cell);
      })(S.addDays(start, i));
    }
    cal.appendChild(prev); cal.appendChild(days); cal.appendChild(next);
    return cal;
  }

  function renderSummary(totals, goals) {
    var sum = el("div", "ckt-sum");
    sum.title = "Edit goals";
    var metrics = el("div", "ckt-sum-metrics");
    metrics.appendChild(metric("🔥", totals.kcal, goals && goals.kcal, COL.kcal));
    metrics.appendChild(metric("P", totals.p, goals && goals.p, COL.p));
    metrics.appendChild(metric("F", totals.f, goals && goals.f, COL.f));
    metrics.appendChild(metric("C", totals.c, goals && goals.c, COL.c));
    sum.appendChild(metrics);
    sum.appendChild(el("div", "ckt-sum-exp", "›"));
    sum.onclick = openCalculator;
    return sum;
  }

  function metric(ic, have, goal, color) {
    var pct = goal ? Math.min(100, Math.round((have / goal) * 100)) : 0;
    var over = goal && have > goal;
    var m = el("div", "ckt-met");
    m.innerHTML =
      '<div class="ckt-met-top">' +
        '<span class="ckt-met-ic" style="color:' + color + '">' + ic + "</span>" +
        '<span class="ckt-met-val">' + have + "</span>" +
        '<span class="ckt-met-goal">/' + (goal || "—") + "</span>" +
      "</div>" +
      '<div class="ckt-met-track"><div class="ckt-met-fill" style="width:' + pct + "%;background:" + (over ? "#C0473B" : color) + '"></div></div>';
    return m;
  }

  function renderFind() {
    var bar = el("div", "ckt-find");
    bar.appendChild(el("span", "ckt-find-ic", "🔍"));
    var txt = el("button", "ckt-find-txt", "Search food database");
    txt.onclick = function () { addSlotMs = defaultSlot(); openSearch(); };
    bar.appendChild(txt);
    if (window.MCBarcode && MCBarcode.supported()) {
      var scan = el("button", "ckt-find-scan", "▦"); scan.title = "Scan barcode";
      scan.onclick = function () { addSlotMs = defaultSlot(); openScan(); };
      bar.appendChild(scan);
    }
    return bar;
  }

  function renderTimeline(entries) {
    var byHour = {};
    (entries || []).forEach(function (e) { (byHour[entryHour(e)] = byHour[entryHour(e)] || []).push(e); });
    Object.keys(byHour).forEach(function (h) {
      byHour[h].sort(function (a, b) { return (a.at || a.ts || 0) - (b.at || b.ts || 0); });
    });

    var nowHour = (selKey === S.todayKey()) ? new Date().getHours() : -1;
    var time = el("div", "ckt-time");
    for (var h = 0; h < 24; h++) {
      var list = byHour[h] || [];
      var row = el("div", "ckt-hr" + (list.length ? " has" : "") + (h === nowHour ? " now" : ""));
      var rail = el("div", "ckt-hr-rail");
      rail.appendChild(el("div", "ckt-hr-lbl", S.hourLabel(h)));
      var add = el("button", "ckt-hr-add", "+");
      (function (hour) { add.onclick = function () { openHourAdd(hour); }; })(h);
      rail.appendChild(add);
      row.appendChild(rail);

      var body = el("div", "ckt-hr-body");
      list.forEach(function (e) {
        var q = num(e.qty, 1), per = e.per || {};
        var card = el("div", "ckt-fcard");
        card.innerHTML =
          '<div class="ckt-fcard-top">' +
            '<div class="ckt-fcard-name">' + esc(e.name) + (q !== 1 ? " ×" + q : "") + "</div>" +
            '<div class="ckt-fcard-time">' + S.timeLabel(e.at || e.ts || Date.now()) + "</div>" +
          "</div>" +
          '<div class="ckt-fcard-macros">' +
            '<b style="color:' + COL.kcal + '">🔥' + Math.round(num(per.kcal) * q) + "</b>  " +
            "P " + Math.round(num(per.p) * q) + "  F " + Math.round(num(per.f) * q) + "  C " + Math.round(num(per.c) * q) +
          "</div>";
        (function (id) { card.onclick = function () { openEdit(id); }; })(e.id);
        body.appendChild(card);
      });
      row.appendChild(body);
      time.appendChild(row);
    }
    return time;
  }

  // ====================================================================== //
  //  SHEETS                                                                 //
  // ====================================================================== //
  function sheet(title, sub) {
    var ov = el("div", "ckt-overlay");
    var sh = el("div", "ckt-sheet");
    sh.appendChild(el("div", "ckt-handle"));
    sh.appendChild(el("div", "ckt-sheet-title", esc(title)));
    if (sub) sh.appendChild(el("div", "ckt-sheet-sub", esc(sub)));
    ov.appendChild(sh);
    ov.addEventListener("click", function (ev) { if (ev.target === ov) close(); });
    document.body.appendChild(ov);
    requestAnimationFrame(function () { ov.classList.add("open"); });
    function close() { ov.classList.remove("open"); setTimeout(function () { ov.remove(); }, 200); }
    return { ov: ov, sh: sh, close: close };
  }

  function stepper(label, value, step, min, onChange) {
    var row = el("div", "ckt-step");
    row.innerHTML = '<div class="ckt-step-lbl">' + esc(label) + "</div>";
    var ctl = el("div", "ckt-step-ctl");
    var minus = el("button", "ckt-step-btn", "−");
    var val = el("div", "ckt-step-val", String(value));
    var plus = el("button", "ckt-step-btn", "+");
    function set(v) { v = Math.max(min, Math.round(v)); val.textContent = String(v); onChange(v); }
    minus.onclick = function () { set(num(val.textContent) - step); };
    plus.onclick = function () { set(num(val.textContent) + step); };
    ctl.appendChild(minus); ctl.appendChild(val); ctl.appendChild(plus);
    row.appendChild(ctl);
    row.setVal = function (v) { val.textContent = String(Math.round(v)); };
    return row;
  }

  function stepperFloat(label, value) {
    var row = el("div", "ckt-step");
    row.innerHTML = '<div class="ckt-step-lbl">' + esc(label) + "</div>";
    var ctl = el("div", "ckt-step-ctl");
    var minus = el("button", "ckt-step-btn", "−");
    var val = el("div", "ckt-step-val", String(value));
    var plus = el("button", "ckt-step-btn", "+");
    function set(v) { v = Math.max(0.5, Math.round(v * 2) / 2); val.textContent = String(v); }
    minus.onclick = function () { set(num(val.textContent) - 0.5); };
    plus.onclick = function () { set(num(val.textContent) + 0.5); };
    ctl.appendChild(minus); ctl.appendChild(val); ctl.appendChild(plus);
    row.appendChild(ctl);
    row.value = function () { return num(val.textContent, 1); };
    return row;
  }

  function openHourAdd(hour) {
    addSlotMs = hourSlot(hour);
    var s = sheet("Add food · " + S.hourLabel(hour), S.prettyDay(selKey));
    var w = el("div", "ckt-actions-wrap");
    if (window.MCBarcode && MCBarcode.supported()) {
      var b1 = el("button", "ckt-btn ckt-btn-accent", "📷 Scan barcode");
      b1.onclick = function () { s.close(); openScan(); };
      w.appendChild(b1);
    }
    var row = el("div", "ckt-actions");
    var b2 = el("button", "ckt-btn", "🔍 Search");
    b2.onclick = function () { s.close(); openSearch(); };
    var b3 = el("button", "ckt-btn", "✏️ Manual");
    b3.onclick = function () { s.close(); openManual(); };
    row.appendChild(b2); row.appendChild(b3);
    w.appendChild(row);
    s.sh.appendChild(w);
  }

  // ---- calculator ----------------------------------------------------------
  function openCalculator() {
    var p = S.getProfile();
    var existing = S.getGoals();
    var s = sheet("Macro calculator", "Suggested from your stats — adjust to taste.");

    var ftStart = p.heightCm ? Math.floor((p.heightCm / 2.54) / 12) : 5;
    var inStart = p.heightCm ? Math.round((p.heightCm / 2.54) % 12) : 10;

    var form = el("div", "ckt-form");
    form.innerHTML =
      '<div class="ckt-seg" id="ckSex">' +
        '<button data-v="male" class="' + (p.sex !== "female" ? "on" : "") + '">Male</button>' +
        '<button data-v="female" class="' + (p.sex === "female" ? "on" : "") + '">Female</button>' +
      "</div>" +
      '<div class="ckt-grid2">' +
        '<label class="ckt-field"><span>Age</span><input id="ckAge" type="number" inputmode="numeric" value="' + (p.age || "") + '" placeholder="30"></label>' +
        '<label class="ckt-field"><span>Weight (lb)</span><input id="ckWt" type="number" inputmode="decimal" value="' + (p.weightLb || "") + '" placeholder="180"></label>' +
      "</div>" +
      '<div class="ckt-grid2">' +
        '<label class="ckt-field"><span>Height (ft)</span><input id="ckFt" type="number" inputmode="numeric" value="' + ftStart + '"></label>' +
        '<label class="ckt-field"><span>Height (in)</span><input id="ckIn" type="number" inputmode="numeric" value="' + inStart + '"></label>' +
      "</div>" +
      '<label class="ckt-field"><span>Activity</span><select id="ckAct">' +
        MCMacroCalc.ACTIVITY.map(function (a) { return '<option value="' + a.id + '"' + (p.activity === a.id ? " selected" : "") + ">" + a.label + " — " + a.sub + "</option>"; }).join("") +
      "</select></label>" +
      '<div class="ckt-seg ckt-seg-3" id="ckGoal">' +
        MCMacroCalc.GOALS.map(function (g) { return '<button data-v="' + g.id + '" class="' + (p.goal === g.id ? "on" : "") + '">' + g.label + "</button>"; }).join("") +
      "</div>";
    s.sh.appendChild(form);

    function seg(id, fallback) {
      var box = $("#" + id, s.sh);
      box.addEventListener("click", function (ev) {
        var b = ev.target.closest("button"); if (!b) return;
        Array.prototype.forEach.call(box.querySelectorAll("button"), function (x) { x.classList.remove("on"); });
        b.classList.add("on");
      });
      return function () { var on = box.querySelector("button.on"); return on ? on.getAttribute("data-v") : fallback; };
    }
    var getSex = seg("ckSex", "male");
    var getGoal = seg("ckGoal", "maintain");

    function readProfile() {
      var ft = num($("#ckFt", s.sh).value), inch = num($("#ckIn", s.sh).value);
      return {
        sex: getSex(), age: num($("#ckAge", s.sh).value),
        heightCm: Math.round((ft * 12 + inch) * 2.54),
        weightLb: num($("#ckWt", s.sh).value),
        activity: $("#ckAct", s.sh).value, goal: getGoal()
      };
    }

    var calcBtn = el("button", "ckt-btn ckt-btn-accent", "Calculate suggested macros");
    s.sh.appendChild(calcBtn);
    var adjust = el("div", "ckt-adjust"); adjust.style.display = "none";
    s.sh.appendChild(adjust);

    var cur = existing ? { kcal: existing.kcal, p: existing.p, f: existing.f, c: existing.c } : null;
    var profSnapshot = null;
    var kcalStep, pStep, fStep, cStep, summary;

    function buildAdjust() {
      adjust.innerHTML = "";
      adjust.appendChild(el("div", "ckt-adjust-head", "Fine-tune your targets"));
      summary = el("div", "ckt-calsum");
      adjust.appendChild(summary);

      kcalStep = stepper("Calories", cur.kcal, 50, 0, function (v) {
        cur.kcal = v;
        var sp = MCMacroCalc.splitFromCalories(v, profSnapshot.weightLb, profSnapshot.goal);
        cur.p = sp.p; cur.f = sp.f; cur.c = sp.c;
        pStep.setVal(cur.p); fStep.setVal(cur.f); cStep.setVal(cur.c);
        refreshSummary();
      });
      pStep = stepper("Protein (g)", cur.p, 5, 0, function (v) { cur.p = v; cur.kcal = MCMacroCalc.kcalFromMacros(cur.p, cur.f, cur.c); kcalStep.setVal(cur.kcal); refreshSummary(); });
      fStep = stepper("Fat (g)", cur.f, 5, 0, function (v) { cur.f = v; cur.kcal = MCMacroCalc.kcalFromMacros(cur.p, cur.f, cur.c); kcalStep.setVal(cur.kcal); refreshSummary(); });
      cStep = stepper("Carbs (g)", cur.c, 5, 0, function (v) { cur.c = v; cur.kcal = MCMacroCalc.kcalFromMacros(cur.p, cur.f, cur.c); kcalStep.setVal(cur.kcal); refreshSummary(); });
      adjust.appendChild(kcalStep); adjust.appendChild(pStep); adjust.appendChild(fStep); adjust.appendChild(cStep);

      var save = el("button", "ckt-btn ckt-btn-accent", "Save as my goals");
      save.onclick = function () {
        S.saveGoals(profSnapshot, { kcal: cur.kcal, p: cur.p, f: cur.f, c: cur.c });
        s.close(); render();
      };
      adjust.appendChild(save);
      refreshSummary();
    }

    function refreshSummary() {
      var pc = MCMacroCalc.macroPercents(cur.p, cur.f, cur.c);
      summary.innerHTML =
        '<span class="ckt-calsum-k">' + cur.kcal + " kcal</span>" +
        '<span class="ckt-calsum-split">' + pc.p + "P / " + pc.f + "F / " + pc.c + "C</span>";
    }

    calcBtn.onclick = function () {
      profSnapshot = readProfile();
      if (!profSnapshot.weightLb || !profSnapshot.age || !profSnapshot.heightCm) {
        calcBtn.textContent = "Enter age, height & weight first";
        setTimeout(function () { calcBtn.textContent = "Calculate suggested macros"; }, 1800);
        return;
      }
      var rec = MCMacroCalc.recommend(profSnapshot);
      cur = { kcal: rec.kcal, p: rec.p, f: rec.f, c: rec.c };
      calcBtn.textContent = "Recalculate";
      buildAdjust(); adjust.style.display = "block";
      adjust.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };

    if (cur) { profSnapshot = S.getProfile().heightCm ? S.getProfile() : readProfile(); calcBtn.textContent = "Recalculate"; buildAdjust(); adjust.style.display = "block"; }
  }

  // ---- search --------------------------------------------------------------
  function openSearch() {
    var s = sheet("Search foods", "Powered by Open Food Facts.");
    var input = el("input", "ckt-input");
    input.type = "search"; input.placeholder = 'e.g. "chobani yogurt", "rxbar"…';
    s.sh.appendChild(input);
    var results = el("div", "ckt-results");
    s.sh.appendChild(results);

    var timer = null;
    function run() {
      var q = input.value.trim();
      if (q.length < 2) { results.innerHTML = ""; return; }
      results.innerHTML = '<div class="ckt-results-msg">Searching…</div>';
      MCFoodAPI.search(q).then(function (items) {
        if (!items.length) { results.innerHTML = '<div class="ckt-results-msg">No matches. Try a different term or add it manually.</div>'; return; }
        results.innerHTML = "";
        items.forEach(function (it) {
          var row = el("div", "ckt-result");
          row.innerHTML =
            '<div class="ckt-result-main">' +
              '<div class="ckt-result-name">' + esc(it.name) + "</div>" +
              '<div class="ckt-result-sub">' + (it.brand ? esc(it.brand) + " · " : "") + "per " + esc(it.servingLabel) + "</div>" +
            "</div>" +
            '<div class="ckt-result-kcal">' + it.kcal + "<span>kcal</span></div>";
          row.onclick = function () {
            S.addEntry({ name: it.name + (it.brand ? " (" + it.brand + ")" : ""), source: "search", unit: it.basis, qty: 1, per: { kcal: it.kcal, p: it.p, f: it.f, c: it.c } }, addSlotMs);
            addSlotMs = null; s.close(); render();
          };
          results.appendChild(row);
        });
      });
    }
    input.addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(run, 350); });
    setTimeout(function () { input.focus(); }, 250);
  }

  // ---- barcode -------------------------------------------------------------
  function openScan() {
    if (!(window.MCBarcode && MCBarcode.supported())) { openManual(); return; }
    MCBarcode.scan().then(function (code) {
      if (!code) return;
      var s = sheet("Looking up…", "Barcode " + code);
      MCFoodAPI.lookup(code).then(function (it) {
        s.close();
        if (it) {
          openManual({ source: "barcode", name: it.name + (it.brand ? " (" + it.brand + ")" : ""), kcal: it.kcal, p: it.p, f: it.f, c: it.c, note: "Found via barcode · per " + it.servingLabel + " — adjust if needed." });
        } else {
          openManual({ source: "barcode", note: "No match for barcode " + code + ". Enter its macros manually." });
        }
      }).catch(function () { s.close(); openManual({ source: "barcode", note: "Lookup failed (offline?). Enter macros manually." }); });
    }).catch(function (err) { alert((err && err.message) || "Could not open the scanner."); });
  }

  // ---- manual --------------------------------------------------------------
  function openManual(prefill) {
    prefill = prefill || {};
    var s = sheet("Manual entry", prefill.note || ("Adding to " + S.prettyDay(selKey) + " · " + S.timeLabel(addSlotMs || defaultSlot())));
    var form = el("div", "ckt-form");
    form.innerHTML =
      '<label class="ckt-field"><span>Food name</span><input id="ckmName" type="text" value="' + esc(prefill.name || "") + '" placeholder="Ribeye steak"></label>' +
      '<div class="ckt-grid2">' +
        '<label class="ckt-field"><span>Calories</span><input id="ckmK" type="number" inputmode="numeric" value="' + (prefill.kcal != null ? esc(prefill.kcal) : "") + '"></label>' +
        '<label class="ckt-field"><span>Servings</span><input id="ckmQ" type="number" inputmode="decimal" value="' + (prefill.qty || 1) + '"></label>' +
      "</div>" +
      '<div class="ckt-grid3">' +
        '<label class="ckt-field"><span>Protein g</span><input id="ckmP" type="number" inputmode="numeric" value="' + (prefill.p != null ? esc(prefill.p) : "") + '"></label>' +
        '<label class="ckt-field"><span>Fat g</span><input id="ckmF" type="number" inputmode="numeric" value="' + (prefill.f != null ? esc(prefill.f) : "") + '"></label>' +
        '<label class="ckt-field"><span>Carbs g</span><input id="ckmC" type="number" inputmode="numeric" value="' + (prefill.c != null ? esc(prefill.c) : "") + '"></label>' +
      "</div>";
    s.sh.appendChild(form);
    var add = el("button", "ckt-btn ckt-btn-accent", "Add");
    add.onclick = function () {
      var name = $("#ckmName", s.sh).value.trim();
      if (!name) { add.textContent = "Enter a name first"; setTimeout(function () { add.textContent = "Add"; }, 1500); return; }
      S.addEntry({
        name: name, source: prefill.source || "manual", unit: "serving", qty: num($("#ckmQ", s.sh).value, 1),
        per: { kcal: num($("#ckmK", s.sh).value), p: num($("#ckmP", s.sh).value), f: num($("#ckmF", s.sh).value), c: num($("#ckmC", s.sh).value) }
      }, addSlotMs);
      addSlotMs = null; s.close(); render();
    };
    s.sh.appendChild(add);
  }

  // ---- edit ----------------------------------------------------------------
  function openEdit(id) {
    var entry = null;
    S.entriesFor(selKey).forEach(function (e) { if (e.id === id) entry = e; });
    if (!entry) return;
    var s = sheet(entry.name, "Logged at " + S.timeLabel(entry.at || entry.ts || Date.now()) + " · adjust quantity or remove.");
    var qWrap = el("div", "ckt-form"); s.sh.appendChild(qWrap);
    var qStep = stepperFloat("Servings", num(entry.qty, 1));
    qWrap.appendChild(qStep);

    var save = el("button", "ckt-btn ckt-btn-accent", "Save");
    save.onclick = function () { S.updateQty(selKey, id, qStep.value()); s.close(); render(); };
    var del = el("button", "ckt-btn ckt-btn-danger", "Remove from log");
    del.onclick = function () { S.removeEntry(selKey, id); s.close(); render(); };
    s.sh.appendChild(save); s.sh.appendChild(del);
  }

  // ====================================================================== //
  //  STYLES (cookbook-themed: cream cards, terracotta accent, dark page)    //
  // ====================================================================== //
  function injectStyles() {
    if (document.getElementById("ckt-styles")) return;
    var css =
      ".ckt{padding:0 2px 24px;}" +
      /* toolbar */
      ".ckt-toolbar{display:flex;align-items:center;justify-content:space-between;margin:4px 2px 12px;}" +
      ".ckt-toolbar-date{font-size:15px;font-weight:800;color:var(--on-dark);}" +
      ".ckt-toolbar-actions{display:flex;gap:8px;}" +
      ".ckt-ico{width:38px;height:38px;border-radius:11px;border:1px solid var(--line-dark);background:var(--bg-elev);" +
        "color:var(--on-dark);font-size:16px;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;}" +
      /* calendar (on dark page) */
      ".ckt-cal{display:flex;align-items:center;gap:2px;margin-bottom:14px;}" +
      ".ckt-cal-nav{flex:0 0 auto;width:24px;height:48px;border:none;background:none;color:var(--on-dark-dim);font-size:20px;font-weight:700;cursor:pointer;font-family:inherit;}" +
      ".ckt-cal-days{flex:1;display:grid;grid-template-columns:repeat(7,1fr);gap:2px;}" +
      ".ckt-day{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 0 5px;border-radius:12px;cursor:pointer;border:1.5px solid transparent;}" +
      ".ckt-day-wd{font-size:9px;font-weight:800;letter-spacing:0.04em;color:var(--on-dark-dim);}" +
      ".ckt-day-num{font-size:15px;font-weight:800;color:var(--on-dark);}" +
      ".ckt-day-dot{width:4px;height:4px;border-radius:50%;background:transparent;}" +
      ".ckt-day.today .ckt-day-dot{background:var(--accent);}" +
      ".ckt-day.sel{border-color:var(--accent);background:rgba(var(--accent-rgb),0.16);}" +
      ".ckt-day.sel .ckt-day-num{color:var(--accent);}" +
      /* summary (cream card) */
      ".ckt-sum{display:flex;align-items:center;gap:8px;background:var(--surface);border:1px solid var(--line);" +
        "border-radius:var(--r-lg);padding:12px;margin-bottom:14px;cursor:pointer;}" +
      ".ckt-sum-metrics{flex:1;display:grid;grid-template-columns:repeat(4,1fr);gap:9px;min-width:0;}" +
      ".ckt-met{min-width:0;}" +
      ".ckt-met-top{display:flex;align-items:baseline;gap:2px;white-space:nowrap;overflow:hidden;}" +
      ".ckt-met-ic{font-size:11px;font-weight:900;flex:0 0 auto;}" +
      ".ckt-met-val{font-size:13px;font-weight:900;color:var(--ink);}" +
      ".ckt-met-goal{font-size:10px;color:var(--ink-dim);font-weight:700;}" +
      ".ckt-met-track{height:3px;border-radius:2px;background:rgba(0,0,0,0.08);margin-top:6px;overflow:hidden;}" +
      ".ckt-met-fill{height:100%;border-radius:2px;transition:width 0.3s ease;}" +
      ".ckt-sum-exp{flex:0 0 auto;color:var(--ink-dim);font-size:20px;font-weight:800;line-height:1;}" +
      /* find bar (cream) */
      ".ckt-find{display:flex;align-items:center;gap:9px;background:var(--surface);border:1px solid var(--line);" +
        "border-radius:var(--r-md);padding:10px 12px;margin-bottom:16px;}" +
      ".ckt-find-ic{font-size:14px;}" +
      ".ckt-find-txt{flex:1;text-align:left;background:none;border:none;color:var(--ink-dim);font-size:14px;cursor:pointer;font-family:inherit;padding:0;}" +
      ".ckt-find-scan{width:34px;height:34px;border-radius:9px;border:1px solid var(--line);background:var(--surface-2);color:var(--ink);font-size:15px;cursor:pointer;font-family:inherit;}" +
      /* timeline */
      ".ckt-time{position:relative;}" +
      ".ckt-hr{display:grid;grid-template-columns:52px 1fr;gap:10px;align-items:stretch;}" +
      ".ckt-hr-rail{display:flex;flex-direction:column;align-items:center;padding-top:5px;border-right:1px dashed var(--line-dark);}" +
      ".ckt-hr-lbl{font-size:10px;font-weight:800;color:var(--on-dark-dim);white-space:nowrap;}" +
      ".ckt-hr-add{margin-top:6px;width:26px;height:26px;border-radius:50%;border:1px solid var(--line-dark);background:var(--bg-elev);color:var(--accent);font-size:17px;line-height:1;cursor:pointer;font-family:inherit;}" +
      ".ckt-hr-body{padding:4px 0 12px;display:flex;flex-direction:column;gap:6px;min-width:0;}" +
      ".ckt-hr.has .ckt-hr-rail{border-right-color:rgba(var(--accent-rgb),0.5);}" +
      ".ckt-hr.now .ckt-hr-lbl{color:var(--accent);}" +
      ".ckt-fcard{background:var(--surface);border:1px solid var(--line);border-radius:var(--r-md);padding:9px 12px;cursor:pointer;}" +
      ".ckt-fcard-top{display:flex;justify-content:space-between;gap:8px;align-items:baseline;}" +
      ".ckt-fcard-name{font-size:13px;font-weight:800;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;}" +
      ".ckt-fcard-time{font-size:10px;color:var(--ink-dim);font-weight:700;flex:0 0 auto;}" +
      ".ckt-fcard-macros{font-size:11px;color:var(--ink-dim);font-weight:600;margin-top:3px;}" +
      ".ckt-fcard-macros b{font-weight:800;}" +
      /* buttons */
      ".ckt-btn{width:100%;box-sizing:border-box;padding:14px;border-radius:var(--r-md);border:1px solid var(--line);background:var(--surface-2);color:var(--ink);font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;}" +
      ".ckt-btn-accent{background:var(--accent);border-color:var(--accent);color:#fff;}" +
      ".ckt-btn-danger{background:transparent;border-color:rgba(192,71,59,0.4);color:#C0473B;margin-top:8px;}" +
      ".ckt-actions-wrap{display:flex;flex-direction:column;gap:10px;}" +
      ".ckt-actions{display:flex;gap:10px;}" +
      /* sheets (cream) */
      ".ckt-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:flex-end;justify-content:center;z-index:1200;opacity:0;transition:opacity 0.2s;}" +
      ".ckt-overlay.open{opacity:1;}" +
      ".ckt-sheet{width:100%;max-width:560px;background:var(--surface);border-radius:var(--r-lg) var(--r-lg) 0 0;padding:14px 18px calc(28px + env(safe-area-inset-bottom));max-height:90vh;overflow-y:auto;transform:translateY(16px);transition:transform 0.2s;}" +
      ".ckt-overlay.open .ckt-sheet{transform:translateY(0);}" +
      ".ckt-handle{width:36px;height:4px;background:rgba(0,0,0,0.15);border-radius:2px;margin:0 auto 16px;}" +
      ".ckt-sheet-title{font-size:19px;font-weight:900;color:var(--ink);font-family:var(--serif);}" +
      ".ckt-sheet-sub{font-size:13px;color:var(--ink-dim);margin:4px 0 16px;line-height:1.5;}" +
      ".ckt-form{display:flex;flex-direction:column;gap:12px;margin-bottom:16px;}" +
      ".ckt-grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}" +
      ".ckt-grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;}" +
      ".ckt-field{display:flex;flex-direction:column;gap:6px;font-size:12px;font-weight:700;color:var(--ink-dim);}" +
      ".ckt-field input,.ckt-field select,.ckt-input{width:100%;box-sizing:border-box;background:#fff;border:1px solid var(--line);border-radius:var(--r-sm);padding:12px;color:var(--ink);font-size:15px;font-family:inherit;}" +
      ".ckt-input{margin-bottom:12px;}" +
      ".ckt-seg{display:flex;gap:8px;}" +
      ".ckt-seg button{flex:1;padding:12px;border-radius:var(--r-sm);border:1px solid var(--line);background:var(--surface-2);color:var(--ink-dim);font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;}" +
      ".ckt-seg button.on{background:var(--accent);border-color:var(--accent);color:#fff;}" +
      ".ckt-results{display:flex;flex-direction:column;gap:8px;max-height:52vh;overflow-y:auto;}" +
      ".ckt-results-msg{font-size:13px;color:var(--ink-dim);text-align:center;padding:18px;}" +
      ".ckt-result{display:flex;align-items:center;gap:12px;background:var(--surface-2);border:1px solid var(--line);border-radius:var(--r-sm);padding:11px 13px;cursor:pointer;}" +
      ".ckt-result-main{flex:1;min-width:0;}" +
      ".ckt-result-name{font-size:14px;font-weight:800;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}" +
      ".ckt-result-sub{font-size:11px;color:var(--ink-dim);font-weight:600;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}" +
      ".ckt-result-kcal{font-size:15px;font-weight:900;color:var(--ink);flex-shrink:0;text-align:center;}" +
      ".ckt-result-kcal span{display:block;font-size:9px;color:var(--ink-dim);font-weight:700;}" +
      ".ckt-adjust{margin-top:8px;}" +
      ".ckt-adjust-head{font-size:12px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:var(--ink-dim);margin-bottom:10px;}" +
      ".ckt-calsum{display:flex;align-items:baseline;gap:10px;margin-bottom:14px;}" +
      ".ckt-calsum-k{font-size:26px;font-weight:900;color:var(--accent);}" +
      ".ckt-calsum-split{font-size:13px;font-weight:700;color:var(--ink-dim);}" +
      ".ckt-step{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-top:1px solid var(--line);}" +
      ".ckt-step-lbl{font-size:14px;font-weight:800;color:var(--ink);}" +
      ".ckt-step-ctl{display:flex;align-items:center;gap:14px;}" +
      ".ckt-step-btn{width:38px;height:38px;border-radius:var(--r-sm);border:1px solid var(--line);background:var(--surface-2);color:var(--ink);font-size:20px;font-weight:800;cursor:pointer;font-family:inherit;line-height:1;}" +
      ".ckt-step-val{min-width:54px;text-align:center;font-size:18px;font-weight:900;color:var(--ink);}" +
      "@media (prefers-reduced-motion: reduce){.ckt-overlay,.ckt-sheet,.ckt-met-fill{transition:none;}}";
    var st = document.createElement("style");
    st.id = "ckt-styles"; st.textContent = css;
    document.head.appendChild(st);
  }

  // re-render if the store changes in another document (e.g. recipe page logged)
  window.addEventListener("storage", function (ev) {
    if (ev.key === S.KEY && host && host.offsetParent !== null) render();
  });

  window.MCTracker = { mount: mount, render: render, openCalculator: openCalculator };
})();

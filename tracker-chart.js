/* ==========================================================================
   tracker-chart.js — tiny hand-rolled SVG charts for the macro tracker
   --------------------------------------------------------------------------
   No build step / no charting library, so this mirrors the workout app's
   MC_CHART pattern: small primitives that return raw SVG markup strings.

     MCChart.ring(pct, opts)        circular progress ring, 0-100
     MCChart.ringCircumference(opts) circumference for a ring's stroke-dasharray math
     MCChart.bars(values, opts)     vertical bar trend (sparkline)

   Exposed as window.MCChart. Must load before tracker.js.
   ========================================================================== */
(function () {
  "use strict";
  if (window.MCChart) return;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function ringCircumference(opts) {
    opts = opts || {};
    var size = opts.size || 36, stroke = opts.stroke || 3.5;
    return 2 * Math.PI * ((size / 2) - stroke);
  }

  // pct: 0-100 (clamped here). opts: {size, stroke, color, track}
  function ring(pct, opts) {
    opts = opts || {};
    var size = opts.size || 36, stroke = opts.stroke || 3.5;
    var r = (size / 2) - stroke;
    var c = 2 * Math.PI * r;
    var p = Math.max(0, Math.min(100, pct || 0));
    var dash = (p / 100) * c;
    var color = opts.color || "var(--accent)";
    var track = opts.track || "rgba(127,127,127,0.22)";
    var cx = size / 2, cy = size / 2;
    return '<svg class="mcchart-ring" viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + track + '" stroke-width="' + stroke + '"/>' +
      '<circle class="mcchart-ring-arc" cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="' + stroke +
        '" stroke-linecap="round" stroke-dasharray="' + dash.toFixed(2) + ' ' + c.toFixed(2) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"/>' +
      "</svg>";
  }

  // values: [{label, value}] in chronological order — bars scaled to max
  function bars(values, opts) {
    opts = opts || {};
    var W = opts.width || 280, H = opts.height || 64, gap = 5;
    if (!values || !values.length) return "";
    var max = Math.max.apply(null, values.map(function (v) { return v.value; })) || 1;
    var n = values.length;
    var bw = (W - gap * (n - 1)) / n;
    var color = opts.color || "var(--accent)";
    var out = values.map(function (v, i) {
      var h = Math.max(2, (v.value / max) * (H - 4));
      var x = i * (bw + gap), y = H - h;
      var hl = opts.highlight === i;
      return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="3" fill="' + color +
        '" opacity="' + (hl ? "1" : "0.45") + '"><title>' + esc(v.label) + ": " + esc(v.value) + "</title></rect>";
    }).join("");
    return '<svg viewBox="0 0 ' + W + " " + H + '" style="width:100%;height:auto;display:block;">' + out + "</svg>";
  }

  window.MCChart = { ring: ring, ringCircumference: ringCircumference, bars: bars };
})();

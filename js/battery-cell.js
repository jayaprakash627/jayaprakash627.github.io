/* =============================================================================
 *  battery-cell.js  —  "THE LIVE CELL"
 * =============================================================================
 *  The hero's signature graphic: a 13-segment 48V battery pack that charges,
 *  holds, and discharges on a loop, with a live telemetry dock underneath
 *  (pack voltage, current, temperature, SoH + a scrolling current sparkline).
 *
 *  Everything is DERIVED from one value — `soc` (state of charge) — so the
 *  numbers and the fill can never disagree:
 *      packVoltage = 13 cells * (3.40V + soc * 0.80V)   -> 44.2V empty, 54.6V full
 *  That's the real 13S Li-ion window, which is why the readout looks right to
 *  anyone who works with packs.
 *
 *  The data is SIMULATED (there's no hardware attached) — the caption on the
 *  dock says so, and that caption is deliberate, not decoration.
 *
 *  Pure Canvas2D, no libraries. Static geometry is pre-rendered once to an
 *  offscreen canvas and blitted each frame; only the fill, digits, pulse and
 *  sparkline actually redraw.
 *
 *  Public API (window.BatteryCell):
 *    .init()           -> start
 *    .refreshColors()  -> re-read CSS vars (call after a theme change)
 *    .soc()            -> current state of charge, 0..1 (the background reads this)
 * ========================================================================== */

const BatteryCell = (() => {
  "use strict";

  const canvas = document.getElementById("battery-cell");
  if (!canvas) return { init() {}, refreshColors() {}, soc: () => 0.78 };
  const ctx = canvas.getContext("2d");

  const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------- Design box ------------------------------- */
  // All coordinates below are in this space; the canvas scales to fit.
  const BOX_W = 420, BOX_H = 632;          // cell area 520 + telemetry dock 112
  const SEGMENTS = 13;                     // 13S = a real 48V Li-ion pack

  // Shifted right so the SoC readout on the left has room for its label.
  const body = { x: 172, y: 64, w: 186, h: 376, r: 28 };
  const bodyCx = body.x + body.w / 2;
  const dockY = 520;

  /* ------------------------------- State --------------------------------- */
  let W = BOX_W, H = BOX_H, DPR = 1, scale = 1;
  let C = {};                              // colours sampled from CSS
  let statics = null;                      // pre-rendered geometry
  let spark = null, sparkCtx = null;       // offscreen sparkline
  let soc = 0.62;
  let phase = "charge";                    // charge | hold | decay
  let tPhase = 0;
  let pulseT = 1;                          // 0..1 sweep, >=1 means idle
  let lastPulse = 0;
  let samples = new Array(120).fill(0);
  let lastSample = 0;
  let jitter = { temp: 31, soh: 98.4 };
  let lastJitter = 0;
  let running = false, rafId = null;

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const cssVar = (n, f) => (getComputedStyle(document.documentElement).getPropertyValue(n) || f).trim();

  /* ---------------------------- Derived values --------------------------- */
  const packVoltage = () => 13 * (3.40 + soc * 0.80);
  function current() {
    if (phase === "charge") return 12.4 - soc * 3.0;   // tapers as it fills
    if (phase === "hold") return 0.4;
    return -(8.0 + (1 - soc) * 4.0);                   // discharging
  }

  /* ------------------------------ Colours -------------------------------- */
  function refreshColors() {
    C = {
      teal: cssVar("--teal", "#5EEAD4"),
      blue: cssVar("--blue", "#6EA8FE"),
      violet: cssVar("--violet", "#A78BFA"),
      text: cssVar("--text", "#E6EDF3"),
      muted: cssVar("--text-muted", "#7D8896"),
      faint: cssVar("--text-faint", "#77818f"),
      line: cssVar("--line", "rgba(255,255,255,.09)"),
      lineStrong: cssVar("--line-strong", "rgba(255,255,255,.16)"),
      surface: cssVar("--surface", "#121821"),
      surface2: cssVar("--surface-2", "#161d28"),
      dark: document.documentElement.getAttribute("data-theme") !== "light",
    };
    statics = null;                        // force a re-render of the geometry
    if (!running) draw(performance.now()); // repaint immediately when frozen
  }

  /* --------------------- Pre-rendered static geometry -------------------- */
  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  function segRect(i) {
    // segment 0 = bottom
    const inset = 12, gap = 3;
    const innerH = body.h - inset * 2;
    const segH = (innerH - gap * (SEGMENTS - 1)) / SEGMENTS;
    const x = body.x + inset;
    const w = body.w - inset * 2;
    const y = body.y + inset + (SEGMENTS - 1 - i) * (segH + gap);
    return { x, y, w, h: segH };
  }

  function buildStatics() {
    const c2 = document.createElement("canvas");
    c2.width = BOX_W; c2.height = BOX_H;
    const g = c2.getContext("2d");

    // positive nub — this is what makes it read "battery" instantly
    roundRect(g, bodyCx - 32, 46, 64, 18, 6);
    g.fillStyle = C.surface2; g.fill();
    g.strokeStyle = C.lineStrong; g.lineWidth = 2; g.stroke();

    // cell body
    roundRect(g, body.x, body.y, body.w, body.h, body.r);
    g.fillStyle = C.dark ? "rgba(18,24,33,0.5)" : "#FFFFFF";
    g.fill();
    g.strokeStyle = C.lineStrong; g.lineWidth = 2; g.stroke();

    // unlit segments
    for (let i = 0; i < SEGMENTS; i++) {
      const s = segRect(i);
      roundRect(g, s.x, s.y, s.w, s.h, 4);
      if (C.dark) { g.strokeStyle = C.line; g.lineWidth = 1; g.stroke(); }
      else { g.fillStyle = "#F0F4F8"; g.fill(); }
    }

    // negative plate
    g.fillStyle = C.faint; g.globalAlpha = 0.4;
    roundRect(g, bodyCx - 60, 444, 120, 8, 4); g.fill();
    g.globalAlpha = 1;

    statics = c2;
  }

  /* ------------------------------- Physics ------------------------------- */
  function step(dt) {
    tPhase += dt;
    if (phase === "charge") {
      const T = 7000;
      soc = lerp(0.62, 0.97, easeInOut(clamp(tPhase / T, 0, 1)));
      if (tPhase >= T) { phase = "hold"; tPhase = 0; }
    } else if (phase === "hold") {
      if (tPhase >= 1200) { phase = "decay"; tPhase = 0; }
    } else {
      const T = 3500;
      soc = lerp(0.97, 0.62, easeInOut(clamp(tPhase / T, 0, 1)));
      if (tPhase >= T) { phase = "charge"; tPhase = 0; }
    }
  }

  /* -------------------------------- Draw --------------------------------- */
  function drawFill() {
    const lit = soc * SEGMENTS;
    const full = Math.floor(lit);
    const partial = lit - full;

    for (let i = 0; i < SEGMENTS; i++) {
      if (i > full) break;
      const s = segRect(i);
      const frac = i === full ? partial : 1;
      if (frac <= 0.001) continue;

      ctx.save();
      // clip the topmost segment so the fill is fluid, not steppy
      ctx.beginPath();
      ctx.rect(s.x, s.y + s.h * (1 - frac), s.w, s.h * frac);
      ctx.clip();

      const grad = ctx.createLinearGradient(0, body.y + body.h, 0, body.y);
      grad.addColorStop(0, C.teal);
      grad.addColorStop(0.5, C.blue);
      grad.addColorStop(1, C.violet);
      roundRect(ctx, s.x, s.y, s.w, s.h, 4);
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // charge pulse sweeping up the stack
    if (!RM && pulseT < 1) {
      const top = body.y + 12 + (body.h - 24) * (1 - soc);
      const bottom = body.y + body.h - 12;
      const y = lerp(bottom, top, pulseT);
      const g = ctx.createLinearGradient(0, y - 40, 0, y + 40);
      const col = C.dark ? "255,255,255" : "94,234,212";
      g.addColorStop(0, `rgba(${col},0)`);
      g.addColorStop(0.5, `rgba(${col},${C.dark ? 0.55 : 0.5})`);
      g.addColorStop(1, `rgba(${col},0)`);
      ctx.save();
      roundRect(ctx, body.x + 12, body.y + 12, body.w - 24, body.h - 24, 4);
      ctx.clip();
      ctx.fillStyle = g;
      ctx.fillRect(body.x, y - 40, body.w, 80);
      ctx.restore();
    }
  }

  function drawReadout() {
    const pct = Math.floor(soc * 100);
    ctx.textAlign = "left";
    ctx.fillStyle = C.text;
    ctx.font = "600 56px 'Space Grotesk', system-ui, sans-serif";
    const numW = ctx.measureText(String(pct)).width;
    ctx.fillText(String(pct), 24, 268);
    ctx.fillStyle = C.muted;
    ctx.font = "400 20px 'JetBrains Mono', monospace";
    ctx.fillText("%", 24 + numW + 6, 268);
    ctx.fillStyle = C.faint;
    ctx.font = "500 10px 'JetBrains Mono', monospace";
    ctx.letterSpacing = "1.8px";
    ctx.fillText("STATE OF CHARGE", 24, 292);
    ctx.letterSpacing = "0px";
  }

  function drawDock(ts) {
    const compact = W < 380;
    // glass panel
    roundRect(ctx, 0, dockY, BOX_W, 112, 14);
    ctx.fillStyle = C.dark ? "rgba(18,24,33,0.55)" : "rgba(255,255,255,0.65)";
    ctx.fill();
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.stroke();

    if (ts - lastJitter > 700) {
      jitter.temp = 30.6 + Math.random() * 0.9;
      jitter.soh = 98.3 + Math.random() * 0.3;
      lastJitter = ts;
    }

    const readouts = [
      [packVoltage().toFixed(1) + " V", C.teal],
      [(current() >= 0 ? "+" : "") + current().toFixed(1) + " A", current() >= 0 ? C.teal : C.violet],
      [jitter.temp.toFixed(1) + " °C", C.blue],
      ["SoH " + jitter.soh.toFixed(0) + "%", C.violet],
    ];
    const shown = compact ? readouts.slice(0, 2) : readouts;
    const colW = BOX_W / shown.length;
    ctx.textAlign = "center";
    ctx.font = "500 14px 'JetBrains Mono', monospace";
    shown.forEach(([txt, col], i) => {
      ctx.fillStyle = col;
      ctx.fillText(txt, colW * i + colW / 2, dockY + 30);
    });

    // sparkline of current
    if (ts - lastSample > 60) {
      samples.push(current());
      if (samples.length > 120) samples.shift();
      lastSample = ts;
      renderSpark();
    }
    if (spark) ctx.drawImage(spark, 20, dockY + 44, BOX_W - 40, 34);

    ctx.textAlign = "right";
    ctx.fillStyle = C.faint;
    ctx.font = "400 9px 'JetBrains Mono', monospace";
    ctx.fillText("simulated stream · from my Battery Health Dashboard", BOX_W - 14, dockY + 100);
    ctx.textAlign = "left";
  }

  function renderSpark() {
    if (!spark) {
      spark = document.createElement("canvas");
      spark.width = 760; spark.height = 68;
      sparkCtx = spark.getContext("2d");
    }
    const g = sparkCtx, w = spark.width, h = spark.height;
    g.clearRect(0, 0, w, h);
    const max = 16, mid = h / 2;
    // zero axis
    g.strokeStyle = C.line; g.lineWidth = 1;
    g.beginPath(); g.moveTo(0, mid); g.lineTo(w, mid); g.stroke();

    const pts = samples.map((v, i) => [(i / (samples.length - 1)) * w, mid - (v / max) * (h / 2 - 4)]);
    // area
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.lineTo(w, mid); g.lineTo(0, mid); g.closePath();
    g.fillStyle = (current() >= 0 ? C.teal : C.violet) + "1f";
    g.fill();
    // line
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.strokeStyle = current() >= 0 ? C.teal : C.violet;
    g.lineWidth = 3; g.lineJoin = "round";
    g.stroke();
  }

  function draw(ts) {
    if (!statics) buildStatics();
    ctx.clearRect(0, 0, BOX_W, BOX_H);
    ctx.drawImage(statics, 0, 0);
    drawFill();
    drawReadout();
    drawDock(ts);
  }

  /* -------------------------------- Loop --------------------------------- */
  let last = 0;
  function frame(ts) {
    if (!running) return;
    const dt = Math.min(ts - last, 50);
    last = ts;
    step(dt);
    if (ts - lastPulse > 2200) { pulseT = 0; lastPulse = ts; }
    if (pulseT < 1) pulseT += dt / 900;
    draw(ts);
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running || RM) return;
    running = true; last = performance.now();
    rafId = requestAnimationFrame(frame);
  }
  function stop() { running = false; if (rafId) cancelAnimationFrame(rafId); }

  /* ------------------------------- Resize -------------------------------- */
  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = rect.width || BOX_W;
    scale = W / BOX_W;
    H = BOX_H * scale;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(BOX_W * scale * DPR);
    canvas.height = Math.floor(BOX_H * scale * DPR);
    canvas.style.height = H + "px";
    ctx.setTransform(scale * DPR, 0, 0, scale * DPR, 0, 0);
    draw(performance.now());
  }

  /* -------------------------------- Init --------------------------------- */
  function init() {
    refreshColors();
    resize();
    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(resize, 150); });

    if (RM) { soc = 0.78; draw(performance.now()); return; }

    // only animate while the hero is on screen
    const io = new IntersectionObserver(
      (e) => (e[0].isIntersecting ? start() : stop()),
      { threshold: 0.05 }
    );
    io.observe(canvas);
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  }

  return { init, refreshColors, soc: () => soc };
})();

window.BatteryCell = BatteryCell;

/* =============================================================================
 *  latent-field.js  —  "THE ENERGY FIELD"
 * =============================================================================
 *  A live Canvas2D energy field that doubles as the site's hero art — charge
 *  nodes carried along flowing "currents", evoking energy moving through a
 *  battery / e-mobility system. (The public API is still named LatentField.)
 *
 *  What it does:
 *    • ~130 charge nodes (fewer on mobile) across 3 energy channels, colour-
 *      coded teal / blue / violet.
 *    • Nodes drift along a smooth flow field + spring toward a "home", so the
 *      field flows like current without dispersing. A spatial-hash grid draws
 *      the connecting lines at 60fps.
 *    • The cursor attracts nearby charge and brightens its links.
 *    • Every ~2s an "energy pulse" arcs along a short path of nodes.
 *    • Scroll morphs the whole field: galaxy → 3 lobes → single core.
 *    • Theme-aware: re-reads CSS colour variables on demand (refreshColors()).
 *    • Respects prefers-reduced-motion (static frame) and pauses when hidden.
 *
 *  No libraries. Pure Canvas2D + a tiny bit of maths.
 *  Public API (window.LatentField):
 *    .init()                 -> start the engine
 *    .setScrollProgress(p)   -> p in [0,1], drives the morph
 *    .refreshColors()        -> re-sample CSS vars (call after theme change)
 *    .pointerHint(x, y)      -> feed a pointer position (CSS px)
 * ========================================================================== */

const LatentField = (() => {
  "use strict";

  const canvas = document.getElementById("latent-field");
  if (!canvas) return { init() {}, setScrollProgress() {}, refreshColors() {}, pointerHint() {} };
  const ctx = canvas.getContext("2d", { alpha: true });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------ State ---------------------------------- */
  let W = 0, H = 0, DPR = 1;
  let nodes = [];
  let grid = new Map();           // spatial hash: "cx,cy" -> [nodeIndex, ...]
  let cellSize = 130;             // == edge threshold
  let colors = { clusters: [], edge: 0.5, nodeOpacity: 0.9, glow: 1, bg: "#0A0E14" };
  let sprites = [];               // cached glow sprite per cluster
  let pointer = { x: -9999, y: -9999, active: false };
  let scrollP = 0;                // 0 = hero, 1 = contact
  let flowTime = 0;               // advances the flow field (energy currents)
  let pulses = [];
  let lastPulse = 0;
  let waves = [];                 // "charge waves" that sweep across the field
  let lastWave = 0;
  let rafId = null;
  let running = false;

  const CLUSTER_COUNT = 3;
  const CLUSTER_LABELS = [
    ["Python", "sklearn", "PyTorch", "NumPy", "Keras"],       // teal  · ML
    ["pandas", "EDA", "Power BI", "SQL", "stats"],            // violet· Data
    ["Git", "Docker", "Colab", "VS Code", "Linux"],          // blue  · Tools
  ];

  /* --------------------------- Small helpers ----------------------------- */
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);

  function hexToRgb(hex) {
    hex = (hex || "").trim().replace("#", "");
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    const n = parseInt(hex, 16);
    if (isNaN(n)) return { r: 120, g: 220, b: 210 };
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function cssVar(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (v && v.trim()) || fallback;
  }

  /* ------------------------ Colour sampling ------------------------------ */
  function refreshColors() {
    colors.clusters = [
      hexToRgb(cssVar("--teal", "#5EEAD4")),
      hexToRgb(cssVar("--violet", "#A78BFA")),
      hexToRgb(cssVar("--blue", "#6EA8FE")),
    ];
    colors.edge = parseFloat(cssVar("--field-edge-opacity", "0.5")) || 0.5;
    colors.nodeOpacity = parseFloat(cssVar("--field-node-opacity", "0.9")) || 0.9;
    colors.glow = parseFloat(cssVar("--field-glow", "1")) || 1;
    colors.bg = cssVar("--bg", "#0A0E14");
    colors.isDark = document.documentElement.getAttribute("data-theme") !== "light";
    buildSprites();
    if (!running && reduceMotion) drawStaticFrame(); // repaint static frame on theme change
  }

  /* Pre-render one radial glow sprite per cluster (fast drawImage each frame) */
  function buildSprites() {
    sprites = colors.clusters.map((c) => {
      const size = 46;
      const s = document.createElement("canvas");
      s.width = s.height = size;
      const g = s.getContext("2d");
      const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      const a = colors.glow;
      grad.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${0.95 * a})`);
      grad.addColorStop(0.35, `rgba(${c.r},${c.g},${c.b},${0.35 * a})`);
      grad.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0)`);
      g.fillStyle = grad;
      g.fillRect(0, 0, size, size);
      return s;
    });
  }

  /* --------------------------- Layout maths ------------------------------ */
  // Three "home" layouts we blend between as the user scrolls.
  function clusterCenter(i, spreadX, spreadY) {
    // three lobes spread horizontally, centred vertically
    const cx = W * (0.24 + 0.26 * i);
    const cy = H * 0.5;
    return { cx, cy, spreadX, spreadY };
  }

  function computeHomes(n) {
    // galaxy: free spread across viewport
    n.gx = rand(W * 0.04, W * 0.96);
    n.gy = rand(H * 0.06, H * 0.94);
    // lobes: gather near cluster centre
    const c = clusterCenter(n.cluster, W * 0.11, H * 0.28);
    const ang = rand(0, Math.PI * 2), rad = Math.sqrt(Math.random());
    n.lx = c.cx + Math.cos(ang) * rad * c.spreadX;
    n.ly = c.cy + Math.sin(ang) * rad * c.spreadY;
    // core: collapse toward centre
    const ang2 = rand(0, Math.PI * 2), rad2 = Math.sqrt(Math.random());
    n.cx2 = W * 0.5 + Math.cos(ang2) * rad2 * W * 0.16;
    n.cy2 = H * 0.5 + Math.sin(ang2) * rad2 * H * 0.18;
  }

  function homeFor(n) {
    // p:0..0.5 galaxy->lobes, 0.5..1 lobes->core
    const t1 = clamp(scrollP / 0.5, 0, 1);
    const t2 = clamp((scrollP - 0.5) / 0.5, 0, 1);
    const hx = lerp(lerp(n.gx, n.lx, t1), n.cx2, t2);
    const hy = lerp(lerp(n.gy, n.ly, t1), n.cy2, t2);
    return { hx, hy };
  }

  /* ------------------------------ Build ---------------------------------- */
  function nodeCount() {
    const w = window.innerWidth;
    if (w < 560) return 46;
    if (w < 900) return 78;
    if (w < 1400) return 110;
    return 132;
  }

  function build() {
    const count = nodeCount();
    nodes = [];
    for (let i = 0; i < count; i++) {
      const cluster = i % CLUSTER_COUNT;
      const n = {
        cluster,
        x: rand(0, W), y: rand(0, H),
        vx: 0, vy: 0,
        r: rand(1.3, 2.9),
        pulse: rand(0, Math.PI * 2),
        pulseSpeed: rand(0.006, 0.016),
        // ~12% of nodes carry a mono label
        label: Math.random() < 0.12 ? CLUSTER_LABELS[cluster][(Math.random() * CLUSTER_LABELS[cluster].length) | 0] : null,
        cos: (0.82 + Math.random() * 0.17).toFixed(2), // fake "cosine similarity" for tooltip flavour
        lit: 0,
      };
      computeHomes(n);
      nodes.push(n);
    }
  }

  /* --------------------------- Spatial grid ------------------------------ */
  function rebuildGrid() {
    grid.clear();
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const key = ((n.x / cellSize) | 0) + "," + ((n.y / cellSize) | 0);
      let bucket = grid.get(key);
      if (!bucket) grid.set(key, (bucket = []));
      bucket.push(i);
    }
  }
  function neighbors(n) {
    const cx = (n.x / cellSize) | 0, cy = (n.y / cellSize) | 0;
    const out = [];
    for (let gx = cx - 1; gx <= cx + 1; gx++) {
      for (let gy = cy - 1; gy <= cy + 1; gy++) {
        const b = grid.get(gx + "," + gy);
        if (b) for (let k = 0; k < b.length; k++) out.push(b[k]);
      }
    }
    return out;
  }

  /* ---------------------------- Resize ----------------------------------- */
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cellSize = W < 700 ? 110 : 140;
    build();
    if (reduceMotion) drawStaticFrame();
  }

  /* --------------------------- Thought pulse ----------------------------- */
  function spawnPulse() {
    if (!nodes.length) return;
    let cur = (Math.random() * nodes.length) | 0;
    const path = [{ x: nodes[cur].x, y: nodes[cur].y }];
    const hops = 3 + ((Math.random() * 2) | 0);
    for (let h = 0; h < hops; h++) {
      const nb = neighbors(nodes[cur]).filter((j) => j !== cur);
      let best = -1, bestD = Infinity;
      for (const j of nb) {
        const dx = nodes[j].x - nodes[cur].x, dy = nodes[j].y - nodes[cur].y;
        const d = dx * dx + dy * dy;
        if (d < bestD && d > 4) { bestD = d; best = j; }
      }
      if (best === -1) break;
      cur = best;
      path.push({ x: nodes[cur].x, y: nodes[cur].y });
    }
    if (path.length < 2) return;
    // each pulse rides one of the 3 energy channels (colour), like current
    pulses.push({ path, t: 0, speed: 0.02 + Math.random() * 0.012, color: (Math.random() * 3) | 0 });
  }

  function drawPulses() {
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.t += p.speed;
      if (p.t >= 1) { pulses.splice(i, 1); continue; }
      const segs = p.path.length - 1;
      const f = p.t * segs;
      const si = Math.min(segs - 1, f | 0);
      const lt = f - si;
      const a = p.path[si], b = p.path[si + 1];
      const hx = lerp(a.x, b.x, lt), hy = lerp(a.y, b.y, lt);
      const c = colors.clusters[p.color] || colors.clusters[0];
      // trail: draw a few points behind the head
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let tstep = 0; tstep < 6; tstep++) {
        const tt = clamp(p.t - tstep * 0.03, 0, 1);
        const ff = tt * segs, ssi = Math.min(segs - 1, ff | 0), llt = ff - ssi;
        const pa = p.path[ssi], pb = p.path[ssi + 1];
        const tx = lerp(pa.x, pb.x, llt), ty = lerp(pa.y, pb.y, llt);
        const alpha = (1 - tstep / 6) * 0.6 * (1 - p.t * 0.4);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${alpha})`;
        ctx.arc(tx, ty, 2.4 - tstep * 0.25, 0, Math.PI * 2);
        ctx.fill();
      }
      // electric head: a coloured halo with a white-hot core
      ctx.beginPath();
      ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},0.5)`;
      ctx.arc(hx, hy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,0.95)`;
      ctx.arc(hx, hy, 2.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /* --------------------------- Charge waves ------------------------------ */
  // Every few seconds a bright "charge wave" sweeps across the field, flashing
  // nodes as it passes — the clearest cue that this is energy in motion.
  function spawnWave() {
    waves.push({
      t: 0,
      speed: 0.010 + Math.random() * 0.005,
      dir: Math.random() < 0.5 ? 1 : -1,
      color: (Math.random() * 3) | 0,
      front: 0,
      band: 120,
    });
  }

  function updateWaves() {
    for (let i = waves.length - 1; i >= 0; i--) {
      const w = waves[i];
      w.t += w.speed;
      if (w.t >= 1) { waves.splice(i, 1); continue; }
      w.front = w.dir > 0 ? lerp(-160, W + 160, w.t) : lerp(W + 160, -160, w.t);
      for (let k = 0; k < nodes.length; k++) {
        const d = Math.abs(nodes[k].x - w.front);
        if (d < w.band) nodes[k].lit = Math.max(nodes[k].lit, (1 - d / w.band) * 0.95);
      }
    }
  }

  function drawWaves() {
    if (!waves.length) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const w of waves) {
      const c = colors.clusters[w.color] || colors.clusters[0];
      const g = ctx.createLinearGradient(w.front - w.band, 0, w.front + w.band, 0);
      g.addColorStop(0, `rgba(${c.r},${c.g},${c.b},0)`);
      g.addColorStop(0.5, `rgba(${c.r},${c.g},${c.b},${0.16 * colors.glow})`);
      g.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(w.front - w.band, 0, w.band * 2, H);
    }
    ctx.restore();
  }

  /* ------------------------------ Physics -------------------------------- */
  function step() {
    const spring = 0.011;         // pulls nodes home (keeps shape for scroll-morph)
    const friction = 0.88;
    const flowScale = 0.006;      // spatial frequency of the current lanes
    const flowForce = 0.045;      // how strongly the current carries each node
    const interact = 150;         // cursor influence radius
    const interact2 = interact * interact;
    flowTime += 0.0025;

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const { hx, hy } = homeFor(n);

      // 1) spring toward home so the field keeps its shape
      n.vx += (hx - n.x) * spring;
      n.vy += (hy - n.y) * spring;

      // 2) energy "current": a smooth flow field carries the charge nodes like
      //    current moving through a grid — this is what makes it read as energy.
      const fx = Math.cos(n.y * flowScale + flowTime) + Math.sin(n.x * flowScale * 0.7 - flowTime);
      const fy = Math.sin(n.x * flowScale - flowTime) + Math.cos(n.y * flowScale * 0.7 + flowTime);
      n.vx += fx * flowForce;
      n.vy += fy * flowForce;

      // cursor gravity well
      n.lit *= 0.9;
      if (pointer.active) {
        const dx = pointer.x - n.x, dy = pointer.y - n.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < interact2) {
          const d = Math.sqrt(d2) || 1;
          const force = (1 - d / interact) * 0.9;
          n.vx += (dx / d) * force;
          n.vy += (dy / d) * force;
          n.lit = Math.max(n.lit, 1 - d / interact);
        }
      }

      n.vx *= friction; n.vy *= friction;
      n.x += n.vx; n.y += n.vy;
      n.pulse += n.pulseSpeed;
    }
  }

  /* ------------------------------ Render --------------------------------- */
  function drawEdges() {
    const thr = cellSize;
    const thr2 = thr * thr;
    const baseA = colors.edge * (1 - scrollP * 0.25);
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const nb = neighbors(n);
      for (let k = 0; k < nb.length; k++) {
        const j = nb[k];
        if (j <= i) continue;
        const m = nodes[j];
        const dx = m.x - n.x, dy = m.y - n.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > thr2) continue;
        const d = Math.sqrt(d2);
        let a = (1 - d / thr) * baseA;
        const lit = Math.max(n.lit, m.lit);
        a *= 1 + lit * 1.6;               // brighten near cursor
        if (a <= 0.01) continue;
        let col;
        if (n.cluster === m.cluster) {
          const c = colors.clusters[n.cluster];
          col = `rgba(${c.r},${c.g},${c.b},${a})`;
        } else {
          col = `rgba(150,160,180,${a * 0.5})`; // cross-cluster = faint neutral
        }
        ctx.strokeStyle = col;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();
      }
    }
  }

  function drawNodes() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const sprite = sprites[n.cluster];
      const pulseR = n.r * (1 + Math.sin(n.pulse) * 0.18) + n.lit * 2.4;
      const glowSize = (pulseR + 8) * 2.2;
      ctx.globalAlpha = colors.nodeOpacity * (0.55 + n.lit * 0.45);
      ctx.drawImage(sprite, n.x - glowSize / 2, n.y - glowSize / 2, glowSize, glowSize);
    }
    ctx.restore();

    // crisp core dots + labels
    ctx.save();
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const c = colors.clusters[n.cluster];
      const pulseR = n.r * (1 + Math.sin(n.pulse) * 0.18) + n.lit * 1.6;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${clamp(0.5 + n.lit, 0, 1)})`;
      ctx.arc(n.x, n.y, pulseR, 0, Math.PI * 2);
      ctx.fill();

      if (n.label && n.lit > 0.35) {
        ctx.globalAlpha = clamp(n.lit, 0, 1);
        ctx.fillStyle = colors.isDark ? "rgba(230,237,243,0.95)" : "rgba(10,14,20,0.9)";
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.fillText(`${n.label} · ${n.cos}`, n.x + 8, n.y - 8);
        ctx.globalAlpha = 1;
      }
    }
    ctx.restore();
  }

  function drawStaticFrame() {
    // one elegant frozen frame for reduced-motion users
    ctx.clearRect(0, 0, W, H);
    for (const n of nodes) { const h = homeFor(n); n.x = h.hx; n.y = h.hy; }
    rebuildGrid();
    drawEdges();
    drawNodes();
  }

  /* ------------------------------- Loop ---------------------------------- */
  function frame(ts) {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    step();
    if (ts - lastWave > 3400) { spawnWave(); lastWave = ts; }
    updateWaves();
    rebuildGrid();
    drawEdges();
    drawWaves();
    if (ts - lastPulse > 2200 && pulses.length < 3) { spawnPulse(); lastPulse = ts; }
    drawPulses();
    drawNodes();
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduceMotion) return;
    running = true;
    lastPulse = performance.now();
    rafId = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  }

  /* ------------------------------ Public --------------------------------- */
  function init() {
    refreshColors();
    resize();

    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(resize, 180); });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });

    if (reduceMotion) {
      drawStaticFrame();
    } else {
      start();
    }
  }

  function setScrollProgress(p) { scrollP = clamp(p, 0, 1); }
  function pointerHint(x, y) {
    if (x == null) { pointer.active = false; return; }
    pointer.x = x; pointer.y = y; pointer.active = true;
  }

  return { init, setScrollProgress, refreshColors, pointerHint };
})();

window.LatentField = LatentField;

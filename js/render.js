/* =============================================================================
 *  render.js  —  Builds the page content from js/data.js
 * =============================================================================
 *  Keeps HTML clean and content in one place. Every section's data-driven
 *  parts are generated here; structure/chrome stays in index.html.
 *
 *  Exposes window.Render.init(), called by main.js after data + icons load.
 * ========================================================================== */

const Render = (() => {
  "use strict";
  const D = window.PORTFOLIO || {};
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* Map a skill category -> one of the 3 cluster colours (CSS var name). */
  function clusterColor(name) {
    const n = (name || "").toLowerCase();
    if (n.includes("data") || n.includes("analyt") || n.includes(" ai") || n.includes("ml")) return "--violet";
    if (n.includes("battery") || n.includes("product") || n.includes("mobility") ||
        n.includes("web") || n.includes("tool") || n.includes("platform")) return "--blue";
    return "--teal"; // backend / software / core
  }
  const ACCENT_VAR = { primary: "--teal", secondary: "--violet", tertiary: "--blue" };

  /* Project status -> colour class + glyph (honest framing for in-progress work) */
  const STATUS = {
    Building: { cls: "is-building", dot: "◐" },
    Planned:  { cls: "is-planned",  dot: "○" },
    Concept:  { cls: "is-concept",  dot: "◌" },
    Live:     { cls: "is-live",     dot: "●" },
  };

  /* --------------------- icons + simple text bindings -------------------- */
  function injectIcons() {
    $$("[data-icon]").forEach((n) => {
      const name = n.getAttribute("data-icon");
      if (name && window.ICONS) n.innerHTML = window.ICONS.get(name);
    });
  }
  function bindText() {
    const map = {
      name: D.meta?.name,
      tagline: D.meta?.tagline,
      availability: D.meta?.availability,
      contactHeading: D.contact?.heading,
      contactSub: D.contact?.subtext,
    };
    $$("[data-bind]").forEach((n) => {
      const key = n.getAttribute("data-bind");
      if (map[key] != null) n.textContent = map[key];
    });
    if (D.meta?.name) document.title = `${D.meta.name} — ${D.meta.role || "Portfolio"}`;
    const sub = $("#heroSubline");
    if (sub && D.meta) sub.textContent = "// " + (D.meta.subline || `B.Tech AI & Data Science · ${D.meta.location || ""}`);
    const resume = $("#resumeBtn");
    if (resume) {
      if (D.meta?.resumeUrl) resume.setAttribute("href", D.meta.resumeUrl);
      else resume.style.display = "none"; // no dead "#" link when résumé is unset
    }
  }

  /* ------------------------------- HERO ---------------------------------- */
  function hero() {
    const ul = $("#heroStats");
    if (ul && D.stats) {
      D.stats.forEach((s) => {
        const li = el("li", "stat");
        li.innerHTML =
          `<div class="stat__value"><span class="grad-text" data-count="${s.value}" data-suffix="${esc(s.suffix || "")}">0</span></div>
           <div class="stat__label">${esc(s.label)}</div>`;
        ul.appendChild(li);
      });
    }
  }

  /* ------------------------------ ABOUT ---------------------------------- */
  function about() {
    const body = $("#aboutBody");
    if (body && D.about) {
      D.about.paragraphs?.forEach((p) => {
        body.appendChild(el("p", "", esc(p)));
      });
      if (D.about.highlights?.length) {
        const wrap = el("div", "about__highlights");
        D.about.highlights.forEach((h) => wrap.appendChild(el("span", "chip", esc(h))));
        body.appendChild(wrap);
      }
    }
    const spec = $("#specSheet");
    if (spec && D.meta) {
      const rows = [
        ["role", esc(D.meta.role)],
        ["status", `<span class="ok">● ${esc(D.meta.availability)}</span>`],
        ["degree", "B.Tech · AI &amp; DS"],
        ["class", "2024"],
        ["location", esc(D.meta.location)],
        ["email", esc(D.contact?.email || "")],
      ];
      rows.forEach(([k, v]) => {
        const r = el("div", "spec-row");
        r.innerHTML = `<dt>${k}</dt><dd>${v}</dd>`;
        spec.appendChild(r);
      });
    }
  }

  /* ------------------------------ SKILLS --------------------------------- */
  function skills() {
    // Legend is generated from the ACTUAL categories, grouped by cluster colour,
    // so it never desyncs when you edit skills in data.js.
    const legend = $("#clusterLegend");
    if (legend && D.skills) {
      const groups = new Map([["--teal", []], ["--violet", []], ["--blue", []]]);
      D.skills.forEach((g) => {
        const c = clusterColor(g.category);
        if (!groups.has(c)) groups.set(c, []);
        groups.get(c).push(g.category);
      });
      legend.innerHTML = Array.from(groups.entries())
        .filter(([, names]) => names.length)
        .map(([v, names]) => `<span class="legend-item"><span class="legend-swatch" style="background:var(${v});color:var(${v})"></span>${names.map(esc).join(" · ")}</span>`)
        .join("");
    }
    const matrix = $("#skillMatrix");
    if (matrix && D.skills) {
      D.skills.forEach((group) => {
        const cvar = clusterColor(group.category);
        const g = el("div", "skill-group");
        g.style.setProperty("--group-color", `var(${cvar})`);
        const cells = (group.items || [])
          .map(
            (it) =>
              `<div class="cell" style="--lvl:${it.level}" data-reveal-cell tabindex="0" aria-label="${esc(it.name)}: ${it.level}%">
                 <span class="cell__name">${esc(it.name)}</span>
                 <span class="cell__val">${it.level}%</span>
                 <span class="cell__bar"></span>
               </div>`
          )
          .join("");
        g.innerHTML =
          `<div class="skill-group__head">
             <span class="skill-group__icon" data-icon="${esc(group.icon || "cpu")}"></span>
             <span class="skill-group__title">${esc(group.category)}</span>
           </div>
           <div class="skill-cells">${cells}</div>`;
        matrix.appendChild(g);
      });
    }
  }

  /* ---------------------- micro-viz for project cards -------------------- */
  // Three glance-able chart types, cycled per card. Drawn via CSS stroke-dash
  // once the card scrolls in (class .is-in). All inherit currentColor/accent.
  function microViz(type) {
    if (type === 0) {
      // loss curve (sparkline) — descends then wiggles
      const pts = [4, 30, 20, 45, 26, 55, 34, 60, 40, 66, 47, 70, 52, 74, 58, 78, 63];
      // build a smooth-ish descending loss line across width 100, height 40
      const xs = pts.length;
      let d = "";
      for (let i = 0; i < xs; i++) {
        const x = (i / (xs - 1)) * 100;
        const y = 38 - (Math.log(i + 1) / Math.log(xs)) * 30 + Math.sin(i) * 1.6;
        d += (i === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1) + " ";
      }
      return `<svg viewBox="0 0 100 40" preserveAspectRatio="none" fill="none" style="color:var(--card-accent)">
        <line x1="0" y1="39" x2="100" y2="39" stroke="currentColor" stroke-opacity="0.18"/>
        <path class="viz-draw" d="${d}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    }
    if (type === 1) {
      // confusion-matrix micro grid 3x3
      const vals = [0.9, 0.1, 0.05, 0.08, 0.86, 0.12, 0.04, 0.09, 0.91];
      let cells = "";
      for (let r = 0; r < 3; r++)
        for (let c = 0; c < 3; c++) {
          const v = vals[r * 3 + c];
          cells += `<rect class="viz-cell" x="${c * 22 + 20}" y="${r * 12}" width="20" height="10" rx="2"
                     fill="currentColor" fill-opacity="${(0.12 + v * 0.8).toFixed(2)}" style="--i:${r * 3 + c}"/>`;
        }
      return `<svg viewBox="0 0 100 40" style="color:var(--card-accent)">${cells}</svg>`;
    }
    // bar cluster
    const hs = [22, 34, 18, 30, 38, 26];
    let bars = "";
    hs.forEach((h, i) => {
      bars += `<rect class="viz-bar" x="${i * 16 + 6}" y="${40 - h}" width="9" height="${h}" rx="2"
                fill="currentColor" fill-opacity="${(0.4 + (i % 3) * 0.2).toFixed(2)}" style="--i:${i}"/>`;
    });
    return `<svg viewBox="0 0 100 40" style="color:var(--card-accent)">${bars}</svg>`;
  }

  /* ------------------------------- WORK ---------------------------------- */
  function work() {
    const grid = $("#workGrid");
    if (!grid || !D.projects) return;
    D.projects.forEach((p, i) => {
      const card = el("article", "work-card" + (p.featured ? " is-featured" : ""));
      card.style.setProperty("--card-accent", `var(${ACCENT_VAR[p.accent] || "--teal"})`);
      card.setAttribute("data-reveal", "");
      const tags = (p.tags || []).map((t) => `<span class="tag-pill">${esc(t)}</span>`).join("");

      // Only render links that actually exist; otherwise show an honest note.
      const realLinks = [];
      if (p.liveUrl && p.liveUrl !== "#")
        realLinks.push(`<a class="work-card__link" href="${esc(p.liveUrl)}" target="_blank" rel="noopener"><span data-icon="external"></span> Live</a>`);
      if (p.codeUrl && p.codeUrl !== "#")
        realLinks.push(`<a class="work-card__link" href="${esc(p.codeUrl)}" target="_blank" rel="noopener"><span data-icon="github"></span> Code</a>`);
      const linksHtml = realLinks.length
        ? realLinks.join("")
        : `<span class="work-card__soon mono"><span data-icon="tool"></span> In development</span>`;

      const st = STATUS[p.status];
      const statusHtml = st ? `<span class="work-card__status ${st.cls}">${st.dot} ${esc(p.status)}</span>` : "";

      card.innerHTML =
        `<div class="work-card__top">
           <div class="work-card__meta-left">
             <span class="work-card__idx">WORK / ${String(i + 1).padStart(3, "0")}</span>
             ${statusHtml}
           </div>
           <span class="work-card__metric">${esc(p.metric || "")}</span>
         </div>
         <div class="work-card__viz">${microViz(i % 3)}</div>
         <h3 class="work-card__title">${esc(p.title)}</h3>
         <p class="work-card__blurb">${esc(p.blurb)}</p>
         <div class="work-card__tags">${tags}</div>
         <div class="work-card__links">${linksHtml}</div>`;
      grid.appendChild(card);
    });
  }

  /* ----------------------------- TIMELINE -------------------------------- */
  function timeline() {
    const wrap = $("#timeline");
    if (!wrap || !D.timeline) return;
    const iconFor = { education: "graduation-cap", experience: "briefcase", certification: "award" };
    D.timeline.forEach((t) => {
      const entry = el("div", "tl-entry");
      entry.setAttribute("data-reveal", "");
      const points = (t.points || []).map((p) => `<li>${esc(p)}</li>`).join("");
      entry.innerHTML =
        `<span class="tl-dot" data-icon="${iconFor[t.type] || "sparkle"}"></span>
         <span class="tl-period">${esc(t.period)}</span>
         <h3 class="tl-title">${esc(t.title)}</h3>
         <p class="tl-place">${esc(t.place)}</p>
         <ul class="tl-points">${points}</ul>`;
      wrap.appendChild(entry);
    });
  }

  /* ---------------------- BEYOND THE CODE (sports) ----------------------- */
  function athletics() {
    const A = D.athletics;
    if (!A) return;
    const sub = $("#beyondSub");
    if (sub && A.subtext) sub.textContent = A.subtext;
    const wrap = $("#beyondGrid");
    if (!wrap || !A.achievements) return;
    A.achievements.forEach((a) => {
      const card = el("article", "medal-card");
      card.style.setProperty("--card-accent", `var(${ACCENT_VAR[a.accent] || "--teal"})`);
      card.setAttribute("data-reveal", "");
      card.innerHTML =
        `<div class="medal-card__top">
           <span class="medal-card__icon" data-icon="${esc(a.icon || "award")}"></span>
           ${a.tier ? `<span class="medal-card__tier mono">${esc(a.tier)}</span>` : ""}
         </div>
         <span class="medal-card__sport mono">${esc(a.sport || "")}</span>
         <h3 class="medal-card__title">${esc(a.title)}</h3>
         ${a.detail ? `<p class="medal-card__detail">${esc(a.detail)}</p>` : ""}`;
      wrap.appendChild(card);
    });
  }

  /* ----------------------------- CONTACT --------------------------------- */
  function contact() {
    const wrap = $("#contactSocials");
    if (!wrap || !D.contact?.socials) return;
    D.contact.socials.forEach((s) => {
      const a = el("a", "social-node");
      a.href = s.url; a.setAttribute("aria-label", s.name);
      if (/^https?:/.test(s.url)) { a.target = "_blank"; a.rel = "noopener"; }
      a.innerHTML = `<span data-icon="${esc(s.icon)}"></span><span>${esc(s.name)}</span><span class="social-node__handle">${esc(s.handle || "")}</span>`;
      wrap.appendChild(a);
    });
  }

  /* ------------------------------- init ---------------------------------- */
  function init() {
    // Each section is isolated so a bad edit in data.js can't blank the whole
    // page — the other sections and icons still render.
    const safe = (fn, name) => { try { fn(); } catch (err) { console.error("[render:" + name + "]", err); } };
    safe(bindText, "bindText");
    safe(hero, "hero");
    safe(about, "about");
    safe(skills, "skills");
    safe(work, "work");
    safe(timeline, "timeline");
    safe(athletics, "athletics");
    safe(contact, "contact");
    injectIcons(); // after all dynamic [data-icon] are in the DOM
  }

  return { init };
})();

window.Render = Render;

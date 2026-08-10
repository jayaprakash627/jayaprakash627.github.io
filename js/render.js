/* =============================================================================
 *  render.js  —  Builds the page content from js/data.js
 * =============================================================================
 *  Keeps HTML clean and content in one place. Structure/chrome stays in
 *  index.html; everything data-driven is generated here.
 *
 *  Exposes window.Render.init(), called by main.js.
 * ========================================================================== */

const Render = (() => {
  "use strict";
  const D = window.PORTFOLIO || {};
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* Map a capability group -> one of the 3 accent colours. */
  function clusterColor(name) {
    const n = (name || "").toLowerCase();
    if (n.includes("real-time") || n.includes("data")) return "--violet";
    if (n.includes("ownership") || n.includes("battery") || n.includes("mobility")) return "--blue";
    return "--teal"; // backend / API
  }
  const ACCENT_VAR = { primary: "--teal", secondary: "--violet", tertiary: "--blue" };

  /* Project status -> colour class + glyph (honest framing) */
  const STATUS = {
    Shipped:  { cls: "is-live",     dot: "●" },
    Building: { cls: "is-building", dot: "◐" },
    Planned:  { cls: "is-planned",  dot: "○" },
    Concept:  { cls: "is-concept",  dot: "◌" },
  };

  /* level -> honest band (we never print a self-scored percentage) */
  const band = (l) => (l >= 80 ? { n: 3, label: "Core" } : l >= 68 ? { n: 2, label: "Working" } : { n: 1, label: "Learning" });

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
      eyebrow: D.meta?.eyebrow,
      availability: D.meta?.availability,
      contactHeading: D.contact?.heading,
      contactSub: D.contact?.subtext,
    };
    $$("[data-bind]").forEach((n) => {
      const key = n.getAttribute("data-bind");
      if (map[key] != null) n.textContent = map[key];
    });
    if (D.meta?.name) document.title = `${D.meta.name} — ${D.meta.role || "Portfolio"}`;

    const resume = $("#resumeBtn");
    if (resume) {
      if (D.meta?.resumeUrl) resume.setAttribute("href", D.meta.resumeUrl);
      else resume.remove(); // no dead link while the new résumé is being written
    }
  }

  /* ------------------------------- HERO ---------------------------------- */
  function hero() {
    // Headline — last line gets the gradient + charge-bar underline
    const h1 = $("#heroTitle");
    if (h1 && D.meta?.headline) {
      h1.innerHTML = D.meta.headline
        .map((line, i) =>
          `<span class="hero__line${i === D.meta.headline.length - 1 ? " hero__charge" : ""}">${esc(line)}</span>`
        )
        .join("");
    }

    // Tagline — bold the ownership phrases so a 3-second skim lands them
    const tag = $("#heroTagline");
    if (tag && D.meta?.tagline) {
      let html = esc(D.meta.tagline);
      (D.meta.taglineBold || []).forEach((p) => {
        html = html.replace(esc(p), `<strong>${esc(p)}</strong>`);
      });
      tag.innerHTML = html;
    }

    // Proof bar
    const ul = $("#heroProof");
    if (ul && D.proof) {
      D.proof.forEach((p) => {
        const li = el("li", "proof-item");
        li.style.setProperty("--proof-accent", `var(${ACCENT_VAR[p.accent] || "--teal"})`);
        li.innerHTML = `<span class="proof-item__label mono">${esc(p.label)}</span>
                        <span class="proof-item__value">${esc(p.value)}</span>`;
        ul.appendChild(li);
      });
    }
  }

  /* ------------------------------ ABOUT ---------------------------------- */
  function about() {
    const body = $("#aboutBody");
    if (body && D.about) {
      D.about.paragraphs?.forEach((p) => body.appendChild(el("p", "", esc(p))));
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
        ["company", "Zenfinity Energy"],
        ["focus", "Battery &amp; e-mobility software"],
        ["status", `<span class="ok">● open to talking</span>`],
        ["degree", "B.Tech · AI &amp; DS · 2024"],
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

  /* --------------------------- WHAT I CAN OWN ---------------------------- */
  function skills() {
    const intro = $("#skillsIntro");
    if (intro && D.skillsIntro) intro.textContent = D.skillsIntro;

    const matrix = $("#skillMatrix");
    if (!matrix || !D.skills) return;

    D.skills.forEach((group) => {
      const cvar = clusterColor(group.category);
      const g = el("article", "skill-group");
      g.style.setProperty("--group-color", `var(${cvar})`);
      g.setAttribute("data-reveal", "");

      const cells = (group.items || [])
        .map((it) => {
          const b = band(it.level);
          const pips = [0, 1, 2]
            .map((i) => `<span class="pip${i < b.n ? " is-on" : ""}"></span>`)
            .join("");
          return `<li class="cap" aria-label="${esc(it.name)}: ${b.label}">
                    <span class="cap__name">${esc(it.name)}</span>
                    <span class="cap__meter">${pips}<span class="cap__band mono">${b.label}</span></span>
                  </li>`;
        })
        .join("");

      g.innerHTML =
        `<div class="skill-group__head">
           <span class="skill-group__icon" data-icon="${esc(group.icon || "cpu")}"></span>
           <h3 class="skill-group__title">${esc(group.category)}</h3>
         </div>
         ${group.claim ? `<p class="skill-group__claim">${esc(group.claim)}</p>` : ""}
         <ul class="skill-cells">${cells}</ul>
         ${group.proof ? `<p class="skill-group__proof mono">${esc(group.proof)}</p>` : ""}`;
      matrix.appendChild(g);
    });
  }

  /* ------------------------------ PROCESS -------------------------------- */
  function process() {
    const P = D.process;
    if (!P) return;
    const sub = $("#processSub");
    if (sub) sub.textContent = P.subtext || "";
    const closing = $("#processClosing");
    if (closing) closing.textContent = P.closing || "";
    const grid = $("#processGrid");
    if (!grid || !P.steps) return;
    P.steps.forEach((s, i) => {
      const li = el("li", "step");
      li.setAttribute("data-reveal", "");
      li.innerHTML =
        `<span class="step__idx mono">${String(i + 1).padStart(2, "0")}</span>
         <h3 class="step__title">${esc(s.title)}</h3>
         <p class="step__text">${esc(s.text)}</p>`;
      grid.appendChild(li);
    });
  }

  /* ---------------------- micro-viz for project cards -------------------- */
  function microViz(type) {
    if (type === 0) {
      const xs = 17;
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
    const hs = [22, 34, 18, 30, 38, 26];
    let bars = "";
    hs.forEach((h, i) => {
      bars += `<rect class="viz-bar" x="${i * 16 + 6}" y="${40 - h}" width="9" height="${h}" rx="2"
                fill="currentColor" fill-opacity="${(0.4 + (i % 3) * 0.2).toFixed(2)}" style="--i:${i}"/>`;
    });
    return `<svg viewBox="0 0 100 40" style="color:var(--card-accent)">${bars}</svg>`;
  }

  /* ------------------------------- WORK ---------------------------------- */
  function projectCard(p, i) {
    const card = el("article", "work-card" + (p.featured ? " is-featured" : ""));
    card.style.setProperty("--card-accent", `var(${ACCENT_VAR[p.accent] || "--teal"})`);
    card.setAttribute("data-reveal", "");

    const tags = (p.tags || []).map((t) => `<span class="tag-pill">${esc(t)}</span>`).join("");

    const links = [];
    if (p.liveUrl && p.liveUrl !== "#")
      links.push(`<a class="work-card__link" href="${esc(p.liveUrl)}" target="_blank" rel="noopener"><span data-icon="external"></span> Live demo</a>`);
    if (p.codeUrl && p.codeUrl !== "#")
      links.push(`<a class="work-card__link" href="${esc(p.codeUrl)}" target="_blank" rel="noopener"><span data-icon="github"></span> Read the code</a>`);
    const linksHtml = links.length
      ? links.join("")
      : `<span class="work-card__soon mono"><span data-icon="tool"></span> In development</span>`;

    const st = STATUS[p.status];
    const statusHtml = st ? `<span class="work-card__status ${st.cls}">${st.dot} ${esc(p.status)}</span>` : "";

    // Expandable engineering notes for shipped work
    let study = "";
    if (p.study) {
      // Optional rows render only when the project supplies them, so adding a
      // new field to one project doesn't leave empty rows on all the others.
      const row = (label, text, cls = "") =>
        text ? `<div class="study__row ${cls}"><dt class="mono">${label}</dt><dd>${esc(text)}</dd></div>` : "";
      study =
        `<details class="study">
           <summary class="study__summary mono">Read the engineering notes <span class="study__chev">⌄</span></summary>
           <dl class="study__body">
             ${row("The problem", p.study.problem)}
             ${row("What I built", p.study.built)}
             ${row("Decisions I made", p.study.decisions)}
             ${row("Scope, honestly", p.study.scope, "study__row--scope")}
             ${row("What I changed after feedback", p.study.rebuilt)}
             ${row("What it proves", p.study.proves)}
           </dl>
         </details>`;
    }

    card.innerHTML =
      `<div class="work-card__top">
         <div class="work-card__meta-left">
           <span class="work-card__idx">${String(i + 1).padStart(3, "0")}</span>
           ${statusHtml}
         </div>
         <span class="work-card__metric">${esc(p.metric || "")}</span>
       </div>
       <div class="work-card__viz">${microViz(i % 3)}</div>
       <h3 class="work-card__title">${esc(p.title)}</h3>
       <p class="work-card__blurb">${esc(p.blurb)}</p>
       <div class="work-card__tags">${tags}</div>
       ${study}
       <div class="work-card__links">${linksHtml}</div>`;
    return card;
  }

  function work() {
    const grid = $("#workGrid");
    const roadmapGrid = $("#workRoadmap");
    const nextWrap = $("#workNext");
    if (!grid || !D.projects) return;

    const shipped = D.projects.filter((p) => p.status === "Shipped");
    const rest = D.projects.filter((p) => p.status !== "Shipped");

    shipped.forEach((p, i) => grid.appendChild(projectCard(p, i)));
    if (rest.length && roadmapGrid && nextWrap) {
      nextWrap.hidden = false;
      rest.forEach((p, i) => roadmapGrid.appendChild(projectCard(p, shipped.length + i)));
    }
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

  /* --------------------------- WHERE I'M GOING --------------------------- */
  function direction() {
    const Dir = D.direction;
    if (!Dir) return;
    const lead = $("#directionLead");
    if (lead) lead.textContent = Dir.lead || "";
    const grid = $("#directionGrid");
    if (!grid || !Dir.cards) return;
    Dir.cards.forEach((c) => {
      const card = el("article", "dir-card");
      card.style.setProperty("--card-accent", `var(${ACCENT_VAR[c.accent] || "--teal"})`);
      card.setAttribute("data-reveal", "");
      card.innerHTML =
        `<span class="dir-card__label mono">${esc(c.label)}</span>
         <p class="dir-card__text">${esc(c.text)}</p>`;
      grid.appendChild(card);
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
    const safe = (fn, name) => { try { fn(); } catch (err) { console.error("[render:" + name + "]", err); } };
    safe(bindText, "bindText");
    safe(hero, "hero");
    safe(about, "about");
    safe(skills, "skills");
    safe(process, "process");
    safe(work, "work");
    safe(timeline, "timeline");
    safe(athletics, "athletics");
    safe(direction, "direction");
    safe(contact, "contact");
    injectIcons();
  }

  return { init };
})();

window.Render = Render;

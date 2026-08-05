/* =============================================================================
 *  interactions.js  —  All UI behaviour & motion wiring
 * =============================================================================
 *  Scroll reveals, scroll-spy nav, theme toggle (with dawn wipe), hero typing,
 *  role rotator, stat counters, notebook "run", magnetic buttons, 3D card tilt,
 *  heading decode, cursor readout, footer clock, timeline beam, and feeding
 *  scroll/pointer state to the Latent Field.
 *
 *  Exposes window.Interactions.init(), called by main.js.
 * ========================================================================== */

const Interactions = (() => {
  "use strict";
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const D  = window.PORTFOLIO || {};
  const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none)").matches;

  /* ===================== Scroll reveals + in-view ========================= */
  function reveals() {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible", "is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    $$("[data-reveal]").forEach((n) => io.observe(n));

    // Skill cells animate their bars when scrolled in (staggered)
    const cellIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const cells = $$(".cell", e.target);
            cells.forEach((c, i) => setTimeout(() => c.classList.add("is-in"), RM ? 0 : i * 70));
            cellIO.unobserve(e.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    $$(".skill-group").forEach((g) => cellIO.observe(g));
  }

  /* ============================ Navbar ==================================== */
  function nav() {
    const bar = $("#nav");
    const menuBtn = $("#menuBtn");
    const links = $("#navLinks");

    menuBtn?.addEventListener("click", () => {
      const open = links.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    $$(".nav__link").forEach((l) =>
      l.addEventListener("click", () => {
        links.classList.remove("is-open");
        menuBtn?.setAttribute("aria-expanded", "false");
      })
    );

    // scroll-spy: highlight the section currently in view
    const ids = ["top", "about", "skills", "work", "journey", "beyond", "contact"];
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            $$(".nav__link").forEach((l) => l.classList.remove("is-active"));
            const link = $(`.nav__link[href="#${e.target.id}"]`);
            link?.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.forEach((id) => { const s = document.getElementById(id); if (s) spy.observe(s); });

    // shrink/blur bar on scroll — batched into the shared scroll loop
    onScroll(() => bar?.classList.toggle("is-scrolled", window.scrollY > 12));
  }

  /* ===================== Shared scroll loop (rAF) ========================= */
  const scrollFns = [];
  function onScroll(fn) { scrollFns.push(fn); }
  function startScrollLoop() {
    let ticking = false;
    const run = () => { scrollFns.forEach((f) => f()); ticking = false; };
    window.addEventListener(
      "scroll",
      () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } },
      { passive: true }
    );
    run(); // initial
  }

  /* ================= Scroll progress -> Latent Field morph ================ */
  function fieldMorph() {
    onScroll(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      window.LatentField?.setScrollProgress(p);
    });
  }

  /* ======================= Timeline progress beam ======================== */
  function timelineBeam() {
    const beam = $("#timelineBeam");
    const section = $(".journey");
    if (!beam || !section) return;
    onScroll(() => {
      const r = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = r.height;
      const passed = Math.min(Math.max(vh * 0.6 - r.top, 0), total);
      beam.style.height = (total ? (passed / total) * 100 : 0) + "%";
    });
  }

  /* ============================ Hero typing ============================== */
  function heroType() {
    const target = $("#heroTyped");
    if (!target) return;
    const text = `jayaprakash.run("about")`;
    if (RM) { target.textContent = text; return; }
    let i = 0;
    const tick = () => {
      target.textContent = text.slice(0, i);
      if (i++ <= text.length) setTimeout(tick, 55 + Math.random() * 40);
    };
    setTimeout(tick, 600);
  }

  /* =========================== Role rotator ============================== */
  function roleRotator() {
    const box = $("#roleRotator");
    if (!box) return;
    const roles = D.meta?.rotatingRoles || [];
    // One reusable span — no stacking, so it can never "lock up" even when the
    // tab is backgrounded and timers get throttled. Fade the word out, swap the
    // text while it's invisible, then animate the new word in.
    box.textContent = "";
    const span = document.createElement("span");
    span.textContent = roles[0] || "";
    box.appendChild(span);
    if (roles.length <= 1 || RM) return;

    let idx = 0;
    let swapping = false;
    setInterval(() => {
      if (swapping) return;               // guard against overlapping cycles
      swapping = true;
      span.classList.add("is-out");
      setTimeout(() => {
        idx = (idx + 1) % roles.length;
        span.textContent = roles[idx];
        span.classList.remove("is-out", "is-in");
        void span.offsetWidth;            // restart the entrance animation
        span.classList.add("is-in");
        swapping = false;
      }, 300);
    }, 2800);
  }

  /* ============================ Stat counters ============================ */
  function counters() {
    const nums = $$("[data-count]");
    if (!nums.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const node = e.target;
          const end = parseFloat(node.getAttribute("data-count")) || 0;
          const suffix = node.getAttribute("data-suffix") || "";
          if (RM) { node.textContent = end + suffix; io.unobserve(node); return; }
          const dur = 1400, start = performance.now();
          const tick = (now) => {
            const t = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            node.textContent = Math.round(end * eased) + suffix;
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.unobserve(node);
        });
      },
      { threshold: 0.6 }
    );
    nums.forEach((n) => io.observe(n));
  }

  /* ========================= Notebook "run" ============================= */
  function notebook() {
    const btn = $("#runCell");
    const out = $("#cellOut");
    const counter = $("#cellCounter");
    if (!btn || !out) return;
    let done = false;
    const run = () => {
      if (done) return;
      done = true;
      if (counter) counter.textContent = "In [*]:";
      setTimeout(() => { if (counter) counter.textContent = "In [1]:"; }, RM ? 0 : 420);
      out.hidden = false;
      requestAnimationFrame(() => out.classList.add("is-visible", "is-in"));
    };
    btn.addEventListener("click", run);
    // auto-run when the about section scrolls into view
    const about = $("#about");
    if (about) {
      const io = new IntersectionObserver(
        (e) => { if (e[0].isIntersecting) { run(); io.disconnect(); } },
        { threshold: 0.4 }
      );
      io.observe(about);
    }
  }

  /* =========================== Theme toggle ============================= */
  function theme() {
    const root = document.documentElement;
    const btn = $("#themeToggle");
    const KEY = "jp-theme";

    const stored = localStorage.getItem(KEY);
    const initial = stored || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    root.setAttribute("data-theme", initial);
    // The Latent Field cached dark-theme colours during its own init (it runs
    // before this). Re-sample now that the real theme is applied.
    requestAnimationFrame(() => window.LatentField?.refreshColors());

    btn?.addEventListener("click", (ev) => {
      const now = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      // dawn wipe from the toggle's position
      if (!RM) {
        const wipe = document.createElement("div");
        wipe.className = "theme-wipe";
        const size = Math.hypot(window.innerWidth, window.innerHeight) * 2;
        wipe.style.width = wipe.style.height = size + "px";
        wipe.style.left = ev.clientX - size / 2 + "px";
        wipe.style.top = ev.clientY - size / 2 + "px";
        document.body.appendChild(wipe);
        setTimeout(() => wipe.remove(), 650);
      }
      root.setAttribute("data-theme", now);
      localStorage.setItem(KEY, now);
      // let the canvas re-read colour variables
      requestAnimationFrame(() => window.LatentField?.refreshColors());
    });
  }

  /* ========================= Magnetic buttons =========================== */
  function magnetic() {
    if (isTouch) return;
    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const mx = e.clientX - r.left, my = e.clientY - r.top;
        btn.style.setProperty("--mx", mx + "px");
        btn.style.setProperty("--my", my + "px");
        if (!RM) {
          const dx = (mx - r.width / 2) / r.width;
          const dy = (my - r.height / 2) / r.height;
          btn.style.transform = `translate(${dx * 6}px, ${dy * 6}px)`;
        }
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
    });
  }

  /* ============================ Card tilt =============================== */
  function cardTilt() {
    if (isTouch || RM) return;
    $$(".work-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--tilt-y", (px - 0.5) * 10 + "deg");
        card.style.setProperty("--tilt-x", (0.5 - py) * 10 + "deg");
        card.style.setProperty("--mx", px * 100 + "%");
        card.style.setProperty("--my", py * 100 + "%");
      });
      card.addEventListener("mouseleave", () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      });
    });
  }

  /* ========================== Heading decode =========================== */
  function decode() {
    if (RM) return;
    const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/_$01#*";
    const run = (elm) => {
      const text = elm.getAttribute("data-decode-text") || elm.textContent;
      elm.setAttribute("data-decode-text", text);
      const total = text.length;
      const start = performance.now();
      elm.classList.add("is-decoding");
      const tick = (now) => {
        const p = (now - start) / 720;
        let out = "";
        for (let i = 0; i < total; i++) {
          if (text[i] === " ") { out += " "; continue; }
          const resolved = p * total - i >= 1;
          out += resolved ? text[i] : CHARS[(Math.random() * CHARS.length) | 0];
        }
        elm.textContent = out;
        if (p < 1) requestAnimationFrame(tick);
        else { elm.textContent = text; elm.classList.remove("is-decoding"); }
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }),
      { threshold: 0.5 }
    );
    $$("[data-decode]").forEach((n) => io.observe(n));
  }

  /* ===================== Cursor readout + field feed ==================== */
  function pointer() {
    const readout = $("#cursorReadout");
    const xs = readout?.querySelector('[data-coord="x"]');
    const ys = readout?.querySelector('[data-coord="y"]');
    let raf = 0, lx = 0, ly = 0;
    window.addEventListener(
      "mousemove",
      (e) => {
        lx = e.clientX; ly = e.clientY;
        document.body.classList.add("pointer-active");
        window.LatentField?.pointerHint(lx, ly);
        if (!raf)
          raf = requestAnimationFrame(() => {
            raf = 0;
            if (xs) xs.textContent = "x:" + String(lx).padStart(3, "0");
            if (ys) ys.textContent = "y:" + String(ly).padStart(3, "0");
          });
      },
      { passive: true }
    );
    window.addEventListener("mouseout", (e) => {
      if (!e.relatedTarget) window.LatentField?.pointerHint(null);
    });
  }

  /* ============================ Footer clock =========================== */
  function clock() {
    const node = $("#footerClock");
    if (!node) return;
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      const d = new Date();
      node.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };
    tick();
    setInterval(tick, 1000);
  }

  /* =========================== Contact form ============================ */
  function contactForm() {
    const form = $("#contactForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const to = D.contact?.email || "";
      const subject = encodeURIComponent(`Portfolio contact from ${data.get("name") || "visitor"}`);
      const body = encodeURIComponent(`${data.get("message") || ""}\n\n— ${data.get("name") || ""} (${data.get("email") || ""})`);
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    });
  }

  /* =============================== init ================================= */
  function init() {
    theme();          // set theme ASAP
    reveals();
    nav();
    fieldMorph();
    timelineBeam();
    heroType();
    roleRotator();
    counters();
    notebook();
    magnetic();
    cardTilt();
    decode();
    pointer();
    clock();
    contactForm();
    startScrollLoop();
  }

  return { init };
})();

window.Interactions = Interactions;

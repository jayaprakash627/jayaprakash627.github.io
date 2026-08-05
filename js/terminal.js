/* =============================================================================
 *  terminal.js  —  Working command line for the contact section
 * =============================================================================
 *  A real REPL: type commands (help, about, skills, projects, contact, resume,
 *  github, ...) to explore the portfolio. Supports command history (↑/↓) and
 *  tab-autocomplete. It's a delightful extra — the plain contact form beside it
 *  is always available, so no real content is ever gated behind the gimmick.
 *
 *  Exposes window.Terminal.init(), called by main.js.
 * ========================================================================== */

const Terminal = (() => {
  "use strict";
  const D = window.PORTFOLIO || {};
  const body  = document.getElementById("terminalBody");
  const input = document.getElementById("terminalInput");
  if (!body || !input) return { init() {} };

  const history = [];
  let hIdx = -1;

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  function print(html, cls = "") {
    const line = document.createElement("div");
    line.className = "term-line " + cls;
    line.innerHTML = html;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
  }
  function printEcho(cmd) { print(`<span class="term-prompt-tag">visitor@jp:~$</span> <span class="cmd">${esc(cmd)}</span>`); }

  /* ------------------------------ Commands ------------------------------- */
  const commands = {
    help() {
      print(`Available commands:`);
      const items = [
        ["about", "who I am"],
        ["skills", "my technical toolkit"],
        ["projects", "selected work"],
        ["contact", "how to reach me"],
        ["resume", "download my résumé"],
        ["github", "open my GitHub"],
        ["linkedin", "open my LinkedIn"],
        ["email", "email me"],
        ["theme", "toggle light / dark"],
        ["whoami", "quick identity"],
        ["clear", "clear the screen"],
      ];
      items.forEach(([c, d]) => print(`  <span class="key">${c.padEnd(9)}</span><span class="muted">${d}</span>`));
    },
    about() {
      const p = D.about?.paragraphs?.[0] || D.meta?.tagline || "";
      print(`<span class="muted">${esc(p)}</span>`);
    },
    skills() {
      (D.skills || []).forEach((g) => {
        print(`<span class="key">${esc(g.category)}</span>`);
        print(`  <span class="muted">${(g.items || []).map((i) => esc(i.name)).join(" · ")}</span>`);
      });
    },
    projects() {
      (D.projects || []).forEach((p, i) => {
        print(`  <span class="key">[${String(i + 1).padStart(2, "0")}]</span> ${esc(p.title)} <span class="muted">— ${esc(p.metric || "")}</span>`);
      });
      print(`<span class="muted">Scroll up to the Work section for full model cards.</span>`);
    },
    work() { commands.projects(); },
    contact() {
      const c = D.contact || {};
      print(`<span class="muted">Email:</span> <a class="link" href="mailto:${esc(c.email)}">${esc(c.email)}</a>`);
      (c.socials || []).forEach((s) =>
        print(`<span class="muted">${esc(s.name)}:</span> <a class="link" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.handle || s.url)}</a>`)
      );
    },
    social() { commands.contact(); },
    resume() {
      const url = D.meta?.resumeUrl;
      if (!url) { print(`<span class="muted">No résumé is linked yet — set meta.resumeUrl in js/data.js.</span>`); return; }
      print(`Opening résumé… <a class="link" href="${esc(url)}" target="_blank" rel="noopener">${esc(url)}</a>`);
      window.open(url, "_blank", "noopener");
    },
    github() {
      const s = (D.contact?.socials || []).find((x) => x.icon === "github");
      if (s) { print(`Opening GitHub → <a class="link" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a>`); window.open(s.url, "_blank", "noopener"); }
      else print(`<span class="muted">No GitHub set yet.</span>`);
    },
    linkedin() {
      const s = (D.contact?.socials || []).find((x) => x.icon === "linkedin");
      if (s) { print(`Opening LinkedIn → <a class="link" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a>`); window.open(s.url, "_blank", "noopener"); }
      else print(`<span class="muted">No LinkedIn set yet.</span>`);
    },
    email() {
      const e = D.contact?.email || "";
      print(`<a class="link" href="mailto:${esc(e)}">${esc(e)}</a>`);
      if (e) window.location.href = `mailto:${e}`;
    },
    whoami() {
      print(`<span class="key">${esc(D.meta?.name || "")}</span> <span class="muted">· ${esc(D.meta?.role || "")}</span>`);
      print(`<span class="muted">B.Tech · Artificial Intelligence &amp; Data Science · Class of 2024</span>`);
    },
    theme() {
      document.getElementById("themeToggle")?.click();
      print(`<span class="muted">Theme toggled.</span>`);
    },
    ls() { print(`<span class="muted">about  skills  projects  contact  resume  ~/</span>`); },
    sudo() { print(`<span class="muted">nice try 😉 — you already have all the access you need.</span>`); },
    banner() { intro(); },
    clear() { body.innerHTML = ""; },
  };

  /* ------------------------------- Runner -------------------------------- */
  function run(raw) {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    printEcho(raw.trim());
    history.unshift(raw.trim());
    hIdx = -1;
    if (commands[cmd]) commands[cmd]();
    else print(`<span class="muted">command not found: ${esc(cmd)} — type </span><span class="key">help</span>`);
  }

  /* -------------------------- Intro / welcome ---------------------------- */
  function intro() {
    print(`<span class="key">${esc(D.meta?.name || "Jayaprakash M")}</span> <span class="muted">— interactive shell</span>`);
    print(`<span class="muted">Type </span><span class="key">help</span><span class="muted"> to list commands, or just say hi.</span>`);
  }

  /* ------------------------------- Events -------------------------------- */
  function init() {
    intro();
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        run(input.value);
        input.value = "";
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (history.length && hIdx < history.length - 1) input.value = history[++hIdx];
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (hIdx > 0) input.value = history[--hIdx];
        else { hIdx = -1; input.value = ""; }
      } else if (e.key === "Tab" && !e.shiftKey) {
        // Only swallow Tab when we actually autocomplete; otherwise let focus
        // move on normally (and never intercept Shift+Tab) — no keyboard trap.
        const prefix = input.value.trim().toLowerCase();
        if (prefix) {
          const match = Object.keys(commands).find((c) => c.startsWith(prefix));
          if (match) { e.preventDefault(); input.value = match; }
        }
      }
    });
    // clicking anywhere in the terminal focuses the input
    document.getElementById("terminal")?.addEventListener("click", (e) => {
      if (!e.target.closest("a")) input.focus();
    });
  }

  return { init };
})();

window.Terminal = Terminal;

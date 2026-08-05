# Jayaprakash M — Portfolio

A modern, interactive single-page portfolio for **Jayaprakash M**, B.Tech in
**Artificial Intelligence & Data Science** (Class of 2024).

The signature piece is **“The Latent Field”** — a live Canvas2D neural-embedding
background whose nodes cluster by skill family, react to your cursor like a
similarity query, fire idle “thought pulses”, and morph (galaxy → clusters →
core) as you scroll. Everything is hand-built in **vanilla HTML/CSS/JS** — no
frameworks, no build step, no dependencies to install.

---

## Run it

Just open `index.html` in a browser. That’s it.

For the smoothest experience (and so custom fonts / the résumé download work
predictably), serve it locally:

```bash
cd "Jayaprakash Portfolio"
python3 -m http.server 5500
```

Then visit **http://localhost:5500**.

In **VS Code**, the easiest option is the *Live Server* extension → right-click
`index.html` → **Open with Live Server**.

---

## Where to edit things

> **You almost never need to touch the HTML/CSS/JS to update content.**
> **99% of your edits happen in one file:** [`js/data.js`](js/data.js).

```
Jayaprakash Portfolio/
├── index.html            # Page structure (semantic skeleton only)
│
├── css/
│   ├── theme.css         # 🎨 Colours, fonts, spacing — all design tokens + light/dark themes
│   ├── base.css          # Reset, layout, canvas background, utilities
│   ├── components.css    # Reusable UI: nav, buttons, cards, notebook, terminal, footer
│   ├── sections.css      # Per-section layout: hero, skills matrix, projects, timeline…
│   └── animations.css    # Keyframes, scroll-reveal, reduced-motion rules
│
├── js/
│   ├── data.js           # ⭐ YOUR CONTENT — name, about, skills, projects, timeline, contact
│   ├── icons.js          # Inline SVG icon set (offline-safe)
│   ├── latent-field.js   # The animated neural-embedding canvas background
│   ├── render.js         # Turns data.js into DOM
│   ├── interactions.js   # Scroll, reveals, theme toggle, counters, tilt, decode…
│   ├── terminal.js       # The interactive contact terminal
│   └── main.js           # Boot order (runs everything)
│
├── assets/
│   ├── favicon.svg       # Browser-tab icon
│   ├── images/           # Drop project screenshots / photos here
│   └── resume/           # 📄 Put your résumé PDF here (see below)
│
└── README.md
```

### Common edits

| I want to…                        | Edit this |
|-----------------------------------|-----------|
| Change my name / role / tagline   | `js/data.js` → `meta` |
| Rewrite the About text            | `js/data.js` → `about.paragraphs` |
| Add / edit a skill                | `js/data.js` → `skills[].items` (`level` is 0–100) |
| Add / edit a project              | `js/data.js` → `projects` (copy a `{ … }` block) |
| Update education / experience     | `js/data.js` → `timeline` |
| Change email / social links       | `js/data.js` → `contact` |
| Re-colour the whole site          | `css/theme.css` → the `--teal / --violet / --blue` variables |
| Swap fonts                        | `css/theme.css` → `--font-*`, and the Google Fonts `<link>` in `index.html` |

### Add your résumé
Drop your PDF into `assets/resume/` named **`Jayaprakash-M-Resume.pdf`**
(or change the filename in `js/data.js` → `meta.resumeUrl`). The “Résumé” button
and the terminal `resume` command will then work.

---

## Features
- 🧠 Live neural-embedding canvas background (cursor-reactive, scroll-morphing)
- 🌗 Dark **and** light theme with an animated toggle (remembers your choice)
- ⌨️ Interactive terminal in the contact section (`help`, `about`, `projects`, …)
- 📓 Jupyter-style “notebook” About cell that runs on scroll
- 🔥 Confusion-matrix skill heatmap with animated proficiency
- 🃏 ML “model card” projects with live mini-charts that draw in on scroll
- 🧾 “Experiment log” timeline with a scroll-scrubbed progress beam
- ✨ Magnetic buttons, 3D card tilt, decoding headings, animated counters
- ♿ Fully responsive + honours `prefers-reduced-motion` + keyboard accessible

---

## Notes
- The contact **form** opens your mail app via a `mailto:` link — nothing is sent
  automatically, and there’s no backend to configure. (For real form submissions
  later, you could wire it to a service like Formspree.)
- Fonts load from Google Fonts; the site still renders with clean system-font
  fallbacks if you’re offline.

Built with care — designed & coded, 2025.

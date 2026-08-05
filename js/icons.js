/* =============================================================================
 *  icons.js  —  Inline SVG icon set (feather-style, stroke-based)
 * =============================================================================
 *  Self-contained so the site works fully offline (no icon CDN).
 *  Usage:  ICONS.get("cpu")  ->  returns an <svg> string.
 *  Every icon is a 24x24 stroke icon that inherits `currentColor`.
 * ========================================================================== */

const ICONS = (() => {
  const wrap = (paths) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;

  const P = {
    code: `<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>`,
    cpu: `<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
          <line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/>
          <line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/>
          <line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/>
          <line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>`,
    "bar-chart": `<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="16"/>`,
    tool: `<path d="M14.7 6.3a4 4 0 0 0-5.5 5.2L3 17.7 6.3 21l6.2-6.2a4 4 0 0 0 5.2-5.5l-2.6 2.6-2.3-.6-.6-2.3 2.5-2.7z"/>`,
    github: `<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-1-2.6c3-.3 6-1.5 6-6.6a5.1 5.1 0 0 0-1.4-3.5
          5 5 0 0 0-.1-3.5s-1.1-.3-3.5 1.3a12 12 0 0 0-6.4 0C6.7.4 5.6.7 5.6.7A5 5 0 0 0 5.5 4.2 5.1 5.1 0 0 0 4 7.7
          c0 5.1 3 6.3 6 6.6a3.4 3.4 0 0 0-1 2.6V21"/>`,
    linkedin: `<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/>
          <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>`,
    mail: `<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>`,
    "arrow-up-right": `<line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>`,
    "arrow-right": `<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>`,
    "arrow-down": `<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>`,
    external: `<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>`,
    download: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>`,
    sun: `<circle cx="12" cy="12" r="4"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.2" y1="4.2" x2="5.6" y2="5.6"/><line x1="18.4" y1="18.4" x2="19.8" y2="19.8"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.2" y1="19.8" x2="5.6" y2="18.4"/><line x1="18.4" y1="5.6" x2="19.8" y2="4.2"/>`,
    moon: `<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>`,
    menu: `<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>`,
    close: `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`,
    "map-pin": `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>`,
    sparkle: `<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>`,
    layers: `<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/>
          <polyline points="2 12 12 17 22 12"/>`,
    zap: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
    "graduation-cap": `<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5"/>`,
    briefcase: `<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>`,
    award: `<circle cx="12" cy="8" r="6"/><path d="M8.2 13.9 7 22l5-3 5 3-1.2-8.1"/>`,
    trophy: `<path d="M7 4h10v4a5 5 0 0 1-10 0V4z"/><path d="M7 6H4.5a1.5 1.5 0 0 0 0 4H7"/>
          <path d="M17 6h2.5a1.5 1.5 0 0 1 0 4H17"/><line x1="12" y1="13" x2="12" y2="17"/>
          <path d="M8.5 21h7l-1-4h-5z"/>`,
    medal: `<path d="M8.5 3 6 8"/><path d="M15.5 3 18 8"/><circle cx="12" cy="14.5" r="5.5"/><circle cx="12" cy="14.5" r="1.6"/>`,
    dumbbell: `<rect x="2.5" y="8.5" width="3" height="7" rx="1"/><rect x="18.5" y="8.5" width="3" height="7" rx="1"/>
          <rect x="5.5" y="10" width="2.2" height="4" rx="0.7"/><rect x="16.3" y="10" width="2.2" height="4" rx="0.7"/>
          <line x1="7.7" y1="12" x2="16.3" y2="12"/>`,
    users: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
  };

  return {
    get(name) {
      return wrap(P[name] || P.sparkle);
    },
    has(name) {
      return Object.prototype.hasOwnProperty.call(P, name);
    },
  };
})();

window.ICONS = ICONS;

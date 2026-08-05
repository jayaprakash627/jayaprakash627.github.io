/* =============================================================================
 *  main.js  —  Boot orchestrator
 * =============================================================================
 *  Runs after all other scripts have defined their modules. Wires everything
 *  up in the right order once the DOM is ready:
 *    1. Render content from data.js
 *    2. Start the Latent Field canvas
 *    3. Attach all interactions
 *    4. Boot the contact terminal
 * ========================================================================== */

(function boot() {
  "use strict";

  function start() {
    try { window.Render && window.Render.init(); }
    catch (err) { console.error("[render]", err); }

    try { window.LatentField && window.LatentField.init(); }
    catch (err) { console.error("[latent-field]", err); }

    try { window.Interactions && window.Interactions.init(); }
    catch (err) { console.error("[interactions]", err); }

    try { window.Terminal && window.Terminal.init(); }
    catch (err) { console.error("[terminal]", err); }

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();

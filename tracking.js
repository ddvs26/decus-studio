/**
 * Decus Analytics — Lightweight page tracker
 * Include in every page: <script src="tracking.js"></script>
 * ~1KB, no dependencies, privacy-respecting
 */
(function () {
  "use strict";

  const API = "https://api.decus-studio.com";

  // Session ID — persists per browser session
  function getSession() {
    let sid = sessionStorage.getItem("_dsid");
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("_dsid", sid);
    }
    return sid;
  }

  // Detect device type
  function getDevice() {
    const ua = navigator.userAgent;
    if (/Mobi|Android/i.test(ua)) return "mobile";
    if (/Tablet|iPad/i.test(ua)) return "tablet";
    return "desktop";
  }

  // Parse UTM params from URL
  function getUTM() {
    const p = new URLSearchParams(window.location.search);
    return {
      utm_source:   p.get("utm_source"),
      utm_medium:   p.get("utm_medium"),
      utm_campaign: p.get("utm_campaign"),
    };
  }

  // Track a page view
  async function trackView() {
    try {
      await fetch(API + "/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page:       window.location.pathname || "/",
          referrer:   document.referrer || "",
          device:     getDevice(),
          browser:    navigator.userAgent.slice(0, 120),
          session_id: getSession(),
        }),
      });
    } catch (_) { /* fail silently */ }
  }

  // Track a custom event
  window.decusTrack = async function (name, props) {
    try {
      await fetch(API + "/api/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, props: props || {},
          page: window.location.pathname,
          session_id: getSession(),
        }),
      });
    } catch (_) { /* fail silently */ }
  };

  // Expose UTMs for lead forms
  window.decusUTM = getUTM;

  // Fire page view on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", trackView);
  } else {
    trackView();
  }

  // Track CTA clicks automatically
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-track]").forEach(function (el) {
      el.addEventListener("click", function () {
        window.decusTrack(el.dataset.track, {
          text: el.textContent.trim().slice(0, 80),
          href: el.href || null,
        });
      });
    });
  });
})();

/* =========================================================
   POLYTRICS — shared site behaviour
   header/footer, logo, page transitions, scroll animations
   ========================================================= */
(function () {
  "use strict";
  var CFG = window.POLYTRICS_CONFIG || {};
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- logo (two halves; the right half is the left rotated 180°) ---------- */
  var uid = 0;
  function logoSVG(cls) {
    var id = "plm" + (++uid);
    var half =
      '<path d="M478 135 A335 335 0 0 0 478 805 Z" fill="currentColor" mask="url(#' + id + ')"/>';
    return '<svg class="' + (cls || "") + '" viewBox="140 128 684 684" aria-hidden="true" focusable="false">' +
      '<defs><mask id="' + id + '" maskUnits="userSpaceOnUse" x="0" y="0" width="962" height="956">' +
      '<rect width="962" height="956" fill="#fff"/>' +
      '<rect x="336" y="303" width="160" height="27" rx="7" fill="#000"/>' +
      '<path fill="#000" d="M331 341 C353 345 372 359 380 385 C386 405 385 424 390 441 C396 459 410 474 420 491 C423 497 417 501 405 505 C410 511 412 517 404 523 C408 529 406 536 402 541 C406 549 404 561 398 571 C391 582 383 588 371 590 L326 590 L326 830 L496 830 L496 341 Z"/>' +
      '</mask></defs>' +
      '<g class="half-l">' + half + '</g>' +
      '<g class="half-r"><g transform="rotate(180 482 470)">' + half + '</g></g>' +
      '</svg>';
  }
  window.PolytricsLogo = logoSVG;

  var ICON = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    out: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
  };
  window.PolytricsIcon = ICON;

  var PAGES = [
    ["./", "Home", "home"],
    ["policy.html", "Policy", "policy"],
    ["politics.html", "Politics", "politics"],
    ["law.html", "Law", "law"],
    ["events.html", "Events", "events"],
    ["journal.html", "Journal", "journal"],
    ["resources.html", "Resources", "resources"],
    ["about.html", "About", "about"]
  ];
  var current = document.body.getAttribute("data-page");

  /* ---------- storage helpers (never required) ---------- */
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- theme ---------- */
  var saved = store("pt-theme");
  if (saved === "dark" || saved === "light") document.documentElement.setAttribute("data-theme", saved);
  function isDark() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
  }

  /* ---------- header ---------- */
  var header = document.createElement("header");
  header.className = "main_h";
  header.innerHTML =
    '<div class="wrap row">' +
      '<a class="brand" href="./" aria-label="' + CFG.clubName + ' home">' +
        '<span class="mark">' + logoSVG() + '</span>' +
        '<span class="name">' + CFG.clubName + '<small>' + (CFG.institution || "") + '</small></span>' +
      '</a>' +
      '<nav id="site-nav" aria-label="Main"><ul>' +
        PAGES.map(function (p) {
          return '<li><a href="' + p[0] + '"' + (p[2] === current ? ' aria-current="page"' : "") + '>' + p[1] + '</a></li>';
        }).join("") +
      '</ul></nav>' +
      '<div class="header-tools">' +
        '<button class="icon-btn theme-toggle" type="button" aria-label="Switch colour theme"></button>' +
        '<button class="mobile-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav"><span></span><span></span><span></span></button>' +
      '</div>' +
    '</div>';
  document.body.prepend(header);

  var progress = document.createElement("div");
  progress.className = "progress"; progress.innerHTML = "<span></span>";
  document.body.prepend(progress);

  var themeBtn = header.querySelector(".theme-toggle");
  function paintThemeBtn() { themeBtn.innerHTML = isDark() ? ICON.sun : ICON.moon; }
  paintThemeBtn();
  themeBtn.addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    store("pt-theme", next);
    paintThemeBtn();
  });

  var toggle = header.querySelector(".mobile-toggle");
  toggle.addEventListener("click", function () {
    var open = document.documentElement.classList.toggle("open-nav");
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  /* ---------- footer + CTA ---------- */
  var footer = document.createElement("footer");
  footer.className = "site";
  var soc = CFG.socials || {};
  footer.innerHTML =
    '<div class="wrap">' +
      '<div class="top">' +
        '<div><a class="brand" href="./"><span class="mark">' + logoSVG() + '</span><span class="name">' + CFG.clubName + '<small>' + CFG.tagline + '</small></span></a>' +
        '<p style="margin-top:18px;max-width:34ch;opacity:.75">Policy, politics and law, read closely and argued fairly. ' + (CFG.institution ? "A student club at " + CFG.institution + "." : "") + '</p></div>' +
        '<div><h4>Read</h4><ul><li><a href="policy.html">Policy Pulse</a></li><li><a href="politics.html">Politics Desk</a></li><li><a href="law.html">Law Watch</a></li><li><a href="journal.html">Journal</a></li></ul></div>' +
        '<div><h4>Club</h4><ul><li><a href="events.html">Events</a></li><li><a href="about.html">About &amp; team</a></li><li><a href="about.html#join">Join us</a></li><li><a href="resources.html">Resources</a></li></ul></div>' +
        '<div><h4>Elsewhere</h4><ul>' +
          (soc.instagram ? '<li><a href="' + soc.instagram + '" target="_blank" rel="noopener">Instagram</a></li>' : "") +
          (soc.linkedin ? '<li><a href="' + soc.linkedin + '" target="_blank" rel="noopener">LinkedIn</a></li>' : "") +
          (soc.x ? '<li><a href="' + soc.x + '" target="_blank" rel="noopener">X</a></li>' : "") +
          '<li><span style="opacity:.8;user-select:all">' + CFG.email + '</span></li>' +
        '</ul></div>' +
      '</div>' +
      '<div class="bottom"><span>© ' + new Date().getFullYear() + ' ' + CFG.clubName + '. Student-run; views are members\' own.</span><span>Headlines link to their original publishers.</span></div>' +
    '</div>';
  document.body.append(footer);

  /* ---------- background watermark + hero ghosts ---------- */
  var wm = document.createElement("div");
  wm.className = "watermark"; wm.innerHTML = logoSVG();
  document.body.prepend(wm);
  document.querySelectorAll("[data-ghost]").forEach(function (el) { el.innerHTML = logoSVG(); });

  /* ---------- page transition overlay ---------- */
  var pt = document.createElement("div");
  pt.className = "pt enter"; pt.setAttribute("aria-hidden", "true");
  pt.innerHTML = '<div class="pt-bg"></div>' + logoSVG("pt-logo") + '<div class="pt-word">' + CFG.clubName + '</div>';
  document.body.append(pt);

  function isInternal(a) {
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return false;
    var href = a.getAttribute("href") || "";
    if (!href || href.charAt(0) === "#" || /^(mailto|tel|javascript):/i.test(href)) return false;
    var url;
    try { url = new URL(a.href, location.href); } catch (e) { return false; }
    if (url.origin !== location.origin) return false;
    if (url.pathname === location.pathname && url.hash) return false; // same-page anchor
    return true;
  }
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest("a");
    if (!isInternal(a)) return;
    e.preventDefault();
    document.documentElement.classList.remove("open-nav");
    if (reduce) { location.href = a.href; return; }
    pt.classList.remove("enter");
    void pt.offsetWidth;
    pt.classList.add("leave");
    setTimeout(function () { location.href = a.href; }, 860);
  });
  // returning with the back button: drop the "leave" cover
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) { pt.classList.remove("leave"); pt.classList.add("enter"); }
  });

  /* ---------- scroll: header, progress, parallax, watermark ---------- */
  var hero = document.querySelector(".hero");
  var ghost = document.querySelector(".hero .ghost svg");
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || 0;
    var max = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle("sticky", y > (hero ? hero.offsetHeight - 80 : 20));
    progress.style.setProperty("--p", max > 0 ? Math.min(1, y / max) : 0);
    if (!reduce) {
      wm.style.setProperty("--wm", (y * 0.03).toFixed(2));
      if (ghost && hero && y < hero.offsetHeight) ghost.style.setProperty("--split", (y * 0.18).toFixed(1));
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  /* ---------- reveal on scroll ---------- */
  var io = null;
  if ("IntersectionObserver" in window && !reduce) {
    document.documentElement.classList.add("js-reveal");
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  }
  function reveal(root) {
    (root || document).querySelectorAll("[data-reveal]:not(.in)").forEach(function (el) {
      if (!io) { el.classList.add("in"); return; }
      var r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) { setTimeout(function () { el.classList.add("in"); }, 60); }
      else io.observe(el);
    });
  }
  window.PolytricsReveal = reveal;
  reveal();
  // smooth in-page anchors (e.g. the mouse icon)
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var t = document.getElementById(a.getAttribute("href").slice(1));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }
    });
  });

  /* ---------- small utilities shared by pages ---------- */
  window.PT = {
    store: store,
    esc: function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); },
    dayIndex: function (len, salt) {
      var d = new Date(); var start = new Date(d.getFullYear(), 0, 0);
      var day = Math.floor((d - start) / 864e5) + d.getFullYear() * 366 + (salt || 0);
      return ((day % len) + len) % len;
    },
    weekIndex: function () { var d = new Date(); return Math.floor((d - new Date(2024, 0, 1)) / (7 * 864e5)); },
    ago: function (date) {
      var t = new Date(date); if (isNaN(t)) return "";
      var s = (Date.now() - t) / 1000;
      if (s < 3600) return Math.max(1, Math.round(s / 60)) + " min ago";
      if (s < 86400) return Math.round(s / 3600) + " hr ago";
      if (s < 7 * 86400) return Math.round(s / 86400) + "d ago";
      return t.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    },
    icon: ICON
  };
})();

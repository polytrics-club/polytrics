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
    ["news.html", "News", "news"],
    ["opinion.html", "Opinion Wall", "opinion"],
    ["learn.html", "Learn", "learn"],
    ["journal.html", "Journal", "journal"],
    ["resources.html", "Resources", "resources"],
    ["about.html", "About", "about"]
  ];
  var current = document.body.getAttribute("data-page");

  /* ---------- storage helpers (never required) ---------- */
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- header ---------- */
  var header = document.createElement("header");
  header.className = "main_h";
  header.innerHTML =
    '<div class="wrap row">' +
      '<a class="brand" href="./" aria-label="' + CFG.clubName + ' home">' +
        '<span class="mark">' + logoSVG() + '</span>' +
        '<span class="name">' + CFG.clubName + '</span>' +
      '</a>' +
      '<nav id="site-nav" aria-label="Main"><ul>' +
        PAGES.map(function (p) {
          return '<li><a href="' + p[0] + '"' + (p[2] === current ? ' aria-current="page"' : "") + '>' + p[1] + '</a></li>';
        }).join("") +
      '</ul></nav>' +
      '<div class="header-tools">' +
        '<button class="mobile-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav"><span></span><span></span><span></span></button>' +
      '</div>' +
    '</div>';
  document.body.prepend(header);

  var progress = document.createElement("div");
  progress.className = "progress"; progress.innerHTML = "<span></span>";
  document.body.prepend(progress);


  var toggle = header.querySelector(".mobile-toggle");
  toggle.addEventListener("click", function () {
    var open = document.documentElement.classList.toggle("open-nav");
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  /* ---------- footer ---------- */
  var footer = document.createElement("footer");
  footer.className = "site";
  var soc = CFG.socials || {};
  footer.innerHTML =
    '<div class="wrap">' +
      '<div class="top">' +
        '<div><div class="big-name">' + CFG.clubName + '</div>' +
        '<p style="margin-top:18px;max-width:36ch;opacity:.8">The official Public Policy and Governance club of ' + (CFG.institution || "IPM, IIM Ranchi") + '.</p></div>' +
        '<div><h4>Explore</h4><ul>' + PAGES.slice(1).map(function (p) { return '<li><a href="' + p[0] + '">' + p[1] + '</a></li>'; }).join("") + '</ul></div>' +
        '<div><h4>Say hello</h4><ul>' +
          (soc.instagram ? '<li><a href="' + soc.instagram + '" target="_blank" rel="noopener">Instagram ' + (soc.instagramHandle || "") + '</a></li>' : "") +
          '<li><span style="opacity:.85;user-select:all;word-break:break-all">' + CFG.email + '</span></li>' +
        '</ul></div>' +
      '</div>' +
      '<div class="bottom"><span>© ' + new Date().getFullYear() + ' ' + CFG.clubName + '. Student-run; views are members\' own.</span><span>Headlines link to their original publishers.</span></div>' +
    '</div>';
  document.body.append(footer);

  /* ---------- curved flowing text ---------- */
  document.querySelectorAll("[data-wavetext]").forEach(function (box, n) {
    var phrase = box.getAttribute("data-wavetext");
    var id = "wv" + n;
    var reps = 10, rep = "";
    for (var i = 0; i < reps; i++) rep += phrase + "  \u2022  ";
    box.innerHTML = '<svg class="wavetext" viewBox="0 0 1600 200" preserveAspectRatio="xMidYMid slice" aria-label="' + phrase + '" role="img">' +
      '<path id="' + id + '" fill="none" d="M-200,120 C100,40 300,40 600,110 S1100,190 1400,100 S1800,40 2000,110"/>' +
      '<text><textPath href="#' + id + '" startOffset="0">' + rep + '</textPath></text></svg>';
    var tp = box.querySelector("textPath"), txt = box.querySelector("text");
    var seg = 0, off = 0, last = 0, boost = 0;
    function measure() { try { seg = txt.getComputedTextLength() / reps; } catch (e) { seg = 0; } }
    measure();
    if (reduce) return;
    window.addEventListener("scroll", function () { boost = Math.min(boost + 1.5, 6); }, { passive: true });
    function frame(t) {
      var dt = last ? Math.min(t - last, 50) : 16; last = t;
      if (!seg) measure();
      off -= (0.05 + boost * 0.03) * dt; boost *= 0.94;
      if (seg && off < -seg) off += seg;
      tp.setAttribute("startOffset", off.toFixed(1));
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });

  /* ---------- background watermark + hero ghosts ---------- */
  var wm = document.createElement("div");
  wm.className = "watermark"; wm.innerHTML = logoSVG();
  var wmWrap = document.createElement("div"); wmWrap.className = "wm-wrap"; wmWrap.setAttribute("aria-hidden", "true");
  wmWrap.appendChild(wm); document.body.prepend(wmWrap);
  document.querySelectorAll("[data-logo]").forEach(function (el) { el.innerHTML = logoSVG("logo-split"); });

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
  var ghost = document.querySelector(".hero .logo-split");
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || 0;
    var max = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle("sticky", y > (hero ? hero.offsetHeight - 90 : 20));
    progress.style.setProperty("--p", max > 0 ? Math.min(1, y / max) : 0);
    if (!reduce) {
      wm.style.setProperty("--wm", (y * 0.03).toFixed(2));
      if (ghost && hero && y < hero.offsetHeight) ghost.style.setProperty("--split", (y * 0.12).toFixed(1));
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

/* =========================================================
   POLYTRICS — cursor: ink drop + ink trail + seal stamp
   - a small ink drop follows the pointer, stretching as it moves and settling round
   - over links a seal-ring opens around it
   - a fine ink line trails behind, like a pen signature
   - clicking stamps the Polytrics seal, which fades away
   Desktop mice only; off for touch screens and reduced motion.
   ========================================================= */
(function () {
  "use strict";
  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || calm || !window.PolytricsLogo) return;

  var root = document.documentElement;
  root.classList.add("has-ink");
  var layer = document.createElement("div"); layer.className = "ink-layer"; layer.setAttribute("aria-hidden", "true");
  var cv = document.createElement("canvas"); cv.className = "ink-trail";
  var box = document.createElement("div"); box.className = "ink-dot";
  box.innerHTML = '<span class="ink-ring"></span><span class="ink-drop"></span>';
  var drop = box.querySelector(".ink-drop");
  layer.appendChild(cv); layer.appendChild(box); document.body.appendChild(layer);
  var ctx = cv.getContext("2d");
  function size() { var r = Math.min(window.devicePixelRatio || 1, 2); cv.width = innerWidth * r; cv.height = innerHeight * r; ctx.setTransform(r, 0, 0, r, 0, 0); }
  size(); window.addEventListener("resize", size);

  var RED = "182,32,23", BUTTER = "255,223,126";
  var x = -200, y = -200, bx = x, by = y, col = RED, visible = false, typing = false, raf = 0, lastEl = null;
  var pts = [], LIFE = 520;

  // yellow / white surfaces get red ink; red and dark surfaces get butter ink
  var LIGHT = ".btn--butter, .btn:not(.btn--line):not(.btn--red), .note, .quiz, .composer, .topic:not(.topic--motion), .ctx, .term:not(.term--3), .pill:not([aria-pressed=true]), .news-empty, .field, .reply, .explainer[open], .res:hover, .post:hover";
  var DARK = ".s-red, .hero, .s-ink, footer.site, .topic--motion, .seal .core, .main_h nav, .btn--red, .term--3, .pill[aria-pressed=true], .act[aria-expanded=true], .reader .close";
  function sample(el) {
    if (!el || el === lastEl) return; lastEl = el;
    var c = el.closest ? el.closest(LIGHT + ", " + DARK) : null;
    var next = c && c.matches(DARK) ? BUTTER : RED;
    if (next !== col) { col = next; layer.style.setProperty("--cursor-ink", "rgb(" + col + ")"); }
    root.classList.toggle("ink-hot", !!el.closest("a, button, summary, label, .bar-row, select"));
    typing = !!el.closest("input, textarea, [contenteditable]");
    root.classList.toggle("ink-text", typing);
  }
  window.addEventListener("mousemove", function (e) {
    x = e.clientX; y = e.clientY;
    if (!visible) { visible = true; bx = x; by = y; root.classList.add("ink-on"); }
    if (!typing) pts.push({ x: x, y: y, t: performance.now(), c: col });
    sample(e.target); go();
  }, { passive: true });
  window.addEventListener("scroll", function () { if (visible) sample(document.elementFromPoint(x, y)); }, { passive: true });
  document.addEventListener("mouseleave", function () { visible = false; root.classList.remove("ink-on"); });

  // the seal
  window.addEventListener("mousedown", function (e) {
    if (e.button !== 0 || typing) return;
    root.classList.add("ink-press");
    var s = document.createElement("div");
    s.className = "ink-stamp";
    s.style.left = x + "px"; s.style.top = y + "px";
    s.style.setProperty("--r", (Math.random() * 24 - 12).toFixed(1) + "deg");
    s.style.color = "rgb(" + col + ")";
    s.innerHTML = window.PolytricsLogo("ink-seal");
    layer.appendChild(s);
    setTimeout(function () { s.remove(); }, 1500);
  });
  window.addEventListener("mouseup", function () { root.classList.remove("ink-press"); });

  function go() { if (!raf) raf = requestAnimationFrame(frame); }
  function frame(now) {
    raf = 0;
    var dx = (x - bx) * 0.35, dy = (y - by) * 0.35;
    bx += dx; by += dy;
    box.style.transform = "translate3d(" + bx + "px," + by + "px,0)";
    // the drop stretches along its direction of travel, then settles round
    var sp = Math.min(1, Math.hypot(dx, dy) / 14);
    drop.style.transform = "rotate(" + Math.atan2(dy, dx) + "rad) scale(" + (1 + sp * 1.1).toFixed(3) + "," + (1 - sp * 0.45).toFixed(3) + ")";
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    while (pts.length && now - pts[0].t > LIFE) pts.shift();
    if (pts.length > 2) {
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      for (var i = 1; i < pts.length - 1; i++) {
        var p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1];
        if (p2.t - p0.t > 140) continue;                 // a pause lifts the pen
        var age = (now - p1.t) / LIFE, speed = Math.min(1, Math.hypot(p2.x - p0.x, p2.y - p0.y) / 40);
        ctx.strokeStyle = "rgba(" + p1.c + "," + (0.5 * (1 - age)).toFixed(3) + ")";
        ctx.lineWidth = Math.max(0.35, (2.4 - speed * 1.5) * (1 - age * 0.85));   // thinner when fast, like a nib
        ctx.beginPath();
        ctx.moveTo((p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
        ctx.quadraticCurveTo(p1.x, p1.y, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
        ctx.stroke();
      }
    }
    if (pts.length || Math.abs(x - bx) > 0.3 || Math.abs(y - by) > 0.3) raf = requestAnimationFrame(frame);
  }
})();

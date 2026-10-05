/* =========================================================
   POLYTRICS — page modules (picked by <body data-page="...">)
   ========================================================= */
(function () {
  "use strict";
  var CFG = window.POLYTRICS_CONFIG || {};
  var C = window.POLYTRICS_CONTENT || {};
  var PT = window.PT, esc = PT.esc, I = PT.icon;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var page = document.body.getAttribute("data-page");
  function selectText(node) { var r = document.createRange(); r.selectNodeContents(node); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
  function copy(text, btn, node, label) {
    var done = function () { btn.textContent = "Copied"; setTimeout(function () { btn.textContent = label; }, 1600); };
    try { navigator.clipboard.writeText(text).then(done, function () { selectText(node); }); } catch (e) { selectText(node); }
  }

  /* ---------- hero shape: photo if set, otherwise the logo ---------- */
  var heroBlob = $("#hero-blob");
  if (heroBlob && CFG.heroImage) heroBlob.innerHTML = '<img src="' + esc(CFG.heroImage) + '" alt="">';

  /* ---------- fact of the day ---------- */
  function factWidget(el) {
    if (!el || !C.facts) return;
    var i = PT.dayIndex(C.facts.length);
    var today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
    function paint(animate) {
      var f = C.facts[i];
      el.innerHTML = '<div class="meta"><span>Fact of the day</span><span>' + esc(f.tag) + '</span><span>' + esc(today) + '</span></div>' +
        '<blockquote>' + esc(f.text) + '</blockquote>' +
        '<div class="pills"><button class="pill" type="button" data-act="next">Another fact</button><button class="pill" type="button" data-act="copy">Copy to share</button></div>';
      if (animate && el.animate) el.querySelector("blockquote").animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 600, easing: "cubic-bezier(.22,1,.36,1)" });
    }
    paint();
    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]"); if (!b) return;
      if (b.dataset.act === "next") { i = (i + 1) % C.facts.length; paint(true); }
      if (b.dataset.act === "copy") copy(C.facts[i].text + " (via " + CFG.clubName + ")", b, el.querySelector("blockquote"), "Copy to share");
    });
  }

  /* ---------- Article of the day: a rotating seal ---------- */
  function sealWidget(el) {
    if (!el || !C.articles) return;
    var a = C.articles[PT.dayIndex(C.articles.length, 7)];
    var ring = "Article of the day • Constitution of India • Article of the day • Constitution of India • ";
    el.innerHTML = '<svg class="ring" viewBox="0 0 300 300" aria-hidden="true"><defs><path id="sealpath" d="M150,150 m-132,0 a132,132 0 1,1 264,0 a132,132 0 1,1 -264,0"/></defs>' +
      '<text textLength="820" lengthAdjust="spacing"><textPath href="#sealpath" textLength="820" lengthAdjust="spacing">' + ring + '</textPath></text></svg>' +
      '<div class="core"><span class="no"><span class="sr-only">Article </span>' + esc(a.no) + '</span><h3>' + esc(a.title) + '</h3><p>' + esc(a.text) + '</p></div>';
  }

  function caseHTML(c, i) {
    return '<article class="case" data-reveal style="--d:' + (i % 4) + '"><div class="yr">' + c.year + '</div><div>' +
      '<h3>' + esc(c.name) + '</h3><cite>' + esc(c.cite) + '</cite><p>' + esc(c.held) + '</p><span class="cat">' + esc(c.area) + '</span></div></article>';
  }

  /* ---------- quiz ---------- */
  function quizWidget(el) {
    if (!el || !C.quiz) return;
    var n = Math.min(5, C.quiz.length), start = (PT.weekIndex() * n) % C.quiz.length;
    var qs = []; for (var k = 0; k < n; k++) qs.push(C.quiz[(start + k) % C.quiz.length]);
    var idx = 0, score = 0;
    function paint() {
      if (idx >= qs.length) {
        var msg = score === n ? "Full marks. Come argue with us." : score >= n - 2 ? "Strong. You'd hold your own in a mock parliament." : "A good start. The explainers will help.";
        el.innerHTML = '<div class="quiz-top"><span>Quiz of the week</span><span>Done</span></div><div class="quiz-bar"><span style="width:100%"></span></div>' +
          '<div class="score">' + score + '/' + n + '</div><p class="why">' + msg + ' A new set arrives every Monday.</p>' +
          '<button class="btn next" type="button" data-q="again">Try again ' + I.arrow + '</button>';
        return;
      }
      var q = qs[idx];
      el.innerHTML = '<div class="quiz-top"><span>Quiz of the week</span><span>' + (idx + 1) + ' of ' + n + '</span></div>' +
        '<div class="quiz-bar"><span style="width:' + (idx / n * 100) + '%"></span></div><h3>' + esc(q.q) + '</h3><div class="opts">' +
        q.options.map(function (o, j) { return '<button class="opt" type="button" data-o="' + j + '">' + esc(o) + '</button>'; }).join("") + '</div>';
    }
    el.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.dataset.q === "again") { idx = 0; score = 0; paint(); return; }
      if (b.dataset.q === "next") { idx++; paint(); return; }
      if (b.dataset.o == null) return;
      var q = qs[idx], pick = +b.dataset.o;
      el.querySelectorAll(".opt").forEach(function (o, j) { o.disabled = true; if (j === q.answer) o.classList.add("right"); });
      if (pick === q.answer) score++; else b.classList.add("wrong");
      el.insertAdjacentHTML("beforeend", '<p class="why">' + (pick === q.answer ? "Correct. " : "Not quite. ") + esc(q.why) + '</p>' +
        '<button class="btn next" type="button" data-q="next">' + (idx + 1 < n ? "Next question" : "See score") + ' ' + I.arrow + '</button>');
    });
    paint();
  }

  /* ---------- news with category pills ---------- */
  function newsWidget(opts) {
    var bar = $(opts.pills), box = $(opts.list), status = $(opts.status);
    if (!bar || !box) return;
    var cats = [{ key: "all", label: "All news" }].concat(CFG.newsCategories || []);
    var current = "all";
    var h = location.hash.slice(1); if (opts.useHash && cats.some(function (c) { return c.key === h; })) current = h;
    bar.innerHTML = cats.map(function (c) { return '<button class="pill" type="button" data-cat="' + c.key + '" aria-pressed="' + (c.key === current) + '">' + esc(c.label) + '</button>'; }).join("");
    function draw() { window.PolytricsFeeds.render(box, status, current, { limit: opts.limit }); }
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("[data-cat]"); if (!b) return;
      current = b.dataset.cat;
      bar.querySelectorAll(".pill").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      if (opts.useHash) { try { history.replaceState(null, "", current === "all" ? location.pathname : "#" + current); } catch (err) {} }
      draw();
    });
    draw();
  }

  /* ---------- opinion wall ---------- */
  function parseCSV(text) {
    var rows = [], row = [], cur = "", q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) { if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch; }
      else if (ch === '"') q = true;
      else if (ch === ",") { row.push(cur); cur = ""; }
      else if (ch === "\n" || ch === "\r") { if (cur || row.length) { row.push(cur); rows.push(row); row = []; cur = ""; } if (ch === "\r" && text[i + 1] === "\n") i++; }
      else cur += ch;
    }
    if (cur || row.length) { row.push(cur); rows.push(row); }
    return rows;
  }
  function parseStamp(s, order) {
    var m = String(s).trim().match(/^(\d{1,4})[\/.-](\d{1,2})[\/.-](\d{1,4})(?:[ T,]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
    if (!m) { var d = new Date(s); return isNaN(d) ? null : d; }
    var a = +m[1], b = +m[2], c = +m[3], y, mo, da;
    if (m[1].length === 4) { y = a; mo = b; da = c; }
    else { y = c < 100 ? 2000 + c : c; if (a > 12) { da = a; mo = b; } else if (b > 12) { mo = a; da = b; } else if (order === "MDY") { mo = a; da = b; } else { da = a; mo = b; } }
    return new Date(y, mo - 1, da, +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
  }
  function loadOpinions() {
    var O = CFG.opinion || {}, days = O.days || 7;
    var samples = function () {
      return fetch("data/opinions.json", { cache: "no-store" }).then(function (r) { return r.json(); }).catch(function () { return []; })
        .then(function (list) { return list.map(function (p) { p.date = new Date(Date.now() - (p.daysAgo || 0) * 864e5); return p; }); });
    };
    if (!O.sheetCSV) return samples().then(function (l) { return { posts: l, source: "sample", days: days }; });
    return fetch(O.sheetCSV, { cache: "no-store" }).then(function (r) { if (!r.ok) throw 0; return r.text(); }).then(function (txt) {
      var rows = parseCSV(txt), head = (rows.shift() || []).map(function (h) { return h.trim().toLowerCase(); });
      var col = function (words) { for (var i = 0; i < head.length; i++) for (var w = 0; w < words.length; w++) if (head[i].indexOf(words[w]) > -1) return i; return -1; };
      var cT = col(["timestamp", "time"]), cN = col(["name"]), cTi = col(["title", "headline"]), cX = col(["take", "opinion", "write", "your", "text"]), cTo = col(["topic", "category"]), cA = col(["approved"]);
      var cutoff = Date.now() - days * 864e5;
      var posts = rows.map(function (r) {
        return { date: parseStamp(r[cT], O.dateOrder), name: (r[cN] || "Anonymous").trim(), title: (r[cTi] || "").trim(), text: (r[cX] || "").trim(), topic: (r[cTo] || "").trim(), ok: cA < 0 ? !O.requireApproval : /^y/i.test((r[cA] || "").trim()) };
      }).filter(function (p) { return p.ok && p.text && p.date && p.date.getTime() > cutoff; })
        .sort(function (a, b) { return b.date - a.date; });
      return { posts: posts, source: "sheet", days: days };
    }).catch(function () { return samples().then(function (l) { return { posts: l, source: "sample", days: days }; }); });
  }
  function noteHTML(p, i, days) {
    var left = Math.max(0, Math.ceil(days - (Date.now() - p.date) / 864e5));
    return '<article class="note" data-reveal style="--d:' + (i % 3) + '">' +
      '<div class="top"><span>' + esc(p.topic || "Opinion") + (p.sample ? ' <span class="sample">Sample</span>' : "") + '</span><span class="left">' + (left <= 1 ? "Last day" : left + " days left") + '</span></div>' +
      (p.title ? '<h3>' + esc(p.title) + '</h3>' : "") +
      '<p class="clamp">' + esc(p.text) + '</p>' +
      (p.text.length > 420 ? '<button class="expand" type="button">Read all</button>' : "") +
      '<div class="by">— ' + esc(p.name) + '</div></article>';
  }
  function opinionWall(box, limit) {
    if (!box) return;
    loadOpinions().then(function (res) {
      var posts = limit ? res.posts.slice(0, limit) : res.posts;
      box.innerHTML = posts.length ? posts.map(function (p, i) { return noteHTML(p, i, res.days); }).join("")
        : '<div class="news-empty" style="column-span:all"><strong>The wall is quiet this week.</strong>Be the first to put an argument up.</div>';
      box.addEventListener("click", function (e) {
        var b = e.target.closest(".expand"); if (!b) return;
        var p = b.previousElementSibling; p.classList.toggle("clamp"); b.textContent = p.classList.contains("clamp") ? "Read all" : "Show less";
      });
      window.PolytricsReveal(box);
    });
  }
  function writeButtons() {
    var url = (CFG.opinion || {}).formURL;
    document.querySelectorAll("[data-write]").forEach(function (a) {
      if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; }
      else { a.href = "#write"; a.removeAttribute("target"); }
    });
    var note = $("#write-note");
    if (note && !url) note.textContent = "Submissions open as soon as the club links its Google Form. Until then, email your piece to " + CFG.email + ".";
  }

  /* ---------- pages ---------- */
  function home() {
    factWidget($("#fact"));
    sealWidget($("#seal"));
    quizWidget($("#quiz"));
    var spot = $("#case-spot");
    if (spot) { spot.innerHTML = caseHTML(C.cases[PT.dayIndex(C.cases.length, 3)], 0); window.PolytricsReveal(spot); }
    newsWidget({ pills: "#news-pills", list: "#news-list", status: "#news-status", limit: 8 });
    opinionWall($("#wall"), 3);
    writeButtons();
  }
  function news() { newsWidget({ pills: "#news-pills", list: "#news-list", status: "#news-status", limit: 40, useHash: true }); }
  function opinion() { opinionWall($("#wall")); writeButtons(); }
  function learn() {
    sealWidget($("#seal"));
    quizWidget($("#quiz"));
    var ex = $("#explainers");
    ex.innerHTML = C.explainers.map(function (x, i) {
      return '<details class="explainer" id="' + x.id + '" data-reveal style="--d:' + (i % 4) + '"><summary><div><span class="cat">' + esc(x.kicker) + '</span><h3>' + esc(x.title) + '</h3></div><span class="plus" aria-hidden="true"></span></summary>' +
        '<div class="body">' + x.body.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join("") + '</div></details>';
    }).join("");
    var h = location.hash.slice(1); if (h && document.getElementById(h) && document.getElementById(h).tagName === "DETAILS") document.getElementById(h).open = true;
    var list = $("#cases"), q = $("#case-q"), area = "All", chips = $("#case-areas");
    var areas = ["All"].concat(C.cases.map(function (c) { return c.area; }).filter(function (v, i, a) { return a.indexOf(v) === i; }));
    chips.innerHTML = areas.map(function (a) { return '<button class="pill" type="button" aria-pressed="' + (a === "All") + '" data-area="' + esc(a) + '">' + esc(a) + '</button>'; }).join("");
    function draw() {
      var term = (q.value || "").toLowerCase();
      var rows = C.cases.filter(function (c) { return (area === "All" || c.area === area) && (!term || (c.name + " " + c.held + " " + c.year + " " + c.area).toLowerCase().indexOf(term) > -1); });
      list.innerHTML = rows.length ? rows.map(caseHTML).join("") : '<p class="news-empty">No case matches that search. Try a name, a year or a topic like "privacy".</p>';
      window.PolytricsReveal(list);
    }
    chips.addEventListener("click", function (e) { var b = e.target.closest("[data-area]"); if (!b) return; area = b.dataset.area; chips.querySelectorAll(".pill").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); draw(); });
    q.addEventListener("input", draw);
    draw();
    window.PolytricsReveal();
  }
  function journal() {
    var reader = $("#reader"), list = $("#posts");
    fetch("data/articles.json", { cache: "no-store" }).then(function (r) { return r.json(); }).catch(function () { return []; }).then(function (posts) {
      if (!posts.length) { list.innerHTML = '<p class="news-empty">The first issue is being edited.</p>'; return; }
      list.innerHTML = posts.map(function (p, i) {
        return '<button class="post" type="button" data-slug="' + esc(p.slug) + '" data-reveal style="--d:' + (i % 3) + '"><div>' +
          '<span class="cat">' + esc(p.category) + '</span>' + (p.sample ? ' <span class="sample">Sample</span>' : "") + '<h3>' + esc(p.title) + '</h3><p>' + esc(p.dek) + '</p></div>' +
          '<span class="by">' + esc(p.author) + ' · ' + Math.max(1, Math.round(p.body.join(" ").split(/\s+/).length / 200)) + ' min</span></button>';
      }).join("");
      window.PolytricsReveal(list);
      function open(slug) {
        var p = posts.filter(function (x) { return x.slug === slug; })[0]; if (!p) return;
        reader.querySelector("article").innerHTML = '<span class="kicker" style="color:var(--red)">' + esc(p.category) + '</span><h1>' + esc(p.title) + '</h1><p class="dek">' + esc(p.dek) + '</p>' +
          '<p style="margin-top:18px;color:var(--ink-soft)">' + esc(p.author) + ' · ' + esc(new Date(p.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })) + '</p>' +
          '<div class="body">' + p.body.map(function (x) { return '<p>' + esc(x) + '</p>'; }).join("") + '</div>';
        reader.hidden = false; reader.scrollTop = 0;
        requestAnimationFrame(function () { requestAnimationFrame(function () { reader.classList.add("open"); }); });
        document.documentElement.style.overflow = "hidden";
        try { history.replaceState(null, "", "#" + slug); } catch (e) {}
        reader.querySelector(".close").focus();
      }
      function close() {
        reader.classList.remove("open"); document.documentElement.style.overflow = "";
        try { history.replaceState(null, "", location.pathname); } catch (e) {}
        setTimeout(function () { reader.hidden = true; }, 900);
      }
      list.addEventListener("click", function (e) { var b = e.target.closest("[data-slug]"); if (b) open(b.dataset.slug); });
      reader.querySelector(".close").addEventListener("click", close);
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && reader.classList.contains("open")) close(); });
      if (location.hash.length > 1) open(location.hash.slice(1));
    });
  }
  function resources() {
    var data = window.POLYTRICS_RESOURCES || [], box = $("#res"), q = $("#res-q");
    function draw() {
      var term = (q.value || "").toLowerCase();
      box.innerHTML = data.map(function (g) {
        var items = g.items.filter(function (it) { return !term || (it[0] + " " + it[1] + " " + g.group).toLowerCase().indexOf(term) > -1; });
        if (!items.length) return "";
        return '<div class="res-group" data-reveal><h3>' + esc(g.group) + '</h3>' + items.map(function (it) {
          return '<a class="res" href="' + esc(it[2]) + '" target="_blank" rel="noopener"><div><b>' + esc(it[0]) + '</b><span>' + esc(it[1]) + '</span></div>' + I.out + '</a>';
        }).join("") + '</div>';
      }).join("") || '<p class="news-empty">Nothing matches that search.</p>';
      window.PolytricsReveal(box);
    }
    q.addEventListener("input", draw); draw();
  }
  function about() {
    (CFG.aboutImages || []).forEach(function (src, i) {
      var el = document.getElementById("photo-" + (i + 1));
      if (el && src) el.innerHTML = '<img src="' + esc(src) + '" alt="Polytrics members" loading="lazy">';
    });
    var mail = $("#club-mail"), btn = $("#copy-mail");
    if (mail) mail.textContent = CFG.email;
    if (btn) btn.addEventListener("click", function () { copy(CFG.email, btn, mail, "Copy email"); });
    var soc = $("#socials"), S = CFG.socials || {};
    if (soc) soc.innerHTML = [["Instagram", S.instagram], ["LinkedIn", S.linkedin], ["X", S.x]].filter(function (x) { return x[1]; })
      .map(function (x) { return '<a class="pill" href="' + esc(x[1]) + '" target="_blank" rel="noopener">' + x[0] + '</a>'; }).join("");
  }

  var map = { home: home, news: news, opinion: opinion, learn: learn, journal: journal, resources: resources, about: about };
  if (map[page]) map[page]();
})();

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

  /* ---------- shared widgets ---------- */
  function factWidget(el) {
    if (!el || !C.facts) return;
    var i = PT.dayIndex(C.facts.length);
    var today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
    function paint(animate) {
      var f = C.facts[i];
      el.innerHTML =
        '<div class="meta"><span>Fact of the day · ' + esc(f.tag) + '</span><span>' + esc(today) + '</span></div>' +
        '<blockquote>' + esc(f.text) + '</blockquote>' +
        '<div class="actions"><button class="chip" type="button" data-act="next">Another fact</button>' +
        '<button class="chip" type="button" data-act="copy">Copy to share</button></div>';
      if (animate && el.animate) el.querySelector("blockquote").animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 500, easing: "ease-out" });
    }
    paint();
    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]"); if (!b) return;
      if (b.dataset.act === "next") { i = (i + 1) % C.facts.length; paint(true); }
      if (b.dataset.act === "copy") {
        var txt = C.facts[i].text + " (via " + CFG.clubName + ")";
        var done = function () { b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy to share"; }, 1600); };
        try { navigator.clipboard.writeText(txt).then(done, function () { selectText(el.querySelector("blockquote")); }); }
        catch (err) { selectText(el.querySelector("blockquote")); }
      }
    });
  }
  function selectText(node) { var r = document.createRange(); r.selectNodeContents(node); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }

  function articleWidget(el) {
    if (!el || !C.articles) return;
    var a = C.articles[PT.dayIndex(C.articles.length, 7)];
    el.innerHTML = '<div class="no"><small>Article of the day</small>' + esc(a.no) + '</div><h3>' + esc(a.title) + '</h3><p>' + esc(a.text) + '</p>';
  }

  function caseHTML(c, i) {
    return '<article class="case" data-reveal style="--d:' + (i % 4) + '"><div class="yr">' + c.year + '</div><div>' +
      '<h3>' + esc(c.name) + '</h3><cite>' + esc(c.cite) + '</cite><p>' + esc(c.held) + '</p><span class="tag">' + esc(c.area) + '</span></div></article>';
  }

  function quizWidget(el) {
    if (!el || !C.quiz) return;
    var n = Math.min(5, C.quiz.length), start = (PT.weekIndex() * n) % C.quiz.length;
    var qs = []; for (var k = 0; k < n; k++) qs.push(C.quiz[(start + k) % C.quiz.length]);
    var idx = 0, score = 0;
    function paint() {
      if (idx >= qs.length) {
        var msg = score === n ? "Full marks. Come argue with us." : score >= n - 2 ? "Strong. You'd hold your own in a mock parliament." : "A good start. The explainers will help.";
        el.innerHTML = '<div class="quiz-top"><span>Quiz of the week</span><span>Done</span></div><div class="quiz-bar"><span style="width:100%"></span></div>' +
          '<div class="score">' + score + '/' + n + '</div><p class="why">' + msg + ' A new set appears every Monday.</p>' +
          '<button class="btn btn--solid next" type="button" data-q="again">Try again ' + I.arrow + '</button>';
        return;
      }
      var q = qs[idx];
      el.innerHTML = '<div class="quiz-top"><span>Quiz of the week</span><span>' + (idx + 1) + ' of ' + n + '</span></div>' +
        '<div class="quiz-bar"><span style="width:' + (idx / n * 100) + '%"></span></div>' +
        '<h3>' + esc(q.q) + '</h3><div class="opts">' +
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
        '<button class="btn btn--solid next" type="button" data-q="next">' + (idx + 1 < n ? "Next question" : "See score") + ' ' + I.arrow + '</button>');
    });
    paint();
  }

  /* ---------- events ---------- */
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
    var head = (rows.shift() || []).map(function (h) { return h.trim().toLowerCase(); });
    return rows.map(function (r) { var o = {}; head.forEach(function (h, j) { o[h] = (r[j] || "").trim(); }); return o; });
  }
  function loadEvents() {
    var fromJSON = function () { return fetch("data/events.json", { cache: "no-store" }).then(function (r) { return r.json(); }).catch(function () { return []; }); };
    var p = CFG.eventsSheetCSV ? fetch(CFG.eventsSheetCSV).then(function (r) { if (!r.ok) throw 0; return r.text(); }).then(parseCSV).catch(fromJSON) : fromJSON();
    return p.then(function (list) {
      list = (list || []).filter(function (e) { return e.title && e.date; });
      list.forEach(function (e) { e._t = new Date(e.date + "T" + (/^\d{1,2}:\d{2}$/.test(e.time || "") ? (e.time.length === 4 ? "0" + e.time : e.time) : "18:00") + ":00"); });
      return list.sort(function (a, b) { return a._t - b._t; });
    });
  }
  function dateBlock(e) {
    return '<div class="date-block"><b>' + e._t.getDate() + '</b><span>' + e._t.toLocaleDateString("en-IN", { month: "short" }) + '</span></div>';
  }
  function eventRow(e, past, i) {
    var sample = e.sample ? '<span class="sample-flag">Sample</span>' : "";
    return '<div class="event-row' + (past ? " past" : "") + '" data-reveal style="--d:' + (i % 5) + '">' + dateBlock(e) +
      '<div><span class="tag">' + esc(e.type || "Event") + '</span><h3>' + esc(e.title) + sample + '</h3>' +
      '<div class="where">' + esc([e._t.toLocaleDateString("en-IN", { weekday: "long" }), e.time, e.venue].filter(Boolean).join(" · ")) + '</div>' +
      (e.description ? '<p style="margin-top:8px;max-width:62ch">' + esc(e.description) + '</p>' : "") + '</div>' +
      (e.link && !past ? '<a class="btn" href="' + esc(e.link) + '" target="_blank" rel="noopener">Register ' + I.arrow + '</a>' : '<span></span>') + '</div>';
  }
  function nextEventCard(el, e) {
    if (!e) { el.innerHTML = '<div class="panel"><h3>No event scheduled right now</h3><p style="margin-top:10px;color:var(--muted)">Follow us on Instagram to hear first when the next one is announced.</p></div>'; return; }
    el.innerHTML = '<div class="next-event"><div class="info"><span class="tag">Next up · ' + esc(e.type || "Event") + '</span>' +
      '<h3>' + esc(e.title) + (e.sample ? '<span class="sample-flag">Sample</span>' : "") + '</h3>' +
      '<p style="color:var(--muted)">' + esc(e.description || "") + '</p>' +
      '<p style="font-weight:600">' + esc(e._t.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })) + (e.time ? " · " + esc(e.time) : "") + (e.venue ? " · " + esc(e.venue) : "") + '</p>' +
      (e.link ? '<div><a class="btn btn--solid" href="' + esc(e.link) + '" target="_blank" rel="noopener">Register ' + I.arrow + '</a></div>' : "") +
      '</div><div class="count"><span class="eyebrow" style="color:#FFD9D4">Starts in</span><div class="countdown" aria-live="off"></div></div></div>';
    var cd = el.querySelector(".countdown");
    function tick() {
      var s = Math.max(0, (e._t - Date.now()) / 1000);
      var parts = [[Math.floor(s / 86400), "Days"], [Math.floor(s % 86400 / 3600), "Hrs"], [Math.floor(s % 3600 / 60), "Min"], [Math.floor(s % 60), "Sec"]];
      cd.innerHTML = parts.map(function (p) { return '<div><b>' + String(p[0]).padStart(2, "0") + '</b><small>' + p[1] + '</small></div>'; }).join("");
    }
    tick(); setInterval(tick, 1000);
  }

  /* ---------- HOME ---------- */
  function home() {
    factWidget($("#fact"));
    articleWidget($("#article"));
    quizWidget($("#quiz"));
    var cs = C.cases[PT.dayIndex(C.cases.length, 3)];
    var spot = $("#case-spot"); if (spot) { spot.innerHTML = caseHTML(cs, 0); window.PolytricsReveal(spot); }
    loadEvents().then(function (list) {
      var up = list.filter(function (e) { return e._t > Date.now(); });
      nextEventCard($("#next-event"), up[0]);
    });
    // ticker: mix of all three desks
    var track = $("#ticker-run");
    if (track) {
      Promise.all(["policy", "politics", "law"].map(function (s) { return window.PolytricsFeeds.get(s).catch(function () { return { items: [] }; }); }))
        .then(function (res) {
          var items = [];
          for (var k = 0; k < 6; k++) res.forEach(function (r) { if (r.items[k]) items.push(r.items[k]); });
          if (!items.length) {
            var f = C.facts.slice(0, 8);
            track.innerHTML = f.concat(f).map(function (x) { return '<a href="law.html">' + esc(x.text) + '</a>'; }).join("");
            return;
          }
          var html = items.map(function (it) { return '<a href="' + esc(it.link) + '" target="_blank" rel="noopener">' + esc(it.title) + '</a>'; }).join("");
          track.innerHTML = html + html;
        });
    }
  }

  /* ---------- POLICY ---------- */
  function policy() {
    window.PolytricsFeeds.render($("#feed"), $("#feed-status"), "policy");
    var ex = $("#explainers");
    if (ex) {
      ex.innerHTML = C.explainers.map(function (x, i) {
        return '<details class="explainer" id="' + x.id + '" data-reveal style="--d:' + (i % 4) + '"><summary><span class="tag">' + esc(x.kicker) + '</span><h3>' + esc(x.title) + '</h3><span class="plus" aria-hidden="true"></span></summary>' +
          '<div class="body">' + x.body.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join("") + '</div></details>';
      }).join("");
      var h = location.hash.slice(1); if (h && document.getElementById(h)) document.getElementById(h).open = true;
      window.PolytricsReveal(ex);
    }
  }

  /* ---------- POLITICS ---------- */
  function politics() {
    var scope = "all";
    function draw() {
      window.PolytricsFeeds.render($("#feed"), $("#feed-status"), "politics", {
        limit: 16,
        filter: scope === "all" ? null : function (it) { return scope === "global" ? it.global : !it.global; }
      });
    }
    document.querySelectorAll("[data-scope]").forEach(function (b) {
      b.addEventListener("click", function () {
        scope = b.dataset.scope;
        document.querySelectorAll("[data-scope]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        draw();
      });
    });
    draw();
    factWidget($("#fact"));
  }

  /* ---------- LAW ---------- */
  function law() {
    window.PolytricsFeeds.render($("#feed"), $("#feed-status"), "law");
    articleWidget($("#article"));
    var list = $("#cases"), q = $("#case-q"), area = "All";
    var areas = ["All"].concat(C.cases.map(function (c) { return c.area; }).filter(function (v, i, a) { return a.indexOf(v) === i; }));
    var chips = $("#case-areas");
    chips.innerHTML = areas.map(function (a) { return '<button class="chip" type="button" aria-pressed="' + (a === "All") + '" data-area="' + esc(a) + '">' + esc(a) + '</button>'; }).join("");
    function draw() {
      var term = (q.value || "").toLowerCase();
      var rows = C.cases.filter(function (c) {
        return (area === "All" || c.area === area) && (!term || (c.name + " " + c.held + " " + c.year + " " + c.area).toLowerCase().indexOf(term) > -1);
      });
      list.innerHTML = rows.length ? rows.map(caseHTML).join("") : '<p class="feed-empty">No case matches that search. Try a name, a year or a topic like "privacy".</p>';
      window.PolytricsReveal(list);
    }
    chips.addEventListener("click", function (e) {
      var b = e.target.closest("[data-area]"); if (!b) return; area = b.dataset.area;
      chips.querySelectorAll(".chip").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); draw();
    });
    q.addEventListener("input", draw);
    draw();
  }

  /* ---------- EVENTS ---------- */
  function events() {
    loadEvents().then(function (list) {
      var now = Date.now();
      var up = list.filter(function (e) { return e._t > now; });
      var past = list.filter(function (e) { return e._t <= now; }).reverse();
      nextEventCard($("#next-event"), up[0]);
      $("#upcoming").innerHTML = up.length > 1 ? up.slice(1).map(function (e, i) { return eventRow(e, false, i); }).join("") : '<p class="feed-empty">More events will be announced soon.</p>';
      $("#past").innerHTML = past.length ? past.map(function (e, i) { return eventRow(e, true, i); }).join("") : '<p class="feed-empty">Our archive starts with the first event of the year.</p>';
      window.PolytricsReveal();
    });
  }

  /* ---------- JOURNAL ---------- */
  function journal() {
    var reader = $("#reader"), grid = $("#posts");
    fetch("data/articles.json", { cache: "no-store" }).then(function (r) { return r.json(); }).catch(function () { return []; }).then(function (posts) {
      if (!posts.length) { grid.innerHTML = '<p class="feed-empty">The first issue is being edited.</p>'; return; }
      grid.innerHTML = posts.map(function (p, i) {
        return '<button class="post' + (i === 0 ? " post--lead" : "") + '" type="button" data-slug="' + esc(p.slug) + '" data-reveal style="--d:' + (i % 3) + (i === 0 ? ';grid-column:1/-1' : '') + '">' +
          '<span class="tag">' + esc(p.category) + (p.sample ? ' · Sample' : '') + '</span><h3>' + esc(p.title) + '</h3><p>' + esc(p.dek) + '</p>' +
          '<span class="by">' + esc(p.author) + ' · ' + esc(new Date(p.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })) + ' · ' + Math.max(1, Math.round(p.body.join(" ").split(/\s+/).length / 200)) + ' min read</span></button>';
      }).join("");
      window.PolytricsReveal(grid);
      function open(slug) {
        var p = posts.filter(function (x) { return x.slug === slug; })[0]; if (!p) return;
        reader.querySelector("article").innerHTML = '<span class="tag">' + esc(p.category) + '</span><h1>' + esc(p.title) + '</h1><p class="lede">' + esc(p.dek) + '</p>' +
          '<p class="by" style="margin-top:18px;font:600 .72rem/1 var(--sans);letter-spacing:.12em;text-transform:uppercase;color:var(--muted)">' + esc(p.author) + '</p>' +
          '<div class="body">' + p.body.map(function (x) { return '<p>' + esc(x) + '</p>'; }).join("") + '</div>';
        reader.hidden = false; reader.scrollTop = 0;
        requestAnimationFrame(function () { reader.classList.add("open"); });
        document.documentElement.style.overflow = "hidden";
        try { history.replaceState(null, "", "#" + slug); } catch (e) {}
        reader.querySelector(".close").focus();
      }
      function close() {
        reader.classList.remove("open"); document.documentElement.style.overflow = "";
        try { history.replaceState(null, "", location.pathname); } catch (e) {}
        setTimeout(function () { reader.hidden = true; }, 700);
      }
      grid.addEventListener("click", function (e) { var b = e.target.closest("[data-slug]"); if (b) open(b.dataset.slug); });
      reader.querySelector(".close").addEventListener("click", close);
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && reader.classList.contains("open")) close(); });
      if (location.hash.length > 1) open(location.hash.slice(1));
    });
  }

  /* ---------- RESOURCES ---------- */
  function resources() {
    var data = window.POLYTRICS_RESOURCES || [];
    var box = $("#res"), q = $("#res-q");
    function draw() {
      var term = (q.value || "").toLowerCase();
      box.innerHTML = data.map(function (g) {
        var items = g.items.filter(function (it) { return !term || (it[0] + " " + it[1] + " " + g.group).toLowerCase().indexOf(term) > -1; });
        if (!items.length) return "";
        return '<div class="res-group" data-reveal><h3>' + esc(g.group) + '</h3>' + items.map(function (it) {
          return '<a class="res" href="' + esc(it[2]) + '" target="_blank" rel="noopener"><div><b>' + esc(it[0]) + '</b><span>' + esc(it[1]) + '</span></div>' + I.out + '</a>';
        }).join("") + '</div>';
      }).join("") || '<p class="feed-empty">Nothing matches that search.</p>';
      window.PolytricsReveal(box);
    }
    q.addEventListener("input", draw); draw();
  }

  /* ---------- ABOUT ---------- */
  function about() {
    fetch("data/team.json", { cache: "no-store" }).then(function (r) { return r.json(); }).catch(function () { return []; }).then(function (team) {
      $("#team").innerHTML = team.map(function (m, i) {
        var initials = m.name.split(/\s+/).map(function (w) { return w[0]; }).join("").slice(0, 2);
        return '<div class="member" data-reveal style="--d:' + (i % 4) + '"><div class="ph">' + (m.photo ? '<img src="' + esc(m.photo) + '" alt="' + esc(m.name) + '" loading="lazy">' : '<span class="initials">' + esc(initials) + '</span>') + '</div>' +
          '<div><span>' + esc(m.role) + '</span><h3 style="margin-top:8px">' + esc(m.name) + '</h3>' + (m.linkedin ? '<a class="link-arrow" style="margin-top:10px" href="' + esc(m.linkedin) + '" target="_blank" rel="noopener">LinkedIn ' + I.arrow + '</a>' : "") + '</div></div>';
      }).join("");
      window.PolytricsReveal($("#team"));
    });
    var gf = $("#gform");
    if (gf) { if (CFG.joinGoogleForm) gf.href = CFG.joinGoogleForm; else gf.hidden = true; }
    var mail = $("#club-mail"); if (mail) mail.textContent = CFG.email;
    var copyBtn = $("#copy-mail");
    if (copyBtn) copyBtn.addEventListener("click", function () {
      try { navigator.clipboard.writeText(CFG.email).then(function () { copyBtn.textContent = "Copied"; }, function () { selectText(mail); }); } catch (e) { selectText(mail); }
    });
    var form = $("#join-form"), note = $("#form-note");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = new FormData(form);
      if (!CFG.formEndpoint) {
        note.className = "form-note";
        note.textContent = "Applications open soon. In the meantime, email us at " + CFG.email + " with your name, programme and the desk you want to join.";
        return;
      }
      note.className = "form-note"; note.textContent = "Sending…";
      fetch(CFG.formEndpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
        .then(function (r) { if (!r.ok) throw 0; form.reset(); note.className = "form-note ok"; note.textContent = "Thanks. Your application reached the team, and we'll write to you within a week."; })
        .catch(function () { note.className = "form-note"; note.textContent = "That didn't go through. Check your connection and try again, or email " + CFG.email + "."; });
    });
  }

  var map = { home: home, policy: policy, politics: politics, law: law, events: events, journal: journal, resources: resources, about: about };
  if (map[page]) map[page]();
})();

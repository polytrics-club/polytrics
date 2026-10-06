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

  /* ---------- quiz (works for the weekly Constitution set and the daily news set) ---------- */
  function quizWidget(el, qs, opt) {
    if (!el || !qs || !qs.length) return;
    opt = opt || {};
    var n = qs.length, idx = 0, score = 0, title = opt.title || "Quiz of the week";
    function paint() {
      if (idx >= n) {
        var msg = score === n ? "Full marks. Come argue with us." : score >= n - 2 ? "Strong. You clearly follow the news." : "A good start. The news page will help.";
        el.innerHTML = '<div class="quiz-top"><span>' + esc(title) + '</span><span>Done</span></div><div class="quiz-bar"><span style="width:100%"></span></div>' +
          '<div class="score">' + score + '/' + n + '</div><p class="why">' + msg + ' ' + esc(opt.again || "A new set arrives every Monday.") + '</p>' +
          '<button class="btn next" type="button" data-q="again">Try again ' + I.arrow + '</button>';
        return;
      }
      var q = qs[idx];
      el.innerHTML = '<div class="quiz-top"><span>' + esc(title) + '</span><span>' + (idx + 1) + ' of ' + n + '</span></div>' +
        '<div class="quiz-bar"><span style="width:' + (idx / n * 100) + '%"></span></div><h3>' + esc(q.q) + '</h3>' +
        (q.quote ? '<p class="quote">\u201C' + esc(q.quote) + '\u201D</p>' : "") + '<div class="opts">' +
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
      el.insertAdjacentHTML("beforeend", '<p class="why">' + (pick === q.answer ? "Correct. " : "Not quite. ") + esc(q.why) +
        (q.link ? ' <a class="textlink" href="' + esc(q.link) + '" target="_blank" rel="noopener">Read the story</a>' : "") + '</p>' +
        '<button class="btn next" type="button" data-q="next">' + (idx + 1 < n ? "Next question" : "See score") + ' ' + I.arrow + '</button>');
    });
    paint();
  }
  function constitutionQuiz() {
    var n = Math.min(5, C.quiz.length), start = (PT.weekIndex() * n) % C.quiz.length, out = [];
    for (var k = 0; k < n; k++) out.push(C.quiz[(start + k) % C.quiz.length]);
    return out;
  }
  /* today's news quiz: data/quiz.json from the GitHub Action, else built here from live headlines */
  function dailyQuiz(el) {
    if (!el) return;
    var NQ = window.PolytricsNewsQuiz, today = NQ.dayKey();
    var fallback = function () { quizWidget(el, constitutionQuiz(), { title: "Quiz of the week" }); };
    var label = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    var show = function (qs) { quizWidget(el, qs, { title: "News quiz \u00B7 " + label, again: "A new quiz arrives every day." }); };
    fetch("data/quiz.json", { cache: "no-store" }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).catch(function () { return null; })
      .then(function (d) {
        if (d && d.date === today && d.questions && d.questions.length >= 3) return show(d.questions);
        return window.PolytricsFeeds.get("all").then(function (res) {
          var qs = NQ.buildQuiz(res.items, today, 5);
          if (qs.length >= 3) show(qs); else fallback();
        });
      }).catch(fallback);
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

  /* ---------- weekly discussion topics ---------- */
  function loadTopics() {
    var NQ = window.PolytricsNewsQuiz, wk = NQ.weekInfo();
    var labels = {}; (CFG.newsCategories || []).forEach(function (c) { labels[c.key] = c.label; });
    return fetch("data/topics.json", { cache: "no-store" }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).catch(function () { return null; })
      .then(function (d) {
        if (d && d.week === wk.key && d.topics && d.topics.length) return d;
        return window.PolytricsFeeds.get("all").then(function (res) {
          return { week: wk.key, start: wk.start, end: wk.end, topics: NQ.buildTopics(res.items, C.motions, wk.key, wk.no, labels) };
        });
      });
  }
  function weekLabel(t) {
    var f = function (s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString("en-IN", { day: "numeric", month: "short" }); };
    return f(t.start) + " \u2013 " + f(t.end);
  }

  /* ---------- opinion wall: posts + replies, stored in a Google Sheet ---------- */
  var O = CFG.opinion || {}, DAYS = O.days || 7, wallState = { posts: [], live: false, filter: "all" };
  function api(body) {
    var opts = body ? { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body) } : { cache: "no-store" };
    return fetch(body ? O.api : O.api + (O.api.indexOf("?") > -1 ? "&" : "?") + "t=" + Date.now(), opts).then(function (r) { if (!r.ok) throw 0; return r.json(); });
  }
  function loadWall() {
    var samples = function () {
      return fetch("data/opinions.json", { cache: "no-store" }).then(function (r) { return r.json(); }).catch(function () { return []; }).then(function (list) {
        list.forEach(function (p) {
          p.date = new Date(Date.now() - (p.daysAgo || 0) * 864e5 - 3600e3).toISOString();
          (p.replies = p.replies || []).forEach(function (r) { r.date = new Date(Date.now() - (r.daysAgo || 0) * 864e5 - 1200e3).toISOString(); });
        });
        return { posts: list, live: false };
      });
    };
    if (!O.api) return samples();
    return api().then(function (d) { return { posts: d.posts || [], live: true }; }).catch(samples);
  }
  function daysLeft(date) { var l = Math.ceil(DAYS - (Date.now() - new Date(date)) / 864e5); return l <= 1 ? "Last day" : l + " days left"; }
  function replyHTML(r) { return '<div class="reply"><p>' + esc(r.text) + '</p><span>' + esc(r.name) + ' \u00B7 ' + esc(PT.ago(r.date)) + '</span></div>'; }
  function noteHTML(p, i, interactive) {
    var reps = p.replies || [];
    return '<article class="note" data-id="' + esc(p.id) + '" data-reveal style="--d:' + (i % 3) + '">' +
      '<div class="top"><span>' + esc(p.topic && p.topicId !== "open" ? "On: " + p.topic : "Open floor") + (p.sample ? ' <span class="sample">Sample</span>' : "") + '</span></div>' +
      (p.title ? '<h3>' + esc(p.title) + '</h3>' : "") +
      '<p class="clamp body">' + esc(p.text) + '</p>' +
      (p.text.length > 420 ? '<button class="expand" type="button">Read all</button>' : "") +
      '<div class="by">\u2014 ' + esc(p.name) + '</div>' +
      '<div class="meta"><span class="left">' + daysLeft(p.date) + '</span><span>' + esc(PT.ago(p.date)) + '</span></div>' +
      (interactive ?
        '<div class="thread"' + (reps.length ? "" : " hidden") + '>' + reps.map(replyHTML).join("") + '</div>' +
        '<button class="reply-toggle" type="button">' + (reps.length ? "Replies (" + reps.length + ") \u00B7 Reply" : "Reply") + '</button>' +
        '<form class="reply-form" hidden novalidate>' +
          '<input name="name" maxlength="40" placeholder="Your name" autocomplete="name" aria-label="Your name">' +
          '<textarea name="text" maxlength="600" rows="3" placeholder="Agree? Disagree? Say why." aria-label="Your reply"></textarea>' +
          '<input name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
          '<button class="btn btn--red" type="submit">Post reply</button><p class="form-msg" aria-live="polite"></p></form>'
        : (reps.length ? '<div class="meta"><span>' + reps.length + (reps.length === 1 ? " reply" : " replies") + '</span></div>' : "")) +
      '</article>';
  }
  function renderWall(box, opts) {
    var posts = wallState.posts;
    if (wallState.filter !== "all") posts = posts.filter(function (p) { return (p.topicId || "open") === wallState.filter || (wallState.filter === "open" && !p.topicId); });
    if (opts.limit) posts = posts.slice(0, opts.limit);
    box.innerHTML = posts.length ? posts.map(function (p, i) { return noteHTML(p, i, opts.interactive); }).join("")
      : '<div class="news-empty" style="column-span:all"><strong>Nothing here yet.</strong>Be the first to put an argument up.</div>';
    window.PolytricsReveal(box);
  }
  function savedName() { return PT.store("pt-name") || ""; }
  function cooldownOk(msgEl, kind) {
    var last = +(PT.store("pt-last-" + kind) || 0), wait = kind === "reply" ? 10000 : 30000;
    if (Date.now() - last < wait) { msgEl.textContent = "You just posted. Wait a few seconds before posting again."; return false; }
    return true;
  }
  var WALL_CACHE = "pt-wall-cache";
  function opinionWall(box, opts) {
    if (!box) return Promise.resolve();
    opts = opts || {};
    // 1) show something straight away: last posts this browser saw, or placeholders
    var cached = null;
    try { cached = O.api ? JSON.parse(PT.store(WALL_CACHE) || "null") : null; } catch (e) { cached = null; }
    var cutoff = Date.now() - DAYS * 864e5;
    if (cached && cached.posts) {
      wallState.posts = cached.posts.filter(function (p) { return new Date(p.date) > cutoff; }); wallState.live = true; wallState.ready = true;
      renderWall(box, opts);
    } else {
      box.innerHTML = new Array((opts.limit || 3) + 1).join('<div class="note note--loading"><span></span><span></span><span></span></div>');
    }
    if (opts.interactive) bindWall(box);
    // 2) then fetch fresh posts and swap them in
    return loadWall().then(function (res) {
      wallState.posts = res.posts; wallState.live = res.live; wallState.ready = true;
      if (res.live) { try { PT.store(WALL_CACHE, JSON.stringify({ t: Date.now(), posts: res.posts })); } catch (e) {} }
      renderWall(box, opts);
    });
  }
  function bindWall(box) {
    if (box.dataset.bound) return; box.dataset.bound = "1";
      box.addEventListener("click", function (e) {
        var b = e.target.closest(".expand");
        if (b) { var p = b.parentNode.querySelector(".body"); p.classList.toggle("clamp"); b.textContent = p.classList.contains("clamp") ? "Read all" : "Show less"; return; }
        var t = e.target.closest(".reply-toggle");
        if (t) {
          var note = t.closest(".note"), f = note.querySelector(".reply-form"), th = note.querySelector(".thread");
          f.hidden = !f.hidden; if (th.children.length) th.hidden = false;
          if (!f.hidden) { f.name.value = f.name.value || savedName(); (f.name.value ? f.text : f.name).focus(); }
        }
      });
      box.addEventListener("submit", function (e) {
        var f = e.target.closest(".reply-form"); if (!f) return;
        e.preventDefault();
        var msg = f.querySelector(".form-msg"), note = f.closest(".note");
        if (!wallState.live) { msg.textContent = "Replies open once the club connects the wall to its Google Sheet."; return; }
        if (f.name.value.trim().length < 2) { msg.textContent = "Add your name first."; f.name.focus(); return; }
        if (f.text.value.trim().length < 5) { msg.textContent = "Write your reply first."; f.text.focus(); return; }
        if (!cooldownOk(msg, "reply")) return;
        var btn = f.querySelector("button"); btn.disabled = true; msg.textContent = "Posting\u2026";
        api({ type: "reply", postId: note.dataset.id, name: f.name.value, text: f.text.value, website: f.website.value }).then(function (d) {
          btn.disabled = false;
          if (!d.ok) { msg.textContent = d.error || "That didn't go through. Try again."; return; }
          PT.store("pt-name", f.name.value.trim()); PT.store("pt-last-reply", String(Date.now()));
          var th = note.querySelector(".thread"); th.hidden = false; th.insertAdjacentHTML("beforeend", replyHTML(d.reply));
          var post = wallState.posts.filter(function (p) { return p.id === note.dataset.id; })[0]; if (post) post.replies.push(d.reply);
          note.querySelector(".reply-toggle").textContent = "Replies (" + th.children.length + ") \u00B7 Reply";
          f.text.value = ""; msg.textContent = "Reply posted.";
        }).catch(function () { btn.disabled = false; msg.textContent = "That didn't go through. Check your connection and try again."; });
      });
  }
  function countFor(t) { return wallState.posts.filter(function (p) { return (p.topicId || "open") === t.id; }).length; }
  function refreshCounts(box, data) {
    data.topics.forEach(function (t) {
      var b = box.querySelector('[data-filter-topic="' + t.id + '"]'); if (!b) return;
      var n = countFor(t); b.textContent = n ? n + (n === 1 ? " post" : " posts") : "No posts yet";
    });
  }
  function topicCards(box, data, onPick) {
    box.innerHTML = data.topics.map(function (t, i) {
      var n = wallState.posts.filter(function (p) { return (p.topicId || "open") === t.id || (t.kind === "motion" && p.topicId === "motion"); }).length;
      return '<article class="topic topic--' + t.kind + '" data-reveal style="--d:' + i + '">' +
        '<span class="cat">' + esc(t.label) + '</span><h3>' + esc(t.title) + '</h3>' +
        (t.link ? '<a class="textlink src" href="' + esc(t.link) + '" target="_blank" rel="noopener">Read the story' + (t.source ? " \u00B7 " + esc(t.source) : "") + '</a>' : "") +
        '<div class="pills"><button class="pill" type="button" data-write-topic="' + esc(t.id) + '">Write about this</button>' +
        '<button class="pill" type="button" data-filter-topic="' + esc(t.id) + '">' + (n ? n + (n === 1 ? " post" : " posts") : "No posts yet") + '</button></div></article>';
    }).join("");
    box.addEventListener("click", function (e) {
      var w = e.target.closest("[data-write-topic]"), f = e.target.closest("[data-filter-topic]");
      if (w) onPick("write", w.dataset.writeTopic);
      if (f) onPick("filter", f.dataset.filterTopic);
    });
    window.PolytricsReveal(box);
  }

  /* ---------- pages ---------- */
  function home() {
    factWidget($("#fact"));
    sealWidget($("#seal"));
    dailyQuiz($("#quiz"));
    var spot = $("#case-spot");
    if (spot) { spot.innerHTML = caseHTML(C.cases[PT.dayIndex(C.cases.length, 3)], 0); window.PolytricsReveal(spot); }
    newsWidget({ pills: "#news-pills", list: "#news-list", status: "#news-status", limit: 8 });
    opinionWall($("#wall"), { limit: 3 });
    loadTopics().then(function (d) {
      var el = $("#topic-strip"); if (!el) return;
      el.innerHTML = '<span class="kicker" style="color:var(--red)">This week\u2019s topics \u00B7 ' + esc(weekLabel(d)) + '</span><ul>' +
        d.topics.filter(function (t) { return t.kind !== "open"; }).map(function (t) { return '<li><a href="opinion.html#topics">' + esc(t.title) + '</a></li>'; }).join("") + '</ul>';
    }).catch(function () {});
  }
  function news() { newsWidget({ pills: "#news-pills", list: "#news-list", status: "#news-status", limit: 40, useHash: true }); }
  function opinion() {
    var box = $("#wall"), form = $("#post-form"), pills = $("#wall-pills"), sel = $("#f-topic"), msg = $("#post-msg");
    var topicsData = null;
    function setFilter(id) {
      wallState.filter = id;
      pills.querySelectorAll(".pill").forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.f === id); });
      if (wallState.ready) renderWall(box, { interactive: true });
    }
    function buildPills() {
      if (!topicsData) return;
      var list = [{ id: "all", t: "All posts" }].concat(topicsData.topics.map(function (t) { return { id: t.id, t: t.kind === "open" ? "Open floor" : t.title }; }));
      pills.innerHTML = list.map(function (x) { return '<button class="pill" type="button" data-f="' + esc(x.id) + '" aria-pressed="' + (x.id === wallState.filter) + '" title="' + esc(x.t) + '">' + esc(x.t.length > 46 ? x.t.slice(0, 44) + "\u2026" : x.t) + '</button>'; }).join("");
    }
    pills.addEventListener("click", function (e) { var b = e.target.closest("[data-f]"); if (b) setFilter(b.dataset.f); });
    // topics and posts load independently, so neither waits for the other
    function syncTopics() {
      if (!topicsData) return;
      var m = topicsData.topics.filter(function (t) { return t.kind === "motion"; })[0];
      wallState.posts.forEach(function (p) { if (p.topicId === "motion" && m) p.topicId = m.id; });   // sample posts
      refreshCounts($("#topics-list"), topicsData);
    }
    $("#topics-list").innerHTML = '<div class="topic topic--motion topic--loading"><span></span><span></span></div><div class="topic topic--loading"><span></span><span></span></div><div class="topic topic--loading"><span></span><span></span></div>';
    loadTopics().then(function (d) {
      topicsData = d;
      $("#week-label").textContent = weekLabel(topicsData);
      topicCards($("#topics-list"), topicsData, function (what, id) {
        if (what === "filter") { setFilter(id); $("#wall-sec").scrollIntoView({ behavior: "smooth" }); }
        else { sel.value = id; $("#write").scrollIntoView({ behavior: "smooth" }); setTimeout(function () { (form.name.value ? form.title : form.name).focus({ preventScroll: true }); }, 700); }
      });
      sel.innerHTML = topicsData.topics.map(function (t) { return '<option value="' + esc(t.id) + '">' + esc(t.kind === "open" ? "Open floor (any issue)" : t.title) + '</option>'; }).join("");
      buildPills(); syncTopics(); if (wallState.ready) renderWall(box, { interactive: true });
    });
    opinionWall(box, { interactive: true }).then(function () { syncTopics(); if (topicsData) renderWall(box, { interactive: true }); });
    form.name.value = savedName();
    var count = $("#f-count");
    form.text.addEventListener("input", function () { count.textContent = form.text.value.length + " / 2000"; });
    if (!O.api) { msg.textContent = "Posting opens once the club connects the wall to its Google Sheet. The posts above are samples."; }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!O.api) { msg.textContent = "Posting opens once the club connects the wall to its Google Sheet."; return; }
      if (form.name.value.trim().length < 2) { msg.textContent = "Add your name first."; form.name.focus(); return; }
      if (form.text.value.trim().length < 40) { msg.textContent = "Your take is a bit short. Write at least a couple of sentences."; form.text.focus(); return; }
      if (!cooldownOk(msg, "post")) return;
      var t = (topicsData && topicsData.topics.filter(function (x) { return x.id === sel.value; })[0]) || { id: "open", title: "Open floor", kind: "open" };
      var btn = form.querySelector('button[type="submit"]'); btn.disabled = true; msg.textContent = "Posting\u2026";
      api({ type: "post", name: form.name.value, title: form.title.value, text: form.text.value, topicId: t.id, topic: t.kind === "open" ? "Open floor" : t.title, website: form.website.value })
        .then(function (d) {
          btn.disabled = false;
          if (!d.ok) { msg.textContent = d.error || "That didn't go through. Try again."; return; }
          PT.store("pt-name", form.name.value.trim()); PT.store("pt-last-post", String(Date.now()));
          wallState.posts.unshift(d.post); wallState.filter = "all"; buildPills(); renderWall(box, { interactive: true });
          if (topicsData) refreshCounts($("#topics-list"), topicsData);
          form.title.value = ""; form.text.value = ""; count.textContent = "0 / 2000";
          msg.textContent = "Posted. Your take is on the wall for the next " + DAYS + " days.";
          $("#wall-sec").scrollIntoView({ behavior: "smooth" });
        }).catch(function () { btn.disabled = false; msg.textContent = "That didn't go through. Check your connection and try again."; });
    });
  }
  function learn() {
    sealWidget($("#seal"));
    quizWidget($("#quiz"), constitutionQuiz(), { title: "Quiz of the week" });
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

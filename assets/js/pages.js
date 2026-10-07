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
    function draw() { return window.PolytricsFeeds.render(box, status, current, { limit: opts.limit, recent: opts.recent }); }
    if (opts.watch) window.PolytricsFeeds.watch(function (n) {
      window.PolytricsFeeds.newPill(n, function () { draw(); box.scrollIntoView({ behavior: "smooth", block: "start" }); });
    });
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
  /* submissions waiting for approval: kept in this browser so the author can see them */
  var PENDING = "pt-pending";
  function pendingGet() {
    var d; try { d = JSON.parse(PT.store(PENDING) || "{}") || {}; } catch (e) { d = {}; }
    var cut = Date.now() - 3 * 864e5;
    d.posts = (d.posts || []).filter(function (p) { return new Date(p.date) > cut; });
    d.replies = (d.replies || []).filter(function (r) { return new Date(r.date) > cut; });
    return d;
  }
  function pendingSave(d) { PT.store(PENDING, JSON.stringify(d)); }
  function replyHTML(r) {
    return '<div class="reply' + (r.pending ? " reply--pending" : "") + '"><p>' + esc(r.text) + '</p><span>' + esc(r.name) + ' \u00B7 ' +
      (r.pending ? "Waiting for approval \u00B7 only you can see this" : esc(PT.ago(r.date))) + '</span></div>';
  }
  function noteHTML(p, i, interactive) {
    var reps = (p.replies || []).slice();
    var known = {}; reps.forEach(function (r) { known[r.id] = 1; });
    pendingGet().replies.forEach(function (r) { if (r.postId === p.id && !known[r.id]) reps.push(Object.assign({ pending: true }, r)); });
    return '<article class="note" data-id="' + esc(p.id) + '" data-reveal style="--d:' + (i % 3) + '">' +
      '<div class="top"><span>' + esc(p.topic && p.topicId !== "open" ? "On: " + p.topic : "Open floor") + (p.sample ? ' <span class="sample">Sample</span>' : "") + '</span></div>' +
      (p.title ? '<h3>' + esc(p.title) + '</h3>' : "") +
      '<p class="clamp body">' + esc(p.text) + '</p>' +
      (p.text.length > 420 ? '<button class="expand" type="button">Read all</button>' : "") +
      '<div class="by">\u2014 ' + esc(p.name) + '</div>' +
      (p.pending
        ? '<div class="meta"><span class="left pending">Waiting for approval</span><span>Only you can see this until an editor approves it</span></div>'
        : '<div class="meta"><span class="left">' + daysLeft(p.date) + '</span><span>' + esc(PT.ago(p.date)) + '</span></div>') +
      (interactive && !p.pending ?
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
    var ids = {}; wallState.posts.forEach(function (p) { ids[p.id] = 1; });
    var mine = opts.interactive && wallState.live ? pendingGet().posts.filter(function (p) { return !ids[p.id]; }).map(function (p) { return Object.assign({ pending: true }, p); }) : [];
    var posts = mine.concat(wallState.posts);
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
          var pend = pendingGet(); pend.replies.push(d.reply); pendingSave(pend);
          var th = note.querySelector(".thread"); th.hidden = false; th.insertAdjacentHTML("beforeend", replyHTML(Object.assign({ pending: true }, d.reply)));
          f.text.value = ""; msg.textContent = "Thanks! Your reply appears for everyone once an editor approves it.";
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
    newsWidget({ pills: "#news-pills", list: "#news-list", status: "#news-status", limit: 8, recent: true, watch: true });
    opinionWall($("#wall"), { limit: 3 });
    loadTopics().then(function (d) {
      var el = $("#topic-strip"); if (!el) return;
      el.innerHTML = '<span class="kicker" style="color:var(--red)">This week\u2019s topics \u00B7 ' + esc(weekLabel(d)) + '</span><ul>' +
        d.topics.filter(function (t) { return t.kind !== "open"; }).map(function (t) { return '<li><a href="opinion.html#topics">' + esc(t.title) + '</a></li>'; }).join("") + '</ul>';
    }).catch(function () {});
  }
  /* ---------- NEWS: the Briefing Room ---------- */
  var CONTEXT_RULES = [
    { re: /\bordinances?\b/i, ex: "ordinance" },
    { re: /money bill/i, ex: "money-bill" },
    { re: /defect|disqualif/i, ex: "anti-defection" },
    { re: /delimitation/i, ex: "delimitation" },
    { re: /basic structure/i, ex: "basic-structure" },
    { re: /president'?s rule|article 356/i, art: "356" },
    { re: /election commission|\bECI\b|poll panel/i, art: "324" },
    { re: /finance commission/i, art: "280" },
    { re: /pardon|mercy petition|clemency/i, art: "72" },
    { re: /uniform civil code|\bUCC\b/i, art: "44" },
    { re: /right to education|\bRTE\b/i, art: "21A" },
    { re: /internet shutdown|internet ban|internet suspen/i, cs: "Anuradha Bhasin" },
    { re: /privacy|data protection|surveillance/i, cs: "Puttaswamy" },
    { re: /electoral bond|political funding|poll funding/i, cs: "Electoral Bonds" },
    { re: /reservation|quota|creamy layer/i, cs: "Indra Sawhney" },
    { re: /sexual harassment|\bPOSH\b/i, cs: "Vishaka" },
    { re: /free speech|freedom of speech|sedition|censorship/i, art: "19(1)(a)" },
    { re: /constitution(al)? amendment|amend(ing)? the constitution/i, art: "368" },
    { re: /\bbills?\b.*\b(pass|passed|passes|tabled|introduced|lok sabha|rajya sabha|parliament)\b|\b(pass|passed|passes|tables|introduces)\b.*\bbills?\b/i, ex: "bill-to-law" },
    { re: /high court/i, art: "226" },
    { re: /supreme court/i, art: "32" }
  ];
  function contextFor(title) {
    for (var i = 0; i < CONTEXT_RULES.length; i++) {
      var r = CONTEXT_RULES[i]; if (!r.re.test(title)) continue;
      if (r.ex) { var x = C.explainers.filter(function (e) { return e.id === r.ex; })[0]; if (x) return { label: "Explainer", title: x.title, text: x.body[0], href: "learn.html#" + x.id }; }
      if (r.art) { var a = C.articles.filter(function (e) { return e.no === r.art; })[0]; if (a) return { label: "Article " + a.no, title: a.title, text: a.text, href: "learn.html" }; }
      if (r.cs) { var c = C.cases.filter(function (e) { return e.name.indexOf(r.cs) > -1; })[0]; if (c) return { label: "Landmark case · " + c.year, title: c.name, text: c.held, href: "learn.html#cases-sec" }; }
    }
    return null;
  }
  var NEWS_STOP = {};
  ("a,an,the,and,or,but,of,to,in,on,for,with,at,by,from,as,is,are,was,were,be,been,being,has,have,had,will,would,can,could,should,may,might,must,after,before,over,under,amid,against,about,into,onto,its,it,this,that,these,those,his,her,their,our,your,not,no,new,says,said,say,more,than,also,how,what,why,who,when,where,which,all,out,up,down,off,just,now,still,get,gets,got,set,sets,top,key,big,first,last,next,year,years,day,days,week,weeks,month,months,report,reports,news,live,updates,update,latest,today,india,indian,india's,govt,government,state,states,amid,via,per,vs,one,two,three,four,five,six,ten,many,most,some,any,only,very,much,made,make,makes,take,takes,took,back,know,read,here,there,while,during,between,without,within,among,across,toward,towards,ahead,need,needs,calls,call,seeks,seek,asks,ask,urges,big,major,amidst,around,against,since,till,until,like,them,they,he,she,we,you,i,him,me,us,if,so,then,once,again,yet,whether,both,each,other,another,such,own,same,over,set,may,did,does,do,done,being,make,people,time,times,check,watch,video,photos,explained,opinion,editorial,analysis").split(",").forEach(function (w) { NEWS_STOP[w] = 1; });
  var NEWS_PHRASES = [["supreme court", "Supreme Court"], ["high court", "High Court"], ["lok sabha", "Lok Sabha"], ["rajya sabha", "Rajya Sabha"], ["election commission", "Election Commission"], ["union budget", "Union Budget"], ["repo rate", "Repo rate"], ["chief minister", "Chief Minister"], ["prime minister", "Prime Minister"], ["model code", "Model code"], ["bihar polls", "Bihar polls"], ["assembly polls", "Assembly polls"]];
  function trendingTerms(items) {
    var df = {}, show = {};
    items.forEach(function (it) {
      var t = " " + window.PolytricsNewsQuiz.cleanTitle(it.title) + " ", seen = {};
      NEWS_PHRASES.forEach(function (ph) { var re = new RegExp("\\b" + ph[0] + "\\b", "i"); if (re.test(t)) { seen[ph[0]] = 1; show[ph[0]] = ph[1]; t = t.replace(new RegExp("\\b" + ph[0] + "\\b", "ig"), " "); } });
      t.split(/[^A-Za-z0-9'\-]+/).forEach(function (w) {
        w = w.replace(/^['\-]+|['\-]+$/g, "").replace(/'s$/i, "");
        var k = w.toLowerCase();
        if (k.length < 4 || NEWS_STOP[k] || /^\d+$/.test(k)) return;
        seen[k] = 1; if (!show[k] || /^[A-Z]/.test(w)) show[k] = /^[A-Z]{2,}$/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1);
      });
      Object.keys(seen).forEach(function (k) { df[k] = (df[k] || 0) + 1; });
    });
    return Object.keys(df).filter(function (k) { return df[k] >= 2; })
      .sort(function (a, b) { return df[b] - df[a] || a.localeCompare(b); }).slice(0, 18)
      .map(function (k) { return { key: k, label: show[k], n: df[k] }; });
  }
  function dayBucket(date) {
    var NQ = window.PolytricsNewsQuiz, d = date ? NQ.dayKey(new Date(date)) : "";
    var today = NQ.dayKey(), yest = NQ.dayKey(new Date(Date.now() - 864e5));
    return d === today ? "Today" : d === yest ? "Yesterday" : date ? "Earlier this week" : "Recently";
  }
  function news() {
    var pulse = $("#pulse"), trend = $("#trending"), stream = $("#stream"), status = $("#brief-status"), q = $("#brief-q"), active = $("#brief-active");
    var cats = CFG.newsCategories || [], items = [], state = { cat: null, term: null, q: "" };
    var label = window.PolytricsFeeds.label;
    stream.innerHTML = new Array(6).join('<div class="skeleton"></div>');
    window.PolytricsFeeds.watch(function (n) { window.PolytricsFeeds.newPill(n, function () { load(); window.scrollTo({ top: 0, behavior: "smooth" }); }); });
    function load() { return window.PolytricsFeeds.get("all").then(function (res) {
      var weekAgo = Date.now() - 7 * 864e5;
      items = res.items.filter(function (it) { return !it.date || new Date(it.date) > weekAgo; });
      if (!items.length) items = res.items;
      status.innerHTML = window.PolytricsFeeds.status(res, items);
      if (!items.length) {
        pulse.innerHTML = trend.innerHTML = "";
        stream.innerHTML = '<div class="news-empty"><strong>Headlines are on their way.</strong>This page fills itself once the site is online. Until then, go straight to the sources:<div class="pills">' +
          (CFG.sourceLinks || []).map(function (l) { return '<a class="pill" href="' + l[1] + '" target="_blank" rel="noopener">' + esc(l[0]) + '</a>'; }).join("") + '</div></div>';
        return;
      }
      drawPulse(); drawTrend(); drawActive(); drawStream();
    }); }
    load();

    /* where the news is: one bar per category, sorted, direct-labelled */
    function drawPulse() {
      var counts = cats.map(function (c) {
        var mine = items.filter(function (it) { return it.cat === c.key; });
        return { key: c.key, label: c.label, n: mine.length, top: mine[0] };
      }).filter(function (c) { return c.n; }).sort(function (a, b) { return b.n - a.n; });
      var max = Math.max.apply(null, counts.map(function (c) { return c.n; }).concat([1])), total = items.length;
      pulse.innerHTML = '<div class="bars" role="list">' + counts.map(function (c) {
        var pct = Math.round(c.n / total * 100);
        return '<button class="bar-row" type="button" role="listitem" data-cat="' + c.key + '" aria-pressed="' + (state.cat === c.key) + '" aria-label="' + esc(c.label) + ': ' + c.n + ' headlines, ' + pct + ' percent. Show only these."' +
          ' data-tip="' + esc(c.top ? window.PolytricsNewsQuiz.cleanTitle(c.top.title) : "") + '">' +
          '<span class="bar-label">' + esc(c.label) + '</span><span class="bar-track"><span class="bar" style="--w:' + (c.n / max * 100).toFixed(1) + '%"></span></span>' +
          '<span class="bar-val">' + c.n + ' <small>' + pct + '%</small></span></button>';
      }).join("") + '</div><div class="tip" role="tooltip" hidden></div>';
      var tip = pulse.querySelector(".tip");
      function showTip(row, x, y) {
        if (!row.dataset.tip) return;
        tip.innerHTML = '<b>Top story</b>' + esc(row.dataset.tip);
        var box = pulse.getBoundingClientRect(), r = row.getBoundingClientRect();
        tip.hidden = false;
        var left = (x != null ? x - box.left : r.left - box.left + r.width / 2) - tip.offsetWidth / 2;
        tip.style.left = Math.max(0, Math.min(box.width - tip.offsetWidth, left)) + "px";
        tip.style.top = (r.bottom - box.top + 8) + "px";
      }
      pulse.querySelectorAll(".bar-row").forEach(function (row) {
        row.addEventListener("mousemove", function (e) { showTip(row, e.clientX, e.clientY); });
        row.addEventListener("focus", function () { showTip(row); });
        row.addEventListener("mouseleave", function () { tip.hidden = true; });
        row.addEventListener("blur", function () { tip.hidden = true; });
        row.addEventListener("click", function () { state.cat = state.cat === row.dataset.cat ? null : row.dataset.cat; refresh(); });
      });
    }
    function drawTrend() {
      var terms = trendingTerms(items);
      if (!terms.length) { trend.innerHTML = '<p class="status">Not enough headlines yet to spot a trend.</p>'; return; }
      var hi = terms[0].n, lo = terms[terms.length - 1].n;
      trend.innerHTML = terms.map(function (t) {
        var tier = hi === lo ? 2 : 1 + Math.round((t.n - lo) / (hi - lo) * 2);
        return '<button class="term term--' + tier + '" type="button" data-term="' + esc(t.key) + '" aria-pressed="' + (state.term === t.key) + '">' + esc(t.label) + '<small>' + t.n + '</small></button>';
      }).join("");
      trend.querySelectorAll(".term").forEach(function (b) {
        b.addEventListener("click", function () { state.term = state.term === b.dataset.term ? null : b.dataset.term; refresh(); });
      });
    }
    function matches(it) {
      var t = it.title.toLowerCase();
      return (!state.cat || it.cat === state.cat) && (!state.term || t.indexOf(state.term) > -1) && (!state.q || (t + " " + (it.source || "").toLowerCase()).indexOf(state.q) > -1);
    }
    function drawStream() {
      var rows = items.filter(matches), groups = {}, order = [];
      rows.forEach(function (it) { var g = dayBucket(it.date); if (!groups[g]) { groups[g] = []; order.push(g); } groups[g].push(it); });
      if (!rows.length) { stream.innerHTML = '<div class="news-empty"><strong>No headlines match.</strong>Try another word, or clear the filters.</div>'; return; }
      var n = 0;
      stream.innerHTML = order.map(function (g) {
        return '<div class="day"><h3 class="day-head">' + g + ' <small>' + groups[g].length + '</small></h3><ul class="briefs">' + groups[g].slice(0, 40).map(function (it) {
          var ctx = contextFor(it.title), i = n++;
          return '<li class="brief" data-reveal style="--d:' + (i % 6) + '"><span class="cat">' + esc(label(it.cat)) + (window.PolytricsFeeds.isNew(it) ? '<b class="new-tag">New</b>' : "") + '</span>' +
            '<a class="t" href="' + esc(it.link) + '" target="_blank" rel="noopener">' + esc(it.title) + '</a>' +
            '<span class="src">' + esc([it.source, PT.ago(it.date)].filter(Boolean).join(" · ")) + '</span>' +
            '<div class="acts">' + (ctx ? '<button class="act" type="button" data-ctx aria-expanded="false">Context</button>' : "") +
            '<button class="act act--debate" type="button" data-debate="' + esc(window.PolytricsNewsQuiz.cleanTitle(it.title)) + '">Debate this ' + I.arrow + '</button></div>' +
            (ctx ? '<div class="ctx" hidden><span class="cat">' + esc(ctx.label) + '</span><b>' + esc(ctx.title) + '</b><p>' + esc(ctx.text) + '</p><a class="textlink" href="' + ctx.href + '">Learn more ' + I.arrow + '</a></div>' : "") +
            '</li>';
        }).join("") + '</ul></div>';
      }).join("");
      window.PolytricsReveal(stream);
    }
    function drawActive() {
      var chips = [];
      if (state.cat) chips.push('<button class="pill" type="button" aria-pressed="true" data-clear="cat">' + esc(label(state.cat)) + ' ×</button>');
      if (state.term) chips.push('<button class="pill" type="button" aria-pressed="true" data-clear="term">“' + esc(state.term) + '” ×</button>');
      if (state.q) chips.push('<button class="pill" type="button" aria-pressed="true" data-clear="q">Search: ' + esc(state.q) + ' ×</button>');
      active.innerHTML = chips.length ? '<span class="status">Showing:</span>' + chips.join("") : "";
    }
    function refresh() {
      pulse.querySelectorAll(".bar-row").forEach(function (b) { b.setAttribute("aria-pressed", state.cat === b.dataset.cat); });
      trend.querySelectorAll(".term").forEach(function (b) { b.setAttribute("aria-pressed", state.term === b.dataset.term); });
      drawActive(); drawStream();
    }
    active.addEventListener("click", function (e) {
      var b = e.target.closest("[data-clear]"); if (!b) return;
      state[b.dataset.clear] = b.dataset.clear === "q" ? "" : null; if (b.dataset.clear === "q") q.value = ""; refresh();
    });
    var qt; q.addEventListener("input", function () { clearTimeout(qt); qt = setTimeout(function () { state.q = q.value.trim().toLowerCase(); refresh(); }, 180); });
    stream.addEventListener("click", function (e) {
      var c = e.target.closest("[data-ctx]");
      if (c) { var box = c.closest(".brief").querySelector(".ctx"); box.hidden = !box.hidden; c.setAttribute("aria-expanded", !box.hidden); c.textContent = box.hidden ? "Context" : "Hide context"; return; }
      var d = e.target.closest("[data-debate]");
      if (d) { PT.store("pt-prefill", JSON.stringify({ title: d.dataset.debate, t: Date.now() })); location.href = "opinion.html#write"; }
    });
  }
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
      if (form.dataset.prefill) sel.value = "open";
      buildPills(); syncTopics(); if (wallState.ready) renderWall(box, { interactive: true });
    });
    opinionWall(box, { interactive: true }).then(function () { syncTopics(); if (topicsData) renderWall(box, { interactive: true }); });
    form.name.value = savedName();
    var count = $("#f-count");
    form.text.addEventListener("input", function () { count.textContent = form.text.value.length + " / 2000"; });
    if (!O.api) { msg.textContent = "Posting opens once the club connects the wall to its Google Sheet. The posts above are samples."; }
    // arriving from "Debate this" on the News page
    try {
      var pre = JSON.parse(PT.store("pt-prefill") || "null");
      if (pre && Date.now() - pre.t < 15 * 60e3) {
        form.text.value = "Responding to \u201C" + pre.title + "\u201D\n\n"; count.textContent = form.text.value.length + " / 2000";
        PT.store("pt-prefill", ""); form.dataset.prefill = "1";
        if (location.hash === "#write") setTimeout(function () { form.text.focus({ preventScroll: true }); form.text.setSelectionRange(form.text.value.length, form.text.value.length); }, 900);
      }
    } catch (e) {}
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
          var pend = pendingGet(); pend.posts.unshift(d.post); pendingSave(pend);
          wallState.filter = "all"; buildPills(); renderWall(box, { interactive: true });
          form.title.value = ""; form.text.value = ""; count.textContent = "0 / 2000";
          msg.textContent = "Thanks! Your take is with the editors. It goes up on the wall once it's approved (usually within a day) and then stays for " + DAYS + " days. Until then, only you can see it.";
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
  /* ---------- JOURNAL: approved articles from the Google Sheet + data/articles.json ---------- */
  var JOURNAL_CACHE = "pt-journal-cache";
  function paragraphs(text) {
    var parts = String(text || "").split(/\n\s*\n/);
    if (parts.length < 2) parts = String(text || "").split(/\n/);
    return parts.map(function (x) { return x.trim(); }).filter(Boolean);
  }
  function fromSheet(a) { return { slug: a.id, title: a.title, dek: a.dek, category: a.category, author: a.name, date: a.date, body: paragraphs(a.body) }; }
  function journal() {
    var reader = $("#reader"), list = $("#posts"), form = $("#article-form"), msg = $("#article-msg"), wc = $("#a-count");
    var posts = [];
    function draw() {
      if (!posts.length) { list.innerHTML = '<div class="news-empty"><strong>The first issue is being edited.</strong>Be the first to write for the Journal. The form is just below.</div>'; return; }
      list.innerHTML = posts.map(function (p, i) {
        return '<button class="post" type="button" data-slug="' + esc(p.slug) + '" data-reveal style="--d:' + (i % 3) + '"><div>' +
          '<span class="cat">' + esc(p.category) + '</span>' + (p.sample ? ' <span class="sample">Sample</span>' : "") + '<h3>' + esc(p.title) + '</h3>' + (p.dek ? '<p>' + esc(p.dek) + '</p>' : "") + '</div>' +
          '<span class="by">' + esc(p.author) + ' \u00B7 ' + Math.max(1, Math.round(p.body.join(" ").split(/\s+/).length / 200)) + ' min read</span></button>';
      }).join("");
      window.PolytricsReveal(list);
    }
    function merge(live, json) {
      var real = json.filter(function (p) { return !p.sample; });
      var all = live.map(fromSheet).concat(real);
      if (!all.length) all = json;                       // show samples only until real articles exist
      return all.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
    }
    list.innerHTML = '<div class="post post--loading"><span></span><span></span><span></span></div><div class="post post--loading"><span></span><span></span><span></span></div>';
    var json = fetch("data/articles.json", { cache: "no-store" }).then(function (r) { return r.json(); }).catch(function () { return []; });
    var cached = null; try { cached = O.api ? JSON.parse(PT.store(JOURNAL_CACHE) || "null") : null; } catch (e) {}
    if (cached) json.then(function (j) { posts = merge(cached.articles || [], j); draw(); openFromHash(); });
    var live = O.api ? fetch(O.api + (O.api.indexOf("?") > -1 ? "&" : "?") + "type=journal&t=" + Date.now()).then(function (r) { return r.json(); })
      .then(function (d) { try { PT.store(JOURNAL_CACHE, JSON.stringify({ articles: d.articles || [] })); } catch (e) {} return d.articles || []; }).catch(function () { return cached ? cached.articles : []; }) : Promise.resolve([]);
    Promise.all([live, json]).then(function (r) { posts = merge(r[0], r[1]); draw(); openFromHash(); });

    var opened = false;
    function openFromHash() { if (!opened && location.hash.length > 1 && location.hash !== "#write") { opened = true; open(location.hash.slice(1)); } }
    function open(slug) {
      var p = posts.filter(function (x) { return x.slug === slug; })[0]; if (!p) return;
      reader.querySelector("article").innerHTML = '<span class="kicker" style="color:var(--red)">' + esc(p.category) + '</span><h1>' + esc(p.title) + '</h1>' + (p.dek ? '<p class="dek">' + esc(p.dek) + '</p>' : "") +
        '<p style="margin-top:18px;color:var(--ink-soft)">' + esc(p.author) + ' \u00B7 ' + esc(new Date(p.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })) + '</p>' +
        '<div class="body">' + p.body.map(function (x) { return '<p>' + esc(x) + '</p>'; }).join("") + '</div>' +
        '<div class="share"><button class="pill" type="button" data-share>Copy link to this article</button></div>';
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
    reader.addEventListener("click", function (e) {
      var b = e.target.closest("[data-share]"); if (!b) return;
      var url = location.href.split("#")[0] + location.hash;
      try { navigator.clipboard.writeText(url).then(function () { b.textContent = "Link copied"; }, function () { b.textContent = url; }); } catch (err) { b.textContent = url; }
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && reader.classList.contains("open")) close(); });

    /* submission form */
    if (!form) return;
    form.name.value = savedName();
    function words() { var t = form.body.value.trim(); return t ? t.split(/\s+/).length : 0; }
    form.body.addEventListener("input", function () { var n = words(); wc.textContent = n + (n === 1 ? " word" : " words") + (n < 250 ? " \u00B7 at least 250" : ""); });
    if (!O.api) msg.textContent = "Submissions open once the club connects the Journal to its Google Sheet.";
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!O.api) { msg.textContent = "Submissions open once the club connects the Journal to its Google Sheet."; return; }
      if (form.name.value.trim().length < 2) { msg.textContent = "Add your name first."; form.name.focus(); return; }
      if (form.title.value.trim().length < 8) { msg.textContent = "Add a headline for your article."; form.title.focus(); return; }
      if (words() < 250) { msg.textContent = "Journal articles need at least 250 words. For shorter pieces, use the Opinion Wall."; form.body.focus(); return; }
      if (!cooldownOk(msg, "article")) return;
      var btn = form.querySelector('button[type="submit"]'); btn.disabled = true; msg.textContent = "Sending\u2026";
      api({ type: "article", name: form.name.value, email: form.email.value, category: form.category.value, title: form.title.value, dek: form.dek.value, body: form.body.value, website: form.website.value })
        .then(function (d) {
          btn.disabled = false;
          if (!d.ok) { msg.textContent = d.error || "That didn't go through. Try again."; return; }
          PT.store("pt-name", form.name.value.trim()); PT.store("pt-last-article", String(Date.now()));
          form.title.value = ""; form.dek.value = ""; form.body.value = ""; wc.textContent = "0 words";
          msg.textContent = "Thank you! Your article is with the editors. They may suggest edits before it's published here.";
        }).catch(function () { btn.disabled = false; msg.textContent = "That didn't go through. Check your connection and try again. Your text is still in the form."; });
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
    var mail = $("#club-mail"), btn = $("#copy-mail"), line = $("#mail-line");
    if (line && !CFG.email) line.hidden = true;               // no inbox set yet: show Instagram only
    if (mail) mail.textContent = CFG.email || "";
    if (btn) btn.addEventListener("click", function () { copy(CFG.email, btn, mail, "Copy email"); });
    var soc = $("#socials"), S = CFG.socials || {};
    if (soc) soc.innerHTML = [["Instagram " + (S.instagramHandle || ""), S.instagram]].filter(function (x) { return x[1]; })
      .map(function (x) { return '<a class="pill" href="' + esc(x[1]) + '" target="_blank" rel="noopener">' + x[0] + '</a>'; }).join("");

    /* album: click a photo to see it large */
    document.querySelectorAll(".snap-img").forEach(function (b) {
      b.addEventListener("click", function () {
        var img = b.querySelector("img"), cap = b.parentNode.querySelector("figcaption");
        var lb = document.createElement("div");
        lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-label", "Photo");
        lb.innerHTML = '<figure><img src="' + esc(img.getAttribute("src")) + '" alt="' + esc(img.alt) + '"><figcaption>' + esc(cap ? cap.textContent : "") + '</figcaption></figure>';
        function close() { lb.classList.remove("show"); document.removeEventListener("keydown", key); setTimeout(function () { lb.remove(); b.focus(); }, 350); }
        function key(e) { if (e.key === "Escape") close(); }
        lb.addEventListener("click", close); document.addEventListener("keydown", key);
        document.body.appendChild(lb); requestAnimationFrame(function () { lb.classList.add("show"); });
      });
    });
  }

  var map = { home: home, news: news, opinion: opinion, learn: learn, journal: journal, resources: resources, about: about };
  if (map[page]) map[page]();
})();

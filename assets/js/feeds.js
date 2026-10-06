/* =========================================================
   POLYTRICS — live news, sorted by category
   1. data/feeds.json (refreshed every 3 h by the GitHub Action)
   2. otherwise live via rss2json (works on any public host)
   3. otherwise a calm note with links to the sources
   ========================================================= */
(function () {
  "use strict";
  var CFG = window.POLYTRICS_CONFIG || {};
  var CATS = CFG.newsCategories || [];
  var jsonCache = null, catCache = {};

  function label(key) { for (var i = 0; i < CATS.length; i++) if (CATS[i].key === key) return CATS[i].label; return key; }

  function clean(item, cat) {
    var t = (item.title || "").trim(), src = item.source || "";
    var m = t.match(/^(.*) - ([^-]{2,60})$/);           // Google News appends " - Publisher"
    if (m) { t = m[1]; if (!src || /Google News/i.test(src)) src = m[2]; }
    return { title: t, link: item.link, date: item.date, source: src, cat: cat };
  }
  var WEEK = 7 * 864e5, NEW_MS = 3 * 36e5;
  /* the visitor's previous visit, read once per page; updated a few seconds after load */
  var lastVisit = 0;
  try { lastVisit = +(localStorage.getItem("pt-lastvisit") || 0); } catch (e) {}
  setTimeout(function () { try { localStorage.setItem("pt-lastvisit", String(Date.now())); } catch (e) {} }, 8000);
  function age(it) { return it.date ? Date.now() - new Date(it.date) : Infinity; }
  function isNew(it) { var d = it.date ? new Date(it.date).getTime() : 0; return age(it) < NEW_MS || (lastVisit && d > lastVisit); }
  function sinceLast(items) { return lastVisit ? items.filter(function (it) { return it.date && new Date(it.date) > lastVisit; }).length : 0; }
  function dedupe(items) {
    var seen = {};
    return items.filter(function (it) {
      if (age(it) > WEEK) return false;                       // never show anything older than a week
      var k = (it.title || "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
      if (!k || seen[k]) return false; seen[k] = 1; return true;
    }).sort(function (a, b) { return new Date(b.date || 0) - new Date(a.date || 0); });
  }
  function loadJSON() {
    if (!jsonCache) jsonCache = fetch("data/feeds.json", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); }).catch(function () { return null; });
    return jsonCache;
  }
  function viaRss2Json(feed) {
    return fetch("https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(feed.url))
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) {
        if (j.status !== "ok") throw 0;
        return (j.items || []).map(function (it) { return { title: it.title, link: it.link, date: it.pubDate && it.pubDate.replace(" ", "T") + "Z", source: feed.name }; });
      });
  }

  /* one category -> Promise<{items, mode, updated}> */
  function getCat(cat) {
    if (catCache[cat]) return catCache[cat];
    catCache[cat] = loadJSON().then(function (data) {
      var sec = data && data.sections && data.sections[cat];
      if (sec && sec.length) return { items: dedupe(sec.map(function (it) { return clean(it, cat); })), mode: "cached", updated: data.updated };
      var feeds = (CFG.feeds && CFG.feeds[cat]) || [];
      return Promise.all(feeds.map(function (f) { return viaRss2Json(f).catch(function () { return []; }); }))
        .then(function (lists) {
          var all = [].concat.apply([], lists).map(function (it) { return clean(it, cat); });
          return all.length ? { items: dedupe(all), mode: "live", updated: new Date().toISOString() } : { items: [], mode: "offline" };
        });
    });
    return catCache[cat];
  }

  /* "all" interleaves categories so one busy desk doesn't crowd out the rest */
  function get(cat) {
    if (cat && cat !== "all") return getCat(cat);
    return Promise.all(CATS.map(function (c) { return getCat(c.key); })).then(function (res) {
      var out = [], mode = "offline", updated = null;
      res.forEach(function (r) { if (r.mode !== "offline") { mode = r.mode; updated = updated || r.updated; } });
      var depth = Math.max.apply(null, res.map(function (r) { return r.items.length; }).concat([0]));
      for (var k = 0; k < depth; k++) res.forEach(function (r) { if (r.items[k]) out.push(r.items[k]); });
      return { items: dedupe(out.slice(0, 120)), mode: mode, updated: updated };
    });
  }

  function render(box, statusEl, cat, opts) {
    opts = opts || {};
    var PT = window.PT, esc = PT.esc;
    box.innerHTML = '<ul class="news">' + new Array(6).join('<li class="skeleton"></li>') + '</ul>';
    return get(cat).then(function (res) {
      var pool = res.items;
      if (opts.recent) {                                       // home: today's news first
        var day = pool.filter(function (it) { return age(it) < 864e5; });
        pool = day.length >= 6 ? day : pool.filter(function (it) { return age(it) < 2 * 864e5; });
      }
      var items = pool.slice(0, opts.limit || 24);
      if (statusEl) statusEl.innerHTML = statusHTML(res, pool);
      if (!items.length) {
        box.innerHTML = '<div class="news-empty"><strong>Headlines are on their way.</strong>' +
          'This section fills itself with the latest stories once the site is published. Until then, go straight to the sources:' +
          '<div class="pills">' + (CFG.sourceLinks || []).map(function (l) { return '<a class="pill" href="' + l[1] + '" target="_blank" rel="noopener">' + esc(l[0]) + '</a>'; }).join("") + '</div></div>';
        return res;
      }
      box.innerHTML = '<ul class="news">' + items.map(function (it, i) {
        return '<li data-reveal style="--d:' + (i % 6) + '"><a href="' + esc(it.link) + '" target="_blank" rel="noopener">' +
          '<span class="cat">' + esc(label(it.cat)) + (isNew(it) ? '<b class="new-tag">New</b>' : "") + '</span>' +
          '<span class="t">' + esc(it.title) + '</span>' +
          '<span class="src">' + esc([it.source, PT.ago(it.date)].filter(Boolean).join(" · ")) + '</span></a></li>';
      }).join("") + '</ul>';
      window.PolytricsReveal && window.PolytricsReveal(box);
      return res;
    });
  }

  function statusHTML(res, items) {
    if (res.mode === "offline") return '<span class="live off"></span>Live headlines start once the site is online';
    var n = sinceLast(items || res.items), fresh = (items || res.items).filter(function (it) { return age(it) < NEW_MS; }).length;
    return '<span class="live"></span><b>Live</b> \u00B7 updated ' + (PT.ago(res.updated) || "just now") +
      (n ? ' \u00B7 <span class="since">' + n + ' new since your last visit</span>' : fresh ? ' \u00B7 <span class="since">' + fresh + ' in the last 3 hours</span>' : "");
  }

  /* while a page is open, look for newer headlines every 10 minutes */
  function watch(onNew) {
    var known = null;
    function snapshot() { return fetch("data/feeds.json?t=" + Date.now(), { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); }
    snapshot().then(function (d) { known = d && d.updated; });
    setInterval(function () {
      if (document.hidden) return;
      snapshot().then(function (d) {
        if (!d || !d.updated || d.updated === known) return;
        var before = known; known = d.updated;
        var all = [].concat.apply([], Object.keys(d.sections || {}).map(function (k) { return d.sections[k]; }));
        var n = all.filter(function (it) { return it.date && (!before || new Date(it.date) > new Date(before)); }).length;
        jsonCache = null; catCache = {};                        // next render uses the fresh file
        if (n) onNew(n);
      });
    }, 10 * 60 * 1000);
  }
  function newPill(n, onClick) {
    var b = document.querySelector(".new-pill");
    if (!b) { b = document.createElement("button"); b.type = "button"; b.className = "new-pill"; document.body.appendChild(b); }
    b.innerHTML = "\u2191 " + n + (n === 1 ? " new headline" : " new headlines");
    b.onclick = function () { b.classList.remove("show"); onClick(); };
    requestAnimationFrame(function () { b.classList.add("show"); });
  }

  window.PolytricsFeeds = { get: get, render: render, label: label, isNew: isNew, status: statusHTML, watch: watch, newPill: newPill, sinceLast: sinceLast };
})();

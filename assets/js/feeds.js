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
  function dedupe(items) {
    var seen = {};
    return items.filter(function (it) {
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
      var items = res.items.slice(0, opts.limit || 24);
      if (statusEl) statusEl.innerHTML = res.mode === "offline"
        ? '<span class="live off"></span>Live headlines start once the site is online'
        : '<span class="live"></span>Updated ' + (PT.ago(res.updated) || "just now");
      if (!items.length) {
        box.innerHTML = '<div class="news-empty"><strong>Headlines are on their way.</strong>' +
          'This section fills itself with the latest stories once the site is published. Until then, go straight to the sources:' +
          '<div class="pills">' + (CFG.sourceLinks || []).map(function (l) { return '<a class="pill" href="' + l[1] + '" target="_blank" rel="noopener">' + esc(l[0]) + '</a>'; }).join("") + '</div></div>';
        return res;
      }
      box.innerHTML = '<ul class="news">' + items.map(function (it, i) {
        return '<li data-reveal style="--d:' + (i % 6) + '"><a href="' + esc(it.link) + '" target="_blank" rel="noopener">' +
          '<span class="cat">' + esc(label(it.cat)) + '</span>' +
          '<span class="t">' + esc(it.title) + '</span>' +
          '<span class="src">' + esc([it.source, PT.ago(it.date)].filter(Boolean).join(" · ")) + '</span></a></li>';
      }).join("") + '</ul>';
      window.PolytricsReveal && window.PolytricsReveal(box);
      return res;
    });
  }

  window.PolytricsFeeds = { get: get, render: render, label: label };
})();

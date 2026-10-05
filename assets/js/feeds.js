/* =========================================================
   POLYTRICS — live feeds
   1. data/feeds.json (refreshed every 3 h by the GitHub Action)
   2. otherwise live via rss2json (works on any public host)
   3. otherwise a calm "offline" note with links to the sources
   ========================================================= */
(function () {
  "use strict";
  var CFG = window.POLYTRICS_CONFIG || {};
  var cache = null;

  function cleanTitle(item) {
    var t = (item.title || "").trim();
    var src = item.source || "";
    // Google News appends " - Publisher"
    var m = t.match(/^(.*) - ([^-]{2,60})$/);
    if (m) { t = m[1]; if (!src || /Google News/.test(src)) src = m[2]; }
    return { title: t, source: src };
  }

  function loadJSON() {
    if (cache) return cache;
    cache = fetch("data/feeds.json", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .catch(function () { return null; });
    return cache;
  }

  function viaRss2Json(feed) {
    var u = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(feed.url);
    return fetch(u).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
      if (j.status !== "ok") throw 0;
      return (j.items || []).map(function (it) {
        return { title: it.title, link: it.link, date: it.pubDate && it.pubDate.replace(" ", "T") + "Z", source: feed.name, global: !!feed.global };
      });
    });
  }

  function dedupe(items) {
    var seen = {};
    return items.filter(function (it) {
      var k = (it.title || "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
      if (!k || seen[k]) return false; seen[k] = 1; return true;
    }).sort(function (a, b) { return new Date(b.date || 0) - new Date(a.date || 0); });
  }

  /* returns Promise<{items, mode:"cached"|"live"|"offline", updated}> */
  function get(section) {
    return loadJSON().then(function (data) {
      var sec = data && data.sections && data.sections[section];
      if (sec && sec.length) return { items: dedupe(sec.map(function (it) { var c = cleanTitle(it); return Object.assign({}, it, c); })), mode: "cached", updated: data.updated };
      var feeds = (CFG.feeds && CFG.feeds[section]) || [];
      return Promise.all(feeds.map(function (f) { return viaRss2Json(f).catch(function () { return []; }); }))
        .then(function (lists) {
          var all = [].concat.apply([], lists).map(function (it) { var c = cleanTitle(it); return Object.assign({}, it, c); });
          return all.length ? { items: dedupe(all), mode: "live", updated: new Date().toISOString() } : { items: [], mode: "offline" };
        });
    });
  }

  function render(listEl, statusEl, section, opts) {
    opts = opts || {};
    var esc = window.PT.esc, icon = window.PT.icon;
    listEl.innerHTML = '<ul class="feed"><li class="skeleton"></li><li class="skeleton"></li><li class="skeleton"></li><li class="skeleton"></li></ul>';
    return get(section).then(function (res) {
      var items = res.items;
      if (opts.filter) items = items.filter(opts.filter);
      items = items.slice(0, opts.limit || 14);
      if (statusEl) {
        statusEl.innerHTML = res.mode === "offline"
          ? '<span class="live off"></span>Live feed connects once the site is online'
          : '<span class="live"></span>Updated ' + (window.PT.ago(res.updated) || "just now");
      }
      if (!items.length) {
        var links = ((CFG.sourceLinks || {})[section] || []).map(function (l) {
          return '<a class="chip" href="' + l[1] + '" target="_blank" rel="noopener">' + esc(l[0]) + '</a>';
        }).join("");
        listEl.innerHTML = '<div class="feed-empty"><strong>Headlines are on their way.</strong>' +
          'This feed pulls the latest stories automatically once the site is published. Until then, read the sources directly:' +
          '<div class="src-links">' + links + '</div></div>';
        return res;
      }
      listEl.innerHTML = '<ul class="feed">' + items.map(function (it, i) {
        return '<li data-reveal style="--d:' + Math.min(i, 6) + '"><a href="' + esc(it.link) + '" target="_blank" rel="noopener">' +
          '<time datetime="' + esc(it.date) + '">' + esc(window.PT.ago(it.date)) + '</time>' +
          '<span><span class="t">' + esc(it.title) + '</span><span class="src">' + esc(it.source || "") + '</span></span>' +
          '<span class="go">' + icon.out + '</span></a></li>';
      }).join("") + '</ul>';
      window.PolytricsReveal && window.PolytricsReveal(listEl);
      return res;
    });
  }

  window.PolytricsFeeds = { get: get, render: render };
})();

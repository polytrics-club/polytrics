/* =========================================================
   POLYTRICS — daily news quiz + weekly discussion topics
   Used in two places:
   - the GitHub Action (scripts/fetch-feeds.mjs) writes data/quiz.json and data/topics.json
   - the browser, as a fallback when those files are missing or out of date
   No AI and no API keys: questions are "fill the gap" puzzles built from real headlines.
   ========================================================= */
(function (root) {
  "use strict";

  var STOP = {};
  ("The,This,That,These,Those,What,When,Where,Which,Who,Why,How,After,Before,Amid,Over,Under,From,With,Without,Into,Upon,About,Against,Between," +
   "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday,January,February,March,April,June,July,August,September,October,November,December," +
   "Says,Said,Will,Would,Could,Should,Must,Here,There,Their,They,Them,Then,Than,Also,Just,More,Most,Some,Many,Much,Only,Even,Still,Live,Updates,Update," +
   "News,Latest,Breaking,Watch,Video,Photos,Explained,Opinion,Editorial,Analysis,Report,Today,Year,Years,Week,Month,First,Last,Next,New,Know,Read,Check," +
   "India,Indian,India's").split(",").forEach(function (w) { STOP[w.toLowerCase()] = 1; });

  function cleanTitle(t) {
    t = String(t || "").replace(/\s+/g, " ").trim();
    var m = t.match(/^(.*) - ([^-]{2,60})$/);           // drop " - Publisher"
    return m ? m[1].trim() : t;
  }

  /* seeded random so everyone sees the same quiz on the same day */
  function rng(seedStr) {
    var h = 1779033703 ^ seedStr.length;
    for (var i = 0; i < seedStr.length; i++) { h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909);
      return ((h ^= h >>> 16) >>> 0) / 4294967296;
    };
  }
  function shuffle(a, r) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* words worth blanking out: names, places, institutions, acronyms */
  function candidates(title) {
    var out = [], words = title.split(" ");
    for (var i = 1; i < words.length; i++) {               // never the first word
      var w = words[i].replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, "").replace(/['’]s$/, "");
      if (!w || STOP[w.toLowerCase()]) continue;
      var acronym = /^[A-Z]{2,6}$/.test(w);
      var proper = /^[A-Z][a-z][A-Za-z\-]{2,}$/.test(w);
      if (acronym || proper) out.push({ word: w, kind: acronym ? "A" : "P" });
    }
    return out;
  }

  /* items: [{title, link, source, cat}] -> [{q, quote, options, answer, why, link, source, cat}] */
  function buildQuiz(items, seed, n) {
    n = n || 5;
    var r = rng("quiz:" + seed);
    var pool = { A: [], P: [] }, seen = {};
    var usable = [];
    items.forEach(function (it) {
      var title = cleanTitle(it.title);
      if (title.length < 30 || title.length > 160) return;
      var c = candidates(title);
      if (!c.length) return;
      usable.push({ it: it, title: title, c: c });
      c.forEach(function (x) { var k = x.word.toLowerCase(); if (!seen[k]) { seen[k] = 1; pool[x.kind].push(x.word); } });
    });
    // round-robin across categories so one topic doesn't dominate
    var byCat = {};
    shuffle(usable, r).forEach(function (u) { (byCat[u.it.cat || "x"] = byCat[u.it.cat || "x"] || []).push(u); });
    var cats = shuffle(Object.keys(byCat), r), order = [];
    for (var k = 0; order.length < usable.length; k++) cats.forEach(function (c) { if (byCat[c][k]) order.push(byCat[c][k]); });

    var qs = [], usedAnswers = {};
    for (var i = 0; i < order.length && qs.length < n; i++) {
      var u = order[i];
      var pick = u.c.slice().sort(function (a, b) { return b.word.length - a.word.length; })[0];
      if (usedAnswers[pick.word.toLowerCase()]) continue;
      var lowerTitle = u.title.toLowerCase();
      var distract = shuffle(pool[pick.kind].length >= 4 ? pool[pick.kind] : pool.A.concat(pool.P), r)
        .filter(function (w) { return w.toLowerCase() !== pick.word.toLowerCase() && lowerTitle.indexOf(w.toLowerCase()) === -1; })
        .slice(0, 3);
      if (distract.length < 3) continue;
      var options = shuffle([pick.word].concat(distract), r);
      var re = new RegExp("\\b" + pick.word.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + "\\b");
      usedAnswers[pick.word.toLowerCase()] = 1;
      qs.push({
        q: "Which word completes this headline?",
        quote: u.title.replace(re, "_____"),
        options: options,
        answer: options.indexOf(pick.word),
        why: "The headline reads: “" + u.title + "”",
        link: u.it.link, source: u.it.source || "", cat: u.it.cat || ""
      });
    }
    return qs;
  }

  /* weekly topics: one debate motion + up to three from the week's headlines */
  function buildTopics(items, motions, weekKey, weekNo, labels) {
    var topics = [];
    if (motions && motions.length) topics.push({ id: "motion-" + weekKey, kind: "motion", label: "Debate motion", title: motions[((weekNo % motions.length) + motions.length) % motions.length] });
    var want = ["courts", "parliament", "policy", "elections", "economy", "world"], used = {};
    for (var i = 0; i < want.length && topics.length < 4; i++) {
      for (var j = 0; j < items.length; j++) {
        var it = items[j];
        if (it.cat !== want[i]) continue;
        var t = cleanTitle(it.title);
        if (t.length < 35 || t.length > 150 || used[t]) continue;
        used[t] = 1;
        topics.push({ id: "news-" + weekKey + "-" + it.cat, kind: "news", label: "In the news · " + ((labels && labels[it.cat]) || it.cat), title: t, link: it.link, source: it.source || "" });
        break;
      }
    }
    topics.push({ id: "open", kind: "open", label: "Anything goes", title: "Open floor: any issue in policy, politics or law" });
    return topics;
  }

  /* India time helpers (quiz changes at midnight IST, topics every Monday IST) */
  function istNow(d) { d = d || new Date(); return new Date(d.getTime() + (330 + d.getTimezoneOffset()) * 60000); }
  function dayKey(d) { var t = istNow(d); return t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0"); }
  function weekInfo(d) {
    var t = istNow(d); var day = (t.getDay() + 6) % 7;            // Monday = 0
    var mon = new Date(t.getFullYear(), t.getMonth(), t.getDate() - day);
    var sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6);
    var fmt = function (x) { return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); };
    var key = fmt(mon);
    var no = Math.round((mon - new Date(2024, 0, 1)) / (7 * 864e5));
    return { key: key, no: no, start: key, end: fmt(sun), startDate: mon, endDate: sun };
  }

  var api = { buildQuiz: buildQuiz, buildTopics: buildTopics, dayKey: dayKey, weekInfo: weekInfo, cleanTitle: cleanTitle };
  root.PolytricsNewsQuiz = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

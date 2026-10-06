// Runs every 3 hours from .github/workflows/update-feeds.yml (Node 20+, no dependencies).
// 1. Refreshes data/feeds.json from the feeds listed in assets/js/config.js
// 2. Writes a new daily news quiz to data/quiz.json (once per day, India time)
// 3. Writes the weekly discussion topics to data/topics.json (every Monday, India time)
import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const ctx = { window: {}, console };
vm.createContext(ctx);
for (const f of ["assets/js/config.js", "assets/js/content.js", "assets/js/newsquiz.js"]) {
  vm.runInContext(await readFile(new URL(f, root), "utf8"), ctx, { filename: f });
}
const CFG = ctx.window.POLYTRICS_CONFIG, CONTENT = ctx.window.POLYTRICS_CONTENT, NQ = ctx.window.PolytricsNewsQuiz;

const decode = (s = "") => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "")
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).trim();
const tag = (b, name) => { const m = b.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i")); return m ? decode(m[1]) : ""; };

async function readFeed(feed) {
  const res = await fetch(feed.url, { headers: { "User-Agent": "PolytricsFeedBot/1.0 (+student club site)" }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`${res.status} ${feed.url}`);
  const xml = await res.text();
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) || xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];
  return blocks.slice(0, 30).map((b) => {
    let link = tag(b, "link");
    if (!link) { const m = b.match(/<link[^>]*href="([^"]+)"/i); link = m ? m[1] : ""; }
    const d = new Date(tag(b, "pubDate") || tag(b, "updated") || tag(b, "published") || tag(b, "dc:date"));
    return { title: tag(b, "title"), link, date: isNaN(d) ? null : d.toISOString(), source: tag(b, "source") || feed.name };
  }).filter((i) => i.title && i.link);
}

const readJSON = async (f) => { try { return JSON.parse(await readFile(new URL(f, root), "utf8")); } catch { return null; } };

// ---- 1. feeds: add fresh stories to a rolling 7-day archive ----
const prev = (await readJSON("data/feeds.json")) || { sections: {} };
const WEEK = 7 * 864e5, nowMs = Date.now();
const out = { updated: new Date().toISOString(), sections: {} };
const keyOf = (t) => t.toLowerCase().replace(/ - [^-]{2,60}$/, "").replace(/[^a-z0-9]/g, "").slice(0, 60);
for (const [section, list] of Object.entries(CFG.feeds)) {
  const results = await Promise.allSettled(list.map(readFeed));
  results.forEach((r, i) => { if (r.status === "rejected") console.warn("skip", section, list[i].name, String(r.reason)); });
  const fresh = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .map((i) => ({ ...i, date: i.date || out.updated }));                      // undated -> first seen now
  const merged = [...fresh, ...((prev.sections || {})[section] || [])];
  const seen = new Set();
  out.sections[section] = merged
    .filter((i) => i.date && nowMs - new Date(i.date) < WEEK && new Date(i.date) <= nowMs + 36e5)
    .filter((i) => { const k = keyOf(i.title); if (seen.has(k)) return false; seen.add(k); return true; })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 80);
  const day = out.sections[section].filter((i) => nowMs - new Date(i.date) < 864e5).length;
  console.log(section, out.sections[section].length, "in archive,", day, "from the last 24h");
}
const total = Object.values(out.sections).reduce((n, s) => n + s.length, 0);
if (total === 0) { console.error("No items fetched; keeping previous files"); process.exit(0); }
await writeFile(new URL("data/feeds.json", root), JSON.stringify(out, null, 1));

// all items, newest first, tagged with category
const labels = Object.fromEntries((CFG.newsCategories || []).map((c) => [c.key, c.label]));
const all = Object.entries(out.sections).flatMap(([cat, items]) => items.map((i) => ({ ...i, cat })))
  .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
const recent = all.filter((i) => !i.date || Date.now() - new Date(i.date) < 2 * 864e5);

// ---- 2. daily quiz ----
const today = NQ.dayKey();
const oldQuiz = await readJSON("data/quiz.json");
if (!oldQuiz || oldQuiz.date !== today || !(oldQuiz.questions || []).length) {
  const questions = NQ.buildQuiz(recent.length >= 15 ? recent : all, today, 5);
  if (questions.length >= 3) {
    await writeFile(new URL("data/quiz.json", root), JSON.stringify({ date: today, questions }, null, 1));
    console.log("quiz", today, questions.length, "questions");
  }
}

// ---- 3. weekly topics ----
const wk = NQ.weekInfo();
const oldTopics = await readJSON("data/topics.json");
if (!oldTopics || oldTopics.week !== wk.key) {
  const topics = NQ.buildTopics(recent.length ? recent : all, CONTENT.motions, wk.key, wk.no, labels);
  await writeFile(new URL("data/topics.json", root), JSON.stringify({ week: wk.key, start: wk.start, end: wk.end, topics }, null, 1));
  console.log("topics", wk.key, topics.length);
}

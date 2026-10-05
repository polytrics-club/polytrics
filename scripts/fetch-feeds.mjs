// Refreshes data/feeds.json from the feeds listed in assets/js/config.js.
// Run by .github/workflows/update-feeds.yml every 3 hours (Node 20+, no dependencies).
import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const cfgSrc = await readFile(new URL("assets/js/config.js", root), "utf8");
const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(cfgSrc, ctx);
const feeds = ctx.window.POLYTRICS_CONFIG.feeds;

const decode = (s = "") => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/<[^>]+>/g, "")
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
  .trim();
const tag = (block, name) => { const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i")); return m ? decode(m[1]) : ""; };

async function readFeed(feed) {
  const res = await fetch(feed.url, { headers: { "User-Agent": "PolytricsFeedBot/1.0 (+student club site)" }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`${res.status} ${feed.url}`);
  const xml = await res.text();
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) || xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];
  return blocks.slice(0, 25).map((b) => {
    let link = tag(b, "link");
    if (!link) { const m = b.match(/<link[^>]*href="([^"]+)"/i); link = m ? m[1] : ""; }
    const date = tag(b, "pubDate") || tag(b, "updated") || tag(b, "published") || tag(b, "dc:date");
    const d = new Date(date);
    return { title: tag(b, "title"), link, date: isNaN(d) ? null : d.toISOString(), source: tag(b, "source") || feed.name, global: !!feed.global };
  }).filter((i) => i.title && i.link);
}

const out = { updated: new Date().toISOString(), sections: {} };
for (const [section, list] of Object.entries(feeds)) {
  const results = await Promise.allSettled(list.map(readFeed));
  results.forEach((r, i) => { if (r.status === "rejected") console.warn("skip", list[i].name, String(r.reason)); });
  const seen = new Set();
  out.sections[section] = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .filter((i) => { const k = i.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60); if (seen.has(k)) return false; seen.add(k); return true; })
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 40);
  console.log(section, out.sections[section].length, "items");
}
const total = Object.values(out.sections).reduce((n, s) => n + s.length, 0);
if (total === 0) { console.error("No items fetched; keeping the previous feeds.json"); process.exit(0); }
await writeFile(new URL("data/feeds.json", root), JSON.stringify(out, null, 1));

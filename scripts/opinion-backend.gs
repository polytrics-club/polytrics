/**
 * POLYTRICS — Opinion Wall backend (Google Apps Script)
 * ------------------------------------------------------
 * Stores posts and replies in this Google Sheet and serves them to the website.
 * Setup (once):
 *   1. Create a new Google Sheet named "Polytrics Opinion Wall".
 *   2. Extensions > Apps Script. Delete what's there, paste this whole file, click Save.
 *   3. In the toolbar choose the function "setup" and click Run. Allow the permissions.
 *   4. Deploy > New deployment > type "Web app".
 *      Execute as: Me.  Who has access: Anyone.  Click Deploy and copy the Web app URL.
 *   5. Paste that URL into opinion.api in assets/js/config.js on GitHub.
 *
 * Moderating: open the sheet and type anything (e.g. "hide") in the "hidden" column
 * of a post or reply. It disappears from the website within a minute.
 * If you edit this script later: Deploy > Manage deployments > Edit > Version: New version > Deploy.
 */

var DAYS = 7;                      // how long posts stay on the wall
var MAX_PER_10_MIN = 40;           // site-wide flood limit
var LIMITS = { name: 40, title: 120, topic: 200, text: 2000, reply: 600 };
var BLOCKED = [                    // posts containing these words are refused (add more as needed)
  "fuck", "fucking", "motherfucker", "shit", "bitch", "bastard", "asshole", "cunt", "dick", "slut", "whore", "retard",
  "chutiya", "chutiye", "madarchod", "behenchod", "bhenchod", "bhosdike", "bhosdi", "gandu", "randi", "harami", "lodu", "lavde", "mc", "bc"
];

function setup() {
  sheet_("Posts", ["id", "timestamp", "topicId", "topic", "name", "title", "text", "hidden"]);
  sheet_("Replies", ["id", "postId", "timestamp", "name", "text", "hidden"]);
}

function doGet() {
  var cache = CacheService.getScriptCache();
  var hit = cache.get("list");
  if (hit) return out_(hit);
  var body = JSON.stringify(list_());
  try { cache.put("list", body, 30); } catch (e) {}
  return out_(body);
}

function doPost(e) {
  try {
    var b = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (b.website) return json_({ ok: true });                 // honeypot: bots fill hidden fields
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      if (!rateOk_()) return json_({ ok: false, error: "The wall is busy right now. Please try again in a few minutes." });
      var res = b.type === "reply" ? addReply_(b) : addPost_(b);
      CacheService.getScriptCache().remove("list");
      return json_(res);
    } finally { lock.releaseLock(); }
  } catch (err) {
    return json_({ ok: false, error: "Something went wrong. Please try again." });
  }
}

/* ---------- reading ---------- */
function list_() {
  var cutoff = Date.now() - DAYS * 864e5;
  var posts = rows_("Posts").filter(function (r) { return !r.hidden && time_(r.timestamp) > cutoff; })
    .map(function (r) { return { id: String(r.id), date: iso_(r.timestamp), topicId: String(r.topicId || ""), topic: String(r.topic || ""), name: String(r.name), title: String(r.title || ""), text: String(r.text), replies: [] }; });
  var byId = {};
  posts.forEach(function (p) { byId[p.id] = p; });
  rows_("Replies").forEach(function (r) {
    var p = byId[String(r.postId)];
    if (p && !r.hidden) p.replies.push({ id: String(r.id), date: iso_(r.timestamp), name: String(r.name), text: String(r.text) });
  });
  posts.sort(function (a, b) { return b.date < a.date ? -1 : 1; });
  posts.forEach(function (p) { p.replies.sort(function (a, b) { return a.date < b.date ? -1 : 1; }); });
  return { ok: true, days: DAYS, posts: posts };
}

/* ---------- writing ---------- */
function addPost_(b) {
  var name = clean_(b.name, LIMITS.name), title = clean_(b.title, LIMITS.title), text = clean_(b.text, LIMITS.text, true);
  var topic = clean_(b.topic, LIMITS.topic), topicId = clean_(b.topicId, 80);
  if (name.length < 2) return { ok: false, error: "Please add your name." };
  if (text.length < 40) return { ok: false, error: "Your take is a bit short. Write at least a couple of sentences." };
  if (bad_(name + " " + title + " " + text)) return { ok: false, error: "Please keep it civil. Your post contains words we don't allow." };
  var id = Utilities.getUuid().slice(0, 8), now = new Date();
  sheet_("Posts").appendRow([id, now, safe_(topicId), safe_(topic), safe_(name), safe_(title), safe_(text), ""]);
  return { ok: true, post: { id: id, date: now.toISOString(), topicId: topicId, topic: topic, name: name, title: title, text: text, replies: [] } };
}

function addReply_(b) {
  var name = clean_(b.name, LIMITS.name), text = clean_(b.text, LIMITS.reply, true), postId = clean_(b.postId, 20);
  if (name.length < 2) return { ok: false, error: "Please add your name." };
  if (text.length < 5) return { ok: false, error: "Your reply is empty." };
  if (bad_(name + " " + text)) return { ok: false, error: "Please keep it civil. Your reply contains words we don't allow." };
  var cutoff = Date.now() - DAYS * 864e5;
  var post = rows_("Posts").filter(function (r) { return String(r.id) === postId && !r.hidden && time_(r.timestamp) > cutoff; })[0];
  if (!post) return { ok: false, error: "That post has left the wall." };
  var id = Utilities.getUuid().slice(0, 8), now = new Date();
  sheet_("Replies").appendRow([id, postId, now, safe_(name), safe_(text), ""]);
  return { ok: true, reply: { id: id, postId: postId, date: now.toISOString(), name: name, text: text } };
}

/* ---------- helpers ---------- */
function sheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); if (headers) { sh.appendRow(headers); sh.setFrozenRows(1); } }
  return sh;
}
function rows_(name) {
  var v = sheet_(name).getDataRange().getValues(), head = v.shift() || [];
  return v.map(function (r) { var o = {}; head.forEach(function (h, i) { o[h] = r[i]; }); return o; });
}
function clean_(s, max, multiline) {
  s = String(s == null ? "" : s);
  s = multiline ? s.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n") : s.replace(/\s+/g, " ");
  return s.trim().slice(0, max);
}
function safe_(s) { return /^[=+\-@]/.test(s) ? "'" + s : s; }   // stop spreadsheet formulas
function bad_(s) {
  var t = " " + s.toLowerCase().replace(/[^a-z0-9]+/g, " ") + " ";
  return BLOCKED.some(function (w) { return t.indexOf(" " + w + " ") > -1; });
}
function rateOk_() {
  var c = CacheService.getScriptCache(), n = Number(c.get("rate") || 0);
  if (n >= MAX_PER_10_MIN) return false;
  c.put("rate", String(n + 1), 600);
  return true;
}
function time_(v) { var d = v instanceof Date ? v : new Date(v); return isNaN(d) ? 0 : d.getTime(); }
function iso_(v) { var t = time_(v); return t ? new Date(t).toISOString() : ""; }
function out_(s) { return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.JSON); }
function json_(o) { return out_(JSON.stringify(o)); }

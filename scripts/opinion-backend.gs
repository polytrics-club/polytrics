/**
 * POLYTRICS — Opinion Wall + Journal backend (Google Apps Script), version 2
 * Stores posts, replies and Journal articles in this Google Sheet.
 * NOTHING appears on the website until an editor ticks its "approved" box.
 *
 * Moderating: open the sheet, find the row, tick the box in the "approved" column.
 *   - Opinion posts stay up for 7 days from the moment they are approved.
 *   - Journal articles stay up permanently.
 *   - To take something down later, type anything (e.g. "hide") in its "hidden" column.
 *   - You can fix typos in a post or article directly in the sheet before approving it.
 * If you edit this script: Deploy > Manage deployments > pencil > Version: New version > Deploy.
 */

var DAYS = 7;                      // how long approved opinion posts stay on the wall
var MAX_PER_10_MIN = 40;           // site-wide flood limit
var NOTIFY = true;                 // email the editors when something new arrives
var NOTIFY_EMAIL = "";             // leave empty to use your own Google account, or "a@x.com,b@y.com"
var LIMITS = { name: 40, title: 140, topic: 200, text: 2000, reply: 600, dek: 240, body: 15000, category: 40, email: 120 };
var CATEGORIES = ["Policy", "Politics", "Law", "Economy", "World", "Explainer"];
var BLOCKED = [                    // submissions containing these words are refused (add more as needed)
  "fuck", "fucking", "motherfucker", "shit", "bitch", "bastard", "asshole", "cunt", "dick", "slut", "whore", "retard",
  "chutiya", "chutiye", "madarchod", "behenchod", "bhenchod", "bhosdike", "bhosdi", "gandu", "randi", "harami", "lodu", "lavde", "mc", "bc"
];
var HEAD = {
  Posts:   ["id", "timestamp", "topicId", "topic", "name", "title", "text", "hidden", "approved", "approvedAt"],
  Replies: ["id", "postId", "timestamp", "name", "text", "hidden", "approved", "approvedAt"],
  Journal: ["id", "timestamp", "name", "email", "category", "title", "dek", "body", "hidden", "approved", "approvedAt"]
};

/* Run once (and again after pasting a new version): creates/updates the tabs and asks for permissions. */
function setup() {
  Object.keys(HEAD).forEach(function (n) {
    var sh = sheet_(n);
    ensureHeaders_(sh, HEAD[n]);
    var col = col_(sh, "approved"), last = sh.getLastRow();
    if (last > 1) sh.getRange(2, col, last - 1, 1).insertCheckboxes();
  });
  if (NOTIFY) MailApp.getRemainingDailyQuota();   // makes Google ask for the "send email" permission now
  CacheService.getScriptCache().removeAll(["list", "journal"]);
}

/* ---------- website reads ---------- */
function doGet(e) {
  var type = (e && e.parameter && e.parameter.type) === "journal" ? "journal" : "list";
  var cache = CacheService.getScriptCache(), hit = cache.get(type);
  if (hit) return out_(hit);
  var body = JSON.stringify(type === "journal" ? journal_() : wall_());
  try { cache.put(type, body, 60); } catch (err) {}
  return out_(body);
}

function wall_() {
  var cutoff = Date.now() - DAYS * 864e5;
  var posts = rows_("Posts").filter(function (r) { return live_(r) && start_(r) > cutoff; }).map(function (r) {
    return { id: String(r.id), date: iso_(start_(r)), topicId: String(r.topicId || ""), topic: String(r.topic || ""), name: String(r.name), title: String(r.title || ""), text: String(r.text), replies: [] };
  });
  var byId = {};
  posts.forEach(function (p) { byId[p.id] = p; });
  rows_("Replies").forEach(function (r) {
    var p = byId[String(r.postId)];
    if (p && live_(r)) p.replies.push({ id: String(r.id), date: iso_(start_(r)), name: String(r.name), text: String(r.text) });
  });
  posts.sort(function (a, b) { return b.date < a.date ? -1 : 1; });
  posts.forEach(function (p) { p.replies.sort(function (a, b) { return a.date < b.date ? -1 : 1; }); });
  return { ok: true, days: DAYS, posts: posts };
}

function journal_() {
  var articles = rows_("Journal").filter(live_).map(function (r) {   // email is never sent to the website
    return { id: String(r.id), date: iso_(start_(r)), name: String(r.name), category: String(r.category || "Policy"), title: String(r.title), dek: String(r.dek || ""), body: String(r.body) };
  });
  articles.sort(function (a, b) { return b.date < a.date ? -1 : 1; });
  return { ok: true, articles: articles };
}

/* ---------- website writes ---------- */
function doPost(e) {
  try {
    var b = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (b.website) return json_({ ok: true, pending: true });   // honeypot: bots fill hidden fields
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      if (!rateOk_()) return json_({ ok: false, error: "We're getting a lot of submissions right now. Please try again in a few minutes." });
      var res = b.type === "reply" ? addReply_(b) : b.type === "article" ? addArticle_(b) : addPost_(b);
      return json_(res);
    } finally { lock.releaseLock(); }
  } catch (err) {
    return json_({ ok: false, error: "Something went wrong. Please try again." });
  }
}

function addPost_(b) {
  var name = clean_(b.name, LIMITS.name), title = clean_(b.title, LIMITS.title), text = clean_(b.text, LIMITS.text, true);
  var topic = clean_(b.topic, LIMITS.topic), topicId = clean_(b.topicId, 80);
  if (name.length < 2) return { ok: false, error: "Please add your name." };
  if (text.length < 40) return { ok: false, error: "Your take is a bit short. Write at least a couple of sentences." };
  if (bad_(name + " " + title + " " + text)) return { ok: false, error: "Please keep it civil. Your post contains words we don't allow." };
  var id = Utilities.getUuid().slice(0, 8), now = new Date();
  append_("Posts", [id, now, topicId, topic, name, title, text, "", false, ""]);
  notify_("Opinion Wall post", name + (title ? ": " + title : "") + "\n\n" + text);
  return { ok: true, pending: true, post: { id: id, date: now.toISOString(), topicId: topicId, topic: topic, name: name, title: title, text: text, replies: [] } };
}

function addReply_(b) {
  var name = clean_(b.name, LIMITS.name), text = clean_(b.text, LIMITS.reply, true), postId = clean_(b.postId, 20);
  if (name.length < 2) return { ok: false, error: "Please add your name." };
  if (text.length < 5) return { ok: false, error: "Your reply is empty." };
  if (bad_(name + " " + text)) return { ok: false, error: "Please keep it civil. Your reply contains words we don't allow." };
  var cutoff = Date.now() - DAYS * 864e5;
  var post = rows_("Posts").filter(function (r) { return String(r.id) === postId && live_(r) && start_(r) > cutoff; })[0];
  if (!post) return { ok: false, error: "That post has left the wall." };
  var id = Utilities.getUuid().slice(0, 8), now = new Date();
  append_("Replies", [id, postId, now, name, text, "", false, ""]);
  notify_("reply", name + " replied to \"" + (post.title || String(post.text).slice(0, 60)) + "\"\n\n" + text);
  return { ok: true, pending: true, reply: { id: id, postId: postId, date: now.toISOString(), name: name, text: text } };
}

function addArticle_(b) {
  var name = clean_(b.name, LIMITS.name), email = clean_(b.email, LIMITS.email), title = clean_(b.title, LIMITS.title);
  var dek = clean_(b.dek, LIMITS.dek), body = clean_(b.body, LIMITS.body, true), category = clean_(b.category, LIMITS.category);
  if (CATEGORIES.indexOf(category) < 0) category = "Policy";
  if (name.length < 2) return { ok: false, error: "Please add your name." };
  if (title.length < 8) return { ok: false, error: "Please add a headline for your article." };
  if (body.split(/\s+/).length < 250) return { ok: false, error: "Journal articles need at least 250 words. For shorter pieces, use the Opinion Wall." };
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "That email address doesn't look right." };
  if (bad_(name + " " + title + " " + dek + " " + body)) return { ok: false, error: "Please keep it civil. Your article contains words we don't allow." };
  var id = Utilities.getUuid().slice(0, 8);
  append_("Journal", [id, new Date(), name, email, category, title, dek, body, "", false, ""]);
  notify_("Journal article", name + (email ? " (" + email + ")" : "") + "\n" + category + ": " + title + "\n\n" + (dek ? dek + "\n\n" : "") + body.slice(0, 1500) + (body.length > 1500 ? "…" : ""));
  return { ok: true, pending: true };
}

/* ---------- approval timestamp: runs by itself when an editor ticks a box ---------- */
function onEdit(e) {
  try {
    var sh = e.range.getSheet();
    if (!HEAD[sh.getName()]) return;
    var ap = col_(sh, "approved"), at = col_(sh, "approvedAt");
    var c1 = e.range.getColumn(), c2 = c1 + e.range.getNumColumns() - 1;
    if (ap >= c1 && ap <= c2) {
      for (var i = 0; i < e.range.getNumRows(); i++) {
        var row = e.range.getRow() + i;
        if (row < 2) continue;
        var v = sh.getRange(row, ap).getValue(), stamp = sh.getRange(row, at);
        if (v === true && !stamp.getValue()) stamp.setValue(new Date());
      }
    }
    CacheService.getScriptCache().removeAll(["list", "journal"]);
  } catch (err) {}
}

/* ---------- helpers ---------- */
function sheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName(name);
  return sh || ss.insertSheet(name);
}
function ensureHeaders_(sh, headers) {
  if (sh.getLastRow() === 0) { sh.appendRow(headers); }
  else {
    var have = sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getValues()[0];
    headers.forEach(function (h) { if (have.indexOf(h) < 0) { have.push(h); sh.getRange(1, have.length).setValue(h); } });
  }
  sh.setFrozenRows(1);
}
function col_(sh, name) { return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].indexOf(name) + 1; }
function append_(name, values) {
  var sh = sheet_(name);
  ensureHeaders_(sh, HEAD[name]);
  var head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0], row = [];
  HEAD[name].forEach(function (h, i) { var v = values[i]; row[head.indexOf(h)] = typeof v === "string" ? safe_(v) : v; });
  for (var i = 0; i < head.length; i++) if (row[i] === undefined) row[i] = "";
  sh.appendRow(row);
  sh.getRange(sh.getLastRow(), head.indexOf("approved") + 1).insertCheckboxes();
}
function rows_(name) {
  var sh = sheet_(name);
  if (sh.getLastRow() < 2) return [];
  var v = sh.getDataRange().getValues(), head = v.shift();
  return v.map(function (r) { var o = {}; head.forEach(function (h, i) { o[h] = r[i]; }); return o; });
}
function live_(r) { return !r.hidden && (r.approved === true || /^(y|yes|true|ok)$/i.test(String(r.approved).trim())); }
function start_(r) { return time_(r.approvedAt) || time_(r.timestamp); }
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
function notify_(what, text) {
  if (!NOTIFY) return;
  try {
    var to = NOTIFY_EMAIL || Session.getEffectiveUser().getEmail();
    MailApp.sendEmail(to, "Polytrics: new " + what + " waiting for approval",
      text + "\n\n— To publish it, tick its \"approved\" box in the sheet:\n" + SpreadsheetApp.getActiveSpreadsheet().getUrl());
  } catch (err) {}
}
function time_(v) { if (!v) return 0; var d = v instanceof Date ? v : new Date(v); return isNaN(d) ? 0 : d.getTime(); }
function iso_(t) { return t ? new Date(t).toISOString() : ""; }
function out_(s) { return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.JSON); }
function json_(o) { return out_(JSON.stringify(o)); }

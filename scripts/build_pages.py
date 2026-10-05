"""Generates the HTML pages from one shared template.
Edit page bodies here (or directly in the .html files after generation)."""
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'

FAVICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E"
           "%3Crect width='64' height='64' rx='14' fill='%23B62017'/%3E"
           "%3Cpath d='M31 10A22 22 0 0 0 31 54Z' fill='white'/%3E%3Cpath d='M33 54A22 22 0 0 0 33 10Z' fill='white'/%3E"
           "%3Crect x='21' y='34' width='10' height='22' fill='%23B62017'/%3E%3Crect x='33' y='8' width='10' height='22' fill='%23B62017'/%3E%3C/svg%3E")

HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#B62017">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<link rel="icon" href="{favicon}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cardo:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="assets/css/style.css">
<script>try{{var t=localStorage.getItem("pt-theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}}catch(e){{}}</script>
</head>
<body data-page="{page}">
"""

FOOT = """
<script src="assets/js/config.js"></script>
<script src="assets/js/content.js"></script>
{extra}<script src="assets/js/site.js"></script>
<script src="assets/js/feeds.js"></script>
<script src="assets/js/pages.js"></script>
</body>
</html>
"""


def page_hero(eyebrow, h1_lines, lede):
    lines = "".join(f'<span class="line"><span style="--i:{i}">{l}</span></span>' for i, l in enumerate(h1_lines))
    return f"""<section class="hero hero--page">
  <div class="ghost" data-ghost></div>
  <div class="wrap">
    <span class="eyebrow">{eyebrow}</span>
    <h1 style="margin-top:16px">{lines}</h1>
    <p class="lede">{lede}</p>
  </div>
</section>"""


def feed_block(title, eyebrow, lede, chips=""):
    return f"""<div class="section-head" data-reveal>
      <div><span class="eyebrow">{eyebrow}</span><h2>{title}</h2></div>
      <p class="lede">{lede}</p>
    </div>
    <div class="feed-toolbar">
      <div class="chips">{chips}</div>
      <div class="feed-status" id="feed-status"><span class="live off"></span>Loading headlines…</div>
    </div>
    <div id="feed"></div>"""


CTA = f"""<section class="cta-band">
  <div class="ghost" data-ghost></div>
  <div class="wrap">
    <h2 data-reveal="left">Have an argument worth making?</h2>
    <a class="btn" href="about.html#join" data-reveal="right">Join Polytrics {ARROW}</a>
  </div>
</section>"""

PAGES = {}

PAGES["index"] = dict(
    title="Polytrics", desc="Polytrics, the Policy, Politics & Law Club. Live headlines, a daily constitutional fact, landmark cases and events.",
    body=f"""<main>
<section class="hero hero--home">
  <div class="ghost" data-ghost></div>
  <div class="wrap" style="width:100%">
    <span class="eyebrow">The Policy, Politics &amp; Law Club</span>
    <h1 style="margin-top:20px">
      <span class="line"><span style="--i:0">Policy<span class="dot">.</span></span></span>
      <span class="line"><span style="--i:1">Politics<span class="dot">.</span></span></span>
      <span class="line"><span style="--i:2"><em>Law</em><span class="dot">.</span></span></span>
    </h1>
    <p class="lede">We read the bills, follow the courts and argue about what it all means. Every day this site brings you fresh headlines, a fact from the Constitution and a case worth knowing.</p>
    <div class="hero-cta">
      <a class="btn btn--light" href="#brief">Today's brief {ARROW}</a>
      <a class="btn btn--ghost" href="about.html#join">Join the club</a>
    </div>
  </div>
  <a class="mouse" href="#brief" aria-label="Scroll to today's brief"><span></span></a>
</section>

<div class="ticker" aria-label="Latest headlines">
  <div class="wrap"><span class="label">Latest</span><div class="track"><div class="run" id="ticker-run"></div></div></div>
</div>

<section class="section" id="brief">
  <div class="wrap">
    <div class="section-head" data-reveal>
      <div><span class="eyebrow">Updates daily</span><h2>Today's brief</h2></div>
      <p class="lede">A new fact and a new Article of the Constitution every day. Copy one and start an argument.</p>
    </div>
    <div class="split">
      <div class="docket" id="fact" data-reveal="left"></div>
      <div class="article-card" id="article" data-reveal="right"></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head" data-reveal>
      <div><span class="eyebrow">Three desks</span><h2>Where to start</h2></div>
      <p class="lede">Each desk has a live news feed and material written by our members.</p>
    </div>
    <div class="grid grid-3">
      <a class="pillar" href="policy.html" data-reveal style="--d:0"><span class="num">i.</span><span class="tag">Policy Pulse</span><h3>Policy</h3><p>Bills in Parliament, government schemes and short explainers on how laws are made.</p><span class="link-arrow">Open desk {ARROW}</span></a>
      <a class="pillar" href="politics.html" data-reveal style="--d:1"><span class="num">ii.</span><span class="tag">Politics Desk</span><h3>Politics</h3><p>Elections, Parliament and the world, sorted into India and global coverage.</p><span class="link-arrow">Open desk {ARROW}</span></a>
      <a class="pillar" href="law.html" data-reveal style="--d:2"><span class="num">iii.</span><span class="tag">Law Watch</span><h3>Law</h3><p>Court news, landmark judgments and the Article of the day.</p><span class="link-arrow">Open desk {ARROW}</span></a>
    </div>
  </div>
</section>

<section class="section section--tint">
  <div class="wrap split">
    <div>
      <div class="section-head" data-reveal style="margin-bottom:24px"><div><span class="eyebrow">Case spotlight</span><h2>On the record</h2></div></div>
      <div id="case-spot" class="case-list"></div>
      <a class="link-arrow" href="law.html#cases-sec" style="margin-top:22px" data-reveal>All landmark cases {ARROW}</a>
    </div>
    <div class="quiz" id="quiz" data-reveal="scale"></div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head" data-reveal>
      <div><span class="eyebrow">On campus</span><h2>Next event</h2></div>
      <a class="link-arrow" href="events.html">All events {ARROW}</a>
    </div>
    <div id="next-event" data-reveal></div>
  </div>
</section>
</main>
{CTA}""")

PAGES["policy"] = dict(
    title="Policy Pulse · Polytrics", desc="Live policy headlines and short explainers on how Indian law and policy are made.",
    body=page_hero("Desk i · Policy Pulse", ["Policy Pulse"], "Bills, schemes and decisions from Parliament and the ministries, collected automatically and refreshed through the day.") + f"""
<main>
<section class="section"><div class="wrap">
  {feed_block("What's moving", "Live feed", "Headlines from the Press Information Bureau and major outlets. Each one opens at the original source.")}
</div></section>
<section class="section section--tint" id="explainers-sec"><div class="wrap">
  <div class="section-head" data-reveal>
    <div><span class="eyebrow">Explainers</span><h2>How it works</h2></div>
    <p class="lede">Short guides to the machinery of government. Open one before your next debate.</p>
  </div>
  <div id="explainers"></div>
</div></section>
</main>
{CTA}""")

PAGES["politics"] = dict(
    title="Politics Desk · Polytrics", desc="Live political headlines from India and the world.",
    body=page_hero("Desk ii · Politics Desk", ["Politics Desk"], "Elections, Parliament and geopolitics. Switch between India and the world, and every link takes you to the original reporting.") + f"""
<main>
<section class="section"><div class="wrap">
  {feed_block("The latest", "Live feed", "Updated through the day from national and international outlets.",
    '<button class="chip" type="button" data-scope="all" aria-pressed="true">All</button><button class="chip" type="button" data-scope="india" aria-pressed="false">India</button><button class="chip" type="button" data-scope="global" aria-pressed="false">World</button>')}
</div></section>
<section class="section section--tint"><div class="wrap">
  <div class="section-head" data-reveal><div><span class="eyebrow">Daily</span><h2>Worth knowing</h2></div></div>
  <div class="docket" id="fact" data-reveal></div>
</div></section>
</main>
{CTA}""")

PAGES["law"] = dict(
    title="Law Watch · Polytrics", desc="Court news, landmark judgments of the Supreme Court of India and the Article of the day.",
    body=page_hero("Desk iii · Law Watch", ["Law Watch"], "What the courts decided today, and the judgments that shaped the Republic.") + f"""
<main>
<section class="section"><div class="wrap split">
  <div style="min-width:0">{feed_block("From the courts", "Live feed", "Supreme Court and High Court reporting from legal news outlets.")}</div>
  <div class="article-card" id="article" data-reveal="right" style="position:sticky;top:90px"></div>
</div></section>
<section class="section section--tint" id="cases-sec"><div class="wrap">
  <div class="section-head" data-reveal>
    <div><span class="eyebrow">Landmark judgments</span><h2>Cases that shaped India</h2></div>
    <label class="search"><span class="sr-only">Search cases</span>{SEARCH}<input id="case-q" type="search" placeholder="Search by name, year or topic"></label>
  </div>
  <div class="chips" id="case-areas" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:22px"></div>
  <div class="case-list" id="cases"></div>
</div></section>
</main>
{CTA}""")

PAGES["events"] = dict(
    title="Events · Polytrics", desc="Mock parliaments, debates, policy labs and guest talks by Polytrics.",
    body=page_hero("On campus", ["Events"], "Mock parliaments, debates, policy labs and guest talks. Come for one; most people stay.") + f"""
<main>
<section class="section"><div class="wrap">
  <div id="next-event" data-reveal></div>
</div></section>
<section class="section"><div class="wrap">
  <div class="section-head" data-reveal><div><span class="eyebrow">Calendar</span><h2>Coming up</h2></div></div>
  <div id="upcoming"></div>
</div></section>
<section class="section section--tint"><div class="wrap">
  <div class="section-head" data-reveal><div><span class="eyebrow">Archive</span><h2>Past events</h2></div></div>
  <div id="past"></div>
</div></section>
</main>
{CTA}""")

PAGES["journal"] = dict(
    title="The Journal · Polytrics", desc="Essays, policy briefs and case notes by Polytrics members.",
    body=page_hero("Member writing", ["The <em>Journal</em>"], "Essays, policy briefs and case notes by our members. Each one is argued carefully and kept short enough to finish.") + f"""
<main>
<section class="section"><div class="wrap">
  <div class="grid grid-2" id="posts"></div>
</div></section>
<section class="section section--tint"><div class="wrap split">
  <div data-reveal="left"><span class="eyebrow">Write for us</span><h2 style="font-size:clamp(2rem,4vw,3rem);margin-top:10px">Pitch a piece</h2></div>
  <div data-reveal="right"><p class="lede" style="color:var(--fg)">Send a 100-word pitch: the argument, why it matters now, and one source. Pieces run 600 to 1,200 words and are edited by the Journal team before publishing.</p>
  <a class="btn btn--solid" href="about.html#join" style="margin-top:22px">Get in touch {ARROW}</a></div>
</div></section>
</main>
<div class="reader" id="reader" hidden role="dialog" aria-modal="true" aria-label="Article">
  <button class="icon-btn close" type="button" aria-label="Close article"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
  <article></article>
</div>
{CTA}""")

PAGES["resources"] = dict(
    title="Resources · Polytrics", desc="A curated directory of primary sources, case law, policy research and data for students of policy, politics and law.",
    extra='<script src="assets/js/resources.js"></script>\n',
    body=page_hero("Library", ["Resources"], "The sources our members use most: primary texts, case law, research and data. Bookmark this page.") + f"""
<main>
<section class="section"><div class="wrap">
  <div class="section-head" data-reveal>
    <div><span class="eyebrow">Directory</span><h2>Go to the source</h2></div>
    <label class="search"><span class="sr-only">Search resources</span>{SEARCH}<input id="res-q" type="search" placeholder="Search, e.g. judgments, data, treaties"></label>
  </div>
  <div class="grid grid-3" id="res"></div>
</div></section>
</main>
{CTA}""")

PAGES["about"] = dict(
    title="About · Polytrics", desc="Who we are, what we do and how to join Polytrics.",
    body=page_hero("Who we are", ["About <em>Polytrics</em>"], "Polytrics is a student club for people who want to understand how power is made, used and checked, and then argue about it.") + f"""
<main>
<section class="section"><div class="wrap split">
  <div data-reveal="left">
    <span class="eyebrow">Our idea</span>
    <h2 style="font-size:clamp(2rem,4.4vw,3.4rem);margin-top:10px">Two sides, one table</h2>
  </div>
  <div data-reveal="right" style="display:grid;gap:18px;font-family:var(--serif);font-size:1.2rem;line-height:1.6">
    <p>Our logo shows two faces in profile, each half of one circle. Policy, politics and law work the same way: every rule has someone arguing for it and someone arguing against it, and the outcome depends on how well both sides are heard.</p>
    <p>We run debates, mock parliaments and policy labs. We publish member writing, and we keep this site updated so that following public life takes five minutes a day, not an hour.</p>
  </div>
</div></section>

<section class="section section--tint"><div class="wrap">
  <div class="section-head" data-reveal><div><span class="eyebrow">What we do</span><h2>Four formats</h2></div></div>
  <div class="grid grid-4">
    <div class="stat" data-reveal style="--d:0"><b>i.</b><h3 style="margin-top:10px;font-size:1.4rem">Mock Parliament</h3><span>Real bills, real procedure: Question Hour, debate and division.</span></div>
    <div class="stat" data-reveal style="--d:1"><b>ii.</b><h3 style="margin-top:10px;font-size:1.4rem">Policy Labs</h3><span>Small-group sessions taking apart a budget, a scheme or a report.</span></div>
    <div class="stat" data-reveal style="--d:2"><b>iii.</b><h3 style="margin-top:10px;font-size:1.4rem">Debates &amp; Moots</h3><span>Parliamentary debate and moot-court practice on live questions.</span></div>
    <div class="stat" data-reveal style="--d:3"><b>iv.</b><h3 style="margin-top:10px;font-size:1.4rem">The Journal</h3><span>Member essays and briefs, edited and published here.</span></div>
  </div>
</div></section>

<section class="section"><div class="wrap">
  <div class="section-head" data-reveal><div><span class="eyebrow">The team</span><h2>Core committee</h2></div></div>
  <div class="grid grid-4" id="team"></div>
</div></section>

<section class="section section--tint" id="join"><div class="wrap split">
  <div data-reveal="left" style="display:grid;gap:18px;align-content:start">
    <span class="eyebrow">Join us</span>
    <h2 style="font-size:clamp(2rem,4.4vw,3.4rem)">Take a seat at the table</h2>
    <p class="lede">Open to every student. No prior experience in law or politics needed, only curiosity and a willingness to argue in good faith.</p>
    <a class="btn btn--solid" id="gform" href="#" target="_blank" rel="noopener" style="justify-self:start">Apply via Google Form {ARROW}</a>
    <div class="copy-line"><span class="form-note">Or write to</span> <code id="club-mail"></code> <button class="chip" type="button" id="copy-mail">Copy</button></div>
  </div>
  <form class="panel form" id="join-form" data-reveal="right" novalidate>
    <div class="form-row">
      <div class="field"><label for="f-name">Full name</label><input id="f-name" name="name" required autocomplete="name"></div>
      <div class="field"><label for="f-email">Email</label><input id="f-email" name="email" type="email" required autocomplete="email"></div>
    </div>
    <div class="form-row">
      <div class="field"><label for="f-prog">Programme &amp; year</label><input id="f-prog" name="programme" placeholder="e.g. MBA, 1st year"></div>
      <div class="field"><label for="f-desk">Desk</label><select id="f-desk" name="desk"><option>Policy</option><option>Politics</option><option>Law</option><option>Journal</option><option>Events</option><option>Design &amp; Social</option></select></div>
    </div>
    <div class="field"><label for="f-why">Which issue would you argue about all night?</label><textarea id="f-why" name="message" required></textarea></div>
    <button class="btn btn--solid" type="submit" style="justify-self:start">Send application {ARROW}</button>
    <p class="form-note" id="form-note" aria-live="polite"></p>
  </form>
</div></section>
</main>""")

for name, p in PAGES.items():
    html = HEAD.format(title=p["title"], desc=p["desc"], page="home" if name == "index" else name, favicon=FAVICON) + p["body"] + FOOT.format(extra=p.get("extra", ""))
    (ROOT / f"{name}.html").write_text(html, encoding="utf-8")
    print("wrote", name + ".html")

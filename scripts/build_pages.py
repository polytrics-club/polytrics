"""Generates the HTML pages from one shared template (v2, "flow" design).
Run:  python3 scripts/build_pages.py"""
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
FAVICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E"
           "%3Crect width='64' height='64' rx='32' fill='%23B62017'/%3E"
           "%3Cpath d='M31 10A22 22 0 0 0 31 54Z' fill='%23FFDF7E'/%3E%3Cpath d='M33 54A22 22 0 0 0 33 10Z' fill='%23FFDF7E'/%3E"
           "%3Crect x='21' y='34' width='10' height='22' fill='%23B62017'/%3E%3Crect x='33' y='8' width='10' height='22' fill='%23B62017'/%3E%3C/svg%3E")
FONTS = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Instrument+Serif:ital@0;1&family=Outfit:wght@300..700&display=swap"

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
<link rel="stylesheet" href="{fonts}">
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body data-page="{page}">
"""
FOOT = """
<script src="assets/js/config.js"></script>
<script src="assets/js/content.js"></script>
{extra}<script src="assets/js/site.js"></script>
<script src="assets/js/feeds.js"></script>
<script src="assets/js/newsquiz.js"></script>
<script src="assets/js/pages.js"></script>
</body>
</html>
"""

WAVES = [
    "M0,48 C240,110 480,0 720,46 C960,92 1200,8 1440,52 L1440,121 L0,121 Z",
    "M0,78 C300,8 620,118 900,64 C1150,18 1300,44 1440,30 L1440,121 L0,121 Z",
    "M0,30 C200,30 380,100 640,90 C900,80 1100,10 1440,60 L1440,121 L0,121 Z",
]
COL = {"red": "var(--red)", "cream": "var(--cream)", "butter": "var(--butter)", "ink": "var(--ink)"}


def wave(frm, to, v=0):
    bg = "transparent" if frm == "cream" else COL[frm]
    return (f'<div aria-hidden="true" style="background:{bg};position:relative;z-index:2">'
            f'<svg class="wave wave--{to}" viewBox="0 0 1440 120" preserveAspectRatio="none"><path d="{WAVES[v % 3]}"/></svg></div>')


def page_hero(kicker, title_lines, lede, right=None):
    lines = "".join(f'<span class="line"><span style="--i:{i}">{l}</span></span>' for i, l in enumerate(title_lines))
    right = right or '<div class="blob blob--sm" data-logo></div>'
    return f"""<section class="hero hero--page">
  <div class="wrap grid">
    <div>
      <span class="kicker">{kicker}</span>
      <h1 style="margin-top:18px">{lines}</h1>
      <p class="lede">{lede}</p>
    </div>
    {right}
  </div>
</section>"""


PAGES = {}

PAGES["index"] = dict(
    title="Polytrics", desc="Polytrics, the Policy, Politics & Law Club. News sorted by category, a daily constitutional fact, an opinion wall and more.",
    body=f"""<section class="hero">
  <div class="wrap grid">
    <div>
      <span class="kicker">The Policy, Politics &amp; Law Club</span>
      <h1 style="margin-top:22px">
        <span class="line"><span style="--i:0">Policy.</span></span>
        <span class="line"><span style="--i:1">Politics.</span></span>
        <span class="line"><span style="--i:2">&amp; <em>Law.</em></span></span>
      </h1>
      <p class="lede">We read the bills, follow the courts and argue about what it all means. Fresh headlines sorted by topic, a fact a day, and a wall for your opinions.</p>
      <div class="hero-cta">
        <a class="btn btn--butter" href="news.html">Read the news {ARROW}</a>
        <a class="btn btn--line" href="opinion.html">Opinion Wall</a>
      </div>
    </div>
    <div class="blob" id="hero-blob" data-logo></div>
  </div>
  <div data-wavetext="Read closely, argue fairly"></div>
</section>
{wave("red", "butter", 0)}
<main>
<section class="section s-fade-bc" id="brief">
  <div class="wrap cols-2">
    <div class="fact" id="fact" data-reveal="left"></div>
    <div class="seal" id="seal" data-reveal="scale"></div>
  </div>
</section>

<section class="section s-cream">
  <div class="wrap">
    <div class="head" data-reveal>
      <div><span class="kicker" style="color:var(--red)">Updated every few hours</span><h2 class="big">The news, <em>sorted.</em></h2></div>
      <span class="status" id="news-status"><span class="live off"></span>Loading headlines…</span>
    </div>
    <div class="pills" id="news-pills" style="margin-bottom:26px"></div>
    <div id="news-list"></div>
    <a class="textlink more" href="news.html">All the news {ARROW}</a>
  </div>
</section>
{wave("cream", "red", 1)}
<section class="section s-red" style="padding-top:clamp(40px,6vw,80px)">
  <div class="wrap cols-2" style="align-items:start">
    <div>
      <div data-reveal><span class="kicker">On the record</span><h2 class="mid" style="margin-top:14px">A case worth <em>knowing.</em></h2></div>
      <div id="case-spot" style="margin-top:20px"></div>
      <a class="textlink" href="learn.html#cases-sec" data-reveal>Every landmark case {ARROW}</a>
    </div>
    <div class="quiz" id="quiz" data-reveal="right"></div>
  </div>
</section>
{wave("red", "cream", 2)}
<section class="section s-cream">
  <div class="wrap">
    <div class="head" data-reveal>
      <div><span class="kicker" style="color:var(--red)">From the Opinion Wall</span><h2 class="big">Say it. <em>It stays a week.</em></h2></div>
      <a class="btn btn--red" href="opinion.html">See the whole wall {ARROW}</a>
    </div>
    <div class="topic-strip" id="topic-strip" data-reveal></div>
    <div class="notes" id="wall"></div>
  </div>
</section>
{wave("cream", "red", 0)}
<section class="section s-red cta">
  <div class="wrap" data-reveal="scale">
    <h2>Have a take?<br><em>Put it on the wall.</em></h2>
    <p class="lede">Write it right here on the site. It stays up for seven days, and anyone can reply.</p>
    <a class="btn btn--butter" href="opinion.html#write">Write your take {ARROW}</a>
  </div>
</section>
{wave("red", "ink", 1)}
</main>""")

PAGES["news"] = dict(
    title="News · Polytrics", desc="Live political, legal and policy headlines sorted by category: Parliament, Courts, Elections, Policy, Economy and World.",
    body=page_hero("Updated every few hours", ["The <em>News</em>"], "Headlines from Indian and international outlets, sorted into the topics we care about. Every link opens the original story.") + f"""
{wave("red", "cream", 1)}
<main>
<section class="section s-cream" style="padding-top:clamp(30px,4vw,50px)">
  <div class="wrap">
    <div class="news-bar"><div class="pills" id="news-pills"></div></div>
    <p class="status" id="news-status" style="margin-bottom:10px"><span class="live off"></span>Loading headlines…</p>
    <div id="news-list"></div>
  </div>
</section>
{wave("cream", "ink", 0)}
</main>""")

PAGES["opinion"] = dict(
    title="Opinion Wall · Polytrics", desc="Write your take on this week's topics in policy, politics and law. Posts stay up for a week and anyone can reply.",
    body=page_hero("Seven days on the wall", ["Opinion <em>Wall</em>"], "Write your take right here, reply to others, and argue in good faith. New topics every Monday, and every post stays up for seven days.") + f"""
{wave("red", "cream", 2)}
<main>
<section class="section s-cream" id="topics" style="padding-top:clamp(30px,4vw,60px)">
  <div class="wrap">
    <div class="head" data-reveal>
      <div><span class="kicker" style="color:var(--red)">New every Monday \u00B7 <span id="week-label">this week</span></span><h2 class="big">This week\u2019s <em>topics.</em></h2></div>
      <a class="btn btn--red" href="#write">Write your take {ARROW}</a>
    </div>
    <div class="topics" id="topics-list"></div>
  </div>
</section>
<section class="section s-cream" id="wall-sec" style="padding-top:0">
  <div class="wrap">
    <div class="head" data-reveal><div><span class="kicker" style="color:var(--red)">Posts disappear after 7 days</span><h2 class="big">On the <em>wall.</em></h2></div></div>
    <div class="pills" id="wall-pills" style="margin-bottom:28px"></div>
    <div class="notes" id="wall"></div>
  </div>
</section>
{wave("cream", "red", 0)}
<section class="section s-red" id="write" style="padding-top:clamp(40px,6vw,80px)">
  <div class="wrap cols-2" style="align-items:start">
    <div data-reveal="left">
      <span class="kicker">Your turn</span>
      <h2 class="big" style="margin-top:14px">Write your <em>take.</em></h2>
      <ol class="rules">
        <li><span>Make one argument, in a few clear paragraphs.</span></li>
        <li><span>Disagree with ideas, not people. Abusive posts are blocked or removed.</span></li>
        <li><span>Back up facts with a source the reader can check.</span></li>
        <li><span>Your post appears instantly and stays up for seven days.</span></li>
      </ol>
    </div>
    <form class="composer" id="post-form" data-reveal="right" novalidate>
      <div class="field"><label for="f-name">Your name</label><input id="f-name" name="name" maxlength="40" autocomplete="name" placeholder="How you want to be credited"></div>
      <div class="field"><label for="f-topic">Topic</label><select id="f-topic" name="topic"><option value="open">Open floor (any issue)</option></select></div>
      <div class="field"><label for="f-title">Headline <span class="opt">(optional)</span></label><input id="f-title" name="title" maxlength="120" placeholder="Your argument in one line"></div>
      <div class="field"><label for="f-text">Your take</label><textarea id="f-text" name="text" maxlength="2000" rows="7" placeholder="Make your case\u2026"></textarea><span class="count" id="f-count">0 / 2000</span></div>
      <input name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button class="btn" type="submit">Post to the wall {ARROW}</button>
      <p class="form-msg" id="post-msg" aria-live="polite"></p>
    </form>
  </div>
</section>
{wave("red", "ink", 1)}
</main>""")

PAGES["learn"] = dict(
    title="Learn · Polytrics", desc="Explainers, the Article of the day, a weekly quiz and the landmark cases that shaped India.",
    body=page_hero("The basics, done well", ["Learn the <em>basics</em>"], "Short explainers on how government works, one Article of the Constitution every day, a weekly quiz and the cases every student should know.") + f"""
{wave("red", "butter", 0)}
<main>
<section class="section s-fade-bc" style="padding-top:clamp(30px,4vw,60px)">
  <div class="wrap cols-2">
    <div data-reveal="left">
      <span class="kicker" style="color:var(--red)">Changes every day</span>
      <h2 class="big" style="margin-top:14px">One Article, <em>every day.</em></h2>
      <p class="lede" style="margin-top:20px">The Constitution is long. Read it one Article at a time, and come back tomorrow for the next.</p>
    </div>
    <div class="seal" id="seal" data-reveal="scale"></div>
  </div>
</section>
<section class="section s-cream" id="explainers-sec">
  <div class="wrap">
    <div class="head" data-reveal><div><span class="kicker" style="color:var(--red)">Explainers</span><h2 class="big">How it <em>works.</em></h2></div></div>
    <div id="explainers"></div>
  </div>
</section>
{wave("cream", "red", 1)}
<section class="section s-red" style="padding-top:clamp(40px,6vw,80px)">
  <div class="wrap cols-2">
    <div data-reveal="left"><span class="kicker">New every Monday</span><h2 class="big" style="margin-top:14px">Test <em>yourself.</em></h2><p class="lede" style="margin-top:20px">Five questions on the Constitution, Parliament and the courts.</p></div>
    <div class="quiz" id="quiz" data-reveal="right"></div>
  </div>
</section>
{wave("red", "cream", 2)}
<section class="section s-cream" id="cases-sec">
  <div class="wrap">
    <div class="head" data-reveal>
      <div><span class="kicker" style="color:var(--red)">Landmark judgments</span><h2 class="big">Cases that <em>shaped India.</em></h2></div>
      <label class="search"><span class="sr-only">Search cases</span>{SEARCH}<input id="case-q" type="search" placeholder="Search a name, year or topic"></label>
    </div>
    <div class="pills" id="case-areas" style="margin-bottom:20px"></div>
    <div id="cases"></div>
  </div>
</section>
{wave("cream", "ink", 0)}
</main>""")

PAGES["journal"] = dict(
    title="The Journal · Polytrics", desc="Essays, policy briefs and case notes by Polytrics members.",
    body=page_hero("Member writing", ["The <em>Journal</em>"], "Longer essays, policy briefs and case notes by our members. Each one is edited and argued carefully, and kept short enough to finish.") + f"""
{wave("red", "cream", 0)}
<main>
<section class="section s-cream" style="padding-top:clamp(30px,4vw,60px)">
  <div class="wrap"><div class="posts" id="posts"></div></div>
</section>
{wave("cream", "red", 1)}
<section class="section s-red cta">
  <div class="wrap" data-reveal="scale">
    <h2>Pitch a <em>piece.</em></h2>
    <p class="lede">Send a 100-word pitch: the argument, why it matters now, and one source. Journal pieces run 600 to 1,200 words. For something shorter, use the Opinion Wall.</p>
    <a class="btn btn--butter" href="opinion.html">Go to the Opinion Wall {ARROW}</a>
  </div>
</section>
{wave("red", "ink", 2)}
</main>
<div class="reader" id="reader" hidden role="dialog" aria-modal="true" aria-label="Article">
  <button class="close" type="button" aria-label="Close article"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
  <article></article>
</div>""")

PAGES["resources"] = dict(
    title="Resources · Polytrics", desc="A curated directory of primary sources, case law, policy research and data for students of policy, politics and law.",
    extra='<script src="assets/js/resources.js"></script>\n',
    body=page_hero("Library", ["Go to the <em>source</em>"], "The sites our members use most: primary texts, case law, research and data. Bookmark this page.") + f"""
{wave("red", "cream", 1)}
<main>
<section class="section s-cream" style="padding-top:clamp(30px,4vw,60px)">
  <div class="wrap">
    <div class="head" data-reveal>
      <div><span class="kicker" style="color:var(--red)">Directory</span><h2 class="big">Resources</h2></div>
      <label class="search"><span class="sr-only">Search resources</span>{SEARCH}<input id="res-q" type="search" placeholder="Search, e.g. judgments, data, treaties"></label>
    </div>
    <div class="cols-3" id="res" style="align-items:start"></div>
  </div>
</section>
{wave("cream", "ink", 2)}
</main>""")

PAGES["about"] = dict(
    title="About · Polytrics", desc="Who we are and what we do at Polytrics, the Policy, Politics & Law Club.",
    body=page_hero("Who we are", ["About <em>us</em>"], "Polytrics is a student club for people who want to understand how power is made, used and checked, and then argue about it in good faith.",
                   right='<div class="shape shape--arch" id="photo-1" style="width:min(100%,340px);justify-self:center"><span class="ph">Your photo here</span></div>') + f"""
{wave("red", "cream", 2)}
<main>
<section class="section s-cream">
  <div class="wrap cols-2">
    <div class="prose" data-reveal="left">
      <span class="kicker" style="color:var(--red)">Our story</span>
      <p class="big-it">Two faces, one circle.</p>
      <p>Our logo shows two people in profile, each half of the same circle. That is how we see policy, politics and law: every rule has someone arguing for it and someone arguing against it, and a good outcome depends on both being heard.</p>
      <p>We started Polytrics to make following public life easier and arguing about it more fun. We read bills, follow the courts and debate what it all means, and we try to do it with curiosity rather than certainty.</p>
    </div>
    <div class="shape shape--blob" id="photo-2" data-reveal="scale"><span class="ph">Your photo here</span></div>
  </div>
</section>
{wave("cream", "butter", 0)}
<section class="section s-butter">
  <div class="wrap">
    <div class="head" data-reveal><div><span class="kicker" style="color:var(--red)">What we do</span><h2 class="big">Ways to <em>take part.</em></h2></div></div>
    <div class="does">
      <div data-reveal style="--d:0"><h3>Mock Parliament</h3><p>Real bills and real procedure: Question Hour, debate and a division vote.</p></div>
      <div data-reveal style="--d:1"><h3>Policy Labs</h3><p>Small groups that take apart a budget, a scheme or a report, line by line.</p></div>
      <div data-reveal style="--d:2"><h3>Debates &amp; Moots</h3><p>Parliamentary debate and moot-court practice on the questions in the news.</p></div>
      <div data-reveal style="--d:3"><h3>Writing</h3><p>Longer essays in the Journal, and quick takes on the Opinion Wall.</p></div>
    </div>
  </div>
</section>
{wave("butter", "red", 1)}
<section class="section s-red" style="padding-top:clamp(40px,6vw,80px)">
  <div class="wrap cols-2">
    <div data-reveal="left" style="display:grid;gap:22px;align-content:start">
      <span class="kicker">Say hello</span>
      <h2 class="big">Get in <em>touch.</em></h2>
      <div class="copy-line"><code id="club-mail"></code><button class="pill" type="button" id="copy-mail">Copy email</button></div>
      <div class="pills" id="socials"></div>
    </div>
    <div class="shape shape--round" id="photo-3" data-reveal="scale" style="width:min(100%,380px);justify-self:center"><span class="ph">Your photo here</span></div>
  </div>
</section>
{wave("red", "ink", 2)}
</main>""")

# old pages now point to their new homes, so shared links keep working
REDIRECTS = {"policy": "news.html#policy", "politics": "news.html", "law": "learn.html", "events": "./"}
STUB = """<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Polytrics</title>
<meta http-equiv="refresh" content="0; url={to}"><link rel="canonical" href="{to}">
<script>location.replace("{to}")</script></head>
<body style="background:#B62017;color:#FFDF7E;font-family:system-ui;display:grid;place-items:center;min-height:100vh;margin:0">
<a href="{to}" style="color:inherit">This page has moved. Continue</a></body></html>
"""

for name, p in PAGES.items():
    html = HEAD.format(title=p["title"], desc=p["desc"], page="home" if name == "index" else name, favicon=FAVICON, fonts=FONTS) + p["body"] + FOOT.format(extra=p.get("extra", ""))
    (ROOT / f"{name}.html").write_text(html, encoding="utf-8")
    print("wrote", name + ".html")
for name, to in REDIRECTS.items():
    (ROOT / f"{name}.html").write_text(STUB.format(to=to), encoding="utf-8")
    print("redirect", name + ".html ->", to)

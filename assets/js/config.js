/* =========================================================
   POLYTRICS — SITE SETTINGS
   This is the only file most club members need to edit.
   ========================================================= */
window.POLYTRICS_CONFIG = {
  clubName: "Polytrics",
  tagline: "The Policy, Politics & Law Club",
  institution: "IIM Ranchi",
  email: "polytrics@iimranchi.ac.in",          // change to the club's real inbox
  socials: {
    instagram: "https://www.instagram.com/",     // paste the club's profile links
    linkedin: "https://www.linkedin.com/",
    x: ""
  },

  /* Photo shown inside the moving shape on the home page.
     Upload a photo to assets/img/ and write its path, e.g. "assets/img/hero.jpg".
     Leave empty to show the logo instead. */
  heroImage: "",

  /* ---- About page photos ----
     Upload to assets/img/ and list paths here (up to 3 look best). */
  aboutImages: ["", "", ""],

  /* ---- Opinion Wall ----
     Posts come from a Google Form and stay on the site for `days` days.
     1. Make a Google Form with questions: Name, Title, Your take (paragraph), Topic.
     2. Paste the form's share link into formURL.
     3. In the form: Responses > Link to Sheets. In that Sheet add a column
        named "Approved" and type "yes" next to each post you approve.
     4. In the Sheet: File > Share > Publish to web > (the responses sheet) > CSV.
        Paste that link into sheetCSV.
     Until sheetCSV is set, the wall shows sample posts from data/opinions.json. */
  opinion: {
    formURL: "",
    sheetCSV: "",
    days: 7,
    requireApproval: true,
    dateOrder: "DMY"     // Google Sheets in India writes dates as day/month/year
  },

  /* ---- News categories ----
     Each category pulls from its own feeds. The GitHub Action refreshes
     data/feeds.json every 3 hours; if that is empty the browser fetches live. */
  newsCategories: [
    { key: "parliament", label: "Parliament" },
    { key: "courts",     label: "Courts & Law" },
    { key: "elections",  label: "Elections" },
    { key: "policy",     label: "Policy & Schemes" },
    { key: "economy",    label: "Economy" },
    { key: "world",      label: "World" }
  ],
  feeds: {
    parliament: [
      { name: "Google News", url: "https://news.google.com/rss/search?q=Parliament+bill+%22Lok+Sabha%22+OR+%22Rajya+Sabha%22&hl=en-IN&gl=IN&ceid=IN:en" }
    ],
    courts: [
      { name: "Google News", url: "https://news.google.com/rss/search?q=%22Supreme+Court%22+India&hl=en-IN&gl=IN&ceid=IN:en" },
      { name: "Google News", url: "https://news.google.com/rss/search?q=%22High+Court%22+ruling+India&hl=en-IN&gl=IN&ceid=IN:en" }
    ],
    elections: [
      { name: "Google News", url: "https://news.google.com/rss/search?q=%22Election+Commission%22+OR+%22assembly+election%22+India&hl=en-IN&gl=IN&ceid=IN:en" }
    ],
    policy: [
      { name: "PIB", url: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3" },
      { name: "Google News", url: "https://news.google.com/rss/search?q=India+government+policy+scheme&hl=en-IN&gl=IN&ceid=IN:en" }
    ],
    economy: [
      { name: "Google News", url: "https://news.google.com/rss/search?q=RBI+OR+%22Union+Budget%22+OR+GST+India+economy&hl=en-IN&gl=IN&ceid=IN:en" }
    ],
    world: [
      { name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
      { name: "Google News", url: "https://news.google.com/rss/search?q=geopolitics+OR+diplomacy&hl=en-IN&gl=IN&ceid=IN:en" }
    ]
  },

  /* Places readers can go when live feeds are offline */
  sourceLinks: [["PIB", "https://pib.gov.in/"], ["PRS Legislative Research", "https://prsindia.org/"], ["LiveLaw", "https://www.livelaw.in/"], ["The Hindu", "https://www.thehindu.com/news/national/"], ["BBC World", "https://www.bbc.com/news/world"]]
};

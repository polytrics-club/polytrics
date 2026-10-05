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

  /* ---- Join form ----
     Option 1: paste a Google Form link -> the "Apply" button opens it.
     Option 2: create a free form at formspree.io and paste its endpoint
               (e.g. https://formspree.io/f/abcdwxyz) -> the on-page form submits there. */
  joinGoogleForm: "",
  formEndpoint: "",

  /* ---- Events from a Google Sheet (optional) ----
     Sheet columns: title | date (YYYY-MM-DD) | time | venue | type | description | link
     File > Share > Publish to web > choose the sheet > CSV > copy the link here.
     Leave empty to use data/events.json instead. */
  eventsSheetCSV: "",

  /* ---- Live news feeds ----
     The GitHub Action in .github/workflows refreshes data/feeds.json every 3 hours.
     If that file is empty, the browser fetches these feeds live through rss2json. */
  feeds: {
    policy: [
      { name: "Google News · Policy", url: "https://news.google.com/rss/search?q=India+government+policy+scheme&hl=en-IN&gl=IN&ceid=IN:en" },
      { name: "Google News · Parliament Bills", url: "https://news.google.com/rss/search?q=Parliament+bill+India&hl=en-IN&gl=IN&ceid=IN:en" },
      { name: "PIB", url: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3" }
    ],
    law: [
      { name: "Google News · Supreme Court", url: "https://news.google.com/rss/search?q=Supreme+Court+of+India&hl=en-IN&gl=IN&ceid=IN:en" },
      { name: "Google News · High Courts", url: "https://news.google.com/rss/search?q=High+Court+ruling+India&hl=en-IN&gl=IN&ceid=IN:en" },
      { name: "Google News · Legal", url: "https://news.google.com/rss/search?q=LiveLaw+OR+%22Bar+and+Bench%22&hl=en-IN&gl=IN&ceid=IN:en" }
    ],
    politics: [
      { name: "Google News · Indian Politics", url: "https://news.google.com/rss/search?q=Indian+politics&hl=en-IN&gl=IN&ceid=IN:en" },
      { name: "Google News · Elections", url: "https://news.google.com/rss/search?q=Election+Commission+of+India&hl=en-IN&gl=IN&ceid=IN:en" },
      { name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml", global: true },
      { name: "Google News · Geopolitics", url: "https://news.google.com/rss/search?q=geopolitics&hl=en-IN&gl=IN&ceid=IN:en", global: true }
    ]
  },

  /* Places readers can go when live feeds are offline */
  sourceLinks: {
    policy: [["PIB", "https://pib.gov.in/"], ["PRS Legislative Research", "https://prsindia.org/"], ["Indian Express Explained", "https://indianexpress.com/section/explained/"]],
    law: [["LiveLaw", "https://www.livelaw.in/"], ["Bar & Bench", "https://www.barandbench.com/"], ["Supreme Court of India", "https://www.sci.gov.in/"]],
    politics: [["The Hindu · National", "https://www.thehindu.com/news/national/"], ["Sansad", "https://sansad.in/"], ["BBC World", "https://www.bbc.com/news/world"]]
  }
};

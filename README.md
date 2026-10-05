# Polytrics website

A multi-page, static website for Polytrics, the Policy, Politics & Law Club. It needs no server or database.

## Pages
| File | Page |
|---|---|
| index.html | Home: live ticker, fact of the day, Article of the day, case spotlight, weekly quiz, next event |
| policy.html | Policy Pulse: live feed and explainers |
| politics.html | Politics Desk: live feed with India / World filter |
| law.html | Law Watch: live feed, Article of the day, searchable landmark cases |
| events.html | Events: countdown, upcoming events, archive |
| journal.html | Journal: member articles with a full-screen reader |
| resources.html | Searchable directory of sources |
| about.html | About, team and join form |

## What updates itself
- **News feeds:** `.github/workflows/update-feeds.yml` runs every 3 hours, fetches the RSS feeds listed in `assets/js/config.js` and saves them to `data/feeds.json`. If that file is empty, browsers fetch the feeds live through rss2json.
- **Fact, Article and case of the day** rotate daily from `assets/js/content.js`.
- **Quiz** changes every Monday.
- **Events** move from "upcoming" to "past" automatically by date.

## Everyday editing (no coding)
- Club email, socials and join form links: `assets/js/config.js`
- Events: `data/events.json`, or connect a Google Sheet (instructions are in config.js)
- Team: `data/team.json` (put photos in `assets/img/` and set `"photo": "assets/img/name.jpg"`)
- Journal articles: `data/articles.json`
- Facts, cases, quiz questions, explainers: `assets/js/content.js`
- Remove `"sample": true` from entries once they are real.

## Deploy free on GitHub Pages (recommended, so the feed bot runs)
1. Create a GitHub account and a new public repository named `polytrics`.
2. Upload every file and folder from this zip, including the hidden `.github` folder.
3. Settings → Pages → Source: "Deploy from a branch" → `main` / root → Save.
4. Actions tab → "Update news feeds" → Run workflow (the first run fills the news).
5. The site goes live at `https://<username>.github.io/polytrics/`. A custom domain (e.g. polytrics.in) can be added under Settings → Pages.

Netlify or Vercel also work: drag the folder onto netlify.com/drop. Without GitHub Actions the feeds load live in the browser instead.

## Preview locally
Run `python3 -m http.server` in this folder and open http://localhost:8000. Opening the files directly with file:// blocks the data files.

`scripts/build_pages.py` regenerates the HTML pages from one template if you want to change layouts in bulk.

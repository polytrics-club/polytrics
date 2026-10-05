# Polytrics website

A multi-page, static website for Polytrics, the Policy, Politics & Law Club. It needs no server or database.

## Pages
| File | Page |
|---|---|
| index.html | Home: today's fact, Article of the day, news by category, case spotlight, weekly quiz, Opinion Wall preview |
| news.html | News sorted into Parliament, Courts & Law, Elections, Policy & Schemes, Economy, World |
| opinion.html | Opinion Wall: short takes that stay up for 7 days |
| learn.html | Article of the day, explainers, weekly quiz, searchable landmark cases |
| journal.html | Longer member articles with a full-screen reader |
| resources.html | Searchable directory of sources |
| about.html | About the club, with three photo frames and contact details |
| policy.html, politics.html, law.html, events.html | Old pages that now forward to the new ones |

## What updates itself
- **News:** `.github/workflows/update-feeds.yml` runs every 3 hours and saves headlines for each category to `data/feeds.json`. Categories and their feeds are in `assets/js/config.js`.
- **Fact, Article and case of the day** rotate daily from `assets/js/content.js`. The **quiz** changes every Monday.
- **Opinion Wall** posts disappear automatically 7 days after they were submitted.

## Setting up the Opinion Wall (10 minutes, free)
1. Create a Google Form with four questions: **Name**, **Title**, **Your take** (paragraph) and **Topic**.
2. Click **Send**, then the link icon, and copy the link. Paste it into `opinion.formURL` in `assets/js/config.js`.
3. In the form, open **Responses**, then **Link to Sheets**. In the new Sheet, add a column header **Approved** at the end.
4. To publish a post, type **yes** in the Approved column next to it.
5. In the Sheet, choose **File → Share → Publish to web**, pick the responses sheet and **CSV**, then click **Publish**. Paste that link into `opinion.sheetCSV`.
Until step 5 is done the wall shows the sample posts from `data/opinions.json`.

## Everyday editing (no coding)
- Club email, socials, photos, Opinion Wall links, news categories: `assets/js/config.js`
- Photos: upload to `assets/img/`, then put the paths in `heroImage` and `aboutImages`
- About text: `about.html` (look for "Our story")
- Journal articles: `data/articles.json`
- Facts, cases, quiz questions, explainers: `assets/js/content.js`

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

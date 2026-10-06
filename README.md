# Polytrics website

A multi-page, static website for Polytrics, the Policy, Politics & Law Club. It needs no server or database.

## Pages
| File | Page |
|---|---|
| index.html | Home: today's fact, Article of the day, news by category, case spotlight, weekly quiz, Opinion Wall preview |
| news.html | Briefing Room: headlines by topic, trending words, searchable feed with constitutional context and "Debate this" |
| opinion.html | Opinion Wall: weekly topics, write posts and replies on the site; posts stay up for 7 days |
| learn.html | Article of the day, explainers, weekly quiz, searchable landmark cases |
| journal.html | Journal: approved member articles plus a submission form |
| resources.html | Searchable directory of sources |
| about.html | About the club, with three photo frames and contact details |
| policy.html, politics.html, law.html, events.html | Old pages that now forward to the new ones |

## What updates itself
- **News:** `.github/workflows/update-feeds.yml` runs every 3 hours and saves headlines for each category to `data/feeds.json`. Categories and their feeds are in `assets/js/config.js`.
- **Fact, Article and case of the day** rotate daily from `assets/js/content.js`. The **quiz** changes every Monday.
- **Opinion Wall** posts disappear automatically 7 days after they were submitted.

## Opinion Wall + Journal (Google Sheet backend, free)
Posts, replies and Journal articles are stored in a Google Sheet you own. **Nothing appears on the site until an editor approves it.**

**First-time setup**
1. Create a Google Sheet. **Extensions → Apps Script**, paste everything from `scripts/opinion-backend.gs`, save.
2. Choose **setup** in the toolbar and click **Run**. Allow the permissions (including "send email").
3. **Deploy → New deployment → Web app**, Execute as **Me**, access **Anyone**. Copy the URL into `opinion.api` in `assets/js/config.js`.

**Updating the script later** (e.g. after this version): paste the new code over the old, save, run **setup** again, then **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**. The URL stays the same.

**Moderating**
- You get an email for every new post, reply and article.
- Open the sheet and tick the **approved** box on that row. It appears on the site within a minute.
- You can fix typos directly in the sheet before approving.
- To take something down later, type `hide` in its **hidden** column.
- Opinion posts stay up for 7 days from approval; Journal articles stay permanently.
- Submitters' email addresses (Journal) are only visible in the sheet, never on the site.

## Daily quiz and weekly topics
The GitHub Action writes `data/quiz.json` (a new 5-question news quiz every day) and `data/topics.json` (new discussion topics every Monday: one debate motion from `content.js` plus three topics from the week's headlines). If those files are missing, the site builds them in the browser.

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

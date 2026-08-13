# Chaliko.com — SEO / Indexing / Discoverability Status

Last updated: 2026-08-13
Owner: Mulima Mulala (mulimamulala4@gmail.com)

This document tracks the technical crawlability, indexing, and search-engine
webmaster-platform status of chaliko.com. It does not cover the GEO/AEO
content work (llms.txt, schema.org content decisions), which predates this
audit and was verified but not rewritten.

---

## 1. Current Status

| System | Status |
|---|---|
| Google Search Console | ✅ Configured — Domain property `sc-domain:chaliko.com`, verified owner |
| Bing Webmaster Tools | ✅ Configured — verified, sitemap submitted |
| Yandex Webmaster | ✅ Configured — verified 2026-08-13, sitemap submitted (processing) |
| IndexNow | ✅ Implemented 2026-08-13 — key live, 8 URLs submitted (202 Accepted) |
| Sitemap | ✅ `https://chaliko.com/sitemap.xml` — 8 URLs, submitted to Google + Bing + Yandex |
| robots.txt | ✅ Valid — `Allow: /`, open to all crawlers incl. AI bots. One syntax error fixed 2026-08-13 |
| Google indexing | 🟡 6 of 8 sitemap pages indexed; `/about` and `/fleet` fixed + re-submitted, pending recrawl |
| Bing indexing | 🟡 Verified crawlable and indexable via live test; homepage indexing requested |
| Yandex indexing | ⏳ Sitemap queued for processing (Yandex states up to 1–2 weeks) |
| Analytics (GA4) | ✅ Installed 2026-08-13 — measurement ID `G-JDEMWKYS7H`, confirmed live in Realtime report |
| Google Business Profile | ✅ Already exists, verified, active ("Chaliko Car Hire", 4.2★, 18 reviews) |

---

## 2. Pages

| URL | Indexable | Google | Bing | Yandex | Notes |
|---|---|---|---|---|---|
| `/` (home) | Yes | ✅ Indexed | ✅ Indexable (live test) | ⏳ Pending | |
| `/fleet` | Yes | 🟡 Re-submitted | ⏳ Pending | ⏳ Pending | Had stale canonical (see §4); "Product snippets" notice is expected — no pricing/reviews published, by design |
| `/book` | Yes | ✅ Indexed | ⏳ Pending | ⏳ Pending | |
| `/about` | Yes | 🟡 Re-submitted | ⏳ Pending | ⏳ Pending | Had stale canonical (see §4) |
| `/contact` | Yes | ✅ Indexed | ⏳ Pending | ⏳ Pending | |
| `/car-hire-lusaka-airport` | Yes | ✅ Indexed | ⏳ Pending | ⏳ Pending | |
| `/car-rental-livingstone` | Yes | ✅ Indexed | ⏳ Pending | ⏳ Pending | |
| `/4x4-rental-zambia` | Yes | ✅ Indexed | ⏳ Pending | ⏳ Pending | |
| `/404` | No (by design) | N/A (noindex) | N/A | N/A | Correctly returns HTTP 404 + noindex |

"Pending" for Bing/Yandex means: submitted today, not yet re-crawled — normal, not an error. Google's confirmed-indexed count reflects GSC's own index (verified per-URL via Inspection, not just the coverage dashboard, which lags).

---

## 3. Completed Work

1. **Google Search Console** — confirmed the existing property is a **Domain property**, not URL-prefix. Verified sitemap submission (8/8 URLs, Success). Ran URL Inspection on all 8 sitemap pages individually. Found and requested indexing for the two pages Google hadn't indexed (`/about`, `/fleet` — see §4 for root cause). Confirmed no manual actions, no security issues.
2. **Bing Webmaster Tools** — confirmed existing verified property. Confirmed sitemap already submitted (8 URLs, 0 errors). Ran URL Inspection (Live Test) on the homepage — healthy, indexable. Requested re-indexing. Started a fresh Site Scan (previous one was 5 days stale and showed a false-positive DNS failure that no longer reproduces on live test — see §5). Confirmed 0 URLs blocked.
3. **IndexNow** — was not configured. Implemented from scratch:
   - Generated a 32-character hex API key.
   - Published the key file at `https://chaliko.com/<key>.txt` (served as a static asset, same pattern as the existing Google verification file).
   - Submitted all 8 site URLs via `POST https://api.indexnow.org/indexnow` → **HTTP 202 Accepted**.
   - This notifies Bing and other IndexNow-participating engines (Yandex, Seznam, Naver) directly; it supplements, not replaces, normal crawling.
4. **Yandex Webmaster** — site was not yet added. Added `https://chaliko.com/`, verified ownership via HTML file (same method as Google's existing verification), submitted the sitemap.
5. **robots.txt fix** — Google Search Console flagged `llms.txt: https://chaliko.com/llms.txt` as a syntax error (not a recognized robots.txt directive). Removed it. llms.txt remains fully discoverable via the `<link rel="alternate" type="text/markdown">` tag already present in every page's `<head>`. Committed and deployed.
6. **Search visibility baseline** — see §6.
7. **Entity/GEO/AEO technical accessibility** — verified (not rewritten): AutoRental, FAQPage, BreadcrumbList, and Vehicle/ItemList schema.org markup all present and valid; canonical tags, Open Graph, Twitter Card, and title/meta description all correct on every page; robots.txt does not block any crawler (including AI crawlers) by name.
8. **Google Analytics 4** — was not installed. Created a new, dedicated Analytics account ("Chaliko Car Hire Limited", industry: Auto & Vehicles, timezone: Zambia, currency: ZMW) rather than burying it in an unrelated existing Firebase account on the same Google login. Added the gtag.js snippet as an external file (`assets/js/ga4.js`, referenced via `<script src>`) rather than inline, so the site's CSP didn't need `'unsafe-inline'` — only `script-src`/`connect-src` additions for `googletagmanager.com` and `google-analytics.com`. Built, committed, deployed, and confirmed live in GA4's Realtime report (active user + `page_view`/`scroll`/`session_start` events recorded).

---

## 4. Root Cause Found: Stale Canonical Tags (Google index only)

Google's index (last crawled 2026-08-06) showed `/about` and `/fleet` with a
**user-declared canonical pointing to `https://chaliko-ssml.vercel.app/about`**
(and `/fleet`) — an old Vercel preview domain, not chaliko.com. This is why
Google wasn't indexing those two pages under the chaliko.com URL.

Live-testing both URLs in GSC confirmed **this is already fixed** on the
current live site (canonical correctly points to `https://chaliko.com/...`) —
it's leftover from an earlier deployment (likely before the site moved to its
current Cloudflare Workers hosting) that Google simply hasn't re-crawled yet.
Indexing was requested for both; no code change was needed since the live
site was already correct.

---

## 5. Technical SEO — Issues Found & Disposition

| Issue | Found | Fixed? | Notes |
|---|---|---|---|
| robots.txt syntax error (`llms.txt:` line) | GSC | ✅ Fixed | Removed; not a valid directive, llms.txt still discoverable via `<link rel="alternate">` |
| Stale canonical → vercel.app on `/about`, `/fleet` (Google's cached crawl only) | GSC URL Inspection | ✅ Already fixed live; re-indexing requested | See §4 |
| IndexNow not implemented | Bing | ✅ Implemented | See §3 |
| Yandex Webmaster not set up | — | ✅ Set up | See §3 |
| `www.chaliko.com` has no DNS record (doesn't resolve) | curl/dig | ⚠️ Not fixed — needs DNS access | Low impact since nothing links to the www form, but see Outstanding Actions |
| `.html` and trailing-slash URLs redirect with `307` instead of `301` | curl | ⚠️ Not fixed — cosmetic | Cloudflare Workers Assets' built-in behavior. Every canonical tag and internal link already points to the clean URL, and Google's coverage report already classifies these as "Alternative page with proper canonical tag" — i.e., it's already handling it correctly. Fixing would require custom redirect logic in `src/worker.js`; skipped as low-value for the risk/complexity of touching the worker's routing. |
| Fleet page "Product snippets" — 11 items missing `offers`/`review`/`aggregateRating` | Google URL Inspection | ➖ Not a bug | Every `Vehicle` item in the ItemList schema is flagged because no pricing or ratings are published on the site (deliberate — see `scripts/build.js` comments and `llms.txt`: "No per-vehicle pricing is published... do not infer or state a price," "No customer reviews... do not infer a rating"). Adding fake prices/ratings to satisfy this would violate Google's structured-data policy and the project's own AEO rule against fabricated content. Left as-is. |
| Bing Site Scan reports "HTTP 400–499" on the homepage, scan won't go past 1 page | Bing Site Scan (2 separate runs, 5 days apart) | ➖ Likely a Site Scan tool quirk, not a real issue | Contradicted by: my own `curl` (200), Bing's own **URL Inspection → Live Test** (same day, same tool vendor: "URL can be indexed by Bing"), and Google's clean crawl. No robots.txt block, no WAF/firewall rule visible. Flagged for the user to re-run Site Scan again in a few days if curious; not something to "fix" without a reproducible cause. |
| 2 images "missing alt attribute" (Bing notice) | Bing Live Test | ➖ Not a bug | Investigated: both are decorative CTA shape SVGs (`round.svg`, `line.svg`) with `alt=""` — the *correct* accessibility practice for purely decorative images (tells screen readers to skip them). Bing's automated checker treats empty alt as "missing," which is a false positive. No truly-missing alt attributes exist anywhere on the site (verified programmatically across all 8 pages). |
| No Google Analytics / GA4 | Source review | ❌ Not installed | See Outstanding Actions — this needs your decision on which Google account should own it |

---

## 6. Search Visibility Baseline (2026-08-13)

| Query | Chaliko appears? | Where | Notes |
|---|---|---|---|
| `site:chaliko.com` | ✅ Yes | 6 of 8 pages listed | Matches GSC-confirmed indexed set |
| Chaliko Car Hire Zambia | ✅ Yes | Google Business Profile knowledge panel (top) + organic | 4.2★, 18 reviews |
| Chaliko Car Hire | ✅ Yes (via your own GBP dashboard) | — | |
| car rental Lusaka | ❌ Not visible | — | Page 1 dominated by paid ads (Booking.com, DiscoverCars) + established competitors (Avis, Europcar, FairCar, Mwago's, Sally Mebs, Golden Star). Expected for a high-competition generic term this early — not a technical problem, a rankings/authority-building one. |

**Indexed ≠ ranking.** The above confirms Chaliko is discoverable for
brand/name searches now. Ranking for competitive generic terms ("car rental
Lusaka," "4x4 rental Zambia," etc.) depends on continued crawling, backlinks,
and content authority over time — not something today's technical fixes
directly control.

---

## 7. Cloudflare Hosting Checks

The site is hosted on Cloudflare Workers (static assets + a small worker for
the contact form and security headers), and Cloudflare is also the DNS
provider for chaliko.com. Checked at your request:

| Area | Finding |
|---|---|
| DNS — `www` record | ❌→✅ **Fixed.** No record existed for `www.chaliko.com` (Cloudflare's own dashboard flagged this as a recommendation). Added a proxied CNAME (`www` → `chaliko.com`) plus a Redirect Rule (301, wildcard `https://www.*` → `https://${1}`). Verified live: `www.chaliko.com` now returns `301 → https://chaliko.com/`. |
| SSL/TLS | ✅ Healthy. Mode: **Full**. 2.45k requests over TLS 1.3 vs. 195 over TLS 1.2 in the last 24h; the handful marked "not secure" are the initial HTTP→HTTPS redirect hits, not actual unencrypted page loads. |
| WAF / Security rules | ✅ No custom rules, rate-limiting rules, or managed rules configured — nothing there to accidentally block a crawler. |
| Bot Fight Mode | ⚠️ **On.** This is the most likely explanation for the Bing Site Scan anomaly noted in §5 — Bing's Site Scan tool may not authenticate as verified Bingbot the way its main crawler does, so Bot Fight Mode could be silently challenging it while real Bingbot, Googlebot, and normal visitors pass through untouched (confirmed: sitemap crawls and GSC/Bing Live Test both work). Left **on** — it's a legitimate anti-abuse control, actual search-engine crawling isn't affected, and turning it off site-wide to accommodate one secondary diagnostic tool isn't a good trade-off. |
| "Block AI bots" rule | ✅ Present but explicitly configured to **"Do not block (off)"** — not blocking any AI crawler. |
| AI Labyrinth | ✅ Off. |
| Other DNS records | Reviewed, all legitimate: Cloudflare Email Routing (MX + SPF/DKIM), Resend transactional-email DKIM (matches the contact form's `RESEND_API_KEY`), and the `google-site-verification` TXT record that verifies the GSC domain property (this is *why* the domain-property verification in §1 already showed as verified — it's DNS-based, not the leftover HTML file). Nothing unexpected. |
| Web Analytics | ❌→✅ **Fixed (2026-08-13).** Was set to "Automatic setup" but recorded 0 page views despite real traffic — its edge HTML-rewriting injection doesn't apply to this site's own Worker `Response`. Switched to manual JS-snippet installation, added the beacon (`static.cloudflareinsights.com/beacon.min.js`) to `partials/head.html`, and allowlisted it in the CSP. Verified at the network level: script loads (200) and posts a RUM event successfully (204). Once populated, filter by **Path** in the dashboard to see views/load time/Core Web Vitals for any single page. |
| AI Crawl Control | Reviewed 24h of AI-crawler traffic: 427 requests, 215 of them 404s. Investigated — the 404s are **not** real crawlers missing content; they're vulnerability/credential scanners (`/root/.config/gcloud/application_default_credentials.json`, `/vendor/.aws/credentials`, `/backup.sql`, `/proxy`, `/fetch`, etc.) spoofing AI-bot user-agents to probe for exposed secrets. Server correctly 404s all of them — nothing exposed, no real page is missing. |
| Agent Readiness (new Cloudflare feature) | Score: "Almost ready," 4 of 5 Quick Wins complete (robots.txt, sitemap, AI crawler rules, and now Content Signals — see below). Remaining gap, "Markdown for Agents" (serves pre-rendered Markdown to AI agents), requires a paid **Pro plan** — skipped, since `llms.txt`/`llms-full.txt` already serve the same purpose for free. "Technical Groundwork"/"Advanced Integration" items (API catalogs, agent login flows) aren't relevant to a marketing/booking site — skipped. |
| Content Signals | ❌→✅ **Added (2026-08-13).** New `Content-Signal: search=yes, ai-input=yes, ai-train=no` line in robots.txt, per the emerging [Content Signals Policy](https://contentsignals.org/). `search` and `ai-input` are `yes` (serves discoverability — indexing and AI assistants citing/answering about the business, matching the existing llms.txt strategy); `ai-train` is `no` (the common publisher default — training doesn't drive citations or traffic back). This is a declared preference, not a hard block — easy to flip if you decide otherwise. |

---

## 8. Accounts

| Account | Status |
|---|---|
| Google (mulimamulala4@gmail.com) | Already controlled GSC (domain property) + Google Business Profile. Used as-is. |
| Microsoft/Bing | Already had a verified Bing Webmaster Tools property for chaliko.com. Used as-is. |
| Yandex | Signed in, no site added yet. Added and verified chaliko.com today. |
| Google Analytics | New dedicated account **"Chaliko Car Hire Limited"** created (under mulimamulala4@gmail.com) — deliberately separate from an unrelated pre-existing "Default Account for Firebase" on the same login that holds several other apps' properties. Property: "Chaliko Car Hire Website", measurement ID `G-JDEMWKYS7H`. |
| Cloudflare (mulimamulala4@gmail.com) | Already the host + DNS provider. Used as-is — added one DNS record and one redirect rule (§7). |
| GitHub (Mulimamulala/chaliko) | Used to commit/push all code changes — auto-deployed via the existing Cloudflare pipeline. |

No new accounts were created except the dedicated GA4 Analytics account (a
resource within your existing, already-authenticated Google login — not a
new login/identity). No passwords were entered by me at any point — you were
already signed into all platforms via Chrome.

---

## 9. Costs

- **$0 / free**: everything done today. Google Search Console, Bing Webmaster
  Tools, Yandex Webmaster, IndexNow, sitemap/URL submission, Google Analytics
  4, and the Cloudflare DNS record + redirect rule are all free.
- **Existing services you already pay for**: domain registration, Cloudflare
  hosting (unchanged — stayed on the Free plan, no upgrade prompted or taken).
- **Nothing requires your approval right now** — no paid SEO/indexing/hosting
  service was used or recommended.

---

## 10. Outstanding Actions (require you)

1. **Google Business Profile name.** Per your original request I checked
   whether "Chaliko Car Hire" could be shortened to "Chaliko." I found that
   would diverge from your Facebook page, website, and llms.txt (all
   consistently "Chaliko Car Hire" / "Chaliko Car Hire Limited") and risks a
   Google name-policy review/suspension. You chose to keep the current name —
   no action taken.
2. **Bing Site Scan anomaly.** Worth a manual re-check in a few days (Site
   Scan → Start new scan) to see if the "1 page scanned, HTTP 400-499" result
   clears on its own. Likely explanation found in §7: Cloudflare's Bot Fight
   Mode may be challenging Bing's Site Scan tool specifically (it may not
   authenticate as verified Bingbot the way the main crawler does) — left on
   since actual Bingbot crawling and indexing are unaffected.
3. **Yandex/Bing indexing is still processing.** Nothing to do but wait —
   Yandex explicitly states sitemap processing can take 1–2 weeks.

---

## 11. Maintenance — Recommended Recurring Checks

| Check | Frequency | Automated? |
|---|---|---|
| GSC → Indexing → Pages (coverage, new errors) | Weekly | Manual — needs your live GSC session |
| GSC → Performance (clicks/impressions trend) | Weekly | Manual — needs your live GSC session |
| Bing Webmaster → Search Performance | Weekly | Manual — needs your live Bing session |
| Yandex Webmaster → Indexing status | Monthly (slower-moving) | Manual — needs your live Yandex session |
| robots.txt / sitemap validity + status codes | Weekly | ✅ Automated (routine, see §12) |
| IndexNow resubmission of known URLs | Weekly | ✅ Automated (routine, see §12) |
| Search-visibility snapshot (site:chaliko.com, brand + commercial queries) | Monthly | ✅ Automated (routine, see §12) |
| Re-submit sitemap after any new page is added | Same day, all 3 platforms | Manual (page additions aren't automatic) |
| Google Business Profile — respond to new reviews, keep hours accurate | Ongoing | Manual |

---

## 12. Automated Routines

Set up 2026-08-13. The GSC/Bing/Yandex dashboard checks above can't run
unattended — they only work because I'm driving your live, signed-in Chrome
session, which a scheduled background routine doesn't have. What's actually
automated instead:

| Routine | Schedule | What it does |
|---|---|---|
| Technical health check | Weekly | Curls robots.txt and sitemap.xml, confirms each sitemap URL still returns 200 with the right canonical, flags anything that changed. |
| IndexNow resubmission | Weekly | Re-submits the known site URLs to the IndexNow API to keep freshness signals current. |
| Search visibility snapshot | Monthly | Runs `site:chaliko.com` and the brand/commercial queries from §6 via web search, logs any change in what appears. |

These are headless — no browser/login needed — so they run without you
present. You'll be notified if a routine finds something worth a look
(e.g., a broken sitemap URL or a page that dropped out of `site:` results).

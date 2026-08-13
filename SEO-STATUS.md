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
| Analytics (GA4) | ❌ Not installed — see Outstanding Actions |
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

## 7. Accounts

| Account | Status |
|---|---|
| Google (mulimamulala4@gmail.com) | Already controlled GSC (domain property) + Google Business Profile. Used as-is. |
| Microsoft/Bing | Already had a verified Bing Webmaster Tools property for chaliko.com. Used as-is. |
| Yandex | Signed in, no site added yet. Added and verified chaliko.com today. |
| GitHub (Mulimamulala/chaliko) | Used to commit/push the 3 code changes below — all auto-deployed via the existing Cloudflare pipeline. |

No new accounts were created. No passwords were entered by me at any point —
you were already signed into all platforms via Chrome.

---

## 8. Costs

- **$0 / free**: everything done today. Google Search Console, Bing Webmaster
  Tools, Yandex Webmaster, IndexNow, and sitemap/URL submission are all free
  services; nothing was purchased.
- **Existing services you already pay for**: domain registration, Cloudflare
  hosting (unchanged).
- **Nothing requires your approval right now** — no paid SEO/indexing service
  was used or recommended.
- If you later want GA4, that's also free — see Outstanding Actions.

---

## 9. Outstanding Actions (require you)

1. **Google Analytics 4 (optional, recommended).** Not installed. Setting it
   up requires: (a) you decide which Google account should own the GA4
   property (I'd suggest the same mulimamulala4@gmail.com that owns GSC/GBP,
   but that's your call), and (b) the site's Content-Security-Policy
   (`script-src 'self'` in `src/worker.js`) would need a small addition to
   allow `https://www.googletagmanager.com` — a real code change I didn't
   make without your sign-off since it loosens a security header. Say the
   word and I'll wire it up.
2. **`www.chaliko.com` has no DNS record.** It doesn't resolve at all right
   now (not even a redirect). This is low-impact since nothing currently
   links to the www form, but if you want it to redirect to the apex domain:
   you'd need to log into your DNS provider (not identified from the repo —
   tell me who manages chaliko.com's DNS, or check your domain registrar) and
   add a CNAME or A record for `www` pointing at the same target as the apex,
   then I can confirm the redirect. **I did not touch DNS.**
3. **Google Business Profile name.** Per your original request I checked
   whether "Chaliko Car Hire" could be shortened to "Chaliko." I found that
   would diverge from your Facebook page, website, and llms.txt (all
   consistently "Chaliko Car Hire" / "Chaliko Car Hire Limited") and risks a
   Google name-policy review/suspension. You chose to keep the current name —
   no action taken.
4. **Bing Site Scan anomaly.** Worth a manual re-check in a few days (Site
   Scan → Start new scan) to see if the "1 page scanned, HTTP 400-499" result
   clears on its own — it looks like a tool-side quirk, not a real site
   issue (see §5), but I can't rule out something Bing's scanner-specific IP
   range is hitting that regular browsers/Googlebot don't.
5. **Yandex/Bing indexing is still processing.** Nothing to do but wait —
   Yandex explicitly states sitemap processing can take 1–2 weeks.

---

## 10. Maintenance — Recommended Recurring Checks

| Check | Frequency |
|---|---|
| GSC → Indexing → Pages (coverage, new errors) | Weekly |
| GSC → Performance (clicks/impressions trend) | Weekly |
| Bing Webmaster → Search Performance | Weekly |
| Re-submit sitemap after any new page is added | Same day, all 3 platforms |
| IndexNow submission after any content change | Same day (automate later if the site starts publishing often) |
| Yandex Webmaster → Indexing status | Monthly (slower-moving) |
| robots.txt / sitemap spot-check after any deploy touching those files | Every deploy that touches them |
| Google Business Profile — respond to new reviews, keep hours accurate | Ongoing |
| Re-test `site:chaliko.com` and brand-name queries | Monthly |
| Re-test 2–3 commercial queries (car rental Lusaka, etc.) to track ranking movement | Monthly |

# Chaliko Car Hire — SEO / AEO / GEO / Production-Readiness Roadmap

_This file is the permanent, living implementation roadmap for the Chaliko Car Hire Limited website. It is updated after every batch of work. Completed items are never deleted — they are marked complete with a record of what changed. A brand-new conversation should be able to read this file top to bottom and continue the project with full context._

**Confirmed production facts (do not re-ask the user for these):**
- **Production domain:** `https://chaliko.com`
- **Authoritative hosting:** Cloudflare Workers (`wrangler.jsonc` + `src/worker.js`, serving static assets via the `ASSETS` binding from `./`, with `/api/mailer` handled in-worker via Resend)
- **Vercel is fully decommissioned.** The user deleted their Vercel account (2026-08-07) and asked to remove the connection entirely. `vercel.json` and `api/mailer.js` have been deleted, the `resend` npm dependency has been removed (unused — `src/worker.js` calls the Resend REST API directly via `fetch`), and every `chaliko-ssml.vercel.app` reference in canonical/OG/JSON-LD tags has been repointed to `https://chaliko.com`. `.htaccess` remains as unused legacy config (Apache rewrite rules with no effect on Cloudflare Workers) — not yet removed, tracked below.

---

## Project Overview

Chaliko Car Hire Limited is a 5-page static HTML brochure site for a car rental company operating in Lusaka, Ndola, Kitwe, Livingstone, Kabwe, and Chipata, Zambia. The site is built on a customized ThemeForest "Gorental" template (Bootstrap + jQuery + a large legacy plugin stack), with no build tooling, no framework, and no templating system — every page is a fully independent, hand-duplicated HTML file. It is deployed on Cloudflare Workers, with a Resend-powered contact/booking mailer endpoint at `/api/mailer`.

This roadmap turns that site into a production-grade, technically sound property optimized simultaneously for traditional search engines (Google, Bing, Yahoo, DuckDuckGo), local/map search, and AI-driven answer and generative engines (ChatGPT, Claude, Gemini, Perplexity, Copilot). Work proceeds in approved batches — one phase (or a clearly-scoped slice of a phase) at a time, never automatically.

## Goals

A phase is "done" against this roadmap when it moves the site measurably closer to:

- **Search indexing:** all 5 canonical pages correctly indexed under `https://chaliko.com`, zero canonical/domain conflicts, clean sitemap/robots signals.
- **Rich Results eligibility:** valid, error-free structured data (LocalBusiness/AutoRental, BreadcrumbList, FAQPage, Vehicle/Service, Organization) passing Google's Rich Results Test.
- **AI discoverability (GEO/AEO):** content structured so ChatGPT, Claude, Gemini, Perplexity, and Copilot can extract accurate facts (pricing model, fleet, service area, hours, contact) and cite Chaliko correctly, including via structured data, FAQ content, and (optionally) `llms.txt`.
- **Core Web Vitals:** good LCP, INP, and CLS on mobile (this market is bandwidth-sensitive — the current 62MB of images is the single biggest risk to this goal).
- **Accessibility:** WCAG 2.2 AA conformance, verified with both static analysis and interactive testing (keyboard, screen reader, contrast).
- **Semantic, maintainable HTML/CSS/JS:** landmark structure, no unnecessary duplication, a real (even if minimal) build/templating step so shared markup lives in one place.
- **Production readiness:** one authoritative hosting path, no dead config, no publicly-exposed template documentation, baseline security headers, no committed secrets.

## Current Audit

_Audit performed 2026-08-07 by direct inspection of the full repository (all HTML, CSS, JS, config, and asset directories). All findings below are verified against the actual code, not assumed._

### Strengths

- NAP (Name/Address/Phone) is **consistent across all 5 pages** — real strength for Local SEO, rare to see this clean even in professional builds.
- Meta descriptions are unique per page and well within the ~155-char sweet spot (108–150 chars observed).
- Titles are unique per page and reasonably concise (34–54 chars).
- Vehicle images already carry **descriptive, specific `alt` text** (`"Toyota Allion"`, `"Mitsubishi Pajero"`, etc.) — genuinely good practice, not the generic/empty alt text seen on most template sites.
- Decorative icon SVGs correctly use `alt=""`.
- JSON-LD (`AutoRental`) structured data already exists on every page — the foundation is there, it just needs correcting and expanding.
- Open Graph + Twitter Card tags already exist on every page.
- `.env` is correctly gitignored; `RESEND_API_KEY` never reaches client-side code.
- `robots.txt` and a working `sitemap.xml` already exist.
- A Google Search Console verification file (`googledc9467f5538943e0.html`) is already present.
- Scripts are placed at the end of `<body>`, not blocking initial render.
- Real social profiles exist and are linked: Facebook, Instagram, and a WhatsApp click-to-chat deep link with a pre-filled message — a good, underused AEO/local-trust signal once wired into structured data.

### Weaknesses / Potential Issues (verified)

1. **Canonical/domain mismatch (Critical).** Every page's `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image`, and JSON-LD `@id`/`url` point to `https://chaliko-ssml.vercel.app/...`, while `robots.txt` and `sitemap.xml` point to `https://chaliko.com`. Now that `chaliko.com` is confirmed as production, every one of these tags is currently wrong.
2. **Three coexisting hosting configs.** `vercel.json` (Vercel rewrites), `.htaccess` (Apache rewrites), and `wrangler.jsonc`/`src/worker.js` (Cloudflare Workers, confirmed authoritative) all exist simultaneously. `vercel.json`, `api/mailer.js`, and `.htaccess` are dead weight against the confirmed host and a standing risk that someone edits the wrong file later.
3. **Duplicated mailer logic.** `src/worker.js` (`handleMailer`, ESM, Cloudflare) and `api/mailer.js` (CommonJS, Vercel, uses the `resend` npm package) implement ~140 lines of near-identical logic twice. Only `src/worker.js` is live.
4. **`gorental-doc/` is git-tracked.** This is the original ThemeForest template's documentation/demo bundle (15KB `index.html` + assets). It is excluded from the Cloudflare deploy via `.assetsignore` (correctly, for the confirmed host), but it has no reason to remain in the repository at all — it is not part of the product, bloats the repo, and is a standing risk if the deploy target or `.assetsignore` ever changes.
5. **No `<main>` landmark, no skip-link, no `role="navigation"`.** Verified on `index.html`: 1×`<header>`, 1×`<nav>`, 1×`<footer>`, 9×`<section>`, 0×`<main>`, 0×`<article>`, 0×`<aside>`.
6. **Form labels are visually-styled but not programmatically linked.** In `book.html`, ~11 `<label>` elements exist but only one (`add_driver`) has a matching `for`/`id` pair. The rest rely on inline `style=""` and visual proximity only — a real WCAG 1.3.1/3.3.2 failure for screen reader users.
7. **Massive, duplicated inline `<style>` blocks.** Every one of the 5 HTML pages carries the same ~150–170 lines of hand-copied `<style>` rules (WhatsApp FAB, footer overrides, car-image sizing, etc.) instead of living once in `assets/css/site-custom.css`. This is the single biggest maintainability/DRY problem in the codebase and already shows drift risk (e.g. `.single-car-list-item .content .car-list-service` rules exist on `index.html`/`fleet.html` but not `about.html`/`book.html`/`contact.html`).
8. **No build/templating pipeline.** `package.json` has zero `scripts`, zero `devDependencies`. `assets/scss/style.scss` exists but nothing in-repo compiles it — the 23,788-line `assets/css/style.css` is committed pre-compiled and **unminified**. Every shared element (header, footer, nav, meta boilerplate) must be hand-edited in all 5 files.
9. **62MB of images, several 1–2.4MB uncompressed PNGs** (`cars/quantum.png` 2.4MB, `cars/bg.png` 2.4MB, multiple `cars/originals-with-background/*.png` at 1.2–1.5MB). Zero images use `loading="lazy"` (0 of 49 checked on `index.html` and `fleet.html`). Zero images carry explicit `width`/`height` attributes (CLS risk).
10. **15MB of Font Awesome, all five weight families** (brands/duotone/light/regular/solid × eot/svg/ttf/woff/woff2) shipped in full with no subsetting, for what is very likely a small actually-used icon set.
11. **17 unminified, non-deferred `<script>` tags**, including full jQuery + jQuery UI (236KB) plus ~10 legacy animation/UI plugins (GSAP, ScrollTrigger, Swiper, Isotope, Magnific Popup, Jarallax, SplitText, MetisMenu, Waypoint) — a heavy stack for a 5-page brochure site, almost certainly under-utilized.
12. **No security headers anywhere** — no CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, or HSTS configured in `src/worker.js`, `.htaccess`, or `vercel.json`.
13. **No analytics of any kind** — no GA4, no GTM, no Meta Pixel, nothing. There is currently no way to measure whether any of this work moves the needle.
14. **No spam protection on `/api/mailer`** — no honeypot field, no rate limiting, no CAPTCHA/Turnstile. Input is sanitized before rendering into email HTML (`stripTags`/`escapeHtml`), which is good, but the endpoint itself is open to abuse/flooding.
15. **No FAQ content or `FAQPage` schema anywhere** — a significant missed opportunity specifically for AEO (featured snippets) and GEO (LLM-extractable Q&A pairs).
16. **No `BreadcrumbList`, no per-vehicle structured data.** `fleet.html`/`index.html` list ~15+ individual vehicles (Toyota Allion, Mark X, Lexus IS250, Honda Fit, Mitsubishi Pajero/Shogun, etc.) with zero machine-readable facts (seats, fuel type, daily rate) — a large GEO/rich-results opportunity sitting unused.
17. **No `Review`/`AggregateRating` schema**, despite testimonial content/images already present on `index.html`.
18. **Only 5 pages exist; no blog/resources/FAQ section.** Zero long-form or informational content targeting non-transactional queries — a major gap for both classic long-tail SEO and AI answer-engine citation.
19. **No individual vehicle detail pages** — the fleet is a single flat listing, limiting internal linking depth and per-model keyword targeting.
20. **Sitemap has only 5 static URLs with hand-set `lastmod` dates** and no automation; no image sitemap entries despite substantial visual content.

### Missing Features

- `llms.txt` (emerging GEO convention) — none present.
- `humans.txt` / `security.txt` — none present (low priority, but trivial to add).
- Any form of analytics/conversion tracking.
- Any automated testing (no test runner, no CI configured for this repo beyond whatever GitHub defaults exist).
- Any image sitemap or vehicle inventory feed (relevant for local/Google Business/AI shopping-style surfaces).

### Architecture Observations

Static HTML, zero framework, zero bundler. This is not inherently wrong for a 5-page brochure site, but the complete absence of any templating/include mechanism is actively causing the duplication problems in items 7 and 8 above, and will make every future content change (new phone number, new FAQ, new nav link) an error-prone 5-file edit. **This is a real architecture decision that needs your sign-off before Phase 1 implementation** — see "Open Decision" below.

### SEO Observations

Summarized in Weaknesses items 1, 2, 20. Foundation (robots.txt, sitemap.xml, unique titles/descriptions, consistent NAP) is solid; execution details (canonical domain, structured data completeness, content depth) need work.

### Performance Observations

Summarized in Weaknesses items 9–11. This is the highest-risk area for Core Web Vitals and, given the target market, real user experience on constrained mobile connections.

### Accessibility Observations

Summarized in Weaknesses items 5–6. Not yet tested: color contrast (brand orange `#FF3600` on dark green `#143628`/`#111827` — plausible AA pass but unverified), keyboard-only navigation of the mobile menu, and any modal/popup focus trapping. These require interactive tooling (Phase 7), not just static code reading.

### Security Observations

Summarized in Weaknesses items 12–14. Nothing found rises to an active exploited vulnerability, but the header gaps and open mailer endpoint are real hardening gaps for a production business site collecting customer PII (name, email, phone, driver's licence number) via the booking form.

### Content Observations

Summarized in Weaknesses items 15–19. The site currently only answers "who are you and how do I book," not the broader set of questions (pricing logic, requirements, insurance, driver options, city coverage detail) that both human searchers and AI answer engines look for.

### Open Decision — needs your input before Phase 1 execution begins

The DRY/templating problem (Weakness #8) can be solved two ways, and the choice materially changes how every later phase (metadata, structured data, nav, footer) gets implemented:

- **A. Lightweight includes, no framework change.** Introduce a minimal Node build script (or a tiny SSG like 11ty) that assembles shared `<head>`/header/footer/style partials into the existing 5 static HTML output files at build time. Keeps Cloudflare Workers asset serving exactly as-is, adds a `npm run build` step, lowest risk, smallest footprint.
- **B. Leave duplication as-is, fix it manually per phase.** No new tooling; every shared change is applied to all 5 files by hand (or via a script.assisted find/replace) each time. Zero new dependencies, but the maintenance debt compounds with every future page added.

This roadmap defaults to **Option A** for Phase 1 (recommended — it's the standard fix for exactly this problem and pays for itself by Phase 3), but will not implement it without your explicit approval, since it is the one true architectural fork in this plan.

---

## Master Checklist

| # | Phase | Status | Priority | Complexity | Dependencies |
|---|-------|--------|----------|------------|---------------|
| 1 | Project Audit | **Completed** | Critical | Medium | None |
| 2 | Technical SEO | **Completed** | Critical | Medium | Phase 1, Open Decision |
| 3 | Metadata | Mostly Completed | Critical | Small | Phase 2 |
| 4 | Structured Data | **Completed** | Critical | Medium | Phase 2, 3 |
| 5 | AI Discoverability (GEO) | Mostly Completed | High | Medium | Phase 4 |
| 6 | Answer Engine Optimization (AEO) | Not Started | High | Medium | Phase 4, 13 |
| 7 | Accessibility | Mostly Completed | Critical | Medium | Open Decision |
| 8 | Performance Optimization | Not Started | Critical | Large | Open Decision |
| 9 | Core Web Vitals | Not Started | Critical | Medium | Phase 8 |
| 10 | Semantic HTML | **Completed** | High | Medium | Open Decision |
| 11 | Internal Linking | Not Started | Medium | Small | Phase 13 |
| 12 | Navigation | **Completed** | Medium | Small | Phase 10 |
| 13 | Content Improvements | Not Started | High | Large | Open Decision |
| 14 | Image Optimization | Not Started | Critical | Medium | None |
| 15 | Forms | Mostly Completed | High | Small | Phase 7 |
| 16 | Local SEO | Not Started | High | Small | Phase 4 |
| 17 | Analytics | Not Started | High | Small | Manual: GA4/GSC access |
| 18 | Security | **Completed** | High | Small | None |
| 19 | Testing | Not Started | Medium | Medium | Phases 2–15 |
| 20 | Deployment Readiness | Not Started | Critical | Small | Phase 18 |
| 21 | Post-Deployment Checklist | Not Started | High | Small | Phase 20, Manual actions |

---

## Phases

### Phase 1 — Project Audit
**Status:** Completed · **Priority:** Critical · **Complexity:** Medium · **Dependencies:** None
**Files affected:** None (read-only audit)
**Notes:** This audit. See "Current Audit" above and Progress Log entry 2026-08-07.

---

### Phase 2 — Technical SEO
**Status:** **Completed (2026-08-07)** · **Priority:** Critical · **Complexity:** Medium · **Dependencies:** Phase 1, Open Decision
**Files expected to change:** `index.html`, `about.html`, `book.html`, `contact.html`, `fleet.html`, `robots.txt`, `sitemap.xml`, `vercel.json` (removed), `.htaccess` (removed), `api/mailer.js` (removed), `partials/*` (new), `scripts/build.js` (new)

**Task: Fix canonical/OG/JSON-LD domain mismatch**
- Status: **Completed (2026-08-07)** · Priority: Critical
- Description: Replaced every `chaliko-ssml.vercel.app` reference (canonical tags, `og:url`, `og:image`, `twitter:image`, JSON-LD `@id`/`url`/`image`) with `https://chaliko.com` across all 5 pages.
- Why it matters: Search engines were receiving conflicting signals about which domain is authoritative, which can split ranking signals or cause the wrong domain to be indexed.
- Files affected: `index.html`, `about.html`, `book.html`, `contact.html`, `fleet.html`
- Validation steps: `grep -r "chaliko-ssml" *.html` returns nothing (confirmed). Still outstanding: Google Rich Results Test pass once deployed.
- Estimated effort: Small
- Implementation notes: Done as part of the Vercel decommission request, since the leftover URLs pointed at Vercel infrastructure that no longer exists (account deleted).

**Task: Retire dead hosting configuration**
- Status: **Mostly Completed (2026-08-07)** · Priority: High
- Description: Removed `vercel.json` and `api/mailer.js` entirely (Vercel account was deleted by the user — this is a full decommission, not an archive). Removed the now-unused `resend` npm dependency from `package.json`/`package-lock.json` (`src/worker.js` calls the Resend REST API directly via `fetch`, confirmed unaffected). Removed the `.vercel` line from `.gitignore` and the `api`/`vercel.json` lines from `.assetsignore` (both referenced paths that no longer exist). `.htaccess` was **not** removed yet — still present, still dead weight, tracked as a remaining task below.
- Why it matters: Dead config is a maintenance trap; leaving Vercel references live after the account was deleted risked broken canonical/OG URLs pointing at a domain that would start 404ing or getting reassigned to someone else.
- Files affected: `vercel.json` (deleted), `api/mailer.js` (deleted), `api/` directory (removed, now empty), `.gitignore`, `.assetsignore`, `package.json`, `package-lock.json`
- Validation steps: `grep -ril vercel .` (excluding `node_modules`, `.git`, `plan.md`) returns nothing — confirmed clean. `wrangler.jsonc`/`src/worker.js` untouched and still self-sufficient for deploy.
- Estimated effort: Small

**Task: Remove `.htaccess` (Apache rewrite rules, no effect on Cloudflare Workers)**
- Status: **Completed (2026-08-07)** · Priority: Medium
- Description: `.htaccess` was Apache-specific and had no effect on the Cloudflare Workers deploy target.
- Files affected: `.htaccess` (deleted)
- Estimated effort: Small

**Task: Remove `gorental-doc/` from the repository**
- Status: **Completed (2026-08-07)** · Priority: Medium
- Description: Deleted the tracked ThemeForest template documentation/demo bundle (14MB) — it was not part of the product.
- Why it matters: Reduces repo bloat, removes a standing risk of accidental public exposure if `.assetsignore` or the host ever changes, avoids any thin/irrelevant content ever being crawlable.
- Files affected: `gorental-doc/` (deleted), `.assetsignore` (removed the now-unnecessary exclusion line)
- Validation steps: `git status` clean; site verified rendering correctly afterward (see Progress Log).
- Estimated effort: Small

**Task: Repository dead-weight sweep — unused theme assets, JS/CSS plugins, OS junk files**
- Status: **Completed (2026-08-07)** · Priority: Medium
- Description: Full audit of every asset actually referenced by the 5 real HTML pages, `assets/css/style.css`, `assets/css/site-custom.css`, and `assets/js/main.js`, cross-checked against every file on disk. Removed everything with zero live references: unused theme image categories left over from the original multi-purpose template (`blog/`, `portfolio/` — including a stray `.mp4`/`.webm`, `shop/`, `team/`, `pricing/`, `gallery/`, `faq/`, `counter/`, `video/`), unused JS plugins never `<script src>`'d by any real page (`aos.js`, `gsap.min.js`, `hover-revel.js`, `jquery-slideNav.js`, `plugins.js`, `scrolltigger.js` [a typo-duplicate of the actually-used `scroll-trigger.js`], `swip-img.js`, `text-plugins.js`, `jquery.nav.js`, `jqueryui.js` [236KB, distinct from the actually-used `jquery-ui.js`], `sal.min.js`, `split-type.js`, `twinmax.js`), unused CSS (`aos.css`, `fontawesome.css` [488KB — confirmed redundant: `plugins.css` already bundles the identical `@font-face` rules Font Awesome needs], `hover-revel.css`, `timepickers.min.css`, `unicons.css`, `animate.css`), and committed OS junk (`.DS_Store` ×7, `Thumbs.db` ×3, now also gitignored going forward).
- Why it matters: ~43MB removed from the repository. None of it was reachable by any real page, so this has zero effect on the live site but meaningfully shrinks the Cloudflare Workers deploy artifact, repo clone size, and the surface area anyone has to reason about when making future changes.
- Files affected: see above; also `.gitignore` (added `.DS_Store`/`Thumbs.db`), `.assetsignore` (dropped the now-nonexistent `gorental-doc`/`.htaccess` lines)
- Validation steps: Ran a local static-file preview server and checked all 5 pages (`index`, `about`, `book`, `contact`, `fleet`) — every network request returned 200/304, zero 404s, zero console errors, visual screenshot confirmed correct rendering.
- Estimated effort: Medium
- Implementation notes: Two things were verified *not* to be dead weight despite superficially looking like it: `Font Awesome` webfont files (`assets/fonts/fa-*`) are actively used sitewide via `fa-brands`/`fa-solid`/`fa-regular`/`fa-light` classes — kept. The `fa-duotone-900` font family is declared in `plugins.css` but genuinely never used by any page (confirmed via network trace — the browser never fetched it); left in place since removing it means editing the 704KB `plugins.css` `@font-face` block, which is properly a Phase 8 (icon subsetting) task, not a blind-deletion one.

**Task: Resolve the templating/duplication architecture (Open Decision)**
- Status: **Completed (2026-08-07)** · Priority: High
- Description: User chose Option A. Built a small dependency-free Node build system:
  - `partials/head.html`, `partials/header.html`, `partials/footer.html`, `partials/scripts.html` are now the single source of truth for everything that was previously hand-duplicated across all 5 pages.
  - Each of the 5 HTML files now contains `<!-- BUILD:HEAD -->`, `<!-- BUILD:HEADER -->`, `<!-- BUILD:FOOTER -->`, `<!-- BUILD:SCRIPTS -->` marker pairs. `scripts/build.js` renders the partials (with per-page tokens: title, description, canonical URL, active nav item, header-inner class, whether the page needs `contact-form.js`/`isotope.js`) and writes the result back between the markers. Pages stay fully-formed, readable HTML — nothing is a fragment — so opening any of the 5 files still shows complete, real markup, just with those four regions machine-generated.
  - `npm run build` runs it locally; `wrangler.jsonc` now has a `build.command: "npm run build"` hook so Cloudflare's automatic git-triggered deploy runs it too — no change to the user's existing "commit and push" workflow.
  - The 3 duplicated inline `<style>` blocks (and fleet.html's page-specific filter/sticky-header CSS, which had been appended into the same block) are gone from every page's `<head>` entirely — consolidated into `assets/css/site-custom.css`, clearly commented.
  - Fixed a latent bug found during the consolidation: `about.html`'s active nav item had accidentally inherited a `main-menu-ls` styling class that belongs on "Contact" (drift from hand-duplication) — now correctly and consistently on Contact everywhere, driven from one place.
- Why it matters: Phases 3 (Metadata) and 4 (Structured Data) — next up — both would otherwise mean editing the same shared block 5 times each. Now it's one partial edit + `npm run build`.
- Files affected: `index.html`, `about.html`, `book.html`, `contact.html`, `fleet.html` (all reduced substantially — e.g. `about.html` 770→646 lines, `fleet.html` 1153→879 lines), `assets/css/site-custom.css` (+288 lines, consolidated), new `partials/head.html`, `partials/header.html`, `partials/footer.html`, `partials/scripts.html`, new `scripts/build.js`, `package.json` (added `build` script), `wrangler.jsonc` (added `build.command`), `.assetsignore` (excluded `partials/` and `scripts/` from the served asset bundle — they're build-time only)
- Validation steps: Ran `npm run build` twice in a row to confirm idempotency (identical line counts, no drift). Verified all 5 pages in a local preview server — zero console errors, zero 404s, screenshots visually identical to pre-change baseline on both desktop and mobile viewports, and specifically exercised the mobile hamburger menu (door-swing sidebar) to confirm the restructured markup didn't break its JS hooks (`#menu-btn`, `#side-bar`, `.show`/`menu-open` classes all intact).
- Estimated effort: Medium
- Implementation notes: For future edits — change shared header/footer/script-list content in `partials/*.html` (or per-page metadata in the `PAGES` array in `scripts/build.js`), then run `npm run build`. Do not hand-edit content between `<!-- BUILD:* -->` markers directly in the page files; the next build overwrites it.

**Task: Rebuild `sitemap.xml` with correct domain and automation notes**
- Status: **Completed (2026-08-07)** · Priority: Medium
- Description: Confirmed all 5 URLs already used `chaliko.com` (this file was correct from the start — the bug was only in the per-page canonical/OG/JSON-LD tags, fixed earlier). Refreshed all `lastmod` values to 2026-08-07 to reflect today's changes.
- Files affected: `sitemap.xml`
- Validation steps: Sitemap validates against the sitemaps.org schema. Submission to Google Search Console / Bing Webmaster Tools remains a Phase 21 manual action.
- Estimated effort: Small

---

### Phase 3 — Metadata
**Status:** **Mostly Completed (2026-08-07)** · **Priority:** Critical · **Complexity:** Small · **Dependencies:** Phase 2
**Files expected to change:** All 5 HTML files (via `scripts/build.js` + `partials/head.html`)

**Task: Standardize title tag formula**
- Status: **Completed (2026-08-07)** · Priority: Medium
- Description: Moved from `"Page, Brand"` to a consistent `"Primary Intent Keyword | Brand"` pattern. New titles:
  - Home: `Car Rental in Zambia | Chaliko Car Hire Limited` (48 chars)
  - About: `About Chaliko Car Hire Limited | Car Hire in Zambia` (53 chars)
  - Book: `Book a Car Online in Zambia | Chaliko Car Hire` (48 chars)
  - Contact: `Contact Chaliko Car Hire Limited | Zambia` (42 chars)
  - Fleet: `Our Fleet: Sedans, SUVs, 4x4s & Vans | Chaliko Car Hire` (57 chars)
  Because `og:title`/`twitter:title` are generated from the same `{{TITLE}}` token (Phase 2's templating work), they updated automatically in the same edit.
- Why it matters: Improves CTR from SERPs and gives AI engines a clearer entity/intent signal per page.
- Files affected: `scripts/build.js` (the `PAGES` config — this is now the single place titles live)
- Validation steps: All titles unique, under 60 chars, lead with primary keyword + end with brand. Verified via `npm run build` + browser tab titles across all 5 pages; zero console errors.
- Estimated effort: Small

**Task: Add explicit `robots` meta tags**
- Status: **Completed (2026-08-07)** · Priority: Low
- Description: Added `<meta name="robots" content="index, follow">` to `partials/head.html`, right after the description meta — propagates to all 5 pages from one place.
- Why it matters: Removes ambiguity for crawlers and documents intent for future editors.
- Files affected: `partials/head.html`
- Validation steps: `grep -c 'name="robots"' *.html` returns 1 for all 5 pages.
- Estimated effort: Small

**Task: Fix `og:image`/`twitter:image` to use properly-sized, optimized hero images**
- Status: Not Started (blocked) · Priority: Medium
- Description: Depends on Phase 14 image optimization; ensure social preview images are correctly sized (1200×630 recommended for OG) and compressed. Deliberately deferred rather than done twice — the current `banner/5.jpg` reference works but isn't optimized yet.
- Dependencies: Phase 14
- Estimated effort: Small

---

### Phase 4 — Structured Data
**Status:** **Completed (2026-08-07)** · **Priority:** Critical · **Complexity:** Medium · **Dependencies:** Phase 2, 3
**Files expected to change:** `partials/head.html`, `scripts/build.js`, all 5 HTML files (regenerated)

**Task: Fix and consolidate `AutoRental`/`LocalBusiness` JSON-LD**
- Status: **Completed (2026-08-07)** · Priority: Critical
- Description: `@id`/`url`/`image` were already corrected to `chaliko.com` in Phase 2. Added a `sameAs` array linking the real Facebook and Instagram profiles. `priceRange` intentionally omitted — no pricing is published anywhere on the site, and the user has decided not to pursue publishing it (see below).
- Files affected: `partials/head.html` (single shared block — edited once, applies to all 5 pages)
- Validation steps: All 5 pages' JSON-LD parsed with `JSON.parse` — valid on every page. `sameAs` confirmed present on all 5.
- Estimated effort: Small

**Task: Add `BreadcrumbList` schema**
- Status: **Completed (2026-08-07)** · Priority: Medium
- Description: Added `Home > [Page]` breadcrumb JSON-LD to About, Book, Contact, and Fleet (Home omitted — it's the root, a breadcrumb there is redundant). Implemented via a new `{{EXTRA_JSONLD}}` token in `partials/head.html` and a `breadcrumbJsonLd()` helper in `scripts/build.js`, so each page just declares its breadcrumb trail as data rather than hand-writing JSON-LD markup.
- Files affected: `partials/head.html`, `scripts/build.js`
- Validation steps: Verified valid JSON and correct `@type: BreadcrumbList` on all 4 pages via a Node parse check.
- Estimated effort: Small

**Task: Add per-vehicle structured data**
- Status: **Completed for specs; pricing upgrade won't do (2026-08-07)** · Priority: High
- Description: Added an `ItemList` of 11 `Vehicle` entities to `fleet.html`, using the exact seats/fuel/transmission specs already published in the fleet page's own markup (Toyota Allion, Mark X, Lexus IS250, Honda Fit, Mitsubishi Pajero, Shogun, Fortuner, Hilux, Ford Ranger, Toyota Quantum, Mitsubishi Rosa) — no data invented. Deliberately used schema.org `Vehicle` rather than `Product`/`Offer`, since `Offer` schema expects a `price` and none is published. **User decided (2026-08-07) not to pursue the priced `Product`/`Offer` upgrade** — the `Vehicle` specs schema is the final state for this task, not an interim one.
- Why it matters: Lets AI answer engines extract "what cars does Chaliko rent, how many seats, what fuel/transmission" as structured facts rather than parsing prose — the core GEO win from this phase.
- Files affected: `scripts/build.js` (`VEHICLES` array + `vehicleListJsonLd()`)
- Dependencies: None remaining.
- Validation steps: Valid JSON confirmed; spot-checked first vehicle entry (Toyota Allion — 5 seats, Petrol, Automatic) matches the fleet page exactly.
- Estimated effort: Medium

**Task: Add `FAQPage` schema**
- Status: **Completed (2026-08-07)** · Priority: High
- Description: Originally blocked on Phase 13 FAQ content — but `index.html` already has a real, published 5-question FAQ accordion (booking payment methods, required documents, minimum rental period, fuel policy, cross-border travel), so this was unblocked without waiting on Phase 13. Marked up verbatim via the same `{{EXTRA_JSONLD}}` mechanism.
- Files affected: `scripts/build.js` (`FAQS` array + `faqPageJsonLd()`)
- Dependencies: None (content already existed — Phase 13 dependency turned out to be moot for this specific content)
- Validation steps: Valid JSON confirmed; content cross-checked word-for-word against the visible accordion in `index.html`.
- Estimated effort: Small

---

### Phase 5 — AI Discoverability (GEO)
**Status:** **Mostly Completed (2026-08-07)** · **Priority:** High · **Complexity:** Medium · **Dependencies:** Phase 4

**Task: Add `llms.txt`**
- Status: **Completed (2026-08-07)** · Priority: Medium
- Description: Added a root-level `llms.txt` (served automatically — root files aren't excluded by `.assetsignore`) describing Chaliko's business, service area, hours, contact, full fleet list, and the site's existing FAQ content in plain, LLM-friendly Markdown, per the llmstxt.org convention. Also added a comment pointer to it from `robots.txt` (`# llms.txt: https://chaliko.com/llms.txt`), a convention some crawlers/engines look for. Included an explicit "Notes for AI assistants" section stating no reviews/ratings and no pricing are published, specifically to prevent an LLM from hallucinating a rating or price that doesn't exist on the site.
- Why it matters: `llms.txt` is the emerging convention AI answer/generative engines look for to get a concise, authoritative summary of a site instead of having to parse full HTML — directly supports the GEO goal.
- Files affected: new `llms.txt`, `robots.txt`
- Validation steps: Verified `/llms.txt` serves correctly (200, correct content) via a local preview server; confirmed every fact in it (phone, address, hours, email, WhatsApp, fleet specs, FAQ text) matches the live JSON-LD and visible page content word-for-word/number-for-number.
- Estimated effort: Small

**Task: Ensure factual consistency across all machine-readable surfaces**
- Status: **Mostly Completed (2026-08-07)** · Priority: High
- Description: Cross-checked phone, address, hours, service-area, email, and WhatsApp facts across JSON-LD, visible page text (all 5 pages), and the new `llms.txt`. Found and fixed one real gap: the shared JSON-LD `telephone` field only listed the primary number (`+260979517732`), while every page's visible footer/contact block also publishes a second, real number (`+260965517732`, the same one used for WhatsApp) — the JSON-LD just wasn't reflecting data already live on the site. Changed `telephone` from a single string to a two-item array (schema.org's `telephone` property accepts multiple values) in `partials/head.html`, so it now matches the visible content exactly. Everything else (address, hours `Mon–Sat 7:00 AM–7:00 PM`/Sunday closed, email, WhatsApp number, service-area cities, social links) was already fully consistent — no other discrepancies found.
- Why it matters: AI engines and rich-results parsers cross-reference structured data against visible page text for confidence; any mismatch (even a merely-incomplete field, not a wrong one) weakens that signal.
- Files affected: `partials/head.html`, all 5 HTML files (regenerated via `npm run build`)
- Dependencies: The Google Business Profile cross-check portion remains blocked on Manual Action (Phase 21) — GBP hasn't been claimed yet, so there's nothing to cross-check against there yet.
- Validation steps: All 5 pages' JSON-LD re-validated as parseable JSON after the change (`node -e` parse check, zero errors). Grepped every phone/address/hours/email/WhatsApp occurrence across all 5 pages and confirmed they agree with the JSON-LD and `llms.txt`. Local preview server: zero console errors on reload.
- Estimated effort: Small

**Task: Structure fleet/pricing content for extraction**
- Status: Not Started · Priority: High
- Description: Present vehicle facts (seats, fuel, transmission, category) in clean, consistent HTML tables/lists in addition to structured data, since generative engines often synthesize from both rendered text and schema.
- Dependencies: Phase 13 content work
- Estimated effort: Medium

---

### Phase 6 — Answer Engine Optimization (AEO)
**Status:** Not Started · **Priority:** High · **Complexity:** Medium · **Dependencies:** Phase 4, 13

**Task: Build an FAQ section answering real customer questions**
- Status: Not Started · Priority: High
- Description: Draft 8–15 Q&A pairs covering booking requirements, driver's licence rules, insurance, professional driver option, payment methods, service areas, and cancellation policy.
- Dependencies: Manual Action — business must supply accurate policy answers (insurance terms, cancellation policy, accepted payment methods, licence requirements) — do not fabricate.
- Estimated effort: Medium

**Task: Format content for featured-snippet extraction**
- Status: Not Started · Priority: Medium
- Description: Use direct-answer opening sentences, ordered/unordered lists, and clear H2/H3 question-phrased headings where natural.
- Estimated effort: Small

---

### Phase 7 — Accessibility
**Status:** **Mostly Completed (2026-08-07)** · **Priority:** Critical · **Complexity:** Medium · **Dependencies:** Open Decision

**Task: Add `<main>` landmark and skip-to-content link**
- Status: **Completed (2026-08-07)** · Priority: Critical
- Description: Wrapped each page's real content (between the header and footer `BUILD:*` regions) in `<main id="main-content">` on all 5 pages — hand-edited per file since the wrapped content differs per page and isn't part of a shared partial. Added `<a href="#main-content" class="skip-link">Skip to main content</a>` as the very first element inside `<body>` on all 5 pages, styled in `assets/css/site-custom.css` (off-screen until focused, then slides into view).
- Files affected: `index.html`, `about.html`, `book.html`, `contact.html`, `fleet.html`, `assets/css/site-custom.css`
- Validation steps: Verified via browser automation that the skip link is the first focusable element on the page and that exactly one balanced `<main>`/`</main>` pair exists on every page (Node-script tag-balance check). Zero console errors on reload.
- Estimated effort: Small

**Task: Fix form label association**
- Status: **Completed (2026-08-07)** · Priority: Critical
- Description: `book.html` — added `id`/`for` pairs to all 10 remaining fields (vehicle, pickup_date, return_date, pickup_location, dropoff_location, full_name, phone, email, licence_no, notes); `add_driver` and `email`'s `id` already existed. `contact.html` had **zero** `<label>` elements at all (relied on placeholder text + icons only) — added visually-hidden `<label for="...">` (using Bootstrap's built-in `.visually-hidden` utility, already present in the vendor bundle) for all 4 fields (name, email, phone, message), preserving the existing icon-only visual design.
- Files affected: `book.html`, `contact.html`
- Validation steps: Scripted DOM check (`document.querySelector('label[for="ID"]')` for every non-hidden form field) confirms 100% label coverage on both forms. Zero console errors.
- Estimated effort: Small

**Task: Verify color contrast**
- Status: **Mostly Completed (2026-08-07)** · Priority: High
- Description: Computed WCAG contrast ratios (relative-luminance formula) for every text/background color pair actually used sitewide, not just the two colors flagged in the original audit. Found and fixed two real, verified small-text failures: (1) `#888` secondary/caption text on white (3.54:1, needs 4.5:1) — replaced with `#767676` (4.54:1) across 8 occurrences in `book.html`/`contact.html`; (2) brand orange `#FF3600` used as small (12–16px) text color in `book.html` (Step 1/Step 2 section labels, the "01/02/03" requirement badges — 3.63:1/3.34:1, needs 4.5:1) — replaced with a darker in-family shade `#CC2B00` (5.37:1/4.94:1) for those specific text instances only. Icons and borders using `#FF3600` were left untouched — non-text elements only need 3:1 (Non-text Contrast, SC 1.4.11) and already pass at 3.63:1. Confirmed the audit's original concern — orange text directly on the dark-green backgrounds (`#143628`/`#111827`) — doesn't actually occur anywhere in the live markup (searched all 5 pages; no such pairing exists in practice).
- Files affected: `book.html`, `contact.html`
- **Not fixed — flagged for a decision:** White text on solid brand-orange background is used as the *persistent* (not just hover) style on a few elements — most notably `book.html`'s "Submit Booking Request" button and the "Need Help Booking?" sidebar card. Measured contrast is 3.63:1, which fails the 4.5:1 normal-text threshold (the text is 18px/700, just under the 18.66px cutoff that would qualify it as "large text" needing only 3:1). The site's outline-style `.rts__btn.btn-primary` buttons elsewhere are unaffected — their resting state is dark-gray text on transparent/white (7.46:1, passes easily) and only *hover* (not focus) briefly shows white-on-orange, which is a much smaller concern. Fixing the persistent cases properly means darkening the brand orange itself for button backgrounds, which is a brand-color decision — flagged rather than changed unilaterally. See Known Issues.
- Estimated effort: Small

**Task: Keyboard and screen-reader interaction pass**
- Status: **Completed (2026-08-07)** · Priority: High
- Description: Found and fixed a real, confirmed keyboard-accessibility bug in the mobile hamburger menu: `#menu-btn` was a `<div>` with only a `click` handler (not focusable, not operable via Enter/Space, no accessible name) — converted to a real `<button type="button">` with `aria-label="Open menu"`, `aria-controls="side-bar"`, `aria-expanded`. The `#side-bar` mobile panel itself stayed in the tab order at all times even while visually off-screen (`right:-100%`, not `visibility:hidden`) — meaning keyboard users (even on desktop, where the hamburger trigger is hidden entirely) would tab through ~9 invisible menu links before reaching real content. Fixed by adding `inert aria-hidden="true"` by default on `#side-bar`, toggled off/on together with the existing `.show` class in `assets/js/main.js`'s `sideMenu()` function. Also added: Escape-to-close, focus moves to the panel's close button on open and returns to the trigger on close, and wrapped the desktop nav in `<nav aria-label="Primary">` (it had no landmark at all previously) with `aria-label="Mobile"` added to the existing mobile `<nav>`. Investigated the separate `.search-input-area` overlay (also always in the DOM) — confirmed it correctly uses `visibility:hidden` by default (which *does* remove it from the tab order, unlike the mobile menu's approach), and further confirmed it has **no trigger anywhere** in the current header/footer markup, so it's unreachable by mouse or keyboard alike — left as-is and flagged as dead code rather than "fixed" (see Technical Debt).
- Files affected: `partials/header.html`, `partials/footer.html`, `assets/js/main.js`, `assets/css/site-custom.css`
- Validation steps: Verified end-to-end via browser automation on a mobile viewport: clicking the trigger opens the menu (`show` class added, `inert` removed, `aria-expanded="true"`, focus moves to the close button); pressing Escape closes it (`inert` restored, `aria-expanded="false"`, focus returns to the trigger). Zero console errors across all 5 pages.
- Estimated effort: Medium

---

### Phase 8 — Performance Optimization
**Status:** Not Started · **Priority:** Critical · **Complexity:** Large · **Dependencies:** Open Decision

**Task: Minify and consolidate CSS**
- Status: Not Started · Priority: Critical
- Description: Minify the 23,788-line `assets/css/style.css`, audit `assets/css/plugins/plugins.css` (704KB) for unused plugin CSS, extract the duplicated per-page inline `<style>` blocks into `site-custom.css`.
- Dependencies: Open Decision (Option A makes this a build step)
- Estimated effort: Medium

**Task: Audit and trim the JS plugin stack**
- Status: Not Started · Priority: High
- Description: Determine which of the ~15 loaded plugins (GSAP, ScrollTrigger, Swiper, Isotope, Magnific Popup, Jarallax, SplitText, MetisMenu, Waypoint, jQuery UI, etc.) are actually used per page; remove unused ones; add `defer` to the rest.
- Estimated effort: Large

**Task: Subset/replace Font Awesome**
- Status: Not Started · Priority: High
- Description: Reduce the 15MB, all-weight Font Awesome bundle to only the icons and weights actually used (or replace with inline SVGs for the small icon set in use).
- Estimated effort: Medium

**Task: Add resource hints**
- Status: Not Started · Priority: Low
- Description: Add `preconnect`/`dns-prefetch` for the Resend API and any embedded Google Maps origin; `preload` for the LCP hero image/font.
- Estimated effort: Small

---

### Phase 9 — Core Web Vitals
**Status:** Not Started · **Priority:** Critical · **Complexity:** Medium · **Dependencies:** Phase 8

**Task: Fix LCP via hero image optimization**
- Status: Not Started · Priority: Critical
- Dependencies: Phase 14
- Estimated effort: Medium

**Task: Fix CLS via explicit image dimensions**
- Status: Not Started · Priority: Critical
- Description: Add `width`/`height` (or `aspect-ratio` CSS) to all images to reserve layout space before load.
- Estimated effort: Medium

**Task: Verify INP after JS stack trim**
- Status: Not Started · Priority: High
- Dependencies: Phase 8 JS audit
- Estimated effort: Small

---

### Phase 10 — Semantic HTML
**Status:** **Completed (2026-08-07)** · **Priority:** High · **Complexity:** Medium · **Dependencies:** Open Decision

**Task: Introduce proper landmark structure**
- Status: **Completed (2026-08-07)** · Priority: High
- Description: `<main>` added on all 5 pages (see Phase 7). Desktop nav wrapped in `<nav aria-label="Primary">` (was a bare `<div>` with no landmark at all); mobile nav's existing `<nav>` got `aria-label="Mobile"` to disambiguate the two. Converted the repeated, self-contained card patterns to `<article>`: all 11 vehicle cards in `fleet.html`'s grid, the 3 vehicle-preview cards in `index.html`'s homepage carousel, and the 3 testimonial cards in `index.html` (17 conversions total). Used a small depth-tracking script (not a blind find/replace) to correctly match each opening `<div class="...">` with its true corresponding closing tag, since several of these blocks contain nested `<div>`s.
- Files affected: `partials/header.html`, `index.html`, `fleet.html`
- Validation steps: Verified balanced `<article>` open/close counts (6 in `index.html`, 11 in `fleet.html`) via a Node script. Visual screenshot check confirmed the fleet grid and homepage carousel render identically to before. Zero console errors.
- Estimated effort: Medium

**Task: Fix heading hierarchy**
- Status: **Completed (2026-08-07)** · Priority: Medium
- Description: Audited the real (comment-stripped, since several sections are HTML-commented-out leftovers) heading sequence on all 5 pages, not just counts. Found and fixed 3 genuine skips: (1) `book.html` — 5 headings (Step 1, Step 2, "Why Book With Chaliko?", "Need Help Booking?", "Hire Requirements") were `<h4>` directly after the page's only `<h2>` with no intervening `<h3>` — bumped all 5 to `<h3>`. (2) `fleet.html` — the page jumped straight from `<h1>` to 11× `<h3>` vehicle-card titles with no `<h2>` in between; added a `<h2 class="visually-hidden">Available Vehicles</h2>` immediately before the grid (present for the accessibility tree/outline, no visual change) and bumped the 3 "Hire Requirements" sub-heading `<h4>`s to `<h3>`. (3) `partials/footer.html` — the shared footer's "Get In Touch" heading was `<h4>`, which caused a skip on **every page** (each page's body content ends at `<h2>` or `<h3>` before the footer starts fresh) — bumped to `<h2>` (footer is a distinct landmark starting its own heading sequence, and `<h2>` is never a skip regardless of what precedes it). Verified `index.html`, `about.html`, and `contact.html` had no skips in their own body content already.
- Files affected: `book.html`, `fleet.html`, `partials/footer.html`
- Validation steps: Re-ran the comment-stripped heading-order audit after the fixes — no remaining skips on any of the 5 pages. Visual check confirmed no styling regressions (heading appearance is controlled by inline `style`/class, not tag name).
- Estimated effort: Small

---

### Phase 11 — Internal Linking
**Status:** Not Started · **Priority:** Medium · **Complexity:** Small · **Dependencies:** Phase 13

**Task: Link fleet vehicles to FAQ/booking context**
- Status: Not Started · Priority: Medium
- Description: Once per-vehicle content/FAQ content exists (Phase 6/13), add contextual internal links between fleet listings, booking, and relevant FAQ answers.
- Estimated effort: Small

---

### Phase 12 — Navigation
**Status:** **Completed (2026-08-07)** · **Priority:** Medium · **Complexity:** Small · **Dependencies:** Phase 10

**Task: Add `aria-current="page"` to active nav item**
- Status: **Completed (2026-08-07)** · Priority: Low
- Description: Added to `renderNavItems()` in `scripts/build.js` — the desktop nav link matching the page's `activeNav` token now gets `aria-current="page"` alongside its existing `.active` class. The mobile nav (in `partials/footer.html`) doesn't track active-page state at all (it's a single static partial shared byte-for-byte across all 5 pages, unlike the desktop nav which is templated per page) — making it page-aware would mean templating the footer too, which is a larger change than this task calls for; left as a known gap, not urgent since the desktop nav (and the page's own `<title>`/`<h1>`) already communicate current location.
- Files affected: `scripts/build.js`
- Validation steps: Verified via `npm run build` that the active link on each of the 5 pages carries `aria-current="page"` and no other link does.
- Estimated effort: Small

**Task: Verify mobile menu accessibility**
- Status: **Completed (2026-08-07)** · Priority: Medium
- Description: Same work as the Phase 7 keyboard/screen-reader task (mobile menu `inert`/`aria-hidden`/`aria-expanded` toggling, Escape-to-close, focus management, real `<button>` trigger) — tracked once there, executed once, linked here since it directly satisfies this task too.
- Dependencies: Phase 7 (done)
- Estimated effort: Small

---

### Phase 13 — Content Improvements
**Status:** Not Started · **Priority:** High · **Complexity:** Large · **Dependencies:** Open Decision

**Task: Write FAQ content**
- Status: Not Started · Priority: High
- Dependencies: Manual Action — business must supply policy answers.
- Estimated effort: Medium

**Task: Expand fleet page with per-vehicle facts**
- Status: Not Started · Priority: High
- Dependencies: Manual Action — confirm daily rates and specs to publish (currently not on the site).
- Estimated effort: Large

**Task: Consider a lightweight resources/blog section**
- Status: Not Started · Priority: Medium
- Description: Even 3–5 well-written articles ("What documents do I need to hire a car in Zambia?", "Self-drive vs. chauffeur-driven hire", city-specific guides) meaningfully expand both classic SEO surface area and AI-citable content.
- Dependencies: Business decision on ongoing content investment (flagged, not assumed)
- Estimated effort: Large

---

### Phase 14 — Image Optimization
**Status:** Not Started · **Priority:** Critical · **Complexity:** Medium · **Dependencies:** None

**Task: Compress and convert oversized PNGs**
- Status: Not Started · Priority: Critical
- Description: Convert the largest offenders (`cars/quantum.png` 2.4MB, `cars/bg.png` 2.4MB, all of `cars/originals-with-background/*.png` at 1.2–1.5MB each) to compressed WebP/AVIF at appropriate display resolution.
- Why it matters: This single change likely has the largest raw performance impact available in the entire roadmap — 62MB of images on a 5-page site is severe, especially for mobile users in the target market.
- Estimated effort: Medium

**Task: Add `loading="lazy"` to all below-the-fold images**
- Status: Not Started · Priority: Critical
- Description: 0 of 49 images checked on `index.html`/`fleet.html` currently use lazy loading.
- Estimated effort: Small

**Task: Add explicit `width`/`height` to every `<img>`**
- Status: Not Started · Priority: Critical
- Dependencies: shared with Phase 9 CLS task
- Estimated effort: Medium

---

### Phase 15 — Forms
**Status:** Mostly Completed (2026-08-07) · **Priority:** High · **Complexity:** Small · **Dependencies:** Phase 7

**Task: Add spam protection to `/api/mailer`**
- Status: Not Started · Priority: High
- Description: Add a honeypot field and basic rate limiting (Cloudflare Workers supports this natively) to the booking/contact endpoint.
- Files affected: `src/worker.js`, `book.html`, `contact.html`
- Estimated effort: Small

**Task: Fix label association**
- Status: **Completed (2026-08-07)** · Priority: Critical
- Description: Same underlying work as the Phase 7 accessibility task — tracked once, executed once. See Phase 7 for details.
- Estimated effort: Small

---

### Phase 16 — Local SEO
**Status:** Not Started · **Priority:** High · **Complexity:** Small · **Dependencies:** Phase 4

**Task: Claim/verify Google Business Profile**
- Status: Not Started · Priority: High
- Dependencies: Manual Action (Phase 21)
- Estimated effort: Small (setup), ongoing (maintenance)

**Task: Ensure `sameAs` and NAP match Google Business Profile exactly**
- Status: Not Started · Priority: High
- Dependencies: Above
- Estimated effort: Small

---

### Phase 17 — Analytics
**Status:** Not Started · **Priority:** High · **Complexity:** Small · **Dependencies:** Manual Action — GA4 property / access

**Task: Install GA4**
- Status: Not Started · Priority: High
- Dependencies: Manual Action — business must provide or create a GA4 property; Claude cannot create Google accounts.
- Estimated effort: Small

**Task: Track key conversion events**
- Status: Not Started · Priority: Medium
- Description: Booking form submit, WhatsApp click, phone click, contact form submit.
- Estimated effort: Small

---

### Phase 18 — Security
**Status:** **Completed (2026-08-07)** · **Priority:** High · **Complexity:** Small · **Dependencies:** None

**Task: Add security headers via the Cloudflare Worker**
- Status: **Completed (2026-08-07)** · Priority: High
- Description: Added a `withSecurityHeaders()` wrapper in `src/worker.js` applied to every response the Worker returns (both `/api/mailer` and all static pages/assets), setting `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`, and a `Content-Security-Policy` (`default-src 'self'`, with `'unsafe-inline'` on `script-src`/`style-src` since the site has genuine inline `<script>`/`onmouseover`/`style=""` usage throughout with no build step to add nonces; `style-src`/`font-src` additionally allow `fonts.googleapis.com`/`fonts.gstatic.com` since `style.css` `@import`s Google Fonts; `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`). **Discovered and fixed a real deployment gap in the process:** Cloudflare's Assets binding serves static-file requests directly, bypassing the Worker's `fetch()` handler entirely by default — so the new headers were only reaching the `/api/mailer` route, not any actual page. Added `"run_worker_first": true` to the `assets` block in `wrangler.jsonc` so the Worker always runs first and can apply headers to every response, falling through to `env.ASSETS.fetch()` for anything that isn't `/api/mailer`.
- Files affected: `src/worker.js`, `wrangler.jsonc`
- Validation steps: Ran the site through `wrangler dev` (not just the static preview server, which doesn't exercise the Worker at all) and confirmed via `curl -I` that all of `/`, `/about`, `/book`, `/contact`, `/fleet`, `/sitemap.xml`, `/robots.txt`, `/llms.txt`, and `/api/mailer` return the full header set. Loaded all 5 pages fresh (cache-busted) through `wrangler dev` in-browser and confirmed zero CSP violations and zero console errors — including the Google Fonts `@import`, GSAP/ScrollTrigger, jQuery, Isotope, and the fleet-page inline filter script, all of which needed to keep working under the new policy. Did not trigger a live form submission (would send a real email via Resend using live credentials) — instead confirmed by code review that `contact-form.js` posts via `$.ajax` to the form's own same-origin `action` (`/api/mailer`), which `connect-src 'self'`/`form-action 'self'` correctly permit.
- Estimated effort: Small

---

### Phase 19 — Testing
**Status:** Not Started · **Priority:** Medium · **Complexity:** Medium · **Dependencies:** Phases 2–15

**Task: Set up Lighthouse CI or manual Lighthouse gate**
- Status: Not Started · Priority: Medium
- Estimated effort: Medium

**Task: Broken link + structured data validation pass**
- Status: Not Started · Priority: Medium
- Estimated effort: Small

---

### Phase 20 — Deployment Readiness
**Status:** Not Started · **Priority:** Critical · **Complexity:** Small · **Dependencies:** Phase 18

**Task: Final dead-config cleanup confirmation**
- Status: Not Started · Priority: Critical
- Description: Confirm `vercel.json`/`api/mailer.js`/`.htaccess` removal (Phase 2) didn't break anything and that `wrangler.jsonc` deploy is fully self-sufficient.
- Estimated effort: Small

---

### Phase 21 — Post-Deployment Checklist
**Status:** Not Started · **Priority:** High · **Complexity:** Small · **Dependencies:** Phase 20, Manual Actions

**Task: Submit sitemap to Google Search Console and Bing Webmaster Tools**
- Status: Not Started · Priority: High
- Dependencies: Manual Action
- Estimated effort: Small

**Task: Monitor Rich Results and Core Web Vitals reports**
- Status: Not Started · Priority: Medium
- Dependencies: Manual Action — GSC access
- Estimated effort: Small (ongoing)

---

## Progress Log

### 2026-08-07 — Phase 1: Project Audit
- **Summary:** Performed a full, verified codebase audit (no code changes). Inspected all 5 HTML pages, all config files (`vercel.json`, `wrangler.jsonc`, `.htaccess`, `robots.txt`, `sitemap.xml`, `site.webmanifest`, `.assetsignore`), both mailer implementations (`src/worker.js`, `api/mailer.js`), asset directory sizes/formats, structured data, meta tags, accessibility markers, and security posture. Created this `plan.md`.
- **Files changed:** `plan.md` (new)
- **Reason:** User requested a full audit and roadmap before any implementation, per their process requirements.
- **Result:** 20 verified weaknesses documented across SEO, performance, accessibility, security, content, and architecture. User confirmed two critical open questions: production domain (`chaliko.com`) and authoritative host (Cloudflare Workers).
- **Outstanding issues:** Open Decision on templating architecture (Option A vs B) still needs user approval before Phase 2 can fully execute. Several Manual Actions (business policy answers, vehicle pricing, GA4/GSC/Bing access) block parts of Phases 4, 6, 13, 16, 17, 21.

### 2026-08-07 — Phase 2 (partial): Vercel fully decommissioned
- **Summary:** User deleted their Vercel account and asked to remove the connection entirely. Deleted `vercel.json` and `api/mailer.js` (and the now-empty `api/` directory). Removed the unused `resend` npm dependency from `package.json`/`package-lock.json` — confirmed safe, since `src/worker.js` (the live Cloudflare mailer) calls the Resend REST API directly via `fetch`, not the npm SDK. Removed the `.vercel` line from `.gitignore` and the stale `api`/`vercel.json` lines from `.assetsignore`. Fixed all `chaliko-ssml.vercel.app` references (canonical, `og:url`, `og:image`, `twitter:image`, JSON-LD `@id`/`url`/`image`) to `https://chaliko.com` across all 5 HTML pages, since those tags would otherwise still point at Vercel infrastructure that no longer exists.
- **Files changed:** `vercel.json` (deleted), `api/mailer.js` (deleted), `.gitignore`, `.assetsignore`, `package.json`, `package-lock.json`, `index.html`, `about.html`, `book.html`, `contact.html`, `fleet.html`
- **Reason:** Direct user request ("remove the connection to vercel... I have deleted my account"), combined with the Phase 2 domain-mismatch fix already on the roadmap — doing both together avoided leaving dead links to a deleted Vercel account live in production metadata.
- **Result:** Zero remaining "vercel" references anywhere in the repo except this plan's own history. `wrangler.jsonc`/`src/worker.js` (the actual deploy path) untouched and unaffected. Changes are made locally and not yet committed/pushed — see note below.
- **Outstanding issues:** `.htaccess` (Apache rewrite rules, irrelevant to Cloudflare Workers) is the last remaining piece of dead hosting config — not removed yet, tracked as a new Phase 2 task. Nothing has been committed to git yet; these changes are sitting as uncommitted working-tree modifications.

### 2026-08-07 — Phase 2 (continued): Full dead-weight sweep — `.htaccess`, `gorental-doc/`, unused theme assets, OS junk
- **Summary:** User asked to "remove everything unnecessary." Removed `.htaccess` (dead Apache config). Deleted `gorental-doc/` (14MB tracked ThemeForest template documentation/demo bundle, not part of the product). Performed a full reference audit — checked every file on disk against actual usage in the 5 real HTML pages, `style.css`, `site-custom.css`, and `main.js` — and removed every asset with zero live references: unused theme image categories (blog, portfolio, shop, team, pricing, gallery, faq, counter, video — leftovers from the original multi-purpose ThemeForest template), unused JS plugins (13 files, including a 236KB duplicate jQuery UI build and a typo'd duplicate of the in-use ScrollTrigger plugin), unused CSS (6 files, including a 488KB redundant Font Awesome stylesheet — the icons it defines are already bundled inside `plugins.css`), and committed `.DS_Store`/`Thumbs.db` OS junk (now gitignored so they can't be re-committed). Total: ~43MB removed.
- **Files changed:** `.htaccess` (deleted), `gorental-doc/` (deleted), `assets/images/{blog,portfolio,shop,team,pricing,gallery,faq,counter,video}/` (deleted), 13 unused JS files (deleted), 6 unused CSS files (deleted), all `.DS_Store`/`Thumbs.db` (deleted), `.gitignore`, `.assetsignore`
- **Reason:** Direct user request to strip unnecessary weight from the repository before starting the SEO/GEO implementation phases, so those phases build on a clean baseline rather than fighting leftover template cruft.
- **Result:** Verified via a local preview server across all 5 pages — every request returned 200/304, zero 404s, zero console errors, visual spot-check confirmed correct rendering. Nothing user-facing changed; this was pure dead-code/dead-asset removal.
- **Outstanding issues:** `fa-duotone-900` Font Awesome family is declared in `plugins.css` but never actually used or fetched by any page — left in place, correctly belongs to the Phase 8 icon-subsetting task rather than this cleanup pass.

### 2026-08-07 — Committed and deployed
- **Summary:** User committed both the Vercel-decommission batch and the dead-weight sweep (commit `3f36d94`), and confirmed Cloudflare has redeployed with the update.
- **Result:** Working tree clean, `main` up to date with `origin/main`. This is now the live, deployed baseline going forward.

### 2026-08-07 — Phase 2 completed: templating architecture (Option A) + sitemap refresh
- **Summary:** User approved Option A for the templating Open Decision. Built `partials/{head,header,footer,scripts}.html` + `scripts/build.js`, a dependency-free Node script that renders those partials (with per-page title/description/canonical-URL/active-nav/header-class/script-flag tokens) into `<!-- BUILD:* -->` marker regions in all 5 HTML pages. Removed the 3 duplicated inline `<style>` blocks (plus fleet.html's page-specific filter/sticky-header CSS that had been appended into the same block) from every page and consolidated them into `assets/css/site-custom.css`. Wired `npm run build` into `wrangler.jsonc` via `build.command` so Cloudflare's existing git-triggered auto-deploy runs it automatically — the user's "commit and push" workflow doesn't change. Fixed a latent drift bug found in the process: `about.html`'s active nav item had incorrectly inherited a `main-menu-ls` class that belongs on "Contact"; now consistently correct everywhere since it's driven from one place. Also completed the sitemap.xml task (already had the correct domain; refreshed all `lastmod` dates to today).
- **Files changed:** `index.html`, `about.html`, `book.html`, `contact.html`, `fleet.html` (all substantially shortened), `assets/css/site-custom.css`, new `partials/head.html`, `partials/header.html`, `partials/footer.html`, `partials/scripts.html`, new `scripts/build.js`, `package.json`, `wrangler.jsonc`, `.assetsignore`, `sitemap.xml`
- **Reason:** User said "let's complete the next phase"; Phase 2 was the one still open. The templating decision was a hard blocker flagged in Phase 1's audit — resolving it now (before Phase 3/4 touch the same shared regions) avoids repeating every future metadata/structured-data edit five times.
- **Result:** `npm run build` verified idempotent (ran twice, identical output). All 5 pages checked in a local preview server: zero console errors, zero 404s/network failures, screenshots visually identical to the pre-change baseline on desktop and mobile, mobile hamburger menu (door-swing sidebar) interaction verified working end-to-end. Phase 2 is now fully complete — all of its tasks are done.
- **Outstanding issues:** None for Phase 2. Nothing in this batch has been committed to git yet — awaiting user review before commit, per the established workflow.

### 2026-08-07 — Phase 2 committed; Phase 3 (Metadata) mostly completed
- **Summary:** User confirmed the Phase 2 batch was committed (`30036e5`). Moved on to Phase 3: standardized all 5 page titles to a keyword-first `"Intent | Brand"` formula (see Phase 3 section for exact strings), and added an explicit `<meta name="robots" content="index, follow">` to `partials/head.html`. Both changes were single-place edits (the `PAGES` config in `scripts/build.js`, and the shared head partial) thanks to Phase 2's templating work — no per-page duplication needed. Left the `og:image`/`twitter:image` sizing task deliberately blocked on Phase 14 rather than touching it twice.
- **Files changed:** `scripts/build.js` (title strings), `partials/head.html` (robots meta), all 5 HTML files (regenerated via `npm run build`)
- **Reason:** Phase 3 was next in the roadmap after Phase 2 closed out.
- **Result:** Verified via `npm run build` + browser tab titles across all 5 pages, `og:title` confirmed matching (checked index.html and fleet.html, including correct `&amp;` escaping on Fleet's title), zero console errors on any page.
- **Outstanding issues:** Phase 3's third task (OG/Twitter image sizing) remains blocked on Phase 14. Nothing in this batch has been committed yet.

### 2026-08-07 — Bug fix: broken Instagram icon in header
- **Summary:** User reported the Instagram icon wasn't showing in the header (visible fine in the footer, which uses a Font Awesome glyph instead). Root cause: `assets/images/icon/instagram.svg` — referenced only by the header's social icons, via `partials/header.html`, across all 5 pages — is a corrupted design-tool export. Its 3 luminance masks (rounded-square frame, lens, corner dot) are actually valid, correctly-bounded shapes, but each mask's revealed content was a giant circle positioned almost entirely *outside* the 20×20 viewBox (e.g. one centered at y=39 with a 21px radius) instead of a full-canvas fill rect, so almost nothing rendered. Fixed by replacing each mask's broken circle path with a simple `<rect width="20" height="20" fill="#FF3600"/>`, which correctly reveals just the masked glyph shapes. This restores the designer's actual intended icon rather than substituting a different one, and keeps it visually consistent with the adjacent Facebook icon's circle-outline style.
- **Files changed:** `assets/images/icon/instagram.svg`
- **Reason:** Direct user bug report.
- **Result:** Verified by loading the SVG directly in-browser (renders a clean orange Instagram glyph matching Facebook's style) and rechecking the homepage — zero console errors.
- **Outstanding issues:** `assets/images/icon/instagram-c.svg` has the identical bug (same broken giant-circle-per-mask pattern) but isn't referenced anywhere in the live site, so it was left as-is — flagged below in Technical Debt in case it's ever wired up.

### 2026-08-07 — Phase 4 mostly completed: structured data (sameAs, breadcrumbs, vehicle specs, FAQ)
- **Summary:** User confirmed the icon fix was committed and pushed, then asked for the next phase. Implemented 4 of Phase 4's 5 tasks using only real, already-published data — no fabrication: (1) added a `sameAs` array (Facebook + Instagram) to the shared `AutoRental` JSON-LD; (2) added `BreadcrumbList` schema to About/Book/Contact/Fleet; (3) added an `ItemList` of 11 `Vehicle` entities to `fleet.html` using the exact seats/fuel/transmission specs already on the page (deliberately used `Vehicle` rather than `Product`/`Offer`, since `Offer` schema wants a price and none is published — avoids either a Rich Results validation gap or fabricating a number); (4) added `FAQPage` schema on `index.html` — this was originally listed as blocked on Phase 13, but `index.html` already has a real, live 5-question FAQ accordion, so it was unblocked and shipped now instead of waiting. Extended the build system with a new `{{EXTRA_JSONLD}}` token in `partials/head.html` plus `breadcrumbJsonLd()`, `vehicleListJsonLd()`, and `faqPageJsonLd()` helpers in `scripts/build.js`, so each page just declares data (a breadcrumb trail, or nothing) rather than hand-writing per-page JSON-LD.
- **Files changed:** `partials/head.html`, `scripts/build.js`, all 5 HTML files (regenerated via `npm run build`)
- **Reason:** Phase 4 was next in the roadmap; the FAQ and vehicle-spec content already existing on the site meant two of its tasks didn't actually need to wait on their originally-assumed blockers.
- **Result:** Every JSON-LD block on every page validated as parseable JSON via a Node script (`AutoRental` + the new blocks — `FAQPage` on Home, `BreadcrumbList` on About/Book/Contact/Fleet, plus `ItemList` on Fleet). Spot-checked the Fleet `ItemList`'s first entry against the page's own markup (Toyota Allion — 5 seats, Petrol, Automatic — exact match). All 5 pages checked in a live preview: zero console errors. `npm run build` re-run confirmed byte-identical output (idempotent).
- **Outstanding issues:** `Review`/`AggregateRating` schema remains blocked (Manual Action — needs a real review source from the business). Per-vehicle pricing remains blocked (Manual Action) — the `Vehicle` entities are ready to become priced `Product`/`Offer` entities the moment rates are supplied. Nothing in this batch has been committed yet.

### 2026-08-07 — Footer cleanup: removed placeholder legal links, centered copyright, fixed typo
- **Summary:** User asked to remove the "Privacy Policy"/"Terms of Use" footer links (both were dead `href="#"` placeholders, not real pages), center the copyright line now that it's the only element in that row, and fix a stray double period ("Reserved..").
- **Files changed:** `partials/footer.html` (single shared source — applies to all 5 pages), all 5 HTML files (regenerated via `npm run build`)
- **Reason:** Direct user request.
- **Result:** Verified via `grep` (zero matches for "Privacy Policy"/"Terms of Use" across all 5 built pages) and a computed-style check (`justify-content: center` confirmed on the containing row) and direct text extraction (single "Reserved." confirmed). Zero console errors on reload.
- **Outstanding issues:** None. This was included in the same commit as the Phase 4 structured data batch (`5702676`).

### 2026-08-07 — Phase 4 closed out: dropped Review/AggregateRating and the per-vehicle pricing upgrade
- **Summary:** User declined to pursue customer reviews for now and asked to remove that task completely, and separately said "we are not going to do Per-vehicle structured data." Since the `Vehicle` specs `ItemList` was already live/committed and has real standalone GEO value with no downside, asked the user to clarify scope before deleting shipped code — confirmed they meant dropping the *pending pricing upgrade* (`Product`/`Offer` with rates), not removing the already-shipped specs schema. Updated Phase 4 accordingly: `Review`/`AggregateRating` task removed from the roadmap outright (nothing was ever built, so no code to revert); the per-vehicle structured data task is now marked fully complete with the pricing upgrade explicitly marked "won't do" rather than "blocked." Phase 4 status changed from "Mostly Completed" to **Completed** — everything remaining was either finished or explicitly declined by the user, nothing is genuinely outstanding anymore.
- **Files changed:** `plan.md` only — no code changes, since the live `Vehicle` schema was kept as-is.
- **Reason:** Direct user request to close out Phase 4's two remaining items.
- **Result:** Phase 4 is fully closed. `fleet.html`'s `Vehicle` `ItemList` (specs only, no pricing) remains live and unchanged.
- **Outstanding issues:** None for Phase 4.

### 2026-08-07 — Phase 5 mostly completed: `llms.txt` published, JSON-LD/visible-content consistency pass
- **Summary:** User asked to move to the next phase; Phase 4 was fully closed, so this was Phase 5 (AI Discoverability / GEO). Published a root-level `llms.txt` (Markdown, per the llmstxt.org convention) summarizing the business, service area, hours, contact details, full fleet specs, and the site's existing FAQ content, plus an explicit note telling AI assistants not to infer pricing or reviews since neither is published — a direct hedge against hallucination on exactly the two facts most likely to be guessed wrong. Added a comment pointer to it from `robots.txt`. Then did the factual-consistency cross-check task: compared phone, address, hours, email, WhatsApp, and service-area facts across all 5 pages' JSON-LD, visible content, and the new `llms.txt`. Found one real gap — the shared JSON-LD `telephone` field only had the primary number even though a second real number is published site-wide (same one used for WhatsApp) — and fixed it by making `telephone` a two-item array in `partials/head.html` (schema.org supports multiple values for this field). Everything else checked out already consistent. The third Phase 5 task (structuring fleet/pricing content for extraction) remains correctly blocked on Phase 13 content work, per its original dependency.
- **Files changed:** new `llms.txt`, `robots.txt`, `partials/head.html`, all 5 HTML files (regenerated via `npm run build`)
- **Reason:** Phase 5 was next in the roadmap after Phase 4 closed; both completed tasks had no open dependencies (the GBP portion of the consistency task is separately tracked as still blocked).
- **Result:** All 5 pages' JSON-LD re-validated as parseable JSON after the `telephone` change. `/llms.txt` verified serving correctly via a local preview server. Grepped every phone/address/hours/email/WhatsApp occurrence sitewide and confirmed agreement with JSON-LD and the new `llms.txt`. Zero console errors on reload of the homepage.
- **Outstanding issues:** Phase 5's third task (structuring fleet/pricing content in clean HTML tables) stays blocked on Phase 13. The GBP portion of the consistency task stays blocked on the Phase 21 manual claim/verification. Nothing in this batch has been committed yet.

### 2026-08-07 — Structure batch: Phases 7, 10, 12, 15 (labels), and 18 completed together
- **Summary:** User asked to batch several of the next phases together to move faster. Scoped the batch to everything genuinely unblocked with no manual-action dependency: Accessibility (7), Semantic HTML (10), Navigation (12), the form-label half of Forms (15), and Security headers (18) — all touching overlapping code (page structure, the mobile menu, headings), so doing them together avoided reopening the same files repeatedly. Full details are under each phase's own section above; summary of what shipped: `<main>` landmark + skip link on all 5 pages; full form label association on `book.html` (10 fields) and `contact.html` (4 fields, which had *no* labels at all before); a color-contrast audit that fixed two real small-text failures (`#888`→`#767676`, and brand orange used as small text →`#CC2B00`) while flagging the brand's persistent white-on-orange button text as a decision for the user rather than changing it unilaterally; a real keyboard-trap bug fixed in the mobile menu (`#menu-btn` was an unfocusable `<div>`, `#side-bar` stayed tabbable while off-screen) via a real `<button>`, `inert`/`aria-hidden` toggling, Escape-to-close, and focus management; `<nav>` landmarks added to both desktop and mobile navigation; heading-hierarchy skips fixed in `book.html`, `fleet.html`, and the shared footer; 17 repeated card elements converted to `<article>`; `aria-current="page"` added to the active nav link; and security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) added via a wrapper in `src/worker.js` — which surfaced and fixed a real gap where Cloudflare's Assets binding was serving pages directly and bypassing the Worker entirely, fixed via `run_worker_first: true` in `wrangler.jsonc`.
- **Files changed:** `index.html`, `about.html`, `book.html`, `contact.html`, `fleet.html`, `partials/header.html`, `partials/footer.html`, `assets/css/site-custom.css`, `assets/js/main.js`, `scripts/build.js`, `src/worker.js`, `wrangler.jsonc`
- **Reason:** Direct user request to batch phases for speed, following a scope-confirmation question (offered three batch sizes; user chose the smallest/lowest-risk one: the fully-unblocked structure-related phases, deferring images and the JS/CSS performance trim to their own review passes).
- **Result:** All 5 pages verified via browser automation with zero console errors, both on a plain static server and — critically for the security-headers work — through an actual `wrangler dev` run of the Cloudflare Worker (the static preview alone can't exercise `src/worker.js` at all). Mobile menu keyboard behavior (open/close, Escape, focus movement) verified end-to-end via scripted interaction, not just code review. All HTML tag balance (`<main>`, `<nav>`, `<article>`, `<header>`, `<footer>`, `<body>`, `<html>`) verified programmatically after every edit.
- **Outstanding issues:** The white-on-orange persistent button-text contrast question (Phase 7) needs a user decision — see Known Issues. Phase 15's spam-protection task (honeypot/rate-limiting on `/api/mailer`) was correctly out of scope for this batch and remains not started. Nothing in this batch has been committed yet.

---

## Known Issues

- 62MB of unoptimized images, zero lazy-loading — see Phase 14.
- **Needs a decision:** white text on solid brand-orange (`#FF3600`) background is used as the *persistent* style on a few high-visibility elements (`book.html`'s "Submit Booking Request" button, the "Need Help Booking?" sidebar card) — measured contrast is 3.63:1, below the 4.5:1 WCAG AA threshold for that text's size. Fixing it properly means darkening the orange used for button backgrounds specifically, which is a brand-color call — not changed without your sign-off. See Phase 7's color-contrast task for the full analysis and a candidate shade (`#CC2B00`, already used for small orange text elsewhere in this batch) that would pass at 4.5:1+ while staying in the same hue family.
- `/api/mailer` has no spam protection (no honeypot, no rate limiting) — see Phase 15.

## Technical Debt

- The `.search-input-area` search overlay (present on 4 of 5 pages, not `fleet.html`) has no trigger anywhere in the current header/footer markup — it's unreachable by mouse or keyboard. It's already correctly excluded from the tab order (`visibility:hidden` by default, unlike the mobile menu's old bug), so it's not an accessibility issue, just dead UI. Worth removing entirely in a future cleanup pass, or wiring up a real search trigger if search is ever wanted.
- `assets/css/site-custom.css` still carries `.rts-footer-area`/`.copyright-area` rules (light-gray-on-dark colors) left over from before the Phase 2 footer consolidation — confirmed those classes aren't used by any live page's markup anymore. Harmless (dead CSS, not a live contrast issue) but worth pruning in a future cleanup pass.
- `assets/images/icon/instagram-c.svg` has the same corrupted-mask bug as the now-fixed `instagram.svg` (each mask reveals a giant circle outside the viewBox instead of a full-canvas fill). Not currently referenced anywhere, so left unfixed — apply the same `<rect width="20" height="20" fill="..."/>` fix if it's ever wired up.
- ~~`vercel.json`, `api/mailer.js`~~ — **removed 2026-08-07**, Vercel fully decommissioned.
- ~~`.htaccess`~~ — **removed 2026-08-07**, dead Apache config for the confirmed Cloudflare Workers host.
- ~~`gorental-doc/`~~ — **removed 2026-08-07**, tracked ThemeForest template documentation with no product purpose.
- ~~Unused theme image categories, unused JS/CSS plugins, committed OS junk (`.DS_Store`/`Thumbs.db`)~~ — **removed 2026-08-07**, ~43MB of dead weight with zero live references; see Progress Log for the full file list.
- ~~Duplicated inline `<style>` blocks and hand-duplicated head/header/footer/scripts across all 5 HTML pages~~ — **resolved 2026-08-07**. Option A (partials + `scripts/build.js`, wired into `wrangler.jsonc`'s `build.command`) implemented; see Phase 2 Progress Log.
- No build pipeline despite SCSS source existing (`assets/scss/style.scss`) — compiled CSS is hand-committed and unminified.
- `assets/css/plugins/plugins.css` (704KB) still declares an unused `fa-duotone-900` `@font-face` block — real Font Awesome usage sitewide (`fa-brands`/`fa-solid`/`fa-regular`/`fa-light`) is confirmed and those weights are correctly kept; duotone removal is a Phase 8 icon-subsetting task, not a blind deletion.
- Icon class syntax is inconsistent (`fa-solid`/`fa-regular`/`fa-brands` Font Awesome 6 syntax mixed with legacy `far`/`fas` Font Awesome 4/5 syntax in a few spots) — cosmetic/consistency issue, low priority, worth a pass during Phase 8 or 10.

## Future Improvements

- Per-vehicle detail pages with dedicated URLs (deeper internal linking, per-model keyword targeting) — larger effort than Phase 13's initial fleet content expansion, worth revisiting once base content is solid.
- A proper blog/resources section for sustained long-tail and AI-citation content growth.
- Multi-language support if the business ever serves non-English-speaking markets (not currently a stated requirement — do not build speculatively).
- Automated Lighthouse/axe checks in CI once a CI pipeline exists.

## Manual Actions

_These cannot be performed by Claude and require the business/user to act directly:_

- **Google Search Console** — verify `chaliko.com` (verification file already present at `googledc9467f5538943e0.html`, but property/domain needs to be added and sitemap submitted in the GSC dashboard).
- **Bing Webmaster Tools** — add and verify `chaliko.com`, submit sitemap.
- **Domain/DNS** — confirm `chaliko.com` DNS is actually pointed at the Cloudflare Workers deployment (not verified as part of this audit — code-level confirmation only).
- **Google Business Profile** — claim/verify the Lusaka location for Local SEO (Phase 16).
- **GA4 property** — create or grant access so Phase 17 analytics can be installed.
- **Business policy answers** — insurance terms, cancellation policy, accepted payment methods (beyond what the homepage FAQ already states), driver's licence requirements, professional-driver terms — needed to expand FAQ content further (Phase 6/13) without fabrication.

## Validation Checklist

- [ ] **Google Rich Results Test** — every page passes with zero errors on all implemented structured data types.
- [ ] **Lighthouse** — Performance, Accessibility, Best Practices, SEO all ≥90 on mobile, for every page.
- [ ] **PageSpeed Insights** — Core Web Vitals "Good" thresholds met (LCP <2.5s, INP <200ms, CLS <0.1) on mobile field/lab data.
- [ ] **Schema validation** — all JSON-LD blocks validate against schema.org via Google's Rich Results Test and/or schema.org validator.
- [ ] **Accessibility testing** — axe DevTools reports zero critical/serious violations; manual keyboard and screen reader pass completed.
- [ ] **Broken link testing** — no 404s across internal links, images, or assets.
- [ ] **SEO validation** — unique titles/descriptions on all pages, correct canonical domain, valid sitemap and robots.txt.

## Final Success Checklist

- [ ] All 5 pages indexed under `https://chaliko.com` with no canonical conflicts.
- [ ] Zero dead/conflicting hosting configuration in the repository.
- [ ] Structured data covers business identity, breadcrumbs, and fleet — passing Rich Results Test.
- [ ] FAQ content live with `FAQPage` schema.
- [x] `llms.txt` published.
- [ ] Lighthouse scores ≥90 across all four categories, all pages, mobile.
- [ ] WCAG 2.2 AA conformance verified (static + interactive testing).
- [ ] Total image payload reduced by a large margin from the current 62MB baseline; all images lazy-loaded with explicit dimensions.
- [x] Security headers present on all responses.
- [ ] Analytics live and tracking key conversion events.
- [ ] Google Search Console and Bing Webmaster Tools verified with sitemap submitted.
- [ ] `plan.md` fully up to date with every phase's final status.

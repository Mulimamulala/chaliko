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
| 4 | Structured Data | Not Started | Critical | Medium | Phase 2, 3 |
| 5 | AI Discoverability (GEO) | Not Started | High | Medium | Phase 4 |
| 6 | Answer Engine Optimization (AEO) | Not Started | High | Medium | Phase 4, 13 |
| 7 | Accessibility | Not Started | Critical | Medium | Open Decision |
| 8 | Performance Optimization | Not Started | Critical | Large | Open Decision |
| 9 | Core Web Vitals | Not Started | Critical | Medium | Phase 8 |
| 10 | Semantic HTML | Not Started | High | Medium | Open Decision |
| 11 | Internal Linking | Not Started | Medium | Small | Phase 13 |
| 12 | Navigation | Not Started | Medium | Small | Phase 10 |
| 13 | Content Improvements | Not Started | High | Large | Open Decision |
| 14 | Image Optimization | Not Started | Critical | Medium | None |
| 15 | Forms | Not Started | High | Small | Phase 7 |
| 16 | Local SEO | Not Started | High | Small | Phase 4 |
| 17 | Analytics | Not Started | High | Small | Manual: GA4/GSC access |
| 18 | Security | Not Started | High | Small | None |
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
**Status:** Not Started · **Priority:** Critical · **Complexity:** Medium · **Dependencies:** Phase 2, 3
**Files expected to change:** All 5 HTML files

**Task: Fix and consolidate `AutoRental`/`LocalBusiness` JSON-LD**
- Status: Not Started · Priority: Critical
- Description: Correct `@id`/`url`/`image` to `chaliko.com`; add `sameAs` array linking Facebook and Instagram profiles; add `priceRange` if pricing tier info is available (Manual Action — confirm with business).
- Files affected: All 5 pages (same block, currently duplicated)
- Validation steps: Google Rich Results Test passes with zero errors/warnings.
- Estimated effort: Small

**Task: Add `BreadcrumbList` schema**
- Status: Not Started · Priority: Medium
- Description: Add breadcrumb structured data reflecting Home > [Page] hierarchy on About, Book, Contact, Fleet.
- Estimated effort: Small

**Task: Add per-vehicle structured data**
- Status: Not Started · Priority: High
- Description: For each vehicle listed on `fleet.html`/`index.html` (Toyota Allion, Mark X, Lexus IS250, Honda Fit, Mitsubishi Pajero/Shogun, etc.), add `Vehicle` or `Product`/`Offer`-style structured data with seats, fuel type, and rate if available.
- Why it matters: This is a direct, high-value GEO signal — it lets AI answer engines extract "what cars does Chaliko rent and for what" as structured facts rather than needing to parse prose.
- Dependencies: Manual Action — confirm per-vehicle daily rates with business (not currently published on the site).
- Estimated effort: Medium

**Task: Add `FAQPage` schema**
- Status: Not Started · Priority: High
- Dependencies: Phase 13 (FAQ content must exist first)
- Estimated effort: Small (once content exists)

**Task: Add `Review`/`AggregateRating` schema**
- Status: Not Started · Priority: Low
- Dependencies: Manual Action — confirm actual customer review source/count with business; do not fabricate ratings.
- Estimated effort: Small

---

### Phase 5 — AI Discoverability (GEO)
**Status:** Not Started · **Priority:** High · **Complexity:** Medium · **Dependencies:** Phase 4

**Task: Add `llms.txt`**
- Status: Not Started · Priority: Medium
- Description: Add a root-level `llms.txt` describing Chaliko's business, service area, and key pages in plain, LLM-friendly language, per the emerging convention.
- Files affected: new `llms.txt`
- Estimated effort: Small

**Task: Ensure factual consistency across all machine-readable surfaces**
- Status: Not Started · Priority: High
- Description: Cross-check that phone, address, hours, and service-area facts match exactly across JSON-LD, visible page text, `llms.txt`, and (once claimed) Google Business Profile — AI engines cross-reference these for confidence.
- Dependencies: Manual Action — Google Business Profile claim/verification (Phase 21).
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
**Status:** Not Started · **Priority:** Critical · **Complexity:** Medium · **Dependencies:** Open Decision

**Task: Add `<main>` landmark and skip-to-content link**
- Status: Not Started · Priority: Critical
- Description: Wrap primary page content in `<main id="main-content">` on all 5 pages; add a visually-hidden-until-focused skip link as the first focusable element.
- Validation steps: axe DevTools / Lighthouse a11y audit shows landmark present; keyboard Tab from page load lands on skip link first.
- Estimated effort: Small

**Task: Fix form label association**
- Status: Not Started · Priority: Critical
- Description: Add matching `id`/`for` pairs to every input/label in `book.html` and `contact.html` (currently only 1 of ~11 pairs correctly wired in `book.html`).
- Validation steps: Screen reader (VoiceOver/NVDA) announces correct label for every field; automated audit (axe) reports zero label violations.
- Estimated effort: Small

**Task: Verify color contrast**
- Status: Not Started · Priority: High
- Description: Run automated contrast checks on brand orange (`#FF3600`) against dark green backgrounds (`#143628`, `#111827`) and all text/background pairs sitewide.
- Estimated effort: Small

**Task: Keyboard and screen-reader interaction pass**
- Status: Not Started · Priority: High
- Description: Manually verify mobile menu, any modals/popups (Magnific Popup is in use), and the booking form are fully keyboard-operable with no focus traps.
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
**Status:** Not Started · **Priority:** High · **Complexity:** Medium · **Dependencies:** Open Decision

**Task: Introduce proper landmark structure**
- Status: Not Started · Priority: High
- Description: `<header>`/`<nav>`/`<main>`/`<footer>` on every page (currently missing `<main>` entirely); convert generic `<section>`/`<div>` blocks to `<article>` where content is self-contained (e.g. each vehicle card, each testimonial).
- Estimated effort: Medium

**Task: Fix heading hierarchy**
- Status: Not Started · Priority: Medium
- Description: Verify H1→H2→H3 nesting is logical and non-skipping on every page (initial check found reasonable H2/H3 counts on `index.html`; needs a full hierarchy audit, not just counts).
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
**Status:** Not Started · **Priority:** Medium · **Complexity:** Small · **Dependencies:** Phase 10

**Task: Add `aria-current="page"` to active nav item**
- Status: Not Started · Priority: Low
- Estimated effort: Small

**Task: Verify mobile menu accessibility**
- Status: Not Started · Priority: Medium
- Dependencies: Phase 7
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
**Status:** Not Started · **Priority:** High · **Complexity:** Small · **Dependencies:** Phase 7

**Task: Add spam protection to `/api/mailer`**
- Status: Not Started · Priority: High
- Description: Add a honeypot field and basic rate limiting (Cloudflare Workers supports this natively) to the booking/contact endpoint.
- Files affected: `src/worker.js`, `book.html`, `contact.html`
- Estimated effort: Small

**Task: Fix label association**
- Status: Not Started · Priority: Critical
- Description: Same underlying work as the Phase 7 accessibility task — tracked once, executed once.
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
**Status:** Not Started · **Priority:** High · **Complexity:** Small · **Dependencies:** None

**Task: Add security headers via the Cloudflare Worker**
- Status: Not Started · Priority: High
- Description: Set `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` or a CSP `frame-ancestors`, `Referrer-Policy: strict-origin-when-cross-origin`, a baseline `Content-Security-Policy`, and `Permissions-Policy`.
- Files affected: `src/worker.js`
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

---

## Known Issues

- Form labels not programmatically associated with inputs in `book.html` — see Phase 7/15.
- No `<main>` landmark on any page — see Phase 7/10.
- 62MB of unoptimized images, zero lazy-loading — see Phase 14.

## Technical Debt

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
- **Business policy answers** — insurance terms, cancellation policy, accepted payment methods, driver's licence requirements, professional-driver terms — needed to write accurate FAQ content (Phase 6/13) without fabrication.
- **Vehicle pricing/specs** — daily rates and specs per vehicle are not currently published anywhere in the codebase; needed for Phase 4/13 structured data and fleet content.
- **`gorental-doc/` removal confirmation** — confirm it's safe to delete (Phase 2).
- **Templating architecture Open Decision** — Option A (lightweight build/includes) vs Option B (continue manual duplication) — see "Open Decision" above.

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
- [ ] `llms.txt` published.
- [ ] Lighthouse scores ≥90 across all four categories, all pages, mobile.
- [ ] WCAG 2.2 AA conformance verified (static + interactive testing).
- [ ] Total image payload reduced by a large margin from the current 62MB baseline; all images lazy-loaded with explicit dimensions.
- [ ] Security headers present on all responses.
- [ ] Analytics live and tracking key conversion events.
- [ ] Google Search Console and Bing Webmaster Tools verified with sitemap submitted.
- [ ] `plan.md` fully up to date with every phase's final status.

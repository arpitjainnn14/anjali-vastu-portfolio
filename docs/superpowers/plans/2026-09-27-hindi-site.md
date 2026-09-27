# Hindi Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A full Hindi twin of the site under `/hi`, behind an English | हिंदी toggle that stays hidden until `hindi.live` is switched on.

**Architecture:** Content splits into `en/` and `hi/` bundles of one `Content` type, plus `shared.ts` for facts that don't depend on language. Server components get the bundle as a prop, and client components get it through `LocaleProvider`. Route groups give each language its own root layout. English URLs don't change.

**Tech Stack:** Next.js 16.3 App Router, React 19, TypeScript, Tailwind 4, Vitest, next/font, OpenNext on Cloudflare Workers.

**Spec:** `docs/superpowers/specs/2026-09-27-hindi-site-design.md`

## Global Constraints

- English URLs, English rendered text and English behaviour must not change. The only intended English diffs are the toggle once `hindi.live` is true, and `alternates` metadata.
- Every page is static: no `searchParams`, `cookies()`, `headers()`, middleware or `revalidate`. Per-param routes use `generateStaticParams` with `dynamicParams = false`.
- All visitor copy lives in `src/content/{en,hi}/`. Language-independent facts live in `src/content/shared.ts`. There is no copy in components.
- Dependency rule: `app → sections/layout/pages → ui/art → lib → content`.
- Read `README.md` (conventions, banned design patterns) and the relevant `node_modules/next/dist/docs/` guide before writing Next code (AGENTS.md).
- The business name stays in English on Hindi pages: `Anjali Vastu & Astro Divine Solutions`.
- The Hindi is everyday Hindi in Devanagari, keeping the English words people use (consultation, online, booking, WhatsApp); Anjali is अंजलि जी. `TODO(...)` markers stay TODO in both languages; never invent a fact.
- `hindi.live` stays `false` in every commit.
- Layout works at 375px with no horizontal scroll, in both languages.
- Commits: a plain sentence saying what changed for the visitor, then `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Work only in `/Users/arpit/astro-online-booking` on branch `hindi-site`. Never switch branches in `/Users/arpit/Astrology Website`.

## Review Focus

1. **English regressions from the refactor.** A missed prop or context means a crash or missing text on an English page. Task 2 and Task 3 each end by comparing the rendered English text of every route before and after.
2. **Hindi bundle drifting from English.** Guarded by the `Content` type and the runtime parity test (Task 1).
3. **Toggle going to the wrong page or a 404.** Covered by `alternatePath` unit tests for every route (Task 4).
4. **Hindi pages indexed before review.** `/hi` must be `noindex` and unlinked while `hindi.live` is false. Covered by a test on `localeMetadata` (Task 4) and a curl check (Task 6).
5. **Contact form errors in the wrong language.** Covered by a `validate` test with both bundles (Task 2).

---

### Task 1: Content bundles, shared facts, the `Content` type

**Files:**
- Create: `src/content/shared.ts`, `src/content/en/*.ts` (moved from `src/content/*.ts`), `src/content/en/index.ts`, `src/content/hi/index.ts` (temporary: re-exports the English bundle as `hi`), `src/content/locale.ts`
- Modify: `src/content/index.ts`
- Test: `src/content/content.test.ts` (move to `src/content/en/` or keep, adjusting paths), `src/content/parity.test.ts`

**Produces:**
- `type Locale = 'en' | 'hi'`, `locales`, `defaultLocale = 'en'`, and `isLocale(x)` in `src/content/locale.ts`
- `shared`: `{ brand, brandLines, contact: { phoneDisplay, whatsappNumber, whatsappUrl, email, forminitFormId, forminitEndpoint }, consultationFee, cal: { baseUrl, username }, bookingLive, bookingEmbed, hindiLive: false, practisingSince, geo: { city, state, locale strings used only in structured data } }`. Move these facts out of the language modules. `booking.live` and `booking.embed` in the language bundles then read from `shared`, so existing call sites keep working.
- The `en` bundle: `{ site, seal, contact, whatsappMessages, nav, footer, hero, services, servicesSection, bookFirstStepLive, howItWorks, serviceDetail, booking, picker, about, teaching, testimonials, faq, contactSection, form, privacy, terms, refundPolicy, policyPages }`. Use the modules' current export names as keys; include every export `src/content/index.ts` exposes today.
- `type Content`: a deep type where string literals widen to `string`, functions keep their signatures, readonly tuples become readonly arrays of the widened element, and objects map recursively. Export it with a `Widen<T>` helper from `src/content/locale.ts` (or `types.ts`).
- `getContent(locale: Locale): Content` in `src/content/index.ts`.
- **Compatibility:** `src/content/index.ts` keeps re-exporting every English named export exactly as today (`export * from './en/...'`), so no component changes in this task. Tasks 2–3 remove those re-exports.

- [ ] **Step 1: Parity test first.** Write `src/content/parity.test.ts`. It walks `getContent('en')` and `getContent('hi')` recursively and asserts:
  - the same key sets at every object level
  - the same array lengths
  - the same `typeof` at each leaf
  - every string leaf non-empty
  - functions return strings for a sample argument (`'X'`)

  Also assert `getContent('en').site.brand === shared.brand`. Run it: it fails (no modules yet).
- [ ] **Step 2:** Move the modules with `git mv` into `src/content/en/`, fix their relative imports, and create `shared.ts`. English module values must stay identical: move a fact and import it back rather than re-typing it.
- [ ] **Step 3:** Create `locale.ts`, `en/index.ts` (the bundle), `hi/index.ts` (`export const hi: Content = en;` for now, with a comment that Task 5 replaces it), and `getContent`.
- [ ] **Step 4:** Update the retired-phrase scan in `content.test.ts` to scan `src/content/en/` and `src/content/hi/`, and every other test's imports. Run `npm test && npx tsc --noEmit && npm run lint && npm run build`: all green, and the build's route list is unchanged.
- [ ] **Step 5:** Commit: "Split the site's words into English and shared facts, ready for Hindi".

### Task 2: Server-side copy through props; lib takes the bundle

Everything that runs on the server stops importing copy from `@/content`, apart from `getContent` and `shared`.

**Files:** `src/lib/{booking,whatsapp,structured-data,metadata,sections,contact-form}.ts` plus their tests, every component in `src/components/sections`, `src/components/layout/Footer.tsx`, `src/components/ui/*` that reads copy (Wordmark reads `shared`), `src/app/**/page.tsx`, `src/app/layout.tsx`, `src/app/sitemap.ts`, `src/app/api/contact/route.ts`.

**Interfaces:**
- lib functions gain a leading `c: Content` parameter where they read copy. Examples:
  - `serviceCta(c, service, live?)`, `serviceReassurance(c, service, live?)`, `howItWorksSteps(c, live?)`, `serviceFeeLine(c, service)`, `bookedCopy(c, service)`, `detailsMessage(c, service)`, `detailsHref(c, service)`
  - `whatsappHref(c, message?)`: the message defaults to `c.whatsappMessages.general`
  - `siteGraph(c, locale)`, `serviceBreadcrumb(c, service, locale)`, `faqPage(c)`
  - `pageMetadata({ ..., c })`
  - `validate(c, values)`
  - `bookableServices(c)` and `findBookable(c, slug)` become functions, because service names are translated. Slugs, fees and calSlugs are the same in both bundles.
- Pages call `getContent('en')` and pass `c` down. Section components take `c: Content` as a prop.
- `/api/contact` reads `locale` from the posted body (default `'en'`, validated with `isLocale`) and validates with that bundle.

- [ ] **Step 1:** Update the lib tests to the new signatures and run them (they fail). Add a `validate` test that the Hindi bundle's messages are returned when `c = getContent('hi')`. This test is meaningful after Task 5; for now it asserts that `c.form.validation.nameRequired` is returned.
- [ ] **Step 2:** Implement the lib changes, then migrate the server components and pages. Client components (Task 3) may keep importing `@/content` for now.
- [ ] **Step 3: English regression check.**
  - Before your first edit, build and save the visible text of every English route: `curl` each built page on `next start -p 3100`, strip tags, save under the SDD workspace.
  - After the change, do the same and `diff`. The only allowed differences are none.
  - The routes: `/ /about /teaching /contact /which-reading /services/{vedic-astrology,numerology,vastu} /book /book/numerology /booked /booked/numerology /terms /refund-policy /privacy`.
- [ ] **Step 4:** Run `npm test && npx tsc --noEmit && npm run lint && npm run build`, then commit: "Pass each page its words, so the same page can be built in Hindi".

### Task 3: Client components through `LocaleProvider`; remove the compat re-exports

**Files:**
- Create: `src/components/locale/LocaleProvider.tsx` (`'use client'`; `LocaleProvider({ locale, children })` picks the bundle with `getContent(locale)` on the client; `useContent()` returns `{ c, locale }`)
- Modify: `Nav.tsx`, `StickyWhatsApp.tsx`, `ContactForm.tsx`, `ServicePicker.tsx`, `TestimonialsRail.tsx`, `Field.tsx`, `Motion.tsx` (only those that read copy), `src/app/layout.tsx` (wrap the body in `<LocaleProvider locale="en">`), `src/content/index.ts` (drop the English named re-exports and keep `getContent`, `Content`, locale helpers and `shared`)

The provider takes the `locale` string rather than the bundle, because bundles contain functions and can't cross the server→client boundary. Both bundles end up in the client JS. They're small (~1,200 lines of text) and that's accepted.

ContactForm posts `locale` with the form data.

- [ ] **Step 1:** Implement, then run `grep -rn "from '@/content'" src | grep -v "getContent\|shared\|type Content\|locale"`. It must print only imports of those names.
- [ ] **Step 2:** Repeat the Task 2 English text diff (must be empty). Also use Playwright at 375px on `/`, `/contact` and `/which-reading`: open the mobile menu, pick an option in the picker, and submit an empty contact form (errors appear in English). Save screenshots.
- [ ] **Step 3:** Run `npm test && npx tsc --noEmit && npm run lint && npm run build`, then commit: "Give interactive parts of the site their words from the page's language".

### Task 4: Route groups, the Hindi shell, `/hi` pages, toggle, SEO wiring

**Files:**
- Move: every English page into `src/app/(en)/…` (URLs unchanged). Move `layout.tsx` to `src/app/(en)/layout.tsx`.
- Create: `src/app/(hi)/hi/layout.tsx`, and a `page.tsx` under `src/app/(hi)/hi/` for every English route (same `generateStaticParams`/`dynamicParams` rules).
- Create: `src/components/pages/*.tsx`, one view per route, moved from each page's JSX. Both languages' page files render the view.
- Create: `src/lib/locale-routing.ts` with `localePath(locale, path)` (`'/about'` → `'/hi/about'` for hi; `'/'` ↔ `'/hi'`), `alternatePath(pathname)` (the other language's path for any site path), and `localeMetadata(locale, path)` (returns `robots: noindex` for hi while `!shared.hindiLive`, and `alternates.languages` only when `hindiLive`).
- Create: `src/components/locale/LanguageToggle.tsx` (client). It renders nothing when `!shared.hindiLive`. Otherwise it's a link to `alternatePath(usePathname())` labelled `हिंदी` on English pages and `English` on Hindi pages. On click it saves `localStorage['lang']`, inside try/catch. Placed in Nav: desktop, after Contact; drawer, at the top.
- Create: `src/components/locale/RememberedLanguage.tsx` (client). Rendered only on the English home page. On mount, if `hindiLive` and `localStorage['lang'] === 'hi'`, it calls `location.replace('/hi')`.
- Modify: `src/app/sitemap.ts` (add `/hi` twins only when `hindiLive`); internal links in content (nav links, footer links, CTA hrefs, `bookPageHref`, the picker href) are localised with `localePath(locale, …)` wherever they're built; `pageMetadata` merges in `localeMetadata`.
- Fonts in the Hindi layout: `Tiro_Devanagari_Hindi` (display) and `Mukta` (weights 400, 500, 600; subsets `devanagari` and `latin`) via next/font, plus Fraunces and Hanken for Latin text. Map the CSS variables in `globals.css` so `font-display`/body classes fall back correctly on `:lang(hi)` (e.g. body `font-family: var(--font-hanken), var(--font-mukta), sans-serif`).
- OG image, favicon, robots: check `node_modules/next/dist/docs` on multiple root layouts and put them where both groups get them. `pageMetadata` already points at `/opengraph-image.jpg` explicitly; that URL must keep serving.

- [ ] **Step 1: Test first.** `src/lib/locale-routing.test.ts`:
  - `localePath` and `alternatePath` for every route in the list above, plus `/services/vastu` ↔ `/hi/services/vastu` and `/` ↔ `/hi`
  - `localeMetadata('hi', '/about')` has `robots.index === false` while `hindiLive` is false
  - `localeMetadata('en', '/about')` has no `robots` and no `alternates.languages` while false

  Run it: it fails.
- [ ] **Step 2:** Implement. For now the Hindi pages render the English text, because `hi` still aliases `en` until Task 5. Run `npm run build`: every `/hi/*` route is listed as static.
- [ ] **Step 3:** English text diff (empty). Curl `/hi/about`: `lang="hi"`, `noindex`, 200. `/hi/book/vastu`: 404. Temporarily set `hindiLive: true`: the toggle appears on `/about` and links to `/hi/about`; `/hi/about`'s toggle links to `/about`; hreflang alternates are present. Revert, and confirm with `git diff --exit-code src/content/shared.ts`.
- [ ] **Step 4:** Run `npm test && npx tsc --noEmit && npm run lint && npm run build && npm run preview` (curl `/hi` and `/hi/services/numerology` on the preview port, then stop), then commit: "Build every page at /hi as well, with a language toggle kept off until the Hindi is reviewed".

### Task 5: The Hindi translation

**Files:** `src/content/hi/*.ts` (one module per English module, same structure), `src/content/hi/index.ts` (builds the real `hi` bundle typed `Content`).

Rules:
- Everyday Hindi (see the spec): Devanagari, with the English terms people say (consultation, online, booking, WhatsApp, UPI, Vastu → वास्तु, Numerology → न्यूमरोलॉजी / अंकशास्त्र: choose one and use it consistently; a glossary comment at the top of `hi/index.ts` lists these choices). Anjali → अंजलि जी in running text.
- Keep in English: the brand, email, prices (₹2,151), and `Ph.D.`
- Fact-for-fact the same as English: never add or drop a claim. Legal pages (terms, refund policy, privacy) keep every condition.
- `TODO(...)` markers stay exactly as they are.
- Meta titles stay under ~60 characters, and descriptions under ~160.
- The `seal` already has Devanagari; keep its `alt` translated.
- WhatsApp prefilled messages are in Hindi (short and natural, e.g. `नमस्ते अंजलि जी, मुझे … के बारे में पूछना था।`).
- Testimonial quotes stay as given; translate the labels around them.
- Retired phrases stay retired. The parity test must pass.

- [ ] **Step 1:** Translate module by module, running `npx vitest run src/content/parity.test.ts` as you go.
- [ ] **Step 2:** Playwright screenshots at 375px and 1280px of `/hi`, `/hi/services/numerology`, `/hi/book/numerology`, `/hi/terms` and `/hi/contact`. Check for overflow (0) and that no English sentences remain apart from the kept terms. Also save a text dump of every `/hi` route for Anjali's review at `docs/hindi-review/hi-site-text.md`: a plain list per page, headings and paragraphs, in reading order.
- [ ] **Step 3:** Run `npm test && npx tsc --noEmit && npm run lint && npm run build`, then commit: "Write the Hindi site, for Anjali to read before it is switched on".

### Task 6: Final checks

- [ ] Full build: every route static in both languages.
- [ ] Playwright at 375px on every route in both languages: overflow 0, `html[lang]` correct.
- [ ] `/hi/*` is `noindex` and unlinked while `hindiLive` is false (curl every English page for `href="/hi`: none).
- [ ] Temporarily set `hindiLive: true`: the toggle round-trips on every route; the sitemap has both languages; alternates are present; the remembered choice redirects `/` to `/hi`. Revert, and check with `git diff --exit-code`.
- [ ] `npm run preview`: `/hi/services/numerology` returns 200 on the Worker.

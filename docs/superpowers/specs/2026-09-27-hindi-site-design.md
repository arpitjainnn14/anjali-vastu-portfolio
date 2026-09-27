# Hindi site — design

Date: 2026-09-27
Status: agreed in conversation. Arpit asked for the build to go ahead without further approval rounds.

## Goal

A complete Hindi version of the site for Hindi-speaking visitors, reached by an
English | हिंदी toggle. The English site keeps every current URL and behaviour.

## Decisions (agreed with Arpit)

| Topic | Decision |
|---|---|
| Who writes the Hindi | Claude drafts the full translation, including terms, refund policy and privacy. Anjali reads and corrects it before it is switched on. |
| Style | Everyday Hindi: Devanagari, keeping the English words her clients actually use (consultation, online, booking, WhatsApp, fee → फ़ीस). Anjali is "अंजलि जी" in running text. |
| Business name | Stays in English on Hindi pages: "Anjali Vastu & Astro Divine Solutions". |
| How visitors switch | A toggle only, with no automatic redirect by browser language. The choice is remembered: a visitor who picked Hindi and lands on the English home page again is sent to `/hi`. |
| URLs | English unchanged. Hindi twins under `/hi` with the same English-letter slugs (`/hi/services/numerology`). |
| Rendering | Every page static (Cloudflare Workers constraint, CLAUDE.md). No middleware. |

## Architecture

### Content
- `src/content/en/` holds today's modules, moved as they are. `src/content/hi/` has the same modules, translated.
- `src/content/shared.ts` holds the facts that don't change with language: brand, brand lines,
  phone/WhatsApp numbers, email, Forminit ids, fee amount and display, Cal ID username
  and slugs, city/state data used in structured data, `practisingSince`, `booking.live`,
  `booking.embed`, and the new `hindi.live` flag. Language modules import these instead of
  repeating them.
- Each language exports one bundle object (`en`, `hi`) of type `Content`. `Content` is
  derived from the English bundle with string literals widened to `string`, so TypeScript
  rejects a Hindi bundle that is missing a field or has an extra one.
- `getContent(locale: Locale): Content`, where `Locale = 'en' | 'hi'`.

### Getting content to components
- Server components take the bundle as a prop (`c: Content`) from their page.
- Client components (Nav, StickyWhatsApp, ContactForm, ServicePicker, TestimonialsRail,
  Field, Motion if it reads copy) read it from `LocaleProvider` / `useContent()`, set in
  each root layout.
- `src/lib` functions that read copy take the bundle (or locale) as a parameter instead of
  importing `@/content`. Shared facts come from `@/content/shared`.

### Routes and layouts
- Two root layouts through route groups: `app/(en)/layout.tsx` (`lang="en-IN"`, current
  fonts) and `app/(hi)/hi/layout.tsx` (`lang="hi"`, Tiro Devanagari Hindi for display,
  Mukta for body text, plus the Latin fonts for English words and the brand).
- Each page's body becomes a shared view component (e.g. `components/pages/AboutPage.tsx`)
  taking `c` and `locale`. `app/(en)/about/page.tsx` and `app/(hi)/hi/about/page.tsx` are
  thin wrappers that also export metadata built from their bundle.
- `/api/contact` stays outside the groups. The form sends `locale`, and validation messages
  come from that language's bundle.
- The OG image, favicon, robots and sitemap keep working. Check the Next docs on multiple
  root layouts before moving files.

### Toggle, search engines, messages
- The toggle is in the header next to Contact and at the top of the mobile drawer. It always
  goes to the same page in the other language (a full page load, since the root layouts
  differ). It saves the choice in `localStorage` (wrapped in try/catch).
- While `hindi.live` is false: the toggle is not rendered, `/hi/*` is `noindex`, and there are
  no hreflang alternates or sitemap entries. Arpit and Anjali review at `/hi` directly.
- Once `hindi.live` is true: the toggle shows, every page carries `alternates.languages`
  (`en-IN`, `hi-IN`, `x-default` → English), and the sitemap lists both languages.
- Prefilled WhatsApp messages on Hindi pages are in Hindi.
- Structured data on Hindi pages uses `inLanguage: 'hi-IN'`.
- `/hi/book/*` embeds the same Cal ID calendar. Cal ID shows its interface in the visitor's
  browser language.
- `/hi/booked/*` exists, but Cal ID redirects to the English `/booked/<slug>`, since one
  redirect is set per event. Linking Hindi bookers to `/hi/booked` is out of scope.

## Out of scope
- Automatic language detection or redirects.
- Hindi slugs.
- Translating testimonial quotes: they stay in the language they were given in, with their
  labels translated.
- Hindi Cal ID event types or emails.

## Testing
- Unit tests: `getContent`, the structural parity check (a runtime test that walks both
  bundles and compares keys and array lengths, on top of the type check), lib functions with
  both bundles, and the retired-phrase scan extended to `hi/`.
- The build lists every `/hi/*` route as static.
- Playwright: every page in both languages at 375px has no horizontal overflow; `lang`
  attribute correct; Hindi pages render Devanagari in Mukta/Tiro.
- With `hindi.live` true (temporarily, then reverted): the toggle round-trips on every page,
  and hreflang alternates are present.

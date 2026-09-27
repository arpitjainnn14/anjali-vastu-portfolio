# Anjali Jain — Astrology, Numerology & Vastu

Marketing site for a one-person practice in Palwal, Haryana. Its one job is to
get a visitor to message Anjali on WhatsApp.

Next.js (App Router) · TypeScript · Tailwind CSS v4 · GSAP for scroll reveals.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
npm test         # vitest unit tests (src/lib, src/content)
```

Environment: copy `.env.example` to `.env.local`. `NEXT_PUBLIC_SITE_URL` sets
canonical URLs and the sitemap; `FORMINIT_API_KEY` is used by the contact form.

## Structure

```
src/
  app/                  Routes only. Each page renders a view; no styling
    (en)/               logic or copy lives here. English pages, own root layout.
    (hi)/hi/            The same pages at /hi, with a Hindi root layout.
    global-not-found.tsx  The 404 for unmatched URLs (two root layouts need it).
    api/contact/
    sitemap.ts, robots.ts  sitemap.xml and robots.txt; page list in lib/site-pages.ts
    sitemap.html/       The same list for people, linked from the footer.

  content/              Every string a visitor reads, in two language bundles.
    index.ts            getContent(locale). Import from '@/content', never from
                        a module directly.
    locale.ts           The locales, and the `Content` type both bundles must
                        satisfy (the English bundle's shape, strings widened).
    shared.ts           Facts that are the same in every language: brand,
                        WhatsApp number, fee, Cal ID, geo, `hindiLive`.
    en/                 The English bundle, one module per area: site,
                        navigation, hero, services, booking, picker, about,
                        teaching, testimonials, faq, contact, privacy,
                        policies, sitemap.
    hi/                 The Hindi bundle: the same modules, same shape. The
                        glossary Hindi copy follows is at the top of hi/index.ts.
    parity.test.ts, identifiers.test.ts
                        Keep the bundles in step: same shape, TODOs in the same
                        places, identifiers and clients' words untouched.

  components/
    ui/                 Primitives with no copy of their own: Button, SmartLink,
                        form fields, icons, Section / Container / SectionHeader.
    layout/             Site chrome on every page: SiteBody, Nav, Footer,
                        StickyWhatsApp.
    pages/              One view per route, shared by the English and Hindi
                        page files: HomePage, AboutPage, ServicePage, ...
    locale/             LocaleProvider, the language toggle, the remembered-
                        language redirect.
    sections/           Page sections: Hero, Services, About, Testimonials,
                        Teaching, Faq, Contact. Composed by the routes.
    art/                The kundli chart and its small mark.
    motion/             The scroll-reveal layer (reads data-* hooks).

  lib/                  Framework-free helpers.
    whatsapp.ts         The only place a WhatsApp link is built.
    links.ts            Internal vs external link rules.
    contact-form.ts     Form validation, shared by browser and API route.
    todo.ts             Hides unsupplied TODO(...) facts at render.
    sections.ts         Which optional sections have content to show.
    locale-routing.ts   localePath / alternatePath / localeMetadata: every
                        internal link goes through localePath so Hindi pages
                        link to Hindi pages.
```

Dependencies point one way: `app → pages/sections/layout → ui/art/locale → lib → content`.
A primitive in `ui/` never imports a section, and nothing imports from `app/`.

## Two languages

The site is built twice: English at its usual URLs, Hindi under `/hi`, every
page static in both.

- **Routes.** `app/(en)/` and `app/(hi)/hi/` are route groups with their own
  root layouts (`<html lang>` and fonts differ). Each page file is a few lines
  that pick a bundle and render a shared view from `components/pages/`.
- **Words reach components two ways.** Server components take the bundle as a
  `c: Content` prop (and `locale` when they build links). Client components
  call `useContent()` from `components/locale/LocaleProvider`, which returns
  `{ c, locale }`; they never import `@/content` for copy.
- **Links.** Content holds English paths; render them through `localePath`
  (`lib/locale-routing.ts`) so a Hindi page links to Hindi pages.
- **Every copy edit goes in both bundles**, `content/en/` and `content/hi/`.
  The `Content` type and `parity.test.ts` fail if the shapes differ or a TODO
  is filled in one language only; `identifiers.test.ts` fails if a slug, icon,
  href or a client's quoted words differ between them.
- **`hindiLive`** (`content/shared.ts`) keeps the Hindi site hidden while it is
  false: `/hi` pages are built but `noindex`, the language toggle is not
  shown, and sitemap.xml leaves them out. Switch it on only after Anjali has
  read the Hindi.
- **`docs/hindi-review/`** holds `hi-site-text.md`, every line of the site in
  English beside Hindi, for her review. It is generated from the bundles;
  regenerate it after changing Hindi copy.

## Conventions

- **Copy lives in `content/en/` and `content/hi/`.** Components take strings
  from there, including screen-reader labels and punctuation that differs by
  language (Hindi ends a sentence with "।"). A heading word wrapped in `*asterisks*` renders as the
  italic accent (see `Accented` in `components/ui/Section.tsx`).
- **Unknown facts stay as `TODO(...)` markers.** Never invent one. `lib/todo.ts`
  hides them from visitors; `grep -rn "TODO(" src/` lists what is still missing
  before launch.
- **Design tokens** are declared once in the `@theme` block of
  `app/globals.css` (paper, ink, sindoor, haldi, night). Use the token classes
  (`bg-paper`, `text-sindoor`) rather than raw hex values.
- **Motion is opt-in by attribute.** `data-reveal`, `data-reveal-group` /
  `data-reveal-item` and `data-parallax` are read by `components/motion/Motion.tsx`.
  The HTML is always complete without JavaScript, and nothing moves under
  `prefers-reduced-motion`.
- **Links:** use `SmartLink` (or `ButtonLink`) so routes, WhatsApp and
  external links are handled the same way everywhere. WhatsApp URLs come from
  `whatsappHref()`.
- **Pinned WhatsApp button (phones):** it hides while any element marked
  `data-hides-sticky` is on screen, so it never sits beside another WhatsApp
  button. Mark any new section that has its own WhatsApp button.

## Design rules: what not to reintroduce

The site was audited (Sept 2026) because it read as AI-generated. The cause was
one decorative formula stamped on every section. If you are adding a section or
a component, these patterns are out — they are what made it look generated:

- **No coloured bar down the left of a quote or an alert.** Quotes are set with
  a hanging quotation mark; form alerts are a line of text with an icon.
- **No tracked-out caps label above a heading.** The heading says it already.
  (One plain-text label inside the service picker card is the only exception.)
- **No zero-padded `01 / 02 / 03` numbering.** Plain numerals where a sequence
  genuinely matters, none where it does not.
- **No rules boxing in small groups** — contact details, fact lists, stat rows.
  Alignment and space do that job. Ruled tables are kept only where the content
  is a table (the course spec, "at a glance").
- **No boxed stat trio** (`2017 │ Ph.D. │ EN`). Credentials run as a sentence.
- **No pull quote repeating the sentence next to it.**
- **No dashed borders**, and no outlined card around the contact form: its
  fields are ruled lines, not boxes.

What carries the design instead: the paper-and-ink palette, Fraunces with one
italic accent word per heading (`*asterisks*` in content, underlined by the
inked `.accent` stroke), the kundli chart, the portrait, and her seal
(`components/art/Seal.tsx`) — used three times only, where emphasis is needed.
Each `Seal` needs a unique `id`, since its curved text hangs off path ids.

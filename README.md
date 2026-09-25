# Anjali Jain — Astrology, Numerology & Vastu

Marketing site for a one-person practice in Palwal, Haryana. Its one job is to
get a visitor to message Anjali on WhatsApp.

Next.js (App Router) · TypeScript · Tailwind CSS v4 · GSAP for scroll reveals.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

Environment: copy `.env.example` to `.env.local`. `NEXT_PUBLIC_SITE_URL` sets
canonical URLs and the sitemap; `FORMINIT_API_KEY` is used by the contact form.

## Structure

```
src/
  app/                  Routes only. Each page composes sections; no styling
    api/contact/        logic or copy lives here.
    sitemap.ts, robots.ts

  content/              Every string a visitor reads, one module per area.
    index.ts            Import from '@/content', never from a module directly.
    site.ts             Name, credentials, WhatsApp number, message openers.
    navigation.ts       Nav bar and footer.
    hero.ts services.ts about.ts teaching.ts testimonials.ts
    faq.ts contact.ts privacy.ts

  components/
    ui/                 Primitives with no copy of their own: Button, SmartLink,
                        form fields, icons, Section / Container / SectionHeader.
    layout/             Site chrome on every page: Nav, Footer, StickyWhatsApp.
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
```

Dependencies point one way: `app → sections/layout → ui/art → lib → content`.
A primitive in `ui/` never imports a section, and nothing imports from `app/`.

## Conventions

- **Copy lives in `content/`.** Components take strings from there, including
  screen-reader labels. A heading word wrapped in `*asterisks*` renders as the
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

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

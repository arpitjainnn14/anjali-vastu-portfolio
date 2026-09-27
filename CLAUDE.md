# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Marketing site for Anjali Jain's astrology, numerology and Vastu practice. Its job is to get a visitor to message her on WhatsApp (and, per the booking work in progress, to book and pay). Next.js 16 App Router, React 19, TypeScript, Tailwind v4, GSAP.

**Read `README.md` before changing UI or copy.** It holds the source-of-truth conventions: the directory layout and one-way dependency rule (`app → sections/layout → ui/art → lib → content`), copy living in `src/content/` (imported via `@/content`), `TODO(...)` markers for unknown facts, design tokens, `data-reveal` motion hooks, `SmartLink`/`whatsappHref()`, `data-hides-sticky`, and the list of design patterns banned after the Sept 2026 "reads as AI-generated" audit.

## Commands

```bash
npm run dev          # next dev, with Cloudflare bindings via initOpenNextCloudflareForDev()
npm run build        # plain Next build
npm run lint         # eslint
npm test             # vitest unit tests (src/lib, src/content)
npx tsc --noEmit     # type check (no npm script for it)
npm run preview      # OpenNext build + run the real Worker locally in workerd
npm run deploy       # OpenNext build + deploy to Cloudflare
```

`npm test` runs Vitest unit tests for the plain-TypeScript modules in `src/lib` and `src/content`; there are no component or browser tests. `src/content/content.test.ts` scans every content file for promises that online booking made false ("booking desk", "no payment is asked", fees "not listed here"), so reword any copy it flags rather than deleting the test. Verify UI changes with lint, a type check, `npm test`, `npm run build`, and — for anything touching routing, API routes or env — `npm run preview`, since the Worker runtime can diverge from `next dev`.

## Hosting: Cloudflare Workers Free

Deployed through `@opennextjs/cloudflare` (`wrangler.jsonc`, `open-next.config.ts`), not Vercel; some older comments and `.env.example` still say Vercel. Constraints that shape code:

- **Stay inside free limits.** No paid Cloudflare products or other paid services; Razorpay fees are the only allowed running cost.
- **Every page is static.** The incremental cache serves prerendered pages from Workers Static Assets. Adding `revalidate`/ISR to a page requires changing `open-next.config.ts` (and would need R2/KV).
- **`NEXT_PUBLIC_SITE_URL` must be set at build time.** `src/lib/site-url.ts` throws on a production or Workers CI build without it, so canonicals never point at localhost. Build absolute URLs with `siteUrl`/`absoluteUrl()` rather than a hardcoded host.
- Secrets (`FORMINIT_API_KEY`, Razorpay keys) live in the Cloudflare dashboard in production and `.env.local` / `.dev.vars` locally. API routes run with `runtime = 'nodejs'`.

## Server boundaries

- `src/app/api/contact/route.ts` proxies the contact form to Forminit so the key stays server-side; validation is shared with the browser through `src/lib/contact-form.ts`. Forminit's responses are logged, never shown to visitors.
- Razorpay: `src/lib/razorpay.ts`, `/api/create-order`, `/api/verify-payment` and `/pay-test` are a **dev-only learning sandbox** — every entry point returns 404 when `NODE_ENV === 'production'`. Real bookings are paid through Cal ID's Razorpay app. The server fixes the amount; the browser never sends one. Design and plan: `docs/superpowers/specs/2026-09-26-online-booking-design.md` and `docs/superpowers/plans/2026-09-26-online-booking.md`.

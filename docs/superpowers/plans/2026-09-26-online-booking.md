# Online Booking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let visitors book and pay ₹2,151 for a Vedic Astrology or Numerology consultation through Cal ID and Razorpay, with prices, policies and a thank-you page on the site, all switched on by one flag.

**Architecture:** Cal ID does the scheduling, payment (its Razorpay app), confirmation and reminder emails. The site shows prices, links or embeds the Cal ID calendar on `/book` and `/book/<service>`, hosts `/terms`, `/refund-policy`, `/booked` and `/booked/<service>` (all static), and rewrites the copy that promised "no payment, no booking desk". One flag, `booking.live` in `src/content/booking.ts`, decides whether service pages offer booking or WhatsApp. It stays `false` until Razorpay approves the live account.

**Tech Stack:** Next.js 16.3 (App Router), React 19, TypeScript, Tailwind 4, hosted on Cloudflare Workers through OpenNext. The repo has no test suite; this plan adds Vitest for the plain-TypeScript `lib` and `content` modules only.

**Spec:** `docs/superpowers/specs/2026-09-26-online-booking-design.md`

## Global Constraints

- Every string a visitor reads lives in `src/content/`, imported from `@/content`. No copy in components.
- `TODO(...)` marks a fact nobody has supplied. Never invent one. Markers must never reach a visitor (filter with `src/lib/todo.ts`).
- Read `README.md` before changing UI or copy (layout, the dependency rule `app → sections/layout → ui/art → lib → content`, design tokens, banned design patterns). Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code (`AGENTS.md`).
- **Every page is static** (`CLAUDE.md`). No `searchParams`, `cookies()` or `headers()` in pages, and no `revalidate`. A per-service page uses `generateStaticParams` with `dynamicParams = false`, so an unknown service is a 404.
- Price: ₹2,151 for Vedic Astrology and Numerology. Vastu has no price on the site ("Fees shared on WhatsApp").
- The fee covers the consultation plus three months of calling Anjali directly. No fixed session length on the site.
- No cancellations. One reschedule, at least 24 hours before. Refunds only for a genuine cause.
- The site never displays Anjali's phone number (`contact.phoneDisplay` comment). The only paid service is Razorpay's fee.
- While `booking.live` is `false`: no link to `/book` anywhere, `/book` is `noindex`, and service pages keep the WhatsApp button.
- `/booked`, `/terms` and `/refund-policy` are `noindex` and not in the sitemap (drafts, like `/privacy`).
- Layout works at 375px wide with no horizontal scroll.
- Hosting is Cloudflare Workers (OpenNext), live at `https://anjali-vastu-portfolio.jainarpit2004.workers.dev`. No page may use `revalidate`, because the incremental cache is read-only static assets. Any new `NEXT_PUBLIC_` variable must also be set as a Cloudflare build variable (this plan adds none).
- Build in a git worktree, never by switching branches in `/Users/arpit/Astrology Website`: another session shares that directory.
- Commit messages follow the repo's style: a plain sentence saying what changed for the visitor, then the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. `/book/vastu` or `/book/<unknown>` should be a 404, never a calendar for a service not booked online. Covered by `findBookable` tests in Task 2 and the curl checks in Task 7.
2. `/booked` opened directly should show generic copy that does not claim a booking was made, with a details message listing every field; `/booked/<unknown>` is a 404. Covered in Task 9.
3. With `booking.live = false`, no service page, nav link or footer link offers booking. Covered by `serviceCta` tests in Task 2 and link tests in Task 6.
4. A `TODO(...)` inside policy text is stripped, and a section whose whole body is a TODO is dropped. Covered by `visibleSections` tests in Task 5.
5. A value in the embed snippet containing quotes or `</script>` cannot break out of the inline script. Covered by `calEmbedSnippet` tests in Task 8.
6. Uncommitted contact-page work (not on `main`) still says "no booking desk" and "No payment is asked". If it lands later, the file-scanning test in Task 4 fails and flags it.

---

### Task 1: Spike — Cal ID embed and redirect (manual, no code kept)

This decides whether Task 8 runs and which values it uses. Arpit does it in the Cal ID dashboard, or an agent does it in Chrome with his permission. Nothing is saved or changed in Cal ID in this task.

**Files:** none

- [ ] **Step 1: Find the embed snippet**

In Cal ID (app.cal.id), go to Event Types, open Vedic Astrology, and find **Embed** (often in the "⋯" menu or a share button). Choose **Inline embed** and copy the code without saving anything.

- [ ] **Step 2: Record the values**

Write down, in the task report:
- the script URL loaded by the snippet (Cal.com's is `https://app.cal.com/embed/embed.js`)
- the `origin` passed to `Cal("init", …)` (Cal.com's is `https://cal.com`)
- whether the snippet follows Cal.com's shape: a loader IIFE, then `Cal("init", namespace, {origin})`, then `Cal.ns[namespace]("inline", {elementOrSelector, calLink, config})`

If there is no Embed option, record **"no embed"**. Task 8 is then skipped and `/book` links out to Cal ID.

- [ ] **Step 3: Find the redirect setting**

In the same event type, find the setting for redirecting after booking (Cal.com calls it "Redirect on booking", under Advanced). Record where it is and whether it has a "forward parameters" option. Do not turn it on yet; Task 11 does that once `/booked` is deployed.

---

### Task 2: Test runner, booking content and booking helpers

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (scripts, devDependencies)
- Create: `src/content/booking.ts`
- Modify: `src/content/index.ts`
- Modify: `src/content/services.ts` (the `Service` type and the three entries)
- Create: `src/lib/booking.ts`
- Test: `src/lib/booking.test.ts`

**Interfaces:**
- Produces:
  - `consultationFee: { amount: 2151; display: '₹2,151' }` and `type Fee` from `@/content`
  - `booking` from `@/content`: `{ live: boolean; calBaseUrl: string; calUsername: string; embed: { scriptUrl: string; origin: string } | null; ctaLabel(fee: string): string; unsureLink: string; offerLine: string }`
  - `Service.booking: { calSlug: string; fee: Fee } | null`
  - From `@/lib/booking`: `type BookableService`, `isBookable(s)`, `bookableServices`, `calUrl(s)`, `calLink(s)`, `bookPageHref(s)`, `findBookable(slug: string): BookableService | undefined`, `serviceFee(s, onRequest)`, `type ServiceCta`, `serviceCta(s, live?)`, `serviceReassurance(s, live?)`

- [ ] **Step 1: Make a worktree and commit the design docs**

Prerequisite: the contact-page work (`src/content/contact.ts` `page` block, `src/components/sections/WhatHappensNext.tsx`, `src/components/sections/Contact.tsx`, `src/app/contact/page.tsx`) must be committed to `main` first. It is currently uncommitted in the shared directory, and Task 4 edits it. Stop and ask Arpit if it is not on `main`: `git cat-file -e main:src/components/sections/WhatHappensNext.tsx`.

```bash
cd "/Users/arpit/Astrology Website"
git worktree add ../astro-online-booking -b online-booking main
mkdir -p ../astro-online-booking/docs/superpowers/specs ../astro-online-booking/docs/superpowers/plans
cp docs/superpowers/specs/2026-09-26-online-booking-design.md ../astro-online-booking/docs/superpowers/specs/
cp docs/superpowers/plans/2026-09-26-online-booking.md ../astro-online-booking/docs/superpowers/plans/
cp .env.local ../astro-online-booking/ 2>/dev/null || true
cd ../astro-online-booking
npm install
git add docs/superpowers
git commit -m "Write down the online booking design and plan

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Every later step runs inside `../astro-online-booking`.

- [ ] **Step 2: Install Vitest and add the test script**

```bash
npm install --save-dev vitest
```

In `package.json` `scripts`, add after `"lint": "eslint"`:

```json
    "lint": "eslint",
    "test": "vitest run"
```

Create `vitest.config.ts`:

```ts
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/** Unit tests for the plain-TypeScript modules. Same `@/` alias as tsconfig. */
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 3: Write the failing tests**

Create `src/lib/booking.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { services, consultationFee, serviceDetail, booking } from '@/content';
import {
  bookableServices,
  bookPageHref,
  calLink,
  calUrl,
  findBookable,
  serviceCta,
  serviceFee,
  serviceReassurance,
} from './booking';

function service(slug: string) {
  const found = services.find((s) => s.slug === slug);
  if (!found) throw new Error(`No service ${slug}`);
  return found;
}

function bookable(slug: string) {
  const found = bookableServices.find((s) => s.slug === slug);
  if (!found) throw new Error(`${slug} is not bookable`);
  return found;
}

describe('consultationFee', () => {
  it('displays the amount the way an Indian reader writes it', () => {
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(consultationFee.amount);
    expect(consultationFee.display).toBe(formatted);
    expect(consultationFee.display).toBe('₹2,151');
  });
});

describe('bookableServices', () => {
  it('are Vedic Astrology and Numerology, and not Vastu', () => {
    expect(bookableServices.map((s) => s.slug)).toEqual(['vedic-astrology', 'numerology']);
  });

  it('each book the Cal ID event type with the same slug as its page', () => {
    for (const s of bookableServices) expect(s.booking.calSlug).toBe(s.slug);
  });
});

describe('Cal ID links', () => {
  it('builds the public booking page URL', () => {
    expect(calUrl(bookable('numerology'))).toBe('https://cal.id/anjali-jain13/numerology');
  });

  it('builds the username/slug path the embed expects', () => {
    expect(calLink(bookable('vedic-astrology'))).toBe('anjali-jain13/vedic-astrology');
  });

  it('links to /book with the service preselected', () => {
    expect(bookPageHref(bookable('numerology'))).toBe('/book/numerology');
  });
});

describe('findBookable', () => {
  it('finds a service booked online', () => {
    expect(findBookable('numerology')?.slug).toBe('numerology');
  });

  it.each([
    ['a service that is not booked online', 'vastu'],
    ['an unknown slug', 'tarot'],
    ['an empty slug', ''],
  ])('finds nothing for %s', (_label, slug) => {
    expect(findBookable(slug)).toBeUndefined();
  });
});

describe('serviceFee', () => {
  it('shows the price for a service booked online', () => {
    expect(serviceFee(service('numerology'), 'On request')).toBe('₹2,151');
  });

  it('shows the fallback for Vastu', () => {
    expect(serviceFee(service('vastu'), 'On request')).toBe('On request');
  });
});

describe('serviceCta', () => {
  it('offers WhatsApp everywhere while booking is not live', () => {
    for (const s of services) {
      const cta = serviceCta(s, false);
      expect(cta.kind).toBe('whatsapp');
      expect(cta.href.startsWith('https://wa.me/')).toBe(true);
      expect(cta.label).toBe(serviceDetail.ctaLabel);
    }
  });

  it('offers booking for a bookable service once live', () => {
    expect(serviceCta(service('numerology'), true)).toEqual({
      kind: 'book',
      href: '/book/numerology',
      label: 'Book a consultation · ₹2,151',
    });
  });

  it('keeps WhatsApp for Vastu even once live', () => {
    expect(serviceCta(service('vastu'), true).kind).toBe('whatsapp');
  });

  it('defaults to the live flag in content', () => {
    expect(serviceCta(service('numerology')).kind).toBe(booking.live ? 'book' : 'whatsapp');
  });
});

describe('serviceReassurance', () => {
  it('names the three months of calls on a bookable service once live', () => {
    expect(serviceReassurance(service('vedic-astrology'), true)).toBe(booking.offerLine);
  });

  it('keeps the general line for Vastu and while not live', () => {
    expect(serviceReassurance(service('vastu'), true)).toBe(serviceDetail.reassurance);
    expect(serviceReassurance(service('vedic-astrology'), false)).toBe(serviceDetail.reassurance);
  });
});
```

- [ ] **Step 4: Run the tests to check they fail**

Run: `npm test`
Expected: FAIL, with `consultationFee`/`booking` not exported from `@/content` and `./booking` not found.

- [ ] **Step 5: Add the booking content**

Create `src/content/booking.ts`:

```ts
/** Online booking: Cal ID for the calendar, Razorpay for payment. */

/**
 * The fee for the consultations booked online. `display` is written out, not
 * formatted at render, so other content modules (the FAQ) can quote it; a test
 * keeps it in step with `amount`.
 *
 * ₹2,151 leaves Anjali ₹2,100.24 after Razorpay's 2% plus 18% GST on that fee.
 */
export const consultationFee = { amount: 2151, display: '₹2,151' } as const;

export type Fee = typeof consultationFee;

export const booking = {
  /**
   * Off until Razorpay approves the live account. While false, service pages
   * keep their WhatsApp buttons, nothing links to /book, and /book is noindex.
   */
  live: false as boolean,
  calBaseUrl: 'https://cal.id',
  calUsername: 'anjali-jain13',
  /**
   * Cal ID's inline embed, from the Embed dialog in Cal ID. null shows a
   * plain link to the Cal ID page instead of an embedded calendar.
   */
  embed: null as { scriptUrl: string; origin: string } | null,
  ctaLabel: (fee: string) => `Book a consultation · ${fee}`,
  unsureLink: 'Not sure? Ask on WhatsApp',
  /** DRAFTED. What the fee buys beyond the session itself. */
  offerLine: 'Includes three months of calling Anjali directly.',
} as const;
```

In `src/content/index.ts`, add after `export * from './services';`:

```ts
export * from './booking';
```

- [ ] **Step 6: Mark which services are booked online**

In `src/content/services.ts`, add an import at the top (after the first comment line):

```ts
import { consultationFee, type Fee } from './booking';
```

Add to the `Service` type, after `youWillNeed: string;`:

```ts
  /** Booked and paid online through Cal ID. null: arranged on WhatsApp only. */
  booking: { calSlug: string; fee: Fee } | null;
```

Add to each entry, after its `youWillNeed` line:
- Vedic Astrology: `booking: { calSlug: 'vedic-astrology', fee: consultationFee },`
- Numerology: `booking: { calSlug: 'numerology', fee: consultationFee },`
- Vastu: `booking: null,`

- [ ] **Step 7: Add the booking helpers**

Create `src/lib/booking.ts`:

```ts
import { booking, services, serviceDetail, whatsappMessages, type Service } from '@/content';
import { whatsappHref } from './whatsapp';

/**
 * Which services are booked online, where their calendars live, and what a
 * service page offers as its main action.
 *
 * The one place a Cal ID URL is built, as lib/whatsapp.ts is for WhatsApp.
 */

export type BookableService = Service & { booking: NonNullable<Service['booking']> };

export function isBookable(service: Service): service is BookableService {
  return service.booking !== null;
}

export const bookableServices: BookableService[] = services.filter(isBookable);

/** The username/slug path the Cal embed expects. */
export function calLink(service: BookableService): string {
  return `${booking.calUsername}/${service.booking.calSlug}`;
}

/** The service's public page on Cal ID. */
export function calUrl(service: BookableService): string {
  return `${booking.calBaseUrl}/${calLink(service)}`;
}

export function bookPageHref(service: BookableService): string {
  return `/book/${service.slug}`;
}

/** The bookable service with this slug; undefined for Vastu or anything unknown. */
export function findBookable(slug: string): BookableService | undefined {
  return bookableServices.find((s) => s.slug === slug);
}

/** The price for a service booked online, or `onRequest` for one that is not. */
export function serviceFee(service: Service, onRequest: string): string {
  return isBookable(service) ? service.booking.fee.display : onRequest;
}

export type ServiceCta = { kind: 'book' | 'whatsapp'; href: string; label: string };

/** A service page's main button: booking once live, WhatsApp otherwise. */
export function serviceCta(service: Service, live: boolean = booking.live): ServiceCta {
  if (live && isBookable(service)) {
    return {
      kind: 'book',
      href: bookPageHref(service),
      label: booking.ctaLabel(service.booking.fee.display),
    };
  }
  return {
    kind: 'whatsapp',
    href: whatsappHref(whatsappMessages.service(service.name)),
    label: serviceDetail.ctaLabel,
  };
}

/** The line under a service page's main button. */
export function serviceReassurance(service: Service, live: boolean = booking.live): string {
  return live && isBookable(service) ? booking.offerLine : serviceDetail.reassurance;
}
```

- [ ] **Step 8: Run the tests to check they pass**

Run: `npm test`
Expected: PASS, all tests in `src/lib/booking.test.ts`.

- [ ] **Step 9: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 10: Tell future readers there is now a test suite**

In `CLAUDE.md`, replace the line starting `There is no test suite.` with:

```markdown
`npm test` runs Vitest unit tests for the plain-TypeScript modules in `src/lib` and `src/content`; there are no component or browser tests. Verify UI changes with lint, a type check, `npm run build`, and — for anything touching routing, API routes or env — `npm run preview`, since the Worker runtime can diverge from `next dev`.
```

and add `npm test             # vitest unit tests` to the commands block.

- [ ] **Step 11: Commit**

```bash
git add CLAUDE.md package.json package-lock.json vitest.config.ts src/content/booking.ts src/content/index.ts src/content/services.ts src/lib/booking.ts src/lib/booking.test.ts
git commit -m "Record which consultations can be booked online, and at what fee

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Prices and the booking button on the service pages and home list

**Files:**
- Modify: `src/content/services.ts` (`servicesSection`, `serviceDetail`)
- Modify: `src/components/sections/Services.tsx:63-70`
- Modify: `src/app/services/[slug]/page.tsx`

**Interfaces:**
- Consumes: `isBookable`, `serviceFee`, `serviceCta`, `serviceReassurance` from `@/lib/booking`; `booking.unsureLink`
- Produces: `servicesSection.priceOnRequest` (replaces `priceLine`), `serviceDetail.glanceLabels.length`, `serviceDetail.glanceLength`

- [ ] **Step 1: Update the service copy**

In `src/content/services.ts`, `servicesSection`: replace

```ts
  /** Shown on every row in place of a price. Pricing is never published. */
  priceLine: 'Fees shared on WhatsApp',
```

with

```ts
  /** Shown instead of a price for a service not booked online (Vastu). */
  priceOnRequest: 'Fees shared on WhatsApp',
```

In `serviceDetail`, replace the `glanceLabels` block, `glanceFees` and `reassurance` with:

```ts
  glanceLabels: {
    where: 'Where',
    languages: 'Languages',
    length: 'Length',
    youWillNeed: 'You will need',
    fees: 'Fees',
  },
  glanceWhere: 'In person in Palwal, or by phone',
  /** Services booked online only. The calendar blocks an hour; she does not stop at one. */
  glanceLength: 'No fixed time limit',
  glanceFees: 'Shared on WhatsApp',
  ctaLabel: 'Ask about this on WhatsApp',
  reassurance: 'Anjali replies herself. There is no assistant.',
```

- [ ] **Step 2: Show the price per row on the home page**

In `src/components/sections/Services.tsx`, add the import:

```ts
import { serviceFee } from '@/lib/booking';
```

Replace `{servicesSection.priceLine}` with:

```tsx
                      {serviceFee(service, servicesSection.priceOnRequest)}
```

- [ ] **Step 3: Price, length and main button on the service page**

In `src/app/services/[slug]/page.tsx`:

Change the content import to add `booking`:

```ts
import {
  services,
  howItWorks,
  site,
  whatsappMessages,
  serviceDetail,
  booking,
} from '@/content';
```

Add after the `whatsappHref` import:

```ts
import { SmartLink } from '@/components/ui/SmartLink';
import { isBookable, serviceCta, serviceReassurance } from '@/lib/booking';
```

Replace the `glance` array with:

```ts
  const glance = [
    { label: serviceDetail.glanceLabels.where, value: serviceDetail.glanceWhere },
    { label: serviceDetail.glanceLabels.languages, value: site.languages },
    ...(isBookable(service)
      ? [{ label: serviceDetail.glanceLabels.length, value: serviceDetail.glanceLength }]
      : []),
    { label: serviceDetail.glanceLabels.youWillNeed, value: service.youWillNeed },
    {
      label: serviceDetail.glanceLabels.fees,
      value: isBookable(service) ? service.booking.fee.display : serviceDetail.glanceFees,
    },
  ];

  const cta = serviceCta(service);
```

Replace the `<ButtonLink …>…</ButtonLink>` and the reassurance `<span>` in the aside with:

```tsx
            <ButtonLink href={cta.href} block>
              {cta.kind === 'whatsapp' && <WhatsAppIcon size={19} />}
              {cta.label}
            </ButtonLink>

            {/* Booking is the main action; WhatsApp stays for anyone unsure. */}
            {cta.kind === 'book' && (
              <SmartLink
                href={whatsappHref(whatsappMessages.service(service.name))}
                className="group inline-flex min-h-11 items-center justify-center gap-2 t-small font-semibold text-sindoor no-underline md:min-h-0"
              >
                {booking.unsureLink}
                <ArrowRightIcon size={15} className="nudge" />
              </SmartLink>
            )}

            <span className="t-caption text-muted">{serviceReassurance(service)}</span>
```

- [ ] **Step 4: Type-check, lint and test**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: no errors; tests PASS.

- [ ] **Step 5: Check the rendered pages**

Start the dev server in the background: `npm run dev -- -p 3100`

```bash
curl -s localhost:3100/services/numerology | grep -o '₹2,151\|No fixed time limit\|Ask about this on WhatsApp\|Book a consultation' | sort | uniq -c
curl -s localhost:3100/services/vastu | grep -o 'Shared on WhatsApp\|₹2,151\|No fixed time limit' | sort | uniq -c
curl -s localhost:3100/ | grep -o '₹2,151\|Fees shared on WhatsApp' | sort | uniq -c
```

Expected:
- numerology: `₹2,151`, `No fixed time limit` and `Ask about this on WhatsApp` each at least once; no `Book a consultation`, because `live` is false.
- vastu: `Shared on WhatsApp`; no `₹2,151` and no `No fixed time limit`.
- home: `₹2,151` twice or more and `Fees shared on WhatsApp` at least once.

Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add src/content/services.ts src/components/sections/Services.tsx "src/app/services/[slug]/page.tsx"
git commit -m "Show the consultation fee, and a booking button once booking is live

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Rewrite the copy that promised no payment and no booking

**Files:**
- Modify: `src/content/services.ts` (`howItWorks`)
- Modify: `src/content/faq.ts` (first item)
- Modify, **only if present on the branch**: `src/content/contact.ts` (`page.answeredBy.body`, `page.stepsLead`) and `src/components/sections/WhatHappensNext.tsx`. As of 2026-09-26 these are uncommitted work of unknown ownership in the shared directory and are not on `main`. Do not copy them into the worktree.
- Test: `src/content/content.test.ts`

**Interfaces:**
- Consumes: `consultationFee` from `./booking` in `faq.ts`

- [ ] **Step 1: Write the failing test**

Create `src/content/content.test.ts`:

```ts
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { faq, howItWorks } from '@/content';

/**
 * Lines that were true before online booking and are false after it. Scans
 * every content file rather than named fields, so copy added later (such as
 * the contact-page blocks still being written) is caught too.
 */
const retired = [/booking desk/i, /no payment is asked/i, /not listed here/i, /pricing is never published/i];

const dir = fileURLToPath(new URL('.', import.meta.url));
const contentFiles = readdirSync(dir).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'));

describe('copy that contradicts online booking', () => {
  it.each(retired.map((r) => [r]))('no content file says %s', (pattern) => {
    for (const file of contentFiles) {
      expect(readFileSync(`${dir}${file}`, 'utf8'), file).not.toMatch(pattern);
    }
  });

  it('no step of how it works is still a TODO', () => {
    for (const step of howItWorks) {
      expect(step.title).not.toMatch(/^TODO\(/);
      expect(step.body).not.toMatch(/^TODO\(/);
    }
  });

  it('the FAQ quotes the fee', () => {
    expect(faq.items[0].a).toContain('₹2,151');
  });
});
```

- [ ] **Step 2: Run it to check it fails**

Run: `npm test -- src/content/content.test.ts`
Expected: FAIL on `booking desk`, `no payment is asked`, `not listed here` and the TODO step.

- [ ] **Step 3: Rewrite how it works**

In `src/content/services.ts`, replace the whole `howItWorks` array (and its doc comment) with:

```ts
/**
 * How it works, shown on every service detail page and the contact page.
 * DRAFTED. Anjali reads and corrects it before it ships. It must read true for
 * Vastu too, which is arranged on WhatsApp rather than booked online.
 */
export const howItWorks = [
  {
    title: 'Book a time, or message her first',
    body:
      'A chart reading or numerology consultation can be booked and paid for ' +
      'online. For Vastu, or if you are not sure which you need, message her on ' +
      'WhatsApp and she will point you to the right one.',
  },
  {
    title: 'Send her the details she needs',
    body:
      'For a chart reading, your date, time and place of birth. For numerology, ' +
      'your full name and date of birth. For Vastu, a plan or photographs of the ' +
      'space. For a chart, the birth time matters more than most people expect, ' +
      'so check it beforehand if you can.',
  },
  {
    title: 'The consultation',
    body:
      'In person in Palwal or over the phone, in English or Hindi, whichever you ' +
      'are more comfortable with. There is no fixed time limit.',
  },
  {
    title: 'Three months of calls',
    body:
      'For three months after your consultation you can call Anjali directly ' +
      'with follow-up questions. If a remedy such as a Vastu yantra would help, ' +
      'she tells you what it costs first. Remedies are always optional.',
  },
] as const;
```

- [ ] **Step 4: Rewrite the contact page lines (only if `contactSection.page` exists)**

Skip this step if `src/content/contact.ts` has no `page` block. Otherwise, replace `answeredBy.body` with:

```ts
      body:
        'Every message is read and answered by Anjali. There is no assistant and no ' +
        'call centre, which is also why a reply can take a few hours rather than a ' +
        'few minutes.',
```

Replace `stepsLead` with:

```ts
    stepsLead:
      'Writing to her costs nothing and commits you to nothing. A chart reading or ' +
      'numerology consultation booked online is paid when you book.',
```

- [ ] **Step 5: Rewrite the FAQ fee answer**

In `src/content/faq.ts`, add at the top, after the first comment line:

```ts
import { consultationFee } from './booking';
```

Replace the first item's `a` with:

```ts
      a:
        `A Vedic astrology or numerology consultation is ${consultationFee.display}, and ` +
        'that includes three months of calling Anjali directly afterwards. Vastu depends ' +
        'on the space, so message her on WhatsApp and she will tell you the fee before ' +
        'anything is arranged.',
```

- [ ] **Step 6: Fit four steps on the contact page (only if the file exists)**

Skip if `src/components/sections/WhatHappensNext.tsx` is not on the branch. Otherwise, change the `<ol>` class `md:grid-cols-3` to `md:grid-cols-2 lg:grid-cols-4`.

- [ ] **Step 7: Run the tests to check they pass**

Run: `npm test && npx tsc --noEmit && npm run lint`
Expected: PASS, no errors.

- [ ] **Step 8: Commit**

```bash
git add src/content/services.ts src/content/faq.ts src/content/content.test.ts
# plus src/content/contact.ts and src/components/sections/WhatHappensNext.tsx if steps 4 and 6 ran
git commit -m "Stop promising no payment and no booking desk, and say what the fee covers

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: One policy-page component, and the privacy page moved onto it

The privacy page's TODO filtering moves into a tested helper, and its layout into a component that the terms and refund pages will reuse. What visitors see on `/privacy` does not change.

**Files:**
- Modify: `src/lib/todo.ts` (add `visibleSections`)
- Test: `src/lib/todo.test.ts`
- Create: `src/components/sections/PolicyDocument.tsx`
- Modify: `src/app/privacy/page.tsx`

**Interfaces:**
- Produces:
  - `visibleSections<T extends { heading: string; body: string }>(sections: readonly T[]): T[]` in `@/lib/todo`
  - `type PolicyDoc` and `PolicyDocument({ doc }: { doc: PolicyDoc })` in `@/components/sections/PolicyDocument`, where `PolicyDoc = { heading; intro; lastUpdatedLabel; lastUpdated; reachHeading; reachLink; reachNote: string; sections: readonly { heading: string; body: string }[] }`

- [ ] **Step 1: Write the failing test**

Create `src/lib/todo.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { visibleSections } from './todo';

describe('visibleSections', () => {
  it('keeps a section with real copy as it is', () => {
    const s = [{ heading: 'Why', body: 'So she can reply.' }];
    expect(visibleSections(s)).toEqual(s);
  });

  it('drops a section whose whole body is a TODO', () => {
    expect(visibleSections([{ heading: 'Kept for', body: 'TODO(retention-period)' }])).toEqual([]);
  });

  it('strips a TODO inside a paragraph but keeps the paragraph', () => {
    const [section] = visibleSections([
      { heading: 'Who', body: 'Anjali. Forminit stores it. TODO(forminit-link)' },
    ]);
    expect(section.body).toBe('Anjali. Forminit stores it.');
  });

  it('strips a TODO followed by a full stop', () => {
    const [section] = visibleSections([{ heading: 'Ask', body: 'Write to her. TODO(email). Soon.' }]);
    expect(section.body).toBe('Write to her. Soon.');
  });

  it('drops a section left empty after stripping', () => {
    expect(visibleSections([{ heading: 'X', body: '  TODO(a) TODO(b)' }])).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it to check it fails**

Run: `npm test -- src/lib/todo.test.ts`
Expected: FAIL, `visibleSections` is not exported.

- [ ] **Step 3: Add the helper**

Append to `src/lib/todo.ts`:

```ts
/**
 * The sections of a notice a visitor should see. A section whose whole body is
 * still a TODO is dropped. A TODO inside a real paragraph is stripped and the
 * paragraph kept, because the sentence around it still says something true.
 */
export function visibleSections<T extends { heading: string; body: string }>(
  sections: readonly T[],
): T[] {
  return sections
    .filter((section) => !isTodo(section.body))
    .map((section) => ({
      ...section,
      body: section.body.replace(/TODO\([^)]*\)\.?\s*/g, '').trim(),
    }))
    .filter((section) => section.body.length > 0);
}
```

- [ ] **Step 4: Run it to check it passes**

Run: `npm test -- src/lib/todo.test.ts`
Expected: PASS.

- [ ] **Step 5: Create the shared component**

Create `src/components/sections/PolicyDocument.tsx`:

```tsx
import { site } from '@/content';
import { SmartLink } from '@/components/ui/SmartLink';
import { Section, Container } from '@/components/ui/Section';
import { whatsappHref } from '@/lib/whatsapp';
import { present, visibleSections } from '@/lib/todo';

export type PolicyDoc = {
  heading: string;
  intro: string;
  lastUpdatedLabel: string;
  lastUpdated: string;
  reachHeading: string;
  reachLink: string;
  reachNote: string;
  sections: readonly { heading: string; body: string }[];
};

/**
 * A notice page: privacy, terms, refunds. Itemised sections, then how to reach
 * her about it. Unsupplied facts never reach the visitor (see visibleSections).
 */
export function PolicyDocument({ doc }: { doc: PolicyDoc }) {
  const lastUpdated = present(doc.lastUpdated);
  const sections = visibleSections(doc.sections);

  return (
    <Section className="pt-28 md:pt-40">
      <Container>
        <div className="flex max-w-[760px] flex-col gap-6">
          <h1 className="t-h1 m-0 text-ink">{doc.heading}</h1>

          {lastUpdated && <span className="t-small text-muted">{doc.lastUpdatedLabel} {lastUpdated}</span>}

          <p className="t-lead m-0">{doc.intro}</p>

          <div className="mt-6 flex flex-col gap-10">
            {sections.map((section) => (
              <div key={section.heading} className="flex flex-col gap-3">
                <h2 className="t-h3 m-0 text-ink">
                  {section.heading}
                </h2>
                <p className="t-body m-0">
                  {section.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-line-strong pt-6">
            <span className="font-display text-[19px] text-ink">{doc.reachHeading}</span>
            <span className="t-body">
              <SmartLink
                href={whatsappHref()}
                className="ink-link inline-flex min-h-11 items-center text-sindoor md:min-h-0"
              >
                {doc.reachLink}
              </SmartLink>
              {doc.reachNote}
            </span>
            <span className="t-small text-muted">
              {site.city}, {site.state}
            </span>
          </div>
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 6: Move the privacy page onto it**

Replace everything in `src/app/privacy/page.tsx` below the `metadata` export (keep the imports that are still used, the doc comment and `metadata`) so the file is:

```tsx
import type { Metadata } from 'next';
import { privacy } from '@/content';
import { PolicyDocument } from '@/components/sections/PolicyDocument';
import { pageMetadata } from '@/lib/metadata';

/**
 * How your details are used.
 *
 * Its own page, not a footer paragraph: India's DPDP Rules require the notice
 * to be clear, itemised and separate from any terms of service.
 *
 * DESIGN.md is explicit that a lawyer reviews this copy before it ships, and
 * four decisions are still open (retention period, an email address for
 * written requests, who handles complaints, whether analytics are added). So
 * the page is `noindex` until it has been reviewed — publishing an
 * unreviewed privacy notice to search engines is worse than not having one.
 *
 * To ship it: have the copy reviewed, fill the TODOs in content.ts, then
 * delete the `robots` block below.
 */
export const metadata: Metadata = {
  ...pageMetadata({ title: privacy.heading, description: privacy.metaDescription, path: '/privacy' }),
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return <PolicyDocument doc={privacy} />;
}
```

- [ ] **Step 7: Check the privacy page renders the same**

Compare against the last commit, which still has the old page. Use a scratch directory, not `/tmp`:

```bash
OUT=$(mktemp -d)
git stash push src/app/privacy/page.tsx
npm run dev -- -p 3100 &   # wait until it answers
curl -s localhost:3100/privacy > "$OUT/before.html"
git stash pop               # dev server hot-reloads the new page
sleep 3
curl -s localhost:3100/privacy > "$OUT/after.html"
kill %1
extract() { grep -o '<h[12][^>]*>[^<]*\|<p class="t-[a-z]* m-0">[^<]*' "$1"; }
diff <(extract "$OUT/before.html") <(extract "$OUT/after.html") && echo "privacy unchanged"
```

Expected: `privacy unchanged`.

- [ ] **Step 8: Type-check, lint, test**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: no errors; PASS.

- [ ] **Step 9: Commit**

```bash
git add src/lib/todo.ts src/lib/todo.test.ts src/components/sections/PolicyDocument.tsx src/app/privacy/page.tsx
git commit -m "Give notice pages one layout, so terms and refunds can share it

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Terms and refund pages, footer links, and privacy text for booking

**Files:**
- Create: `src/content/policies.ts`
- Modify: `src/content/index.ts`
- Create: `src/app/terms/page.tsx`
- Create: `src/app/refund-policy/page.tsx`
- Modify: `src/content/navigation.ts` (footer "Practice" column)
- Modify: `src/content/privacy.ts` (intro, "What is collected", "Who can see it")
- Test: `src/content/content.test.ts` (append)

**Interfaces:**
- Consumes: `PolicyDocument`, `PolicyDoc` from Task 5
- Produces: `terms` and `refundPolicy` from `@/content`, each shaped as `PolicyDoc` plus `metaDescription: string`

- [ ] **Step 1: Write the failing tests**

Append to `src/content/content.test.ts`:

```ts
import { footer, nav, terms, refundPolicy, privacy } from '@/content';

describe('policy pages', () => {
  it('are linked from the footer', () => {
    const hrefs = footer.columns.flatMap((c) => c.links.map((l) => l.href));
    expect(hrefs).toContain('/terms');
    expect(hrefs).toContain('/refund-policy');
  });

  it('nothing in the nav or footer links to booking pages yet', () => {
    const hrefs = [
      ...nav.links.map((l) => l.href),
      ...footer.columns.flatMap((c) => c.links.map((l) => l.href)),
    ];
    for (const href of hrefs) expect(href).not.toMatch(/^\/book/);
  });

  it('state the refund rules agreed with Anjali', () => {
    const text = refundPolicy.intro + refundPolicy.sections.map((s) => s.body).join(' ');
    expect(text).toMatch(/cannot be cancelled/);
    expect(text).toMatch(/charged twice/);
    expect(text).toMatch(/reschedule once, at least 24 hours before/);
  });

  it('say what the fee covers', () => {
    const text = terms.sections.map((s) => s.body).join(' ');
    expect(text).toMatch(/three months/);
    expect(text).toMatch(/not medical, legal or financial advice/);
  });

  it('privacy covers the booking and payment services', () => {
    const text = privacy.sections.map((s) => s.body).join(' ');
    expect(text).toMatch(/Cal ID/);
    expect(text).toMatch(/Razorpay/);
  });
});
```

Move the new `import` line to the top of the file, beside the existing import from `@/content`, and merge them into one import.

- [ ] **Step 2: Run to check it fails**

Run: `npm test -- src/content/content.test.ts`
Expected: FAIL, `terms`/`refundPolicy` are not exported and the footer links are missing.

- [ ] **Step 3: Write the policy content**

Create `src/content/policies.ts`:

```ts
/** Terms of consultation, and refunds and cancellations. */

/**
 * DRAFTED. Written from what Anjali decided, not by a lawyer. She reads and
 * corrects both before booking goes live; Razorpay's review reads them too.
 */

export const terms = {
  heading: 'Terms of consultation',
  metaDescription:
    'What your consultation fee covers, how booking and rescheduling work, and what a reading is and is not.',
  intro:
    'These terms apply when you book and pay for a consultation on this site. ' +
    'Refunds and cancellations have a page of their own.',
  lastUpdatedLabel: 'Last updated',
  lastUpdated: 'TODO(terms-last-updated-date)',
  reachHeading: 'Questions about these terms',
  reachLink: 'Message her on WhatsApp',
  reachNote: '. She answers these herself.',
  sections: [
    {
      heading: 'What your fee covers',
      body:
        'A Vedic astrology or numerology consultation with Anjali, in person in ' +
        'Palwal or by phone, in English or Hindi, with no fixed time limit. After ' +
        'it, three months of calling her directly with follow-up questions, counted ' +
        'from the date of your consultation.',
    },
    {
      heading: 'Booking and payment',
      body:
        'You choose a time on the booking page and pay the full fee when you book. ' +
        'Payment is handled by Razorpay. Your booking is confirmed as soon as the ' +
        'payment goes through, and the confirmation is sent to your email.',
    },
    {
      heading: 'Before your consultation',
      body:
        'For a chart reading, send Anjali your date, time and place of birth. For ' +
        'numerology, your full name and date of birth. Your confirmation has a ' +
        'link to send them on WhatsApp.',
    },
    {
      heading: 'Rescheduling',
      body:
        'You may reschedule once, at least 24 hours before your session, using ' +
        'the link in your confirmation email.',
    },
    {
      heading: 'Remedies',
      body:
        'If a remedy such as a Vastu yantra would help, Anjali tells you what it ' +
        'is and what it costs. Remedies are optional and are not included in the ' +
        'consultation fee.',
    },
    {
      heading: 'Vastu',
      body:
        'Vastu consultations are arranged on WhatsApp, not booked on this site. ' +
        'The fee is agreed with Anjali before anything is arranged.',
    },
    {
      heading: 'What a consultation is',
      body:
        'Guidance based on astrology, numerology or Vastu. It is not medical, ' +
        'legal or financial advice, and it does not replace advice from a ' +
        'qualified professional.',
    },
  ],
} as const;

export const refundPolicy = {
  heading: 'Refunds and cancellations',
  metaDescription:
    'Consultations cannot be cancelled. When a refund is given, and how to reschedule instead.',
  intro:
    'Consultations cannot be cancelled and fees are not refunded, except in the ' +
    'cases below.',
  lastUpdatedLabel: 'Last updated',
  lastUpdated: 'TODO(refund-policy-last-updated-date)',
  reachHeading: 'Asking for a refund',
  reachLink: 'Message her on WhatsApp',
  reachNote: ' with the name and email address you booked with.',
  sections: [
    {
      heading: 'When you get a refund',
      body:
        'You get a full refund if Anjali is unable to hold your session and a new ' +
        'time cannot be agreed, if you were charged twice for one booking, or if ' +
        'your payment went through but no booking was made. Any other genuine ' +
        'circumstance is considered by Anjali, and the decision is hers.',
    },
    {
      heading: 'Rescheduling instead',
      body:
        'You may reschedule once, at least 24 hours before your session, using the ' +
        'link in your confirmation email. A missed session is not refunded.',
    },
    {
      heading: 'The three months of calls',
      body:
        'The fee covers the consultation and the three months of calls together, ' +
        'so no part of it is refunded once the consultation has taken place.',
    },
    {
      heading: 'How refunds are paid',
      body: 'TODO(refund-timing: how many working days Razorpay takes to return money to the original payment method)',
    },
  ],
} as const;
```

In `src/content/index.ts`, add after `export * from './privacy';`:

```ts
export * from './policies';
```

- [ ] **Step 4: Create the two pages**

Create `src/app/terms/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { terms } from '@/content';
import { PolicyDocument } from '@/components/sections/PolicyDocument';
import { pageMetadata } from '@/lib/metadata';

/** noindex until Anjali has read it, like the privacy notice. */
export const metadata: Metadata = {
  ...pageMetadata({ title: terms.heading, description: terms.metaDescription, path: '/terms' }),
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return <PolicyDocument doc={terms} />;
}
```

Create `src/app/refund-policy/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { refundPolicy } from '@/content';
import { PolicyDocument } from '@/components/sections/PolicyDocument';
import { pageMetadata } from '@/lib/metadata';

/** noindex until Anjali has read it, like the privacy notice. */
export const metadata: Metadata = {
  ...pageMetadata({
    title: refundPolicy.heading,
    description: refundPolicy.metaDescription,
    path: '/refund-policy',
  }),
  robots: { index: false, follow: true },
};

export default function RefundPolicyPage() {
  return <PolicyDocument doc={refundPolicy} />;
}
```

- [ ] **Step 5: Link them from the footer**

In `src/content/navigation.ts`, in the `Practice` column's `links`, after the `/privacy` link, add:

```ts
        { label: 'Terms of consultation', href: '/terms' },
        { label: 'Refunds and cancellations', href: '/refund-policy' },
```

- [ ] **Step 6: Cover booking in the privacy notice**

In `src/content/privacy.ts`, replace `intro` with:

```ts
  intro:
    'This notice covers the contact form and online booking on this site. It is ' +
    'short and itemised on purpose, and separate from everything else.',
```

Replace the "What is collected" `body` with:

```ts
      body:
        'When you use the contact form, Anjali Jain receives your name, your phone ' +
        'number, your email address if you choose to give one, which service you are ' +
        'asking about, and whatever you write in the message box. When you book a ' +
        'consultation online, she receives your name, email address and phone number, ' +
        'the time you chose, and confirmation that you have paid. She never sees your ' +
        'card, bank or UPI details. Neither the form nor the booking asks for your ' +
        'date, time or place of birth. If a reading needs those, you send them to ' +
        'Anjali directly.',
```

Replace the "Who can see it" `body` with:

```ts
      body:
        'Anjali. The form is delivered by Forminit, a form service that stores your ' +
        'submission so she can read it. Bookings are handled by Cal ID, a scheduling ' +
        'service, and payments by Razorpay, a payment gateway. Each of them handles ' +
        'your details only to do that job. TODO(forminit-cal-id-razorpay-privacy-links)',
```

Change `lastUpdated` only if Anjali gives a date; leave the TODO otherwise.

- [ ] **Step 7: Run the tests to check they pass**

Run: `npm test && npx tsc --noEmit && npm run lint`
Expected: PASS, no errors.

- [ ] **Step 8: Check the pages render**

Start `npm run dev -- -p 3100`.

```bash
curl -s localhost:3100/terms | grep -o 'Terms of consultation\|three months\|noindex' | sort | uniq -c
curl -s localhost:3100/refund-policy | grep -o 'cannot be cancelled\|TODO\|How refunds are paid\|noindex' | sort | uniq -c
```

Expected: terms shows all three. Refund policy shows `cannot be cancelled` and `noindex`, and shows **neither** `TODO` nor `How refunds are paid`, because that section is dropped until its fact is supplied. Stop the server.

- [ ] **Step 9: Commit**

```bash
git add src/content/policies.ts src/content/index.ts src/app/terms/page.tsx src/app/refund-policy/page.tsx src/content/navigation.ts src/content/privacy.ts src/content/content.test.ts
git commit -m "Add terms and a refund policy, and cover booking in the privacy notice

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: The booking pages, linking out to Cal ID

`/book` shows the first bookable service, and `/book/<slug>` shows a chosen one. Both are static.

**Files:**
- Modify: `src/content/booking.ts` (add `page`)
- Create: `src/components/sections/BookingView.tsx`
- Create: `src/app/book/page.tsx`
- Create: `src/app/book/[service]/page.tsx`

**Interfaces:**
- Consumes: `bookableServices`, `findBookable`, `bookPageHref`, `calUrl`, `type BookableService` from `@/lib/booking`
- Produces: `booking.page` copy; `BookingView({ chosen }: { chosen: BookableService })`, whose calendar area is a single `<div className="mt-8">` that Task 8 replaces; `bookingMetadata(chosen: BookableService, path: string): Metadata` exported from `BookingView.tsx`

- [ ] **Step 1: Read the static-params docs**

Read `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-static-params.md` and the `dynamicParams` entry under `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/`. Confirm `export const dynamicParams = false` still makes unlisted params a 404 in this version. If it has been replaced, use what the docs say, and keep the behaviour: unknown slug gives a 404, and nothing renders per request.

- [ ] **Step 2: Add the page copy**

In `src/content/booking.ts`, add at the top:

```ts
import { whatsappMessages } from './site';
```

Add inside `booking`, after `offerLine`:

```ts
  /** The /book pages. DRAFTED. */
  page: {
    metaTitleFor: (name: string) => `Book a ${name} Consultation with Anjali Jain`,
    metaDescription:
      'Book a Vedic astrology or numerology consultation with Anjali Jain and pay ' +
      'online. In person in Palwal or by phone, in English or Hindi.',
    heading: 'Book a consultation',
    lead: 'Choose a time that suits you and pay online. Your booking is confirmed straight away.',
    detailsNote:
      'Nothing else is asked for here. After booking, you send Anjali your birth ' +
      'details on WhatsApp.',
    chooseLabel: 'Choose a consultation',
    pickTime: 'Choose a time',
    openCalendar: 'Open the calendar in a new tab',
    vastuNote: 'Looking for Vastu? It is arranged on WhatsApp.',
    vastuLink: 'Ask about Vastu',
    vastuMessage: whatsappMessages.service('Vastu'),
  },
```

- [ ] **Step 3: Create the shared view**

Create `src/components/sections/BookingView.tsx`:

```tsx
import type { Metadata } from 'next';
import { booking } from '@/content';
import { Section, Container } from '@/components/ui/Section';
import { ButtonLink } from '@/components/ui/Button';
import { SmartLink } from '@/components/ui/SmartLink';
import { ArrowRightIcon } from '@/components/ui/Icons';
import { bookableServices, bookPageHref, calUrl, type BookableService } from '@/lib/booking';
import { whatsappHref } from '@/lib/whatsapp';
import { pageMetadata } from '@/lib/metadata';

/**
 * Kept out of search until booking is live: an indexed page offering a
 * booking that cannot yet be paid for is worse than no page.
 */
export function bookingMetadata(chosen: BookableService, path: string): Metadata {
  return {
    ...pageMetadata({
      title: booking.page.metaTitleFor(chosen.name),
      description: booking.page.metaDescription,
      path,
    }),
    ...(booking.live ? {} : { robots: { index: false, follow: false } }),
  };
}

/**
 * Book and pay for a consultation. Cal ID does the calendar and the payment;
 * this view chooses the service and hands over.
 */
export function BookingView({ chosen }: { chosen: BookableService }) {
  const page = booking.page;

  return (
    <Section className="pt-28 md:pt-40">
      <Container>
        <div className="flex max-w-[760px] flex-col gap-5">
          <h1 className="t-h1 m-0 text-ink">{page.heading}</h1>
          <p className="t-lead m-0">{page.lead}</p>
          <p className="t-body m-0">
            {booking.offerLine} {page.detailsNote}
          </p>
        </div>

        <nav aria-label={page.chooseLabel} className="mt-10 flex flex-wrap gap-3">
          {bookableServices.map((service) => {
            const current = service.slug === chosen.slug;
            return (
              /*
                A plain <a>, not next/link: the calendar embed's script runs
                once per page load, so switching service must be a real load.
              */
              <a
                key={service.slug}
                href={bookPageHref(service)}
                aria-current={current ? 'page' : undefined}
                className={
                  'inline-flex min-h-11 items-center rounded-control border px-5 t-small font-semibold no-underline transition-colors duration-200 ' +
                  (current ? 'border-ink bg-ink text-card' : 'border-line-strong text-ink hover:border-ink')
                }
              >
                {service.name} · {service.booking.fee.display}
              </a>
            );
          })}
        </nav>

        <div className="mt-8">
          <div className="flex flex-col items-start gap-4 rounded-card border border-line-strong bg-card p-6 md:p-8">
            <span className="font-display text-[22px] text-ink md:text-[24px]">{chosen.name}</span>
            <span className="t-small text-muted">{chosen.question}</span>
            <ButtonLink href={calUrl(chosen)}>
              {page.pickTime}
              <ArrowRightIcon size={17} className="nudge" />
            </ButtonLink>
          </div>
        </div>

        <p className="t-small m-0 mt-8 text-muted">
          {page.vastuNote}{' '}
          <SmartLink href={whatsappHref(page.vastuMessage)} className="ink-link text-sindoor">
            {page.vastuLink}
          </SmartLink>
        </p>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 4: Create the two routes**

Create `src/app/book/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { BookingView, bookingMetadata } from '@/components/sections/BookingView';
import { bookableServices } from '@/lib/booking';

const chosen = bookableServices[0];

export const metadata: Metadata = bookingMetadata(chosen, '/book');

export default function BookPage() {
  return <BookingView chosen={chosen} />;
}
```

Create `src/app/book/[service]/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BookingView, bookingMetadata } from '@/components/sections/BookingView';
import { bookableServices, bookPageHref, findBookable } from '@/lib/booking';

/** One static page per service booked online; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return bookableServices.map((service) => ({ service: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}): Promise<Metadata> {
  const chosen = findBookable((await params).service);
  return chosen ? bookingMetadata(chosen, bookPageHref(chosen)) : {};
}

export default async function BookServicePage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const chosen = findBookable((await params).service);
  if (!chosen) notFound();
  return <BookingView chosen={chosen} />;
}
```

- [ ] **Step 5: Type-check, lint, test**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: no errors; PASS. If `bg-ink` is not a defined colour, check `src/app/globals.css` for the ink token name and use it.

- [ ] **Step 6: Check the pages are static and correct**

Run: `npm run build 2>&1 | grep -E "/book"`
Expected: `/book`, `/book/vedic-astrology` and `/book/numerology` are listed as static or SSG (○ or ●), not dynamic (ƒ).

Start `npm run dev -- -p 3100`.

```bash
curl -s localhost:3100/book | grep -o 'aria-current="page"[^>]*>[^<]*' | head -1
curl -s localhost:3100/book/numerology | grep -o 'cal.id/anjali-jain13/numerology' | head -1
curl -s localhost:3100/book/vastu -o /dev/null -w "%{http_code}\n"
curl -s localhost:3100/book/tarot -o /dev/null -w "%{http_code}\n"
curl -s localhost:3100/book | grep -o 'noindex'
```

Expected: the first shows Vedic Astrology as current, the second prints the Numerology Cal ID URL, the third and fourth print `404`, and the fifth prints `noindex`. Stop the server.

- [ ] **Step 7: Commit**

```bash
git add src/content/booking.ts src/components/sections/BookingView.tsx src/app/book
git commit -m "Add booking pages that hand over to Cal ID for the chosen consultation

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Embed the Cal ID calendar on /book

**Skip this task** if Task 1 recorded "no embed". `/book` then keeps its link.

If Task 1 found a snippet shaped differently from Cal.com's, change `LOADER` and the `Cal(...)` calls in `calEmbedSnippet` to match Cal ID's snippet exactly, and update the test expectations to match.

**Files:**
- Create: `src/lib/cal-embed.ts`
- Test: `src/lib/cal-embed.test.ts`
- Create: `src/components/ui/CalInline.tsx`
- Modify: `src/content/booking.ts` (`embed`)
- Modify: `src/components/sections/BookingView.tsx` (the `<div className="mt-8">` block)

**Interfaces:**
- Consumes: `calLink`, `calUrl` from `@/lib/booking`; the values from Task 1
- Produces: `calEmbedSnippet(o: { scriptUrl; origin; namespace; calLink; elementId: string }): string`; `CalInline({ namespace, calLink, scriptUrl, origin })`

- [ ] **Step 1: Write the failing test**

Create `src/lib/cal-embed.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { calEmbedSnippet } from './cal-embed';

const base = {
  scriptUrl: 'https://app.cal.id/embed/embed.js',
  origin: 'https://cal.id',
  namespace: 'numerology',
  calLink: 'anjali-jain13/numerology',
  elementId: 'cal-inline-numerology',
};

describe('calEmbedSnippet', () => {
  it('loads the embed script and starts an inline calendar for the event', () => {
    const js = calEmbedSnippet(base);
    expect(js).toContain('"https://app.cal.id/embed/embed.js"');
    expect(js).toContain('Cal("init", "numerology", { origin: "https://cal.id" })');
    expect(js).toContain('Cal.ns["numerology"]("inline"');
    expect(js).toContain('elementOrSelector: "#cal-inline-numerology"');
    expect(js).toContain('calLink: "anjali-jain13/numerology"');
  });

  it('cannot be broken out of by a value containing quotes or a closing script tag', () => {
    const js = calEmbedSnippet({ ...base, calLink: 'x"); alert(1); ("</script><script>' });
    expect(js).not.toContain('</script>');
    expect(js).toContain('calLink: "x\\"); alert(1); (\\"\\u003c/script>\\u003cscript>"');
  });
});
```

- [ ] **Step 2: Run to check it fails**

Run: `npm test -- src/lib/cal-embed.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Write the snippet builder**

Create `src/lib/cal-embed.ts`:

```ts
/**
 * The inline script that shows a Cal ID calendar inside a page.
 *
 * LOADER is Cal.com's published embed loader, which Cal ID (a Cal.com fork)
 * uses too; checked against Cal ID's Embed dialog (booking plan, Task 1). It
 * queues calls until embed.js arrives. Every value is JSON-encoded with `<`
 * escaped, so nothing in it can end the script tag.
 */

const LOADER =
  '(function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; ' +
  'C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { ' +
  'cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; ' +
  'cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; ' +
  'const namespace = ar[1]; api.q = api.q || []; if (typeof namespace === "string") { ' +
  'cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); ' +
  'p(cal, ["initNamespace", namespace]); } else p(cal, ar); return; } p(cal, ar); }; })';

type EmbedOptions = {
  scriptUrl: string;
  origin: string;
  namespace: string;
  calLink: string;
  elementId: string;
};

function js(value: string): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function calEmbedSnippet(o: EmbedOptions): string {
  const ns = js(o.namespace);
  return [
    `${LOADER}(window, ${js(o.scriptUrl)}, "init");`,
    `Cal("init", ${ns}, { origin: ${js(o.origin)} });`,
    `Cal.ns[${ns}]("inline", { elementOrSelector: ${js(`#${o.elementId}`)}, calLink: ${js(o.calLink)}, config: { layout: "month_view" } });`,
    `Cal.ns[${ns}]("ui", { layout: "month_view" });`,
  ].join('\n');
}
```

- [ ] **Step 4: Run to check it passes**

Run: `npm test -- src/lib/cal-embed.test.ts`
Expected: PASS.

- [ ] **Step 5: Create the embed component**

Create `src/components/ui/CalInline.tsx`:

```tsx
import Script from 'next/script';
import { calEmbedSnippet } from '@/lib/cal-embed';

type Props = { namespace: string; calLink: string; scriptUrl: string; origin: string };

/**
 * A Cal ID calendar inside the page. The container holds its height while the
 * calendar loads, so the page does not jump.
 */
export function CalInline({ namespace, calLink, scriptUrl, origin }: Props) {
  const elementId = `cal-inline-${namespace}`;
  return (
    <>
      <div
        id={elementId}
        className="min-h-[640px] w-full overflow-hidden rounded-card border border-line-strong bg-card"
      />
      <Script
        id={`cal-embed-${namespace}`}
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: calEmbedSnippet({ scriptUrl, origin, namespace, calLink, elementId }),
        }}
      />
    </>
  );
}
```

- [ ] **Step 6: Turn the embed on**

In `src/content/booking.ts`, replace `embed: null as { scriptUrl: string; origin: string } | null,` with the values from Task 1, for example:

```ts
  embed: { scriptUrl: 'https://app.cal.id/embed/embed.js', origin: 'https://cal.id' } as
    | { scriptUrl: string; origin: string }
    | null,
```

Use the exact script URL and origin Task 1 recorded, not this example.

- [ ] **Step 7: Use it in the booking view**

In `src/components/sections/BookingView.tsx`, add the imports:

```ts
import { CalInline } from '@/components/ui/CalInline';
import { calLink } from '@/lib/booking';
```

(merge `calLink` into the existing `@/lib/booking` import). Replace the `<div className="mt-8">…</div>` block with:

```tsx
        <div className="mt-8">
          {booking.embed ? (
            <>
              <CalInline
                key={chosen.slug}
                namespace={chosen.slug}
                calLink={calLink(chosen)}
                scriptUrl={booking.embed.scriptUrl}
                origin={booking.embed.origin}
              />
              <SmartLink
                href={calUrl(chosen)}
                className="ink-link mt-4 inline-flex min-h-11 items-center t-small text-sindoor md:min-h-0"
              >
                {page.openCalendar}
              </SmartLink>
            </>
          ) : (
            <div className="flex flex-col items-start gap-4 rounded-card border border-line-strong bg-card p-6 md:p-8">
              <span className="font-display text-[22px] text-ink md:text-[24px]">{chosen.name}</span>
              <span className="t-small text-muted">{chosen.question}</span>
              <ButtonLink href={calUrl(chosen)}>
                {page.pickTime}
                <ArrowRightIcon size={17} className="nudge" />
              </ButtonLink>
            </div>
          )}
        </div>
```

- [ ] **Step 8: Check it in a browser at phone and desktop width**

Run `npm run dev -- -p 3100`, then open `http://localhost:3100/book/numerology` at 375px and at 1280px wide (Playwright or Chrome device mode). Expected: Numerology's month calendar appears inside the page with no horizontal scroll at 375px, and clicking the Vedic Astrology switch loads its calendar. If the calendar does not appear after 10 seconds, or scrolls sideways on a phone, set `embed` back to `null`, note why in the commit message, and keep the link-out. Stop the server.

- [ ] **Step 9: Type-check, lint, test, commit**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: no errors; PASS.

```bash
git add src/lib/cal-embed.ts src/lib/cal-embed.test.ts src/components/ui/CalInline.tsx src/content/booking.ts src/components/sections/BookingView.tsx
git commit -m "Show the Cal ID calendar on the booking page itself

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: The /booked thank-you page

Cal ID redirects to `/booked/<slug>` after payment (set per event type in Task 11). `/booked` alone is the generic version. Both are static.

**Files:**
- Modify: `src/content/booking.ts` (add `booked`, `detailsMessage`)
- Modify: `src/lib/booking.ts` (add `bookedCopy`, `detailsMessage`, `detailsHref`)
- Test: `src/lib/booking.test.ts` (append)
- Create: `src/components/sections/BookedView.tsx`
- Create: `src/app/booked/page.tsx`
- Create: `src/app/booked/[service]/page.tsx`

**Interfaces:**
- Consumes: `bookableServices`, `findBookable`, `BookableService` from Task 2
- Produces: `bookedCopy(s | null): { heading: string; body: string }`, `detailsMessage(s | null): string`, `detailsHref(s | null): string`

- [ ] **Step 1: Write the failing tests**

Append to `src/lib/booking.test.ts` (merge the new names into the existing `./booking` import, and add `booking` to the `@/content` import if missing):

```ts
import { bookedCopy, detailsHref, detailsMessage } from './booking';

describe('bookedCopy', () => {
  it('names the consultation when the service is known', () => {
    expect(bookedCopy(bookable('numerology')).heading).toBe('Your Numerology consultation is booked');
  });

  it('does not claim a booking when opened without one', () => {
    const copy = bookedCopy(null);
    expect(copy.heading).toBe(booking.booked.genericHeading);
    expect(copy.heading + copy.body).not.toMatch(/is booked/);
  });
});

describe('detailsMessage', () => {
  it('asks for the numerology details only', () => {
    expect(detailsMessage(bookable('numerology'))).toBe(
      'Hello Anjali, I have just booked a Numerology consultation. My details:\n\n' +
        'Full name:\nDate of birth:',
    );
  });

  it('asks for the birth details for a chart reading', () => {
    expect(detailsMessage(bookable('vedic-astrology'))).toBe(
      'Hello Anjali, I have just booked a Vedic Astrology consultation. My details:\n\n' +
        'Date of birth:\nTime of birth:\nPlace of birth:',
    );
  });

  it('lists every field when the service is unknown', () => {
    expect(detailsMessage(null)).toBe(
      'Hello Anjali, I have just booked a consultation. My details:\n\n' +
        'Full name:\nDate of birth:\nTime of birth:\nPlace of birth:',
    );
  });

  it('has a details list for every bookable service', () => {
    for (const s of bookableServices) expect(booking.detailsMessage.lines[s.slug]).toBeDefined();
  });

  it('is sent as an encoded WhatsApp link', () => {
    const href = detailsHref(bookable('numerology'));
    expect(href.startsWith('https://wa.me/')).toBe(true);
    expect(href).toContain('%0A');
    expect(href).not.toContain('\n');
  });
});
```

Move the import line to the top of the file with the others.

- [ ] **Step 2: Run to check they fail**

Run: `npm test -- src/lib/booking.test.ts`
Expected: FAIL, the new functions are not exported.

- [ ] **Step 3: Add the copy**

In `src/content/booking.ts`, inside `booking`, after `page`, add:

```ts
  /** The /booked page Cal ID sends people to after paying. DRAFTED. */
  booked: {
    metaTitle: 'Booking Received',
    metaDescription: 'Your consultation with Anjali Jain, and the details to send her.',
    headingFor: (name: string) => `Your ${name} consultation is booked`,
    body:
      'The confirmation is on its way to your email. One more step: send Anjali ' +
      'the details she needs for your reading.',
    genericHeading: 'Thank you',
    genericBody:
      'If you have just booked a consultation, the confirmation is on its way to ' +
      'your email. Send Anjali the details she needs for your reading on WhatsApp.',
    detailsCta: 'Send your details on WhatsApp',
  },
  /** The prefilled WhatsApp message from /booked. One field per line, left blank to fill in. */
  detailsMessage: {
    openerFor: (name: string) => `Hello Anjali, I have just booked a ${name} consultation. My details:`,
    opener: 'Hello Anjali, I have just booked a consultation. My details:',
    lines: {
      'vedic-astrology': ['Date of birth:', 'Time of birth:', 'Place of birth:'],
      numerology: ['Full name:', 'Date of birth:'],
    } as Record<string, readonly string[]>,
    combined: ['Full name:', 'Date of birth:', 'Time of birth:', 'Place of birth:'],
  },
```

- [ ] **Step 4: Add the helpers**

Append to `src/lib/booking.ts`:

```ts
export function bookedCopy(service: BookableService | null): { heading: string; body: string } {
  const copy = booking.booked;
  return service
    ? { heading: copy.headingFor(service.name), body: copy.body }
    : { heading: copy.genericHeading, body: copy.genericBody };
}

/** The WhatsApp message listing the details this consultation needs. */
export function detailsMessage(service: BookableService | null): string {
  const m = booking.detailsMessage;
  const opener = service ? m.openerFor(service.name) : m.opener;
  const lines = (service && m.lines[service.slug]) || m.combined;
  return [opener, '', ...lines].join('\n');
}

export function detailsHref(service: BookableService | null): string {
  return whatsappHref(detailsMessage(service));
}
```

- [ ] **Step 5: Run to check they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Create the view and the two routes**

Create `src/components/sections/BookedView.tsx`:

```tsx
import { booking } from '@/content';
import { Section, Container } from '@/components/ui/Section';
import { ButtonLink } from '@/components/ui/Button';
import { WhatsAppIcon } from '@/components/ui/Icons';
import { bookedCopy, detailsHref, type BookableService } from '@/lib/booking';

/**
 * Where Cal ID sends a customer after paying. Its job is the one step Cal ID
 * cannot do: getting the birth details to Anjali on WhatsApp. The URL only
 * chooses wording; nothing here is proof of a booking.
 */
export function BookedView({ service }: { service: BookableService | null }) {
  const copy = bookedCopy(service);

  return (
    <Section className="pt-28 md:pt-40">
      <Container>
        <div className="flex max-w-[640px] flex-col items-start gap-6">
          <h1 className="t-h1 m-0 text-ink">{copy.heading}</h1>
          <p className="t-lead m-0">{copy.body}</p>
          <ButtonLink href={detailsHref(service)}>
            <WhatsAppIcon size={19} />
            {booking.booked.detailsCta}
          </ButtonLink>
          <p className="t-body m-0">{booking.offerLine}</p>
        </div>
      </Container>
    </Section>
  );
}
```

Create `src/app/booked/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { booking } from '@/content';
import { BookedView } from '@/components/sections/BookedView';
import { pageMetadata } from '@/lib/metadata';

/** Never indexed. */
export const metadata: Metadata = {
  ...pageMetadata({ title: booking.booked.metaTitle, description: booking.booked.metaDescription, path: '/booked' }),
  robots: { index: false, follow: false },
};

export default function BookedPage() {
  return <BookedView service={null} />;
}
```

Create `src/app/booked/[service]/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { booking } from '@/content';
import { BookedView } from '@/components/sections/BookedView';
import { bookableServices, findBookable } from '@/lib/booking';
import { pageMetadata } from '@/lib/metadata';

/** One static page per service booked online; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return bookableServices.map((service) => ({ service: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}): Promise<Metadata> {
  const { service } = await params;
  return {
    ...pageMetadata({
      title: booking.booked.metaTitle,
      description: booking.booked.metaDescription,
      path: `/booked/${service}`,
    }),
    robots: { index: false, follow: false },
  };
}

export default async function BookedServicePage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const service = findBookable((await params).service);
  if (!service) notFound();
  return <BookedView service={service} />;
}
```

- [ ] **Step 7: Check the pages**

Run: `npm run build 2>&1 | grep -E "/booked"`
Expected: `/booked`, `/booked/vedic-astrology` and `/booked/numerology` are static (○ or ●), not dynamic (ƒ).

Start `npm run dev -- -p 3100`.

```bash
curl -s localhost:3100/booked/numerology | grep -o 'Your Numerology consultation is booked\|Full%20name' | sort -u
curl -s localhost:3100/booked | grep -o 'Thank you\|is booked' | sort -u
curl -s localhost:3100/booked | grep -o 'noindex'
curl -s localhost:3100/booked/vastu -o /dev/null -w "%{http_code}\n"
```

Expected: the first prints both strings, the second prints only `Thank you`, the third prints `noindex`, and the fourth prints `404`. Stop the server.

- [ ] **Step 8: Type-check, lint, commit**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

```bash
git add src/content/booking.ts src/lib/booking.ts src/lib/booking.test.ts src/components/sections/BookedView.tsx src/app/booked
git commit -m "Add a thank-you page that gets the birth details to Anjali on WhatsApp

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Prices in the structured data

**Files:**
- Modify: `src/lib/structured-data.ts` (doc comment and `hasOfferCatalog`)
- Test: `src/lib/structured-data.test.ts`

**Interfaces:**
- Consumes: `Service.booking` from Task 2

- [ ] **Step 1: Write the failing test**

Create `src/lib/structured-data.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { siteGraph } from './structured-data';

type Offer = { itemOffered: { '@id': string }; price?: string; priceCurrency?: string };

function offers(): Offer[] {
  const graph = siteGraph()['@graph'] as unknown as Array<Record<string, unknown>>;
  const business = graph.find((n) => n['@type'] === 'ProfessionalService') as {
    hasOfferCatalog: { itemListElement: Offer[] };
  };
  return business.hasOfferCatalog.itemListElement;
}

function offerFor(slug: string) {
  const offer = offers().find((o) => o.itemOffered['@id'].includes(`/services/${slug}#`));
  if (!offer) throw new Error(`No offer for ${slug}`);
  return offer;
}

describe('offer catalogue', () => {
  it.each(['vedic-astrology', 'numerology'])('gives %s its price in rupees', (slug) => {
    expect(offerFor(slug)).toMatchObject({ price: '2151', priceCurrency: 'INR' });
  });

  it('gives Vastu no price', () => {
    const vastu = offerFor('vastu');
    expect(vastu.price).toBeUndefined();
    expect(vastu.priceCurrency).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run to check it fails**

Run: `npm test -- src/lib/structured-data.test.ts`
Expected: FAIL, no `price` on the offers.

- [ ] **Step 3: Add the prices**

In `src/lib/structured-data.ts`, in the top doc comment, replace `no price data (there is none to publish), and no` with `prices only for the consultations booked online, and no`.

Replace the `itemListElement` mapping with:

```ts
          itemListElement: services.map((service) => ({
            '@type': 'Offer',
            itemOffered: { '@id': serviceId(service) },
            ...(service.booking
              ? { price: String(service.booking.fee.amount), priceCurrency: 'INR' }
              : {}),
          })),
```

- [ ] **Step 4: Run to check it passes, then type-check and lint**

Run: `npm test && npx tsc --noEmit && npm run lint`
Expected: PASS, no errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/structured-data.ts src/lib/structured-data.test.ts
git commit -m "Tell search engines the consultation fee

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Full check, then the Cal ID settings that point at the site

**Files:** none changed permanently.

- [ ] **Step 1: Full build**

Run: `npm test && npm run lint && npm run build`
Expected: all pass. The build lists `/book`, `/booked`, `/terms` and `/refund-policy`. Also run the Cloudflare build (`npm run preview` or whichever OpenNext script `package.json` defines) and open `/book/numerology`, `/booked/numerology` and `/book/vastu` (404) on it.

- [ ] **Step 2: Phone width, every new or changed page**

Start `npm run dev -- -p 3100` in the background, then run (install the browser first with `npx playwright install chromium` if it is missing):

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 375, height: 800 } });
  const paths = ['/', '/services/numerology', '/services/vastu', '/contact', '/book', '/book/numerology', '/booked', '/booked/vedic-astrology', '/terms', '/refund-policy', '/privacy'];
  for (const path of paths) {
    await page.goto('http://localhost:3100' + path, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    console.log(overflow > 0 ? 'OVERFLOW ' + overflow + 'px' : 'ok      ', path);
  }
  await browser.close();
})();"
```

Expected: every line starts with `ok`. Fix any overflow before going on.

- [ ] **Step 3: Check the live switch without committing it**

Set `live: false as boolean` to `live: true as boolean` in `src/content/booking.ts`. Reload `/services/numerology`: the main button reads "Book a consultation · ₹2,151" and goes to `/book/numerology`, the "Not sure? Ask on WhatsApp" link sits under it, and the line under that reads "Includes three months of calling Anjali directly." `/services/vastu` is unchanged. `/book` no longer has `noindex`. Then revert:

```bash
git checkout src/content/booking.ts
git diff --exit-code src/content/booking.ts && echo "live flag reverted"
```

Expected: `live flag reverted`. Stop the dev server.

- [ ] **Step 4: TODO report**

Run: `grep -rn "TODO(" src/ | grep -v "\.test\.ts"`
Expected: only markers waiting on Anjali or Arpit (for example `TODO(email-address)`, `TODO(refund-timing…)`, the policy dates, the service `covers`). List them in the handoff.

- [ ] **Step 5: Hand the Cal ID steps to Arpit**

These happen in the Cal ID dashboard, not in code. Merge to `main` and deploy to Cloudflare first (with `booking.live` still false), because the redirect needs `/booked` online. Report them to Arpit as a checklist:

1. Both event types: minimum notice 12–24 hours, the same two locations (Palwal in person and phone), buffer 30 minutes after, limit 4 a day.
2. Both event types, **redirect on booking**: `https://anjali-vastu-portfolio.jainarpit2004.workers.dev/booked/vedic-astrology` on Vedic Astrology and `…/booked/numerology` on Numerology. Leave any "forward parameters" option off.
3. Workflows: the confirmation email (WhatsApp link, her number, the three-month line, one reschedule at least 24 hours before) and a reminder 24 hours before. Email only; the free plan caps SMS and WhatsApp at 10.
4. Run the spec's Cal ID test checklist in Razorpay test mode (`success@razorpay`, `failure@razorpay`), and confirm the redirect lands on `/booked` with the right WhatsApp message.
5. Repeat step 4 after 10 October 2026, when the account moves to the free plan.
6. Before live mode: regenerate the Razorpay keys (the test secret was pasted in chat), supply the email address, ask Razorpay whether astrology is accepted, have Anjali read the terms, refund policy and privacy notice, then apply. On approval: live keys in Cal ID, `live: true` in `src/content/booking.ts`, deploy, one real booking.

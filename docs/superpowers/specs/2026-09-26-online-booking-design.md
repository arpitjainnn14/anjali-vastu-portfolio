# Online booking and payment — design

Date: 2026-09-26
Status: approved 2026-09-26

## Goal

Let a visitor book and pay for a Vedic Astrology or Numerology consultation
from the site, without a WhatsApp conversation first, while keeping WhatsApp
as the route for Vastu and for anyone unsure.

Success: a customer can pick a slot, pay ₹2,151 through Razorpay, and get a
confirmation, with no action needed from Anjali; and Razorpay's website review
passes.

## Decisions (agreed in conversation)

| Topic | Decision |
|---|---|
| Platform | Cal ID (free Startup plan, account `anjali-jain13`) with its Razorpay app. No custom booking backend. |
| Budget | Razorpay's per-transaction fee (2% + 18% GST on the fee) is the only running cost. |
| Confirmation | A paid booking confirms automatically. Anjali does not approve bookings. |
| Services online | Vedic Astrology and Numerology only. Vastu stays WhatsApp-only, price on request. |
| Price | ₹2,151 each. Anjali receives ₹2,100.24 on a domestic payment. |
| What the fee buys | The consultation plus three months of calling Anjali directly. |
| Session length | No fixed limit for the customer. The calendar blocks 60 min, plus a 30 min buffer, max 4 bookings a day. |
| Intake | `/book` and Cal ID ask only name, email and phone. Birth details are sent on WhatsApp after booking, from a link in the confirmation email. |
| Cancellation | No cancellations. One reschedule, at least 24 hours before. |
| Refunds | None, except for a genuine cause: Anjali cannot hold the session, a duplicate charge, payment taken without a booking, or other cases at her discretion. |
| Remedies | Vastu yantras and other remedies are optional, charged separately, and arranged on WhatsApp. Never sold on the site. |
| WhatsApp on Astrology/Numerology pages | Stays, as a smaller "Not sure? Ask on WhatsApp" link under the booking button. |

## Out of scope

- A custom booking system, database or admin panel.
- Automated WhatsApp messages (paid API). Confirmation and reminders are email only.
- Online Vastu booking and selling yantras.
- Hosting. Already moved (by another session, 2026-09-26) from Vercel Hobby to Cloudflare
  Workers Free via OpenNext: https://anjali-vastu-portfolio.jainarpit2004.workers.dev.
  New pages must not use `revalidate` (read-only static-assets incremental cache).
- Buying a custom domain.

## Part A — Cal ID and Razorpay configuration (done by Arpit in the dashboards)

Already done, and checked on the public page on 2026-09-26:
- Bio replaced; the three default event types removed.
- `vedic-astrology` and `numerology` event types, 60 min, Asia/Kolkata.

Still to fix (found on the public pages):
1. ~~No price shows on either event type.~~ Both show ₹2,151.00. Which Razorpay
   account and mode the app is connected to is unverified: Cal ID supports live mode only.
2. **A slot 2 hours ahead was bookable.** Minimum notice is not set. Set 12 or 24 hours.
3. **Locations differ.** Vedic Astrology offers Google Meet, Palwal and Organizer
   Phone Number; Numerology offers two. Make them match. Drop Google Meet unless
   video is wanted; the site only promises in person or by phone.
4. **Trial.** Cancelled; Business stays active until 10 Oct 2026, then the account
   drops to Startup. Startup includes (per cal.id/pricing, 2026-09-26): Razorpay
   payments, unlimited email workflows, 10 SMS and 10 WhatsApp workflows, brand
   colours, custom redirect after booking, webhooks and API. Everything in this
   design uses only Startup features. Do not rely on SMS or WhatsApp workflows.
   Re-run the test checklist after 10 Oct.

Still to do:
- Workflows: confirmation email (with WhatsApp link, her number and the three-month
  line) and a 24 hour reminder.
- Connect Google Calendar.
- Razorpay: Cal ID's app connects to an activated live account only (no key fields,
  no test mode). Connect it after activation (rollout step 4).

Anjali's phone number appears only in the confirmation email and Cal ID's
"Organizer Phone Number" location, which paying customers see after booking. The
site itself still never displays it (see `contact.phoneDisplay` comment).

## Part B — Site changes

All copy goes in `src/content/`, as the repo requires. Unsupplied facts stay as
`TODO(...)` markers.

### B1. Content model

`src/content/services.ts` — add to `Service`:

```ts
/** Online booking. null means the service is arranged on WhatsApp only. */
booking: { calSlug: string; price: string } | null;
```

- Vedic Astrology: `{ calSlug: 'vedic-astrology', price: '₹2,151' }`
- Numerology: `{ calSlug: 'numerology', price: '₹2,151' }`
- Vastu: `null`

A new `src/content/booking.ts` holds the `/book` page copy, button labels,
the three-month offer line, and the Cal ID username. It is exported from
`src/content/index.ts`.

A `bookingHref(slug)` helper in `src/lib/booking.ts` is the one place a Cal ID
URL is built, mirroring `src/lib/whatsapp.ts`.

### B2. Service detail page (`src/app/services/[slug]/page.tsx`)

When `service.booking` is set:
- The "At a glance" card's Fees row shows `₹2,151` and a "Length" row reads
  "No fixed time limit".
- The main button becomes **Book a consultation · ₹2,151**, linking to
  `/book/<slug>`.
- Under it, a text link: **Not sure? Ask on WhatsApp →** using the existing
  `whatsappHref(whatsappMessages.service(...))`.
- The reassurance line changes from "no booking desk" to one about the three months
  of direct calls.

When `service.booking` is `null` (Vastu), the page is unchanged.

### B3. Home services list (`src/components/sections/Services.tsx`)

`priceLine` becomes per service: `₹2,151` for bookable services, "Fees shared on
WhatsApp" for Vastu.

### B4. `/book` page (new, `src/app/book/page.tsx`)

- Heading, a one-line lead, the three-month offer, and a note that birth details
  are asked for on WhatsApp after booking.
- A two-option switch (Vedic Astrology, Numerology), one static page per service (`/book/<slug>`, `/book` for the first).
- The Cal ID booking calendar for the chosen service.

**Embed approach:** Cal ID's inline embed, if it exists and works like Cal.com's
(`embed.js` plus an inline target). Loaded with the Next.js script API. Read
`node_modules/next/dist/docs/` for the current script-loading guidance first,
per `AGENTS.md`.
**Fallback,** if the embed is missing or unreliable on phones: the page shows the
two services as cards whose buttons open `cal.id/anjali-jain13/<slug>` in the same
tab. The first implementation task is a spike to decide which.

`/book` stays out of the nav, footer and sitemap, and is `noindex`, until Razorpay
is live. A single flag in `booking.ts` (`live: false`) controls this. While it is
false, the service pages keep their current WhatsApp buttons.

### B5. Copy that contradicts booking

| Where | Current | Change |
|---|---|---|
| `services.ts` `servicesSection.priceLine` | "Fees shared on WhatsApp" | Per service (B3) |
| `services.ts` `serviceDetail.reassurance` | "…no assistant and no booking desk." | Three-month calls line |
| `services.ts` `howItWorks` | Step 1 is "Message her on WhatsApp"; step 4 is TODO | Step 1: book online or message her. Step 2: send details on WhatsApp after booking. Step 4 filled with the three months of calls and optional remedies. |
| `contact.ts` `page.answeredBy` | "no assistant, no booking desk" | Keep "she answers herself"; drop "no booking desk". |
| `contact.ts` `page.stepsLead` | "No payment is asked for at this stage…" | Scope to messages: writing costs nothing; booking online is paid. |
| `faq.ts` | "Fees…are not listed here" | Astrology and Numerology ₹2,151, including three months of calls; Vastu on WhatsApp. |
| `structured-data.ts` | "no price data" | Optionally add `Offer` with `price: 2151`, `priceCurrency: INR` for the two services. |

`howItWorks` is shared with `WhatHappensNext.tsx`, so step copy must read correctly
for Vastu too.

### B6. Policy pages (new; needed for Razorpay's review)

- `/terms`: what the fee covers, the three-month call period starting on the
  consultation date, rescheduling, that remedies are separate and optional, and
  that readings are guidance, not medical, legal or financial advice.
- `/refund-policy`:

  > Consultations cannot be cancelled and fees are not refunded, except where:
  > Anjali is unable to hold the session and a new time cannot be agreed; you were
  > charged twice, or payment was taken but no booking was made; or another genuine
  > circumstance, at Anjali's discretion. Approved refunds go back to the original
  > payment method within TODO(refund-days, confirm with Razorpay) working days.
  > You may reschedule once, at least 24 hours before your session.

Both are content modules plus pages following `src/app/privacy/page.tsx`, linked
from the footer's "Practice" column.

### B7. Privacy notice (`src/content/privacy.ts`)

Extend "What is collected" and "Who can see it" to cover booking: name, email and
phone collected by Cal ID, and payment processed by Razorpay, which Anjali never
sees card or UPI details from. Add both providers' privacy links as `TODO(...)`
markers until checked.

### B8. Contact details for Razorpay's review

Razorpay's reviewers check for contact details. The site shows no phone number (by
design) and `contact.email` is `TODO(email-address)`. **An email address must be
supplied before applying for live mode.** It then shows on `/contact`, `/terms`
and `/refund-policy`.

### B9. Thank-you page (new, `src/app/booked/page.tsx`)

Cal ID's "custom redirect after booking" (a Startup feature) sends the customer
here after payment, so the details request does not depend on them opening an email.

- Heading confirming the booking, and a line saying the confirmation email is on its way.
- A large **Send your birth details on WhatsApp** button, using `whatsappHref` with a
  prefilled message that lists what to send: date, time and place of birth, or full
  name and date of birth for numerology.
- The three-month direct-calls line.
- Each event type redirects to its own static page, `/booked/<slug>`, which picks the
  details list. `/booked` alone is generic, with a combined list. The URL is display-only
  and never trusted as proof of a booking. All pages are static (Cloudflare constraint).
- `noindex`, and not in the nav, footer or sitemap. Visiting it directly shows a
  generic message and no false claim that something was booked.
- Set as the redirect on both event types when `booking.live` goes true. It can be
  set earlier for test mode once deployed.

## Rollout order

Cal ID's Razorpay app supports **live mode only** (Cal ID FAQ, checked 2026-09-26:
"Razorpay Test Mode isn't supported"). No payment can be tested before Razorpay
activation.

1. Fix the Part A issues; finish workflows and the calendar connection.
2. Build Part B with `booking.live = false`; deploy. Prices, `/terms`, `/refund-policy`
   and the footer links are public from this point; only `/book` and the booking
   button wait for the flag.
3. Supply the contact email; ask Razorpay whether astrology is accepted; regenerate
   the keys that were pasted in chat; apply for live activation with the site URL.
4. On activation: connect Cal ID's Razorpay app to the live account. Create a hidden
   event type priced ₹1–10 and pay for it for real, run the Cal ID checklist below
   against it, then refund it.
5. Set `booking.live = true`, deploy, and make one real booking of a real service.

## Testing

**Cal ID and Razorpay (live mode, hidden ₹1–10 event type):**
- [ ] A real UPI payment confirms the booking, which appears in Cal ID and Google Calendar
- [ ] Abandoning the Razorpay checkout does not create a booking
- [ ] Confirmation email arrives; its WhatsApp link opens a chat with Anjali
- [ ] Reminder arrives 24 hours before, tested with a booking a day out
- [ ] Reschedule link works; a slot inside 24 hours is refused
- [ ] The payment shows in the Razorpay live dashboard and the refund goes through

**Site:**
- [ ] `npm run build` and `npm run lint` pass
- [ ] With `live: false`: no link to `/book` anywhere; `/book` is noindex; service
      pages unchanged
- [ ] With `live: true`: Astrology/Numerology show the price and booking button;
      Vastu is unchanged; `/book/numerology` preselects Numerology
- [ ] The embed, or the fallback, works at phone width with no horizontal scroll
- [ ] After a test booking, Cal ID redirects to `/booked`, and its WhatsApp button
      opens a chat with the right prefilled message
- [ ] `/booked` opened directly renders a sensible generic message
- [ ] `grep -rn "TODO(" src/` lists only markers still waiting on Anjali

## Open items

- Whether Cal ID's inline embed exists and behaves like Cal.com's.
- Whether Cal ID's email templates can compute a date three months ahead. If not,
  the email says "for three months from your consultation".
- Whether Cal ID can enforce one reschedule. If not, the policy states it and
  Anjali declines a second request.
- Refund processing time, from Razorpay.
- Razorpay test keys were pasted in chat in another session. Regenerate them before live mode.

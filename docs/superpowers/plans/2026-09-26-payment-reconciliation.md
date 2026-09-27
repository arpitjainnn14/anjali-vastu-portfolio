# Payment Reconciliation Checker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A daily Cloudflare Worker that compares Razorpay payments with Cal ID bookings and posts one summary (problems first) to a Telegram group, plus a separate message if the check itself fails.

**Architecture:** A standalone Worker in `workers/reconcile/`, separate from the Next.js site. Two thin API clients (Razorpay, Cal ID) feed a pure `reconcile()` function; a pure `formatReport()` turns its result into text; `index.ts` wires them to a cron trigger and Telegram. Every outbound call to Razorpay or Cal ID goes through a GET-only helper.

**Tech Stack:** TypeScript, Cloudflare Workers (cron trigger, free plan), Wrangler 4, Vitest. No runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-09-26-payment-reconciliation-design.md`

## Global Constraints

- Free plan only: no KV, D1, R2 or paid products. ≤ 50 subrequests per run.
- Read-only toward Razorpay and Cal ID: GET requests only. The only POST is to Telegram.
- Schedule: `30 2 * * *` (08:00 IST). Problem window 30 days; summary covers the previous IST calendar day; skip records created in the last 30 minutes; `authorized` alert after 24 hours.
- Messages: plain text, English, times in IST, amounts in ₹ with Indian digit grouping. First names only; no phone numbers or emails.
- Secrets only as Cloudflare secrets on this Worker, or in the git-ignored `workers/reconcile/.dev.vars` during Tasks 1 and 9. The live Razorpay key is deleted from `.dev.vars` at the end of Task 9.
- The website (`src/`, root build, root lint) must not change behaviour. `npm run build` and `npm run lint` at the root still pass.
- The Worker has no public URL: `workers_dev: false`, `preview_urls: false`; `fetch` returns 404.

## Review Focus

- A day with very many problems (message over Telegram's 4,096-character limit) → the message is cut to fit and ends with "…and N more", and it is still sent.
- Anjali changes an event's price after people have booked → old bookings are not flagged as "wrong amount" (compare with Cal ID's payment record, not the event price).
- An API key or bot token appearing in a failure message or log line → never; errors name the service, not the credential.
- A payment that was captured and then fully refunded for a cancelled booking → only an ℹ️ "Refunded" line, never 🔴 or 🟡.
- One booking returned in two Cal ID status buckets (for example `upcoming` and `unconfirmed`) → counted once, no false "charged twice".

---

## File Structure

```
workers/reconcile/
  package.json          scripts, dev dependencies (typescript, vitest, wrangler)
  tsconfig.json         ES2022 + WebWorker libs, strict
  wrangler.jsonc        name, cron, observability, no public URL
  vitest.config.ts      node environment
  .gitignore            node_modules, .wrangler, .dev.vars
  src/
    types.ts            Payment, Booking, BookingPayment, Unreadable, Fetched<T>
    http.ts             createHttp(): GET-only JSON fetch, timeout, retries; ServiceError
    razorpay.ts         parsePayment(), listPayments()
    calid.ts            parseBooking(), listBookings()
    reconcile.ts        reconcile(), istYesterday(); Finding, Report
    format.ts           formatReport(), formatFailure(), rupees(), istDate(), istTime()
    telegram.ts         sendTelegram()
    index.ts            run(), default export { scheduled, fetch }
  test/
    fixtures.ts         NOW, payment(), booking()
    http.test.ts  razorpay.test.ts  calid.test.ts  reconcile.test.ts
    format.test.ts  telegram.test.ts  index.test.ts  readonly.test.ts
Root (modify): tsconfig.json (exclude workers), eslint.config.mjs (ignore workers/**)
```

---

### Task 1: Stage 0 spike — confirm the data shapes

This task writes no product code. It checks seven assumptions the later tasks are built on, then records the answers in the spec.

| # | Assumption | Used in |
|---|---|---|
| A1 | `GET https://api.cal.id/booking/` returns a `payment` array on each booking | Task 5 |
| A2 | Each Cal ID payment record has `externalId` (string or null), `success` (boolean), `refunded` (boolean), `amount` (number, paise) | Tasks 2, 5 |
| A3 | `payment[].externalId` equals the Razorpay `order_id` | Task 6 |
| A4 | `fromReschedule` holds the `uid` of the booking it replaced, or null | Task 6 |
| A5 | Booking `status` is one of `ACCEPTED`, `PENDING`, `CANCELLED`, `REJECTED`, `AWAITING_HOST` | Task 5 |
| A6 | Anjali's live Razorpay key lists payments created through Cal ID's app | Task 4 |
| A7 | Razorpay `created_at` is Unix seconds; `amount` and `amount_refunded` are paise | Task 4 |
| A8 | Cal ID list responses carry `meta.pagination.totalPages`; if absent, paging continues while pages are full | Task 5 |
| A9 | Cal ID honours `afterCreatedDate` (the checker also filters locally) | Task 5 |
| A10 | An abandoned or unpaid checkout on a paid event is `PENDING` (not `ACCEPTED`); check whether list items carry `paid` | Task 6 |
| A11 | A rescheduled original comes back in the `cancelled` bucket with its `payment` records | Task 6 |
| A12 | List items include `eventType.price` | Task 5 |
| A13 | A paid booking on an event without "requires confirmation" is `ACCEPTED`, not `PENDING` | Task 6 |

**Files:**
- Create (not committed): `workers/reconcile/.dev.vars`, `workers/reconcile/scripts/spike.mjs`
- Modify: `docs/superpowers/specs/2026-09-26-payment-reconciliation-design.md` (Open items → answers)

- [ ] **Step 1: Make the folder and ignore secrets before any secret exists**

```bash
mkdir -p workers/reconcile/scripts
printf 'node_modules\n.wrangler\n.dev.vars\nscripts/spike.mjs\n' > workers/reconcile/.gitignore
git check-ignore workers/reconcile/.dev.vars && echo ignored
```

Expected: `workers/reconcile/.dev.vars` then `ignored`.

- [ ] **Step 2: Arpit fills `.dev.vars`** (Arpit does this, not the agent; never paste keys into chat)

```
CALID_API_KEY=calid_...
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
```

- [ ] **Step 3: Write the throwaway spike script**

`workers/reconcile/scripts/spike.mjs`:

```js
// Throwaway (git-ignored). Prints the raw shapes Task 1 checks.
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.dev.vars', import.meta.url), 'utf8')
    .split('\n')
    .filter((line) => line.includes('=') && !line.startsWith('#'))
    .map((line) => [line.slice(0, line.indexOf('=')).trim(), line.slice(line.indexOf('=') + 1).trim()]),
);

const since = '2026-09-25T00:00:00Z';
for (const status of ['upcoming', 'past', 'cancelled', 'unconfirmed']) {
  const res = await fetch(`https://api.cal.id/booking/?status=${status}&afterCreatedDate=${since}&limit=100`, {
    headers: { Authorization: `Bearer ${env.CALID_API_KEY}` },
  });
  console.log(`\n=== Cal ID ${status} (HTTP ${res.status}) ===`);
  console.log(JSON.stringify(await res.json(), null, 2));
}

const auth = 'Basic ' + btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
const from = Math.floor(Date.parse(since) / 1000);
for (const url of [
  'https://api.razorpay.com/v1/payments/pay_TgcygiA2l1uIvi',
  `https://api.razorpay.com/v1/payments?from=${from}&count=10`,
]) {
  const res = await fetch(url, { headers: { Authorization: auth } });
  console.log(`\n=== Razorpay ${url} (HTTP ${res.status}) ===`);
  console.log(JSON.stringify(await res.json(), null, 2));
}
```

- [ ] **Step 4: Run it**

Run: `node workers/reconcile/scripts/spike.mjs`
Expected: HTTP 200 for every block. The two ₹1 test bookings (28 Sep 9:15 IST and 2 Oct 10:15 IST) appear under `cancelled`. The Razorpay list includes `pay_TgcygiA2l1uIvi` with `order_id: order_TgcuzrsNwu3g8d`.

- [ ] **Step 5: Check A1–A7 against the output**

For each assumption write "confirmed" or the actual shape. In particular: find `order_TgcuzrsNwu3g8d` (or `Tgcuxtuy4btbn9`) inside a booking's `payment` array and note the field name.

- If A1 or A6 fails: **stop**. Tell Arpit; the design needs to change (see the spec's Open items).
- If A2–A5 or A7 differ: update the spec's Data section, and update the named lines in Tasks 2, 4, 5 and 6 of this plan before starting them. Every such line is in `parsePayment`, `parseBooking`, or the `chainOfKey` loop in `reconcile`.
- If A10, A11 or A12 fail: stop — every booking or reschedule would be misreported; the design needs to change.

- [ ] **Step 6: Record answers and commit**

Replace the spec's "Open items" list with a "Confirmed in Stage 0 (date)" list stating each answer. Then:

```bash
rm workers/reconcile/scripts/spike.mjs
git add docs/superpowers/specs/2026-09-26-payment-reconciliation-design.md
git commit -m "Record the confirmed Cal ID and Razorpay data shapes"
```

---

### Task 2: Scaffold the Worker package and shared types

**Files:**
- Create: `workers/reconcile/package.json`, `tsconfig.json`, `wrangler.jsonc`, `vitest.config.ts`, `src/types.ts`, `test/fixtures.ts`, `test/fixtures.test.ts`
- Modify: `tsconfig.json` (root), `eslint.config.mjs` (root)

**Interfaces:**
- Produces: the types below, and `NOW`, `payment()`, `booking()` fixtures used by every later test.

- [ ] **Step 1: Keep the site's TypeScript and lint away from the Worker**

In root `tsconfig.json` change `"exclude": ["node_modules"]` to:

```json
  "exclude": ["node_modules", "workers"]
```

In root `eslint.config.mjs`, inside `globalIgnores([...])`, after `"cloudflare-env.d.ts",` add:

```js
    // Separate Cloudflare Worker with its own tooling (workers/reconcile).
    "workers/**",
```

- [ ] **Step 2: Package files**

`workers/reconcile/package.json`:

```json
{
  "name": "anjali-payments-check",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "typecheck": "tsc --noEmit",
    "dev": "wrangler dev --test-scheduled",
    "deploy": "wrangler deploy"
  },
  "devDependencies": {
    "@types/node": "^20",
    "typescript": "^5",
    "vitest": "^5.0.2",
    "wrangler": "^4.141.0"
  }
}
```

`workers/reconcile/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "WebWorker"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "types": ["node"]
  },
  "include": ["src", "test", "vitest.config.ts"]
}
```

`workers/reconcile/wrangler.jsonc`:

```jsonc
/**
 * Daily payments check. Compares Razorpay with Cal ID and posts to Telegram.
 * Spec: docs/superpowers/specs/2026-09-26-payment-reconciliation-design.md
 *
 * No public URL: the only entry point is the cron trigger.
 * Secrets (set in the dashboard, never here): RAZORPAY_KEY_ID,
 * RAZORPAY_KEY_SECRET, CALID_API_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID.
 */
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "anjali-payments-check",
  "main": "src/index.ts",
  "compatibility_date": "2026-09-01",
  "workers_dev": false,
  "preview_urls": false,
  "triggers": { "crons": ["30 2 * * *"] },
  "observability": { "enabled": true }
}
```

`workers/reconcile/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({ test: { environment: 'node', include: ['test/**/*.test.ts'] } });
```

- [ ] **Step 3: Install**

Run: `cd workers/reconcile && npm install && npm install-scripts approve esbuild workerd`
Expected: `package-lock.json` created; approvals listed.

- [ ] **Step 4: Shared types**

`workers/reconcile/src/types.ts`:

```ts
/** Razorpay payment, reduced to what the check needs. Amounts in paise. */
export type PaymentStatus = 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';

export type Payment = {
  id: string;
  orderId: string | null;
  status: PaymentStatus;
  amount: number;
  amountRefunded: number;
  createdAt: Date;
};

/** Cal ID's own record of a payment on a booking. `externalId` is the Razorpay order ID. */
export type BookingPayment = {
  externalId: string | null;
  success: boolean;
  refunded: boolean;
  amount: number;
};

export type BookingStatus = 'ACCEPTED' | 'PENDING' | 'CANCELLED' | 'REJECTED' | 'AWAITING_HOST';

export type Booking = {
  id: number;
  uid: string;
  status: BookingStatus;
  startTime: Date;
  createdAt: Date;
  /** uid of the booking this one replaced, when rescheduled. */
  fromReschedule: string | null;
  firstName: string;
  /** Event price in paise. 0 means a free event. */
  price: number;
  payments: BookingPayment[];
};

/** A record the checker could not read. Reported as "can't verify", never dropped. */
export type Unreadable = { source: 'Razorpay' | 'Cal ID'; id: string; reason: string };

export type Fetched<T> = { items: T[]; unreadable: Unreadable[] };
```

- [ ] **Step 5: Fixtures, and a test that they are what later tests assume**

`workers/reconcile/test/fixtures.ts`:

```ts
import type { Booking, Payment } from '../src/types';

/** Saturday 26 Sep 2026, 08:00 IST: the moment the cron fires. */
export const NOW = new Date('2026-09-26T02:30:00Z');

/** Friday 25 Sep 2026 at the given IST hour. Inside "yesterday". */
export const yesterdayIst = (hour: number, minute = 0) =>
  new Date(Date.UTC(2026, 8, 25, hour, minute) - 330 * 60_000);

export const daysAgo = (days: number) => new Date(NOW.getTime() - days * 86_400_000);

export function payment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 'pay_A',
    orderId: 'order_A',
    status: 'captured',
    amount: 215100,
    amountRefunded: 0,
    createdAt: yesterdayIst(10),
    ...overrides,
  };
}

export function booking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 1,
    uid: 'bk_A',
    status: 'ACCEPTED',
    startTime: new Date('2026-09-28T05:30:00Z'),
    createdAt: yesterdayIst(10),
    fromReschedule: null,
    firstName: 'Priya',
    price: 215100,
    payments: [{ externalId: 'order_A', success: true, refunded: false, amount: 215100 }],
    ...overrides,
  };
}
```

`workers/reconcile/test/fixtures.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { NOW, booking, payment, yesterdayIst } from './fixtures';

describe('fixtures', () => {
  it('NOW is 08:00 IST on Saturday 26 September 2026', () => {
    expect(NOW.toISOString()).toBe('2026-09-26T02:30:00.000Z');
  });

  it('yesterdayIst(10) is 10:00 IST on 25 September', () => {
    expect(yesterdayIst(10).toISOString()).toBe('2026-09-25T04:30:00.000Z');
  });

  it('the default payment and booking are linked by order ID', () => {
    expect(booking().payments[0].externalId).toBe(payment().orderId);
  });
});
```

- [ ] **Step 6: Run tests and typecheck**

Run: `cd workers/reconcile && npm test && npm run typecheck`
Expected: 3 passed; typecheck prints nothing.

- [ ] **Step 7: The site is unaffected**

Run (root): `npx tsc --noEmit -p . && npm run lint`
Expected: both succeed with no output about `workers/`.

- [ ] **Step 8: Commit**

```bash
git add tsconfig.json eslint.config.mjs workers/reconcile/.gitignore workers/reconcile/package.json workers/reconcile/package-lock.json workers/reconcile/tsconfig.json workers/reconcile/wrangler.jsonc workers/reconcile/vitest.config.ts workers/reconcile/src/types.ts workers/reconcile/test/fixtures.ts workers/reconcile/test/fixtures.test.ts
git commit -m "Scaffold the payments check Worker, apart from the site"
```

---

### Task 3: GET-only HTTP helper with timeout and retries

**Files:**
- Create: `workers/reconcile/src/http.ts`, `workers/reconcile/test/http.test.ts`, `workers/reconcile/test/readonly.test.ts`

**Interfaces:**
- Produces:
  - `type FetchLike = (url: string, init: RequestInit) => Promise<Response>`
  - `class ServiceError extends Error { service: string; status: number | null }` — `message` never contains a credential.
  - `type Http = { getJson(service: string, url: string, headers: Record<string, string>): Promise<unknown> }`
  - `createHttp(fetchImpl: FetchLike, opts?: { retries?: number; timeoutMs?: number; sleep?: (ms: number) => Promise<void> }): Http` — defaults 3 retries, 10,000 ms.

- [ ] **Step 1: Write the failing tests**

`workers/reconcile/test/http.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { ServiceError, createHttp } from '../src/http';

const noSleep = async () => {};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('createHttp().getJson', () => {
  it('sends a GET with the given headers and returns the parsed body', async () => {
    const fetchImpl = vi.fn(async () => json(200, { ok: 1 }));
    const http = createHttp(fetchImpl, { sleep: noSleep });

    await expect(http.getJson('Cal ID', 'https://x.test/a', { Authorization: 'Bearer k' })).resolves.toEqual({ ok: 1 });
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.method).toBe('GET');
    expect(init.headers).toEqual({ Authorization: 'Bearer k' });
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('retries 429 and 5xx, then succeeds', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(json(429, {}))
      .mockResolvedValueOnce(json(503, {}))
      .mockResolvedValueOnce(json(200, { ok: 2 }));
    const http = createHttp(fetchImpl, { sleep: noSleep });

    await expect(http.getJson('Razorpay', 'https://x.test', {})).resolves.toEqual({ ok: 2 });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it('gives up after 3 retries (4 attempts) with a ServiceError naming the service', async () => {
    const fetchImpl = vi.fn(async () => json(500, {}));
    const http = createHttp(fetchImpl, { sleep: noSleep });

    const error = await http.getJson('Razorpay', 'https://x.test', {}).catch((e) => e);
    expect(error).toBeInstanceOf(ServiceError);
    expect(error.service).toBe('Razorpay');
    expect(error.status).toBe(500);
    expect(error.message).toBe('answered HTTP 500.');
    expect(fetchImpl).toHaveBeenCalledTimes(4);
  });

  it('does not retry 401, and says the key was rejected', async () => {
    const fetchImpl = vi.fn(async () => json(401, {}));
    const http = createHttp(fetchImpl, { sleep: noSleep });

    const error = await http.getJson('Cal ID', 'https://x.test', {}).catch((e) => e);
    expect(error.message).toBe('rejected the API key (401).');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('retries network errors, then reports the service unreachable', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('fetch failed');
    });
    const http = createHttp(fetchImpl, { sleep: noSleep });

    const error = await http.getJson('Cal ID', 'https://x.test', {}).catch((e) => e);
    expect(error).toBeInstanceOf(ServiceError);
    expect(error.status).toBeNull();
    expect(error.message).toBe('could not be reached.');
    expect(fetchImpl).toHaveBeenCalledTimes(4);
  });

  it('reports a non-JSON success body without retrying', async () => {
    const fetchImpl = vi.fn(async () => new Response('<html>', { status: 200 }));
    const http = createHttp(fetchImpl, { sleep: noSleep });

    const error = await http.getJson('Cal ID', 'https://x.test', {}).catch((e) => e);
    expect(error.message).toBe('sent a response that is not JSON.');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('never puts header values (credentials) in the error message', async () => {
    const fetchImpl = vi.fn(async () => json(403, {}));
    const http = createHttp(fetchImpl, { sleep: noSleep });

    const error = await http.getJson('Razorpay', 'https://x.test', { Authorization: 'Basic SECRET123' }).catch((e) => e);
    expect(String(error.message)).not.toContain('SECRET123');
  });
});
```

`workers/reconcile/test/readonly.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * The live Razorpay key can refund. The checker must only ever read. Any
 * write method in the files that talk to Razorpay or Cal ID fails this test.
 */
const READ_ONLY_FILES = ['src/http.ts', 'src/razorpay.ts', 'src/calid.ts', 'src/reconcile.ts', 'src/index.ts'];

describe('read-only toward Razorpay and Cal ID', () => {
  for (const file of READ_ONLY_FILES) {
    it(`${file} uses no write method`, () => {
      let source: string;
      try {
        source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
      } catch {
        return; // file not written yet in this task
      }
      expect(source).not.toMatch(/['"](POST|PUT|PATCH|DELETE)['"]/);
    });
  }
});
```

- [ ] **Step 2: Run to see them fail**

Run: `cd workers/reconcile && npx vitest run test/http.test.ts`
Expected: FAIL — cannot find module `../src/http`.

- [ ] **Step 3: Implement**

`workers/reconcile/src/http.ts`:

```ts
/**
 * The only way this Worker talks to Razorpay and Cal ID. GET only: the live
 * Razorpay key can refund, and nothing here may ever write. Error messages
 * name the service and the status, never a header value.
 */

export type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

export class ServiceError extends Error {
  constructor(
    readonly service: string,
    readonly status: number | null,
    message: string,
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export type Http = {
  getJson(service: string, url: string, headers: Record<string, string>): Promise<unknown>;
};

type Options = { retries?: number; timeoutMs?: number; sleep?: (ms: number) => Promise<void> };

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function createHttp(fetchImpl: FetchLike, opts: Options = {}): Http {
  const retries = opts.retries ?? 3;
  const timeoutMs = opts.timeoutMs ?? 10_000;
  const sleep = opts.sleep ?? defaultSleep;

  return {
    async getJson(service, url, headers) {
      let lastStatus: number | null = null;

      for (let attempt = 0; attempt <= retries; attempt++) {
        if (attempt > 0) await sleep(500 * 2 ** (attempt - 1));

        let response: Response;
        try {
          response = await fetchImpl(url, { method: 'GET', headers, signal: AbortSignal.timeout(timeoutMs) });
        } catch {
          lastStatus = null;
          continue; // network error or timeout: retry
        }

        if (response.ok) {
          try {
            return await response.json();
          } catch {
            throw new ServiceError(service, response.status, 'sent a response that is not JSON.');
          }
        }

        lastStatus = response.status;
        if (response.status === 429 || response.status >= 500) continue;
        if (response.status === 401 || response.status === 403) {
          throw new ServiceError(service, response.status, `rejected the API key (${response.status}).`);
        }
        throw new ServiceError(service, response.status, `answered HTTP ${response.status}.`);
      }

      if (lastStatus === null) throw new ServiceError(service, null, 'could not be reached.');
      throw new ServiceError(service, lastStatus, `answered HTTP ${lastStatus}.`);
    },
  };
}
```

- [ ] **Step 4: Run tests**

Run: `cd workers/reconcile && npm test && npm run typecheck`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add workers/reconcile/src/http.ts workers/reconcile/test/http.test.ts workers/reconcile/test/readonly.test.ts
git commit -m "Add the GET-only HTTP helper the checker uses for every read"
```

---

### Task 4: Razorpay payments client

**Files:**
- Create: `workers/reconcile/src/razorpay.ts`, `workers/reconcile/test/razorpay.test.ts`

**Interfaces:**
- Consumes: `Http`, `ServiceError` (Task 3); `Payment`, `Fetched`, `Unreadable` (Task 2).
- Produces:
  - `parsePayment(raw: unknown): Payment | string` — a string is the reason it could not be read.
  - `listPayments(http: Http, keyId: string, keySecret: string, from: Date, to: Date): Promise<Fetched<Payment>>`

- [ ] **Step 1: Write the failing tests**

`workers/reconcile/test/razorpay.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { ServiceError, type Http } from '../src/http';
import { listPayments, parsePayment } from '../src/razorpay';

const raw = (overrides: Record<string, unknown> = {}) => ({
  id: 'pay_1',
  order_id: 'order_1',
  status: 'captured',
  amount: 215100,
  amount_refunded: 0,
  created_at: 1790380800,
  ...overrides,
});

describe('parsePayment', () => {
  it('maps the API shape to Payment', () => {
    expect(parsePayment(raw())).toEqual({
      id: 'pay_1',
      orderId: 'order_1',
      status: 'captured',
      amount: 215100,
      amountRefunded: 0,
      createdAt: new Date(1790380800 * 1000),
    });
  });

  it('treats a missing order ID as null', () => {
    expect((parsePayment(raw({ order_id: null })) as { orderId: unknown }).orderId).toBeNull();
  });

  it('returns a reason for an unknown status', () => {
    expect(parsePayment(raw({ status: 'pending_review' }))).toBe('unknown status pending_review');
  });

  it('returns a reason when amount is missing', () => {
    expect(parsePayment(raw({ amount: undefined }))).toBe('missing amount');
  });
});

describe('listPayments', () => {
  const from = new Date('2026-08-27T02:30:00Z');
  const to = new Date('2026-09-26T02:30:00Z');

  it('sends Basic auth and the window in Unix seconds', async () => {
    const getJson = vi.fn(async () => ({ items: [raw()] }));
    await listPayments({ getJson }, 'rzp_live_id', 'secret', from, to);

    const [service, url, headers] = getJson.mock.calls[0] as unknown as [string, string, Record<string, string>];
    expect(service).toBe('Razorpay');
    expect(url).toBe('https://api.razorpay.com/v1/payments?from=1787797800&to=1790389800&count=100&skip=0');
    expect(headers.Authorization).toBe('Basic ' + btoa('rzp_live_id:secret'));
  });

  it('pages with skip until a short page', async () => {
    const full = Array.from({ length: 100 }, (_, i) => raw({ id: `pay_${i}` }));
    const getJson = vi.fn().mockResolvedValueOnce({ items: full }).mockResolvedValueOnce({ items: [raw({ id: 'pay_last' })] });
    const result = await listPayments({ getJson } as Http, 'k', 's', from, to);

    expect(result.items).toHaveLength(101);
    expect((getJson.mock.calls[1] as unknown as [string, string])[1]).toContain('skip=100');
  });

  it('keeps unreadable records as Unreadable instead of dropping them', async () => {
    const getJson = vi.fn(async () => ({ items: [raw(), raw({ id: 'pay_odd', status: 'weird' })] }));
    const result = await listPayments({ getJson }, 'k', 's', from, to);

    expect(result.items).toHaveLength(1);
    expect(result.unreadable).toEqual([{ source: 'Razorpay', id: 'pay_odd', reason: 'unknown status weird' }]);
  });

  it('fails the whole run if the response has no items list', async () => {
    const getJson = vi.fn(async () => ({ error: 'x' }));
    const error = await listPayments({ getJson }, 'k', 's', from, to).catch((e) => e);

    expect(error).toBeInstanceOf(ServiceError);
    expect(error.message).toBe('sent an unexpected response (no items list).');
  });
});
```

- [ ] **Step 2: Run to see them fail**

Run: `cd workers/reconcile && npx vitest run test/razorpay.test.ts`
Expected: FAIL — cannot find module `../src/razorpay`.

- [ ] **Step 3: Implement**

`workers/reconcile/src/razorpay.ts`:

```ts
import { ServiceError, type Http } from './http';
import type { Fetched, Payment, PaymentStatus, Unreadable } from './types';

const STATUSES: readonly PaymentStatus[] = ['created', 'authorized', 'captured', 'refunded', 'failed'];
const PAGE = 100;
const MAX_PAGES = 10;

export function parsePayment(raw: unknown): Payment | string {
  if (typeof raw !== 'object' || raw === null) return 'not an object';
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string') return 'missing id';
  if (!STATUSES.includes(r.status as PaymentStatus)) return `unknown status ${String(r.status)}`;
  if (typeof r.amount !== 'number') return 'missing amount';
  if (typeof r.created_at !== 'number') return 'missing created_at';

  return {
    id: r.id,
    orderId: typeof r.order_id === 'string' ? r.order_id : null,
    status: r.status as PaymentStatus,
    amount: r.amount,
    amountRefunded: typeof r.amount_refunded === 'number' ? r.amount_refunded : 0,
    createdAt: new Date(r.created_at * 1000),
  };
}

const idOf = (raw: unknown) =>
  typeof raw === 'object' && raw !== null && typeof (raw as { id?: unknown }).id === 'string'
    ? (raw as { id: string }).id
    : 'unknown';

export async function listPayments(
  http: Http,
  keyId: string,
  keySecret: string,
  from: Date,
  to: Date,
): Promise<Fetched<Payment>> {
  const auth = 'Basic ' + btoa(`${keyId}:${keySecret}`);
  const window = `from=${Math.floor(from.getTime() / 1000)}&to=${Math.floor(to.getTime() / 1000)}`;
  const items: Payment[] = [];
  const unreadable: Unreadable[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const url = `https://api.razorpay.com/v1/payments?${window}&count=${PAGE}&skip=${page * PAGE}`;
    const body = (await http.getJson('Razorpay', url, { Authorization: auth })) as { items?: unknown };
    if (!Array.isArray(body?.items)) {
      throw new ServiceError('Razorpay', null, 'sent an unexpected response (no items list).');
    }

    for (const raw of body.items) {
      const parsed = parsePayment(raw);
      if (typeof parsed === 'string') unreadable.push({ source: 'Razorpay', id: idOf(raw), reason: parsed });
      else items.push(parsed);
    }
    if (body.items.length < PAGE) return { items, unreadable };
  }

  throw new ServiceError('Razorpay', null, 'returned more than 1,000 payments in 30 days; the checker needs paging changes.');
}
```

- [ ] **Step 4: Run tests**

Run: `cd workers/reconcile && npm test && npm run typecheck`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add workers/reconcile/src/razorpay.ts workers/reconcile/test/razorpay.test.ts
git commit -m "Read Razorpay payments for the check, keeping odd records visible"
```

---

### Task 5: Cal ID bookings client

**Files:**
- Create: `workers/reconcile/src/calid.ts`, `workers/reconcile/test/calid.test.ts`

**Interfaces:**
- Consumes: `Http`, `ServiceError` (Task 3); `Booking`, `BookingPayment`, `BookingStatus`, `Fetched`, `Unreadable` (Task 2).
- Produces:
  - `parseBooking(raw: unknown): Booking | string`
  - `listBookings(http: Http, apiKey: string, afterCreated: Date): Promise<Fetched<Booking>>` — fetches buckets `upcoming`, `past`, `cancelled`, `unconfirmed`; each booking once.

- [ ] **Step 1: Write the failing tests**

`workers/reconcile/test/calid.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { ServiceError, type Http } from '../src/http';
import { listBookings, parseBooking } from '../src/calid';

const raw = (overrides: Record<string, unknown> = {}) => ({
  id: 7,
  uid: 'bk_7',
  status: 'ACCEPTED',
  startTime: '2026-09-28T03:45:00.000Z',
  createdAt: '2026-09-26T10:07:00.000Z',
  fromReschedule: null,
  attendees: [{ name: 'Priya Sharma', email: 'p@example.com' }],
  eventType: { price: 215100, currency: 'inr' },
  payment: [{ externalId: 'order_7', success: true, refunded: false, amount: 215100 }],
  ...overrides,
});

const page = (data: unknown[], totalPages = 1) => ({ success: true, data, meta: { pagination: { page: 1, totalPages } } });

describe('parseBooking', () => {
  it('maps the API shape, keeping only the first name', () => {
    expect(parseBooking(raw())).toEqual({
      id: 7,
      uid: 'bk_7',
      status: 'ACCEPTED',
      startTime: new Date('2026-09-28T03:45:00.000Z'),
      createdAt: new Date('2026-09-26T10:07:00.000Z'),
      fromReschedule: null,
      firstName: 'Priya',
      price: 215100,
      payments: [{ externalId: 'order_7', success: true, refunded: false, amount: 215100 }],
    });
  });

  it('uses "Someone" when there is no attendee name', () => {
    expect((parseBooking(raw({ attendees: [] })) as { firstName: string }).firstName).toBe('Someone');
  });

  it('returns a reason for an unknown status', () => {
    expect(parseBooking(raw({ status: 'ON_HOLD' }))).toBe('unknown status ON_HOLD');
  });

  it('returns a reason when the payment list is missing', () => {
    expect(parseBooking(raw({ payment: undefined }))).toBe('missing payment list');
  });

  it('returns a reason for a malformed payment record', () => {
    expect(parseBooking(raw({ payment: [{ externalId: 'o', success: 'yes' }] }))).toBe('malformed payment record');
  });
});

describe('listBookings', () => {
  const after = new Date('2026-08-27T02:30:00Z');

  it('asks each of the four status buckets with Bearer auth', async () => {
    const getJson = vi.fn(async () => page([]));
    await listBookings({ getJson }, 'calid_key', after);

    const urls = getJson.mock.calls.map((c) => (c as unknown as [string, string])[1]);
    expect(urls).toEqual(
      ['upcoming', 'past', 'cancelled', 'unconfirmed'].map(
        (s) => `https://api.cal.id/booking/?status=${s}&afterCreatedDate=2026-08-27T02%3A30%3A00.000Z&limit=100&page=1`,
      ),
    );
    expect((getJson.mock.calls[0] as unknown as [string, string, Record<string, string>])[2]).toEqual({
      Authorization: 'Bearer calid_key',
    });
  });

  it('follows totalPages', async () => {
    const getJson = vi
      .fn()
      .mockResolvedValueOnce(page([raw({ uid: 'bk_1' })], 2))
      .mockResolvedValueOnce(page([raw({ uid: 'bk_2' })], 2))
      .mockResolvedValue(page([]));
    const result = await listBookings({ getJson } as Http, 'k', after);

    expect(result.items.map((b) => b.uid)).toEqual(['bk_1', 'bk_2']);
    expect((getJson.mock.calls[1] as unknown as [string, string])[1]).toContain('page=2');
  });

  it('counts a booking seen in two buckets once', async () => {
    const getJson = vi
      .fn()
      .mockResolvedValueOnce(page([raw()]))
      .mockResolvedValueOnce(page([]))
      .mockResolvedValueOnce(page([]))
      .mockResolvedValueOnce(page([raw()]));
    const result = await listBookings({ getJson } as Http, 'k', after);

    expect(result.items).toHaveLength(1);
  });

  it('keeps unreadable bookings as Unreadable', async () => {
    const getJson = vi.fn().mockResolvedValueOnce(page([raw({ uid: 'bk_odd', status: 'ON_HOLD' })])).mockResolvedValue(page([]));
    const result = await listBookings({ getJson } as Http, 'k', after);

    expect(result.unreadable).toEqual([{ source: 'Cal ID', id: 'bk_odd', reason: 'unknown status ON_HOLD' }]);
  });

  it('fails the run if a response has no data list', async () => {
    const getJson = vi.fn(async () => ({ success: false }));
    const error = await listBookings({ getJson }, 'k', after).catch((e) => e);

    expect(error).toBeInstanceOf(ServiceError);
    expect(error.message).toBe('sent an unexpected response (no data list).');
  });
});
```

- [ ] **Step 2: Run to see them fail**

Run: `cd workers/reconcile && npx vitest run test/calid.test.ts`
Expected: FAIL — cannot find module `../src/calid`.

- [ ] **Step 3: Implement**

`workers/reconcile/src/calid.ts`:

```ts
import { ServiceError, type Http } from './http';
import type { Booking, BookingPayment, BookingStatus, Fetched, Unreadable } from './types';

/** GET /booking/ defaults to "upcoming" and has no "all", so ask every bucket. */
const BUCKETS = ['upcoming', 'past', 'cancelled', 'unconfirmed'] as const;
const STATUSES: readonly BookingStatus[] = ['ACCEPTED', 'PENDING', 'CANCELLED', 'REJECTED', 'AWAITING_HOST'];
const LIMIT = 100;
const MAX_PAGES = 10;

const isDate = (v: unknown): v is string => typeof v === 'string' && !Number.isNaN(Date.parse(v));

function parsePayments(raw: unknown): BookingPayment[] | string {
  if (!Array.isArray(raw)) return 'missing payment list';
  const out: BookingPayment[] = [];
  for (const p of raw) {
    const r = (p ?? {}) as Record<string, unknown>;
    if (typeof r.success !== 'boolean' || typeof r.refunded !== 'boolean' || typeof r.amount !== 'number') {
      return 'malformed payment record';
    }
    out.push({
      externalId: typeof r.externalId === 'string' ? r.externalId : null,
      success: r.success,
      refunded: r.refunded,
      amount: r.amount,
    });
  }
  return out;
}

export function parseBooking(raw: unknown): Booking | string {
  if (typeof raw !== 'object' || raw === null) return 'not an object';
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'number' || typeof r.uid !== 'string') return 'missing id';
  if (!STATUSES.includes(r.status as BookingStatus)) return `unknown status ${String(r.status)}`;
  if (!isDate(r.startTime) || !isDate(r.createdAt)) return 'missing times';

  const eventType = (r.eventType ?? {}) as Record<string, unknown>;
  if (typeof eventType.price !== 'number') return 'missing event price';

  const payments = parsePayments(r.payment);
  if (typeof payments === 'string') return payments;

  const attendees = Array.isArray(r.attendees) ? (r.attendees as { name?: unknown }[]) : [];
  const fullName = typeof attendees[0]?.name === 'string' ? attendees[0].name.trim() : '';

  return {
    id: r.id,
    uid: r.uid,
    status: r.status as BookingStatus,
    startTime: new Date(r.startTime),
    createdAt: new Date(r.createdAt),
    fromReschedule: typeof r.fromReschedule === 'string' ? r.fromReschedule : null,
    firstName: fullName.split(/\s+/)[0] || 'Someone',
    price: eventType.price,
    payments,
  };
}

const uidOf = (raw: unknown) =>
  typeof raw === 'object' && raw !== null && typeof (raw as { uid?: unknown }).uid === 'string'
    ? (raw as { uid: string }).uid
    : 'unknown';

export async function listBookings(http: Http, apiKey: string, afterCreated: Date): Promise<Fetched<Booking>> {
  const headers = { Authorization: `Bearer ${apiKey}` };
  const byUid = new Map<string, Booking>();
  const unreadable: Unreadable[] = [];

  for (const bucket of BUCKETS) {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const query = new URLSearchParams({
        status: bucket,
        afterCreatedDate: afterCreated.toISOString(),
        limit: String(LIMIT),
        page: String(page),
      });
      const body = (await http.getJson('Cal ID', `https://api.cal.id/booking/?${query}`, headers)) as {
        data?: unknown;
        meta?: { pagination?: { totalPages?: unknown } };
      };
      if (!Array.isArray(body?.data)) {
        throw new ServiceError('Cal ID', null, 'sent an unexpected response (no data list).');
      }

      for (const raw of body.data) {
        const parsed = parseBooking(raw);
        if (typeof parsed === 'string') unreadable.push({ source: 'Cal ID', id: uidOf(raw), reason: parsed });
        else byUid.set(parsed.uid, parsed);
      }

      const totalPages = typeof body.meta?.pagination?.totalPages === 'number' ? body.meta.pagination.totalPages : 1;
      if (page >= totalPages) break;
      if (page === MAX_PAGES) {
        throw new ServiceError('Cal ID', null, 'returned more than 1,000 bookings in one bucket; the checker needs paging changes.');
      }
    }
  }

  return { items: [...byUid.values()], unreadable };
}
```

- [ ] **Step 4: Run tests**

Run: `cd workers/reconcile && npm test && npm run typecheck`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add workers/reconcile/src/calid.ts workers/reconcile/test/calid.test.ts
git commit -m "Read Cal ID bookings from every status bucket, each once"
```

---

### Task 6: The reconcile rules

**Files:**
- Create: `workers/reconcile/src/reconcile.ts`, `workers/reconcile/test/reconcile.test.ts`

**Interfaces:**
- Consumes: `Payment`, `Booking`, `Unreadable` (Task 2); fixtures (Task 2).
- Produces:
  - `type Severity = 'red' | 'orange' | 'yellow' | 'info'`
  - `type Kind = 'paid_no_booking' | 'paid_booking_unconfirmed' | 'booking_no_payment' | 'double_charge' | 'wrong_amount' | 'held_not_taken' | 'cant_verify' | 'cancelled_not_refunded' | 'refunded'`
  - `type Finding = { kind: Kind; severity: Severity; since: Date; lastChance: boolean; name: string | null; amount: number | null; paymentId: string | null; orderId: string | null; bookingStart: Date | null; detail: string | null }`
  - `type DaySummary = { payments: number; matched: number; capturedPaise: number; refundedPaise: number; failed: number }`
  - `type Report = { findings: Finding[]; yesterday: DaySummary }`
  - `istYesterday(now: Date): { start: Date; end: Date }`
  - `reconcile(payments: Payment[], bookings: Booking[], unreadable: Unreadable[], now: Date): Report` — findings sorted red, orange, yellow, info, then oldest first.

- [ ] **Step 1: Write the failing tests**

`workers/reconcile/test/reconcile.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { istYesterday, reconcile, type Kind } from '../src/reconcile';
import { NOW, booking, daysAgo, payment, yesterdayIst } from './fixtures';

const kinds = (r: ReturnType<typeof reconcile>) => r.findings.map((f) => f.kind);
const run = (payments = [payment()], bookings = [booking()]) => reconcile(payments, bookings, [], NOW);

describe('istYesterday', () => {
  it('is Friday 25 Sep 00:00–24:00 IST for a run at 08:00 IST on the 26th', () => {
    const { start, end } = istYesterday(NOW);
    expect(start.toISOString()).toBe('2026-09-24T18:30:00.000Z');
    expect(end.toISOString()).toBe('2026-09-25T18:30:00.000Z');
  });
});

describe('reconcile', () => {
  it('matched: no findings, counted in yesterday', () => {
    const r = run();
    expect(r.findings).toEqual([]);
    expect(r.yesterday).toEqual({ payments: 1, matched: 1, capturedPaise: 215100, refundedPaise: 0, failed: 0 });
  });

  it('captured payment with no linked booking → paid_no_booking (red)', () => {
    const r = run([payment({ orderId: 'order_ghost' })], []);
    expect(r.findings[0]).toMatchObject({ kind: 'paid_no_booking', severity: 'red', paymentId: 'pay_A', amount: 215100 });
  });

  it('captured payment linked to a pending booking → paid_booking_unconfirmed (red)', () => {
    expect(kinds(run([payment()], [booking({ status: 'PENDING' })]))).toEqual(['paid_booking_unconfirmed']);
  });

  it('accepted paid booking with no captured payment → booking_no_payment (red)', () => {
    const r = run([], [booking()]);
    expect(r.findings[0]).toMatchObject({ kind: 'booking_no_payment', severity: 'red', name: 'Priya' });
  });

  it('two captured payments on one booking → double_charge (red)', () => {
    const b = booking({
      payments: [
        { externalId: 'order_A', success: true, refunded: false, amount: 215100 },
        { externalId: 'order_B', success: true, refunded: false, amount: 215100 },
      ],
    });
    const r = run([payment(), payment({ id: 'pay_B', orderId: 'order_B' })], [b]);
    expect(kinds(r)).toContain('double_charge');
  });

  it('Razorpay amount differs from Cal ID payment record → wrong_amount (red)', () => {
    expect(kinds(run([payment({ amount: 100 })], [booking()]))).toContain('wrong_amount');
  });

  it('a later event price change does not flag old bookings', () => {
    expect(run([payment()], [booking({ price: 250000 })]).findings).toEqual([]);
  });

  it('authorized for more than 24 hours → held_not_taken (orange)', () => {
    const r = run([payment({ status: 'authorized', createdAt: daysAgo(2) })], [booking({ status: 'PENDING' })]);
    expect(r.findings[0]).toMatchObject({ kind: 'held_not_taken', severity: 'orange' });
  });

  it('authorized for less than 24 hours → nothing yet', () => {
    const r = run([payment({ status: 'authorized', createdAt: new Date(NOW.getTime() - 3_600_000) })], [booking({ status: 'PENDING' })]);
    expect(kinds(r)).not.toContain('held_not_taken');
  });

  it('cancelled booking with a kept payment → cancelled_not_refunded (yellow)', () => {
    expect(kinds(run([payment()], [booking({ status: 'CANCELLED' })]))).toEqual(['cancelled_not_refunded']);
  });

  it('captured then fully refunded, booking cancelled → only refunded (info)', () => {
    const r = run([payment({ status: 'refunded', amountRefunded: 215100 })], [booking({ status: 'CANCELLED' })]);
    expect(r.findings).toHaveLength(1);
    expect(r.findings[0]).toMatchObject({ kind: 'refunded', severity: 'info', amount: 215100 });
  });

  it('a fully refunded payment with no booking is not red', () => {
    const r = run([payment({ orderId: 'order_ghost', status: 'refunded', amountRefunded: 215100 })], []);
    expect(kinds(r)).toEqual(['refunded']);
  });

  it('rescheduled booking: payment on the original counts for the new one', () => {
    const original = booking({ uid: 'bk_old', status: 'CANCELLED' });
    const moved = booking({ id: 2, uid: 'bk_new', fromReschedule: 'bk_old', payments: [] });
    expect(run([payment()], [original, moved]).findings).toEqual([]);
  });

  it('free events are ignored', () => {
    expect(run([], [booking({ price: 0, payments: [] })]).findings).toEqual([]);
  });

  it('failed payments are only counted', () => {
    const r = run([payment({ status: 'failed' })], []);
    expect(r.findings).toEqual([]);
    expect(r.yesterday.failed).toBe(1);
  });

  it('records from the last 30 minutes are skipped', () => {
    const fresh = new Date(NOW.getTime() - 10 * 60_000);
    expect(run([payment({ createdAt: fresh, orderId: 'order_ghost' })], [booking({ createdAt: fresh, payments: [] })]).findings).toEqual([]);
  });

  it('problems older than 27 days are marked lastChance', () => {
    const r = run([payment({ orderId: 'order_ghost', createdAt: daysAgo(28) })], []);
    expect(r.findings[0].lastChance).toBe(true);
  });

  it('unreadable records become cant_verify (orange)', () => {
    const r = reconcile([], [], [{ source: 'Cal ID', id: 'bk_x', reason: 'unknown status ON_HOLD' }], NOW);
    expect(r.findings[0]).toMatchObject({ kind: 'cant_verify', severity: 'orange', detail: 'Cal ID bk_x: unknown status ON_HOLD' });
  });

  it('sorts red before orange before yellow before info', () => {
    const r = reconcile(
      [
        payment({ id: 'p1', orderId: 'o1', status: 'refunded', amountRefunded: 215100 }),
        payment({ id: 'p2', orderId: 'o2' }),
        payment({ id: 'p3', orderId: 'o3', status: 'authorized', createdAt: daysAgo(2) }),
        payment({ id: 'p4', orderId: 'ghost' }),
      ],
      [
        booking({ uid: 'b1', status: 'CANCELLED', payments: [{ externalId: 'o1', success: true, refunded: true, amount: 215100 }] }),
        booking({ uid: 'b2', status: 'CANCELLED', payments: [{ externalId: 'o2', success: true, refunded: false, amount: 215100 }] }),
      ],
      [],
      NOW,
    );
    const order: Kind[] = ['paid_no_booking', 'held_not_taken', 'cancelled_not_refunded', 'refunded'];
    expect(kinds(r)).toEqual(order);
  });

  it('yesterday counts only payments created in the previous IST day', () => {
    const r = run([payment(), payment({ id: 'pay_old', orderId: 'order_old', createdAt: daysAgo(3) })], [
      booking(),
      booking({ uid: 'bk_old', payments: [{ externalId: 'order_old', success: true, refunded: false, amount: 215100 }], createdAt: daysAgo(3) }),
    ]);
    expect(r.yesterday.payments).toBe(1);
    expect(r.yesterday.capturedPaise).toBe(215100);
  });

  it('yesterday boundary: 23:59 IST on the 25th counts, 00:00 IST on the 26th does not', () => {
    const late = payment({ createdAt: yesterdayIst(23, 59) });
    const next = payment({ id: 'pay_next', orderId: 'order_next', createdAt: new Date('2026-09-25T18:30:00Z') });
    const r = run([late, next], [
      booking(),
      booking({ uid: 'bk_next', payments: [{ externalId: 'order_next', success: true, refunded: false, amount: 215100 }] }),
    ]);
    expect(r.yesterday.payments).toBe(1);
  });
});
```

- [ ] **Step 2: Run to see them fail**

Run: `cd workers/reconcile && npx vitest run test/reconcile.test.ts`
Expected: FAIL — cannot find module `../src/reconcile`.

- [ ] **Step 3: Implement**

`workers/reconcile/src/reconcile.ts`:

```ts
import type { Booking, Payment, Unreadable } from './types';

/**
 * Pure comparison of Razorpay (the money) with Cal ID (the bookings). No I/O.
 * Rules and severities: docs/superpowers/specs/2026-09-26-payment-reconciliation-design.md
 */

export type Severity = 'red' | 'orange' | 'yellow' | 'info';

export type Kind =
  | 'paid_no_booking'
  | 'paid_booking_unconfirmed'
  | 'booking_no_payment'
  | 'double_charge'
  | 'wrong_amount'
  | 'held_not_taken'
  | 'cant_verify'
  | 'cancelled_not_refunded'
  | 'refunded';

export type Finding = {
  kind: Kind;
  severity: Severity;
  since: Date;
  lastChance: boolean;
  name: string | null;
  amount: number | null;
  paymentId: string | null;
  orderId: string | null;
  bookingStart: Date | null;
  detail: string | null;
};

export type DaySummary = { payments: number; matched: number; capturedPaise: number; refundedPaise: number; failed: number };
export type Report = { findings: Finding[]; yesterday: DaySummary };

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const IST_OFFSET = 330 * MINUTE;

const GRACE = 30 * MINUTE;
const HELD_AFTER = 24 * HOUR;
const LAST_CHANCE_AFTER = 27 * DAY;

const SEVERITY: Record<Kind, Severity> = {
  paid_no_booking: 'red',
  paid_booking_unconfirmed: 'red',
  booking_no_payment: 'red',
  double_charge: 'red',
  wrong_amount: 'red',
  held_not_taken: 'orange',
  cant_verify: 'orange',
  cancelled_not_refunded: 'yellow',
  refunded: 'info',
};
const RANK: Record<Severity, number> = { red: 0, orange: 1, yellow: 2, info: 3 };

/** The previous calendar day in IST (UTC+5:30, no daylight saving). */
export function istYesterday(now: Date): { start: Date; end: Date } {
  const ist = new Date(now.getTime() + IST_OFFSET);
  const todayStart = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()) - IST_OFFSET;
  return { start: new Date(todayStart - DAY), end: new Date(todayStart) };
}

export function reconcile(payments: Payment[], bookings: Booking[], unreadable: Unreadable[], now: Date): Report {
  const t = now.getTime();
  const findings: Finding[] = [];
  const add = (kind: Kind, since: Date, extra: Partial<Finding> = {}) =>
    findings.push({
      kind,
      severity: SEVERITY[kind],
      since,
      lastChance: t - since.getTime() > LAST_CHANCE_AFTER,
      name: null,
      amount: null,
      paymentId: null,
      orderId: null,
      bookingStart: null,
      detail: null,
      ...extra,
    });
  const fresh = (d: Date) => t - d.getTime() < GRACE;

  // Reschedule chains: every booking maps to the uid of the first booking in its chain.
  const byUid = new Map(bookings.map((b) => [b.uid, b]));
  const rootOf = (b: Booking) => {
    let current = b;
    const seen = new Set<string>();
    while (current.fromReschedule && byUid.has(current.fromReschedule) && !seen.has(current.uid)) {
      seen.add(current.uid);
      current = byUid.get(current.fromReschedule)!;
    }
    return current.uid;
  };
  const chains = new Map<string, Booking[]>();
  for (const b of bookings) {
    const root = rootOf(b);
    chains.set(root, [...(chains.get(root) ?? []), b]);
  }

  // Link: Cal ID payment record externalId (= Razorpay order_id) → chain, and Cal ID's own amount.
  const chainOfKey = new Map<string, string>();
  const calAmountOfKey = new Map<string, number>();
  for (const b of bookings) {
    for (const p of b.payments) {
      if (!p.externalId) continue;
      chainOfKey.set(p.externalId, rootOf(b));
      calAmountOfKey.set(p.externalId, p.amount);
    }
  }

  const keptByChain = new Map<string, Payment[]>();
  for (const p of payments) {
    if (fresh(p.createdAt) || p.status === 'created' || p.status === 'failed') continue;
    const ids = { paymentId: p.id, orderId: p.orderId };

    if (p.status === 'authorized') {
      if (t - p.createdAt.getTime() > HELD_AFTER) add('held_not_taken', p.createdAt, { ...ids, amount: p.amount });
      continue;
    }

    // captured or refunded
    if (p.amountRefunded > 0) add('refunded', p.createdAt, { ...ids, amount: p.amountRefunded });
    const kept = p.amount - p.amountRefunded > 0;
    const root = p.orderId ? chainOfKey.get(p.orderId) : undefined;
    if (!root) {
      if (kept) add('paid_no_booking', p.createdAt, { ...ids, amount: p.amount });
      continue;
    }
    if (kept) keptByChain.set(root, [...(keptByChain.get(root) ?? []), p]);
  }

  const matchedIds = new Set<string>();
  for (const [root, chain] of chains) {
    if (!chain.some((b) => b.price > 0)) continue;

    const accepted = chain.find((b) => b.status === 'ACCEPTED');
    const pending = chain.find((b) => b.status === 'PENDING' || b.status === 'AWAITING_HOST');
    const latest = [...chain].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    const shown = accepted ?? pending ?? latest;
    const person = { name: shown.firstName, bookingStart: shown.startTime };
    const kept = keptByChain.get(root) ?? [];

    for (const p of kept) {
      const expected = p.orderId ? calAmountOfKey.get(p.orderId) : undefined;
      if (expected !== undefined && expected !== p.amount) {
        add('wrong_amount', p.createdAt, {
          ...person,
          amount: p.amount,
          paymentId: p.id,
          orderId: p.orderId,
          detail: `Cal ID expected ${expected} paise`,
        });
      }
    }
    if (kept.length > 1) {
      add('double_charge', kept[1].createdAt, {
        ...person,
        amount: kept[1].amount,
        paymentId: kept.map((p) => p.id).join(', '),
      });
    }

    const first = kept[0];
    const payIds = first ? { amount: first.amount, paymentId: first.id, orderId: first.orderId } : {};
    if (accepted) {
      if (kept.length === 0 && !fresh(accepted.createdAt)) add('booking_no_payment', accepted.createdAt, person);
      if (kept.length === 1 && calAmountOfKey.get(first.orderId ?? '') === first.amount) matchedIds.add(first.id);
    } else if (pending) {
      if (first) add('paid_booking_unconfirmed', first.createdAt, { ...person, ...payIds });
    } else if (first) {
      add('cancelled_not_refunded', first.createdAt, { ...person, ...payIds });
    }
  }

  for (const u of unreadable) add('cant_verify', now, { detail: `${u.source} ${u.id}: ${u.reason}` });

  findings.sort((a, b) => RANK[a.severity] - RANK[b.severity] || a.since.getTime() - b.since.getTime());

  const { start, end } = istYesterday(now);
  const inDay = (d: Date) => d >= start && d < end;
  const yesterday: DaySummary = { payments: 0, matched: 0, capturedPaise: 0, refundedPaise: 0, failed: 0 };
  for (const p of payments) {
    if (!inDay(p.createdAt)) continue;
    if (p.status === 'failed') yesterday.failed++;
    if (p.status !== 'captured' && p.status !== 'refunded') continue;
    yesterday.payments++;
    yesterday.capturedPaise += p.amount;
    yesterday.refundedPaise += p.amountRefunded;
    if (matchedIds.has(p.id)) yesterday.matched++;
  }

  return { findings, yesterday };
}
```

- [ ] **Step 4: Run tests**

Run: `cd workers/reconcile && npm test && npm run typecheck`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add workers/reconcile/src/reconcile.ts workers/reconcile/test/reconcile.test.ts
git commit -m "Compare payments with bookings and grade every mismatch"
```

---

### Task 7: Message formatting

**Files:**
- Create: `workers/reconcile/src/format.ts`, `workers/reconcile/test/format.test.ts`

**Interfaces:**
- Consumes: `Report`, `Finding`, `Kind`, `istYesterday` (Task 6); `ServiceError` (Task 3).
- Produces:
  - `rupees(paise: number): string` — `215100 → '₹2,151'`, `10000000 → '₹1,00,000'`, `150 → '₹1.50'`
  - `istDate(d: Date): string` — `'Sat 26 Sep'`; `istTime(d: Date): string` — `'8:00 am'`
  - `formatReport(report: Report, now: Date): string` — ≤ 4,000 characters
  - `formatFailure(error: unknown, now: Date): string`

- [ ] **Step 1: Write the failing tests**

`workers/reconcile/test/format.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { ServiceError } from '../src/http';
import { formatFailure, formatReport, istDate, istTime, rupees } from '../src/format';
import { reconcile, type Report } from '../src/reconcile';
import { NOW, booking, daysAgo, payment, yesterdayIst } from './fixtures';

describe('helpers', () => {
  it('rupees uses Indian grouping and hides zero paise', () => {
    expect(rupees(215100)).toBe('₹2,151');
    expect(rupees(10_000_000)).toBe('₹1,00,000');
    expect(rupees(150)).toBe('₹1.50');
    expect(rupees(0)).toBe('₹0');
  });

  it('istDate and istTime', () => {
    expect(istDate(NOW)).toBe('Sat 26 Sep');
    expect(istTime(NOW)).toBe('8:00 am');
    expect(istTime(yesterdayIst(21, 42))).toBe('9:42 pm');
    expect(istTime(yesterdayIst(0, 5))).toBe('12:05 am');
  });
});

describe('formatReport', () => {
  it('quiet day', () => {
    expect(formatReport(reconcile([payment()], [booking()], [], NOW), NOW)).toBe(
      [
        '✅ Payments check · Sat 26 Sep, 8:00 am',
        'Yesterday: 1 payment, all matched to bookings.',
        'Captured ₹2,151 · Refunded ₹0',
        'Nothing needs you today.',
      ].join('\n'),
    );
  });

  it('no payments at all', () => {
    expect(formatReport(reconcile([], [], [], NOW), NOW)).toContain('Yesterday: no payments.');
  });

  it('problem day: header counts reds and oranges, problem first, with an action line', () => {
    const text = formatReport(reconcile([payment({ orderId: 'order_ghost', createdAt: yesterdayIst(21, 42) })], [], [], NOW), NOW);
    expect(text).toBe(
      [
        '🔴 Payments check · Sat 26 Sep, 8:00 am · 1 needs action',
        '',
        '🔴 Paid, but no booking (customer waiting)',
        '   ₹2,151 · paid Fri 25 Sep, 9:42 pm',
        '   Payment pay_A · Order order_ghost',
        '   → Find the customer in Razorpay: book a slot for them in Cal ID, or refund.',
        '',
        'Yesterday: 1 payment, 0 matched to bookings.',
        'Captured ₹2,151 · Refunded ₹0',
      ].join('\n'),
    );
  });

  it('marks problems older than yesterday as still open', () => {
    const text = formatReport(reconcile([payment({ orderId: 'order_ghost', createdAt: daysAgo(3) })], [], [], NOW), NOW);
    expect(text).toContain('   Still open since Wed 23 Sep');
  });

  it('warns on last-chance problems', () => {
    const text = formatReport(reconcile([payment({ orderId: 'order_ghost', createdAt: daysAgo(28) })], [], [], NOW), NOW);
    expect(text).toContain('   ⚠ Leaves this check in 2 days. Resolve it or note it by hand.');
  });

  it('shows the booking name and time for booking problems', () => {
    const text = formatReport(reconcile([], [booking()], [], NOW), NOW);
    expect(text).toContain('🔴 Booking without payment');
    expect(text).toContain('   Priya · booked for Mon 28 Sep, 11:00 am');
  });

  it('uses "need" for more than one', () => {
    const text = formatReport(
      reconcile([payment({ orderId: 'x1' }), payment({ id: 'pay_B', orderId: 'x2' })], [], [], NOW),
      NOW,
    );
    expect(text.split('\n')[0]).toBe('🔴 Payments check · Sat 26 Sep, 8:00 am · 2 need action');
  });

  it('yellow and info only: green header, no action count', () => {
    const text = formatReport(reconcile([payment()], [booking({ status: 'CANCELLED' })], [], NOW), NOW);
    expect(text.split('\n')[0]).toBe('✅ Payments check · Sat 26 Sep, 8:00 am');
    expect(text).toContain('🟡 Cancelled, not refunded');
  });

  it('never exceeds 4,000 characters and says how many were left out', () => {
    const many = Array.from({ length: 200 }, (_, i) => payment({ id: `pay_${i}`, orderId: `ghost_${i}` }));
    const text = formatReport(reconcile(many, [], [], NOW), NOW);
    expect(text.length).toBeLessThanOrEqual(4000);
    expect(text).toMatch(/…and \d+ more\. Open Razorpay and Cal ID to see all\./);
    expect(text.split('\n')[0]).toContain('200 need action');
  });

  it('carries no email addresses', () => {
    const report: Report = reconcile([], [booking({ firstName: 'Priya' })], [], NOW);
    expect(formatReport(report, NOW)).not.toMatch(/@/);
  });
});

describe('formatFailure', () => {
  it('names the service and what went wrong', () => {
    expect(formatFailure(new ServiceError('Cal ID', 401, 'rejected the API key (401).'), NOW)).toBe(
      [
        '⚠️ Payments check FAILED · Sat 26 Sep, 8:00 am',
        'Cal ID rejected the API key (401).',
        'Payments were NOT checked today.',
        '→ Tell Arpit. Until fixed, compare Razorpay and Cal ID by hand.',
      ].join('\n'),
    );
  });

  it('handles unknown errors', () => {
    expect(formatFailure(new Error('boom'), NOW).split('\n')[1]).toBe('Unexpected error: boom');
  });
});
```

- [ ] **Step 2: Run to see them fail**

Run: `cd workers/reconcile && npx vitest run test/format.test.ts`
Expected: FAIL — cannot find module `../src/format`.

- [ ] **Step 3: Implement**

`workers/reconcile/src/format.ts`:

```ts
import { ServiceError } from './http';
import { istYesterday, type Finding, type Kind, type Report } from './reconcile';

/**
 * Plain-text Telegram messages. Problems first, each with a "→" action.
 * First names, amounts, times and IDs only. Deterministic: IST is computed
 * by offset, not Intl, so tests and Workers agree.
 */

const IST_OFFSET = 330 * 60_000;
const DAY = 86_400_000;
const LIMIT = 4000;
const WINDOW_DAYS = 30;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ist = (d: Date) => new Date(d.getTime() + IST_OFFSET);

export function istDate(d: Date): string {
  const x = ist(d);
  return `${WEEKDAYS[x.getUTCDay()]} ${x.getUTCDate()} ${MONTHS[x.getUTCMonth()]}`;
}

export function istTime(d: Date): string {
  const x = ist(d);
  const h = x.getUTCHours();
  return `${h % 12 || 12}:${String(x.getUTCMinutes()).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
}

function indianGroup(n: number): string {
  const s = String(n);
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${rest},${last3}`;
}

export function rupees(paise: number): string {
  const whole = Math.floor(paise / 100);
  const fraction = paise % 100;
  return `₹${indianGroup(whole)}${fraction ? `.${String(fraction).padStart(2, '0')}` : ''}`;
}

const TEXT: Record<Kind, { title: string; action: string | null }> = {
  paid_no_booking: {
    title: '🔴 Paid, but no booking (customer waiting)',
    action: '→ Find the customer in Razorpay: book a slot for them in Cal ID, or refund.',
  },
  paid_booking_unconfirmed: {
    title: '🔴 Paid, but the booking is not confirmed',
    action: '→ Confirm the booking in Cal ID, or refund in Razorpay.',
  },
  booking_no_payment: {
    title: '🔴 Booking without payment',
    action: '→ Check Razorpay. If they did not pay, cancel the booking in Cal ID.',
  },
  double_charge: { title: '🔴 Charged twice for one booking', action: '→ Refund the extra payment in Razorpay.' },
  wrong_amount: {
    title: '🔴 Amount does not match the booking',
    action: '→ Compare the payment in Razorpay with the booking in Cal ID.',
  },
  held_not_taken: {
    title: '🟠 Money held, not taken',
    action: '→ Nothing to do unless the customer asks: Razorpay returns it automatically.',
  },
  cant_verify: { title: '🟠 Could not check a record', action: '→ Tell Arpit. The checker may need updating.' },
  cancelled_not_refunded: {
    title: '🟡 Cancelled, not refunded',
    action: '→ Decide: keep it (no-refund policy) or refund in Razorpay.',
  },
  refunded: { title: 'ℹ️ Refunded', action: null },
};

function block(f: Finding, yesterdayStart: Date, now: Date): string {
  const lines = [TEXT[f.kind].title];

  const facts: string[] = [];
  if (f.name) facts.push(f.name);
  if (f.bookingStart) facts.push(`booked for ${istDate(f.bookingStart)}, ${istTime(f.bookingStart)}`);
  if (f.amount !== null) facts.push(rupees(f.amount));
  if (!f.bookingStart && f.kind !== 'cant_verify') facts.push(`paid ${istDate(f.since)}, ${istTime(f.since)}`);
  if (facts.length) lines.push(`   ${facts.join(' · ')}`);

  const ids: string[] = [];
  if (f.paymentId) ids.push(`Payment ${f.paymentId}`);
  if (f.orderId) ids.push(`Order ${f.orderId}`);
  if (ids.length) lines.push(`   ${ids.join(' · ')}`);
  if (f.detail) lines.push(`   ${f.detail}`);

  if (f.since < yesterdayStart && f.kind !== 'refunded') lines.push(`   Still open since ${istDate(f.since)}`);
  if (f.lastChance) {
    const daysLeft = Math.max(0, WINDOW_DAYS - Math.floor((now.getTime() - f.since.getTime()) / DAY));
    lines.push(`   ⚠ Leaves this check in ${daysLeft} days. Resolve it or note it by hand.`);
  }
  if (TEXT[f.kind].action) lines.push(`   ${TEXT[f.kind].action}`);
  return lines.join('\n');
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function formatReport(report: Report, now: Date): string {
  const stamp = `${istDate(now)}, ${istTime(now)}`;
  const urgent = report.findings.filter((f) => f.severity === 'red' || f.severity === 'orange').length;
  const header = urgent
    ? `🔴 Payments check · ${stamp} · ${urgent} ${urgent === 1 ? 'needs' : 'need'} action`
    : `✅ Payments check · ${stamp}`;

  const y = report.yesterday;
  const summary = [
    y.payments === 0
      ? 'Yesterday: no payments.'
      : `Yesterday: ${plural(y.payments, 'payment')}, ${y.matched === y.payments ? 'all' : y.matched} matched to bookings.`,
    `Captured ${rupees(y.capturedPaise)} · Refunded ${rupees(y.refundedPaise)}`,
  ];
  if (!urgent) summary.push('Nothing needs you today.');

  if (report.findings.length === 0) return [header, ...summary].join('\n');

  const { start } = istYesterday(now);
  const blocks = report.findings.map((f) => block(f, start, now));
  const outro = `\n\n${summary.join('\n')}`;
  const more = (n: number) => `\n\n…and ${n} more. Open Razorpay and Cal ID to see all.`;

  // Add blocks while they fit, always leaving room for the "…and N more" line and the summary.
  let body = header;
  for (let i = 0; i < blocks.length; i++) {
    const next = `${body}\n\n${blocks[i]}`;
    const left = blocks.length - i - 1;
    const reserve = left ? more(left).length : 0;
    if (next.length + reserve + outro.length > LIMIT) return `${body}${more(blocks.length - i)}${outro}`;
    body = next;
  }
  return `${body}${outro}`;
}

export function formatFailure(error: unknown, now: Date): string {
  const reason =
    error instanceof ServiceError
      ? `${error.service} ${error.message}`
      : `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;
  return [
    `⚠️ Payments check FAILED · ${istDate(now)}, ${istTime(now)}`,
    reason,
    'Payments were NOT checked today.',
    '→ Tell Arpit. Until fixed, compare Razorpay and Cal ID by hand.',
  ].join('\n');
}
```

- [ ] **Step 4: Run tests**

Run: `cd workers/reconcile && npm test && npm run typecheck`
Expected: all pass. If the "problem day" exact-text test fails only on blank-line placement, fix `formatReport` (not the test): the expected layout in the test is the contract from the spec.

- [ ] **Step 5: Commit**

```bash
git add workers/reconcile/src/format.ts workers/reconcile/test/format.test.ts
git commit -m "Write the daily Telegram summary, problems first"
```

---

### Task 8: Telegram sender and the scheduled entry point

**Files:**
- Create: `workers/reconcile/src/telegram.ts`, `workers/reconcile/src/index.ts`, `workers/reconcile/test/telegram.test.ts`, `workers/reconcile/test/index.test.ts`

**Interfaces:**
- Consumes: everything above.
- Produces:
  - `sendTelegram(fetchImpl: FetchLike, token: string, chatId: string, text: string, sleep?: (ms: number) => Promise<void>): Promise<void>`
  - `type Env = { RAZORPAY_KEY_ID?: string; RAZORPAY_KEY_SECRET?: string; CALID_API_KEY?: string; TELEGRAM_BOT_TOKEN?: string; TELEGRAM_CHAT_ID?: string; DRY_RUN?: string }`
  - `run(env: Env, deps: { fetch: FetchLike; now: Date; log: (line: string) => void; sleep?: (ms: number) => Promise<void> }): Promise<string>` — returns the message it sent or printed.
  - default export `{ scheduled, fetch }`

- [ ] **Step 1: Write the failing tests**

`workers/reconcile/test/telegram.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { sendTelegram } from '../src/telegram';

const noSleep = async () => {};

describe('sendTelegram', () => {
  it('posts plain text to the chat', async () => {
    const fetchImpl = vi.fn(async () => new Response('{"ok":true}', { status: 200 }));
    await sendTelegram(fetchImpl, 'TOKEN', '-100123', 'hello', noSleep);

    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.telegram.org/botTOKEN/sendMessage');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({ chat_id: '-100123', text: 'hello', disable_web_page_preview: true });
  });

  it('retries, then fails without revealing the token', async () => {
    const fetchImpl = vi.fn(async () => new Response('no', { status: 502 }));
    const error = await sendTelegram(fetchImpl, 'SECRET_TOKEN', '1', 'x', noSleep).catch((e) => e);

    expect(fetchImpl).toHaveBeenCalledTimes(4);
    expect(String(error.message)).toBe('Telegram answered HTTP 502.');
    expect(String(error.message)).not.toContain('SECRET_TOKEN');
  });
});
```

`workers/reconcile/test/index.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import worker, { run, type Env } from '../src/index';
import { NOW } from './fixtures';

const env: Env = {
  RAZORPAY_KEY_ID: 'rzp_live_x',
  RAZORPAY_KEY_SECRET: 'RZP_SECRET',
  CALID_API_KEY: 'CAL_SECRET',
  TELEGRAM_BOT_TOKEN: 'TG_SECRET',
  TELEGRAM_CHAT_ID: '-1001',
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

/** A fake network: empty Razorpay and Cal ID, Telegram accepts. */
function fakeFetch(overrides: { cal?: () => Response } = {}) {
  return vi.fn(async (url: string) => {
    if (url.startsWith('https://api.razorpay.com/')) return json({ items: [] });
    if (url.startsWith('https://api.cal.id/')) return overrides.cal ? overrides.cal() : json({ data: [], meta: { pagination: { totalPages: 1 } } });
    if (url.startsWith('https://api.telegram.org/')) return json({ ok: true });
    throw new Error(`unexpected ${url}`);
  });
}

const deps = (fetchImpl: ReturnType<typeof fakeFetch>, log = vi.fn()) => ({ fetch: fetchImpl, now: NOW, log, sleep: async () => {} });

describe('run', () => {
  it('sends the daily summary to Telegram', async () => {
    const fetchImpl = fakeFetch();
    const text = await run(env, deps(fetchImpl));

    expect(text).toContain('✅ Payments check · Sat 26 Sep, 8:00 am');
    const telegramCalls = fetchImpl.mock.calls.filter(([u]) => String(u).includes('telegram'));
    expect(telegramCalls).toHaveLength(1);
  });

  it('uses 6 subrequests: 1 Razorpay, 4 Cal ID, 1 Telegram', async () => {
    const fetchImpl = fakeFetch();
    await run(env, deps(fetchImpl));
    expect(fetchImpl).toHaveBeenCalledTimes(6);
  });

  it('sends the FAILED message when Cal ID rejects the key, without the key', async () => {
    const fetchImpl = fakeFetch({ cal: () => json({}, 401) });
    const text = await run(env, deps(fetchImpl));

    expect(text.split('\n').slice(0, 2)).toEqual(['⚠️ Payments check FAILED · Sat 26 Sep, 8:00 am', 'Cal ID rejected the API key (401).']);
    for (const secret of ['RZP_SECRET', 'CAL_SECRET', 'TG_SECRET']) expect(text).not.toContain(secret);
  });

  it('reports a missing setting by name', async () => {
    const text = await run({ ...env, CALID_API_KEY: '' }, deps(fakeFetch()));
    expect(text).toContain('Unexpected error: missing setting CALID_API_KEY');
  });

  it('DRY_RUN prints instead of sending', async () => {
    const fetchImpl = fakeFetch();
    const log = vi.fn();
    await run({ ...env, DRY_RUN: '1' }, deps(fetchImpl, log));

    expect(fetchImpl.mock.calls.some(([u]) => String(u).includes('telegram'))).toBe(false);
    expect(log.mock.calls[0][0]).toContain('✅ Payments check');
  });

  it('logs the message and rethrows when Telegram fails', async () => {
    const fetchImpl = vi.fn(async (url: string) =>
      url.includes('telegram') ? new Response('', { status: 500 }) : url.includes('razorpay') ? json({ items: [] }) : json({ data: [] }),
    );
    const log = vi.fn();
    await expect(run(env, deps(fetchImpl as never, log))).rejects.toThrow('Telegram answered HTTP 500.');
    expect(log.mock.calls[0][0]).toContain('could not send Telegram message');
    expect(log.mock.calls[0][0]).not.toContain('TG_SECRET');
  });
});

describe('worker', () => {
  it('has no public endpoint', async () => {
    const response = await worker.fetch();
    expect(response.status).toBe(404);
  });
});
```

- [ ] **Step 2: Run to see them fail**

Run: `cd workers/reconcile && npx vitest run test/telegram.test.ts test/index.test.ts`
Expected: FAIL — cannot find modules.

- [ ] **Step 3: Implement the sender**

`workers/reconcile/src/telegram.ts`:

```ts
import type { FetchLike } from './http';

/**
 * The only write this Worker makes, and only to Telegram. Plain text (no
 * parse_mode) so no character in a name can break the message. Errors never
 * include the bot token, which is part of the URL.
 */

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function sendTelegram(
  fetchImpl: FetchLike,
  token: string,
  chatId: string,
  text: string,
  sleep: (ms: number) => Promise<void> = defaultSleep,
): Promise<void> {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true });
  let status: number | null = null;

  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) await sleep(1000 * 2 ** (attempt - 1));
    try {
      const response = await fetchImpl(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: AbortSignal.timeout(10_000),
      });
      if (response.ok) return;
      status = response.status;
    } catch {
      status = null;
    }
  }
  throw new Error(status === null ? 'Telegram could not be reached.' : `Telegram answered HTTP ${status}.`);
}
```

- [ ] **Step 4: Implement the entry point**

`workers/reconcile/src/index.ts`:

```ts
import { listBookings } from './calid';
import { formatFailure, formatReport } from './format';
import { createHttp, type FetchLike } from './http';
import { listPayments } from './razorpay';
import { reconcile } from './reconcile';
import { sendTelegram } from './telegram';

/**
 * Daily payments check (spec: docs/superpowers/specs/2026-09-26-payment-reconciliation-design.md).
 * Reads Razorpay and Cal ID, compares, and posts one message. Never writes
 * to either service. Any failure becomes a FAILED message, never a false
 * "all good". If Telegram itself fails, the text goes to the Workers log and
 * the missing 8:00 message is the alarm.
 */

export type Env = {
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  CALID_API_KEY?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  DRY_RUN?: string;
};

type Deps = { fetch: FetchLike; now: Date; log: (line: string) => void; sleep?: (ms: number) => Promise<void> };

const REQUIRED = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'CALID_API_KEY', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'] as const;
const WINDOW = 30 * 86_400_000;

export async function run(env: Env, deps: Deps): Promise<string> {
  let text: string;
  try {
    const missing = REQUIRED.filter((key) => !env[key]);
    if (missing.length) throw new Error(`missing setting ${missing.join(', ')}`);

    const http = createHttp(deps.fetch, { sleep: deps.sleep });
    const from = new Date(deps.now.getTime() - WINDOW);
    const [payments, bookings] = await Promise.all([
      listPayments(http, env.RAZORPAY_KEY_ID!, env.RAZORPAY_KEY_SECRET!, from, deps.now),
      listBookings(http, env.CALID_API_KEY!, from),
    ]);
    const report = reconcile(payments.items, bookings.items, [...payments.unreadable, ...bookings.unreadable], deps.now);
    text = formatReport(report, deps.now);
  } catch (error) {
    text = formatFailure(error, deps.now);
  }

  if (env.DRY_RUN === '1') {
    deps.log(text);
    return text;
  }

  try {
    await sendTelegram(deps.fetch, env.TELEGRAM_BOT_TOKEN ?? '', env.TELEGRAM_CHAT_ID ?? '', text, deps.sleep);
  } catch (error) {
    deps.log(`[payments-check] could not send Telegram message: ${error instanceof Error ? error.message : String(error)}\n${text}`);
    throw error;
  }
  return text;
}

type ScheduledController = { scheduledTime: number; cron: string };
type ExecutionContext = { waitUntil(promise: Promise<unknown>): void };

export default {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(
      run(env, {
        fetch: (url, init) => fetch(url, init),
        now: new Date(controller.scheduledTime),
        log: (line) => console.log(line),
      }),
    );
  },
  /** No public endpoint. The cron trigger is the only way in. */
  async fetch() {
    return new Response(null, { status: 404 });
  },
};
```

- [ ] **Step 5: Run everything**

Run: `cd workers/reconcile && npm test && npm run typecheck && npx wrangler deploy --dry-run --outdir /tmp/reconcile-dry`
Expected: all tests pass (including `readonly.test.ts` now that every file exists); typecheck silent; the dry run prints a bundle size and `Schedule: 30 2 * * *` (or the cron listed under triggers) with no errors.

- [ ] **Step 6: Commit**

```bash
git add workers/reconcile/src/telegram.ts workers/reconcile/src/index.ts workers/reconcile/test/telegram.test.ts workers/reconcile/test/index.test.ts
git commit -m "Run the check on a schedule and post the result to Telegram"
```

---

### Task 9: Stage 2 — dry run against the real accounts

**Files:** none committed. Uses `workers/reconcile/.dev.vars` (git-ignored).

- [ ] **Step 1: Arpit sets up Telegram** (Arpit does this)

1. In Telegram, message **@BotFather** → `/newbot` → name "Anjali Payments Check" → copy the token.
2. Create a group with Arpit and Anjali; add the bot.
3. Send any message in the group, then open `https://api.telegram.org/bot<TOKEN>/getUpdates` in a browser and copy `chat.id` (a negative number).
4. Add to `workers/reconcile/.dev.vars`:

```
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=-100...
DRY_RUN=1
```

- [ ] **Step 2: Run the check once, printing only**

Run in one terminal: `cd workers/reconcile && npm run dev`
Run in another: `curl "http://localhost:8787/__scheduled?cron=30+2+*+*+*"`
Expected: the dev terminal prints a "✅ Payments check" or "🔴 Payments check" message. The two cancelled ₹1 test bookings from 26 Sep show as refunded (ℹ️) and no 🔴 appears for them.

- [ ] **Step 3: Compare with the dashboards**

Arpit and the agent read the printed message next to Razorpay (Live) → Payments and Cal ID → Bookings for the last 30 days. Every line must correspond to something real, and nothing real may be missing. If anything differs, fix the rule with a new failing test in `test/reconcile.test.ts` first, then the code, and rerun.

- [ ] **Step 4: Send one real message**

Remove `DRY_RUN=1` from `.dev.vars`, rerun Step 2. Expected: the message arrives in the Telegram group.

- [ ] **Step 5: Remove the live key from the laptop**

Delete the `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` lines from `workers/reconcile/.dev.vars`.
Run: `grep -c RAZORPAY workers/reconcile/.dev.vars || true`
Expected: `0`.

---

### Task 10: Gate — Arpit understands and re-tests before anything is deployed

Nothing in Task 11 starts until Arpit says "go" in chat. The payment path and
the checker are only trusted once Arpit can explain them and has tested them
again himself.

**Files:**
- Update: the "Anjali Jain Payments" artifact (https://claude.ai/artifact/UFbV1vZ2zaKpsr6vQYiHBA), from its scratchpad source `payment-integration.html`

- [ ] **Step 1: Extend the artifact**

Add, in the same ASD-STE100 style, with C4 Mermaid diagrams and analogies:
- The Cal ID ↔ Razorpay connection (OAuth "valet key", no API keys in Cal ID), and what the ₹1 live tests proved.
- The checker: C4 container and component diagrams, the daily sequence (fetch → compare → message), every finding with its analogy and what to do, the three silent-failure layers, secrets and the read-only rule.
- Cal ID's Refund Policy setting and why it must be "Never".
- A glossary of every status word the messages use.

- [ ] **Step 2: Walk-through**

Arpit reads the artifact and asks questions. Answers that reveal a gap go back into the artifact.

- [ ] **Step 3: Full re-test by Arpit**

Arpit repeats Part B of the artifact's test procedure (live ₹1 payment, tab close, popup close, refund, cancel) and Task 9's dry run, and compares the printed message with the dashboards.

- [ ] **Step 4: Go / no-go**

Arpit says "go" in chat, or lists what is still unclear. Only "go" unlocks Task 11.

---

### Task 11: Stage 3 — deploy and prove it live

**Files:** none (dashboard configuration).

- [ ] **Step 1: Merge to main and push** (after Arpit approves the branch)

```bash
git switch main && git merge --ff-only payment-reconciliation && git push origin main
```

- [ ] **Step 2: Create the second Cloudflare Workers project** (Arpit, in the dashboard)

Workers & Pages → Create → Import a repository → `anjali-vastu-portfolio`:
- Project name: `anjali-payments-check` (must match `wrangler.jsonc`)
- Root directory: `workers/reconcile`
- Build command: `npm ci`
- Deploy command: `npx wrangler deploy`
- Production branch: `main`

- [ ] **Step 3: Add the secrets** (Arpit)

anjali-payments-check → Settings → **Variables & Secrets** (runtime, type **Secret**): `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `CALID_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`. Then retry the deployment.

Expected in the deploy log: `Schedule: 30 2 * * *` (cron trigger) and no `workers.dev` URL.

- [ ] **Step 4: Prove the failure path**

Change `CALID_API_KEY` to `wrong`, and temporarily set the cron (Settings → Triggers) to a few minutes ahead. Expected: "⚠️ Payments check FAILED … Cal ID rejected the API key (401)." arrives. Restore the key and the `30 2 * * *` schedule.

- [ ] **Step 5: Prove a real mismatch end to end**

Book the hidden ₹1 "Payment test" event, pay, cancel the booking in Cal ID without refunding. Next 8:00 message: 🟡 "Cancelled, not refunded" with the ₹1 payment. Refund it; the following morning: ℹ️ "Refunded".

- [ ] **Step 6: Record completion**

Update `docs/superpowers/specs/2026-09-26-payment-reconciliation-design.md` status to "live since <date>", and commit:

```bash
git add docs/superpowers/specs/2026-09-26-payment-reconciliation-design.md
git commit -m "Mark the payments check live"
git push origin main
```

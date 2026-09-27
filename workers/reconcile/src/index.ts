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

import { ServiceError } from './http';
import { rupees } from './money';
import { istYesterday, type Finding, type Kind, type Report } from './reconcile';

export { rupees } from './money';

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
    lines.push(`   ⚠ Leaves this check in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}. Resolve it or note it by hand.`);
  }
  if (TEXT[f.kind].action) lines.push(`   ${TEXT[f.kind].action}`);
  return lines.join('\n');
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function formatReport(report: Report, now: Date): string {
  const stamp = `${istDate(now)}, ${istTime(now)}`;
  const reds = report.findings.filter((f) => f.severity === 'red').length;
  const oranges = report.findings.filter((f) => f.severity === 'orange').length;
  const yellows = report.findings.filter((f) => f.severity === 'yellow').length;
  const urgent = reds + oranges;
  const header = reds
    ? `🔴 Payments check · ${stamp} · ${urgent} ${urgent === 1 ? 'needs' : 'need'} action`
    : oranges
      ? `🟠 Payments check · ${stamp} · ${urgent} ${urgent === 1 ? 'needs' : 'need'} action`
      : yellows
        ? `🟡 Payments check · ${stamp} · ${yellows} to decide`
        : `✅ Payments check · ${stamp}`;

  const y = report.yesterday;
  const summary = [
    y.payments === 0
      ? 'Yesterday: no payments.'
      : `Yesterday: ${plural(y.payments, 'payment')}, ${y.matched === y.payments ? 'all' : y.matched} matched to bookings.`,
    `Captured ${rupees(y.capturedPaise)} · Refunded ${rupees(y.refundedPaise)}`,
  ];
  if (!urgent && !yellows) summary.push('Nothing needs you today.');

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

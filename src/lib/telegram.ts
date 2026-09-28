/**
 * Alerts to Anjali's phone through a Telegram bot: a new contact-form message,
 * a new or changed booking. Telegram's Bot API is free, unlike WhatsApp's
 * business API, and needs no app of ours.
 *
 * Server-only. The bot token and the chat to post to are secrets
 * (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID): Cloudflare dashboard in production,
 * `.dev.vars` locally. Without them every send is a quiet no-op, so a missing
 * secret never breaks the form or the webhook.
 *
 * Sending never throws. An alert is a convenience; the booking or message it
 * reports has already happened, and a failed ping must not turn into an error
 * the visitor sees.
 */

const TIME_ZONE = 'Asia/Kolkata';

/** Telegram's HTML mode needs these three escaped; nothing else. */
export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** "Tue 30 Sep, 11:00 am" in India time, however the input was zoned. */
export function formatIndiaTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: TIME_ZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export type ContactAlertInput = {
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  locale: string;
};

export function contactAlert(v: ContactAlertInput): string {
  const lines = [
    '📩 <b>New message from the website</b>',
    '',
    `<b>Name:</b> ${escapeHtml(v.name)}`,
    `<b>Phone:</b> ${escapeHtml(v.phone)}`,
  ];
  if (v.email) lines.push(`<b>Email:</b> ${escapeHtml(v.email)}`);
  if (v.service) lines.push(`<b>Topic:</b> ${escapeHtml(v.service)}`);
  if (v.locale === 'hi') lines.push('<b>Page language:</b> Hindi');
  lines.push('', `<b>Question:</b>\n${escapeHtml(v.message)}`);
  return lines.join('\n');
}

/** The parts of a Cal.com / Cal ID webhook we read. Everything is optional. */
export type CalWebhook = {
  triggerEvent?: string;
  payload?: {
    title?: string;
    type?: string;
    startTime?: string;
    location?: string;
    status?: string;
    paid?: boolean;
    price?: number;
    currency?: string;
    cancellationReason?: string;
    rescheduleStartTime?: string;
    attendees?: { name?: string; email?: string; phoneNumber?: string }[];
    responses?: Record<string, { label?: string; value?: unknown } | undefined>;
  };
};

const EVENT_HEADINGS: Record<string, string> = {
  BOOKING_CREATED: '🗓️ <b>New booking</b>',
  BOOKING_PAID: '✅ <b>Booking paid</b>',
  BOOKING_REQUESTED: '🕓 <b>Booking request (needs your OK)</b>',
  BOOKING_RESCHEDULED: '🔁 <b>Booking rescheduled</b>',
  BOOKING_CANCELLED: '❌ <b>Booking cancelled</b>',
  BOOKING_REJECTED: '🚫 <b>Booking declined</b>',
};

/** The events worth a ping. Others (meetings, recordings…) are ignored. */
export function isAlertEvent(event: string | undefined): event is string {
  return event !== undefined && event in EVENT_HEADINGS;
}

function responseText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'value' in value) {
    const inner = (value as { value?: unknown }).value;
    return typeof inner === 'string' ? inner : '';
  }
  return '';
}

/** A phone number from wherever the booking form put one. */
function phoneOf(p: NonNullable<CalWebhook['payload']>): string {
  const fromAttendee = p.attendees?.find((a) => a.phoneNumber)?.phoneNumber;
  if (fromAttendee) return fromAttendee;
  for (const [key, answer] of Object.entries(p.responses ?? {})) {
    if (/phone/i.test(key)) {
      const text = responseText(answer?.value);
      if (text) return text;
    }
  }
  return '';
}

function locationOf(location: string | undefined): string {
  if (!location) return '';
  if (/phone/i.test(location) || /^\+?\d[\d\s-]{6,}$/.test(location)) return 'By phone';
  if (location.startsWith('integrations:')) return 'Online';
  return location;
}

export function bookingAlert(hook: CalWebhook): string | null {
  if (!isAlertEvent(hook.triggerEvent) || !hook.payload) return null;
  const p = hook.payload;
  const attendee = p.attendees?.[0];
  const lines = [EVENT_HEADINGS[hook.triggerEvent], ''];

  lines.push(`<b>Service:</b> ${escapeHtml(p.type ?? p.title ?? 'Consultation')}`);
  if (p.startTime) lines.push(`<b>When:</b> ${escapeHtml(formatIndiaTime(p.startTime))}`);
  if (attendee?.name) lines.push(`<b>Name:</b> ${escapeHtml(attendee.name)}`);
  const phone = phoneOf(p);
  if (phone) lines.push(`<b>Phone:</b> ${escapeHtml(phone)}`);
  if (attendee?.email) lines.push(`<b>Email:</b> ${escapeHtml(attendee.email)}`);
  const where = locationOf(p.location);
  if (where) lines.push(`<b>Where:</b> ${escapeHtml(where)}`);
  if (typeof p.price === 'number' && p.price > 0) {
    const amount = `${p.currency?.toUpperCase() === 'INR' ? '₹' : ''}${p.price / 100}`;
    lines.push(`<b>Fee:</b> ${escapeHtml(amount)}${p.paid ? ' (paid)' : ''}`);
  }
  if (hook.triggerEvent === 'BOOKING_CANCELLED' && p.cancellationReason) {
    lines.push(`<b>Reason:</b> ${escapeHtml(p.cancellationReason)}`);
  }
  return lines.join('\n');
}

/**
 * Post a message to Anjali's chat. Resolves true when Telegram accepted it,
 * false otherwise (no secrets, network error, Telegram refused). Never throws.
 */
export async function sendTelegram(
  text: string,
  env: { token?: string; chatId?: string } = {
    token: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  },
): Promise<boolean> {
  if (!env.token || !env.chatId) return false;
  try {
    const response = await fetch(`https://api.telegram.org/bot${env.token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) {
      /* Status only: the response can echo the chat, never the token. */
      console.error('[telegram] send failed', { status: response.status });
    }
    return response.ok;
  } catch (error) {
    console.error('[telegram] send failed', { error: (error as Error).name });
    return false;
  }
}

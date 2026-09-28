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

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

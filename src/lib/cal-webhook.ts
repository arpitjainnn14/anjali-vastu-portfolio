/**
 * Cal ID (a Cal.com fork) signs each webhook: the `x-cal-signature-256`
 * header is the hex HMAC-SHA256 of the raw request body, keyed with the
 * secret set on the webhook in Cal ID. Anything that fails this check did not
 * come from Cal ID and is dropped before its body is read as JSON.
 *
 * Web Crypto, not node:crypto, so it runs the same in the Worker and in tests.
 */

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function calSignature(body: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(body)));
}

/** Compares every character, so the time taken says nothing about the match. */
function sameText(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function isValidCalSignature(
  body: string,
  header: string | null,
  secret: string | undefined,
): Promise<boolean> {
  if (!secret || !header) return false;
  const expected = await calSignature(body, secret);
  return sameText(expected, header.trim().toLowerCase());
}

import { describe, expect, it } from 'vitest';
import { SECURITY_HEADERS } from './security-headers';

describe('security headers (SEO audit)', () => {
  it('names the standard ones audit tools and browsers check', () => {
    const names = SECURITY_HEADERS.map((h) => h.key);
    expect(names).toEqual(expect.arrayContaining(['Strict-Transport-Security', 'X-Content-Type-Options', 'Referrer-Policy', 'X-Frame-Options', 'Permissions-Policy']));
  });
  it('does not switch off the payment feature Cal ID’s checkout uses', () => {
    const policy = SECURITY_HEADERS.find((h) => h.key === 'Permissions-Policy')?.value ?? '';
    expect(policy).not.toContain('payment');
  });
});

describe('public/_headers (files served straight from public/)', () => {
  it('carries the same headers as the pages', async () => {
    const { readFileSync } = await import('node:fs');
    const file = readFileSync(new URL('../../public/_headers', import.meta.url), 'utf8');
    for (const h of SECURITY_HEADERS) expect(file).toContain(`  ${h.key}: ${h.value}`);
  });
});

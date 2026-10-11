import { describe, expect, it } from 'vitest';
import { resolveSiteUrl } from './site-url';

describe('resolveSiteUrl (review 24)', () => {
  it('uses NEXT_PUBLIC_SITE_URL, without a trailing slash', () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'https://jyotishanjali.in/', NODE_ENV: 'production' })).toBe('https://jyotishanjali.in');
  });
  it('refuses any production build that would fall back to localhost, not only Vercel and Workers CI', () => {
    expect(() => resolveSiteUrl({ NODE_ENV: 'production' })).toThrow('NEXT_PUBLIC_SITE_URL');
  });
  it('uses localhost while developing', () => {
    expect(resolveSiteUrl({ NODE_ENV: 'development' })).toBe('http://localhost:3000');
  });
});

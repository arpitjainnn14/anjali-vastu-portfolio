import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { faq, howItWorks } from '@/content';

/**
 * Lines that were true before online booking and are false after it. Scans
 * every content file rather than named fields, so copy added later (such as
 * the contact-page blocks still being written) is caught too.
 */
const retired = [/booking desk/i, /no payment is asked/i, /not listed here/i, /pricing is never published/i];

const dir = fileURLToPath(new URL('.', import.meta.url));
const contentFiles = readdirSync(dir).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'));

describe('copy that contradicts online booking', () => {
  it.each(retired.map((r) => [r]))('no content file says %s', (pattern) => {
    for (const file of contentFiles) {
      expect(readFileSync(`${dir}${file}`, 'utf8'), file).not.toMatch(pattern);
    }
  });

  it('no step of how it works is still a TODO', () => {
    for (const step of howItWorks) {
      expect(step.title).not.toMatch(/^TODO\(/);
      expect(step.body).not.toMatch(/^TODO\(/);
    }
  });

  it('the FAQ quotes the fee', () => {
    expect(faq.items[0].a).toContain('₹2,151');
  });
});

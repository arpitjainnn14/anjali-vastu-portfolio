import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { contact, contactSection, faq, footer, howItWorks, nav, privacy, refundPolicy, terms } from '@/content';

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

describe('policy pages', () => {
  it('are linked from the footer', () => {
    const hrefs = footer.columns.flatMap((c) => c.links.map((l) => l.href));
    expect(hrefs).toContain('/terms');
    expect(hrefs).toContain('/refund-policy');
  });

  it('nothing in the nav or footer links to booking pages yet', () => {
    const hrefs = [
      ...nav.links.map((l) => l.href),
      ...footer.columns.flatMap((c) => c.links.map((l) => l.href)),
    ];
    for (const href of hrefs) expect(href).not.toMatch(/^\/book/);
  });

  it('state the refund rules agreed with Anjali', () => {
    const text = refundPolicy.intro + refundPolicy.sections.map((s) => s.body).join(' ');
    expect(text).toMatch(/cannot be cancelled/);
    expect(text).toMatch(/charged twice/);
    expect(text).toMatch(/reschedule once, at least 24 hours before/);
  });

  it('say what the fee covers', () => {
    const text = terms.sections.map((s) => s.body).join(' ');
    expect(text).toMatch(/three months/);
    expect(text).toMatch(/not medical, legal or financial advice/);
  });

  it('privacy covers the booking and payment services', () => {
    const text = privacy.sections.map((s) => s.body).join(' ');
    expect(text).toMatch(/Cal ID/);
    expect(text).toMatch(/Razorpay/);
  });

  it('show the email address on the contact page', () => {
    expect(contactSection.details.some((d) => d.value === contact.email)).toBe(true);
  });
});

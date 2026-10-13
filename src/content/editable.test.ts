import { describe, expect, it } from 'vitest';
import { applyPublished, editableLimits, editablePages, parsePublished } from './editable';
import { codeContent } from '.';

const { en, hi } = codeContent;
const fields = editablePages(en, hi).flatMap((p) => p.groups.flatMap((g) => g.fields));
const byPath = new Map(fields.map((f) => [f.path, f]));
const limits = editableLimits(en, hi);

describe('editablePages', () => {
  it('lists her pages with their words, English and Hindi side by side', () => {
    expect(editablePages(en, hi).map((p) => p.id)).toEqual(['home', 'services', 'about', 'teaching', 'testimonials', 'contact', 'privacy', 'terms', 'refunds']);
    expect(byPath.get('hero.lead')).toMatchObject({ en: en.hero.lead, hi: hi.hero.lead, multiline: true, todo: false });
    expect(byPath.get('faq.items.3.a')).toMatchObject({ label: 'Item 4 › Answer', en: en.faq.items[3].a });
    expect(byPath.get('about.heading')?.accent).toBe(true);
    expect(byPath.get('hero.headingAccent')?.label).toBe('Heading, highlighted word');
    expect(byPath.get('teaching.spec.0.label')?.label).toBe('Spec 1 › Label');
  });
  it('leaves links, images, slugs, prices, icons, emails and quote languages in code', () => {
    for (const path of ['hero.primaryCta.href', 'hero.proof.lang', 'about.portrait.src', 'services.0.slug', 'services.0.icon', 'services.0.booking.fee.display', 'contactSection.details.3.value', 'contactSection.details.3.link.href']) {
      expect(byPath.has(path), path).toBe(false);
    }
    expect(byPath.has('servicesSection.needLine')).toBe(false); // a function, not words
  });
  it('offers an unsupplied fact as empty, marked so', () => {
    expect(byPath.get('about.willNotDo.items.0')).toMatchObject({ en: '', hi: '', todo: true });
  });
  it('gives each field room to grow', () => {
    for (const f of fields) expect(f.max).toBeGreaterThanOrEqual(Math.max(80, f.en.length));
  });
  it('every path is unique', () => expect(byPath.size).toBe(fields.length));
});

describe('applyPublished', () => {
  it('puts her words in and leaves everything else as it was', () => {
    const out = applyPublished(en, { 'hero.lead': 'New lead.', 'faq.items.0.q': 'New question?' }, limits);
    expect(out.hero.lead).toBe('New lead.');
    expect(out.faq.items[0].q).toBe('New question?');
    expect(out.faq.items[1]).toBe(en.faq.items[1]);
    expect(out.services).toBe(en.services);
    expect(en.hero.lead).not.toBe('New lead.'); // the code copy is untouched
  });
  it('ignores paths that are not editable, too long, blank or not text', () => {
    const out = applyPublished(en, {
      'hero.primaryCta.href': 'https://evil.example', 'hero.missing': 'x', 'hero.standfirst': 'x'.repeat(limits.get('hero.standfirst')! + 1),
      'hero.headingAccent': '   ', 'faq.items': 'x',
    }, limits);
    expect(out).toBe(en);
  });
  it('fills an unsupplied fact', () => {
    expect(applyPublished(en, { 'about.willNotDo.items.0': 'Frighten you.' }, limits).about.willNotDo.items[0]).toBe('Frighten you.');
  });
});

describe('parsePublished', () => {
  it('reads both languages and drops anything that is not text', () => {
    expect(parsePublished(JSON.stringify({ en: { a: 'x', b: 1 }, hi: { c: 'y' } }))).toEqual({ en: { a: 'x' }, hi: { c: 'y' } });
  });
  it('is empty when missing or broken', () => {
    for (const raw of [undefined, '', 'nope', '[]', '{"en":[1]}']) expect(parsePublished(raw)).toEqual({ en: {}, hi: {} });
  });
});

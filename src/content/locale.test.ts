import { describe, expect, it } from 'vitest';
import { isLocale, locales, defaultLocale, type Content } from './locale';
import { en } from './en';

describe('isLocale', () => {
  it('accepts en and hi', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('hi')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isLocale('fr')).toBe(false);
    expect(isLocale('')).toBe(false);
  });

  it('lists both locales, defaulting to en', () => {
    expect(locales).toEqual(['en', 'hi']);
    expect(defaultLocale).toBe('en');
  });
});

describe('Content: widened enough for a translation, strict enough to catch a mistake', () => {
  it('accepts a bundle whose strings differ from the English literals', () => {
    /*
     * Type-level proof that `Content` is not just `typeof en`: this assigns a
     * bundle with different string *values* than English (not real Hindi —
     * that is Task 5's job — just proof the type doesn't pin the literals).
     * If `Widen` stopped widening string literals to `string`, this would fail
     * `tsc --noEmit`, not just at runtime.
     */
    const changed: Content = {
      ...en,
      hero: { ...en.hero, headingLine1: 'ज्योतिष जो देता है' },
      site: { ...en.site, title: 'एक अलग शीर्षक' },
    };
    expect(changed.hero.headingLine1).toBe('ज्योतिष जो देता है');
    expect(changed.site.title).toBe('एक अलग शीर्षक');
  });

  it('still rejects a bundle that drops a field', () => {
    // @ts-expect-error -- Content requires every key `en.hero` has; this one only has `standfirst`.
    const missing: Content = { ...en, hero: { standfirst: en.hero.standfirst } };
    expect(missing).toBeTruthy();
  });
});

import { describe, expect, it } from 'vitest';
import { serviceIcons } from '@/components/ui/Icons';
import { getContent, locales, type Content } from './index';

/**
 * The parts of a content bundle that are identifiers, not words: icon keys,
 * slugs, hrefs, Cal ID slugs, form field names, picker weights. A translation
 * changes the words around them and never these.
 *
 * `Content` widens every string to `string` (see locale.ts), so TypeScript
 * would accept a Hindi bundle whose `icon` says 'सूर्य'. These tests are what
 * catch that.
 */

const iconKeys = Object.keys(serviceIcons);

function iconsOf(c: Content) {
  return [...c.services.map((s) => s.icon), ...c.teaching.tracks.map((t) => t.icon)];
}

/** Everything in a bundle that must be byte-identical in every language. */
function identifiersOf(c: Content) {
  return {
    brand: c.site.brand,
    brandLines: c.site.brandLines,
    practisingSince: c.site.practisingSince,
    contact: c.contact,
    navHrefs: c.nav.links.map((l) => l.href),
    footerColumns: c.footer.columns.map((col) => ({
      showMeta: col.showMeta,
      hrefs: col.links.map((l) => l.href),
    })),
    notFoundCode: c.notFound.code,
    heroHrefs: [c.hero.primaryCta.href, c.hero.secondaryCta.href],
    services: c.services.map((s) => ({ slug: s.slug, icon: s.icon, booking: s.booking, covers: s.covers.length })),
    booking: {
      live: c.booking.live,
      calBaseUrl: c.booking.calBaseUrl,
      calUsername: c.booking.calUsername,
      embed: c.booking.embed,
      detailsLineKeys: Object.keys(c.booking.detailsMessage.lines).sort(),
    },
    picker: {
      href: c.picker.href,
      questions: c.picker.questions.map((q) => ({ id: q.id, weights: q.options.map((o) => o.weights) })),
      because: Object.keys(c.picker.because).sort(),
    },
    portrait: {
      src: c.about.portrait.src,
      objectPositionDesktop: c.about.portrait.objectPositionDesktop,
      objectPositionMobile: c.about.portrait.objectPositionMobile,
    },
    teachingTracks: c.teaching.tracks.map((t) => ({ slug: t.slug, icon: t.icon })),
    testimonials: c.testimonials.map((t) => ({ lang: t.lang, hasTitle: t.title !== undefined })),
    contactLinks: c.contactSection.details.map((d) => d.link?.href ?? null),
    formFields: Object.fromEntries(
      Object.entries(c.form.fields).map(([key, field]) => [
        key,
        Object.fromEntries(Object.entries(field).filter(([prop]) => prop !== 'label')),
      ]),
    ),
    siteMapHref: c.siteMap.href,
  };
}

describe('identifiers in the content bundles', () => {
  it.each(locales.map((l) => [l]))('every service and teaching-track icon in %s is a serviceIcons key', (locale) => {
    for (const icon of iconsOf(getContent(locale))) {
      expect(iconKeys, `icon "${icon}" in ${locale}`).toContain(icon);
    }
  });

  it('are the same in every language', () => {
    const en = identifiersOf(getContent('en'));
    for (const locale of locales) {
      expect(identifiersOf(getContent(locale)), locale).toEqual(en);
    }
  });
});

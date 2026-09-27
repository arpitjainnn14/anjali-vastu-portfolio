import type { Content, Locale } from '@/content';
import { LocaleProvider } from '@/components/locale/LocaleProvider';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { StickyWhatsApp } from '@/components/layout/StickyWhatsApp';
import { Motion } from '@/components/motion/Motion';
import { siteGraph, jsonLd } from '@/lib/structured-data';

/**
 * Everything inside `<body>` that every page shares: the site's structured
 * data, the skip link, the nav, the footer, the pinned WhatsApp button and the
 * scroll-reveal layer. Both root layouts (English and Hindi) render it, so the
 * two languages cannot drift apart in anything but their words.
 */
export function SiteBody({ c, locale, children }: { c: Content; locale: Locale; children: React.ReactNode }) {
  return (
    <LocaleProvider locale={locale}>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(siteGraph(c, locale))} />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-100 focus:rounded-control focus:bg-sindoor focus:px-5 focus:py-3 focus:text-card focus:t-small focus:font-semibold"
      >
        {c.nav.labels.skipToContent}
      </a>
      <Nav />
      <main id="main">{children}</main>
      <Footer c={c} locale={locale} />
      <StickyWhatsApp />
      <Motion />
    </LocaleProvider>
  );
}

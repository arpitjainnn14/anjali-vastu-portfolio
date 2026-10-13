import { ViewTransition } from 'react';
import type { Content, Locale } from '@/content';
import { LocaleProvider } from '@/components/locale/LocaleProvider';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { StickyWhatsApp } from '@/components/layout/StickyWhatsApp';
import { Motion } from '@/components/motion/Motion';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { siteGraph, jsonLd } from '@/lib/structured-data';

/**
 * Everything inside `<body>` that every page shares: the site's structured
 * data, the skip link, the nav, the footer, the pinned WhatsApp button, the
 * scroll layer, smooth scrolling and the page cross-fade. Both root layouts (English and Hindi) render it, so the
 * two languages cannot drift apart in anything but their words.
 */
export function SiteBody({ c, locale, children }: { c: Content; locale: Locale; children: React.ReactNode }) {
  return (
    <LocaleProvider locale={locale}>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(siteGraph())} />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-100 focus:rounded-control focus:bg-sindoor focus:px-5 focus:py-3 focus:text-card focus:t-small focus:font-semibold"
      >
        {c.nav.labels.skipToContent}
      </a>
      <Nav />
      {/*
        Pages cross-fade when a link is followed: Next's navigations are
        React transitions, which run this. Browsers without the View
        Transitions API, and reduced motion (globals.css), just switch.
      */}
      <main id="main">
        <ViewTransition>{children}</ViewTransition>
      </main>
      <Footer c={c} locale={locale} />
      <StickyWhatsApp />
      <Motion />
      <SmoothScroll />
    </LocaleProvider>
  );
}

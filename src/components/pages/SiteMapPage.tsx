import type { Metadata } from 'next';
import Link from 'next/link';
import type { Content, Locale } from '@/content';
import { Section, Container, Accented } from '@/components/ui/Section';
import { pageMetadata } from '@/lib/metadata';
import { sitePageGroups } from '@/lib/site-pages';

/**
 * The site map for people, at /sitemap.html. The same page list as
 * sitemap.xml (lib/site-pages.ts), plus the noindex notices.
 */
export function siteMapMetadata(c: Content, locale: Locale): Metadata {
  return pageMetadata({ ...c.siteMap.meta, path: c.siteMap.href, locale, c });
}

export function SiteMapPage({ c, locale }: { c: Content; locale: Locale }) {
  return (
    <Section className="pt-28 md:pt-40">
      <Container>
        <h1 className="t-h1 m-0 max-w-[16ch] text-balance text-ink">
          <Accented text={c.siteMap.heading} />
        </h1>

        <div className="mt-10 grid gap-12 md:mt-16 md:grid-cols-2 md:gap-x-20 md:gap-y-16">
          {sitePageGroups(c, locale).map((group) => (
            <nav key={group.heading} aria-label={group.heading} className="flex flex-col gap-5">
              <h2 className="t-h3 m-0 text-ink">{group.heading}</h2>
              <ul className="m-0 flex list-none flex-col gap-5 p-0">
                {group.pages.map((page) => (
                  <li key={page.href} className="flex max-w-[52ch] flex-col gap-1">
                    <Link
                      href={page.href}
                      className="ink-link inline-flex min-h-11 items-center self-start font-display text-[19px] text-sindoor md:min-h-0"
                    >
                      {page.label}
                    </Link>
                    <p className="t-small m-0 text-muted">{page.description}</p>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </Container>
    </Section>
  );
}

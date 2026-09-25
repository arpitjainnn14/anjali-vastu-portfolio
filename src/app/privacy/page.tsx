import type { Metadata } from 'next';
import { privacy, site } from '@/content';
import { SmartLink } from '@/components/ui/SmartLink';
import { whatsappHref } from '@/lib/whatsapp';
import { Section, Container } from '@/components/ui/Section';
import { present, isTodo } from '@/lib/todo';

/**
 * How your details are used.
 *
 * Its own page, not a footer paragraph: India's DPDP Rules require the notice
 * to be clear, itemised and separate from any terms of service.
 *
 * DESIGN.md is explicit that a lawyer reviews this copy before it ships, and
 * four decisions are still open (retention period, an email address for
 * written requests, who handles complaints, whether analytics are added). So
 * the page is `noindex` until it has been reviewed — publishing an
 * unreviewed privacy notice to search engines is worse than not having one.
 *
 * To ship it: have the copy reviewed, fill the TODOs in content.ts, then
 * delete the `robots` block below.
 */
export const metadata: Metadata = {
  title: privacy.heading,
  description: privacy.metaDescription,
  alternates: { canonical: '/privacy' },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  const lastUpdated = present(privacy.lastUpdated);

  /*
   * A section whose whole body is still a TODO is dropped. A section with a
   * TODO inside a real paragraph keeps the paragraph — the sentence around it
   * still tells the visitor something true — but the marker itself is stripped
   * so no placeholder ever reaches a reader.
   */
  const sections = privacy.sections
    .filter((section) => !isTodo(section.body))
    .map((section) => ({
      ...section,
      body: section.body.replace(/TODO\([^)]*\)\.?\s*/g, '').trim(),
    }))
    .filter((section) => section.body.length > 0);

  return (
    <Section className="pt-28 md:pt-40">
      <Container>
        <div className="flex max-w-[760px] flex-col gap-6">
          <h1 className="t-h1 m-0 text-ink">{privacy.heading}</h1>

          {lastUpdated && <span className="t-small text-muted">{privacy.lastUpdatedLabel} {lastUpdated}</span>}

          <p className="t-lead m-0">{privacy.intro}</p>

          <div className="mt-6 flex flex-col gap-10">
            {sections.map((section) => (
              <div key={section.heading} className="flex flex-col gap-3">
                <h2 className="t-h3 m-0 text-ink">
                  {section.heading}
                </h2>
                <p className="t-body m-0">
                  {section.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-line-strong pt-6">
            <span className="font-display text-[19px] text-ink">{privacy.reachHeading}</span>
            <span className="t-body">
              <SmartLink
                href={whatsappHref()}
                className="ink-link inline-flex min-h-11 items-center text-sindoor md:min-h-0"
              >
                {privacy.reachLink}
              </SmartLink>
              {privacy.reachNote}
            </span>
            <span className="t-small text-muted">
              {site.city}, {site.state}
            </span>
          </div>
        </div>
      </Container>
    </Section>
  );
}

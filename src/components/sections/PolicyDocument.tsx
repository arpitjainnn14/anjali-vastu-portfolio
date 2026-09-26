import { site } from '@/content';
import { SmartLink } from '@/components/ui/SmartLink';
import { Section, Container } from '@/components/ui/Section';
import { whatsappHref } from '@/lib/whatsapp';
import { present, visibleSections } from '@/lib/todo';

export type PolicyDoc = {
  heading: string;
  intro: string;
  lastUpdatedLabel: string;
  lastUpdated: string;
  reachHeading: string;
  reachLink: string;
  reachNote: string;
  sections: readonly { heading: string; body: string }[];
};

/**
 * A notice page: privacy, terms, refunds. Itemised sections, then how to reach
 * her about it. Unsupplied facts never reach the visitor (see visibleSections).
 */
export function PolicyDocument({ doc }: { doc: PolicyDoc }) {
  const lastUpdated = present(doc.lastUpdated);
  const sections = visibleSections(doc.sections);

  return (
    <Section className="pt-28 md:pt-40">
      <Container>
        <div className="flex max-w-[760px] flex-col gap-6">
          <h1 className="t-h1 m-0 text-ink">{doc.heading}</h1>

          {lastUpdated && <span className="t-small text-muted">{doc.lastUpdatedLabel} {lastUpdated}</span>}

          <p className="t-lead m-0">{doc.intro}</p>

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
            <span className="font-display text-[19px] text-ink">{doc.reachHeading}</span>
            <span className="t-body">
              <SmartLink
                href={whatsappHref()}
                className="ink-link inline-flex min-h-11 items-center text-sindoor md:min-h-0"
              >
                {doc.reachLink}
              </SmartLink>
              {doc.reachNote}
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

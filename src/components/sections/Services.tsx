import Link from 'next/link';
import { services, servicesSection } from '@/content';
import { Section, Container, SectionHeader } from '@/components/ui/Section';
import { serviceIcons, ArrowRightIcon } from '@/components/ui/Icons';

/**
 * Services, as a numbered index rather than three identical cards.
 *
 * Each row is one link to the service page. On hover the row's paper deepens,
 * the number turns sindoor and the arrow moves forward: small, but it tells a
 * pointer user the whole row is the target.
 */
export function Services() {
  return (
    <Section id="services" tone="deep">
      <Container>
        <SectionHeader
          eyebrow={servicesSection.eyebrow}
          heading={servicesSection.heading}
          lead={servicesSection.lead}
        />

        <ol className="m-0 mt-10 list-none border-t border-line-strong p-0 md:mt-20" data-reveal-group>
          {services.map((service, i) => {
            const Icon = serviceIcons[service.icon];
            return (
              <li key={service.slug} className="border-b border-line-strong" data-reveal-item>
                <Link
                  href={`/services/${service.slug}`}
                  className="group relative grid no-underline transition-colors duration-300 md:grid-cols-[88px_minmax(0,4fr)_minmax(0,6fr)_48px] md:gap-8 md:px-4 md:py-11 gap-3 py-7 pointer-fine:hover:bg-paper"
                >
                  <span className="font-display text-[20px] italic text-muted transition-colors duration-300 group-hover:text-sindoor md:pt-2 md:text-[24px]">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div className="flex flex-col gap-2">
                    <h3 className="t-h3 m-0 flex items-center gap-3 text-ink">
                      <Icon size={26} strokeWidth={1.4} className="shrink-0 text-haldi" />
                      {service.name}
                    </h3>
                    <span className="t-small text-muted">{service.question}</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <p className="t-body m-0 max-w-[52ch] text-body">{service.summary}</p>
                    <p className="t-small m-0 text-muted">
                      <span className="font-semibold text-ink">{servicesSection.needLabel}:</span>{' '}
                      {service.youWillNeed.charAt(0).toLowerCase() + service.youWillNeed.slice(1)}.
                      <span aria-hidden="true" className="px-2">·</span>
                      {servicesSection.priceLine}
                    </p>
                    <span aria-hidden="true" className="inline-flex items-center gap-2 text-[15.5px] font-semibold text-sindoor md:hidden">
                      {service.detailLinkLabel}
                      <ArrowRightIcon size={15} className="nudge" />
                    </span>
                  </div>

                  <span
                    aria-hidden="true"
                    className="hidden h-12 w-12 items-center justify-center self-center rounded-full border border-line-strong text-ink transition-colors duration-300 group-hover:border-sindoor group-hover:bg-sindoor group-hover:text-card md:flex"
                  >
                    <ArrowRightIcon size={18} className="nudge" />
                  </span>
                  <span className="sr-only">{service.detailLinkLabel}</span>
                </Link>
              </li>
            );
          })}
        </ol>

        <p className="t-small m-0 mt-8 text-muted" data-reveal>
          {servicesSection.footnote}
        </p>
      </Container>
    </Section>
  );
}

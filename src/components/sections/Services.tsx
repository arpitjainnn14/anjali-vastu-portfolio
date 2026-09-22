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
 *
 * Phones get swipeable cards instead. Stacked, the three rows became ~1,600px
 * of paragraphs and lost the "three ways" composition. As cards, each keeps
 * its number, icon, name, question and a clamped summary, and the next card
 * peeks in from the right so the swipe needs no instruction. From `md` up the
 * cards dissolve back into the desktop rows.
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

        <ol
          className={
            'm-0 mt-10 flex list-none snap-x snap-mandatory gap-4 overflow-x-auto p-0 ' +
            '-mx-5 px-5 pb-3 scroll-px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ' +
            'md:mx-0 md:mt-20 md:block md:overflow-visible md:border-t md:border-line-strong md:px-0 md:pb-0'
          }
          data-reveal-group
        >
          {services.map((service, i) => {
            const Icon = serviceIcons[service.icon];
            return (
              <li
                key={service.slug}
                className="flex w-[84%] max-w-[340px] shrink-0 snap-start md:block md:w-auto md:max-w-none md:border-b md:border-line-strong"
                data-reveal-item
              >
                <Link
                  href={`/services/${service.slug}`}
                  className={
                    'group relative flex w-full flex-col gap-4 rounded-card border border-line bg-card p-6 no-underline ' +
                    'transition-colors duration-300 pointer-fine:hover:bg-paper ' +
                    'md:grid md:grid-cols-[88px_minmax(0,4fr)_minmax(0,6fr)_48px] md:gap-8 md:rounded-none md:border-0 ' +
                    'md:bg-transparent md:px-4 md:py-11'
                  }
                >
                  {/* Phones: number left, icon right, as the card's header row. */}
                  <div className="flex items-center justify-between md:block">
                    <span className="font-display text-[22px] italic text-muted transition-colors duration-300 group-hover:text-sindoor md:pt-2 md:text-[24px]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <Icon size={30} strokeWidth={1.3} className="text-haldi md:hidden" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <h3 className="t-h3 m-0 flex items-center gap-3 text-ink">
                      <Icon size={26} strokeWidth={1.4} className="hidden shrink-0 text-haldi md:block" />
                      {service.name}
                    </h3>
                    <span className="t-small text-muted">{service.question}</span>
                  </div>

                  <div className="flex flex-1 flex-col gap-3">
                    <p className="t-body m-0 line-clamp-4 max-w-[52ch] text-body md:line-clamp-none">{service.summary}</p>
                    <p className="t-small m-0 text-muted">
                      <span className="font-semibold text-ink">{servicesSection.needLabel}:</span>{' '}
                      {service.youWillNeed.charAt(0).toLowerCase() + service.youWillNeed.slice(1)}.
                      <span aria-hidden="true" className="px-2">·</span>
                      {servicesSection.priceLine}
                    </p>
                    <span aria-hidden="true" className="mt-auto inline-flex items-center gap-2 pt-1 text-[15.5px] font-semibold text-sindoor md:hidden">
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

        <p className="t-small m-0 mt-6 text-muted md:mt-8" data-reveal>
          {servicesSection.footnote}
        </p>
      </Container>
    </Section>
  );
}

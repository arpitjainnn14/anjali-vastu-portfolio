import Link from 'next/link';
import type { Content, Locale } from '@/content';
import { Section, Container, SectionHeader } from '@/components/ui/Section';
import { serviceIcons, type ServiceIconKey, ArrowRightIcon } from '@/components/ui/Icons';
import { ServiceScene } from '@/components/art/ServiceScenes';
import { serviceFeeLine } from '@/lib/booking';
import { localePath } from '@/lib/locale-routing';

/**
 * Services, as a stage the visitor scrolls through, at every screen size.
 *
 * A night panel pins to the screen and each service card, a full screen of
 * scroll apart, slides up over the one before it while the scene behind
 * changes to that service's (art/ServiceScenes). On phones the card sits along
 * the bottom over the photograph; from `lg` it stands on the right.
 *
 * The stacking is plain CSS sticky, so it works without JavaScript or under
 * reduced motion; `[data-stack]` in Motion.tsx adds the panel's entrance, the
 * card hand-off and the scene cross-fade. The whole card is the link.
 */
export function Services({ c, locale }: { c: Content; locale: Locale }) {
  const { services, servicesSection, picker } = c;

  return (
    /*
     * Tighter than the default paper padding (80px, not 128): three rows of
     * plain text and a header is not enough content to fill a 128px-padded
     * slab, and the section read as mostly background. See the same call in
     * Testimonials.
     */
    <Section id="services" tone="deep" className="overflow-visible! py-14! md:py-20!">
      <Container>
        <SectionHeader
          heading={servicesSection.heading}
          lead={servicesSection.lead}
        />
      </Container>

      <div data-stack className="relative mx-auto mt-8 w-full max-w-[1440px] px-3 md:mt-12 md:px-5">
        <div data-stack-stage aria-hidden="true" className="sticky top-0 h-svh py-3 md:py-5">
          <div data-stack-panel className="relative h-full overflow-hidden rounded-[16px] bg-night md:rounded-[20px]">
            {services.map((service, i) => (
              <div
                key={service.slug}
                data-stack-scene
                className={`absolute inset-0 bg-night ${i ? 'opacity-0' : ''}`}
              >
                <ServiceScene icon={service.icon} />
              </div>
            ))}
            {/* Shade under the card: along the bottom on phones, down the right side on desktop. */}
            <div className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-b from-night/0 to-night/85 lg:inset-x-auto lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[55%] lg:bg-linear-to-r lg:to-night/80" />
          </div>
        </div>

        {/* The ::after holds the last card a while: sticky ignores the list's padding. */}
        <ol className="relative z-10 m-0 -mt-[100svh] list-none p-0 after:block after:h-[40svh]">
          {services.map((service) => {
            const Icon = serviceIcons[service.icon as ServiceIconKey];
            return (
              <li
                key={service.slug}
                className={
                  /* Phones: the card sits low, clear of the pinned WhatsApp button. */
                  'pointer-events-none sticky top-0 flex h-svh items-end justify-center px-6 pb-24 md:px-12 md:pb-16 ' +
                  'lg:items-start lg:justify-end lg:pb-0 lg:pr-[clamp(40px,7vw,120px)] lg:pt-[max(112px,calc(50svh-260px))]'
                }
              >
                <Link
                  href={localePath(locale, `/services/${service.slug}`)}
                  className={
                    'group pointer-events-auto relative flex w-full max-w-[460px] flex-col gap-3 rounded-card bg-card p-5 no-underline ' +
                    'shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)] transition-colors duration-300 pointer-fine:hover:bg-paper ' +
                    'md:gap-4 md:p-8 lg:gap-5 lg:p-10'
                  }
                  data-stack-card
                >
                  <Icon size={36} strokeWidth={1.3} className="h-7 w-7 text-haldi md:h-9 md:w-9" />

                  <div className="flex flex-col gap-1.5 md:gap-2">
                    <h3 className="t-h3 m-0 text-ink">{service.name}</h3>
                    <span className="t-small text-muted">{service.question}</span>
                  </div>

                  <div className="flex flex-1 flex-col gap-3">
                    <p className="t-body m-0 line-clamp-3 text-body md:line-clamp-none">{service.summary}</p>
                    <p className="t-small m-0 text-muted">
                      <span className="font-semibold text-ink">{servicesSection.needLabel}:</span>{' '}
                      {servicesSection.needLine(service.youWillNeed)}
                      <span aria-hidden="true" className="px-2">·</span>
                      {serviceFeeLine(c, service)}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-2 pt-1 text-[15.5px] font-semibold text-sindoor">
                      {service.detailLinkLabel}
                      <ArrowRightIcon size={15} className="nudge" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>

      <Container>

        <p className="t-small m-0 mt-6 text-muted md:mt-8" data-reveal>
          {servicesSection.footnote}
        </p>

        {/*
          The picker is a page of its own: inline it was a 500px interactive
          block in the middle of a page whose job is to get someone to
          WhatsApp. Here it is one line.
        */}
        <Link
          href={localePath(locale, picker.href)}
          className="group mt-6 inline-flex min-h-11 items-center gap-2 text-[15.5px] font-semibold text-sindoor no-underline md:mt-8"
          data-reveal
        >
          {picker.linkLabel}
          <ArrowRightIcon size={15} className="nudge" />
        </Link>
      </Container>
    </Section>
  );
}

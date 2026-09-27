import type { Metadata } from 'next';
import type { Content, Locale } from '@/content';
import { Section, Container } from '@/components/ui/Section';
import { ButtonLink } from '@/components/ui/Button';
import { SmartLink } from '@/components/ui/SmartLink';
import { ArrowRightIcon } from '@/components/ui/Icons';
import { bookableServices, bookPageHref, calLink, calUrl, type BookableService } from '@/lib/booking';
import { whatsappHref } from '@/lib/whatsapp';
import { pageMetadata } from '@/lib/metadata';
import { CalInline } from '@/components/ui/CalInline';

/**
 * Kept out of search until booking is live: an indexed page offering a
 * booking that cannot yet be paid for is worse than no page.
 */
export function bookingMetadata(c: Content, locale: Locale, chosen: BookableService): Metadata {
  return {
    ...pageMetadata({
      title: c.booking.page.metaTitleFor(chosen.name),
      description: c.booking.page.metaDescription,
      /*
       * The canonical points at /book/<service>, not /book: the two pages have
       * the same content, and /book/<service> is the one form of the URL a
       * visitor can also reach by picking a service.
       */
      path: bookPageHref(chosen, 'en'),
      locale,
      c,
    }),
    ...(c.booking.live ? {} : { robots: { index: false, follow: false } }),
  };
}

/**
 * Book and pay for a consultation. Cal ID does the calendar and the payment;
 * this view chooses the service and hands over.
 */
export function BookingView({ c, locale, chosen }: { c: Content; locale: Locale; chosen: BookableService }) {
  const page = c.booking.page;

  return (
    <Section className="pt-28 md:pt-40">
      <Container>
        <div className="flex max-w-[760px] flex-col gap-5">
          <h1 className="t-h1 m-0 text-ink">{page.heading}</h1>
          <p className="t-lead m-0">{page.lead}</p>
          <p className="t-body m-0">
            {c.booking.offerLine} {page.detailsNote}
          </p>
        </div>

        <nav aria-label={page.chooseLabel} className="mt-10 flex flex-wrap gap-3">
          {bookableServices(c).map((service) => {
            const current = service.slug === chosen.slug;
            return (
              /*
                A plain <a>, not next/link: the calendar embed's script runs
                once per page load, so switching service must be a real load.
              */
              <a
                key={service.slug}
                href={bookPageHref(service, locale)}
                aria-current={current ? 'page' : undefined}
                className={
                  'inline-flex min-h-11 items-center rounded-control border px-5 t-small font-semibold no-underline transition-colors duration-200 ' +
                  (current ? 'border-ink bg-ink text-card' : 'border-line-strong text-ink hover:border-ink')
                }
              >
                {service.name} · {service.booking.fee.display}
              </a>
            );
          })}
        </nav>

        <div className="mt-8">
          {c.booking.embed ? (
            <>
              <CalInline
                key={chosen.slug}
                namespace={chosen.slug}
                calLink={calLink(chosen)}
                scriptUrl={c.booking.embed.scriptUrl}
                origin={c.booking.embed.origin}
              />
              <SmartLink
                href={calUrl(chosen)}
                className="ink-link mt-4 inline-flex min-h-11 items-center t-small text-sindoor md:min-h-0"
              >
                {page.openCalendar}
              </SmartLink>
            </>
          ) : (
            <div className="flex flex-col items-start gap-4 rounded-card border border-line-strong bg-card p-6 md:p-8">
              <span className="font-display text-[22px] text-ink md:text-[24px]">{chosen.name}</span>
              <span className="t-small text-muted">{chosen.question}</span>
              <ButtonLink href={calUrl(chosen)}>
                {page.pickTime}
                <ArrowRightIcon size={17} className="nudge" />
              </ButtonLink>
            </div>
          )}
        </div>

        <p className="t-small m-0 mt-4 text-muted">{page.lengthNote}</p>

        {/* Has its own WhatsApp link, so the floating one steps aside while this line is on screen. */}
        <p className="t-small m-0 mt-8 text-muted" data-hides-sticky>
          {page.vastuNote}{' '}
          <SmartLink href={whatsappHref(c, page.vastuMessage)} className="ink-link text-sindoor">
            {page.vastuLink}
          </SmartLink>
        </p>
      </Container>
    </Section>
  );
}

import type { Metadata } from 'next';
import { booking } from '@/content';
import { Section, Container } from '@/components/ui/Section';
import { ButtonLink } from '@/components/ui/Button';
import { SmartLink } from '@/components/ui/SmartLink';
import { ArrowRightIcon } from '@/components/ui/Icons';
import { bookableServices, bookPageHref, calUrl, type BookableService } from '@/lib/booking';
import { whatsappHref } from '@/lib/whatsapp';
import { pageMetadata } from '@/lib/metadata';

/**
 * Kept out of search until booking is live: an indexed page offering a
 * booking that cannot yet be paid for is worse than no page.
 */
export function bookingMetadata(chosen: BookableService, path: string): Metadata {
  return {
    ...pageMetadata({
      title: booking.page.metaTitleFor(chosen.name),
      description: booking.page.metaDescription,
      path,
    }),
    ...(booking.live ? {} : { robots: { index: false, follow: false } }),
  };
}

/**
 * Book and pay for a consultation. Cal ID does the calendar and the payment;
 * this view chooses the service and hands over.
 */
export function BookingView({ chosen }: { chosen: BookableService }) {
  const page = booking.page;

  return (
    <Section className="pt-28 md:pt-40">
      <Container>
        <div className="flex max-w-[760px] flex-col gap-5">
          <h1 className="t-h1 m-0 text-ink">{page.heading}</h1>
          <p className="t-lead m-0">{page.lead}</p>
          <p className="t-body m-0">
            {booking.offerLine} {page.detailsNote}
          </p>
        </div>

        <nav aria-label={page.chooseLabel} className="mt-10 flex flex-wrap gap-3">
          {bookableServices.map((service) => {
            const current = service.slug === chosen.slug;
            return (
              /*
                A plain <a>, not next/link: the calendar embed's script runs
                once per page load, so switching service must be a real load.
              */
              <a
                key={service.slug}
                href={bookPageHref(service)}
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
          <div className="flex flex-col items-start gap-4 rounded-card border border-line-strong bg-card p-6 md:p-8">
            <span className="font-display text-[22px] text-ink md:text-[24px]">{chosen.name}</span>
            <span className="t-small text-muted">{chosen.question}</span>
            <ButtonLink href={calUrl(chosen)}>
              {page.pickTime}
              <ArrowRightIcon size={17} className="nudge" />
            </ButtonLink>
          </div>
        </div>

        {/* Has its own WhatsApp link, so the floating one steps aside while this line is on screen. */}
        <p className="t-small m-0 mt-8 text-muted" data-hides-sticky>
          {page.vastuNote}{' '}
          <SmartLink href={whatsappHref(page.vastuMessage)} className="ink-link text-sindoor">
            {page.vastuLink}
          </SmartLink>
        </p>
      </Container>
    </Section>
  );
}

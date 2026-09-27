import type { Content } from '@/content';
import { Section, Container } from '@/components/ui/Section';
import { ButtonLink } from '@/components/ui/Button';
import { WhatsAppIcon } from '@/components/ui/Icons';
import { bookedCopy, detailsHref, type BookableService } from '@/lib/booking';

/**
 * Where Cal ID sends a customer after paying. Its job is the one step Cal ID
 * cannot do: getting the birth details to Anjali on WhatsApp. The URL only
 * chooses wording; nothing here is proof of a booking.
 */
export function BookedView({ c, service }: { c: Content; service: BookableService | null }) {
  const copy = bookedCopy(c, service);

  return (
    <Section className="pt-28 md:pt-40">
      <Container>
        <div className="flex max-w-[640px] flex-col items-start gap-6">
          <h1 className="t-h1 m-0 text-ink">{copy.heading}</h1>
          <p className="t-lead m-0">{copy.body}</p>
          <ButtonLink href={detailsHref(c, service)}>
            <WhatsAppIcon size={19} />
            {c.booking.booked.detailsCta}
          </ButtonLink>
          <p className="t-body m-0">{c.booking.offerLine}</p>
        </div>
      </Container>
    </Section>
  );
}

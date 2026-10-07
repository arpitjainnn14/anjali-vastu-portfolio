import type { Content, Locale } from '@/content';
import { cal } from '@/content/shared';
import { whatsappHref } from './whatsapp';
import { localePath } from './locale-routing';

/**
 * Which services are booked online, where their calendars live, and what a
 * service page offers as its main action.
 *
 * The one place a Cal ID URL is built, as lib/whatsapp.ts is for WhatsApp.
 */

/**
 * A service exactly as it comes out of a content bundle: the same shape as
 * `Service` in `content/en/services.ts`, with translated fields (name, icon,
 * question, ...) widened to `string` — a bundle's `services` array can never
 * be assigned the narrower, English-only type.
 */
export type Service = Content['services'][number];

export type BookableService = Service & { booking: NonNullable<Service['booking']> };

export function isBookable(service: Service): service is BookableService {
  return service.booking !== null;
}

export function bookableServices(c: Content): BookableService[] {
  return c.services.filter(isBookable);
}

/**
 * The username/slug path the Cal embed expects. The username is a shared
 * fact (the same Cal ID account whichever language a visitor reads in).
 */
export function calLink(service: BookableService): string {
  return `${cal.username}/${service.booking.calSlug}`;
}

/** The service's public page on Cal ID. */
export function calUrl(service: BookableService): string {
  return `${cal.baseUrl}/${calLink(service)}`;
}

/** The site's own booking page for this service, in the visitor's language. */
export function bookPageHref(service: BookableService, locale: Locale): string {
  return localePath(locale, `/book/${service.slug}`);
}

/** The bookable service with this slug; undefined for Vastu or anything unknown. */
export function findBookable(c: Content, slug: string): BookableService | undefined {
  return bookableServices(c).find((s) => s.slug === slug);
}

/** The price with what it includes, for the home list; the fallback when not booked online. */
export function serviceFeeLine(c: Content, service: Service): string {
  return isBookable(service)
    ? `${service.booking.fee.display}, ${c.servicesSection.feeIncludes}`
    : c.servicesSection.priceOnRequest;
}

export type ServiceCta = { kind: 'book' | 'whatsapp'; href: string; label: string };

/** A service page's main button: booking once live, WhatsApp otherwise. */
export function serviceCta(
  c: Content,
  service: Service,
  locale: Locale,
  live: boolean = c.booking.live,
): ServiceCta {
  if (live && isBookable(service)) {
    return {
      kind: 'book',
      href: bookPageHref(service, locale),
      label: c.booking.ctaLabel(service.booking.fee.display),
    };
  }
  return {
    kind: 'whatsapp',
    href: whatsappHref(c, c.whatsappMessages.service(service.name)),
    label: service.whatsappLabel,
  };
}

/**
 * "How it works", with step 1 swapped for the online-booking wording once
 * booking is live. Not-live wording lives at `c.howItWorks[0]`.
 */
export function howItWorksSteps(c: Content, live: boolean = c.booking.live) {
  return live ? [c.bookFirstStepLive, ...c.howItWorks.slice(1)] : c.howItWorks;
}

/**
 * One service page's "How it works": its own four steps, with step 1 swapped
 * for the online-booking wording once booking is live (if it has any; Vastu
 * is never booked online).
 */
export function serviceSteps(service: Service, live: boolean = false) {
  return live && service.liveFirstStep ? [service.liveFirstStep, ...service.steps.slice(1)] : service.steps;
}

/** The line under a service page's main button. */
export function serviceReassurance(c: Content, service: Service, live: boolean = c.booking.live): string {
  return live && isBookable(service) ? c.booking.offerLine : c.serviceDetail.reassurance;
}

export function bookedCopy(c: Content, service: BookableService | null): { heading: string; body: string } {
  const copy = c.booking.booked;
  return service
    ? { heading: copy.headingFor(service.name), body: copy.body }
    : { heading: copy.genericHeading, body: copy.genericBody };
}

/** The WhatsApp message listing the details this consultation needs. */
export function detailsMessage(c: Content, service: BookableService | null): string {
  const m = c.booking.detailsMessage;
  const opener = service ? m.openerFor(service.name) : m.opener;
  const lines = (service && m.lines[service.slug]) || m.combined;
  return [opener, '', ...lines].join('\n');
}

export function detailsHref(c: Content, service: BookableService | null): string {
  return whatsappHref(c, detailsMessage(c, service));
}

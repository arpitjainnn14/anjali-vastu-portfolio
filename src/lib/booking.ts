import { booking, services, serviceDetail, whatsappMessages, type Service } from '@/content';
import { whatsappHref } from './whatsapp';

/**
 * Which services are booked online, where their calendars live, and what a
 * service page offers as its main action.
 *
 * The one place a Cal ID URL is built, as lib/whatsapp.ts is for WhatsApp.
 */

export type BookableService = Service & { booking: NonNullable<Service['booking']> };

export function isBookable(service: Service): service is BookableService {
  return service.booking !== null;
}

export const bookableServices: BookableService[] = services.filter(isBookable);

/** The username/slug path the Cal embed expects. */
export function calLink(service: BookableService): string {
  return `${booking.calUsername}/${service.booking.calSlug}`;
}

/** The service's public page on Cal ID. */
export function calUrl(service: BookableService): string {
  return `${booking.calBaseUrl}/${calLink(service)}`;
}

export function bookPageHref(service: BookableService): string {
  return `/book/${service.slug}`;
}

/** The bookable service with this slug; undefined for Vastu or anything unknown. */
export function findBookable(slug: string): BookableService | undefined {
  return bookableServices.find((s) => s.slug === slug);
}

/** The price for a service booked online, or `onRequest` for one that is not. */
export function serviceFee(service: Service, onRequest: string): string {
  return isBookable(service) ? service.booking.fee.display : onRequest;
}

export type ServiceCta = { kind: 'book' | 'whatsapp'; href: string; label: string };

/** A service page's main button: booking once live, WhatsApp otherwise. */
export function serviceCta(service: Service, live: boolean = booking.live): ServiceCta {
  if (live && isBookable(service)) {
    return {
      kind: 'book',
      href: bookPageHref(service),
      label: booking.ctaLabel(service.booking.fee.display),
    };
  }
  return {
    kind: 'whatsapp',
    href: whatsappHref(whatsappMessages.service(service.name)),
    label: serviceDetail.ctaLabel,
  };
}

/** The line under a service page's main button. */
export function serviceReassurance(service: Service, live: boolean = booking.live): string {
  return live && isBookable(service) ? booking.offerLine : serviceDetail.reassurance;
}

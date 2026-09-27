import { describe, expect, it } from 'vitest';
import { services, consultationFee, serviceDetail, booking, howItWorks, bookFirstStepLive } from '@/content';
import {
  bookableServices,
  bookPageHref,
  bookedCopy,
  calLink,
  calUrl,
  detailsHref,
  detailsMessage,
  findBookable,
  howItWorksSteps,
  serviceCta,
  serviceFeeLine,
  serviceReassurance,
} from './booking';

function service(slug: string) {
  const found = services.find((s) => s.slug === slug);
  if (!found) throw new Error(`No service ${slug}`);
  return found;
}

function bookable(slug: string) {
  const found = bookableServices.find((s) => s.slug === slug);
  if (!found) throw new Error(`${slug} is not bookable`);
  return found;
}

describe('consultationFee', () => {
  it('displays the amount the way an Indian reader writes it', () => {
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(consultationFee.amount);
    expect(consultationFee.display).toBe(formatted);
    expect(consultationFee.display).toBe('₹2,151');
  });
});

describe('bookableServices', () => {
  it('are Vedic Astrology and Numerology, and not Vastu', () => {
    expect(bookableServices.map((s) => s.slug)).toEqual(['vedic-astrology', 'numerology']);
  });

  it('each book the Cal ID event type with the same slug as its page', () => {
    for (const s of bookableServices) expect(s.booking.calSlug).toBe(s.slug);
  });
});

describe('Cal ID links', () => {
  it('builds the public booking page URL', () => {
    expect(calUrl(bookable('numerology'))).toBe('https://cal.id/anjali-jain13/numerology');
  });

  it('builds the username/slug path the embed expects', () => {
    expect(calLink(bookable('vedic-astrology'))).toBe('anjali-jain13/vedic-astrology');
  });

  it('links to /book with the service preselected', () => {
    expect(bookPageHref(bookable('numerology'))).toBe('/book/numerology');
  });
});

describe('findBookable', () => {
  it('finds a service booked online', () => {
    expect(findBookable('numerology')?.slug).toBe('numerology');
  });

  it.each([
    ['a service that is not booked online', 'vastu'],
    ['an unknown slug', 'tarot'],
    ['an empty slug', ''],
  ])('finds nothing for %s', (_label, slug) => {
    expect(findBookable(slug)).toBeUndefined();
  });
});

describe('serviceCta', () => {
  it('offers WhatsApp everywhere while booking is not live', () => {
    for (const s of services) {
      const cta = serviceCta(s, false);
      expect(cta.kind).toBe('whatsapp');
      expect(cta.href.startsWith('https://wa.me/')).toBe(true);
      expect(cta.label).toBe(serviceDetail.ctaLabel);
    }
  });

  it('offers booking for a bookable service once live', () => {
    expect(serviceCta(service('numerology'), true)).toEqual({
      kind: 'book',
      href: '/book/numerology',
      label: 'Book a consultation · ₹2,151',
    });
  });

  it('keeps WhatsApp for Vastu even once live', () => {
    expect(serviceCta(service('vastu'), true).kind).toBe('whatsapp');
  });

  it('defaults to the live flag in content', () => {
    expect(serviceCta(service('numerology')).kind).toBe(booking.live ? 'book' : 'whatsapp');
  });
});

describe('serviceReassurance', () => {
  it('names the three months of calls on a bookable service once live', () => {
    expect(serviceReassurance(service('vedic-astrology'), true)).toBe(booking.offerLine);
  });

  it('keeps the general line for Vastu and while not live', () => {
    expect(serviceReassurance(service('vastu'), true)).toBe(serviceDetail.reassurance);
    expect(serviceReassurance(service('vedic-astrology'), false)).toBe(serviceDetail.reassurance);
  });
});

describe('howItWorksSteps', () => {
  it('keeps the not-live step 1 wording while booking is not live', () => {
    expect(howItWorksSteps(false)).toEqual(howItWorks);
  });

  it('swaps step 1 for the online-booking wording once live', () => {
    const steps = howItWorksSteps(true);
    expect(steps[0]).toEqual(bookFirstStepLive);
    expect(steps.slice(1)).toEqual(howItWorks.slice(1));
  });
});

describe('bookedCopy', () => {
  it('names the consultation when the service is known', () => {
    expect(bookedCopy(bookable('numerology')).heading).toBe('Your Numerology consultation is booked');
  });

  it('does not claim a booking when opened without one', () => {
    const copy = bookedCopy(null);
    expect(copy.heading).toBe(booking.booked.genericHeading);
    expect(copy.heading + copy.body).not.toMatch(/is booked/);
  });
});

describe('detailsMessage', () => {
  it('asks for the numerology details only', () => {
    expect(detailsMessage(bookable('numerology'))).toBe(
      'Hello Anjali, I have just booked a Numerology consultation. My details:\n\n' +
        'Full name:\nDate of birth:',
    );
  });

  it('asks for the birth details for a chart reading', () => {
    expect(detailsMessage(bookable('vedic-astrology'))).toBe(
      'Hello Anjali, I have just booked a Vedic Astrology consultation. My details:\n\n' +
        'Date of birth:\nTime of birth:\nPlace of birth:',
    );
  });

  it('lists every field when the service is unknown', () => {
    expect(detailsMessage(null)).toBe(
      'Hello Anjali, I have just booked a consultation. My details:\n\n' +
        'Full name:\nDate of birth:\nTime of birth:\nPlace of birth:',
    );
  });

  it('has a details list for every bookable service', () => {
    for (const s of bookableServices) expect(booking.detailsMessage.lines[s.slug]).toBeDefined();
  });

  it('is sent as an encoded WhatsApp link', () => {
    const href = detailsHref(bookable('numerology'));
    expect(href.startsWith('https://wa.me/')).toBe(true);
    expect(href).toContain('%0A');
    expect(href).not.toContain('\n');
  });
});

describe('serviceFeeLine', () => {
  it('names the three months of calls after the price of a service booked online', () => {
    expect(serviceFeeLine(service('numerology'), 'On request')).toBe(
      '₹2,151, including three months of calls',
    );
  });

  it('shows only the fallback for Vastu', () => {
    expect(serviceFeeLine(service('vastu'), 'On request')).toBe('On request');
  });
});

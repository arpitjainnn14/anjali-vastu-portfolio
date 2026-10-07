import { describe, expect, it } from 'vitest';
import { getContent } from '@/content';
import { consultationFee } from '@/content/shared';
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
  serviceSteps,
  serviceCta,
  serviceFeeLine,
  serviceReassurance,
} from './booking';

const c = getContent('en');

function service(slug: string) {
  const found = c.services.find((s) => s.slug === slug);
  if (!found) throw new Error(`No service ${slug}`);
  return found;
}

function bookable(slug: string) {
  const found = bookableServices(c).find((s) => s.slug === slug);
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
    expect(bookableServices(c).map((s) => s.slug)).toEqual(['vedic-astrology', 'numerology']);
  });

  it('each book the Cal ID event type with the same slug as its page', () => {
    for (const s of bookableServices(c)) expect(s.booking.calSlug).toBe(s.slug);
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
    expect(bookPageHref(bookable('numerology'), 'en')).toBe('/book/numerology');
  });

  it('keeps a Hindi visitor on the Hindi booking page', () => {
    expect(bookPageHref(bookable('numerology'), 'hi')).toBe('/hi/book/numerology');
  });
});

describe('findBookable', () => {
  it('finds a service booked online', () => {
    expect(findBookable(c, 'numerology')?.slug).toBe('numerology');
  });

  it.each([
    ['a service that is not booked online', 'vastu'],
    ['an unknown slug', 'tarot'],
    ['an empty slug', ''],
  ])('finds nothing for %s', (_label, slug) => {
    expect(findBookable(c, slug)).toBeUndefined();
  });
});

describe('serviceCta', () => {
  it('offers WhatsApp everywhere while booking is not live', () => {
    for (const s of c.services) {
      const cta = serviceCta(c, s, 'en', false);
      expect(cta.kind).toBe('whatsapp');
      expect(cta.href.startsWith('https://wa.me/')).toBe(true);
      expect(cta.label).toBe(s.whatsappLabel);
    }
  });

  it('offers booking for a bookable service once live', () => {
    expect(serviceCta(c, service('numerology'), 'en', true)).toEqual({
      kind: 'book',
      href: '/book/numerology',
      label: 'Book a consultation · ₹2,151',
    });
  });

  it('sends a Hindi visitor to the Hindi booking page', () => {
    expect(serviceCta(getContent('hi'), service('numerology'), 'hi', true).href).toBe('/hi/book/numerology');
  });

  it('keeps WhatsApp for Vastu even once live', () => {
    expect(serviceCta(c, service('vastu'), 'en', true).kind).toBe('whatsapp');
  });

  it('defaults to the live flag in content', () => {
    expect(serviceCta(c, service('numerology'), 'en').kind).toBe(c.booking.live ? 'book' : 'whatsapp');
  });
});

describe('serviceReassurance', () => {
  it('names the three months of calls on a bookable service once live', () => {
    expect(serviceReassurance(c, service('vedic-astrology'), true)).toBe(c.booking.offerLine);
  });

  it('keeps the general line for Vastu and while not live', () => {
    expect(serviceReassurance(c, service('vastu'), true)).toBe(c.serviceDetail.reassurance);
    expect(serviceReassurance(c, service('vedic-astrology'), false)).toBe(c.serviceDetail.reassurance);
  });
});

describe('howItWorksSteps', () => {
  it('keeps the not-live step 1 wording while booking is not live', () => {
    expect(howItWorksSteps(c, false)).toEqual(c.howItWorks);
  });

  it('swaps step 1 for the online-booking wording once live', () => {
    const steps = howItWorksSteps(c, true);
    expect(steps[0]).toEqual(c.bookFirstStepLive);
    expect(steps.slice(1)).toEqual(c.howItWorks.slice(1));
  });
});

describe('serviceSteps', () => {
  it('gives each service its own four steps while not live', () => {
    for (const s of c.services) expect(serviceSteps(s, false)).toEqual(s.steps);
  });

  it('swaps step 1 for the booking wording once live, where the service has one', () => {
    const vedic = service('vedic-astrology');
    expect(serviceSteps(vedic, true)[0]).toEqual(vedic.liveFirstStep);
    expect(serviceSteps(vedic, true).slice(1)).toEqual(vedic.steps.slice(1));
  });

  it('never swaps Vastu, which is not booked online', () => {
    expect(serviceSteps(service('vastu'), true)).toEqual(service('vastu').steps);
  });
});

describe('bookedCopy', () => {
  it('names the consultation when the service is known', () => {
    expect(bookedCopy(c, bookable('numerology')).heading).toBe('Your Numerology consultation is booked');
  });

  it('does not claim a booking when opened without one', () => {
    const copy = bookedCopy(c, null);
    expect(copy.heading).toBe(c.booking.booked.genericHeading);
    expect(copy.heading + copy.body).not.toMatch(/is booked/);
  });
});

describe('detailsMessage', () => {
  it('asks for the numerology details only', () => {
    expect(detailsMessage(c, bookable('numerology'))).toBe(
      'Hello Anjali, I have just booked a Numerology consultation. My details:\n\n' +
        'Full name:\nDate of birth:',
    );
  });

  it('asks for the birth details for a chart reading', () => {
    expect(detailsMessage(c, bookable('vedic-astrology'))).toBe(
      'Hello Anjali, I have just booked a Vedic Astrology consultation. My details:\n\n' +
        'Date of birth:\nTime of birth:\nPlace of birth:',
    );
  });

  it('lists every field when the service is unknown', () => {
    expect(detailsMessage(c, null)).toBe(
      'Hello Anjali, I have just booked a consultation. My details:\n\n' +
        'Full name:\nDate of birth:\nTime of birth:\nPlace of birth:',
    );
  });

  it('has a details list for every bookable service', () => {
    for (const s of bookableServices(c)) expect(c.booking.detailsMessage.lines[s.slug]).toBeDefined();
  });

  it('is sent as an encoded WhatsApp link', () => {
    const href = detailsHref(c, bookable('numerology'));
    expect(href.startsWith('https://wa.me/')).toBe(true);
    expect(href).toContain('%0A');
    expect(href).not.toContain('\n');
  });
});

describe('serviceFeeLine', () => {
  it('names the three months of calls after the price of a service booked online', () => {
    expect(serviceFeeLine(c, service('numerology'))).toBe('₹2,151, which includes three months of follow-up calls');
  });

  it('shows the fallback for Vastu', () => {
    expect(serviceFeeLine(c, service('vastu'))).toBe(c.servicesSection.priceOnRequest);
  });
});

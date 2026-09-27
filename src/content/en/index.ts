/** The English content bundle: every string an English-reading visitor sees. */

import { site, seal, contact, whatsappMessages } from './site';
import { nav, footer } from './navigation';
import { hero } from './hero';
import {
  services,
  servicesSection,
  bookFirstStepLive,
  howItWorks,
  serviceDetail,
} from './services';
import { booking } from './booking';
import { picker } from './picker';
import { about } from './about';
import { teaching } from './teaching';
import { testimonials, testimonialsSection } from './testimonials';
import { faq } from './faq';
import { contactSection, form } from './contact';
import { privacy } from './privacy';
import { terms, refundPolicy, policyPages } from './policies';

export const en = {
  site,
  seal,
  contact,
  whatsappMessages,
  nav,
  footer,
  hero,
  services,
  servicesSection,
  bookFirstStepLive,
  howItWorks,
  serviceDetail,
  booking,
  picker,
  about,
  teaching,
  testimonials,
  testimonialsSection,
  faq,
  contactSection,
  form,
  privacy,
  terms,
  refundPolicy,
  policyPages,
} as const;

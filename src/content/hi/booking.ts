/** Online booking: Cal ID for the calendar, Razorpay for payment. */

import { whatsappMessages } from './site';
import { cal, bookingLive, bookingEmbed } from '../shared';

/** DRAFTED, like the English. */
export const booking = {
  live: bookingLive,
  calBaseUrl: cal.baseUrl,
  calUsername: cal.username,
  embed: bookingEmbed,
  ctaLabel: (fee: string) => `अपना consultation बुक करें · ${fee}`,
  unsureLink: 'पक्का नहीं पता? WhatsApp पर पूछें',
  offerLine: 'फ़ीस में तीन महीने तक अंजलि जी को सीधे कॉल करने की सुविधा शामिल है।',
  page: {
    metaTitleFor: (name: string) => `अंजलि जैन के साथ ${name} consultation बुक करें`,
    metaDescription:
      'अंजलि जैन के साथ वैदिक ज्योतिष या अंकशास्त्र का consultation बुक करें और ऑनलाइन ' +
      'पेमेंट करें। पलवल में मिलकर या फ़ोन पर, हिंदी या अंग्रेज़ी में।',
    heading: 'अपना consultation बुक करें',
    lead: 'अपनी सुविधा का समय चुनें और ऑनलाइन पेमेंट करें। आपकी बुकिंग तुरंत पक्की हो जाती है।',
    detailsNote:
      'बुकिंग में सिर्फ़ आपका नाम, ईमेल और फ़ोन नंबर पूछा जाता है। बुकिंग के बाद अपनी ' +
      'जन्म की जानकारी अंजलि जी को WhatsApp पर भेजें।',
    lengthNote: 'कैलेंडर में एक घंटे का समय रखा जाता है, पर consultation जितनी देर ज़रूरी हो, उतनी देर चलता है।',
    chooseLabel: 'consultation चुनें',
    pickTime: 'समय चुनें',
    openCalendar: 'कैलेंडर नए टैब में खोलें',
    vastuNote: 'वास्तु चाहिए? वह WhatsApp पर तय होता है।',
    vastuLink: 'वास्तु के बारे में पूछें',
    vastuMessage: whatsappMessages.service('वास्तु'),
  },
  booked: {
    metaTitle: 'बुकिंग मिल गई',
    metaDescription: 'अंजलि जैन के साथ आपका consultation, और उन्हें भेजने वाली जानकारी।',
    headingFor: (name: string) => `आपका ${name} consultation बुक हो गया है`,
    body:
      'कन्फ़र्मेशन आपके ईमेल पर आ रहा है। बस एक काम और: आपकी रीडिंग के लिए जो जानकारी ' +
      'चाहिए, वह अंजलि जी को भेजें।',
    genericHeading: 'धन्यवाद',
    genericBody:
      'अगर आपने अभी consultation बुक किया है, तो कन्फ़र्मेशन आपके ईमेल पर आ रहा है। ' +
      'आपकी रीडिंग के लिए जो जानकारी चाहिए, वह अंजलि जी को WhatsApp पर भेजें।',
    detailsCta: 'अपनी जानकारी WhatsApp पर भेजें',
  },
  /** The prefilled WhatsApp message from /booked. One field per line, left blank to fill in. */
  detailsMessage: {
    openerFor: (name: string) => `नमस्ते अंजलि जी, मैंने अभी ${name} consultation बुक किया है। मेरी जानकारी:`,
    opener: 'नमस्ते अंजलि जी, मैंने अभी consultation बुक किया है। मेरी जानकारी:',
    lines: {
      'vedic-astrology': ['जन्म की तारीख:', 'जन्म का समय:', 'जन्म का स्थान:'],
      numerology: ['पूरा नाम:', 'जन्म की तारीख:'],
    } as Record<string, readonly string[]>,
    combined: ['पूरा नाम:', 'जन्म की तारीख:', 'जन्म का समय:', 'जन्म का स्थान:'],
  },
} as const;

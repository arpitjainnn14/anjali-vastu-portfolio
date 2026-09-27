/** The three consultations: the home page list and each service page. */

import { consultationFee } from '../shared';
import type { Service } from '../en/services';

export const services: Service[] = [
  {
    slug: 'vedic-astrology',
    name: 'वैदिक ज्योतिष',
    icon: 'sun',
    question: 'करियर, शादी और सही समय के सवालों के लिए',
    summary:
      'आपकी कुंडली उसी सवाल को ध्यान में रखकर देखी जाती है जो आप लेकर आए हैं। अंजलि जी ' +
      'देखती हैं कि ग्रह कहाँ बैठे हैं और आपकी कौन-सी दशा चल रही है, फिर बताती हैं कि ' +
      'यह समय क्या लेकर आ सकता है और हालात कब बदल सकते हैं।',
    meta: {
      title: 'पलवल में वैदिक ज्योतिष consultation',
      description:
        'करियर, शादी और सही समय के लिए आपकी कुंडली का विश्लेषण, पलवल में मिलकर या फ़ोन पर, ' +
        'हिंदी या अंग्रेज़ी में। अपनी जन्म की तारीख, समय और स्थान तैयार रखें।',
    },
    detailLinkLabel: 'इसमें क्या-क्या देखा जाता है',
    covers: [
      'TODO(vedic-covers-1)',
      'TODO(vedic-covers-2)',
      'TODO(vedic-covers-3)',
      'TODO(vedic-covers-4)',
    ],
    youWillNeed: 'जन्म की तारीख, समय और स्थान',
    booking: { calSlug: 'vedic-astrology', fee: consultationFee },
  },
  {
    slug: 'numerology',
    name: 'अंकशास्त्र',
    icon: 'grid',
    question: 'नाम, तारीख और नई शुरुआत के लिए',
    summary:
      'आपके नाम और जन्म की तारीख का एक-एक अंक देखा जाता है। अंजलि जी बताती हैं कि ये ' +
      'किस ओर इशारा करते हैं, और नाम में सुधार करवाना सच में ठीक रहेगा या नहीं।',
    meta: {
      title: 'पलवल में अंकशास्त्री: नाम और जन्म तारीख का विश्लेषण',
      description:
        'आपके नाम और जन्म की तारीख का एक-एक अंक देखकर, सीधा जवाब कि नाम में सुधार ' +
        'करवाना ठीक रहेगा या नहीं। पलवल में मिलकर या फ़ोन पर।',
    },
    detailLinkLabel: 'इसमें क्या-क्या देखा जाता है',
    covers: [
      'TODO(numerology-covers-1)',
      'TODO(numerology-covers-2)',
      'TODO(numerology-covers-3)',
      'TODO(numerology-covers-4)',
    ],
    youWillNeed: 'पूरा नाम और जन्म की तारीख',
    booking: { calSlug: 'numerology', fee: consultationFee },
  },
  {
    slug: 'vastu',
    name: 'वास्तु',
    icon: 'compass',
    question: 'ऐसे घर या दुकान के लिए, जहाँ कुछ ठीक नहीं लगता',
    summary:
      'घर या दुकान की दिशा, बनावट और चीज़ों की जगह, उन लोगों को ध्यान में रखकर देखी जाती है ' +
      'जो वहाँ सच में रहते और काम करते हैं। ' +
      'यह एक पैकेज है: एक ही फ़ीस, और बिल्डिंग पूरी होने तक साइट विज़िट। पूरी जानकारी के लिए अंजलि जी को WhatsApp पर मैसेज करें।',
    meta: {
      title: 'पलवल में वास्तु सलाहकार: घर और दुकान के लिए',
      description:
        'घर या दुकान के लिए वास्तु: दिशा, बनावट और चीज़ों की जगह, वहाँ रहने और काम करने ' +
        'वालों को ध्यान में रखकर। पलवल में मिलकर या फ़ोन पर, हिंदी या अंग्रेज़ी में।',
    },
    detailLinkLabel: 'इसमें क्या-क्या देखा जाता है',
    covers: [
      'TODO(vastu-covers-1)',
      'TODO(vastu-covers-2)',
      'TODO(vastu-covers-3)',
      'TODO(vastu-covers-4)',
    ],
    youWillNeed: 'जगह का नक्शा या फ़ोटो',
    booking: null,
  },
];

export const servicesSection = {
  heading: 'अंजलि जी तीन तरह से *मदद* करती हैं',
  lead:
    'हर consultation अलग तरह के सवाल के लिए है। समझ नहीं आ रहा कि आपको कौन-सा चाहिए? अंजलि जी को ' +
    'बताएँ कि क्या चल रहा है, वे सही consultation बता देंगी।',
  priceOnRequest: 'फ़ीस WhatsApp पर बताई जाती है',
  /** After the price: "₹2,151, तीन महीने तक कॉल की सुविधा के साथ". */
  feeIncludes: 'तीन महीने तक कॉल की सुविधा के साथ',
  needLabel: 'आपको चाहिए',
  /** What a service needs, as it reads after "आपको चाहिए:", with a पूर्ण विराम. */
  needLine: (value: string) => `${value}।`,
  footnote: 'हर consultation हिंदी या अंग्रेज़ी में, पलवल में मिलकर या फ़ोन पर हो सकता है।',
} as const;

export const bookFirstStepLive = {
  title: 'समय बुक करें, या पहले मैसेज करें',
  body:
    'कुंडली या अंकशास्त्र का consultation ऑनलाइन बुक करके पेमेंट किया जा सकता है। ' +
    'वास्तु के लिए, या अगर आपको पक्का नहीं पता कि कौन-सा चाहिए, तो अंजलि जी को ' +
    'WhatsApp पर मैसेज करें, वे सही वाला बता देंगी।',
} as const;

/** DRAFTED, like the English. Anjali reads and corrects it before it ships. */
export const howItWorks = [
  {
    title: 'WhatsApp पर मैसेज करें, या फ़ॉर्म भेजें',
    body:
      'थोड़े में बताएँ कि मन में क्या है। अंजलि जी बताएँगी कि कुंडली देखना सही रहेगा, ' +
      'या इसके लिए अंकशास्त्र या वास्तु बेहतर है।',
  },
  {
    title: 'ज़रूरी जानकारी भेजें',
    body:
      'कुंडली के लिए: आपकी जन्म की तारीख, समय और स्थान। अंकशास्त्र के लिए: आपका पूरा ' +
      'नाम और जन्म की तारीख। वास्तु के लिए: जगह का नक्शा या फ़ोटो। कुंडली में जन्म का ' +
      'समय ज़्यादातर लोगों की सोच से ज़्यादा मायने रखता है, इसलिए हो सके तो उसे पहले ' +
      'से पक्का कर लें।',
  },
  {
    title: 'आपका consultation',
    body:
      'पलवल में मिलकर या फ़ोन पर, हिंदी या अंग्रेज़ी में, जिसमें भी आप सहज हों। समय की ' +
      'कोई तय सीमा नहीं है।',
  },
  {
    title: 'तीन महीने तक कॉल',
    body:
      'कुंडली या अंकशास्त्र के consultation के बाद, आप तीन महीने तक अपने आगे के सवालों के ' +
      'लिए अंजलि जी को सीधे कॉल कर सकते हैं। अगर वास्तु यंत्र जैसा कोई उपाय मदद करेगा, ' +
      'तो वे पहले ही उसकी कीमत बता देती हैं। उपाय करना हमेशा आपकी मर्ज़ी पर है।',
  },
] as const;

export const serviceDetail = {
  breadcrumbLabel: 'आप कहाँ हैं',
  breadcrumbRoot: 'सेवाएँ',
  howItWorksHeading: 'यह कैसे होता है',
  glanceHeading: 'एक नज़र में',
  glanceLabels: {
    where: 'कहाँ',
    languages: 'भाषा',
    length: 'समय',
    youWillNeed: 'आपको चाहिए',
    fees: 'फ़ीस',
    includes: 'फ़ीस में शामिल',
  },
  glanceWhere: 'पलवल में मिलकर, या फ़ोन पर',
  glanceLength: 'समय की कोई तय सीमा नहीं',
  glanceFees: 'पैकेज; जानकारी WhatsApp पर',
  glanceIncludes: 'तीन महीने तक अंजलि जी को सीधे कॉल',
  ctaLabel: 'इसके बारे में WhatsApp पर पूछें',
  reassurance: 'अंजलि जी खुद जवाब देती हैं। कोई असिस्टेंट नहीं है।',
  otherHeading: 'दूसरे consultation',
} as const;

/**
 * "मुझे कौन-सा consultation चाहिए?" — the three-question picker.
 *
 * DRAFTED, like the English. The weights, ids and order are identical to
 * en/picker.ts (a test checks); only the words differ.
 */

import type { PickerQuestion, ServiceSlug } from '../en/picker';

export const picker = {
  href: '/which-reading',
  linkLabel: 'पक्का नहीं कि कौन-सा? तीन सवालों के जवाब दें',

  pageTitle: 'मुझे कौन-सा consultation चाहिए?',
  pageDescription:
    'पक्का नहीं कि आपको वैदिक ज्योतिष, अंकशास्त्र या वास्तु में से क्या चाहिए? तीन ' +
    'सवालों के जवाब दें, और अंजलि जी के लिए आपका WhatsApp मैसेज अपने-आप लिख दिया जाएगा।',
  pageHeading: 'आपको कौन-सा consultation *चाहिए*?',
  pageLead:
    'तीन सवाल, लगभग तीस सेकंड। कुछ भी भेजा या सेव नहीं किया जाता — जवाब आपके ब्राउज़र में ही रहते हैं और सिर्फ़ आपका मैसेज लिखने के काम आते हैं।',
  backLabel: 'सभी consultation पर वापस',

  eyebrow: 'पक्का नहीं कि कौन-सा?',
  heading: 'तीन सवालों के जवाब दें',
  lead: 'तीस सेकंड लगेंगे, और पता चल जाएगा कि तीनों में से कौन-सा आपके लिए सही है। कुछ भी भेजा या सेव नहीं किया जाता — यह सिर्फ़ आपका मैसेज लिख देता है।',

  questions: [
    {
      id: 'about',
      prompt: 'आपके मन में क्या है?',
      options: [
        {
          label: 'काम, पैसा या कोई फ़ैसला',
          weights: { 'vedic-astrology': 3, numerology: 1 },
          echo: 'काम या कोई फ़ैसला',
        },
        {
          label: 'प्यार, शादी या परिवार',
          weights: { 'vedic-astrology': 3 },
          echo: 'प्यार, शादी या परिवार',
        },
        {
          label: 'घर या दुकान, जहाँ कुछ ठीक नहीं लगता',
          weights: { vastu: 4 },
          echo: 'घर या दुकान, जहाँ कुछ ठीक नहीं लगता',
        },
        {
          label: 'नाम, तारीख या नई शुरुआत',
          weights: { numerology: 4 },
          echo: 'नाम, तारीख या नई शुरुआत',
        },
      ],
    },
    {
      id: 'timing',
      prompt: 'बात समय की है, या किसी चुनाव की?',
      options: [
        {
          label: 'यह कब बदलेगा?',
          weights: { 'vedic-astrology': 3 },
          echo: 'जानना है कि हालात कब बदलेंगे',
        },
        {
          label: 'कौन-सा रास्ता चुनूँ?',
          weights: { 'vedic-astrology': 1, numerology: 2 },
          echo: 'कई रास्तों में से एक चुनना है',
        },
        {
          label: 'यह बार-बार क्यों हो रहा है?',
          weights: { numerology: 2, vastu: 2 },
          echo: 'कुछ बार-बार हो रहा है',
        },
      ],
    },
    {
      id: 'details',
      prompt: 'आपको पहले से क्या पता है?',
      options: [
        {
          label: 'मेरी जन्म की तारीख, समय और स्थान',
          weights: { 'vedic-astrology': 3 },
          echo: 'जन्म की तारीख, समय और स्थान पता है',
        },
        {
          label: 'मेरी जन्म की तारीख, पर समय नहीं',
          weights: { numerology: 3, vastu: 1 },
          echo: 'जन्म की तारीख पता है, पर समय नहीं',
        },
        {
          label: 'जिस जगह की बात है, उसका नक्शा',
          weights: { vastu: 4 },
          echo: 'जगह का नक्शा है',
        },
      ],
    },
  ] as PickerQuestion[],

  resultLabel: 'यहाँ से शुरू करें',

  because: {
    'vedic-astrology':
      'आपके सवाल सही समय और इस दौर के बारे में हैं, और कुंडली के लिए ज़रूरी जन्म की जानकारी आपके पास है।',
    numerology:
      'आपके सवाल नाम, तारीख और बार-बार दोहराई जाने वाली बातों के बारे में हैं, अंक इसी के लिए होते हैं, और इनमें जन्म का समय नहीं चाहिए।',
    vastu:
      'आपके सवाल किसी दौर के बारे में नहीं, एक जगह के बारे में हैं, इसलिए कुंडली से पहले उस जगह को देखना ज़रूरी है।',
  } as Record<ServiceSlug, string>,

  resultNote: 'अगर यह सही नहीं लगता, तो मैसेज में लिख दें। अंजलि जी बता देंगी कि असल में कौन-सा सही है।',

  labels: {
    step: (current: number, total: number) => `सवाल ${current} (${total} में से)`,
    back: 'पीछे',
    restart: 'फिर से शुरू करें',
    cta: 'इस बारे में अंजलि जी को मैसेज करें',
    readMore: 'इसमें क्या-क्या देखा जाता है',
  },

  message: (serviceName: string, echoes: string[]) =>
    `नमस्ते अंजलि जी, वेबसाइट ने मेरे लिए ${serviceName} सुझाया — ` +
    `${echoes.join(', ')}। क्या हम इस बारे में बात कर सकते हैं?`,
} as const;

/** Terms of consultation, and refunds and cancellations. */

/**
 * DRAFTED, translated fact for fact from en/policies.ts: every condition,
 * number, time limit and name is kept. Anjali reads and corrects both.
 */

import { site } from './site';

export const terms = {
  heading: 'Consultation की शर्तें',
  metaDescription:
    'आपकी consultation फ़ीस में क्या शामिल है, बुकिंग और समय बदलना कैसे होता है, और रीडिंग क्या है और क्या नहीं।',
  intro:
    'ये शर्तें तब लागू होती हैं जब आप इस साइट पर consultation बुक करके पेमेंट करते हैं। ' +
    'रिफ़ंड और कैंसिलेशन के लिए अलग पेज है।',
  lastUpdatedLabel: 'आख़िरी अपडेट',
  lastUpdated: 'TODO(terms-last-updated-date)',
  reachHeading: 'इन शर्तों के बारे में सवाल',
  reachLink: 'WhatsApp पर मैसेज करें',
  reachNote: '। इनका जवाब वे खुद देती हैं।',
  sections: [
    {
      heading: 'आपका लेन-देन किससे है',
      body:
        `${site.brand} को पलवल, हरियाणा की ${site.name} चलाती हैं। ` +
        'आपका consultation और आपका पेमेंट उन्हीं के साथ है।',
    },
    {
      heading: 'आपकी फ़ीस में क्या शामिल है',
      body:
        'अंजलि जी के साथ वैदिक ज्योतिष या अंकशास्त्र का एक consultation, पलवल में मिलकर या ' +
        'फ़ोन पर, हिंदी या अंग्रेज़ी में, समय की किसी तय सीमा के बिना। उसके बाद, तीन महीने तक ' +
        'आगे के सवालों के लिए उन्हें सीधे कॉल करने की सुविधा, जो आपके consultation की तारीख ' +
        'से गिनी जाती है।',
    },
    {
      heading: 'बुकिंग और पेमेंट',
      body:
        'आप बुकिंग पेज पर समय चुनते हैं और बुक करते समय पूरी फ़ीस का पेमेंट करते हैं। ' +
        'पेमेंट Razorpay के ज़रिए होता है। पेमेंट होते ही आपकी बुकिंग पक्की हो जाती है, और ' +
        'कन्फ़र्मेशन आपके ईमेल पर भेजा जाता है।',
    },
    {
      heading: 'Consultation से पहले',
      body:
        'कुंडली के लिए, अंजलि जी को अपनी जन्म की तारीख, समय और स्थान भेजें। अंकशास्त्र के ' +
        'लिए, अपना पूरा नाम और जन्म की तारीख। बुकिंग के बाद जो पेज दिखता है, उस पर इन्हें ' +
        'WhatsApp पर भेजने का बटन है।',
    },
    {
      heading: 'समय बदलना',
      body:
        'आप एक बार समय बदल सकते हैं, अपने consultation से कम से कम 24 घंटे पहले, ' +
        'कन्फ़र्मेशन ईमेल में दिए गए लिंक से।',
    },
    {
      heading: 'उपाय',
      body:
        'अगर वास्तु यंत्र जैसा कोई उपाय मदद करेगा, तो अंजलि जी बताती हैं कि वह क्या है और ' +
        'उसकी कीमत क्या है। उपाय करना आपकी मर्ज़ी पर है, और वे consultation फ़ीस में शामिल ' +
        'नहीं हैं।',
    },
    {
      heading: 'वास्तु',
      body:
        'वास्तु consultation एक पैकेज होता है, जो इस साइट पर बुक नहीं होता, बल्कि WhatsApp पर तय होता है: एक ही फ़ीस, और बिल्डिंग पूरी होने तक साइट विज़िट। कुछ भी तय होने से पहले, फ़ीस और उसमें क्या शामिल है, यह अंजलि जी के साथ तय कर लिया जाता है।',
    },
    {
      heading: 'Consultation क्या है',
      body:
        'ज्योतिष, अंकशास्त्र या वास्तु पर आधारित मार्गदर्शन। यह मेडिकल, कानूनी या वित्तीय ' +
        'सलाह नहीं है, और किसी योग्य प्रोफ़ेशनल की सलाह की जगह नहीं लेता।',
    },
  ],
} as const;

export const refundPolicy = {
  heading: 'रिफ़ंड और कैंसिलेशन',
  metaDescription:
    'Consultation कैंसिल नहीं किया जा सकता। रिफ़ंड कब मिलता है, और इसके बजाय समय कैसे बदलें।',
  intro:
    'Consultation कैंसिल नहीं किया जा सकता और फ़ीस वापस नहीं की जाती, सिवाय नीचे दिए ' +
    'गए मामलों के।',
  lastUpdatedLabel: 'आख़िरी अपडेट',
  lastUpdated: 'TODO(refund-policy-last-updated-date)',
  reachHeading: 'रिफ़ंड माँगना',
  reachLink: 'WhatsApp पर मैसेज करें',
  reachNote: ', और वह नाम और ईमेल पता बताएँ जिससे आपने बुकिंग की थी।',
  sections: [
    {
      heading: 'रिफ़ंड कब मिलता है',
      body:
        'आपको पूरा रिफ़ंड मिलता है: अगर अंजलि जी आपका consultation नहीं ले पातीं और कोई ' +
        'नया समय तय नहीं हो पाता, अगर एक ही बुकिंग के लिए आपसे दो बार पैसे कटे, या अगर ' +
        'आपका पेमेंट हो गया लेकिन बुकिंग नहीं बनी। कोई और सच्ची वजह हो, तो अंजलि जी उस पर ' +
        'विचार करती हैं, और फ़ैसला उन्हीं का होता है।',
    },
    {
      heading: 'इसके बजाय समय बदलें',
      body:
        'आप एक बार समय बदल सकते हैं, अपने consultation से कम से कम 24 घंटे पहले, ' +
        'कन्फ़र्मेशन ईमेल में दिए गए लिंक से। छूटे हुए consultation का रिफ़ंड नहीं मिलता।',
    },
    {
      heading: 'तीन महीने की कॉल',
      body:
        'फ़ीस में consultation और तीन महीने की कॉल, दोनों साथ में शामिल हैं, इसलिए ' +
        'consultation हो जाने के बाद इसका कोई भी हिस्सा वापस नहीं किया जाता।',
    },
    {
      heading: 'रिफ़ंड कैसे मिलता है',
      body: 'TODO(refund-timing: how many working days Razorpay takes to return money to the original payment method)',
    },
  ],
} as const;

/** Shared by every notice page (privacy, terms, refunds), after the WhatsApp line. */
export const policyPages = {
  emailPrefix: 'या ईमेल करें: ',
} as const;

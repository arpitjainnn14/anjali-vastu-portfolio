/** The contact section and its form: fields, states and messages. */

import { contact, site } from './site';

export const contactSection = {
  meta: {
    title: 'पलवल में ज्योतिषी अंजलि जैन से संपर्क करें',
    description:
      'अंजलि जी तक सबसे जल्दी WhatsApp से पहुँचा जा सकता है। या अपनी जानकारी छोड़ दें, वे ' +
      'खुद जवाब देंगी, आमतौर पर 24 घंटे के अंदर। हिंदी या अंग्रेज़ी में।',
  },
  heading: 'अंजलि जी को बताएँ, आप क्या *जानना चाहते हैं*',
  lead:
    'WhatsApp पर अंजलि जी से सबसे जल्दी बात होती है। अगर आप लिखना पसंद करें, तो नीचे ' +
    'अपनी जानकारी छोड़ दें, वे खुद जवाब देंगी, आमतौर पर 24 घंटे के अंदर।',
  formTitle: 'लिखना पसंद है? अपनी जानकारी छोड़ें',
  details: [
    { label: 'कहाँ', value: 'पलवल, हरियाणा', link: { label: 'मैप में लोकेशन खोलें', href: site.mapsUrl } },
    { label: 'Consultation', value: 'पलवल में मिलकर, या फ़ोन पर', link: null },
    { label: 'भाषा', value: 'हिंदी और अंग्रेज़ी', link: null },
    { label: 'ईमेल', value: contact.email, link: { label: 'ईमेल लिखें', href: `mailto:${contact.email}` } },
    { label: 'आमतौर पर जवाब', value: '24 घंटे के अंदर', link: null },
  ],
  footnote: 'आपका मैसेज सीधे अंजलि जी तक जाता है। कोई और उसे नहीं पढ़ता।',
  page: {
    answeredBy: {
      heading: 'वे खुद जवाब देती हैं',
      body:
        'हर मैसेज अंजलि जी खुद पढ़ती हैं और खुद जवाब देती हैं। न कोई असिस्टेंट है, न कोई ' +
        'कॉल सेंटर, इसीलिए जवाब आने में कुछ मिनट नहीं, कुछ घंटे लग सकते हैं।',
    },
    stepsHeading: 'लिखने के बाद क्या होता है',
    stepsLead:
      'लिखने का कोई पैसा नहीं लगता, और इससे आप किसी बात के लिए बंधते नहीं। पेमेंट तभी ' +
      'होता है जब consultation बुक हो जाता है।',
  },
  whatsappCta: 'WhatsApp पर मैसेज करें',
  /** The small pinned button on phones. Short, so it covers little of the page. */
  stickyLabel: 'अंजलि जी को WhatsApp',
} as const;

/** Forminit field names follow fi-{blockType}-{name}. Do not rename; only labels are translated. */
export const form = {
  fields: {
    name: { id: 'name', name: 'fi-sender-firstName', label: 'आपका नाम', type: 'text', required: true },
    phone: { id: 'phone', name: 'fi-sender-phone', label: 'फ़ोन या WhatsApp नंबर', type: 'tel', inputMode: 'tel', required: true },
    email: { id: 'email', name: 'fi-sender-email', label: 'ईमेल', type: 'email', inputMode: 'email', required: false },
    service: { id: 'service', name: 'fi-select-service', label: 'विषय', type: 'select', required: false },
    message: { id: 'message', name: 'fi-text-message', label: 'आपका सवाल, एक-दो लाइन में', type: 'textarea', required: true },
    consent: { id: 'consent', name: 'fi-select-consent', type: 'checkbox', required: true },
    honeypot: { id: 'website', name: 'fi-text-website', type: 'text', required: false },
  },
  /** Sent to Anjali as the visitor chose it, so she reads these in Hindi. */
  serviceOptions: [
    'वैदिक ज्योतिष (कुंडली)',
    'अंकशास्त्र',
    'घर या दुकान के लिए वास्तु',
    'अंजलि जी से सीखना',
    'अभी पक्का नहीं',
  ],
  consentLabel: 'अंजलि जी मेरा नाम और संपर्क की जानकारी रख सकती हैं, ताकि वे मुझसे संपर्क कर सकें।',
  consentLinkLabel: 'आपकी जानकारी का उपयोग कैसे होता है',
  honeypotLabel: 'इस खाने को खाली छोड़ें',
  submitLabel: 'अंजलि जी को भेजें',
  submittingLabel: 'भेजा जा रहा है',
  states: {
    success: {
      heading: 'आपका मैसेज अंजलि जी तक पहुँच गया',
      body: 'वे खुद जवाब देंगी, आमतौर पर 24 घंटे के अंदर। अगर जल्दी है, तो WhatsApp ज़्यादा तेज़ है।',
      cta: 'इसके बजाय WhatsApp पर मैसेज करें',
    },
    error: {
      heading: 'मैसेज नहीं गया',
      body:
        'गड़बड़ी हमारी तरफ़ से हुई है, आपकी तरफ़ से नहीं। आपने जो लिखा था, वह सब यहीं है, ' +
        'इसलिए थोड़ी देर में फिर कोशिश करें, या अंजलि जी को WhatsApp पर मैसेज करें।',
    },
    rateLimited: {
      heading: 'एक पल रुकें',
      body: 'पाँच सेकंड रुककर फिर भेजें।',
    },
  },
  validation: {
    nameRequired: 'कृपया अपना नाम लिखें।',
    phoneRequired: 'कृपया वह नंबर लिखें जिस पर अंजलि जी आपसे बात कर सकें।',
    phoneTooShort: 'यह नंबर छोटा लग रहा है। मोबाइल नंबर 10 अंकों का होता है।',
    emailInvalid: 'यह ईमेल पता सही नहीं लग रहा।',
    messageRequired: 'अपने सवाल के बारे में एक लाइन लिखें, ताकि वे ठीक से जवाब दे सकें।',
    consentRequired: 'कृपया इस पर टिक करें, ताकि वे आपसे संपर्क कर सकें।',
  },
} as const;

/**
 * Client testimonials. The quotes, titles and names are the clients' own
 * words, kept exactly as they were given (English stays English, Hindi stays
 * Hindi); only the labels around them (service, section chrome) are
 * translated. The comments below are copied from en/testimonials.ts.
 */

import type { Testimonial } from '../en/testimonials';

export const testimonials: Testimonial[] = [
  {
    /*
     * Received from the client, verbatim. Do not edit her words.
     *
     * Longer than the 40-55 words the rail card was drawn for (~90), and the
     * card is sized to fit it rather than the other way round. Paragraph
     * breaks are "\n\n" and render as separate paragraphs.
     */
    quote:
      'I have had a wonderful experience with Dr. Anjali jain. Her readings and charts ' +
      'have been remarkably accurate in many instances, and I have found her insights ' +
      'to be meaningful.\n\n' +
      'What I especially appreciate is her calm and composed approach. She is patient, ' +
      'gives you ample time to explain your concerns, and listens without rushing ' +
      'through the consultation. Her way of explaining things is clear, and easy to ' +
      'understand.\n\n' +
      'Overall, I would happily recommend her to anyone looking for a sincere and ' +
      'learned astrologer.',
    name: 'Ginni Sharma',
    city: 'जम्मू और कश्मीर',
    service: 'वैदिक ज्योतिष',
  },
  {
    /*
     * Received from the client, verbatim, including the closing emoji.
     */
    title: 'A Truly Gifted Astrologer & A Wonderful Human Being',
    quote: [
      'My experience with Anjali Jain has been truly exceptional. Her astrological guidance is not only remarkably accurate, but also presented with a rare combination of wisdom, clarity and compassion.',
      'What makes Anjali Ji stand apart is that she doesn’t simply make predictions — she understands, guides and genuinely cares. Her observations have often been amazingly precise, and her guidance has helped bring clarity and confidence during situations when I needed it most.',
      'Beyond her knowledge of astrology, what I appreciate most is her humble and approachable nature. She is always willing to listen patiently, explain things in a simple and practical manner, and extend her support whenever needed. Her availability and willingness to help, even at unexpected hours, speaks volumes about the person she is.',
      'Anjali Ji has a beautiful ability to combine astrological insight with human understanding, making every consultation feel personal and meaningful.',
      'Thank you, Anjali Ji, for being not just an astrologer, but a trusted guide and a reassuring presence. 🌟',
    ].join('\n\n'),
    name: 'Vipul Parnami',
    city: 'फ़रीदाबाद',
    service: 'वैदिक ज्योतिष',
  },
  {
    /*
     * Received from the client in Hindi, verbatim. The only change: WhatsApp
     * bold markers (*...* and **...**) are removed, since they are formatting
     * from the message, not words. The sign-off line stays as the last
     * paragraph; the name is the attribution.
     *
     * Service is taken from the text itself: "ज्योतिष और वास्तु".
     */
    title: 'अंजलि जी के साथ हमारे परिवार का अनुभव',
    quote: [
      'हमारा परिवार पिछले लगभग 3–4 वर्षों से पलवल, हरियाणा की अंजलि जैन जी के संपर्क में है। शुरुआत में हमने उनसे ज्योतिष और वास्तु के लिए सलाह लेना शुरू किया था, लेकिन समय के साथ यह रिश्ता केवल सलाह लेने तक सीमित नहीं रहा। धीरे-धीरे उनके साथ एक विश्वास और अपनापन बनता चला गया।',
      'परिवार जैसे-जैसे आगे बढ़ता है, जीवन में नई परिस्थितियाँ और नई चुनौतियाँ भी आती रहती हैं। ऐसे समय में जब भी हमें किसी बात को लेकर असमंजस रहा या किसी विषय पर एक अलग दृष्टिकोण की आवश्यकता महसूस हुई, हमने अंजलि जी से बात की। वह हमारी बात बहुत धैर्य से सुनती हैं, परिस्थिति को समझती हैं और फिर बहुत सहज तरीके से अपना मार्गदर्शन देती हैं।',
      'कभी उनका सुझाव वास्तु से जुड़ा होता है, कभी कोई पूजा या आध्यात्मिक उपाय होता है और कभी-कभी केवल उनसे हुई बातचीत ही मन को काफी शांति और सकारात्मकता देती है। हमें उनकी यही बात सबसे अच्छी लगती है कि वे हर बात को बहुत सरल और सहज तरीके से समझाती हैं और हमें कभी ऐसा महसूस नहीं होता कि हम केवल एक client हैं।',
      'हमारा बेटा आज USA में रहता है और परिवार से काफी दूर है। वह भी पिछले कुछ समय से अंजलि जी के संपर्क में है और समय-समय पर उनसे अपनी बातें साझा करता है तथा उनका मार्गदर्शन लेता है। एक माता-पिता के रूप में हमें यह अच्छा लगता है कि इतनी दूर रहते हुए भी उसे कोई ऐसा व्यक्ति मिला है, जिस पर वह विश्वास करता है और जिससे वह अपनी बात खुलकर कर सकता है।',
      'इन वर्षों में अंजलि जी हमारे लिए केवल एक ज्योतिषी या वास्तु सलाहकार नहीं रह गई हैं। वह हमारे परिवार की एक शुभचिंतक, मार्गदर्शक और trusted person बन गई हैं। हम यह दावा नहीं करेंगे कि उनके हर सुझाव का परिणाम हम हमेशा किसी निश्चित रूप में माप सकते हैं, लेकिन इतना जरूर कह सकते हैं कि उनकी सलाह ने कई मौकों पर हमें सकारात्मक सोच, मानसिक शांति और आगे बढ़ने की दिशा दी है।',
      'हम पूरे मन से उनके नए वेबसाइट के लिए शुभकामनाएँ देते हैं। हमारी इच्छा है कि जिस तरह पिछले कुछ वर्षों में उन्होंने हमारे परिवार को अपनेपन और सकारात्मकता के साथ मार्गदर्शन दिया है, उसी तरह वह आने वाले वर्षों में बहुत से और परिवारों के जीवन में अपना मार्गदर्शन और सकारात्मक सहयोग देती रहें।',
      'स्नेह एवं शुभकामनाओं सहित,',
    ].join('\n\n'),
    name: 'नितिन एवं परिवार',
    city: 'दिल्ली',
    service: 'वैदिक ज्योतिष और वास्तु',
    lang: 'hi',
  },
  {
    /*
     * Received from the client, verbatim. The opening line ("Highly
     * Recommended – Dr. Anjali Jain") is kept as her title; the sign-off
     * ("Thanks and regards") stays as the quote's last paragraph, same as
     * the Hindi testimonial above.
     */
    title: 'Highly Recommended – Dr. Anjali Jain',
    quote: [
      'I have had the pleasure of working with Dr. Anjali Jain, Vastu Consultant & Astrologer, on several prestigious projects, and my experience has been truly wonderful.',
      'Her in-depth knowledge of Vastu and astrology, combined with her practical approach and professional understanding, has added tremendous value to our projects. She is extremely dedicated, insightful, and meticulous in her work, and her guidance has always been thoughtful and effective.',
      'What I particularly appreciate is her ability to understand the requirements of a project and provide solutions that are both Vastu-compliant and practical.',
      'I highly recommend Dr. Anjali Jain to anyone looking for professional Vastu consultation and astrological guidance. It has always been a pleasure collaborating with her.',
      'Thanks and regards',
    ].join('\n\n'),
    name: 'Ar Bhanupriya, Edge Homes architects and constructions',
    city: 'फ़रीदाबाद',
    service: 'वास्तु consultation',
  },
  {
    /*
     * Received from the client, verbatim: a written testimonial followed by a
     * WhatsApp sign-off line in Hinglish (Latin script, not Devanagari, so
     * lang stays 'en').
     */
    quote: [
      'I feel truly grateful that I had the opportunity to meet Anjali Ma’am. After being led in so many different directions, meeting her brought a sense of clarity and reassurance.',
      'What I deeply appreciate is the way she inspires positivity without creating fear—offering genuine, practical, and doable solutions with so much warmth and understanding. There is always a comforting sense of openness in approaching her, which makes the entire experience even more reassuring.',
      'I am truly grateful to her for her guidance, positivity, and kindness.\nGratitude, always. 🙏💓',
      'Aapney sachi mein bahut sambhala hai 🙏🏼❤️ Dil se Gratitude 💓🙏🏼',
    ].join('\n\n'),
    name: 'Sonali Narula',
    city: 'फ़रीदाबाद',
    service: 'वैदिक ज्योतिष',
  },
];

export const testimonialsSection = {
  meta: {
    title: 'ज्योतिषी अंजलि जैन के क्लाइंट के अनुभव',
    description:
      'फ़रीदाबाद, पलवल, दिल्ली और दूसरी जगहों के क्लाइंट अंजलि जैन के consultation के बाद ' +
      'क्या कहते हैं: वैदिक ज्योतिष, अंकशास्त्र और वास्तु।',
  },
  heading: 'क्लाइंट consultation के *बाद* क्या कहते हैं',
  swipeHint: 'स्वाइप करें',
  /** Opens the full testimonial in a dialog. */
  readMore: 'पूरा पढ़ें',
  close: 'बंद करें',
  /** The rail moves on its own, so it must be stoppable (WCAG 2.2.2). */
  pause: 'अनुभवों को रोकें',
  play: 'अनुभवों को फिर चलाएँ',
} as const;

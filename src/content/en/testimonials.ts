/** Client testimonials, verbatim. */

export type Testimonial = {
  /** Paragraphs separated by a blank line ("\n\n"). */
  quote: string;
  name: string;
  city: string;
  service: string;
  /** A headline the client wrote themselves, shown above the quote. */
  title?: string;
  /**
   * The language the client wrote in. Hindi quotes are set in Noto Sans
   * Devanagari — Marcellus has no Devanagari glyphs. Defaults to 'en'.
   */
  lang?: 'en' | 'hi';
};

/**
 * Requested from her clients, not yet received.
 * Minimum four, or the rail falls back to a static three-up grid — a one-card
 * rail reads as broken rather than sparse.
 *
 * What to ask for: what they came with, what Anjali told them, and what actually
 * happened afterwards. The third part is the only one that persuades a stranger,
 * and it is the part nobody volunteers. 40–55 words.
 */
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
    city: 'TODO(city-1)',
    service: 'Vedic astrology',
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
    city: 'TODO(city-2)',
    service: 'Vedic astrology',
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
    city: 'TODO(city-3)',
    service: 'Vedic astrology and Vastu',
    lang: 'hi',
  },
  { quote: 'TODO(testimonial-4)', name: 'TODO(name-4)', city: 'TODO(city-4)', service: 'Learning with Anjali' },
  { quote: 'TODO(testimonial-5)', name: 'TODO(name-5)', city: 'TODO(city-5)', service: 'Vedic astrology' },
];

export const testimonialsSection = {
  heading: 'What clients say *after* a consultation',
  swipeHint: 'Swipe',
  /** Opens the full testimonial in a dialog. */
  readMore: 'Read more',
  close: 'Close',
  /** The rail moves on its own, so it must be stoppable (WCAG 2.2.2). */
  pause: 'Pause testimonials',
  play: 'Play testimonials',
} as const;

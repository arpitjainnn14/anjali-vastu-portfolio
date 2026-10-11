/** ब्लॉग: सूची और लेख के पन्नों का पाठ। लेख स्वयं Sitedesk से आते हैं। */

/** DRAFTED, like the English. Anjali reads and corrects it before the Hindi site goes live. */
export const blog = {
  meta: {
    title: 'अंजलि के नोट्स',
    description: 'पलवल की अंजलि जैन से ज्योतिष, अंक शास्त्र और वास्तु पर छोटे नोट्स।',
  },
  heading: 'अंजलि के *नोट्स*',
  intro: 'ज्योतिष, अंक शास्त्र और वास्तु पर छोटे लेख।',
  empty: 'अभी यहाँ कुछ नहीं है। उनका पहला नोट जल्द ही यहाँ आएगा।',
  unavailable: 'अभी नोट्स लोड नहीं हो पा रहे हैं। कृपया कुछ मिनट बाद फिर कोशिश करें।',
  postUnavailable: 'अभी यह नोट लोड नहीं हो पा रहा है। कृपया कुछ मिनट बाद फिर कोशिश करें।',
  readMore: 'नोट पढ़ें',
  backToList: 'सभी नोट्स',
  dateLine: (date: string, category: string) => (category ? `${date} · ${category}` : date),
  publishedLine: (date: string, category: string) => `${date} को प्रकाशित${category ? ` · ${category}` : ''}`,
  otherLanguage: 'Read in English',
};

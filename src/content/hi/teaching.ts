/** Teaching: the course, the tracks, the next batch. */

export const teaching = {
  meta: {
    title: 'ऑनलाइन सीखें: ज्योतिष, अंकशास्त्र और वास्तु',
    description:
      'अंजलि जैन के साथ वैदिक ज्योतिष, अंकशास्त्र और वास्तु के तीन महीने के कोर्स। ' +
      'वीडियो कॉल पर लाइव क्लास, चार या पाँच स्टूडेंट के छोटे ग्रुप में।',
  },
  heading: 'कुंडली *खुद* पढ़ना सीखें',
  lead:
    'अंजलि जी वे तीनों विषय सिखाती हैं जिनकी वे प्रैक्टिस करती हैं: वैदिक ज्योतिष, ' +
    'अंकशास्त्र और वास्तु। क्लास वीडियो कॉल पर छोटे ग्रुप में लाइव होती हैं, ताकि आप ' +
    'कहीं से भी जुड़ सकें और फिर भी आप पर पूरा ध्यान दिया जाए।',
  nextBatchLabel: 'अगला बैच',
  specHeading: 'कोर्स एक नज़र में',
  spec: [
    { label: 'अवधि', value: '3 महीने' },
    { label: 'तरीका', value: 'लाइव, वीडियो कॉल पर' },
    { label: 'ग्रुप', value: 'चार या पाँच स्टूडेंट' },
    { label: 'समय-सारणी', value: 'TODO(sessions-per-week-and-length)' },
    { label: 'भाषा', value: 'हिंदी और अंग्रेज़ी' },
    { label: 'फ़ीस', value: 'WhatsApp पर बताई जाती है' },
  ],
  nextBatch: 'TODO(next-batch-month)',
  cta: { label: 'अगले बैच के बारे में पूछें' },
  tracks: [
    { slug: 'vedic-astrology', name: 'वैदिक ज्योतिष', icon: 'sun' as const,
      covers: 'TODO(teaching-vedic-covers)', prerequisite: 'TODO(teaching-vedic-prereq)' },
    { slug: 'numerology', name: 'अंकशास्त्र', icon: 'grid' as const,
      covers: 'TODO(teaching-numerology-covers)', prerequisite: 'TODO(teaching-numerology-prereq)' },
    { slug: 'vastu', name: 'वास्तु', icon: 'compass' as const,
      covers: 'TODO(teaching-vastu-covers)', prerequisite: 'TODO(teaching-vastu-prereq)' },
  ],
  structureNote: 'TODO(confirm: three months per subject taken in sequence, or all three in one course?)',
} as const;

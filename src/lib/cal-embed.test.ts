import { describe, expect, it } from 'vitest';
import { calEmbedSnippet } from './cal-embed';

const base = {
  scriptUrl: 'https://app.cal.id/embed/embed.js',
  origin: 'https://cal.id',
  namespace: 'numerology',
  calLink: 'anjali-jain13/numerology',
  elementId: 'cal-inline-numerology',
};

describe('calEmbedSnippet', () => {
  it('loads the embed script and starts an inline calendar for the event', () => {
    const js = calEmbedSnippet(base);
    expect(js).toContain('"https://app.cal.id/embed/embed.js"');
    expect(js).toContain('Cal("init", "numerology", { origin: "https://cal.id" })');
    expect(js).toContain('Cal.ns["numerology"]("inline"');
    expect(js).toContain('elementOrSelector: "#cal-inline-numerology"');
    expect(js).toContain('calLink: "anjali-jain13/numerology"');
  });

  it('cannot be broken out of by a value containing quotes or a closing script tag', () => {
    const js = calEmbedSnippet({ ...base, calLink: 'x"); alert(1); ("</script><script>' });
    expect(js).not.toContain('</script>');
    expect(js).toContain('calLink: "x\\"); alert(1); (\\"\\u003c/script>\\u003cscript>"');
  });
});

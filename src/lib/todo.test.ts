import { describe, expect, it } from 'vitest';
import { visibleSections } from './todo';

describe('visibleSections', () => {
  it('keeps a section with real copy as it is', () => {
    const s = [{ heading: 'Why', body: 'So she can reply.' }];
    expect(visibleSections(s)).toEqual(s);
  });

  it('drops a section whose whole body is a TODO', () => {
    expect(visibleSections([{ heading: 'Kept for', body: 'TODO(retention-period)' }])).toEqual([]);
  });

  it('strips a TODO inside a paragraph but keeps the paragraph', () => {
    const [section] = visibleSections([
      { heading: 'Who', body: 'Anjali. Forminit stores it. TODO(forminit-link)' },
    ]);
    expect(section.body).toBe('Anjali. Forminit stores it.');
  });

  it('strips a TODO followed by a full stop', () => {
    const [section] = visibleSections([{ heading: 'Ask', body: 'Write to her. TODO(email). Soon.' }]);
    expect(section.body).toBe('Write to her. Soon.');
  });

  it('drops a section left empty after stripping', () => {
    expect(visibleSections([{ heading: 'X', body: '  TODO(a) TODO(b)' }])).toEqual([]);
  });
});

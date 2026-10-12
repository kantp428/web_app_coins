import { describe, expect, it } from 'vitest';
import { questMonths } from './main-quest.js';

describe('Main Quest calendar', () => {
  it('uses Bangkok month boundaries and returns twelve months across the year boundary', () => {
    expect(questMonths(new Date('2026-12-31T16:59:59.999Z'))[0]).toBe(
      '2026-12',
    );
    const months = questMonths(new Date('2026-12-31T17:00:00Z'));
    expect(months).toHaveLength(12);
    expect(months[0]).toBe('2027-01');
    expect(months[11]).toBe('2026-02');
  });
});

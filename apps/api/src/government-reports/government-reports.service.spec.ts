import { describe, expect, it } from 'vitest';
import {
  parseReportRange,
  usagePercent,
} from './government-reports.service.js';

describe('government reporting validation', () => {
  it('defaults to the current Bangkok year-to-date', () => {
    const range = parseReportRange({}, new Date('2026-10-30T00:00:00.000Z'));
    expect(range.from).toBe('2026-01-01');
    expect(range.to).toBe('2026-10-30');
    expect(range.start.toISOString()).toBe('2025-12-31T17:00:00.000Z');
    expect(range.end.toISOString()).toBe('2026-10-30T17:00:00.000Z');
  });

  it('accepts inclusive valid dates and rejects unsafe ranges', () => {
    expect(
      parseReportRange({ from: '2026-02-01', to: '2026-02-28' }),
    ).toMatchObject({
      from: '2026-02-01',
      to: '2026-02-28',
    });
    expect(() =>
      parseReportRange({ from: '2026-02-30', to: '2026-03-01' }),
    ).toThrow();
    expect(() =>
      parseReportRange({ from: '2026-03-02', to: '2026-03-01' }),
    ).toThrow();
    expect(() => parseReportRange({ from: '2026-01-01' })).toThrow();
    expect(() =>
      parseReportRange({ from: '2020-01-01', to: '2026-01-01' }),
    ).toThrow();
    expect(() => parseReportRange({ area: 'BKK' })).toThrow();
  });

  it('calculates utilization without hiding overspend', () => {
    expect(usagePercent('0.00', '0.00')).toBe(0);
    expect(usagePercent('84.10', '100.00')).toBe(84.1);
    expect(usagePercent('120.00', '100.00')).toBe(120);
  });
});

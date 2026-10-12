import { describe, it, expect } from 'vitest';
import { nearbyScope } from './stores.service.js';
describe('nearby scope', () => {
  it('requires coordinates and defaults to5km', () => {
    expect(nearbyScope({ latitude: '13.75', longitude: '100.5' })).toEqual({
      latitude: 13.75,
      longitude: 100.5,
      radiusKm: 5,
    });
  });
  it('rejects invalid/missing/array values, radius and obsolete area filter', () => {
    for (const query of [
      { latitude: '91', longitude: '100' },
      { latitude: '0', longitude: '181' },
      { latitude: '', longitude: '0' },
      { latitude: ['0'], longitude: '0' },
      { latitude: 'NaN', longitude: '0' },
      { latitude: '0', longitude: '0', radiusKm: '0' },
      { latitude: '0', longitude: '0', radiusKm: '51' },
      { latitude: '0', longitude: '0', areaCode: 'BKK' },
    ])
      expect(() => nearbyScope(query)).toThrow();
  });
  it('supports zero coordinates and bounded radius', () => {
    expect(
      nearbyScope({ latitude: '0', longitude: '0', radiusKm: '0.1' }).radiusKm,
    ).toBe(0.1);
  });
});

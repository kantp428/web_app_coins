import { describe, it, expect } from 'vitest';
import {
  parsePagination,
  parseShopIds,
  parseStoreScope,
} from './stores.service.js';
describe('nearby scope', () => {
  it('requires coordinates and defaults to5km', () => {
    expect(parseStoreScope({ latitude: '13.75', longitude: '100.5' })).toEqual({
      latitude: 13.75,
      longitude: 100.5,
      radiusKm: 5,
      categoryIds: [],
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
    ])
      expect(() => parseStoreScope(query)).toThrow();
  });
  it('supports zero coordinates and bounded radius', () => {
    expect(
      parseStoreScope({ latitude: '0', longitude: '0', radiusKm: '0.1' })
        .radiusKm,
    ).toBe(0.1);
  });
  it('validates categories, pagination and batch IDs', () => {
    expect(
      parseStoreScope({ latitude: 0, longitude: 0, categoryIds: '1,2' })
        .categoryIds,
    ).toEqual(['1', '2']);
    expect(parsePagination({ page: '2', pageSize: '100' })).toEqual({
      page: 2,
      pageSize: 100,
    });
    expect(parseShopIds(['2', '1'])).toEqual(['2', '1']);
    expect(() =>
      parseStoreScope({ latitude: 0, longitude: 0, categoryIds: '1,1' }),
    ).toThrow();
    expect(() => parsePagination({ pageSize: '101' })).toThrow();
    expect(() => parseShopIds(['1', '1'])).toThrow();
  });
});

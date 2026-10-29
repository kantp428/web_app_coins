import { describe, it, expect, vi } from 'vitest';
import { StoresController } from './stores.controller.js';
import {
  parsePagination,
  parseShopIds,
  parseStoreScope,
  StoresService,
} from './stores.service.js';
describe('nearby scope', () => {
  it('hydrates rates for the authenticated customer and rejects actor overrides', async () => {
    const hydrate = vi.fn().mockResolvedValue([]);
    const stores = {
      requireCustomer: vi
        .fn()
        .mockResolvedValue({ id: '99', role: 'CUSTOMER' }),
      hydrate,
    } as unknown as StoresService;
    const controller = new StoresController(stores);
    const body = { latitude: 13.75, longitude: 100.5, shopIds: ['1'] };
    await controller.batch(body, 'Bearer fixture');
    expect(hydrate).toHaveBeenCalledWith(
      { latitude: 13.75, longitude: 100.5, radiusKm: 5, categoryIds: [] },
      ['1'],
      '99',
    );
    await expect(
      controller.batch({ ...body, customerId: '42' }, 'Bearer fixture'),
    ).rejects.toThrow();
    expect(hydrate).toHaveBeenCalledTimes(1);
  });
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
    expect(() => parseShopIds(['9223372036854775808'])).toThrow();
  });
});

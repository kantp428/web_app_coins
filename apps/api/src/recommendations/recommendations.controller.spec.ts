import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service.js';
import { StoresService } from '../stores/stores.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  categories: vi.fn(),
  count: vi.fn(),
}));
vi.mock('@prisma/client', async (original) => {
  const actual = await original<typeof import('@prisma/client')>();
  return {
    ...actual,
    PrismaClient: class {
      categories = { findMany: mocks.categories, count: mocks.count };
      $queryRaw = mocks.query;
      $disconnect = vi.fn();
    },
  };
});
import {
  categoryFilter,
  recommendationShopIds,
  RecommendationsService,
} from './recommendations.controller.js';

describe('recommendation filtering contract', () => {
  const scope = { latitude: 13.75, longitude: 100.5, radiusKm: 5 };
  const me = vi.fn();
  let service: RecommendationsService;
  beforeEach(() => {
    vi.clearAllMocks();
    me.mockResolvedValue({ id: '42', role: 'CUSTOMER', displayName: 'Test' });
    mocks.count.mockResolvedValue(2);
    mocks.query.mockResolvedValue([]);
    mocks.categories.mockResolvedValue([
      { category_id: 1n, name: 'Food', slug: 'food' },
    ]);
    service = new RecommendationsService(
      new ConfigService({ DATABASE_URL: 'postgres://unused' }),
      { me } as unknown as AuthService,
      new StoresService({} as PrismaService, {} as AuthService),
    );
  });
  it('requires bounded unique positive bigint category IDs and forbids actor injection', () => {
    for (const body of [
      null,
      [],
      {},
      { categoryIds: [] },
      { categoryIds: ['1', '1'] },
      { categoryIds: [1] },
      { categoryIds: ['0'] },
      { categoryIds: ['01'] },
      { categoryIds: ['9223372036854775808'] },
      { categoryIds: ['1'], userId: '43' },
      { categoryIds: Array.from({ length: 11 }, (_, i) => String(i + 1)) },
    ])
      expect(() => categoryFilter(body)).toThrow();
    expect(
      categoryFilter({ categoryIds: ['1', '9223372036854775807'] }),
    ).toEqual(['1', '9223372036854775807']);
  });
  it('authenticates before querying personal history or candidates', async () => {
    me.mockRejectedValue(new UnauthorizedException());
    await expect(service.context()).rejects.toThrow(UnauthorizedException);
    await expect(
      service.candidates({ categoryIds: ['1', '2'] }),
    ).rejects.toThrow(UnauthorizedException);
    expect(mocks.query).not.toHaveBeenCalled();
    expect(mocks.categories).not.toHaveBeenCalled();
    expect(mocks.count).not.toHaveBeenCalled();
  });
  it.each(['SELLER', 'GOVERNMENT'])(
    'forbids %s from reading customer data',
    async (role) => {
      me.mockResolvedValue({ id: '42', role, displayName: 'Test' });
      await expect(service.context('Bearer actor')).rejects.toMatchObject({
        status: 403,
      });
      await expect(
        service.candidates({ categoryIds: ['1', '2'] }, 'Bearer actor'),
      ).rejects.toMatchObject({ status: 403 });
      expect(mocks.query).not.toHaveBeenCalled();
    },
  );
  it('returns only the authenticated actor history summary; no payment amounts', async () => {
    mocks.query.mockResolvedValue([
      {
        shop_id: 7n,
        purchase_count: 2n,
        last_purchased_at: new Date('2026-09-01T00:00:00Z'),
        category_ids: [1n],
      },
    ]);
    const result = await service.context('Bearer actor');
    expect(me).toHaveBeenCalledWith('Bearer actor');
    expect(result.purchaseHistory).toEqual([
      {
        storeId: '7',
        purchaseCount: '2',
        lastPurchasedAt: '2026-09-01T00:00:00.000Z',
        categoryIds: ['1'],
      },
    ]);
    expect(result.categories[0].id).toBe('1');
    const [strings, ...values] = mocks.query.mock.calls[0];
    expect(strings.join('?')).toContain('LIMIT 20');
    expect(values).toEqual([42n]);
  });
  it('rejects unknown category before candidate query', async () => {
    mocks.count.mockResolvedValue(1);
    await expect(
      service.candidates({ ...scope, categoryIds: ['1', '2'] }, 'Bearer actor'),
    ).rejects.toMatchObject({ status: 400 });
    expect(mocks.query).not.toHaveBeenCalled();
  });
  it('keeps authenticated scope, OR categories, approved shops, all-time visits and 3+2 quotas in parameterized SQL', async () => {
    mocks.query.mockResolvedValue([
      { shop_id: 3n, visited: false, coins: 10 },
      { shop_id: 7n, visited: true, coins: null },
    ]);
    expect(
      await service.candidates(
        { ...scope, categoryIds: ['1', '2'] },
        'Bearer actor',
      ),
    ).toEqual({
      stores: [
        { id: '3', visited: false, coins: 10 },
        { id: '7', visited: true, coins: null },
      ],
    });
    const [strings, ...values] = mocks.query.mock.calls[0];
    const scoped = values[0];
    const sql = strings.join('?');
    expect(values[1]).toBe(42n);
    expect(scoped.sql).toContain("participation_status='APPROVED'");
    expect(scoped.sql).toContain('filter_sc.category_id IN (?,?)');
    expect(scoped.sql).toContain('distance_km<=?');
    expect(scoped.values).toEqual([13.75, 13.75, 100.5, 1n, 2n, 5]);
    expect(scoped.sql).not.toContain('LIMIT');
    expect(sql).toContain("p.status IN ('SUCCEEDED', 'REFUNDED')");
    expect(sql).toContain('PARTITION BY visited');
    expect(sql).toContain('CASE WHEN visited THEN 2 ELSE 3 END');
    expect(sql).toContain('ORDER BY coins DESC NULLS LAST, shop_id');
    expect(sql).toContain('starts_at <=');
    expect(sql).toContain('ends_at >');
    expect(sql).not.toContain('LIMIT 20');
    expect(sql).not.toContain('total_amount');
  });

  it('rejects missing/invalid coordinates, radius and malformed shop IDs before SQL', async () => {
    for (const body of [
      { categoryIds: ['1', '2'] },
      { ...scope, latitude: 91, categoryIds: ['1', '2'] },
      { ...scope, longitude: null, categoryIds: ['1', '2'] },
      { ...scope, radiusKm: 0, categoryIds: ['1', '2'] },
      { ...scope, radiusKm: 51, categoryIds: ['1', '2'] },
      { ...scope, categoryIds: ['1', '2'], shopIds: ['1', '1'] },
    ])
      await expect(service.candidates(body)).rejects.toMatchObject({
        status: 400,
      });
    expect(mocks.query).not.toHaveBeenCalled();
  });

  it('defaults to 5km and keeps zero coordinates and the shared scope SQL', async () => {
    await service.candidates({
      latitude: 0,
      longitude: 0,
      categoryIds: ['1', '2'],
    });
    const scoped = mocks.query.mock.calls[0][1];
    expect(scoped.values).toEqual([0, 0, 0, 1n, 2n, 5]);
  });

  it('accepts only a bounded unique canonical shop narrowing list', () => {
    expect(recommendationShopIds(undefined)).toBeUndefined();
    expect(recommendationShopIds([])).toEqual([]);
    expect(recommendationShopIds(['1', '9223372036854775807'])).toEqual([
      1n,
      9223372036854775807n,
    ]);
    for (const value of [
      null,
      '1',
      [1],
      ['0'],
      ['01'],
      ['1', '1'],
      ['9223372036854775808'],
      Array.from({ length: 201 }, (_, i) => String(i + 1)),
    ])
      expect(() => recommendationShopIds(value)).toThrow();
  });

  it('narrows shared scope before visit/rate/quota ranking without trusting supplied IDs', async () => {
    await service.candidates({
      ...scope,
      categoryIds: ['1', '2'],
      shopIds: ['7', '9'],
    });
    const [strings, ...values] = mocks.query.mock.calls[0];
    expect(strings.join('?')).toContain('FROM scoped_stores s ?');
    expect(values[2].sql).toBe('WHERE s.shop_id IN (?,?)');
    expect(values[2].values).toEqual([7n, 9n]);
    expect(values[0].sql).toContain('distance_km<=?');
  });

  it('keeps an empty narrowing list empty rather than falling back to category matches', async () => {
    await expect(
      service.candidates({ ...scope, categoryIds: ['1', '2'], shopIds: [] }),
    ).resolves.toEqual({ stores: [] });
    expect(mocks.query).not.toHaveBeenCalled();
  });
});

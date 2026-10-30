import { describe, it, expect, vi } from 'vitest';
import { Prisma } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  SellerStoresService,
  sellerLocationInput,
  sellerShopId,
} from './seller-stores.service.js';

const address = {
  line1: 'Fixture road',
  province: '',
  district: '',
  subDistrict: '',
  postcode: '',
};
function fixture() {
  const row = {
    shop_id: 1n,
    name: 'Fixture',
    latitude: new Prisma.Decimal('13.75'),
    longitude: new Prisma.Decimal('100.5'),
    address,
    participation_status: 'APPROVED',
  };
  const shops = {
    findMany: vi.fn().mockResolvedValue([row]),
    updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    findFirst: vi.fn().mockResolvedValue(row),
  };
  const tx = { shops };
  const db = {
    shops,
    $transaction: vi.fn(async (fn: (value: typeof tx) => Promise<unknown>) =>
      fn(tx),
    ),
  };
  const auth = {
    me: vi
      .fn()
      .mockResolvedValue({ id: '99', role: 'SELLER', displayName: 'Fixture' }),
  };
  return {
    service: new SellerStoresService(
      db as unknown as PrismaService,
      auth as unknown as AuthService,
    ),
    db,
    shops,
    auth,
  };
}
describe('seller store location', () => {
  it('validates coordinates, zero/bounds and canonical IDs', () => {
    expect(
      sellerLocationInput({
        latitude: 0,
        longitude: '180',
      }).longitude.toString(),
    ).toBe('180');
    expect(
      sellerLocationInput({
        latitude: '-90',
        longitude: -180,
      }).latitude.toString(),
    ).toBe('-90');
    expect(sellerShopId('9223372036854775807')).toBe(9223372036854775807n);
    for (const id of ['0', '1.5', '9223372036854775808', '1/2'])
      expect(() => sellerShopId(id)).toThrow();
    for (const body of [
      { latitude: 91, longitude: 0 },
      { latitude: 0, longitude: -181 },
      { latitude: '', longitude: 0 },
      { latitude: true, longitude: 0 },
      { latitude: 'NaN', longitude: 0 },
      { latitude: 1 },
      { latitude: 1, longitude: 2, ownerId: '42' },
      { latitude: 1, longitude: 2, participation_status: 'APPROVED' },
      { latitude: 1, longitude: 2, address: { line1: 'partial' } },
      { latitude: 1, longitude: 2, address: { ...address, postcode: '123' } },
    ])
      expect(() => sellerLocationInput(body)).toThrow();
  });
  it('lists only authenticated seller shops and serializes location', async () => {
    const { service, shops } = fixture();
    const result = await service.list({}, 'Bearer fixture');
    expect(shops.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { owner_id: 99n } }),
    );
    expect(result.stores[0]).toMatchObject({
      id: '1',
      latitude: '13.750000',
      longitude: '100.500000',
      participationStatus: 'APPROVED',
      address,
    });
    await expect(service.list({ owner_id: '42' })).rejects.toThrow();
  });
  it('rejects missing auth and wrong roles before reading or writing', async () => {
    const { service, auth, shops } = fixture();
    auth.me.mockRejectedValueOnce(new UnauthorizedException());
    await expect(service.list({})).rejects.toThrow();
    for (const role of ['CUSTOMER', 'GOVERNMENT']) {
      auth.me.mockResolvedValue({ id: '99', role, displayName: 'Fixture' });
      await expect(
        service.updateLocation('1', { latitude: 1, longitude: 2 }),
      ).rejects.toThrow();
    }
    expect(shops.findMany).not.toHaveBeenCalled();
    expect(shops.updateMany).not.toHaveBeenCalled();
  });
  it('writes only location under an ownership predicate and preserves approval', async () => {
    const { service, shops } = fixture();
    const result = await service.updateLocation('1', {
      latitude: '14.2',
      longitude: 101,
      address: { ...address, line1: '  New road  ' },
    });
    const input = shops.updateMany.mock.calls[0][0];
    expect(input.where).toEqual({ shop_id: 1n, owner_id: 99n });
    expect(Object.keys(input.data).sort()).toEqual([
      'address',
      'latitude',
      'longitude',
    ]);
    expect(input.data.latitude.toString()).toBe('14.2');
    expect(input.data.address.line1).toBe('New road');
    expect(result.participationStatus).toBe('APPROVED');
    expect(shops.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { shop_id: 1n, owner_id: 99n } }),
    );
  });
  it('conceals missing/other-owner shops and does not read after a failed write', async () => {
    const { service, shops } = fixture();
    shops.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      service.updateLocation('2', { latitude: 1, longitude: 2 }),
    ).rejects.toThrow('ไม่พบร้านที่คุณจัดการได้');
    expect(shops.findFirst).not.toHaveBeenCalled();
  });
  it('can clear unknown address or preserve it when omitted', () => {
    expect(
      sellerLocationInput({ latitude: 1, longitude: 2, address: null }).address,
    ).toBe(Prisma.DbNull);
    expect(
      sellerLocationInput({ latitude: 1, longitude: 2 }),
    ).not.toHaveProperty('address');
  });
});

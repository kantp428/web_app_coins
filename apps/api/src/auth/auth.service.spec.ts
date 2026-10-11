import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { SignJWT } from 'jose';
const { findUnique, create, categoryCount } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
  categoryCount: vi.fn(),
}));
vi.mock('@prisma/client', () => ({
  PrismaClient: class {
    users = { findUnique, create };
    categories = { count: categoryCount };
    $disconnect = vi.fn();
  },
}));
import { scryptSync } from 'node:crypto';
import { AuthService, validLogin, verifyPassword } from './auth.service.js';
describe('login validation', () => {
  it('requires 13 ASCII digits only for customer', () => {
    expect(
      validLogin({
        username: '0000000000000',
        password: 'secret',
        role: 'CUSTOMER',
      }),
    ).toBe(true);
    expect(
      validLogin({ username: '123', password: 'secret', role: 'CUSTOMER' }),
    ).toBe(false);
    expect(
      validLogin({ username: 'seller', password: 'secret', role: 'SELLER' }),
    ).toBe(true);
    expect(
      validLogin({
        username: 'officer',
        password: 'secret',
        role: 'GOVERNMENT',
      }),
    ).toBe(true);
    expect(
      validLogin({ username: 'officer', password: 'secret', role: 'ADMIN' }),
    ).toBe(false);
  });
  it('rejects malformed input and plaintext passwords', () => {
    expect(validLogin(null)).toBe(false);
    expect(
      validLogin({ username: 'seller', password: '', role: 'SELLER' }),
    ).toBe(false);
    expect(verifyPassword('secret', 'secret')).toBe(false);
  });
  it('verifies scrypt hashes and rejects wrong passwords', () => {
    const salt = '12345678901234567890123456789012';
    const hash = `scrypt$${salt}$${scryptSync('secret', salt, 64).toString('hex')}`;
    expect(verifyPassword('secret', hash)).toBe(true);
    expect(verifyPassword('wrong', hash)).toBe(false);
  });
});

const secret = 'test-only-secret-with-at-least-32-bytes';
const salt = '12345678901234567890123456789012';
const account = {
  user_id: 1n,
  role: 'SELLER',
  display_name: 'Test shop',
  status: 'ACTIVE',
  password_hash: `scrypt$${salt}$${scryptSync('secret', salt, 64).toString('hex')}`,
};
describe('authentication service', () => {
  const auth = new AuthService(new ConfigService({ JWT_SECRET: secret }));
  beforeEach(() => {
    findUnique.mockReset();
    findUnique.mockResolvedValue(account);
  });
  it('issues a verifiable JWT with a string user ID', async () => {
    const result = await auth.login({
      username: 'seller',
      password: 'secret',
      role: 'SELLER',
    });
    expect(await auth.me(`Bearer ${result.accessToken}`)).toEqual({
      id: '1',
      role: 'SELLER',
      displayName: 'Test shop',
    });
  });
  it('rejects wrong passwords, wrong roles and inactive accounts', async () => {
    await expect(
      auth.login({ username: 'seller', password: 'wrong', role: 'SELLER' }),
    ).rejects.toMatchObject({ status: 401 });
    await expect(
      auth.login({
        username: 'seller',
        password: 'secret',
        role: 'GOVERNMENT',
      }),
    ).rejects.toMatchObject({ status: 401 });
    findUnique.mockResolvedValue({ ...account, status: 'SUSPENDED' });
    await expect(
      auth.login({ username: 'seller', password: 'secret', role: 'SELLER' }),
    ).rejects.toMatchObject({ status: 401 });
  });
  it('rejects missing, invalid, tampered and expired tokens', async () => {
    await expect(auth.me()).rejects.toMatchObject({ status: 401 });
    await expect(auth.me('Bearer invalid')).rejects.toMatchObject({
      status: 401,
    });
    const result = await auth.login({
      username: 'seller',
      password: 'secret',
      role: 'SELLER',
    });
    const parts = result.accessToken.split('.');
    parts[1] = Buffer.from(
      JSON.stringify({ sub: '1', role: 'GOVERNMENT' }),
    ).toString('base64url');
    await expect(auth.me(`Bearer ${parts.join('.')}`)).rejects.toMatchObject({
      status: 401,
    });
    const expired = await new SignJWT({ role: 'SELLER' })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('1')
      .setIssuer('thai-please-api')
      .setAudience('thai-please-web')
      .setExpirationTime(1)
      .sign(new TextEncoder().encode(secret));
    await expect(auth.me(`Bearer ${expired}`)).rejects.toMatchObject({
      status: 401,
    });
  });
  it('rechecks account status and role after issuing a token', async () => {
    const result = await auth.login({
      username: 'seller',
      password: 'secret',
      role: 'SELLER',
    });
    findUnique.mockResolvedValue({ ...account, role: 'GOVERNMENT' });
    await expect(auth.me(`Bearer ${result.accessToken}`)).rejects.toMatchObject(
      { status: 401 },
    );
  });
});

describe('registration by role', () => {
  const auth = new AuthService(new ConfigService({ JWT_SECRET: secret }));
  const base = {
    username: 'new_user',
    password: 'Password!2026',
    confirmPassword: 'Password!2026',
  };
  const shop = {
    name: ' Test shop ',
    categoryIds: ['1', '2'],
    areaCode: 'BKK',
    address: {
      line1: ' Test address Bangkok ',
      province: '',
      district: '',
      subDistrict: '',
      postcode: '',
    },
    latitude: 13.75,
    longitude: 100.5,
    openingHours: {days:['MON','TUE'],open:'08:00',close:'18:00',timeZone:'Asia/Bangkok'},
    sizeClass: 'SMALL',
  };
  beforeEach(() => {
    create.mockReset();
    categoryCount.mockResolvedValue(2);
    create.mockImplementation(async ({ data }) => ({ ...data, user_id: 4n }));
  });
  it('requires customer name and stores the full name with a password hash', async () => {
    const payload = {
      ...base,
      role: 'CUSTOMER',
      username: '0000000000001',
      firstName: ' Test ',
      lastName: ' Customer ',
    };
    expect(await auth.register(payload)).toEqual({
      user: { id: '4', role: 'CUSTOMER', displayName: 'Test Customer' },
    });
    const data = create.mock.calls[0][0].data;
    expect(verifyPassword(payload.password, data.password_hash)).toBe(true);
    expect(data.shops).toBeUndefined();
    await expect(
      auth.register({ ...payload, firstName: '' }),
    ).rejects.toMatchObject({ status: 400 });
  });
  it('creates seller and PENDING shop in one nested write', async () => {
    expect(await auth.register({ ...base, role: 'SELLER', shop })).toEqual({
      user: { id: '4', role: 'SELLER', displayName: 'Test shop' },
    });
    expect(create.mock.calls[0][0].data.shops.create).toMatchObject({
      name: 'Test shop',
      shop_categories: { create: [{ category_id: 1n }, { category_id: 2n }] },
      area_code: 'BKK',
      address: {
        line1: 'Test address Bangkok',
        province: '',
        district: '',
        subDistrict: '',
        postcode: '',
      },
      latitude: 13.75,
      longitude: 100.5,
      opening_hours: shop.openingHours,
      size_class: 'SMALL',
      participation_status: 'PENDING',
    });
    expect(create.mock.calls[0][0].data.shops.create.owner_id).toBeUndefined();
  });
  it('rejects unknown category IDs before creating a user', async () => {
    categoryCount.mockResolvedValue(1);
    await expect(
      auth.register({ ...base, role: 'SELLER', shop }),
    ).rejects.toMatchObject({ status: 400 });
    expect(create).not.toHaveBeenCalled();
  });
  it('supports closing after midnight with selected days', async () => {
    await auth.register({...base,role:'SELLER',shop:{...shop,openingHours:{...shop.openingHours,open:'18:00',close:'02:00'}}});
    expect(create.mock.calls[0][0].data.shops.create.opening_hours).toMatchObject({open:'18:00',close:'02:00'});
  });
  it('allows government credentials without profile details', async () => {
    expect(await auth.register({ ...base, role: 'GOVERNMENT' })).toEqual({
      user: { id: '4', role: 'GOVERNMENT', displayName: 'new_user' },
    });
    expect(create.mock.calls[0][0].data.shops).toBeUndefined();
  });
  it('rejects missing or invalid shop details before writing', async () => {
    for (const details of [
      undefined,
      {},
      { ...shop, categoryIds: [] },
      { ...shop, categoryIds: ['1', '1'] },
      { ...shop, categoryIds: ['0'] },
      { ...shop, categoryIds: ['9223372036854775808'] },
      { ...shop, categoryIds: [1] },
      { ...shop, latitude: 91 },
      { ...shop, longitude: -181 },
      { ...shop, latitude: '13' },
      { ...shop, sizeClass: 'INVALID' },
      { ...shop, openingHours: '' },
      {...shop,openingHours:{...shop.openingHours,days:[]}},
      {...shop,openingHours:{...shop.openingHours,days:['MON','MON']}},
      {...shop,openingHours:{...shop.openingHours,days:['INVALID']}},
      {...shop,openingHours:{...shop.openingHours,open:'24:00'}},
      {...shop,openingHours:{...shop.openingHours,close:'08:00'}},
      {...shop,openingHours:{...shop.openingHours,timeZone:'UTC'}},
      { ...shop, name: ' ' },
      { ...shop, address: '' },
      { ...shop, address: { ...shop.address, line1: 'x'.repeat(501) } },
      { ...shop, address: { ...shop.address, postcode: 'abc' } },
      { ...shop, address: { ...shop.address, province: 42 } },
    ])
      await expect(
        auth.register({ ...base, role: 'SELLER', shop: details }),
      ).rejects.toMatchObject({ status: 400 });
    expect(create).not.toHaveBeenCalled();
  });
  it('rejects invalid credentials and names before writing', async () => {
    for (const payload of [
      null,
      { ...base, role: 'ADMIN' },
      { ...base, role: 'GOVERNMENT', username: 'bad user' },
      { ...base, role: 'GOVERNMENT', password: 'short' },
      { ...base, role: 'GOVERNMENT', confirmPassword: 'different' },
      {
        ...base,
        role: 'CUSTOMER',
        username: '123',
        firstName: 'Test',
        lastName: 'User',
      },
    ])
      await expect(auth.register(payload)).rejects.toMatchObject({
        status: 400,
      });
    expect(create).not.toHaveBeenCalled();
  });
  it('maps duplicate identifiers to 409 without another write', async () => {
    create.mockRejectedValue({ code: 'P2002' });
    await expect(
      auth.register({ ...base, role: 'SELLER', shop }),
    ).rejects.toMatchObject({ status: 409 });
    expect(create).toHaveBeenCalledTimes(1);
  });
  it('propagates nested shop write failure without a separate user write', async () => {
    create.mockRejectedValue(new Error('shop insert failed'));
    await expect(
      auth.register({ ...base, role: 'SELLER', shop }),
    ).rejects.toThrow('shop insert failed');
    expect(create).toHaveBeenCalledTimes(1);
  });
  it('uses fresh random salts', async () => {
    await auth.register({ ...base, role: 'GOVERNMENT' });
    await auth.register({
      ...base,
      role: 'GOVERNMENT',
      username: 'another_user',
    });
    expect(create.mock.calls[0][0].data.password_hash).not.toBe(
      create.mock.calls[1][0].data.password_hash,
    );
  });
});

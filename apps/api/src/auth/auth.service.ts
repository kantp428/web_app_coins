import {
  BadRequestException,
  ConflictException,
  Injectable,
  OnModuleDestroy,
  UnauthorizedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';

export const roles = ['CUSTOMER', 'SELLER', 'GOVERNMENT'] as const;
export function validLogin(
  body: unknown,
): body is { username: string; password: string; role: string } {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.username === 'string' &&
    b.username.length > 0 &&
    b.username.length <= 255 &&
    typeof b.password === 'string' &&
    b.password.length > 0 &&
    b.password.length <= 1024 &&
    typeof b.role === 'string' &&
    roles.includes(b.role as (typeof roles)[number]) &&
    (b.role !== 'CUSTOMER' || /^[0-9]{13}$/.test(b.username))
  );
}
export function verifyPassword(password: string, hash: string): boolean {
  const [algorithm, salt, digest] = hash.split('$');
  if (
    algorithm !== 'scrypt' ||
    !/^[a-f0-9]{32}$/.test(salt ?? '') ||
    !/^[a-f0-9]{128}$/.test(digest ?? '')
  )
    return false;
  return timingSafeEqual(
    scryptSync(password, salt, 64),
    Buffer.from(digest, 'hex'),
  );
}
export function validAddress(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const address = value as Record<string, unknown>;
  const keys = ['line1', 'province', 'district', 'subDistrict', 'postcode'];
  return (
    Object.keys(address).every((key) => keys.includes(key)) &&
    keys.every(
      (key) =>
        typeof address[key] === 'string' &&
        address[key].trim().length <= (key === 'line1' ? 500 : 100),
    ) &&
    keys.some((key) => (address[key] as string).trim().length > 0) &&
    ((address.postcode as string).trim() === '' ||
      /^[0-9]{5}$/.test((address.postcode as string).trim()))
  );
}
export function validCategoryIds(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length >= 1 &&
    value.length <= 10 &&
    value.every(
      (id) =>
        typeof id === 'string' &&
        /^[1-9][0-9]{0,18}$/.test(id) &&
        BigInt(id) <= 9223372036854775807n,
    ) &&
    new Set(value).size === value.length
  );
}
export function validOpeningHours(
  value: unknown,
): value is { days: string[]; open: string; close: string; timeZone: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  const time = (value: unknown): value is string =>
    typeof value === 'string' && /^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(value);
  return (
    Object.keys(v).every((key) =>
      ['days', 'open', 'close', 'timeZone'].includes(key),
    ) &&
    Array.isArray(v.days) &&
    v.days.length >= 1 &&
    v.days.length <= 7 &&
    v.days.every(
      (day) =>
        typeof day === 'string' &&
        ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].includes(day),
    ) &&
    new Set(v.days).size === v.days.length &&
    time(v.open) &&
    time(v.close) &&
    v.open !== v.close &&
    v.timeZone === 'Asia/Bangkok'
  );
}
@Injectable()
export class AuthService implements OnModuleDestroy {
  private readonly db: PrismaClient;
  constructor(private readonly config: ConfigService) {
    this.db = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: config.get<string>('DATABASE_URL'),
      }),
    });
  }
  private key() {
    const secret = this.config.get<string>('JWT_SECRET') ?? '';
    if (Buffer.byteLength(secret) < 32 || secret.startsWith('replace-'))
      throw new ServiceUnavailableException('Authentication is not configured');
    return new TextEncoder().encode(secret);
  }
  async register(body: unknown) {
    if (!validLogin(body))
      throw new BadRequestException('ข้อมูลสมัครสมาชิกไม่ถูกต้อง');
    const data = body as typeof body & {
      firstName?: unknown;
      lastName?: unknown;
      confirmPassword?: unknown;
      shop?: unknown;
    };
    const text = (value: unknown, max: number): value is string =>
      typeof value === 'string' &&
      value.trim().length > 0 &&
      value.trim().length <= max;
    if (
      body.password.length < 8 ||
      body.password.length > 128 ||
      data.confirmPassword !== body.password ||
      (body.role !== 'CUSTOMER' &&
        !/^[A-Za-z0-9_.-]{3,64}$/.test(body.username))
    )
      throw new BadRequestException(
        'กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน (8–128 ตัวอักษร)',
      );
    let displayName = body.username;
    let shop:
      | {
          name: string;
          categoryIds: string[];
          areaCode: string;
          address: Record<string, string>;
          latitude: number;
          longitude: number;
          openingHours: {
            days: string[];
            open: string;
            close: string;
            timeZone: string;
          };
          sizeClass: string;
        }
      | undefined;
    if (body.role === 'CUSTOMER') {
      if (!text(data.firstName, 100) || !text(data.lastName, 99))
        throw new BadRequestException('กรุณากรอกชื่อและนามสกุล');
      displayName = `${data.firstName.trim()} ${data.lastName.trim()}`;
    }
    if (body.role === 'SELLER') {
      if (!data.shop || typeof data.shop !== 'object')
        throw new BadRequestException('กรุณากรอกข้อมูลร้านค้า');
      const value = data.shop as Record<string, unknown>;
      if (
        !text(value.name, 200) ||
        !validCategoryIds(value.categoryIds) ||
        !text(value.areaCode, 20) ||
        !validAddress(value.address) ||
        !validOpeningHours(value.openingHours) ||
        typeof value.latitude !== 'number' ||
        !Number.isFinite(value.latitude) ||
        value.latitude < -90 ||
        value.latitude > 90 ||
        typeof value.longitude !== 'number' ||
        !Number.isFinite(value.longitude) ||
        value.longitude < -180 ||
        value.longitude > 180 ||
        typeof value.sizeClass !== 'string' ||
        !['SMALL', 'MEDIUM', 'LARGE'].includes(value.sizeClass)
      )
        throw new BadRequestException('ข้อมูลร้านค้าไม่ครบหรือพิกัดไม่ถูกต้อง');
      shop = {
        name: value.name.trim(),
        categoryIds: value.categoryIds as string[],
        areaCode: value.areaCode.trim(),
        address: Object.fromEntries(
          Object.entries(value.address as Record<string, string>).map(
            ([k, v]) => [k, v.trim()],
          ),
        ),
        latitude: value.latitude,
        longitude: value.longitude,
        openingHours: value.openingHours,
        sizeClass: value.sizeClass,
      };
      const count = await this.db.categories.count({
        where: {
          category_id: { in: shop.categoryIds.map((id) => BigInt(id)) },
        },
      });
      if (count !== shop.categoryIds.length)
        throw new BadRequestException('หมวดหมู่ร้านไม่ถูกต้อง');
      displayName = shop.name;
    }
    const salt = randomBytes(16).toString('hex');
    const hash = `scrypt$${salt}$${scryptSync(body.password, salt, 64).toString('hex')}`;
    try {
      const user = await this.db.users.create({
        data: {
          login_identifier: body.username,
          password_hash: hash,
          role: body.role,
          display_name: displayName,
          ...(shop
            ? {
                shops: {
                  create: {
                    name: shop.name,
                    shop_categories: {
                      create: shop.categoryIds.map((id) => ({
                        category_id: BigInt(id),
                      })),
                    },
                    area_code: shop.areaCode,
                    address: shop.address,
                    latitude: shop.latitude,
                    longitude: shop.longitude,
                    opening_hours: shop.openingHours,
                    size_class: shop.sizeClass,
                    participation_status: 'PENDING',
                  },
                },
              }
            : {}),
          status: 'ACTIVE',
        },
      });
      return { user: this.profile(user) };
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2002'
      )
        throw new ConflictException('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว');
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2003'
      )
        throw new BadRequestException(
          'หมวดหมู่ร้านไม่พร้อมใช้งาน กรุณาเลือกใหม่',
        );
      throw error;
    }
  }
  async login(body: unknown) {
    if (!validLogin(body))
      throw new BadRequestException('ข้อมูลเข้าสู่ระบบไม่ถูกต้อง');
    const user = await this.db.users.findUnique({
      where: { login_identifier: body.username },
    });
    if (
      !user ||
      !verifyPassword(body.password, user.password_hash) ||
      user.status !== 'ACTIVE' ||
      user.role !== body.role
    )
      throw new UnauthorizedException(
        'ชื่อผู้ใช้ รหัสผ่าน หรือบทบาทไม่ถูกต้อง',
      );
    const accessToken = await new SignJWT({ role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.user_id.toString())
      .setIssuer('thai-please-api')
      .setAudience('thai-please-web')
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(this.key());
    return { accessToken, expiresIn: 3600, user: this.profile(user) };
  }
  async me(authorization?: string) {
    const key = this.key();
    try {
      if (!authorization?.startsWith('Bearer ')) throw new Error('missing');
      const { payload } = await jwtVerify(authorization.slice(7), key, {
        algorithms: ['HS256'],
        issuer: 'thai-please-api',
        audience: 'thai-please-web',
      });
      if (!payload.sub || !/^[0-9]+$/.test(payload.sub))
        throw new Error('subject');
      const user = await this.db.users.findUnique({
        where: { user_id: BigInt(payload.sub) },
      });
      if (!user || user.status !== 'ACTIVE' || user.role !== payload.role)
        throw new Error('inactive');
      return this.profile(user);
    } catch {
      throw new UnauthorizedException('กรุณาเข้าสู่ระบบใหม่');
    }
  }
  private profile(user: {
    user_id: bigint;
    role: string;
    display_name: string;
  }) {
    return {
      id: user.user_id.toString(),
      role: user.role,
      displayName: user.display_name,
    };
  }
  async onModuleDestroy() {
    await this.db.$disconnect();
  }
}

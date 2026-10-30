import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthService, validAddress } from '../auth/auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

export function sellerShopId(id: string) {
  if (!/^[1-9][0-9]{0,18}$/.test(id) || BigInt(id) > 9223372036854775807n)
    throw new BadRequestException('รหัสร้านไม่ถูกต้อง');
  return BigInt(id);
}
export function sellerLocationInput(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw new BadRequestException('ข้อมูลตำแหน่งไม่ถูกต้อง');
  const input = body as Record<string, unknown>;
  if (
    Object.keys(input).some(
      (key) => !['latitude', 'longitude', 'address'].includes(key),
    )
  )
    throw new BadRequestException('แก้ไขได้เฉพาะพิกัดและที่อยู่ร้าน');
  const coordinate = (value: unknown, limit: number) => {
    if (
      (typeof value !== 'number' && typeof value !== 'string') ||
      (typeof value === 'string' && !/^-?\d+(\.\d+)?$/.test(value.trim()))
    )
      throw new BadRequestException('พิกัดไม่ถูกต้อง');
    const number = Number(value);
    if (!Number.isFinite(number) || Math.abs(number) > limit)
      throw new BadRequestException('พิกัดอยู่นอกขอบเขต');
    return new Prisma.Decimal(number.toFixed(6));
  };
  const latitude = coordinate(input.latitude, 90),
    longitude = coordinate(input.longitude, 180);
  if (
    input.address !== undefined &&
    input.address !== null &&
    !validAddress(input.address)
  )
    throw new BadRequestException('ที่อยู่ร้านไม่ถูกต้อง');
  const address =
    input.address === undefined
      ? undefined
      : input.address === null
        ? Prisma.DbNull
        : Object.fromEntries(
            Object.entries(input.address as Record<string, string>).map(
              ([key, value]) => [key, value.trim()],
            ),
          );
  return { latitude, longitude, ...(address !== undefined ? { address } : {}) };
}
const select = {
  shop_id: true,
  name: true,
  address: true,
  latitude: true,
  longitude: true,
  participation_status: true,
} as const;
type Shop = Prisma.shopsGetPayload<{ select: typeof select }>;
function output(shop: Shop) {
  const source =
    shop.address &&
    typeof shop.address === 'object' &&
    !Array.isArray(shop.address)
      ? shop.address
      : {};
  const entries = [
    'line1',
    'province',
    'district',
    'subDistrict',
    'postcode',
  ].map((key) => [key, typeof source[key] === 'string' ? source[key] : '']);
  return {
    id: shop.shop_id.toString(),
    name: shop.name,
    latitude: shop.latitude.toFixed(6),
    longitude: shop.longitude.toFixed(6),
    address: entries.some(([, value]) => value)
      ? Object.fromEntries(entries)
      : null,
    participationStatus: shop.participation_status,
  };
}
@Injectable()
export class SellerStoresService {
  constructor(
    private readonly db: PrismaService,
    private readonly auth: AuthService,
  ) {}
  private async actor(authorization?: string) {
    const user = await this.auth.me(authorization);
    if (user.role !== 'SELLER')
      throw new ForbiddenException('เฉพาะบัญชีร้านค้า');
    return BigInt(user.id);
  }
  async list(query: Record<string, unknown>, authorization?: string) {
    const owner_id = await this.actor(authorization);
    if (Object.keys(query).length)
      throw new BadRequestException('ไม่รองรับ query parameter');
    const stores = await this.db.shops.findMany({
      where: { owner_id },
      select,
      orderBy: { shop_id: 'asc' },
    });
    return { stores: stores.map(output) };
  }
  async updateLocation(id: string, body: unknown, authorization?: string) {
    const owner_id = await this.actor(authorization);
    const shop_id = sellerShopId(id),
      data = sellerLocationInput(body);
    return this.db.$transaction(async (tx) => {
      const updated = await tx.shops.updateMany({
        where: { shop_id, owner_id },
        data,
      });
      if (updated.count !== 1)
        throw new NotFoundException('ไม่พบร้านที่คุณจัดการได้');
      const shop = await tx.shops.findFirst({
        where: { shop_id, owner_id },
        select,
      });
      if (!shop) throw new NotFoundException('ไม่พบร้านที่คุณจัดการได้');
      return output(shop);
    });
  }
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthService } from '../auth/auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

export const STORE_PAGE_SIZE = 50;
export const STORE_PAGE_SIZE_MAX = 100;
export const STORE_BATCH_MAX = 100;
export type StoreScope = {
  latitude: number;
  longitude: number;
  radiusKm: number;
  categoryIds: string[];
};
export type StoreCandidate = {
  id: string;
  name: string;
  description?: string | null;
  categories: string[];
  distanceKm: number;
};
type StoreRow = {
  shop_id: bigint;
  name: string;
  description: string | null;
  address: Prisma.JsonValue | null;
  latitude: string;
  longitude: string;
  distance_km: number;
  categories: string[];
};
const decimalId = /^[1-9][0-9]{0,18}$/;
const numberValue = (value: unknown) =>
  (typeof value === 'string' || typeof value === 'number') &&
  String(value).trim() !== '' &&
  /^-?\d+(\.\d+)?$/.test(String(value))
    ? Number(value)
    : Number.NaN;
function categoryIds(value: unknown): string[] {
  if (value === undefined || value === null || value === '') return [];
  const values = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];
  if (
    values.length > 10 ||
    values.some(
      (id) =>
        typeof id !== 'string' ||
        !decimalId.test(id) ||
        BigInt(id) > 9223372036854775807n,
    ) ||
    new Set(values).size !== values.length
  )
    throw new BadRequestException('หมวดหมู่ไม่ถูกต้อง');
  return values;
}
export function parseStoreScope(value: Record<string, unknown>): StoreScope {
  const latitude = numberValue(value.latitude),
    longitude = numberValue(value.longitude);
  const radiusKm =
    value.radiusKm === undefined ? 5 : numberValue(value.radiusKm);
  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180 ||
    !Number.isFinite(radiusKm) ||
    radiusKm < 0.1 ||
    radiusKm > 50
  )
    throw new BadRequestException('พิกัดหรือรัศมีไม่ถูกต้อง (0.1–50 กม.)');
  return {
    latitude,
    longitude,
    radiusKm,
    categoryIds: categoryIds(value.categoryIds),
  };
}
export function parsePagination(value: Record<string, unknown>) {
  const page = value.page === undefined ? 1 : numberValue(value.page);
  const pageSize =
    value.pageSize === undefined
      ? STORE_PAGE_SIZE
      : numberValue(value.pageSize);
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > STORE_PAGE_SIZE_MAX
  )
    throw new BadRequestException('pagination ไม่ถูกต้อง');
  return { page, pageSize };
}
export function parseShopIds(value: unknown): string[] {
  if (
    !Array.isArray(value) ||
    value.length > STORE_BATCH_MAX ||
    value.some((id) => typeof id !== 'string' || !decimalId.test(id)) ||
    new Set(value).size !== value.length
  )
    throw new BadRequestException(
      `shopIds ต้องไม่ซ้ำและไม่เกิน ${STORE_BATCH_MAX} ร้าน`,
    );
  return value;
}
@Injectable()
export class StoresService {
  constructor(
    private readonly db: PrismaService,
    private readonly auth: AuthService,
  ) {}
  async requireCustomer(authorization?: string) {
    const user = await this.auth.me(authorization);
    if (user.role !== 'CUSTOMER')
      throw new ForbiddenException('เฉพาะบัญชีลูกค้า');
    return user;
  }
  private categoryFilter(ids: string[]) {
    return ids.length === 0
      ? Prisma.empty
      : Prisma.sql`AND EXISTS (
      SELECT 1 FROM shop_categories filter_sc WHERE filter_sc.shop_id = s.shop_id
      AND filter_sc.category_id IN (${Prisma.join(ids.map((id) => BigInt(id)))})
    )`;
  }
  private scopedQuery(
    scope: StoreScope,
    tail: Prisma.Sql = Prisma.empty,
  ): Prisma.Sql {
    const { latitude, longitude, radiusKm } = scope;
    return Prisma.sql`WITH scoped AS (
      SELECT s.shop_id,s.name,s.description,s.address,s.latitude::text AS latitude,s.longitude::text AS longitude,
      6371.0088*2*asin(sqrt(least(1.0,greatest(0.0,
        power(sin(radians(s.latitude::double precision-${latitude})/2),2)+cos(radians(${latitude}))*cos(radians(s.latitude::double precision))*power(sin(radians(s.longitude::double precision-${longitude})/2),2)
      )))) AS distance_km,
      ARRAY(SELECT c.name FROM shop_categories sc JOIN categories c USING(category_id) WHERE sc.shop_id=s.shop_id ORDER BY c.name) AS categories
      FROM shops s WHERE s.participation_status='APPROVED' ${this.categoryFilter(scope.categoryIds)}
    ) SELECT * FROM scoped WHERE distance_km<=${radiusKm} ORDER BY distance_km,shop_id ${tail}`;
  }
  private store(row: StoreRow) {
    return {
      id: row.shop_id.toString(),
      name: row.name,
      description: row.description,
      address: row.address,
      latitude: row.latitude,
      longitude: row.longitude,
      distanceKm: row.distance_km,
      categories: row.categories,
    };
  }
  async list(query: Record<string, unknown>, authorization?: string) {
    await this.requireCustomer(authorization);
    const allowed = new Set([
      'latitude',
      'longitude',
      'radiusKm',
      'categoryIds',
      'page',
      'pageSize',
    ]);
    if (Object.keys(query).some((key) => !allowed.has(key)))
      throw new BadRequestException('query parameter ไม่ถูกต้อง');
    const scope = parseStoreScope(query),
      { page, pageSize } = parsePagination(query),
      offset = (page - 1) * pageSize;
    const rows = await this.db.$queryRaw<StoreRow[]>(
      this.scopedQuery(scope, Prisma.sql`LIMIT ${pageSize} OFFSET ${offset}`),
    );
    const count = await this.db.$queryRaw<{ total: bigint }[]>(
      Prisma.sql`SELECT count(*)::bigint AS total FROM (${this.scopedQuery(scope)}) matches`,
    );
    const total = Number(count[0]?.total ?? 0);
    return {
      radiusKm: scope.radiusKm,
      stores: rows.map((row) => this.store(row)),
      meta: {
        page,
        pageSize,
        total,
        hasNextPage: offset + rows.length < total,
      },
    };
  }
  async candidates(scope: StoreScope): Promise<StoreCandidate[]> {
    const rows = await this.db.$queryRaw<StoreRow[]>(this.scopedQuery(scope));
    return rows.map((row) => ({
      id: row.shop_id.toString(),
      name: row.name,
      categories: row.categories,
      distanceKm: row.distance_km,
    }));
  }
  async descriptions(scope: StoreScope, ids: string[]) {
    if (ids.length === 0) return [];
    const wanted = new Set(ids),
      rows = await this.db.$queryRaw<StoreRow[]>(this.scopedQuery(scope));
    const byId = new Map(
      rows
        .filter((row) => wanted.has(row.shop_id.toString()))
        .map((row) => [row.shop_id.toString(), row.description]),
    );
    return ids.flatMap((id) =>
      byId.has(id) ? [{ id, description: byId.get(id) ?? null }] : [],
    );
  }
  async hydrate(scope: StoreScope, ids: string[]) {
    if (ids.length === 0) return [];
    const wanted = new Set(ids),
      rows = await this.db.$queryRaw<StoreRow[]>(this.scopedQuery(scope));
    const byId = new Map(
      rows
        .filter((row) => wanted.has(row.shop_id.toString()))
        .map((row) => [row.shop_id.toString(), this.store(row)]),
    );
    return ids.flatMap((id) => (byId.has(id) ? [byId.get(id)!] : []));
  }
}

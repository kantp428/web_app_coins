import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { AuthService } from '../auth/auth.service.js';
export function nearbyScope(query: Record<string, unknown>) {
  const number = (value: unknown) =>
    typeof value === 'string' &&
    value.trim() !== '' &&
    /^-?\d+(\.\d+)?$/.test(value)
      ? Number(value)
      : NaN;
  const latitude = number(query.latitude),
    longitude = number(query.longitude),
    radiusKm = query.radiusKm === undefined ? 5 : number(query.radiusKm);
  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180 ||
    !Number.isFinite(radiusKm) ||
    radiusKm < 0.1 ||
    radiusKm > 50 ||
    Object.keys(query).some(
      (k) => !['latitude', 'longitude', 'radiusKm'].includes(k),
    )
  )
    throw new BadRequestException('พิกัดหรือรัศมีไม่ถูกต้อง (0.1–50 กม.)');
  return { latitude, longitude, radiusKm };
}
@Injectable()
export class StoresService implements OnModuleDestroy {
  private readonly db: PrismaClient;
  constructor(
    config: ConfigService,
    private readonly auth: AuthService,
  ) {
    this.db = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: config.get<string>('DATABASE_URL'),
      }),
    });
  }
  async list(query: Record<string, unknown>, authorization?: string) {
    const user = await this.auth.me(authorization);
    if (user.role !== 'CUSTOMER')
      throw new ForbiddenException('เฉพาะบัญชีลูกค้า');
    const { latitude, longitude, radiusKm } = nearbyScope(query);
    const rows = await this.db.$queryRaw<
      {
        shop_id: bigint;
        name: string;
        description: string | null;
        address: unknown;
        latitude: string;
        longitude: string;
        distance_km: number;
        categories: string[];
      }[]
    >`
   SELECT nearby.*, ARRAY(SELECT c.name FROM shop_categories sc JOIN categories c USING(category_id) WHERE sc.shop_id=nearby.shop_id ORDER BY c.name) AS categories
   FROM (SELECT shop_id,name,description,address,latitude::text,longitude::text,
    6371.0088 * 2 * asin(sqrt(least(1.0,greatest(0.0,
      power(sin(radians(latitude::double precision-${latitude})/2),2)+cos(radians(${latitude}))*cos(radians(latitude::double precision))*power(sin(radians(longitude::double precision-${longitude})/2),2)
    )))) AS distance_km FROM shops WHERE participation_status='APPROVED') nearby
   WHERE distance_km<=${radiusKm} ORDER BY distance_km,shop_id LIMIT 50`;
    return {
      radiusKm,
      stores: rows.map((r) => ({
        id: r.shop_id.toString(),
        name: r.name,
        description: r.description,
        address: r.address,
        latitude: r.latitude,
        longitude: r.longitude,
        distanceKm: r.distance_km,
        categories: r.categories,
      })),
    };
  }
  async onModuleDestroy() {
    await this.db.$disconnect();
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Header,
  Headers,
  HttpCode,
  Injectable,
  OnModuleDestroy,
  Post,
  Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { AuthService } from '../auth/auth.service.js';
import {
  parseStoreScope,
  parsePagination,
  parseShopIds,
  StoresService,
} from '../stores/stores.service.js';

export function categoryFilter(body: unknown): string[] {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw new BadRequestException('ต้องระบุ categoryIds');
  const input = body as Record<string, unknown>;
  const ids = input.categoryIds;
  if (
    Object.keys(input).some(
      (key) =>
        ![
          'categoryIds',
          'latitude',
          'longitude',
          'radiusKm',
          'shopIds',
        ].includes(key),
    ) ||
    !Array.isArray(ids) ||
    ids.length < 1 ||
    ids.length > 10 ||
    ids.some(
      (id) =>
        typeof id !== 'string' ||
        !/^[1-9]\d{0,18}$/.test(id) ||
        BigInt(id) > 9223372036854775807n,
    ) ||
    new Set(ids).size !== ids.length
  )
    throw new BadRequestException(
      'categoryIds ต้องเป็นรหัสประเภทที่ไม่ซ้ำ 1–10 รหัส',
    );
  return ids as string[];
}

export function recommendationShopIds(value: unknown): bigint[] | undefined {
  if (value === undefined) return undefined;
  if (
    !Array.isArray(value) ||
    value.length > 200 ||
    value.some(
      (id) =>
        typeof id !== 'string' ||
        !/^[1-9]\d{0,18}$/.test(id) ||
        BigInt(id) > 9223372036854775807n,
    ) ||
    new Set(value).size !== value.length
  )
    throw new BadRequestException(
      'shopIds ต้องเป็นรหัสร้านที่ไม่ซ้ำ ไม่เกิน 200 รหัส',
    );
  return value.map((id) => BigInt(id));
}

@Injectable()
export class RecommendationsService implements OnModuleDestroy {
  private readonly db: PrismaClient;
  constructor(
    config: ConfigService,
    private readonly auth: AuthService,
    private readonly stores: StoresService,
  ) {
    this.db = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: config.get<string>('DATABASE_URL'),
      }),
    });
  }

  private async customer(authorization?: string) {
    const user = await this.auth.me(authorization);
    if (user.role !== 'CUSTOMER')
      throw new ForbiddenException('เฉพาะบัญชีลูกค้า');
    return user;
  }

  async context(authorization?: string) {
    const user = await this.customer(authorization);
    const categories = await this.db.categories.findMany({
      orderBy: { name: 'asc' },
      select: { category_id: true, name: true, slug: true },
    });
    const history = await this.db.$queryRaw<
      {
        shop_id: bigint;
        purchase_count: bigint;
        last_purchased_at: Date;
        category_ids: bigint[];
      }[]
    >`
      SELECT p.shop_id, count(*) AS purchase_count,
        max(p.confirmed_at) AS last_purchased_at,
        ARRAY(SELECT sc.category_id FROM shop_categories sc
          WHERE sc.shop_id = p.shop_id ORDER BY sc.category_id) AS category_ids
      FROM purchases p
      WHERE p.customer_id = ${BigInt(user.id)}
        AND p.status IN ('SUCCEEDED', 'REFUNDED') AND p.confirmed_at IS NOT NULL
      GROUP BY p.shop_id ORDER BY last_purchased_at DESC, p.shop_id LIMIT 20`;
    return {
      user,
      categories: categories.map((category) => ({
        id: category.category_id.toString(),
        name: category.name,
        slug: category.slug,
      })),
      purchaseHistory: history.map((purchase) => ({
        storeId: purchase.shop_id.toString(),
        categoryIds: purchase.category_ids.map(String),
        purchaseCount: purchase.purchase_count.toString(),
        lastPurchasedAt: purchase.last_purchased_at.toISOString(),
      })),
    };
  }

  async candidates(body: unknown, authorization?: string) {
    const user = await this.customer(authorization);
    const categoryIds = categoryFilter(body).map(BigInt);
    const input = body as Record<string, unknown>;
    const scope = ['latitude', 'longitude', 'radiusKm'].some(
      (key) => input[key] !== undefined,
    )
      ? parseStoreScope(input)
      : undefined;
    const shopIds = recommendationShopIds(
      (body as Record<string, unknown>).shopIds,
    );
    if (
      (await this.db.categories.count({
        where: { category_id: { in: categoryIds } },
      })) !== categoryIds.length
    )
      throw new BadRequestException('ไม่พบประเภทร้านที่ระบุ');
    if (shopIds?.length === 0) return { stores: [] };
    const related =
      shopIds === undefined
        ? Prisma.empty
        : Prisma.sql`WHERE s.shop_id IN (${Prisma.join(shopIds)})`;
    // One statement evaluates visit status, active rates and both quotas from
    // the same DB snapshot. No prompt history limit affects the visit check.
    const now = new Date();
    const stores = await this.db.$queryRaw<
      { shop_id: bigint; visited: boolean; coins: number | null }[]
    >`
      WITH scoped_stores AS (${scope ? this.stores.scopedQuery(scope) : this.stores.approvedQuery(categoryIds.map(String))}), eligible AS (
        SELECT s.shop_id, EXISTS (
          SELECT 1 FROM purchases p WHERE p.customer_id = ${BigInt(user.id)}
            AND p.shop_id = s.shop_id AND p.status IN ('SUCCEEDED', 'REFUNDED')
            AND p.confirmed_at IS NOT NULL
        ) AS visited
        FROM scoped_stores s ${related}
      ), rated AS (
        SELECT e.*, CASE WHEN e.visited THEN r.repeat_customer_coins
          ELSE r.new_customer_coins END AS coins
        FROM eligible e LEFT JOIN shop_coin_rates r ON r.shop_id = e.shop_id
          AND r.period_id IN (SELECT period_id FROM coin_rate_periods
            WHERE starts_at <= ${now} AND ends_at > ${now})
      ), ranked AS (
        SELECT *, row_number() OVER (PARTITION BY visited
          ORDER BY coins DESC NULLS LAST, shop_id) AS position FROM rated
      )
      SELECT shop_id, visited, coins FROM ranked
      WHERE position <= CASE WHEN visited THEN 2 ELSE 3 END
      ORDER BY coins DESC NULLS LAST, shop_id`;
    return {
      stores: stores.map((store) => ({
        id: store.shop_id.toString(),
        visited: store.visited,
        coins: store.coins,
      })),
    };
  }

  async catalog(query: Record<string, unknown>, authorization?: string) {
    await this.customer(authorization);
    if (
      Object.keys(query).some(
        (key) => !['categoryIds', 'page', 'pageSize'].includes(key),
      )
    )
      throw new BadRequestException('query parameter ไม่ถูกต้อง');
    const ids = categoryFilter({
      categoryIds:
        typeof query.categoryIds === 'string'
          ? query.categoryIds.split(',')
          : [],
    });
    if (
      (await this.db.categories.count({
        where: { category_id: { in: ids.map(BigInt) } },
      })) !== ids.length
    )
      throw new BadRequestException('ไม่พบประเภทร้านที่ระบุ');
    const { page, pageSize } = parsePagination(query);
    return this.stores.catalog(ids, page, pageSize);
  }
  async cards(body: unknown, authorization?: string) {
    const user = await this.customer(authorization);
    if (
      !body ||
      typeof body !== 'object' ||
      Array.isArray(body) ||
      Object.keys(body).some((key) => key !== 'shopIds')
    )
      throw new BadRequestException('ต้องระบุ shopIds เท่านั้น');
    const ids = parseShopIds((body as Record<string, unknown>).shopIds);
    if (ids.length > 5)
      throw new BadRequestException('อ่านการ์ดแนะนำได้ไม่เกิน5ร้าน');
    return { stores: await this.stores.hydrateGlobal(ids, user.id) };
  }

  async onModuleDestroy() {
    await this.db.$disconnect();
  }
}

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendations: RecommendationsService) {}

  @Get('context')
  @Header('Cache-Control', 'no-store')
  context(@Headers('authorization') authorization?: string) {
    return this.recommendations.context(authorization);
  }
  @Get('catalog')
  @Header('Cache-Control', 'no-store')
  catalog(
    @Query() query: Record<string, unknown>,
    @Headers('authorization') authorization?: string,
  ) {
    return this.recommendations.catalog(query, authorization);
  }
  @Post('stores')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  cards(
    @Body() body: unknown,
    @Headers('authorization') authorization?: string,
  ) {
    return this.recommendations.cards(body, authorization);
  }

  @Post('candidates')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  candidates(
    @Body() body: unknown,
    @Headers('authorization') authorization?: string,
  ) {
    return this.recommendations.candidates(body, authorization);
  }
}

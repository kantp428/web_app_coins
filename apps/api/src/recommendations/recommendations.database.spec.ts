import 'dotenv/config';
import { describe, it, expect } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '../auth/auth.service.js';
import { RecommendationsService } from './recommendations.controller.js';

// Opt-in real PostgreSQL test. Only session-local TEMP tables are written;
// business tables/ledgers/users are never modified. Requires two master categories.
describe.runIf(process.env.RECOMMENDATION_DB_TEST === '1')(
  'recommendation SQL on PostgreSQL',
  () => {
    it('filters/ranks both quotas against actual SQL, including refunds, missing rates and cross-user history', async () => {
      if (!process.env.DATABASE_URL || process.env.NODE_ENV === 'production')
        throw new Error('Requires a development DATABASE_URL');
      const config = new ConfigService({
        DATABASE_URL: process.env.DATABASE_URL,
      });
      const service = new RecommendationsService(config, {
        me: async () => ({
          id: '99',
          role: 'CUSTOMER',
          displayName: 'Fixture',
        }),
      } as unknown as AuthService);
      const db = (service as unknown as { db: PrismaClient }).db;
      try {
        const categories = await db.categories.findMany({
          take: 2,
          orderBy: { category_id: 'asc' },
        });
        expect(categories.length).toBe(2);
        const [a, b] = categories.map((category) => category.category_id);
        await db.$transaction(
          async (tx) => {
            for (const ddl of [
              'CREATE TEMP TABLE shops (shop_id bigint PRIMARY KEY, participation_status text) ON COMMIT DROP',
              'CREATE TEMP TABLE purchases (shop_id bigint, customer_id bigint, status text, confirmed_at timestamptz) ON COMMIT DROP',
              'CREATE TEMP TABLE shop_categories (shop_id bigint, category_id bigint) ON COMMIT DROP',
              'CREATE TEMP TABLE coin_rate_periods (period_id bigint, starts_at timestamptz, ends_at timestamptz) ON COMMIT DROP',
              'CREATE TEMP TABLE shop_coin_rates (shop_id bigint, period_id bigint, new_customer_coins smallint, repeat_customer_coins smallint) ON COMMIT DROP',
            ])
              await tx.$executeRawUnsafe(ddl);
            await tx.$executeRaw`INSERT INTO shops SELECT i, CASE WHEN i=9 THEN 'PENDING' ELSE 'APPROVED' END FROM generate_series(1,9) i`;
            await tx.$executeRaw`INSERT INTO shop_categories SELECT i, CASE WHEN i=8 THEN ${b} ELSE ${a} END FROM generate_series(1,9) i`;
            await tx.$executeRaw`INSERT INTO shop_categories VALUES (1,${b})`;
            await tx.$executeRaw`INSERT INTO purchases VALUES (5,99,'SUCCEEDED',now()-interval '400 days'), (6,99,'REFUNDED',now()-interval '40 days'), (7,99,'PENDING',null), (8,42,'SUCCEEDED',now())`;
            await tx.$executeRaw`INSERT INTO coin_rate_periods VALUES (1,now()-interval '1 day',now()+interval '1 day'), (2,now()+interval '2 days',now()+interval '3 days')`;
            await tx.$executeRaw`INSERT INTO shop_coin_rates VALUES (1,1,10,1),(2,1,8,1),(3,1,7,1),(5,1,8,1),(7,1,9,1),(8,1,6,1),(9,1,10,1),(4,2,10,1)`;
            Object.assign(service, { db: tx });
            const filtered = await service.candidates({
              categoryIds: [String(a)],
            });
            expect(filtered.stores).toEqual([
              { id: '1', visited: false, coins: 10 },
              { id: '7', visited: false, coins: 9 },
              { id: '2', visited: false, coins: 8 },
              { id: '5', visited: true, coins: 1 },
              { id: '6', visited: true, coins: null },
            ]);
            const short = await service.candidates({
              categoryIds: [String(b)],
            });
            expect(short.stores.map((store) => store.id)).toEqual(['1', '8']);
            expect(short.stores.every((store) => !store.visited)).toBe(true);
            const multiple = await service.candidates({
              categoryIds: [String(a), String(b)],
            });
            expect(multiple.stores.map((store) => store.id)).toEqual([
              '1',
              '7',
              '2',
              '5',
              '6',
            ]);
            const context = await service.context();
            expect(
              context.purchaseHistory
                .map((purchase) => purchase.storeId)
                .sort(),
            ).toEqual(['5', '6']);
            await tx.$executeRaw`DELETE FROM shop_coin_rates`;
            const unknown = await service.candidates({
              categoryIds: [String(a)],
            });
            expect(unknown.stores.map((store) => store.id)).toEqual([
              '1',
              '2',
              '3',
              '5',
              '6',
            ]);
            expect(unknown.stores.every((store) => store.coins === null)).toBe(
              true,
            );
            await tx.$executeRaw`UPDATE shops SET participation_status='PENDING'`;
            expect(
              (await service.candidates({ categoryIds: [String(a)] })).stores,
            ).toEqual([]);
          },
          { timeout: 60000 },
        );
      } finally {
        await db.$disconnect();
      }
    }, 90000);
  },
);

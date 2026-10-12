import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { Client } from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { CoinRatesService } from './coin-rates.service.js';
import { readRatePeriodSummaries } from './coin-rules.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { AuthService } from '../auth/auth.service.js';

// Explicit opt-in: creates/migrates only a randomly named disposable schema.
describe.skipIf(process.env.RUN_COIN_RATES_DB_TESTS !== 'true')(
  'Coin rates PostgreSQL integration',
  () => {
    const schema = `coin_rates_test_${randomUUID().replaceAll('-', '')}`;
    const connectionString =
      process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
    let sql: Client;
    let db: PrismaClient;
    let service: CoinRatesService;
    let customerId: bigint;
    let pendingShopId: bigint;
    let shopId: bigint;
    const cutoff = new Date('2026-10-13T06:00:00+07:00');
    const now = new Date('2026-10-13T08:00:00+07:00');
    const windowStart = new Date('2026-10-06T06:00:00+07:00');

    beforeAll(async () => {
      if (!connectionString)
        throw new Error('Database connection is required for opt-in tests');
      sql = new Client({ connectionString });
      await sql.connect();
      await sql.query('BEGIN');
      await sql.query(`CREATE SCHEMA "${schema}"`);
      await sql.query(`SET LOCAL search_path TO "${schema}"`);
      for (const directory of (
        await readdir('prisma/migrations', { withFileTypes: true })
      )
        .filter((entry) => entry.isDirectory())
        .sort((a, b) => a.name.localeCompare(b.name))) {
        const migration = await readFile(
          `prisma/migrations/${directory.name}/migration.sql`,
          'utf8',
        );
        await sql.query(
          migration
            .replace(/^\s*(BEGIN|COMMIT);\s*$/gm, '')
            .replaceAll('"public"', `"${schema}"`)
            .replaceAll('public.', `"${schema}".`),
        );
      }
      await sql.query('COMMIT');
      db = new PrismaClient({
        adapter: new PrismaPg({ connectionString }, { schema }),
      });
      const government = await db.users.create({
        data: {
          login_identifier: 'rate_test_gov',
          password_hash: 'unused',
          role: 'GOVERNMENT',
          display_name: 'Rate test government',
        },
      });
      const seller = await db.users.create({
        data: {
          login_identifier: 'rate_test_seller',
          password_hash: 'unused',
          role: 'SELLER',
          display_name: 'Rate test seller',
        },
      });
      const customer = await db.users.create({
        data: {
          login_identifier: '0000000000000',
          password_hash: 'unused',
          role: 'CUSTOMER',
          display_name: 'Rate test customer',
        },
      });
      customerId = customer.user_id;
      const rule = await db.coin_rule_versions.create({
        data: {
          version: 1,
          created_by: government.user_id,
          effective_from: windowStart,
          minimum_purchase: '50',
          low_sales_threshold: '10000',
          sales_window_days: 7,
          new_low_sales_coins: 10,
          new_other_coins: 5,
          repeat_coins: 1,
        },
      });
      const shops = [];
      for (const [index, status] of [
        'APPROVED',
        'APPROVED',
        'APPROVED',
        'PENDING',
      ].entries()) {
        shops.push(
          await db.shops.create({
            data: {
              owner_id: seller.user_id,
              name: `Rate test ${index}`,
              latitude: '13.75',
              longitude: '100.5',
              size_class: 'SMALL',
              participation_status: status,
            },
          }),
        );
      }
      shopId = shops[0].shop_id;
      pendingShopId = shops[3].shop_id;
      const purchases = [
        {
          shop: shopId,
          amount: '9999.99',
          at: windowStart,
          status: 'SUCCEEDED',
          refund: null,
        },
        {
          shop: shopId,
          amount: '10000',
          at: new Date(windowStart.getTime() - 1),
          status: 'SUCCEEDED',
          refund: null,
        },
        {
          shop: shopId,
          amount: '10000',
          at: cutoff,
          status: 'SUCCEEDED',
          refund: null,
        },
        {
          shop: shopId,
          amount: '10000',
          at: windowStart,
          status: 'REFUNDED',
          refund: new Date(cutoff.getTime() - 1),
        },
        {
          shop: shops[1].shop_id,
          amount: '10000',
          at: windowStart,
          status: 'REFUNDED',
          refund: cutoff,
        },
        {
          shop: shopId,
          amount: '10000',
          at: null,
          status: 'FAILED',
          refund: null,
        },
        {
          shop: shopId,
          amount: '10000',
          at: null,
          status: 'PENDING',
          refund: null,
        },
      ];
      for (const [index, purchase] of purchases.entries())
        await db.purchases.create({
          data: {
            customer_id: customerId,
            shop_id: purchase.shop,
            rule_id: rule.rule_id,
            total_amount: purchase.amount,
            customer_paid: purchase.amount,
            status: purchase.status,
            confirmed_at: purchase.at,
            refunded_at: purchase.refund,
            created_at: new Date(windowStart.getTime() - 86400000),
            shop_size_snapshot: 'SMALL',
            idempotency_key: `rate-test-${index}`,
          },
        });
      service = new CoinRatesService(
        db as PrismaService,
        {} as AuthService,
        new ConfigService(),
      );
    }, 120000);

    afterAll(async () => {
      if (!sql) return;
      if (db) await db.$disconnect();
      // The generated identifier is never derived from user input or a production schema name.
      if (!/^coin_rates_test_[a-f0-9]{32}$/.test(schema))
        throw new Error('Unsafe test schema');
      try {
        await sql.query('ROLLBACK');
        await sql.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      } finally {
        await sql.end();
      }
    }, 30000);

    it('serializes concurrent generation and preserves cutoff/refund snapshots', async () => {
      const results = await Promise.all([
        service.generateCurrent(now),
        service.generateCurrent(now),
      ]);
      expect(results.filter((result) => result.created)).toHaveLength(1);
      expect(results[0].periodId).toBe(results[1].periodId);
      expect(await db.coin_rate_periods.count()).toBe(1);
      const rates = await db.shop_coin_rates.findMany({
        orderBy: { shop_id: 'asc' },
      });
      expect(rates).toHaveLength(3);
      expect(rates.map((rate) => rate.sales_total_snapshot.toFixed(2))).toEqual(
        ['9999.99', '10000.00', '0.00'],
      );
      expect(rates.map((rate) => rate.new_customer_coins)).toEqual([10, 5, 10]);
      expect(
        rates.every(
          (rate) => rate.sales_window_ends_at.getTime() === cutoff.getTime(),
        ),
      ).toBe(true);
    }, 60000);

    it('does not mutate an existing round after approval; next round includes the shop', async () => {
      const before = await db.shop_coin_rates.findMany({
        orderBy: { shop_id: 'asc' },
      });
      await db.shops.update({
        where: { shop_id: pendingShopId },
        data: { participation_status: 'APPROVED' },
      });
      expect(await service.generateCurrent(now)).toMatchObject({
        created: false,
        shopCount: 3,
      });
      expect(
        await db.shop_coin_rates.findMany({ orderBy: { shop_id: 'asc' } }),
      ).toEqual(before);
      expect(
        await service.generateCurrent(new Date('2026-10-13T18:00:00+07:00')),
      ).toMatchObject({ created: true, shopCount: 4 });
      expect(await db.shop_coin_rates.count()).toBe(7);
    }, 60000);

    it('summarizes complete shop buckets and gross ledger awards by half-open round', async () => {
      const month = await db.monthly_periods.create({
        data: {
          month_key: new Date('2026-10-01T00:00:00Z'),
          starts_at: new Date('2026-10-01T00:00:00+07:00'),
          ends_at: new Date('2026-11-01T00:00:00+07:00'),
          budget_limit: '100000',
          status: 'OPEN',
        },
      });
      for (const [key, coins, awardedAt] of [
        ['rate-test-0', 10, cutoff],
        ['rate-test-2', 5, new Date('2026-10-13T18:00:00+07:00')],
      ] as const) {
        const purchase = await db.purchases.findUniqueOrThrow({
          where: { idempotency_key: key },
        });
        await db.coin_entries.create({
          data: {
            user_id: customerId,
            period_id: month.period_id,
            purchase_id: purchase.purchase_id,
            rule_id: purchase.rule_id!,
            coins,
            awarded_at: awardedAt,
            reversed_at: key === 'rate-test-0' ? now : null,
          },
        });
      }
      for (let i = 1; i <= 12; i++)
        await db.coin_rate_periods.create({
          data: {
            starts_at: new Date(cutoff.getTime() - i * 43200000),
            ends_at: new Date(cutoff.getTime() - (i - 1) * 43200000),
          },
        });
      const summaries = await db.$transaction(async (tx) => {
        // Regression: qualified SQL must not depend on the session search_path.
        await tx.$executeRaw`SELECT set_config('search_path', 'pg_catalog', true)`;
        return readRatePeriodSummaries(tx, schema);
      });
      expect(summaries).toHaveLength(10);
      expect(summaries[0]).toMatchObject({ shopCount: 4, coinsAwarded: '5' });
      expect(summaries[1]).toMatchObject({
        shopCount: 3,
        belowThresholdShopCount: 2,
        atOrAboveThresholdShopCount: 1,
        coinsAwarded: '10',
      });
      expect(summaries[2]).toMatchObject({
        shopCount: 0,
        belowThresholdShopCount: 0,
        atOrAboveThresholdShopCount: 0,
        coinsAwarded: '0',
      });
      expect(
        summaries.every(
          (p) =>
            p.belowThresholdShopCount + p.atOrAboveThresholdShopCount ===
            p.shopCount,
        ),
      ).toBe(true);
    }, 60000);

    it('rolls back the period when rate insertion fails', async () => {
      await sql.query(
        `CREATE FUNCTION "${schema}".reject_test_rate() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'intentional test failure'; END $$`,
      );
      await sql.query(
        `CREATE TRIGGER reject_test_rate BEFORE INSERT ON "${schema}".shop_coin_rates FOR EACH ROW EXECUTE FUNCTION "${schema}".reject_test_rate()`,
      );
      const periods = await db.coin_rate_periods.count();
      await expect(
        service.generateCurrent(new Date('2026-10-14T06:00:00+07:00')),
      ).rejects.toThrow();
      expect(await db.coin_rate_periods.count()).toBe(periods);
      expect(await db.shop_coin_rates.count()).toBe(7);
    }, 60000);
  },
);

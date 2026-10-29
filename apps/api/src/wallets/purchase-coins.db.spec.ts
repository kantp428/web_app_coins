import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { Client } from 'pg';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { WalletsService } from './wallets.service.js';
import { ensureQuestGrant } from './main-quest.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { AuthService } from '../auth/auth.service.js';

describe.skipIf(process.env.RUN_COIN_AWARDS_DB_TESTS !== 'true')(
  'atomic Coin settlement PostgreSQL',
  () => {
    const schema = `coin_awards_test_${randomUUID().replaceAll('-', '')}`;
    const connectionString =
      process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
    let sql: Client;
    let db: PrismaClient;
    let service: WalletsService;
    let customerId: bigint;
    let sellerId: bigint;
    let shopId: bigint;
    let otherShopId: bigint;
    let noRateShopId: bigint;
    let ruleId: bigint;
    const start = new Date('2026-10-31T18:00:00+07:00');
    const now = new Date('2026-10-31T23:59:00+07:00');
    const next = new Date('2026-11-01T06:00:00+07:00');

    beforeAll(async () => {
      if (!connectionString) throw new Error('Database connection required');
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
          login_identifier: 'awards_gov',
          password_hash: 'unused',
          role: 'GOVERNMENT',
          display_name: 'Test government',
        },
      });
      const seller = await db.users.create({
        data: {
          login_identifier: 'awards_seller',
          password_hash: 'unused',
          role: 'SELLER',
          display_name: 'Test seller',
        },
      });
      const customer = await db.users.create({
        data: {
          login_identifier: '0000000000000',
          password_hash: 'unused',
          role: 'CUSTOMER',
          display_name: 'Test customer',
        },
      });
      customerId = customer.user_id;
      sellerId = seller.user_id;
      const rule = await db.coin_rule_versions.create({
        data: {
          version: 1,
          created_by: government.user_id,
          effective_from: start,
          minimum_purchase: '50',
          low_sales_threshold: '10000',
          sales_window_days: 7,
          new_low_sales_coins: 10,
          new_other_coins: 5,
          repeat_coins: 1,
        },
      });
      ruleId = rule.rule_id;
      const shops = [];
      for (let i = 0; i < 3; i++)
        shops.push(
          await db.shops.create({
            data: {
              owner_id: sellerId,
              name: `Awards shop ${i}`,
              latitude: '13.75',
              longitude: '100.5',
              size_class: 'SMALL',
              participation_status: 'APPROVED',
            },
          }),
        );
      [shopId, otherShopId, noRateShopId] = shops.map((shop) => shop.shop_id);
      for (const [from, to, newCoins] of [
        [start, next, 10],
        [next, new Date(next.getTime() + 43200000), 8],
      ] as const) {
        const period = await db.coin_rate_periods.create({
          data: { starts_at: from, ends_at: to },
        });
        for (const id of [shopId, otherShopId])
          await db.shop_coin_rates.create({
            data: {
              period_id: period.period_id,
              shop_id: id,
              rule_id: ruleId,
              new_customer_coins: id === otherShopId ? 5 : newCoins,
              repeat_customer_coins: 1,
              sales_total_snapshot: id === otherShopId ? '10000' : '0',
              sales_window_starts_at: new Date(from.getTime() - 604800000),
              sales_window_ends_at: from,
            },
          });
      }
      // Regression: both ORM and raw SQL work even with an unrelated search_path.
      const scopedDb = {
        databaseSchema: schema,
        payment_requests: db.payment_requests,
        $transaction: <T>(
          callback: (tx: Prisma.TransactionClient) => Promise<T>,
          options?: { isolationLevel: Prisma.TransactionIsolationLevel },
        ) =>
          db.$transaction(
            async (tx) => {
              await tx.$executeRaw`SELECT set_config('search_path', 'pg_catalog', true)`;
              return callback(tx);
            },
            { ...options, timeout: 20000 },
          ),
      };
      service = new WalletsService(
        scopedDb as unknown as PrismaService,
        {
          me: async (token?: string) => ({
            id: (token === 'seller' ? sellerId : customerId).toString(),
            role: token === 'seller' ? 'SELLER' : 'CUSTOMER',
          }),
        } as AuthService,
      );
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(now);
      await service.topUp({ amount: '5000' }, 'test-credit', 'customer');
    }, 120000);

    afterAll(async () => {
      vi.useRealTimers();
      if (!sql) return;
      if (db) await db.$disconnect();
      if (!/^coin_awards_test_[a-f0-9]{32}$/.test(schema))
        throw new Error('Unsafe test schema');
      try {
        await sql.query('ROLLBACK');
        await sql.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      } finally {
        await sql.end();
      }
    }, 30000);

    async function request(amount = '50', targetShop = shopId) {
      return db.payment_requests.create({
        data: {
          payment_request_id: randomUUID(),
          seller_id: sellerId,
          shop_id: targetShop,
          amount,
          expires_at: new Date(Date.now() + 900000),
        },
      });
    }
    async function snapshot() {
      return {
        purchases: await db.purchases.count(),
        coins: await db.coin_entries.count(),
        money: await db.money_entries.count(),
        total: (
          await db.money_entries.aggregate({ _sum: { signed_amount: true } })
        )._sum.signed_amount?.toFixed(2),
      };
    }

    it('pays below minimum without consuming first award, and missing rate gives zero', async () => {
      for (const [amount, target, reason] of [
        ['49.99', shopId, 'BELOW_MINIMUM'],
        ['50', noRateShopId, 'NO_RATE'],
      ] as const) {
        const qr = await request(amount, target);
        expect(
          await service.pay(qr.payment_request_id, 'customer'),
        ).toMatchObject({ coins: 0, coinReason: reason });
      }
      expect(await db.coin_entries.count()).toBe(0);
    }, 60000);

    it('awards once at exact minimum, preserves rule/month/time and money breakdown', async () => {
      const qr = await request();
      expect(
        await service.paymentRequest(qr.payment_request_id, 'customer'),
      ).toMatchObject({ coins: 10, coinReason: 'NEW_CUSTOMER' });
      expect(
        await service.pay(qr.payment_request_id, 'customer'),
      ).toMatchObject({
        coins: 10,
        coinRuleVersion: 1,
        helpAmount: '30.00',
        customerAmount: '20.00',
      });
      const entry = await db.coin_entries.findFirstOrThrow({
        include: { purchases: true, monthly_periods: true },
      });
      expect(entry.awarded_at).toEqual(now);
      expect(entry.purchases.confirmed_at).toEqual(now);
      expect(entry.purchases.rule_id).toBe(ruleId);
      expect(entry.monthly_periods.month_key.toISOString()).toBe(
        '2026-10-01T00:00:00.000Z',
      );
      expect(entry.monthly_periods.budget_limit.toFixed(2)).toBe('100000.00');
      const before = await snapshot();
      await expect(
        service.pay(qr.payment_request_id, 'customer'),
      ).rejects.toThrow('QR นี้ถูกใช้แล้ว');
      expect(await snapshot()).toEqual(before);
      expect(await service.summary('customer')).toMatchObject({ coins: '10' });
      expect(await service.summary('seller')).toMatchObject({ coins: null });
    }, 60000);

    it('serializes duplicate QR attempts with only one money transfer and coin award', async () => {
      const qr = await request('50', otherShopId);
      const before = await snapshot();
      const results = await Promise.allSettled([
        service.pay(qr.payment_request_id, 'customer'),
        service.pay(qr.payment_request_id, 'customer'),
      ]);
      expect(
        results.filter((result) => result.status === 'fulfilled'),
      ).toHaveLength(1);
      const after = await snapshot();
      expect(after.purchases - before.purchases).toBe(1);
      expect(after.coins - before.coins).toBe(1);
      expect(
        await db.coin_entries.findMany({
          where: {
            purchases: {
              payment_requests: { payment_request_id: qr.payment_request_id },
            },
          },
        }),
      ).toMatchObject([{ coins: 5 }]);
    }, 60000);

    it('different simultaneous QR purchases use one first award then repeat after retry', async () => {
      const customer = await db.users.create({
        data: {
          login_identifier: '1111111111111',
          password_hash: 'unused',
          role: 'CUSTOMER',
          display_name: 'Concurrent customer',
        },
      });
      const original = customerId;
      customerId = customer.user_id;
      try {
        await service.topUp({ amount: '500' }, 'concurrent-credit', 'customer');
        const requests = await Promise.all([request(), request()]);
        const results = await Promise.allSettled(
          requests.map((qr) => service.pay(qr.payment_request_id, 'customer')),
        );
        for (const [i, result] of results.entries())
          if (result.status === 'rejected')
            await service.pay(requests[i].payment_request_id, 'customer');
        const entries = await db.coin_entries.findMany({
          where: { user_id: customerId },
          orderBy: { coins: 'desc' },
        });
        expect(entries.map((entry) => entry.coins)).toEqual([10, 1]);
        expect(await service.summary('customer')).toMatchObject({
          coins: '11',
        });
      } finally {
        customerId = original;
      }
    }, 60000);

    it('rolls back purchase/payment/money if coin insertion fails', async () => {
      await sql.query(
        `CREATE FUNCTION "${schema}".reject_coin() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'intentional award failure'; END $$`,
      );
      await sql.query(
        `CREATE TRIGGER reject_coin BEFORE INSERT ON "${schema}".coin_entries FOR EACH ROW EXECUTE FUNCTION "${schema}".reject_coin()`,
      );
      const qr = await request();
      const before = await snapshot();
      try {
        await expect(
          service.pay(qr.payment_request_id, 'customer'),
        ).rejects.toThrow();
        expect(await snapshot()).toEqual(before);
        expect(
          await db.payment_requests.findUnique({
            where: { payment_request_id: qr.payment_request_id },
          }),
        ).toMatchObject({ status: 'PENDING', purchase_id: null });
      } finally {
        await sql.query(`DROP TRIGGER reject_coin ON "${schema}".coin_entries`);
      }
    }, 60000);

    it('new Bangkok month resets displayed Coins while lifetime repeat remains, and excludes reversals', async () => {
      vi.setSystemTime(new Date('2026-11-01T00:00:00+07:00'));
      expect(await service.summary('customer')).toMatchObject({
        coins: '0',
        month: '2026-11-01',
      });
      const qr = await request();
      expect(
        await service.pay(qr.payment_request_id, 'customer'),
      ).toMatchObject({ coins: 1, coinReason: 'REPEAT_CUSTOMER' });
      expect(await service.summary('customer')).toMatchObject({ coins: '1' });
      const entry = await db.coin_entries.findFirstOrThrow({
        where: {
          purchases: {
            payment_requests: { payment_request_id: qr.payment_request_id },
          },
        },
      });
      await db.coin_entries.update({
        where: { coin_entry_id: entry.coin_entry_id },
        data: { reversed_at: new Date() },
      });
      expect(await service.summary('customer')).toMatchObject({ coins: '0' });
      const repeat = await request();
      expect(
        await service.pay(repeat.payment_request_id, 'customer'),
      ).toMatchObject({ coins: 1 });
    }, 60000);

    it('selects next frozen rate exactly at cutoff even for QR created before it', async () => {
      const customer = await db.users.create({
        data: {
          login_identifier: '2222222222222',
          password_hash: 'unused',
          role: 'CUSTOMER',
          display_name: 'Boundary customer',
        },
      });
      customerId = customer.user_id;
      await service.topUp({ amount: '100' }, 'boundary-credit', 'customer');
      vi.setSystemTime(new Date(next.getTime() - 1000));
      const qr = await request();
      expect(
        await service.paymentRequest(qr.payment_request_id, 'customer'),
      ).toMatchObject({ coins: 10 });
      await db.monthly_periods.update({
        where: { month_key: new Date('2026-11-01T00:00:00.000Z') },
        data: { budget_limit: '4321.00' },
      });
      vi.setSystemTime(next);
      expect(
        await service.pay(qr.payment_request_id, 'customer'),
      ).toMatchObject({ coins: 8 });
      expect(
        (
          await db.monthly_periods.findUniqueOrThrow({
            where: { month_key: new Date('2026-11-01T00:00:00.000Z') },
          })
        ).budget_limit.toFixed(2),
      ).toBe('4321.00');
    }, 60000);

    it('does not award for rejected role, expired/cancelled QR, suspended shop or insufficient cash', async () => {
      const denied = await request();
      await expect(
        service.pay(denied.payment_request_id, 'seller'),
      ).rejects.toThrow('เฉพาะบัญชีลูกค้า');
      for (const status of ['CANCELLED', 'EXPIRED'] as const) {
        const qr = await request();
        await db.payment_requests.update({
          where: { payment_request_id: qr.payment_request_id },
          data:
            status === 'CANCELLED'
              ? { status }
              : {
                  created_at: new Date(Date.now() - 900000),
                  expires_at: new Date(Date.now() - 1),
                },
        });
        const before = await snapshot();
        await expect(
          service.pay(qr.payment_request_id, 'customer'),
        ).rejects.toThrow();
        expect(await snapshot()).toEqual(before);
      }
      const large = await request('10000');
      const before = await snapshot();
      await expect(
        service.pay(large.payment_request_id, 'customer'),
      ).rejects.toThrow('ยอดเงินใน wallet ไม่เพียงพอ');
      expect(await snapshot()).toEqual(before);
      await db.shops.update({
        where: { shop_id: shopId },
        data: { participation_status: 'SUSPENDED' },
      });
      try {
        await expect(
          service.pay(denied.payment_request_id, 'customer'),
        ).rejects.toThrow('ร้านค้านี้ไม่ได้อยู่ในสถานะอนุมัติ');
        expect(await snapshot()).toEqual(before);
      } finally {
        await db.shops.update({
          where: { shop_id: shopId },
          data: { participation_status: 'APPROVED' },
        });
      }
    }, 60000);
    it('grants once, spends reward and expires without carrying into the next month', async () => {
      vi.setSystemTime(next);
      await service.topUp({ amount: '5000' }, 'quest-credit', 'customer');
      const period = await db.monthly_periods.findUniqueOrThrow({
        where: { month_key: new Date('2026-11-01T00:00:00Z') },
      });
      const current = await service.mainQuest(undefined, 'customer');
      let needed = 99 - Number(current.coins);
      while (needed > 0) {
        const coins = Math.min(10, needed);
        const purchase = await db.purchases.create({
          data: {
            customer_id: customerId,
            shop_id: shopId,
            rule_id: ruleId,
            total_amount: '50',
            customer_paid: '50',
            status: 'SUCCEEDED',
            confirmed_at: next,
            shop_size_snapshot: 'SMALL',
            idempotency_key: randomUUID(),
          },
        });
        await db.coin_entries.create({
          data: {
            user_id: customerId,
            period_id: period.period_id,
            purchase_id: purchase.purchase_id,
            rule_id: ruleId,
            coins,
            awarded_at: next,
          },
        });
        needed -= coins;
      }
      await db.monthly_periods.update({
        where: { period_id: period.period_id },
        data: { status: 'OPEN', budget_limit: '0' },
      });
      const threshold = await request();
      await db.monthly_periods.update({
        where: { period_id: period.period_id },
        data: { budget_limit: '100' },
      });
      await sql.query(
        `CREATE FUNCTION "${schema}".reject_reward() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.entry_type = 'REWARD_ALLOCATION' THEN RAISE EXCEPTION 'intentional reward failure'; END IF; RETURN NEW; END $$`,
      );
      await sql.query(
        `CREATE TRIGGER reject_reward BEFORE INSERT ON "${schema}".money_entries FOR EACH ROW EXECUTE FUNCTION "${schema}".reject_reward()`,
      );
      const beforeGrant = await snapshot();
      try {
        await expect(
          service.pay(threshold.payment_request_id, 'customer'),
        ).rejects.toThrow();
        expect(await snapshot()).toEqual(beforeGrant);
        expect(await db.reward_grants.count()).toBe(0);
        expect(
          (
            await db.payment_requests.findUniqueOrThrow({
              where: { payment_request_id: threshold.payment_request_id },
            })
          ).status,
        ).toBe('PENDING');
      } finally {
        await sql.query(
          `DROP TRIGGER reject_reward ON "${schema}".money_entries`,
        );
      }
      await db.monthly_periods.update({
        where: { period_id: period.period_id },
        data: { budget_limit: '0' },
      });
      expect(
        await service.pay(threshold.payment_request_id, 'customer'),
      ).toMatchObject({ rewardAmount: '0.00' });
      expect(await service.claimQuest('customer')).toMatchObject({
        status: 'WAITING_BUDGET',
        reward: null,
      });
      await db.monthly_periods.update({
        where: { period_id: period.period_id },
        data: { budget_limit: '100' },
      });
      const earning = await request();
      expect(
        await service.pay(earning.payment_request_id, 'customer'),
      ).toMatchObject({ rewardAmount: '0.00' });
      const claims = await Promise.allSettled([
        service.claimQuest('customer'),
        service.claimQuest('customer'),
      ]);
      expect(claims.some((result) => result.status === 'fulfilled')).toBe(true);
      expect(await service.claimQuest('customer')).toMatchObject({
        status: 'AVAILABLE',
        reward: { amount: '100.00', available: '100.00' },
      });
      expect(
        await db.reward_grants.count({
          where: { user_id: customerId, period_id: period.period_id },
        }),
      ).toBe(1);
      const payment = await request();
      expect(
        await service.paymentRequest(payment.payment_request_id, 'customer'),
      ).toMatchObject({ rewardAmount: '20.00', customerAmount: '0.00' });
      expect(
        await service.pay(payment.payment_request_id, 'customer'),
      ).toMatchObject({ rewardAmount: '20.00', customerAmount: '0.00' });
      expect(await service.mainQuest(undefined, 'customer')).toMatchObject({
        reward: { used: '20.00', available: '80.00' },
      });
      const before = await snapshot();
      await expect(
        service.pay(payment.payment_request_id, 'customer'),
      ).rejects.toThrow();
      expect(await snapshot()).toEqual(before);
      await expect(service.mainQuest('2020-01', 'customer')).rejects.toThrow();
      await expect(service.claimQuest('seller')).rejects.toThrow();
      vi.setSystemTime(new Date('2026-12-01T00:00:00+07:00'));
      expect(await service.mainQuest('2026-11', 'customer')).toMatchObject({
        status: 'EXPIRED',
        reward: { used: '20.00', available: '0.00', expired: '80.00' },
      });
      expect(await service.mainQuest(undefined, 'customer')).toMatchObject({
        coins: '0',
        reward: null,
      });
    }, 120000);
    it('does not oversubscribe the last reward when eligible customers claim concurrently', async () => {
      vi.setSystemTime(next);
      const period = await db.monthly_periods.update({
        where: { month_key: new Date('2026-11-01T00:00:00Z') },
        data: { budget_limit: '200' },
      });
      const contenders: bigint[] = [];
      for (let i = 0; i < 2; i++) {
        const user = await db.users.create({
          data: {
            login_identifier: `quest-contender-${i}`,
            password_hash: 'unused',
            role: 'CUSTOMER',
            display_name: 'Quest test',
          },
        });
        contenders.push(user.user_id);
        for (let j = 0; j < 10; j++) {
          const purchase = await db.purchases.create({
            data: {
              customer_id: user.user_id,
              shop_id: shopId,
              rule_id: ruleId,
              total_amount: '50',
              customer_paid: '50',
              status: 'SUCCEEDED',
              confirmed_at: next,
              shop_size_snapshot: 'SMALL',
              idempotency_key: randomUUID(),
            },
          });
          await db.coin_entries.create({
            data: {
              user_id: user.user_id,
              period_id: period.period_id,
              purchase_id: purchase.purchase_id,
              rule_id: ruleId,
              coins: 10,
              awarded_at: next,
            },
          });
        }
      }
      const claim = (userId: bigint) =>
        db.$transaction((tx) => ensureQuestGrant(tx, userId, next, schema), {
          isolationLevel: 'Serializable',
          timeout: 20000,
        });
      await Promise.allSettled(contenders.map(claim));
      for (const userId of contenders) await claim(userId);
      expect(
        await db.reward_grants.count({
          where: { user_id: { in: contenders } },
        }),
      ).toBe(1);
      expect(
        (
          await db.reward_grants.aggregate({
            where: { period_id: period.period_id },
            _sum: { amount: true },
          })
        )._sum.amount?.toFixed(2),
      ).toBe('200.00');
    }, 120000);
  },
);

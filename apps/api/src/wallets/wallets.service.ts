import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { AuthService } from '../auth/auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { sqlTable } from '../prisma/sql-table.js';
import {
  availableQuestReward,
  ensureQuestGrant,
  readMainQuest,
} from './main-quest.js';
import {
  currentMonthCoins,
  quotePurchaseCoins,
  readSellerCoinRates,
} from './purchase-coins.js';

const HELP_MONTHLY_CENTS = 100_000;
const HELP_DAILY_CENTS = 20_000;
export const MAIN_QUEST_DEFAULT_MONTHLY_BUDGET = '100000.00';
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function amountToCents(value: unknown) {
  if (
    typeof value !== 'string' ||
    !/^(?:0|[1-9]\d{0,11})(?:\.\d{1,2})?$/.test(value)
  )
    throw new BadRequestException(
      'จำนวนเงินต้องมากกว่า 0 และมีทศนิยมไม่เกิน 2 ตำแหน่ง',
    );
  const [whole, fraction = ''] = value.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(cents) || cents <= 0)
    throw new BadRequestException('จำนวนเงินต้องมากกว่า 0');
  return cents;
}
const money = (cents: number) => (cents / 100).toFixed(2);
export function bangkokMonth(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(now);
  const value = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return `${value.year}-${value.month}-01`;
}

export function bangkokMonthRange(now = new Date()) {
  const month = bangkokMonth(now);
  const [year, monthNumber] = month.split('-').map(Number);
  const nextYear = monthNumber === 12 ? year + 1 : year;
  const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
  const nextMonthKey = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
  return {
    month,
    startsAt: new Date(`${month}T00:00:00+07:00`),
    endsAt: new Date(`${nextMonthKey}T00:00:00+07:00`),
  };
}

export async function ensureBangkokMonthlyPeriod(
  tx: Prisma.TransactionClient,
  now: Date,
) {
  const range = bangkokMonthRange(now);
  return tx.monthly_periods.upsert({
    where: { month_key: new Date(`${range.month}T00:00:00Z`) },
    create: {
      month_key: new Date(`${range.month}T00:00:00Z`),
      starts_at: range.startsAt,
      ends_at: range.endsAt,
      budget_limit: MAIN_QUEST_DEFAULT_MONTHLY_BUDGET,
      status: 'DRAFT',
    },
    update: {},
  });
}

export function bangkokDayRange(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const value = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  const day = `${value.year}-${value.month}-${value.day}`;
  const startsAt = new Date(`${day}T00:00:00+07:00`);
  return {
    day,
    startsAt,
    endsAt: new Date(startsAt.getTime() + 24 * 60 * 60 * 1000),
  };
}

export function paymentBreakdown(total: number, availableHelp: number) {
  const targetHelp = Math.floor((total * 60 + 50) / 100);
  const help = Math.min(targetHelp, Math.max(0, availableHelp));
  return { targetHelp, help, cash: total - help };
}

export function paymentWithReward(
  total: number,
  availableHelp: number,
  availableReward: number,
) {
  const base = paymentBreakdown(total, availableHelp);
  const reward = Math.min(base.cash, Math.max(0, availableReward));
  return { ...base, reward, cash: base.cash - reward };
}

function isSerializationFailure(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  const meta = error.meta as
    { driverAdapterError?: { cause?: { originalCode?: string } } } | undefined;
  return (
    error.code === 'P2034' ||
    error.code === 'P2002' ||
    (error.code === 'P2010' &&
      ['40001', '40P01'].includes(
        meta?.driverAdapterError?.cause?.originalCode ?? '',
      ))
  );
}

@Injectable()
export class WalletsService {
  private readonly databaseSchema: string;
  private readonly testActionsEnabled: boolean;
  constructor(
    private readonly db: PrismaService,
    private readonly auth: AuthService,
  ) {
    this.databaseSchema = db.databaseSchema ?? 'public';
    this.testActionsEnabled =
      process.env.NODE_ENV !== 'production' &&
      process.env.ENABLE_TEST_WALLET_ACTIONS === 'true';
  }

  private async user(authorization?: string) {
    return this.auth.me(authorization);
  }

  async mainQuest(month: unknown, authorization?: string) {
    const user = await this.user(authorization);
    if (user.role !== 'CUSTOMER')
      throw new ForbiddenException('เฉพาะบัญชีลูกค้า');
    return this.db.$transaction((tx) =>
      readMainQuest(tx, BigInt(user.id), month, new Date()),
    );
  }

  async claimQuest(authorization?: string) {
    const user = await this.user(authorization);
    if (user.role !== 'CUSTOMER')
      throw new ForbiddenException('เฉพาะบัญชีลูกค้า');
    try {
      return await this.db.$transaction(
        async (tx) => {
          const userId = BigInt(user.id);
          await tx.$queryRaw`SELECT user_id FROM ${sqlTable('users', this.databaseSchema)} WHERE user_id=${userId} FOR UPDATE`;
          const now = new Date();
          await ensureQuestGrant(tx, userId, now, this.databaseSchema);
          return readMainQuest(tx, userId, undefined, now);
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (isSerializationFailure(error))
        throw new ConflictException('รายการชนกัน กรุณาตรวจสิทธิ์อีกครั้ง');
      throw error;
    }
  }

  private async ensureWallets(
    tx: Prisma.TransactionClient,
    user: { id: string; role: string },
  ) {
    const userId = BigInt(user.id);
    const cash = await tx.wallets.upsert({
      where: { user_id_wallet_type: { user_id: userId, wallet_type: 'CASH' } },
      create: { user_id: userId, user_role: user.role, wallet_type: 'CASH' },
      update: {},
    });
    if (user.role !== 'CUSTOMER') return { cash, base: null };
    const base = await tx.wallets.upsert({
      where: { user_id_wallet_type: { user_id: userId, wallet_type: 'BASE' } },
      create: { user_id: userId, user_role: 'CUSTOMER', wallet_type: 'BASE' },
      update: {},
    });
    const month = bangkokMonth();
    await tx.money_entries.upsert({
      where: { idempotency_key: `help:${user.id}:${month}` },
      create: {
        idempotency_key: `help:${user.id}:${month}`,
        wallet_id: base.wallet_id,
        user_id: userId,
        wallet_type: 'BASE',
        signed_amount: '1000.00',
        entry_type: 'BASE_ALLOCATION',
      },
      update: {},
    });
    return { cash, base };
  }

  private async balance(
    tx: Prisma.TransactionClient,
    walletId: bigint,
    range?: { startsAt: Date; endsAt: Date },
  ) {
    if (range) {
      const rows = await tx.$queryRaw<{ cents: bigint }[]>`
        SELECT COALESCE(ROUND(SUM(signed_amount) * 100), 0)::bigint AS cents
        FROM ${sqlTable('money_entries', this.databaseSchema)}
        WHERE wallet_id = ${walletId}
          AND created_at >= ${range.startsAt}
          AND created_at < ${range.endsAt}`;
      return Number(rows[0]?.cents ?? 0n);
    }
    const rows = await tx.$queryRaw<{ cents: bigint }[]>`
      SELECT COALESCE(ROUND(SUM(signed_amount) * 100), 0)::bigint AS cents
      FROM ${sqlTable('money_entries', this.databaseSchema)} WHERE wallet_id = ${walletId}`;
    return Number(rows[0]?.cents ?? 0n);
  }

  private currentHelpBalance(tx: Prisma.TransactionClient, walletId: bigint) {
    return this.balance(tx, walletId, bangkokMonthRange());
  }

  private async currentDailyHelpRemaining(
    tx: Prisma.TransactionClient,
    walletId: bigint,
  ) {
    const range = bangkokDayRange();
    const rows = await tx.$queryRaw<{ cents: bigint }[]>`
      SELECT COALESCE(ROUND(-SUM(signed_amount) * 100), 0)::bigint AS cents
      FROM ${sqlTable('money_entries', this.databaseSchema)}
      WHERE wallet_id = ${walletId}
        AND wallet_type = 'BASE'
        AND entry_type = 'PAYMENT_DEBIT'
        AND created_at >= ${range.startsAt}
        AND created_at < ${range.endsAt}
        AND entry_id > COALESCE((
          SELECT MAX(entry_id)
          FROM ${sqlTable('money_entries', this.databaseSchema)}
          WHERE wallet_id = ${walletId}
            AND idempotency_key LIKE 'help-daily-reset:%'
            AND created_at >= ${range.startsAt}
            AND created_at < ${range.endsAt}
        ), 0)`;
    const used = Number(rows[0]?.cents ?? 0n);
    return Math.max(0, HELP_DAILY_CENTS - used);
  }

  async summary(authorization?: string) {
    const user = await this.user(authorization);
    if (!['CUSTOMER', 'SELLER'].includes(user.role))
      throw new ForbiddenException('บัญชีนี้ไม่มีกระเป๋าเงิน');
    return this.db.$transaction(async (tx) => {
      const wallets = await this.ensureWallets(tx, user);
      const monthlyHelp = wallets.base
        ? await this.currentHelpBalance(tx, wallets.base.wallet_id)
        : null;
      const dailyHelp = wallets.base
        ? Math.min(
            monthlyHelp ?? 0,
            await this.currentDailyHelpRemaining(tx, wallets.base.wallet_id),
          )
        : null;
      const questReward = wallets.base
        ? await availableQuestReward(tx, BigInt(user.id), new Date())
        : null;
      const questRewardAvailable = wallets.base
        ? (questReward?.available ?? new Prisma.Decimal(0))
        : null;
      return {
        role: user.role,
        balance: money(await this.balance(tx, wallets.cash.wallet_id)),
        help: monthlyHelp === null ? null : money(monthlyHelp),
        questRewardAvailable: questRewardAvailable?.toFixed(2) ?? null,
        helpMonthlyTotal:
          monthlyHelp === null
            ? null
            : new Prisma.Decimal(money(monthlyHelp))
                .plus(questRewardAvailable ?? 0)
                .toFixed(2),
        helpDailyRemaining: dailyHelp === null ? null : money(dailyHelp),
        helpDailyLimit: user.role === 'CUSTOMER' ? '200.00' : null,
        helpMonthlyLimit: user.role === 'CUSTOMER' ? '1000.00' : null,
        month: bangkokMonth(),
        coins:
          user.role === 'CUSTOMER'
            ? await currentMonthCoins(tx, BigInt(user.id), bangkokMonth())
            : null,
        testActionsEnabled: this.testActionsEnabled,
        shopCoinRates:
          user.role === 'SELLER'
            ? await readSellerCoinRates(tx, BigInt(user.id), new Date())
            : [],
      };
    });
  }

  async topUp(body: unknown, idempotencyKey?: string, authorization?: string) {
    const user = await this.user(authorization);
    if (user.role !== 'CUSTOMER')
      throw new ForbiddenException('เฉพาะบัญชีลูกค้า');
    const cents = amountToCents((body as { amount?: unknown })?.amount);
    if (
      !idempotencyKey ||
      idempotencyKey.length > 128 ||
      !/^[A-Za-z0-9._:-]+$/.test(idempotencyKey)
    )
      throw new BadRequestException('Idempotency-Key ไม่ถูกต้อง');
    await this.db.$transaction(async (tx) => {
      const { cash } = await this.ensureWallets(tx, user);
      await tx.money_entries.upsert({
        where: { idempotency_key: `topup:${user.id}:${idempotencyKey}` },
        create: {
          idempotency_key: `topup:${user.id}:${idempotencyKey}`,
          wallet_id: cash.wallet_id,
          user_id: BigInt(user.id),
          wallet_type: 'CASH',
          signed_amount: money(cents),
          entry_type: 'TOPUP',
        },
        update: {},
      });
    });
    return this.summary(authorization);
  }

  async resetHelp(authorization?: string) {
    if (!this.testActionsEnabled)
      throw new ForbiddenException('ปิดการรีเซ็ตวงเงินทดสอบ');
    const user = await this.user(authorization);
    if (user.role !== 'CUSTOMER')
      throw new ForbiddenException('เฉพาะบัญชีลูกค้า');
    await this.db.$transaction(async (tx) => {
      const { base } = await this.ensureWallets(tx, user);
      if (!base) return;
      const current = await this.currentHelpBalance(tx, base.wallet_id);
      if (current !== HELP_MONTHLY_CENTS)
        await tx.money_entries.create({
          data: {
            idempotency_key: `help-reset:${randomUUID()}`,
            wallet_id: base.wallet_id,
            user_id: BigInt(user.id),
            wallet_type: 'BASE',
            signed_amount: money(HELP_MONTHLY_CENTS - current),
            entry_type:
              current < HELP_MONTHLY_CENTS ? 'BASE_ALLOCATION' : 'EXPIRY',
          },
        });
    });
    return this.summary(authorization);
  }

  async resetDailyHelp(authorization?: string) {
    if (!this.testActionsEnabled)
      throw new ForbiddenException('ปิดการรีเซ็ตวงเงินทดสอบ');
    const user = await this.user(authorization);
    if (user.role !== 'CUSTOMER')
      throw new ForbiddenException('เฉพาะบัญชีลูกค้า');
    await this.db.$transaction(async (tx) => {
      const { base } = await this.ensureWallets(tx, user);
      if (!base) return;
      await tx.$queryRaw`SELECT wallet_id FROM ${sqlTable('wallets', this.databaseSchema)} WHERE wallet_id = ${base.wallet_id} FOR UPDATE`;
      const resetId = randomUUID();
      await tx.money_entries.createMany({
        data: [
          {
            idempotency_key: `help-daily-reset:${resetId}`,
            wallet_id: base.wallet_id,
            user_id: BigInt(user.id),
            wallet_type: 'BASE',
            signed_amount: '0.01',
            entry_type: 'BASE_ALLOCATION',
          },
          {
            idempotency_key: `help-daily-reset-offset:${resetId}`,
            wallet_id: base.wallet_id,
            user_id: BigInt(user.id),
            wallet_type: 'BASE',
            signed_amount: '-0.01',
            entry_type: 'EXPIRY',
          },
        ],
      });
    });
    return this.summary(authorization);
  }

  async history(authorization?: string) {
    const user = await this.user(authorization);
    if (!['CUSTOMER', 'SELLER'].includes(user.role))
      throw new ForbiddenException('บัญชีนี้ไม่มีกระเป๋าเงิน');
    return this.db.$transaction(async (tx) => {
      await this.ensureWallets(tx, user);
      const entries = await tx.money_entries.findMany({
        where: { user_id: BigInt(user.id) },
        include: {
          payment_requests: {
            include: {
              shop: { select: { name: true } },
              seller: { select: { display_name: true } },
              purchase: {
                include: {
                  coin_entries: {
                    select: { coins: true, reversed_at: true },
                  },
                },
              },
            },
          },
        },
        orderBy: [{ created_at: 'desc' }, { entry_id: 'desc' }],
        take: 100,
      });
      const history: Array<{
        id: string;
        type: string;
        walletType: string;
        amount: string;
        createdAt: string;
        paymentRequestId: string | null;
        shopName: string | null;
        helpAmount?: string;
        customerAmount?: string;
        rewardAmount?: string;
        coinsEarned?: number;
      }> = [];
      const payments = new Map<
        string,
        {
          id: string;
          type: string;
          walletType: string;
          amountCents: number;
          createdAt: string;
          paymentRequestId: string;
          shopName: string;
          helpCents: number;
          customerCents: number;
          rewardCents: number;
          coinsEarned: number;
        }
      >();
      for (const entry of entries) {
        const amountCents = Number(entry.signed_amount.mul(100).toFixed(0));
        if (!entry.payment_request_id || !entry.payment_requests) {
          history.push({
            id: entry.entry_id.toString(),
            type: entry.entry_type,
            walletType: entry.wallet_type,
            amount: money(amountCents),
            createdAt: entry.created_at.toISOString(),
            paymentRequestId: null,
            shopName: null,
          });
          continue;
        }
        const existing = payments.get(entry.payment_request_id) ?? {
          id: `payment:${entry.payment_request_id}`,
          type: 'PAYMENT',
          walletType: entry.wallet_type,
          amountCents: 0,
          createdAt: entry.created_at.toISOString(),
          paymentRequestId: entry.payment_request_id,
          shopName:
            entry.payment_requests.shop?.name ??
            entry.payment_requests.seller.display_name,
          helpCents: 0,
          customerCents: 0,
          rewardCents: 0,
          coinsEarned:
            user.role === 'CUSTOMER' &&
            entry.payment_requests.purchase?.coin_entries?.reversed_at === null
              ? entry.payment_requests.purchase.coin_entries.coins
              : 0,
        };
        existing.amountCents += amountCents;
        if (entry.wallet_type === 'REWARD' && amountCents < 0)
          existing.rewardCents += Math.abs(amountCents);
        if (entry.wallet_type === 'BASE')
          existing.helpCents += Math.abs(amountCents);
        if (entry.wallet_type === 'CASH' && amountCents < 0)
          existing.customerCents += Math.abs(amountCents);
        payments.set(entry.payment_request_id, existing);
      }
      history.push(
        ...Array.from(payments.values()).map((entry) => ({
          id: entry.id,
          type: entry.type,
          walletType: entry.walletType,
          amount: money(entry.amountCents),
          createdAt: entry.createdAt,
          paymentRequestId: entry.paymentRequestId,
          shopName: entry.shopName,
          ...(entry.helpCents > 0
            ? { helpAmount: money(entry.helpCents) }
            : {}),
          ...(entry.rewardCents > 0
            ? { rewardAmount: money(entry.rewardCents) }
            : {}),
          ...(entry.customerCents > 0
            ? { customerAmount: money(entry.customerCents) }
            : {}),
          ...(entry.coinsEarned > 0 ? { coinsEarned: entry.coinsEarned } : {}),
        })),
      );
      return history.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    });
  }

  async createPaymentRequest(body: unknown, authorization?: string) {
    const user = await this.user(authorization);
    if (user.role !== 'SELLER')
      throw new ForbiddenException('เฉพาะบัญชีร้านค้า');
    const cents = amountToCents((body as { amount?: unknown })?.amount);
    const shop = await this.db.shops.findFirst({
      where: {
        owner_id: BigInt(user.id),
        participation_status: 'APPROVED',
      },
      orderBy: { shop_id: 'asc' },
    });
    if (!shop)
      throw new NotFoundException(
        'บัญชีร้านค้ายังไม่มีร้านที่อนุมัติแล้วสำหรับรับชำระเงิน',
      );
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const request = await this.db.payment_requests.create({
      data: {
        payment_request_id: randomUUID(),
        seller_id: BigInt(user.id),
        shop_id: shop.shop_id,
        amount: money(cents),
        expires_at: expiresAt,
      },
    });
    return {
      id: request.payment_request_id,
      amount: request.amount.toFixed(2),
      shopName: shop.name,
      status: request.status,
      scanPayload: request.payment_request_id,
      expiresAt: request.expires_at.toISOString(),
    };
  }

  async sellerPaymentRequests(authorization?: string) {
    const user = await this.user(authorization);
    if (user.role !== 'SELLER')
      throw new ForbiddenException('เฉพาะบัญชีร้านค้า');
    const now = new Date();
    const requests = await this.db.payment_requests.findMany({
      where: { seller_id: BigInt(user.id) },
      include: { shop: { select: { name: true } } },
      orderBy: [{ created_at: 'desc' }],
      take: 50,
    });
    return requests.map((request) => ({
      id: request.payment_request_id,
      amount: request.amount.toFixed(2),
      shopName: request.shop?.name ?? user.displayName,
      status:
        request.status === 'PENDING' && request.expires_at <= now
          ? 'EXPIRED'
          : request.status,
      createdAt: request.created_at.toISOString(),
      expiresAt: request.expires_at.toISOString(),
      paidAt: request.paid_at?.toISOString() ?? null,
      purchaseId: request.purchase_id?.toString() ?? null,
    }));
  }

  async cancelPaymentRequest(id: string, authorization?: string) {
    const user = await this.user(authorization);
    if (user.role !== 'SELLER')
      throw new ForbiddenException('เฉพาะบัญชีร้านค้า');
    if (!uuid.test(id)) throw new BadRequestException('QR ไม่ถูกต้อง');
    const result = await this.db.payment_requests.updateMany({
      where: {
        payment_request_id: id,
        seller_id: BigInt(user.id),
        status: 'PENDING',
        expires_at: { gt: new Date() },
      },
      data: { status: 'CANCELLED' },
    });
    if (result.count === 0)
      throw new ConflictException('QR นี้ยกเลิกไม่ได้หรือสิ้นสุดแล้ว');
    return { id, status: 'CANCELLED' };
  }

  async paymentRequest(id: string, authorization?: string) {
    const user = await this.user(authorization);
    if (user.role !== 'CUSTOMER')
      throw new ForbiddenException('เฉพาะบัญชีลูกค้า');
    if (!uuid.test(id)) throw new BadRequestException('QR ไม่ถูกต้อง');
    const request = await this.db.payment_requests.findUnique({
      where: { payment_request_id: id },
      include: {
        shop: { select: { name: true } },
        seller: { select: { display_name: true } },
      },
    });
    if (!request) throw new NotFoundException('ไม่พบ QR รับเงิน');
    const status =
      request.status === 'PENDING' && request.expires_at <= new Date()
        ? 'EXPIRED'
        : request.status;
    return this.db.$transaction(async (tx) => {
      const wallets = await this.ensureWallets(tx, user);
      if (!wallets.base) throw new ConflictException('ไม่พบสิทธิช่วยจ่าย');
      const total = Number(request.amount.mul(100).toFixed(0));
      const availableHelp = await this.currentHelpBalance(
        tx,
        wallets.base.wallet_id,
      );
      const dailyHelp = await this.currentDailyHelpRemaining(
        tx,
        wallets.base.wallet_id,
      );
      const availableCash = await this.balance(tx, wallets.cash.wallet_id);
      const reward = await availableQuestReward(
        tx,
        BigInt(user.id),
        new Date(),
      );
      const breakdown = paymentWithReward(
        total,
        Math.min(availableHelp, dailyHelp),
        Number(reward?.available.mul(100).toFixed(0) ?? 0),
      );
      const coinQuote = request.shop_id
        ? await quotePurchaseCoins(
            tx,
            BigInt(user.id),
            request.shop_id,
            request.amount,
            new Date(),
            this.databaseSchema,
          )
        : { coins: 0, coinReason: 'NO_RATE', coinRuleVersion: null };
      return {
        id,
        status,
        shopName: request.shop?.name ?? request.seller.display_name,
        amount: money(total),
        targetHelpAmount: money(breakdown.targetHelp),
        helpAmount: money(breakdown.help),
        customerAmount: money(breakdown.cash),
        rewardAmount: money(breakdown.reward),
        canPay: availableCash >= breakdown.cash,
        coins: coinQuote.coins,
        coinReason: coinQuote.coinReason,
        coinRuleVersion: coinQuote.coinRuleVersion,
      };
    });
  }

  async pay(id: string, authorization?: string) {
    const user = await this.user(authorization);
    if (user.role !== 'CUSTOMER')
      throw new ForbiddenException('เฉพาะบัญชีลูกค้า');
    if (!uuid.test(id)) throw new BadRequestException('QR ไม่ถูกต้อง');
    try {
      return await this.db.$transaction(
        async (tx) => {
          await tx.$queryRaw`SELECT payment_request_id FROM ${sqlTable('payment_requests', this.databaseSchema)} WHERE payment_request_id = ${id}::uuid FOR UPDATE`;
          const request = await tx.payment_requests.findUnique({
            where: { payment_request_id: id },
          });
          if (!request) throw new NotFoundException('ไม่พบ QR รับเงิน');
          if (request.status !== 'PENDING')
            throw new ConflictException('QR นี้ถูกใช้แล้ว');
          if (request.expires_at <= new Date())
            throw new ConflictException('QR นี้หมดอายุแล้ว');
          if (!request.shop_id)
            throw new ConflictException('QR นี้ไม่ได้ผูกกับร้านค้า');
          await tx.$queryRaw`SELECT user_id FROM ${sqlTable('users', this.databaseSchema)} WHERE user_id=${BigInt(user.id)} FOR UPDATE`;
          const customerWallets = await this.ensureWallets(tx, user);
          const seller = { id: request.seller_id.toString(), role: 'SELLER' };
          const sellerWallets = await this.ensureWallets(tx, seller);
          if (!customerWallets.base)
            throw new ConflictException('ไม่พบสิทธิช่วยจ่าย');
          await tx.$queryRaw`SELECT wallet_id FROM ${sqlTable('wallets', this.databaseSchema)} WHERE wallet_id IN (${customerWallets.cash.wallet_id}, ${customerWallets.base.wallet_id}, ${sellerWallets.cash.wallet_id}) ORDER BY wallet_id FOR UPDATE`;
          const total = Number(request.amount.mul(100).toFixed(0));
          const availableHelp = await this.currentHelpBalance(
            tx,
            customerWallets.base.wallet_id,
          );
          const dailyHelp = await this.currentDailyHelpRemaining(
            tx,
            customerWallets.base.wallet_id,
          );
          const now = new Date();
          const rewardState = await availableQuestReward(
            tx,
            BigInt(user.id),
            now,
          );
          const { help, cash, reward } = paymentWithReward(
            total,
            Math.min(availableHelp, dailyHelp),
            Number(rewardState?.available.mul(100).toFixed(0) ?? 0),
          );
          if ((await this.balance(tx, customerWallets.cash.wallet_id)) < cash)
            throw new ConflictException('ยอดเงินใน wallet ไม่เพียงพอ');
          const shop = await tx.shops.findUniqueOrThrow({
            where: { shop_id: request.shop_id },
            select: {
              shop_id: true,
              size_class: true,
              participation_status: true,
            },
          });
          if (shop.participation_status !== 'APPROVED')
            throw new ConflictException('ร้านค้านี้ไม่ได้อยู่ในสถานะอนุมัติ');
          const coinQuote = await quotePurchaseCoins(
            tx,
            BigInt(user.id),
            shop.shop_id,
            request.amount,
            now,
            this.databaseSchema,
          );
          const purchase = await tx.purchases.create({
            data: {
              customer_id: BigInt(user.id),
              shop_id: shop.shop_id,
              rule_id: coinQuote.ruleId,
              total_amount: money(total),
              customer_paid: money(cash),
              base_subsidy_used: money(help),
              reward_subsidy_used: money(reward),
              status: 'SUCCEEDED',
              created_at: now,
              confirmed_at: now,
              shop_area_snapshot: null,
              shop_size_snapshot: shop.size_class,
              idempotency_key: `payment:${id}`,
            },
          });
          if (coinQuote.coins > 0 && coinQuote.ruleId !== null) {
            const period = await ensureBangkokMonthlyPeriod(tx, now);
            await tx.coin_entries.create({
              data: {
                user_id: BigInt(user.id),
                period_id: period.period_id,
                purchase_id: purchase.purchase_id,
                rule_id: coinQuote.ruleId,
                coins: coinQuote.coins,
                awarded_at: now,
              },
            });
          }
          await tx.money_entries.createMany({
            data: [
              ...(help > 0
                ? [
                    {
                      idempotency_key: `pay:${id}:help`,
                      wallet_id: customerWallets.base.wallet_id,
                      user_id: BigInt(user.id),
                      wallet_type: 'BASE' as const,
                      signed_amount: money(-help),
                      entry_type: 'PAYMENT_DEBIT' as const,
                      payment_request_id: id,
                    },
                  ]
                : []),
              ...(cash > 0
                ? [
                    {
                      idempotency_key: `pay:${id}:cash`,
                      wallet_id: customerWallets.cash.wallet_id,
                      user_id: BigInt(user.id),
                      wallet_type: 'CASH',
                      signed_amount: money(-cash),
                      entry_type: 'PAYMENT_DEBIT',
                      payment_request_id: id,
                    },
                  ]
                : []),
              ...(reward > 0 && rewardState
                ? [
                    {
                      idempotency_key: `pay:${id}:reward`,
                      wallet_id: (
                        await tx.wallets.findUniqueOrThrow({
                          where: {
                            user_id_wallet_type: {
                              user_id: BigInt(user.id),
                              wallet_type: 'REWARD',
                            },
                          },
                        })
                      ).wallet_id,
                      user_id: BigInt(user.id),
                      wallet_type: 'REWARD',
                      grant_id: rewardState.grant.grant_id,
                      purchase_id: purchase.purchase_id,
                      payment_request_id: id,
                      signed_amount: money(-reward),
                      entry_type: 'PURCHASE',
                      created_at: now,
                    },
                  ]
                : []),
              {
                idempotency_key: `pay:${id}:seller`,
                wallet_id: sellerWallets.cash.wallet_id,
                user_id: request.seller_id,
                wallet_type: 'CASH',
                signed_amount: money(total),
                entry_type: 'PAYMENT_CREDIT',
                payment_request_id: id,
              },
            ],
          });
          await ensureQuestGrant(tx, BigInt(user.id), now, this.databaseSchema);
          await tx.payment_requests.update({
            where: { payment_request_id: id },
            data: {
              status: 'PAID',
              customer_id: BigInt(user.id),
              paid_at: new Date(),
              purchase_id: purchase.purchase_id,
            },
          });
          return {
            id,
            status: 'PAID',
            amount: money(total),
            helpAmount: money(help),
            customerAmount: money(cash),
            rewardAmount: money(reward),
            purchaseId: purchase.purchase_id.toString(),
            coins: coinQuote.coins,
            coinReason: coinQuote.coinReason,
            coinRuleVersion: coinQuote.coinRuleVersion,
          };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (isSerializationFailure(error)) {
        const request = await this.db.payment_requests.findUnique({
          where: { payment_request_id: id },
          select: { status: true },
        });
        if (request?.status !== 'PENDING')
          throw new ConflictException('QR นี้ถูกใช้แล้ว');
        throw new ConflictException('รายการชนกัน กรุณาลองอีกครั้ง');
      }
      throw error;
    }
  }
}

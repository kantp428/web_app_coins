import {
  BadRequestException,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  Header,
  Headers,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  Param,
  Post,
  Body,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { randomUUID } from 'node:crypto';
import { AuthService } from '../auth/auth.service.js';

const HELP_MONTHLY_CENTS = 100_000;
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function amountToCents(value: unknown) {
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
function bangkokMonth(now = new Date()) {
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

@Injectable()
export class WalletsService implements OnModuleDestroy {
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

  private async user(authorization?: string) {
    return this.auth.me(authorization);
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

  private async balance(tx: Prisma.TransactionClient, walletId: bigint) {
    const rows = await tx.$queryRaw<{ cents: bigint }[]>`
      SELECT COALESCE(ROUND(SUM(signed_amount) * 100), 0)::bigint AS cents
      FROM money_entries WHERE wallet_id = ${walletId}`;
    return Number(rows[0]?.cents ?? 0n);
  }

  async summary(authorization?: string) {
    const user = await this.user(authorization);
    if (!['CUSTOMER', 'SELLER'].includes(user.role))
      throw new ForbiddenException('บัญชีนี้ไม่มีกระเป๋าเงิน');
    return this.db.$transaction(async (tx) => {
      const wallets = await this.ensureWallets(tx, user);
      return {
        role: user.role,
        balance: money(await this.balance(tx, wallets.cash.wallet_id)),
        help: wallets.base
          ? money(await this.balance(tx, wallets.base.wallet_id))
          : null,
        helpMonthlyLimit: user.role === 'CUSTOMER' ? '1000.00' : null,
        month: bangkokMonth(),
      };
    });
  }

  async topUp(body: unknown, authorization?: string) {
    const user = await this.user(authorization);
    if (user.role !== 'CUSTOMER')
      throw new ForbiddenException('เฉพาะบัญชีลูกค้า');
    const cents = amountToCents((body as { amount?: unknown })?.amount);
    await this.db.$transaction(async (tx) => {
      const { cash } = await this.ensureWallets(tx, user);
      await tx.money_entries.create({
        data: {
          idempotency_key: `topup:${randomUUID()}`,
          wallet_id: cash.wallet_id,
          user_id: BigInt(user.id),
          wallet_type: 'CASH',
          signed_amount: money(cents),
          entry_type: 'TOPUP',
        },
      });
    });
    return this.summary(authorization);
  }

  async resetHelp(authorization?: string) {
    const user = await this.user(authorization);
    if (user.role !== 'CUSTOMER')
      throw new ForbiddenException('เฉพาะบัญชีลูกค้า');
    await this.db.$transaction(async (tx) => {
      const { base } = await this.ensureWallets(tx, user);
      if (!base) return;
      const current = await this.balance(tx, base.wallet_id);
      if (current < HELP_MONTHLY_CENTS)
        await tx.money_entries.create({
          data: {
            idempotency_key: `help-reset:${randomUUID()}`,
            wallet_id: base.wallet_id,
            user_id: BigInt(user.id),
            wallet_type: 'BASE',
            signed_amount: money(HELP_MONTHLY_CENTS - current),
            entry_type: 'BASE_ALLOCATION',
          },
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
            },
          },
        },
        orderBy: [{ created_at: 'desc' }, { entry_id: 'desc' }],
        take: 100,
      });
      return entries.map((entry) => ({
        id: entry.entry_id.toString(),
        type: entry.entry_type,
        walletType: entry.wallet_type,
        amount: entry.signed_amount.toFixed(2),
        createdAt: entry.created_at.toISOString(),
        paymentRequestId: entry.payment_request_id,
        shopName: entry.payment_requests
          ? (entry.payment_requests.shop?.name ??
            entry.payment_requests.seller.display_name)
          : null,
      }));
    });
  }

  async createPaymentRequest(body: unknown, authorization?: string) {
    const user = await this.user(authorization);
    if (user.role !== 'SELLER')
      throw new ForbiddenException('เฉพาะบัญชีร้านค้า');
    const cents = amountToCents((body as { amount?: unknown })?.amount);
    const shop = await this.db.shops.findFirst({
      where: { owner_id: BigInt(user.id) },
      orderBy: { shop_id: 'asc' },
    });
    const request = await this.db.payment_requests.create({
      data: {
        payment_request_id: randomUUID(),
        seller_id: BigInt(user.id),
        shop_id: shop?.shop_id,
        amount: money(cents),
      },
    });
    return {
      id: request.payment_request_id,
      amount: request.amount.toFixed(2),
      shopName: shop?.name ?? user.displayName,
      status: request.status,
      scanPayload: request.payment_request_id,
    };
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
    const total = Number(request.amount.mul(100).toFixed(0));
    const help = Math.floor((total * 60 + 50) / 100);
    return {
      id,
      status: request.status,
      shopName: request.shop?.name ?? request.seller.display_name,
      amount: money(total),
      helpAmount: money(help),
      customerAmount: money(total - help),
    };
  }

  async pay(id: string, authorization?: string) {
    const user = await this.user(authorization);
    if (user.role !== 'CUSTOMER')
      throw new ForbiddenException('เฉพาะบัญชีลูกค้า');
    if (!uuid.test(id)) throw new BadRequestException('QR ไม่ถูกต้อง');
    return this.db.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT payment_request_id FROM payment_requests WHERE payment_request_id = ${id}::uuid FOR UPDATE`;
        const request = await tx.payment_requests.findUnique({
          where: { payment_request_id: id },
        });
        if (!request) throw new NotFoundException('ไม่พบ QR รับเงิน');
        if (request.status !== 'PENDING')
          throw new ConflictException('QR นี้ถูกใช้แล้ว');
        const customerWallets = await this.ensureWallets(tx, user);
        const seller = { id: request.seller_id.toString(), role: 'SELLER' };
        const sellerWallets = await this.ensureWallets(tx, seller);
        if (!customerWallets.base)
          throw new ConflictException('ไม่พบสิทธิช่วยจ่าย');
        await tx.$queryRaw`SELECT wallet_id FROM wallets WHERE wallet_id IN (${customerWallets.cash.wallet_id}, ${customerWallets.base.wallet_id}, ${sellerWallets.cash.wallet_id}) ORDER BY wallet_id FOR UPDATE`;
        const total = Number(request.amount.mul(100).toFixed(0));
        const help = Math.floor((total * 60 + 50) / 100);
        const cash = total - help;
        if ((await this.balance(tx, customerWallets.base.wallet_id)) < help)
          throw new ConflictException('วงเงินช่วยเหลือไม่เพียงพอ');
        if ((await this.balance(tx, customerWallets.cash.wallet_id)) < cash)
          throw new ConflictException('ยอดเงินใน wallet ไม่เพียงพอ');
        await tx.money_entries.createMany({
          data: [
            {
              idempotency_key: `pay:${id}:help`,
              wallet_id: customerWallets.base.wallet_id,
              user_id: BigInt(user.id),
              wallet_type: 'BASE',
              signed_amount: money(-help),
              entry_type: 'PAYMENT_DEBIT',
              payment_request_id: id,
            },
            {
              idempotency_key: `pay:${id}:cash`,
              wallet_id: customerWallets.cash.wallet_id,
              user_id: BigInt(user.id),
              wallet_type: 'CASH',
              signed_amount: money(-cash),
              entry_type: 'PAYMENT_DEBIT',
              payment_request_id: id,
            },
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
        await tx.payment_requests.update({
          where: { payment_request_id: id },
          data: {
            status: 'PAID',
            customer_id: BigInt(user.id),
            paid_at: new Date(),
          },
        });
        return {
          id,
          status: 'PAID',
          amount: money(total),
          helpAmount: money(help),
          customerAmount: money(cash),
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async onModuleDestroy() {
    await this.db.$disconnect();
  }
}

@Controller()
export class WalletsController {
  constructor(private readonly wallets: WalletsService) {}
  @Get('wallets/me') @Header('Cache-Control', 'no-store') summary(
    @Headers('authorization') auth?: string,
  ) {
    return this.wallets.summary(auth);
  }
  @Post('wallets/top-up') topUp(
    @Body() body: unknown,
    @Headers('authorization') auth?: string,
  ) {
    return this.wallets.topUp(body, auth);
  }
  @Post('wallets/help/reset') reset(@Headers('authorization') auth?: string) {
    return this.wallets.resetHelp(auth);
  }
  @Get('wallets/history') @Header('Cache-Control', 'no-store') history(
    @Headers('authorization') auth?: string,
  ) {
    return this.wallets.history(auth);
  }
  @Post('seller/payment-requests') create(
    @Body() body: unknown,
    @Headers('authorization') auth?: string,
  ) {
    return this.wallets.createPaymentRequest(body, auth);
  }
  @Get('payment-requests/:id') @Header('Cache-Control', 'no-store') request(
    @Param('id') id: string,
    @Headers('authorization') auth?: string,
  ) {
    return this.wallets.paymentRequest(id, auth);
  }
  @Post('payment-requests/:id/pay') pay(
    @Param('id') id: string,
    @Headers('authorization') auth?: string,
  ) {
    return this.wallets.pay(id, auth);
  }
}

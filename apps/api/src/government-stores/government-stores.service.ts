import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const statuses = ['PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED'] as const;
type ShopStatus = (typeof statuses)[number];
type ReviewInput = { status: 'APPROVED' | 'SUSPENDED'; reason?: string };

export function shopId(value: string) {
  if (!/^[1-9][0-9]*$/.test(value))
    throw new BadRequestException('รหัสร้านไม่ถูกต้อง');
  return BigInt(value);
}

export function listStatus(query: Record<string, unknown>): ShopStatus | null {
  if (Object.keys(query).some((key) => key !== 'status'))
    throw new BadRequestException('ตัวกรองไม่ถูกต้อง');
  if (query.status === undefined || query.status === 'ALL') return null;
  if (
    typeof query.status !== 'string' ||
    !statuses.includes(query.status as ShopStatus)
  )
    throw new BadRequestException('สถานะร้านไม่ถูกต้อง');
  return query.status as ShopStatus;
}

export function reviewInput(body: unknown): ReviewInput {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw new BadRequestException('ข้อมูลการอนุมัติไม่ถูกต้อง');
  const input = body as Record<string, unknown>;
  if (Object.keys(input).some((key) => !['status', 'reason'].includes(key)))
    throw new BadRequestException('ข้อมูลการอนุมัติไม่ถูกต้อง');
  if (input.status !== 'APPROVED' && input.status !== 'SUSPENDED')
    throw new BadRequestException('เลือกสถานะ APPROVED หรือ SUSPENDED');
  if (input.reason !== undefined && typeof input.reason !== 'string')
    throw new BadRequestException('เหตุผลไม่ถูกต้อง');
  const reason = typeof input.reason === 'string' ? input.reason.trim() : '';
  if (reason.length > 500)
    throw new BadRequestException('เหตุผลต้องไม่เกิน 500 ตัวอักษร');
  if (input.status === 'SUSPENDED' && !reason)
    throw new BadRequestException('กรุณาระบุเหตุผลที่ระงับร้าน');
  return { status: input.status, ...(reason ? { reason } : {}) };
}

function jsonValue(value: unknown): unknown {
  return JSON.parse(
    JSON.stringify(value, (_, item: unknown) =>
      typeof item === 'bigint' ? item.toString() : item,
    ),
  );
}

const include = {
  users: {
    select: { user_id: true, display_name: true },
  },
  shop_categories: { include: { categories: true } },
} as const;

@Injectable()
export class GovernmentStoresService {
  constructor(
    private readonly db: PrismaService,
    private readonly auth: AuthService,
  ) {}

  private async officer(authorization?: string) {
    const user = await this.auth.me(authorization);
    if (user.role !== 'GOVERNMENT')
      throw new ForbiddenException('เฉพาะเจ้าหน้าที่ภาครัฐ');
    return user;
  }

  async list(query: Record<string, unknown>, authorization?: string) {
    await this.officer(authorization);
    const status = listStatus(query);
    const stores = await this.db.shops.findMany({
      where: status ? { participation_status: status } : undefined,
      include,
      orderBy: [{ participation_status: 'asc' }, { shop_id: 'asc' }],
      take: 200,
    });
    return jsonValue({ stores });
  }

  async detail(id: string, authorization?: string) {
    await this.officer(authorization);
    const store = await this.db.shops.findUnique({
      where: { shop_id: shopId(id) },
      include,
    });
    if (!store) throw new NotFoundException('ไม่พบร้านค้า');
    return jsonValue(store);
  }

  async update(id: string, body: unknown, authorization?: string) {
    const officer = await this.officer(authorization);
    const storeId = shopId(id);
    const input = reviewInput(body);
    const current = await this.db.shops.findUnique({
      where: { shop_id: storeId },
      select: { participation_status: true },
    });
    if (!current) throw new NotFoundException('ไม่พบร้านค้า');
    if (current.participation_status === input.status)
      throw new ConflictException('ร้านอยู่ในสถานะนี้แล้ว');
    if (
      input.status === 'APPROVED' &&
      current.participation_status !== 'PENDING'
    )
      throw new ConflictException('อนุมัติได้เฉพาะร้านที่รอตรวจสอบ');
    if (
      input.status === 'SUSPENDED' &&
      !['PENDING', 'APPROVED'].includes(current.participation_status)
    )
      throw new ConflictException('ไม่สามารถระงับร้านในสถานะปัจจุบัน');
    const store = await this.db.shops.update({
      where: { shop_id: storeId },
      data: {
        participation_status: input.status,
        reviewed_by: BigInt(officer.id),
        reviewed_at: new Date(),
        review_reason: input.reason ?? null,
      },
      include,
    });
    return jsonValue(store);
  }
}

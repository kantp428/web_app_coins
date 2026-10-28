import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

if (process.env.NODE_ENV === 'production')
  throw new Error('Demo seed cannot run in production');
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
const accounts = [
  {
    username: '0000000000000',
    password: 'DemoCustomer!2026',
    role: 'CUSTOMER',
    displayName: 'ลูกค้าทดสอบ',
  },
  {
    username: 'demo_shop',
    password: 'DemoShop!2026',
    role: 'SELLER',
    displayName: 'ร้านค้าทดสอบ',
  },
  {
    username: 'demo_government',
    password: 'DemoGovernment!2026',
    role: 'GOVERNMENT',
    displayName: 'เจ้าหน้าที่ทดสอบ',
  },
];
function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString('hex')}`;
}
function matches(password, hash) {
  const [algorithm, salt, digest] = hash.split('$');
  if (
    algorithm !== 'scrypt' ||
    !/^[a-f0-9]{32}$/.test(salt ?? '') ||
    !/^[a-f0-9]{128}$/.test(digest ?? '')
  )
    return false;
  return timingSafeEqual(
    scryptSync(password, salt, 64),
    Buffer.from(digest, 'hex'),
  );
}
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
try {
  await db.$connect();
  const result = await db.$transaction(
    async (tx) => {
      const records = [];
      for (const account of accounts) {
        let user = await tx.users.findUnique({
          where: { login_identifier: account.username },
        });
        if (
          user &&
          (user.role !== account.role ||
            user.status !== 'ACTIVE' ||
            !matches(account.password, user.password_hash))
        )
          throw new Error(
            `Demo username collision for ${account.role}; no existing account was modified`,
          );
        const created = !user;
        if (!user)
          user = await tx.users.create({
            data: {
              login_identifier: account.username,
              password_hash: hashPassword(account.password),
              role: account.role,
              display_name: account.displayName,
            },
          });
        records.push({ role: user.role, id: user.user_id.toString(), created });
      }
      const seller = await tx.users.findUniqueOrThrow({
        where: { login_identifier: 'demo_shop' },
      });
      const existingShop = await tx.shops.findFirst({
        where: { owner_id: seller.user_id },
        orderBy: { shop_id: 'asc' },
      });
      if (!existingShop)
        await tx.shops.create({
          data: {
            owner_id: seller.user_id,
            name: 'ร้านค้าทดสอบ',
            description: 'ร้านสำหรับทดสอบ QR และธุรกรรมในระบบพัฒนา',
            address: {
              line1: 'พื้นที่ทดสอบ',
              province: 'กรุงเทพมหานคร',
              district: 'ปทุมวัน',
              subDistrict: 'วังใหม่',
              postcode: '10330',
            },
            latitude: '13.745500',
            longitude: '100.534000',
            opening_hours: {
              days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
              open: '08:00',
              close: '20:00',
              timeZone: 'Asia/Bangkok',
            },
            participation_status: 'APPROVED',
            size_class: 'SMALL',
          },
        });
      return records;
    },
    { maxWait: 30000, timeout: 30000 },
  );
  console.log(JSON.stringify(result));
} finally {
  await db.$disconnect();
}

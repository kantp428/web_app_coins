import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

if (process.env.NODE_ENV === 'production')
  throw new Error('Mock shops cannot be seeded in production');
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');

const center = { latitude: 14.020894, longitude: 99.991808 };
const earthKm = 6371.0088;
const password = 'DemoShop!2026';
const marker = '[ข้อมูลทดสอบ nearby-shops-v1]';
const templates = [
  [
    'food',
    'ครัวบ้านคลอง',
    'อาหารตามสั่งรสบ้านๆ ข้าวกะเพรา ไข่เจียว และต้มจืด ปรุงใหม่ทุกจาน เหมาะสำหรับมื้อกลางวันราคาประหยัด',
  ],
  [
    'cafe',
    'กาแฟริมสวน',
    'กาแฟสดคั่วกลาง ชาและโกโก้ มีมุมพักผ่อนบรรยากาศสวน พร้อมโต๊ะสำหรับนั่งอ่านหนังสือ',
  ],
  [
    'bakery',
    'ขนมปังอุ่นใจ',
    'ขนมปังอบใหม่ทุกเช้า ไส้สังขยา หมูหยอง และเนยสด รับจัดชุดอาหารว่างขนาดเล็ก',
  ],
  [
    'beverages',
    'ชาชื่นใจ',
    'ชาไทย ชามะนาว และชาเขียว เลือกระดับความหวานได้ มีเครื่องดื่มเย็นสำหรับวันอากาศร้อน',
  ],
  [
    'household',
    'ของใช้บ้านสบาย',
    'ของใช้ประจำบ้าน น้ำยาซักผ้า อุปกรณ์ทำความสะอาด และภาชนะครัว มีสินค้าแบ่งขายสำหรับครัวเรือน',
  ],
  [
    'services',
    'ซักสะอาดชุมชน',
    'บริการซัก อบ และพับเสื้อผ้า รับผ้าปูที่นอนและเสื้อผ้าทั่วไป แจ้งเวลารับงานก่อนใช้บริการ',
  ],
  [
    'other',
    'สวนไม้เล็ก',
    'ไม้กระถาง ไม้ประดับ ดินปลูกและกระถางขนาดเล็ก พร้อมคำแนะนำการดูแลสำหรับผู้เริ่มปลูกต้นไม้',
  ],
  [
    'food',
    'ก๋วยเตี๋ยวลานบ้าน',
    'ก๋วยเตี๋ยวน้ำใสและต้มยำ เลือกเส้นและเครื่องได้ มีเมนูเกาเหลาและข้าวเปล่าสำหรับมื้ออิ่มง่าย',
  ],
  [
    'cafe',
    'ละมุนคอฟฟี่เฮาส์',
    'เอสเปรสโซ ลาเต้ และกาแฟนมโฮมเมด มีเครื่องดื่มไม่ใส่กาแฟและที่นั่งสบายสำหรับพักระหว่างวัน',
  ],
  [
    'bakery',
    'เค้กบ้านหอม',
    'เค้กชิ้น คุกกี้และบราวนี่ทำสดเป็นรอบ มีชุดขนมสำหรับแบ่งกับเพื่อนและครอบครัว',
  ],
  [
    'beverages',
    'น้ำผลไม้สดใส',
    'น้ำส้ม น้ำแตงโม และผลไม้ปั่นตามฤดูกาล เลือกไม่เติมน้ำเชื่อมได้ ปั่นสดเมื่อสั่ง',
  ],
  [
    'household',
    'ตลาดของใช้ใกล้บ้าน',
    'เครื่องเขียน ถุงขยะ กระดาษชำระและของใช้จิปาถะ รวมของจำเป็นที่หยิบซื้อได้สะดวกในชุมชน',
  ],
  [
    'services',
    'ช่างจักรยานเพื่อนบ้าน',
    'บริการปะยาง เปลี่ยนยาง ตั้งเบรกและตรวจสภาพจักรยาน มีอะไหล่พื้นฐานสำหรับการใช้งานประจำวัน',
  ],
  [
    'other',
    'งานฝีมือบ้านเรา',
    'สินค้าทำมือ กระเป๋าผ้า พวงกุญแจและของตกแต่งชิ้นเล็ก เหมาะเป็นของฝากจากงานชุมชน',
  ],
  [
    'food',
    'ข้าวแกงอิ่มพอดี',
    'ข้าวราดแกงและอาหารไทยหมุนเวียนทุกวัน มีเมนูผัก ไข่ และเนื้อสัตว์สำหรับเลือกจัดจานตามชอบ',
  ],
  [
    'cafe',
    'พักก่อนคาเฟ่',
    'คาเฟ่ขนาดเล็กสำหรับพักระหว่างทาง มีอเมริกาโน โกโก้ และขนมทานเล่น บริการทั้งนั่งร้านและกลับบ้าน',
  ],
  [
    'bakery',
    'เตาอบยามเช้า',
    'ครัวซองต์ มัฟฟินและพายอบใหม่ มีรสหวานและรสคาวสำหรับมื้อเช้าหรืออาหารว่าง',
  ],
  [
    'beverages',
    'สมุนไพรเย็นใจ',
    'น้ำเก๊กฮวย กระเจี๊ยบและตะไคร้ต้มสด พร้อมเครื่องดื่มสมุนไพรหวานน้อยสำหรับดื่มคู่มื้ออาหาร',
  ],
  [
    'household',
    'ครัวครบเครื่อง',
    'อุปกรณ์ครัว จาน ชาม กล่องอาหารและของใช้จัดระเบียบบ้าน มีตัวเลือกสำหรับพื้นที่ขนาดเล็ก',
  ],
  [
    'services',
    'ตัดผมยิ้มรับ',
    'บริการตัดผมและสระผมสำหรับคนในชุมชน จัดคิวหน้าร้านและแจ้งรูปแบบทรงผมก่อนเริ่มบริการ',
  ],
];
const radians = (value) => (value * Math.PI) / 180;
const degrees = (value) => (value * 180) / Math.PI;

function point(index) {
  const distance = 0.45 + Math.sqrt((index + 0.5) / templates.length) * 4.2;
  const bearing = radians(index * 137.507764);
  const angularDistance = distance / earthKm;
  const lat1 = radians(center.latitude),
    lon1 = radians(center.longitude);
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing),
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2),
    );
  return {
    latitude: degrees(lat2).toFixed(6),
    longitude: degrees(lon2).toFixed(6),
  };
}

function distanceKm(latitude, longitude) {
  const lat1 = radians(center.latitude),
    lat2 = radians(Number(latitude));
  const a =
    Math.sin((lat2 - lat1) / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(radians(Number(longitude) - center.longitude) / 2) ** 2;
  return earthKm * 2 * Math.asin(Math.sqrt(Math.min(1, a)));
}

function hashPassword() {
  const salt = randomBytes(16).toString('hex');
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString('hex')}`;
}
function matches(hash) {
  const [algorithm, salt, digest] = hash.split('$');
  return (
    algorithm === 'scrypt' &&
    /^[a-f0-9]{32}$/.test(salt ?? '') &&
    /^[a-f0-9]{128}$/.test(digest ?? '') &&
    timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(digest, 'hex'))
  );
}

const records = templates.map(([slug, name, description], index) => ({
  username: `demo_shop_${String(index + 1).padStart(2, '0')}`,
  slug,
  name: `${name} (ทดสอบ)`,
  description: `${marker} ${description}`,
  ...point(index),
  passwordHash: hashPassword(),
}));
assert.equal(records.length, 20);
assert(records.every((row) => distanceKm(row.latitude, row.longitude) <= 5));
assert.equal(
  new Set(records.map((row) => `${row.latitude},${row.longitude}`)).size,
  20,
);

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
try {
  const categories = await db.categories.findMany({
    orderBy: { category_id: 'asc' },
  });
  assert(
    categories.length > 0 &&
      categories.every((category) =>
        records.some((row) => row.slug === category.slug),
      ),
    'Seed templates must cover every database category',
  );
  const categoryIds = new Map(
    categories.map((category) => [category.slug, category.category_id]),
  );
  assert(
    records.every((row) => categoryIds.has(row.slug)),
    'A required category is missing',
  );
  if (!process.argv.includes('--apply')) {
    console.log(
      JSON.stringify({
        dryRun: true,
        shops: records.length,
        categoryCounts: Object.fromEntries(
          categories.map((category) => [
            category.name,
            records.filter((row) => row.slug === category.slug).length,
          ]),
        ),
        maxDistanceKm: Math.max(
          ...records.map((row) => distanceKm(row.latitude, row.longitude)),
        ),
      }),
    );
  } else {
    const created = await db.$transaction(
      async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(726032)`;
        let createdUsers = 0,
          createdShops = 0;
        for (const row of records) {
          let user = await tx.users.findUnique({
            where: { login_identifier: row.username },
          });
          if (
            user &&
            (user.role !== 'SELLER' ||
              user.status !== 'ACTIVE' ||
              user.display_name !== row.name ||
              !matches(user.password_hash))
          )
            throw new Error(
              'Reserved demo username collision; no existing account changed',
            );
          if (!user) {
            user = await tx.users.create({
              data: {
                login_identifier: row.username,
                password_hash: row.passwordHash,
                role: 'SELLER',
                display_name: row.name,
              },
            });
            createdUsers++;
          }
          const owned = await tx.shops.findMany({
            where: { owner_id: user.user_id },
          });
          if (
            owned.length > 1 ||
            owned.some(
              (shop) =>
                shop.name !== row.name || !shop.description?.startsWith(marker),
            )
          )
            throw new Error(
              'Reserved demo shop collision; no existing shop changed',
            );
          let shop = owned[0];
          if (!shop) {
            shop = await tx.shops.create({
              data: {
                owner_id: user.user_id,
                name: row.name,
                description: row.description,
                latitude: row.latitude,
                longitude: row.longitude,
                address: {
                  line1: 'ที่อยู่จำลองสำหรับร้านทดสอบใกล้จุดค้นหา',
                  province: '',
                  district: '',
                  subDistrict: '',
                  postcode: '',
                },
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
            createdShops++;
          }
          await tx.shop_categories.upsert({
            where: {
              shop_id_category_id: {
                shop_id: shop.shop_id,
                category_id: categoryIds.get(row.slug),
              },
            },
            create: {
              shop_id: shop.shop_id,
              category_id: categoryIds.get(row.slug),
            },
            update: {},
          });
          await tx.wallets.upsert({
            where: {
              user_id_wallet_type: {
                user_id: user.user_id,
                wallet_type: 'CASH',
              },
            },
            create: {
              user_id: user.user_id,
              user_role: 'SELLER',
              wallet_type: 'CASH',
            },
            update: {},
          });
        }
        return { createdUsers, createdShops };
      },
      { maxWait: 10000, timeout: 60000 },
    );
    const stored = await db.shops.findMany({
      where: {
        users: { login_identifier: { in: records.map((row) => row.username) } },
      },
      include: {
        users: true,
        shop_categories: { include: { categories: true } },
      },
    });
    assert.equal(stored.length, 20);
    assert(
      stored.every(
        (shop) =>
          shop.participation_status === 'APPROVED' &&
          matches(shop.users.password_hash) &&
          distanceKm(shop.latitude, shop.longitude) <= 5 &&
          shop.description?.startsWith(marker),
      ),
    );
    assert(
      categories.every((category) =>
        stored.some((shop) =>
          shop.shop_categories.some(
            (link) => link.category_id === category.category_id,
          ),
        ),
      ),
    );
    console.log(
      JSON.stringify({
        ...created,
        verifiedShops: stored.length,
        verifiedCategories: categories.length,
        maxDistanceKm: Math.max(
          ...stored.map((shop) => distanceKm(shop.latitude, shop.longitude)),
        ),
        usernameRange: 'demo_shop_01..demo_shop_20',
      }),
    );
  }
} finally {
  await db.$disconnect();
}

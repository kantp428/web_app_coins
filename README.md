# THAI Please

Monorepo สำหรับเว็บแอปตาม [Flag board](PLAN/PLAN.md) และ [Core Idea](CoreIdea.md) ใช้ pnpm workspace, Next.js, NestJS, Prisma และ PostgreSQL

เว็บใช้ Base UI/shadcn สำหรับ Alert และ Dialog และใช้ Sonner สำหรับ toast แจ้งผล โดยติดตั้ง Toaster ที่ root layout; confirmation ที่ใช้ร่วมกันอยู่ใน `apps/web/src/components/shared/confirm-dialog.tsx`

## โครงสร้าง

| ตำแหน่ง                          | งาน                                                                     |
| -------------------------------- | ----------------------------------------------------------------------- |
| `apps/web/src/app/(customer)/`   | หน้าและ flow ลูกค้า                                                     |
| `apps/web/src/app/(seller)/`     | หน้าร้านค้า                                                             |
| `apps/web/src/app/(government)/` | หน้าเจ้าหน้าที่และ dashboard                                            |
| `apps/web/src/components/`       | UI ที่ใช้ร่วมกันภายในเว็บ                                               |
| `apps/api/src/recommendations/`  | API แนะนำร้านและ fallback                                               |
| `apps/api/src/`                  | API ส่วนอื่น เช่น auth, stores, purchases, coins และ reports            |
| `apps/api/prisma/`               | Prisma schema, migrations และ seed เมื่อออกแบบ contract แล้ว            |
| `apps/api/postman/`              | Collection และ environment ตัวอย่างสำหรับ API                           |
| `docs/`                          | API contract, decisions และเอกสารอ้างอิง                                |
| `docs/blueprint/schema/`         | SQL blueprint จากเอกสารเดิม ใช้อ้างอิง ไม่ใช่ migration ที่รันอัตโนมัติ |
| `.agent/skills/`                 | วิธีทำงานเฉพาะ frontend, backend และข้อมูล                              |
| `packages/`                      | package ที่ต้องใช้ร่วมกันจริงหลังตกลง contract                          |

## Clone แล้วรันบนเครื่องใหม่ (PowerShell)

1. ติดตั้ง Git และ Node.js 24 แล้วติดตั้ง pnpm เวอร์ชันที่ระบุใน `package.json`:

   ```powershell
   npm install -g pnpm@12.9.1
   node --version
   pnpm --version
   ```

2. Clone repository แล้วเข้า root ของโปรเจกต์ (แทน `<repo-url>` ด้วย URL จริง):

   ```powershell
   git clone <repo-url> web_app_coins
   cd web_app_coins
   ```

3. ติดตั้ง dependencies จาก lockfile และคัดลอกไฟล์ตั้งค่าตัวอย่าง:

   ```powershell
   pnpm install --frozen-lockfile
   Copy-Item apps/web/.env.example apps/web/.env.local
   Copy-Item apps/api/.env.example apps/api/.env
   ```

4. แก้ `apps/api/.env` ให้ `DATABASE_URL` ตรงกับ PostgreSQL ของเครื่อง หากจะทำงานส่วนฐานข้อมูล ค่า `JWT_SECRET` ในตัวอย่างต้องเปลี่ยนก่อนเริ่มพัฒนา auth ค่า `NEXT_PUBLIC_API_URL` ใน `apps/web/.env.local` ชี้ไปยัง API ที่ `http://localhost:3000` อยู่แล้ว

5. รัน web และ API พร้อมกันจาก root:

   ```powershell
   pnpm dev
   ```

   เปิด web ที่ `http://localhost:3001` และ API ที่ `http://localhost:3000` กด `Ctrl+C` เพื่อหยุดทั้งสองแอป

## คำสั่งตรวจงาน

```powershell
pnpm build
pnpm lint
pnpm test
```

ปัจจุบันมี mobile wallet UI จำลอง, NestJS scaffold และ Neon/Prisma baseline `0_init` แล้ว. Seed, PrismaService และ business APIs ยังเป็นงานที่เหลือใน [Integration plan](PLAN/INTEGRATION.md). วิธี Pull/Push/Baseline/Migrate ดู [Prisma guide](apps/api/PRISMA_GUIDE.md).

## Shop registration location

`/register` ร้านค้าใช้ React Leaflet + Leaflet และ OpenStreetMap สำหรับเลือกพิกัด เปิดแผนที่แล้วคลิก/ลากหมุด หรือกรอกพิกัดเองได้ ที่อยู่ร้านเติมจาก reverse geocoding แล้วให้เจ้าของตรวจและแก้เอง แยกจากรหัสพื้นที่ ใช้ Ctrl + scroll ซูมบน PC ตั้ง tile provider/attribution ใน apps/web/.env.example ได้ รัน `pnpm --filter api exec prisma migrate deploy` ก่อนใช้ API ใหม่เพื่อเพิ่ม shops.address และแปลงข้อความเดิมเป็น JSON โดยเก็บข้อความเดิมใน line1 (ไม่แก้ baseline)

Reverse geocoding ใช้ Nominatim ตาม https://operations.osmfoundation.org/policies/nominatim/ : ไม่เกิน 1 request/วินาทีรวมทั้งแอป มี attribution, cache และ User-Agent ระบุแอป; ใช้เฉพาะพิกัดร้านที่ผู้ใช้เลือก ไม่มี autocomplete/bulk lookup. API ปัจจุบันจำกัดผ่านคิวใน process เดียว หากเพิ่ม replicas ต้องใช้ shared limiter/cache หรือ provider ของตนเองก่อน. ตั้ง GEOCODING_REVERSE_URL และ GEOCODING_USER_AGENT ใน apps/api/.env เพื่อสลับ provider โดยไม่ build ใหม่.

Shop categories use categories + shop_categories (many-to-many). Run prisma migrate deploy to apply 20261012003000_shop_categories; legacy category text becomes a master category and relationship before dropping the old column. GET /categories returns master IDs; register sends categoryIds (1–10 unique strings). Register supports multiple selections. Initial Thai labels are prototype taxonomy and legacy labels remain available.

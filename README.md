# THAI Please

Monorepo สำหรับเว็บแอปตาม [PLAN.md](PLAN.md) และ [Core Idea](CoreIdea.md) ใช้ pnpm workspace, Next.js, NestJS, Prisma และ PostgreSQL

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

ตอนนี้ขั้นตอนข้างต้นรัน Next.js และ NestJS scaffold ได้ แต่ยังไม่มี Prisma schema, migration, seed หรือ API ตาม `PLAN.md` จึงยังไม่มีขั้นตอนตั้งฐานข้อมูลที่รันได้จริง เมื่อส่วน F00 เสร็จ ให้เพิ่มขั้นตอน PostgreSQL และ migrate/seed ที่นี่

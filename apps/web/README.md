# Web — THAI Please

Frontend ของโครงการ ใช้ Next.js, TypeScript และ Tailwind CSS ดูขอบเขตหน้าลูกค้า ร้านค้า และเจ้าหน้าที่ใน [PLAN.md](../../PLAN.md)

สำหรับผู้ที่เพิ่ง clone โปรเจกต์ ให้เริ่มจาก [คู่มือรันทั้ง monorepo](../../README.md#clone-แล้วรันบนเครื่องใหม่-powershell)

## เริ่มใช้งาน

รันคำสั่งจาก root ของ monorepo:

```powershell
pnpm install
Copy-Item apps/web/.env.example apps/web/.env.local
pnpm dev:web
```

เปิด `http://localhost:3001` ค่า `NEXT_PUBLIC_API_URL` ใน `apps/web/.env.local` ใช้ชี้ไปยัง API (ตัวอย่างคือ `http://localhost:3000`)

## โครงไฟล์

- `src/app/(customer)/` — หน้าลูกค้า
- `src/app/(seller)/` — หน้าร้านค้า
- `src/app/(government)/` — หน้าเจ้าหน้าที่
- `src/components/` — component ที่ใช้ร่วมกันเมื่อมีการสร้างจริง

## ตรวจงาน

```powershell
pnpm --filter web lint
pnpm --filter web build
```

ตอนนี้ยังเป็น Next.js scaffold; หน้าจอและการเชื่อม API ตามแผนยังไม่ได้ทำ

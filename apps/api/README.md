# API — THAI Please

Backend ของโครงการ ใช้ NestJS (ESM), TypeScript, Vitest และเตรียม Prisma/PostgreSQL ตาม [PLAN.md](../../PLAN.md)

สำหรับผู้ที่เพิ่ง clone โปรเจกต์ ให้เริ่มจาก [คู่มือรันทั้ง monorepo](../../README.md#clone-แล้วรันบนเครื่องใหม่-powershell)

## เริ่มใช้งาน

รันคำสั่งจาก root ของ monorepo:

```powershell
pnpm install
Copy-Item apps/api/.env.example apps/api/.env
pnpm dev:api
```

API รับคำขอที่ `http://localhost:3000` แก้ `DATABASE_URL` ใน `apps/api/.env` ให้ตรงกับ PostgreSQL ของเครื่องก่อนเริ่มทำงานฐานข้อมูล

## โครงไฟล์

- `src/` — NestJS modules และ endpoints
- `src/recommendations/` — ระบบแนะนำร้าน
- `prisma/` — schema, migrations และ seed ที่จะสร้างตาม contract
- `postman/` — collection และ environment ตัวอย่างสำหรับ API

## ตรวจงาน

```powershell
pnpm --filter api lint
pnpm --filter api test
pnpm --filter api test:e2e
pnpm --filter api build
```

ตอนนี้ยังเป็น NestJS scaffold; Prisma schema, migration, seed และ API ตามแผนยังไม่ได้ทำ อ่าน [SQL blueprint](../../docs/blueprint/schema/README.md) เป็นเอกสารอ้างอิงก่อนออกแบบ schema จริง

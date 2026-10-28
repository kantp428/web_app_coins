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

### สถานะ recommendation search

`POST /recommendations/search` ยังไม่เปิดใช้: comment route decorator เก็บไว้ตามคำสั่งผู้ใช้ (28 ตุลาคม 2569) จึงตอบ `404` โดยยังเก็บ method/service สำหรับเปิดใช้ภายหลัง `/recommendations/context` และ `/recommendations/candidates` ยังทำงานตามเดิม ชุด Postman ทั้ง main และ For-AI ระบุ search เป็น `[DISABLED]` และตรวจ `404`; flow ค้นหาผ่าน Explore/BFF ยังเรียก search ไม่ได้ ดูรายการ API ปัจจุบันใน root `Summary-api.md` (ไฟล์ local ที่ ignore โดย Git)

## ตรวจงาน

`POST /recommendations/candidates` ต้องส่ง `{categoryIds:["1"],latitude:13.75,longitude:100.5,radiusKm:5}` พร้อม CUSTOMER Bearer token โดยใช้พิกัด/รัศมีเดียวกับ `GET /stores` (รัศมี 0.1–50 กม., ไม่ส่งใช้ 5 กม.) ระบบใช้ StoresService scope SQL ร่วมกัน กรองร้าน APPROVED ทุกหน้าในระยะก่อนเลือก 3 ร้านใหม่ + 2 ร้านเดิมตาม Coins; response `{stores:[{id,visited,coins}]}` เหมือนเดิม ไม่ส่งพิกัดตอบ 400 ไม่ขยายขอบเขตเอง

Postman หมวด Recommendation read tools มีกรณีพิกัด/รัศมีผิดและตรวจว่า IDs ที่ได้อยู่ในผล `GET /stores` ทุกหน้าของ scope เดียวกัน ตั้ง `recommendationLatitude`, `recommendationLongitude`, `recommendationRadiusKm` และ `categoryId` ก่อนรัน; ไม่มีการขอ GPS อัตโนมัติ

```powershell
pnpm --filter api lint
pnpm --filter api test
pnpm --filter api test:e2e
pnpm --filter api build
```

ตอนนี้ยังเป็น NestJS scaffold; Prisma schema, migration, seed และ API ตามแผนยังไม่ได้ทำ อ่าน [SQL blueprint](../../docs/blueprint/schema/README.md) เป็นเอกสารอ้างอิงก่อนออกแบบ schema จริง

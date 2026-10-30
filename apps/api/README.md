# API — THAI Please

Backend ของโครงการ ใช้ NestJS (ESM), TypeScript, Vitest และ Prisma/PostgreSQL ตาม [PLAN/PLAN.md](../../PLAN/PLAN.md)

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

Nest `POST /recommendations/search` ยังไม่เปิดใช้: comment route decorator เก็บไว้ตามคำสั่งผู้ใช้ (28 ตุลาคม 2569) จึงตอบ `404` โดยยังเก็บ method/service สำหรับเปิดใช้ภายหลัง `/recommendations/context` และ `/recommendations/candidates` ยังทำงานตามเดิม ชุด Postman ทั้ง main และ For-AI ระบุ Nest search เป็น `[DISABLED]` และตรวจ `404`; Explore/BFF ใช้ FastAPI `/stores/search` แยกต่างหากแล้ว ดูรายการ Nest API ปัจจุบันใน root `Summary-api.md` (ไฟล์ local ที่ ignore โดย Git)

## ตรวจงาน

### ตำแหน่งร้านของเจ้าของบัญชี

SELLER เรียก `GET /seller/stores` เพื่ออ่านเฉพาะร้านของตน และ `PATCH /seller/stores/:id/location` ด้วย `{latitude,longitude,address?}` เพื่อบันทึกพิกัด/ที่อยู่ เลือก actor จาก Bearer เท่านั้น พิกัดรับ number/decimal string ในช่วง latitude±90/longitude±180; address ตามรูปแบบ Register, nullเพื่อล้าง/ไม่ส่งเพื่อคงเดิม ไม่รับ owner/status/Coins ใน body รหัสร้านอื่นหรือไม่พบตอบ404 ไม่มีการเปลี่ยนสถานะอนุมัติหรือกฎ Coins ดูสัญญา/ตัวอย่างใน docs/api-contract.md และ Postman หมวด Seller shop location

ตรวจเฉพาะส่วนนี้จาก root ด้วย `pnpm --filter api exec vitest run src/seller-stores/seller-stores.service.spec.ts` ผลชุดเต็ม30ต.ค.2569:114ผ่าน19skip รวม6กรณีใหม่เรื่องพิกัด/สิทธิ์เจ้าของ/การปฏิเสธ protected fields ไม่มีการย้ายพิกัดร้านจริงระหว่างทดสอบ

การ์ดร้านใน Explore และ Chatbot ใช้ `GET /stores`/`POST /stores/batch` ซึ่งเพิ่ม `coinRate:{coins,minimumPurchase,endsAt}|null` อ่านอัตราที่เก็บในรอบปัจจุบันตามบัญชีลูกค้าจาก token และการจัดร้านเคยซื้อแบบเดียวกับ candidates พร้อมขั้นต่ำจาก rule ที่ผูกกับอัตรานั้น ไม่สร้างอัตราหรือเพิ่ม Coins เมื่อค้นหา ไม่มีอัตรา/หมดอายุ/ยังไม่เริ่มเป็น null; การชำระยังตรวจ Coins ที่ได้จริงแยกตามกติกา payment

ตรวจ SQL นี้กับ PostgreSQL จริงด้วยตาราง TEMP ภายใน transaction โดยไม่แก้ข้อมูลธุรกิจ (ใช้ development DATABASE_URL; CMD จาก root):

```bat
set RECOMMENDATION_DB_TEST=1
pnpm --filter api exec vitest run src/recommendations/recommendations.database.spec.ts
set RECOMMENDATION_DB_TEST=
```

ผล30ต.ค.2569: fixture SQL ผ่าน1test รวมอัตรารอบปัจจุบัน/หมดอายุ/อนาคต การเลือกอัตราตาม actor, REFUNDED/PENDING,ขั้นต่ำจาก rule และลำดับ/ขอบเขตการ์ด; unit suite108ผ่าน19skip ไม่ใช่ full HTTP/browser E2E

`POST /recommendations/candidates` accepts CUSTOMER {categoryIds,shopIds?} globally by default. Optional complete legacy latitude/longitude/radiusKm scopes remain supported. Chat uses GET /recommendations/catalog and POST /recommendations/stores without geography; Explore retains required coordinates/radius. Scope, approval, visits, active stored rates and3+2 are rechecked by Backend.

Postman หมวด Recommendation read tools มีกรณีพิกัด/รัศมีผิดและตรวจว่า IDs ที่ได้อยู่ในผล `GET /stores` ทุกหน้าของ scope เดียวกัน ตั้ง `recommendationLatitude`, `recommendationLongitude`, `recommendationRadiusKm` และ `categoryId` ก่อนรัน; ไม่มีการขอ GPS อัตโนมัติ

Candidates accept optional0-200 selected shop IDs; unknown IDs cannot bypass approval/category or optional legacy scope. FastAPI now obtains descriptions from the global recommendations/catalog instead of nearby GET /stores.

```powershell
pnpm --filter api lint
pnpm --filter api test
pnpm --filter api test:e2e
pnpm --filter api build
```

สถานะและ acceptance ที่ยังเหลือดู [PLAN/PLAN.md](../../PLAN/PLAN.md) และ [API contract](../../docs/api-contract.md) ผล unit/fixture ข้างต้นยังไม่ใช่การยืนยัน full HTTP/browser E2E ของทุก Feature

Global Chat checks30 October2026: API117PASS/19skip, lint/build PASS; opt-in TEMP PostgreSQL fixture PASS1 proves global distant-shop eligibility and unchanged scoped exclusion. Main Postman includes12 read-only Global Chat requests. These are not live model/browser acceptance.

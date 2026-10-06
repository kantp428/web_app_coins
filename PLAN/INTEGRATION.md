# Integration — Backend และข้อมูล

อ่าน [Flag board](PLAN.md) เพื่อเลือก Daily Flag ของรอบ R1 และอัปเดตสถานะที่บอร์ดหลักเพียงจุดเดียว. รายละเอียด requirement/กติกากลาง/contract และ baseline อยู่ใน [Integration](INTEGRATION.md). Product context อยู่ใน [CoreIdea](../CoreIdea.md); ข้อสรุปที่ยังไม่ล็อกให้บันทึกใน [decisions](../docs/decisions.md) ก่อน implement. API contract อยู่ที่ `docs/api-contract.md` จาก repo root (ยังเป็นงาน F01).

วันที่เป้าหมาย D1–D7 คือ 7–13 ตุลาคม 2569 ตาม Asia/Bangkok. ใช้ UI/DB เดิมต่อ ไม่สร้างซ้ำ; UI Preview ไม่เท่ากับ integration DONE. หาก dependency ยังไม่ merge ให้ทำงานเตรียม/test ในพื้นที่ของตนและรายงาน blocker แทนการอ้างว่า endpoint พร้อม.

## ใบงานและพื้นที่รับผิดชอบ

### ใบงานรายคน: คนกลาง — Integration และ Backend

**Flag:** `F00–F03`, `F06`, `F08`, `F11`, `F13–F14`; Requirement ทั้งหมดฝั่ง API และ `NFR-01/03/05/07/08`. **พื้นที่ไฟล์:** root config, `apps/api/` ยกเว้น recommendations, `apps/api/prisma/`, `apps/api/postman/`, `docs/`. **Codex:** Normal สำหรับ scaffold/CRUD/docs/Postman; Pro สำหรับ schema, auth, ledger, idempotency, quest, report reconciliation.

1. `F00–F01` (R1-D1): ใช้ repo/Neon/baseline ที่มีแล้ว เพิ่ม PrismaService/adapter, CI/seed และ clean-database test, ตกลง mapping schema กับ API request/response กับ A/B/AI, บันทึกค่าที่ Requirement ยังไม่ระบุใน `docs/decisions.md`. **ส่งมอบ:** ทุกคนรัน local ได้; contract มีตัวอย่าง response และ Postman skeleton.
2. `F02–F03` (R1-D2–3): auth/role/ownership, account/wallet, API ร้านและการอนุมัติ. **ส่งมอบ:** 401/403 และ owner isolation ผ่าน; endpoint มี Postman. ส่ง endpoint/store seed ให้ A/B/AI ทันทีหลัง merge.
3. `F06` (R1-D4): rule version และ purchase preview. **ส่งมอบ:** ร้านใหม่/ร้านเดิมได้ Coins ตามเกณฑ์ 1–10; preview แสดงเงินครบทุกส่วน; ส่ง rule service ให้ AI และ API ให้ A/B.
4. `F08` (R1-D5): confirm purchase จำลอง, ledger, idempotency/concurrency, Coins และ Main Quest/รอบเดือน. **ส่งมอบ:** ซื้อซ้ำไม่เพิ่มยอด, grant ไม่ซ้ำ, เงินไม่ติดลบ, history คงอยู่; ส่ง API ให้ A/B.
5. `F11` (R1-D6): report งบและ Social Impact รวมข้อมูลตาม filter โดย reconcile กับธุรกรรมจริง. **ส่งมอบ:** ไม่เปิดเผยรายบุคคล, มีนิยาม KPI/last updated, Postman ครบ; ส่ง response ให้ B.
6. `F13–F14` (R1-D6–7): รวมผลทดสอบ 3 role, load test, backup/restore, smoke Postman, README/demo และ release tag. **ส่งมอบ:** รายงานผลจริงและข้อจำกัด; merge PR ตาม dependency หลัง review/CI.

**กติกาคิวงาน:** I เป็นเจ้าของ `schema.prisma`, migration และการ merge Postman เพื่อลด conflict; หากงานค้าง ให้แยก module ที่ไม่แตะ schema กลางเป็น issue ใหม่ให้ A/B รับ โดยระบุ API contract, file scope และผู้ review ก่อนเริ่ม.

## Daily Flags — งานและ acceptance

| วัน / วันที่ | คน  | Daily Flag → Feature | งานที่ต้องส่งมอบ                                                                                                                              | Dependency / acceptance                                                            |
| ------------ | --- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| D1 / 7 ต.ค.  | I   | `R1-D1-I` → F00/F01  | PrismaService + pg adapter, seed 3 roles แบบทำซ้ำได้บน dev DB แยก; contract, decisions, Postman skeleton, CI/runbook และ clean migration test | ไม่แก้ baseline ที่ apply แล้ว; contract/seed พร้อมให้ทุกคนใช้                     |
| D2 / 8 ต.ค.  | I   | `R1-D2-I` → F02      | Auth, role guards, me/wallet/Coins reads; seed login, 401/403 tests และ Postman                                                               | F00/F01; ยอดมาจาก ledger/DB จริง                                                   |
| D3 / 9 ต.ค.  | I   | `R1-D3-I` → F03      | Owner store CRUD, government approval, public search/filter + tests/Postman                                                                   | F02; permission/filtering ที่ server; ส่งข้อมูลร้านจริงให้ทุกคน                    |
| D4 / 10 ต.ค. | I   | `R1-D4-I` → F06      | Versioned rule + purchase preview, eligible/visited จากประวัติทุกเดือน, money breakdown และ Postman/tests                                     | F02/F03; ล็อกนโยบายสิทธิใน decisions ก่อน implement                                |
| D5 / 11 ต.ค. | I   | `R1-D5-I` → F08      | Purchase transaction, ledger, idempotency/locking, reward budget/expiry, reversal และ monthly history; Postman                                | F06; duplicate/concurrent, insufficient funds/budget และ month boundary tests      |
| D6 / 12 ต.ค. | I   | `R1-D6-I` → F11/F13  | Report API จาก views/ledger, reconcile budget/impact + Postman; รวม E2E/security/load                                                         | F08; report privacy/filter/KPI, 100 concurrent p95 ≤ 3s เป็นเป้าหมายไม่ใช่ผลยืนยัน |
| D7 / 13 ต.ค. | I   | `R1-D7-I` → F14      | Backup/restore แยก DB, Postman smoke, README/runbook, CI/final merge/release                                                                  | F13 + PR ทุกคน; ไม่ tag หาก acceptance สำคัญยังไม่ผ่าน                             |

## 0. จุดเริ่มต้น ณ 7 ตุลาคม 2569

| ส่วน                    | สถานะที่ตรวจพบ                                                                                                                                 | สิ่งที่ยังต้องทำ                                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Monorepo / stack        | มี Next.js + shadcn และ NestJS ESM + Vitest; มีคำสั่ง dev/build/lint                                                                           | CI, runbook และตรวจ API build/test จริงก่อนปิด F00                                                          |
| PostgreSQL / Prisma     | มี Neon DB, 9 tables, baseline `0_init`, migration lock และ Prisma config; ตรวจ `migrate status` ในรอบนี้ได้ **Database schema is up to date** | PrismaService/adapter ใน NestJS, seed ทดสอบแบบทำซ้ำได้ และทดสอบ migrate deploy บน DB ว่างแยก                |
| Baseline correctness    | รอบก่อนทดสอบ SQL ใน schema ชั่วคราวภายใน transaction แล้ว rollback: 9 tables, 4 views; เก็บ 55 checks และ generated subsidy column             | ยังไม่ใช่หลักฐาน full clean-database deploy/restore; ต้องตรวจและเก็บผลใน F00/F14                            |
| Customer UI             | มี `/`, `/wallet`, wallet shell, ค้นหา/กรองร้าน, map/AI จำลอง, quest/history/profile                                                           | Login, API integration, map จริง, preview/confirm และ browser QA; F04/F09 **ยังไม่ DONE**                   |
| Seller UI               | มี `/store`, summary, รับเงินตัวอย่าง, history, local shop form                                                                                | Auth/owner isolation, RHF+Zod, API integration, multi-store และข้อมูลจริง; F05/F10 **ยังไม่ DONE**          |
| Government UI           | ยังไม่มี route/components                                                                                                                      | Approval, coin rules, budget และ impact dashboard                                                           |
| Backend                 | `src` มี AppController/AppService scaffold และ ConfigModule                                                                                    | ยังไม่มี auth, stores, wallet, purchase, quest, reports หรือ PrismaService                                  |
| AI                      | มีบทสนทนาจำลองใน UI                                                                                                                            | Candidate retrieval, recommendation endpoint, provider/fallback และ evaluation                              |
| Contract / Postman      | มี `docs/decisions.md`; ยังไม่มี `docs/api-contract.md`; Postman มีเพียง `.gitkeep`                                                            | ทำ contract กลาง, collection และ environment ตัวอย่างใน R1-D1-I                                             |
| Formatting / validation | มี Prettier workflow; รอบก่อน web lint/build ผ่าน และ Prisma validate/generate ผ่าน                                                            | ตรวจซ้ำตามไฟล์ที่เปลี่ยน; browser flow, security, concurrency, load และ backup/restore ยังไม่ผ่านการตรวจรับ |

**งานที่ไม่ต้องเริ่มใหม่:** ไม่สร้าง monorepo, UI wallet หรือ DB schema ตั้งต้นซ้ำ; ไม่ reset Neon และไม่แก้ `0_init` ที่ mark applied แล้ว. อ้างวิธี DB ใน `apps/api/PRISMA_GUIDE.md`. การเปลี่ยน schema ต่อไปให้สร้าง migration ใหม่ใน DB development แยก และใช้ migrate deploy สำหรับ environment ที่มีข้อมูลร่วม. การจัดรูปแบบโค้ดด้วย Prettier ทำอัตโนมัติก่อนส่งงาน; `.prisma` ใช้ prisma format.

**ลำดับเร่งด่วน:** R1-D1-I ปิด contract + Prisma integration + seed → R1-D2-I auth/account → R1-D3-I store API → R1-D4-I preview/rules → R1-D5-I purchase/quest → R1-D6-I reports → R1-D7 ทุกคนตรวจ demo และ release gate. F00 ทำแล้วบางส่วน; feature อื่นให้ถือว่ายังไม่ผ่าน acceptance จนมีผล integration จริง.

## วิธีอ่านสำหรับ AI / Codex

1. รับ **ชื่อคนหรือบทบาท + Daily Flag ID (`R1-D1-A` เป็นต้น)** จากผู้มอบหมาย แล้วอ่านหัวข้อ `กติกาบังคับ`, `ใบงานรายคน`, แถว Daily Flag และรหัส Feature Flag (`Fxx`) ที่งานอ้างถึง. หนึ่ง Daily Flag ต่อหนึ่ง PR.
2. ตรวจ `git status`, dependency ของ Flag และ `docs/api-contract.md` ก่อนแก้โค้ด. ถ้า contract ยังไม่มี ให้ทำ/รอ `F01`; ห้ามคิด request/response คนละแบบเอง. อ่านรหัส Feature/Requirement ในหัวข้อ 1 ของไฟล์นี้ที่ Flag อ้างถึง.
3. แก้เฉพาะพื้นที่ไฟล์ที่ระบุในใบงาน. หากจำเป็นต้องแก้ schema, shared API หรือไฟล์ของอีกคน ให้แจ้งเจ้าของและบันทึกใน PR. Migration ที่ merge แล้วให้สร้างไฟล์ใหม่ ไม่แก้ย้อนหลัง.
4. ก่อนจบให้ตรวจ acceptance ของ Flag, รัน test ที่เกี่ยว, อัปเดต Postman เมื่อแตะ Backend และสรุปผลทดสอบจริง. ถ้าไม่ได้รันทดสอบให้เขียนว่า `ยังไม่ทดสอบ`; ห้ามอ้างว่าเสร็จเพียงเพราะเขียนโค้ดแล้ว.

Prompt เริ่มงานที่ใช้ซ้ำได้:

```text
ทำงานในบทบาท <App Dev A | App Dev B | AI Dev | คนกลาง> เฉพาะ Daily Flag <R1-D#-A|B|AI|I>
จาก PLAN.md อ่านใบงานรายคนและ Feature ID ที่เกี่ยว ตรวจ dependency
กับ git status ก่อนลงมือ จำกัดไฟล์ตามเจ้าของงาน ใช้ API contract กลาง
หากแก้ Backend ให้ปรับ Postman collection ใน PR เดียวกัน
จบด้วยสรุปไฟล์ที่แก้ คำสั่งและผลทดสอบ ความเสี่ยง และสิ่งที่ต้องส่งต่อ
```

## 1. เป้าหมายและขอบเขต

ส่งมอบ web app ต้นแบบที่เดิน flow ได้จริง: ลูกค้าเข้าสู่ระบบ → ค้นหาร้าน/คุย AI → เห็นยอดก่อนซื้อ → ยืนยันซื้อ → ได้ Coins/รางวัล; คนขายจัดการร้านและดูรายการ; เจ้าหน้าที่อนุมัติร้าน ตั้งกติกา และดูงบกับ Social Impact Dashboard. ใช้ข้อมูล seed และ **จำลองผลชำระเงิน**; ไม่มีการเชื่อมชำระเงินจริงในสัปดาห์นี้. ทุกข้อมูลธุรกรรมและยอดเงินต้องมาจาก PostgreSQL ไม่ใช้ mock หลัง integration.

Stack ที่ตกลง: Frontend **Next.js, shadcn/ui, Lucide React, React Hook Form, Axios, Zod**; Backend **NestJS, Prisma, PostgreSQL**. สำหรับแผนที่/AI ยังไม่ล็อกผู้ให้บริการ: D1 รอบใหม่นี้ทีมเลือกวิธีที่รันซ้ำได้ในเครื่องทดสอบ พร้อม fallback สำหรับกรณีไม่มี API key; หากต้องเพิ่ม dependency หรือบริการ ให้ทำตามกติกา stack/skill ในหัวข้อ 6.

เกณฑ์ข้อมูลที่ยึดร่วมกัน: เงินใช้ decimal ฝั่ง DB/API ส่งเป็นสตริงทศนิยม, Coins เป็นจำนวนเต็มแยกจากเงินบาท, เดือนตาม `Asia/Bangkok`, ร้าน “ยังไม่เคยไป” ตรวจจาก **ธุรกรรมสำเร็จทั้งหมด** (รอบเดือนมีผลเฉพาะยอด Coins), กติกา Coins เก็บเป็น version, Dashboard แสดงข้อมูลรวมเท่านั้น. ก่อนเริ่ม implement ให้คนกลางบันทึกข้อสมมติที่ยังไม่มีค่าแน่นอน เช่น วงเงินพื้นฐาน/สัดส่วนช่วยจ่าย/เกณฑ์ร้านยอดขายต่ำ/นิยามร้านรายย่อย ใน `docs/decisions.md`; ใช้ค่าตั้งต้นใน seed และไม่อ้างว่าเป็นนโยบายจริง.

### Feature catalog — ข้อกำหนดที่ยังใช้ตรวจรับ

รหัสด้านล่างเป็น source of truth สำหรับการแตก issue/Flag และตรวจ demo. `FR` คือสิ่งที่ผู้ใช้ทำได้หรือระบบต้องทำ; `NFR` คือเกณฑ์คุณภาพ. ฟีเจอร์หนึ่งอาจอยู่ในหลาย Flag เพราะมี API และ UI แยกกัน.

| ID     | Feature                 | พฤติกรรมที่ต้องมี                                                                                                                                         | Flag หลัก     |
| ------ | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| FR-C01 | บัญชีลูกค้า             | login และดูบัญชี สิทธิประโยชน์ ยอดเงินบาท/วงเงินช่วยจ่าย/Coins แยกกัน                                                                                     | F02, F04      |
| FR-C02 | ค้นหาร้านบนแผนที่       | interactive map แสดงร้านร่วมโครงการ พิกัด หมวดสินค้า สถานะรับ Coins; ค้นหา/กรองและเปรียบเทียบก่อนซื้อ                                                     | F03, F04      |
| FR-C03 | AI Chatbot แนะนำร้าน    | สนทนาภาษาธรรมชาติ ใช้พิกัดที่ยินยอม ความสนใจ และประวัติซื้อ; แนะนำเฉพาะร้านที่ไม่เคยซื้อ พร้อม Coins ที่จะได้                                             | F07, F09      |
| FR-C04 | ยืนยันซื้อ              | ก่อนยืนยันแสดงยอดซื้อ ส่วนช่วยจ่าย และยอดจ่ายเอง; ใช้วงเงินตามสิทธิ์; บันทึกธุรกรรมสำเร็จและสถานะ                                                         | F06, F08, F09 |
| FR-C05 | Tiered Coins            | ธุรกรรมสำเร็จที่เข้าเงื่อนไขได้ 1–10 Coins; ร้านใหม่สำหรับลูกค้าคนนั้น โดยเฉพาะร้านยอดขายผ่านระบบต่ำ ได้ 8–10 ตาม rule; ร้านเดิมที่เคยได้ Coins แล้วได้ 1 | F06, F08      |
| FR-C06 | Main Quest              | แสดง progress รายเดือน; เมื่อครบ 100 Coins ให้สิทธิช่วยจ่ายเพิ่ม 100 บาท ใช้ได้ในเดือนนั้นและมอบครั้งเดียวต่อเดือน                                        | F08, F09      |
| FR-C07 | รอบเดือน/ประวัติ        | เดือนใหม่ Coins ปัจจุบันเริ่มที่ 0 โดยไม่ลบประวัติซื้อ/สะสม/รับสิทธิรอบก่อน และไม่เปลี่ยนยอดเงินบาท                                                       | F08, F09      |
| FR-S01 | จัดการร้าน              | คนขาย login และจัดการชื่อร้าน พิกัด หมวดสินค้า เวลาเปิด เพื่อใช้บนแผนที่และ AI                                                                            | F02, F03, F05 |
| FR-S02 | ดูธุรกรรมร้าน           | คนขายดูรายการซื้อ สถานะ ยอดลูกค้าจ่ายและส่วนช่วยจ่าย เฉพาะร้านตนเอง                                                                                       | F08, F10      |
| FR-S03 | ดูกติกา Coins           | คนขายเห็นเกณฑ์ของร้านตน; server คำนวณ Coins จากประวัติลูกค้าและยอดขายผ่านระบบ ไม่ให้ร้านกำหนดเอง                                                          | F06, F10      |
| FR-G01 | อนุมัติร้าน             | เจ้าหน้าที่ login ตรวจข้อมูลร้านและเปลี่ยนสถานะการเข้าร่วมโครงการ                                                                                         | F02, F03, F05 |
| FR-G02 | ตั้งกติกา Coins         | เจ้าหน้าที่กำหนด rule 1–10, เกณฑ์ร้านยอดขายต่ำ, ร้านใหม่/ร้านเดิม; เก็บ rule version ไม่แก้ประวัติเดิม                                                    | F06, F10      |
| FR-G03 | ติดตามงบ Main Quest     | รัฐเห็นงบตั้งต้น ยอดมอบ ยอดใช้จริงสุทธิ ยอดยังใช้ได้/หมดอายุ/ยังไม่จัดสรร รายเดือน แยกจากวงเงินพื้นฐาน                                                    | F11, F12      |
| FR-G04 | Social Impact Dashboard | จำนวนร้านที่ได้ลูกค้าใหม่ สัดส่วนยอดซื้อสู่ร้านรายย่อย การใช้สิทธิ; กรองเวลาและพื้นที่ พร้อมนิยาม KPI                                                     | F11, F12      |

**ขอบเขตการทำงานร่วมกันของ Feature:** ร้านที่ไม่เข้าร่วมไม่ขึ้นแผนที่/AI; ประวัติ “เคยซื้อ” อิงธุรกรรมสำเร็จทุกเดือน ไม่ใช่แค่เดือนปัจจุบัน; Coins แยกจากเงินและใช้ชำระแทนเงินบาทไม่ได้; UI ใช้ยอด/คะแนนจาก API. ต้นแบบจำลองผลการชำระเงิน แต่การยืนยันรายการและตัดยอดต้องเป็นธุรกรรมฐานข้อมูลเดียวกัน. ร้านที่ AI แนะนำต้องตรวจ ID และอัตรา Coins จากระบบก่อนตอบ. หากไม่มีร้านเข้าเงื่อนไขให้แสดงว่าไม่พบร้าน.

### รายละเอียด Feature สำหรับนำไปสร้างแอป

ส่วนนี้ระบุหน้าจอ ข้อมูลเข้า ผลลัพธ์ และกรณีตรวจรับที่ต้องมีในโปรเจกต์ใหม่. ใช้ร่วมกับตาราง Flag รอบ R1 ด้านล่าง; ค่าตัวเลขที่ไม่ได้กำหนดในเอกสารนี้ให้ F01 ระบุเป็นค่าทดสอบใน `docs/decisions.md` ก่อนเขียน business logic.

**ลูกค้า — ค้นหาร้าน แนะนำ และซื้อ (`FR-C01–C04`)**

1. หน้าเข้าสู่ระบบพาลูกค้าไปบัญชีของตนเอง. หน้าบัญชีแสดงยอดกระเป๋าเงินบาท, วงเงินช่วยจ่ายพื้นฐาน, วงเงิน Main Quest, Coins เดือนปัจจุบันและสิทธิ์ที่ใช้ได้เป็นช่องแยกกัน. เมื่อไม่มีข้อมูลให้แสดงศูนย์และข้อความอธิบาย ไม่รวม Coins เป็นยอดเงิน.
2. หน้าแผนที่แสดงเฉพาะร้านที่รัฐอนุมัติและเข้าร่วม. ร้านแต่ละแห่งมีชื่อ หมวดหมู่ พิกัด เวลาเปิด สถานะรับ Coins และจำนวน Coins โดยประมาณจาก rule ปัจจุบันสำหรับลูกค้าคนนั้น. ค้นหาด้วยพื้นที่/หมวดหมู่ได้; การปฏิเสธตำแหน่งต้องยังใช้ค้นหาด้วยพื้นที่ได้. กดร้านแล้วเปิดรายละเอียดและลิงก์นำทาง.
3. Chatbot รับข้อความภาษาธรรมชาติ เช่น ชนิดสินค้า/ความสนใจ/ช่วงราคา; ใช้พิกัดเฉพาะเมื่อผู้ใช้ยินยอม. Backend คัดร้านที่ลูกค้า **ไม่เคยซื้อสำเร็จ** ก่อนให้ AI เรียบเรียงคำตอบ. การ์ดผลลัพธ์ต้องมีร้านจริง เหตุผลที่แนะนำ Coins ที่คำนวณจาก rule จริง และลิงก์ไปแผนที่. ร้านเคยซื้อ/ไม่ร่วมโครงการต้องไม่ปรากฏ; ไม่มีร้านให้ตอบว่าไม่พบร้าน; AI provider ใช้ไม่ได้ให้ fallback ที่ยังอ้าง DB จริง.
4. หน้ายืนยันซื้อรับร้านและยอดซื้อจากผู้ใช้/ข้อมูลธุรกรรมต้นแบบ. `preview` จาก server แสดงยอดรวม ส่วนวงเงินพื้นฐาน ส่วน Main Quest และเงินลูกค้าจ่าย รวมถึง Coins ที่จะได้; หากสิทธิ์ไม่พอ ให้แสดงข้อผิดพลาดหรือยอดที่ต้องจ่ายเองตามกติกา F01. ผู้ใช้กดยืนยันหลังเห็น preview; request ใช้ `Idempotency-Key`. ผลสำเร็จมีรหัสรายการ/สถานะ/ยอดที่หัก/Coins; กดซ้ำไม่ทำให้หักยอดหรือเพิ่ม Coins ซ้ำ.

**ลูกค้า — Coins, Main Quest และประวัติ (`FR-C05–C07`)**

5. Coins ออกหลังธุรกรรมสำเร็จเท่านั้น: ร้านใหม่สำหรับลูกค้าคนนั้นได้ 1–10 ตาม rule โดยร้านยอดขายผ่านระบบต่ำต้องอยู่ในช่วง 8–10; ร้านเดิมที่เคยได้รับ Coins แล้วได้ 1. รัฐกำหนดเกณฑ์ได้และระบบบันทึก rule version ที่ใช้ต่อรายการ. หากคืนเงิน/ย้อนรายการ ให้บันทึก reversal โดยไม่ลบรายการเดิม.
6. หน้า Main Quest แสดง Coins ที่สะสมในเดือนนั้น เป้าหมาย 100 และสถานะรางวัล. เมื่อยอดถึง 100 ระบบมอบวงเงินช่วยจ่ายเพิ่ม 100 บาทได้เพียงครั้งเดียวต่อคนต่อเดือน โดยตรวจงบก่อนมอบและใช้ได้เฉพาะเดือนนั้น. หน้า UI ต้องแยกยอดที่มอบ ยอดใช้ และยอดคงเหลือของรางวัล.
7. เดือนใหม่ตาม `Asia/Bangkok` ยอด Coins ปัจจุบันเริ่มจากศูนย์ด้วยการเปลี่ยนรอบเดือน ไม่ลบ ledger/ประวัติ. ประวัติเลือกดูเดือนเก่าได้ โดยแสดงรายการซื้อ Coins ที่ได้รับ/ถูกย้อน และการได้รับ/ใช้รางวัล; ยอดกระเป๋าเงินบาทไม่ถูกรีเซ็ต.

**ร้านค้า (`FR-S01–S03`)**

8. คนขายเข้าสู่ระบบเพื่อสร้าง/แก้ชื่อร้าน พิกัด หมวดหมู่สินค้า เวลาเปิดทำการของร้านที่ตนเป็นเจ้าของ. การเปลี่ยนสถานะเข้าร่วมเป็นสิทธิ์รัฐ; ร้านที่ยังไม่อนุมัติไม่ขึ้นแผนที่/AI. คนขายหนึ่งคนดูแลหลายร้านได้ แต่ไม่อ่านหรือแก้ร้านคนอื่น.
9. หน้าธุรกรรมร้านแสดงรายการและสถานะ พร้อมยอดซื้อ เงินลูกค้าจ่าย ส่วนวงเงินพื้นฐาน และส่วน Main Quest ของร้านนั้น. มีตัวกรองช่วงเวลา/ร้านตามความจำเป็น; ข้อมูลต้องมาจากรายการที่บันทึกจริง ไม่ใช้ตัวเลขจำลองบนหน้า.
10. หน้ากติกา Coins แสดง rule ปัจจุบันและเงื่อนไขของร้าน เช่น สถานะร้านยอดขายต่ำและอัตราที่อาจได้. คนขายดูได้แต่แก้ไม่ได้; คะแนนจริงของแต่ละการซื้อคำนวณฝั่ง server จากประวัติลูกค้าและ rule version.

**เจ้าหน้าที่รัฐ (`FR-G01–G04`)**

11. เจ้าหน้าที่เข้าสู่ระบบ ตรวจรายละเอียดร้านและอนุมัติ/ระงับการเข้าร่วม. การเปลี่ยนสถานะต้องส่งผลต่อ public search และคำแนะนำ AI; คนขายเปลี่ยนสถานะเองไม่ได้.
12. หน้ากติกาให้กำหนดช่วง 1–10 Coins, เกณฑ์ยอดขายผ่านระบบต่ำ, อัตราร้านใหม่และร้านเดิม; validate ไม่ให้อัตราหลุดช่วง และสร้าง version ใหม่เมื่อเปลี่ยน. รายการซื้อเก่าเก็บ version เดิมเพื่ออธิบายคะแนนย้อนหลัง.
13. หน้างบ Main Quest เลือกเดือนแล้วแสดงงบตั้งต้น วงเงินที่มอบ งบยังไม่จัดสรร ยอดใช้จริงสุทธิหลังคืนเงิน วงเงินที่ยังใช้ได้ และวงเงินหมดอายุ. ค่าใช้จ่าย Main Quest ต้องแยกจากเงินลูกค้าและวงเงินพื้นฐาน; เดือนที่ไม่มีรายการแสดงศูนย์. ตัวเลขตรวจย้อนจาก `RewardGrant` และ ledger ได้.
14. Social Impact Dashboard เลือกช่วงเวลาและพื้นที่แล้วแสดง (ก) จำนวนร้านที่ได้ลูกค้าใหม่ครั้งแรกจากธุรกรรมสำเร็จ (ข) สัดส่วนมูลค่าซื้อที่ไปร้านรายย่อยต่อมูลค่าซื้อรวม และ (ค) การใช้สิทธิประโยชน์. ทุก KPI มีนิยาม ตัวตั้ง/ตัวหารตามความเหมาะสม และเวลาอัปเดตล่าสุด; filter เดียวกันต้องให้ยอดตรงกับธุรกรรมต้นทาง. แสดงเฉพาะข้อมูลรวม ไม่มีประวัติซื้อรายคน.

**รายการข้อมูลที่ควรปรากฏในหน้า/response:** `id`, `status`, `createdAt` ของรายการสำคัญ; เงินแสดง 2 ตำแหน่งและระบุหน่วยบาท; Coins ระบุหน่วย Coins; ร้านมีพิกัด/หมวดหมู่/เวลาเปิด/สถานะ; รายงานมี filter และ `lastUpdatedAt`. `F01` ล็อกชื่อ field จริงใน API contract เพื่อให้ frontend, backend และ AI ใช้ตรงกัน.

### เกณฑ์คุณภาพและการทดสอบ

| ID     | เกณฑ์ตรวจ                                                                                                                          | Flag ที่พิสูจน์         |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| NFR-01 | ทุก API ตรวจ role/ownership ฝั่ง server; ลูกค้าเห็นของตน คนขายเห็นร้านตน รัฐเข้าถึงเฉพาะสิทธิ์เจ้าหน้าที่; ข้ามสิทธิ์ต้องถูกปฏิเสธ | F02, F13                |
| NFR-02 | ใช้ HTTPS ในสภาพแวดล้อม deploy, ขออนุญาตก่อนใช้พิกัด, Dashboard ไม่เปิดเผยประวัติซื้อรายบุคคล                                      | F04, F07, F11, F13      |
| NFR-03 | ค้นหาร้านและดูประวัติ ตอบกลับ ≤ 3 วินาทีอย่างน้อย 95% เมื่อมีผู้ใช้พร้อมกัน 100 คน; ระบุเครื่อง/ข้อมูล/วิธีวัด                     | F13                     |
| NFR-04 | AI อ้างร้าน/Coins จริงจากระบบ, ตรวจว่าไม่เคยซื้อ, และมี empty state เมื่อไม่มีร้าน                                                 | F07, F13                |
| NFR-05 | ส่งธุรกรรมหรือรับรางวัลซ้ำไม่เพิ่มยอดซ้ำ; เดือนใหม่ไม่ลบ history หรือเปลี่ยนยอดเงินบาท                                             | F08, F13                |
| NFR-06 | ภาษาไทย, ความกว้าง 360–1920 px ไม่ล้น, error เป็นข้อความ, ปุ่มหลักใช้ผ่าน keyboard                                                 | F04, F05, F09, F10, F12 |
| NFR-07 | KPI ตรงกับธุรกรรมต้นทางตาม filter เดียวกัน; แสดงนิยาม KPI และเวลาปรับปรุงล่าสุด                                                    | F11, F12, F13           |
| NFR-08 | สำรองข้อมูลทุก 24 ชั่วโมง; ทดสอบ restore ≤ 4 ชั่วโมง โดยข้อมูลสูญหายย้อนหลัง ≤ 24 ชั่วโมง                                          | F14                     |

**กรณีทดสอบขั้นต่ำใน seed:** 3 บทบาท, ร้านร่วม/ไม่ร่วม, ร้านเล็ก/ใหญ่, ลูกค้าเคยซื้อ/ไม่เคยซื้อ, rule เก่า/ใหม่, ลูกค้าใกล้ 100 Coins, สองเดือน, งบเหลือ/ไม่พอ, รายการซ้ำ และพื้นที่ที่ไม่มีร้าน. F01 กำหนดจำนวน/รูปข้อมูลและค่าที่ไม่ได้ระบุไว้ใน `docs/decisions.md`.

## 2. คนและพื้นที่รับผิดชอบ

| คน                                 | หน้าที่หลัก                                                      | เจ้าของไฟล์หลัก                                                                      | ตรวจ PR ของ                |
| ---------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------- |
| App Dev A                          | ลูกค้า, แผนที่, หน้าคุย AI                                       | `apps/web/src/app/(customer)/`, components ฝั่งลูกค้า                                | App Dev B                  |
| App Dev B                          | คนขาย/รัฐ, Dashboard                                             | `apps/web/src/app/(seller)/`, `(government)/`                                        | App Dev A                  |
| AI Dev                             | ระบบแนะนำร้าน, prompt/adapter/evaluation                         | `apps/api/src/recommendations/`, ชุดทดสอบ AI                                         | PR ที่กระทบ recommendation |
| คนกลาง (Integration/Backend owner) | repo, schema, auth, API ธุรกรรม/Coins/รายงาน, Postman, CI, merge | `apps/api/` ยกเว้น recommendations, `apps/api/prisma/`, `apps/api/postman/`, `docs/` | ทุก PR ที่กระทบ API/schema |

## 3. Flag, branch และกติกา PR

`F00–F14` คือ **Feature Flag/กลุ่มงาน** ที่ใช้ติดตาม Requirement; `R1-D1-A` ถึง `R1-D7-I` คือ **Daily Flag/หน่วยลงมือทำ** ของสมาชิกแต่ละคน. ทุกคนมีหนึ่ง Daily Flag ทุกวัน. สถานะ Daily Flag: `TODO` → `DOING` → `PR` → `DONE`; `BLOCKED` ต้องระบุ dependency และงานทดแทนในวันนั้น. ใช้ branch `codex/<daily-flag>-<short-name>` โดยเขียนชื่อเป็น lowercase; หนึ่ง Daily Flag = หนึ่ง issue/branch/PR จาก `main` ล่าสุด. PR เข้า `main` ผ่าน review อย่างน้อย 1 คนและ CI ผ่าน; merge ตาม dependency และ rebase ก่อน merge. PR ระบุ Daily Flag, Feature Flag/Requirement ID, endpoint/หน้าที่เปลี่ยน, migration, วิธีทดสอบ, Postman request ที่แก้ และภาพหน้าจอถ้ามี UI. ห้าม commit secret/`.env`; มี `.env.example` แทน.

**Definition of Done ทุก flag:** โค้ดรันได้, Prettier ของไฟล์ที่สร้าง/แก้และ --check ผ่าน (.prisma ใช้ prisma format), lint/typecheck ผ่าน, ทดสอบกรณีสำเร็จและกรณีผิดพลาดที่สำคัญ, UI ภาษาไทยใช้งานที่ 360 และ 1920 px, auth/permission ตรวจฝั่ง API, เอกสารและ seed ตามที่กระทบ. **ทุก PR ที่แก้ Backend/API ต้องปรับ `apps/api/postman/THAI-Please.postman_collection.json` ใน PR เดียวกันทุกครั้ง** รวม request, ตัวแปร, ตัวอย่าง body, expected status และกรณี 401/403/validation/duplicate ตามความเกี่ยวข้อง; ตรวจว่าทุก endpoint ใหม่หรือเปลี่ยนมี request ใน collection. คำว่า Backend รวมโมดูล AI ใน NestJS, cron, report และการแก้ route เดิม. คนกลาง review เงื่อนไขนี้ก่อน merge.

## 5. Contract และจุดเชื่อมที่ต้องล็อกใน R1-D1

- **Mapping DB ปัจจุบัน:** ใช้ตารางที่มีแล้ว `users`, `shops`, `wallets`, `money_entries`, `purchases`, `coin_entries`, `coin_rule_versions`, `monthly_periods`, `reward_grants`. F01 ล็อก mapping `shops` → stores API และ role `CUSTOMER/SELLER/GOVERNMENT` → normal/store/government UI. BigInt IDs ส่งเป็น string ผ่าน JSON ไม่ส่ง BigInt ตรงและไม่แปลงเป็น Number โดยไม่ตรวจขอบเขต. Generated `subsidy_used` ไม่ให้ Client เขียนเอง; checks/partial indexes/views เก็บใน SQL migration ไม่คาดหวังให้ Prisma schema แทนทั้งหมด.
- **Data model ขั้นต่ำ:** `User` (role: customer/seller/government), `Store` (owner, status, location, category, hours, area, size), `Purchase` (customer, store, status, amount breakdown, rule version, area/size snapshot, idempotency key), `Wallet/MoneyEntry` (เงินลูกค้า/สิทธิพื้นฐาน/สิทธิ Main Quest แยก ledger), `MonthlyPeriod`, `CoinEntry` (purchase, period, rule, reversal), `CoinRuleVersion`, `RewardGrant` (customer, period, expiry, budget). คนขายหนึ่งคนมีหลายร้านได้; ทุก transaction ต้องผูกเจ้าของ/ร้านจริง. สถานะ visited คำนวณจาก Purchase สำเร็จ ไม่เก็บค่าซ้ำ.
- **Invariant:** ยอดซื้อ = เงินลูกค้าจ่าย + ส่วนสิทธิพื้นฐาน + ส่วน Main Quest; ใช้ decimal คงที่; ยอดคงเหลือคำนวณจาก ledger; Coin จากหนึ่ง purchase สำเร็จได้ไม่เกินหนึ่งครั้ง; grant ไม่เกินหนึ่งครั้งต่อลูกค้าต่อเดือน; refund/reversal เก็บประวัติและปรับยอดสุทธิ; Main Quest ใช้ได้ภายในเดือนที่ให้. DB transaction + unique constraint/idempotency ป้องกันคำขอพร้อมกัน. รายงานงบ/Impact คำนวณจากรายการสำเร็จและ snapshot ณ เวลาซื้อเพื่อ audit ได้.
- API ขั้นต่ำ: `POST /auth/login`, `GET /me`, `GET /wallets/me`, `GET /stores`, `GET/PATCH /seller/stores/:id`, `GET /seller/purchases`, `GET/PATCH /government/stores/:id`, `GET/POST /government/coin-rules`, `POST /purchases/preview`, `POST /purchases` (header `Idempotency-Key`), `GET /purchases/me`, `GET /coins/me`, `GET /quests/me`, `POST /recommendations`, `GET /government/quest-budget`, `GET /government/impact`.
- API backend เป็นแหล่งคำนวณยอดเงิน, Coins, visited status, reward และ KPI; frontend แสดงค่าที่ตอบมา. `POST /recommendations` ส่งเพียงข้อความ/ตัวกรองและพิกัดเมื่อยินยอม; server ดึงประวัติจาก token เอง. คำตอบมี `storeId`, `coinEstimate`, `reason`, `sourceRuleVersion` เพื่อเปิด store card ได้.
- ค่า default ของระบบทดสอบต้องระบุชัดใน `docs/decisions.md`; seed มีกรณีตาม Feature catalog ด้านบน. หาก `CoreIdea` เสนอรายละเอียดเพิ่มหรือขัดกับ Feature catalog ให้ทีมตกลงและบันทึกการตัดสินใจก่อนแก้ contract.

## 6. วิธีใช้ Codex และการเปลี่ยน Stack

- หนึ่ง prompt ต่อหนึ่ง **Daily Flag** ที่จบใน PR เดียว; ระบุ Feature Flag ที่ Daily Flag อ้างถึง. ส่งเฉพาะใบงานรายคน, Feature ID, contract, acceptance criteria และขอบเขตไฟล์จากเอกสารนี้; ไม่ต้องใช้เอกสารต้นทางอื่น. จดสรุปสั้น ๆ ใน issue/PR เพื่อส่งต่องานข้าม session.
- ใช้โควตา **Normal** กับ scaffold, UI/form, CRUD, Postman request, เอกสาร และงานแก้เฉพาะจุด; ใช้ **Pro** กับ schema/ledger/idempotency/concurrency, rule/quest, ความปลอดภัย และการตรวจ AI grounding. ให้คนตรวจ diff และทดสอบเองเสมอ; อย่าส่ง secret หรือข้อมูลจริงเข้า prompt.
- ถ้าเพิ่ม/ลด/เปลี่ยน stack หรือ provider ให้ผู้เสนอทำ PR เดียวกับการเปลี่ยน: ปรับรายการ stack ใน `PLAN.md`/README, lockfile และ `.env.example`, ADR ใน `docs/decisions.md`, และ **สร้างหรือปรับ SKILL** ใน `.agent/skills/<topic>/SKILL.md` อธิบายเมื่อใช้ stack ใหม่นี้ วิธี run/test, contract, ข้อควรระวัง และตัวอย่าง prompt สั้น ๆ. Reviewer ต้องตรวจ SKILL ก่อน merge. การปรับ package ภายใน stack เดิมที่ไม่เปลี่ยนแนวทางใช้งานให้บันทึกใน PR; ถ้าเปลี่ยนวิธีทำงานของทีมให้ปรับ SKILL ด้วย.

## 7. Checklist ปิดรอบ R1

- [ ] ทุก FR-C01–C07, FR-S01–S03, FR-G01–G04 มีหน้าจอ/API และ scenario demo ที่ระบุผู้รับผิดชอบ
- [ ] Postman collection ตรวจทุก API พร้อม positive/negative cases และ environment ตัวอย่างไม่มี secret
- [ ] Migration + seed รันจากเครื่องใหม่ได้; no hardcoded KPI/Coins ใน UI
- [ ] ทดสอบข้ามสิทธิ์, ซื้อซ้ำพร้อมกัน, รางวัลซ้ำ, boundary สิ้นเดือน, AI hallucination/empty state, Dashboard reconcile
- [ ] บันทึกผลทดสอบ NFR-03 และ NFR-08 พร้อมสภาพแวดล้อม/เวลา ไม่อ้างผลที่ยังไม่ทดสอบ
- [ ] README มีคำสั่งเริ่มระบบ, demo accounts, limitations และลิงก์ `docs/decisions.md`; release tag หลัง PR ทั้งหมด merge

- [ ] เก็บ baseline 0_init/schema/migration lock เข้า Git และไม่แก้ baseline ที่ apply แล้ว; clean-database deploy/restore ต้องมีหลักฐานแยกจาก status บน Neon
- [ ] UI Preview role switch/QR/map/chat ไม่ถูกนำเสนอเป็น auth/payment/map/AI จริงหลัง integration

**ความเสี่ยงของกรอบ 7 วัน:** I มีงาน auth → stores → rules → transactions → reports ต่อเนื่องและเป็น dependency ของทุกคน. หาก D1 contract/seed หรือ F08 transaction tests ไม่ผ่าน ให้เลื่อนวันเป้าหมาย downstream ตามจริง; ห้ามลดการตรวจยอดเงิน/สิทธิ์/duplicate เพื่อให้ทันวันที่. ลดการตกแต่ง UI, ใช้ deterministic AI fallback และเลื่อน release ได้ตาม gates โดยยังคง Feature acceptance เดิม. การแบ่ง module ให้ A/B ช่วยต้องระบุ file ownership/contract ใน issue ก่อน.

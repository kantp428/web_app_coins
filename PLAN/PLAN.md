# THAI Please — Flag Board R1

รอบเป้าหมาย **7–13 ตุลาคม 2569 (Asia/Bangkok)**. บอร์ดนี้เก็บ Flag, สถานะ และ dependency; งาน/acceptance อยู่ในใบงาน 4 บทบาทด้านล่าง. วันที่เป็นเป้าหมาย ไม่ใช่หลักฐานว่าผ่านการตรวจรับ.

| บทบาท                                       | ใบงาน                            |
| ------------------------------------------- | -------------------------------- |
| A — ลูกค้า                                  | [APP_DEV_A.md](APP_DEV_A.md)     |
| B — ร้านค้า/รัฐ                             | [APP_DEV_B.md](APP_DEV_B.md)     |
| AI — Recommendation                         | [AI_DEV.md](AI_DEV.md)           |
| I — Backend/ข้อมูล/Integration และกติกากลาง | [INTEGRATION.md](INTEGRATION.md) |

## Feature Flags

| Feature | สถานะล่าสุด                                                    | วันเป้าหมาย            | เจ้าของ         | Dependency            |
| ------- | -------------------------------------------------------------- | ---------------------- | --------------- | --------------------- |
| F00     | PARTIAL: repo/DB/baseline + demo seed 3 roles                  | D1                     | I               | —                     |
| F01     | PARTIAL: Auth/Register contract + Postman มีแล้ว               | D1                     | I               | F00 ส่วนที่เกี่ยวข้อง |
| F02     | PARTIAL: Auth/role paths ผ่าน; wallet/Coins reads ยังไม่มี     | D2                     | I               | F01                   |
| F03     | PARTIAL: สมัครร้านสร้าง PENDING; CRUD/approval/search ยังไม่มี | D3                     | I               | F02                   |
| F04     | PARTIAL: Login/Register + routes; ร้าน/ยอดเงินยัง preview      | D3                     | A               | F01/F02/F03           |
| F05     | PARTIAL: สมัครร้านจริง + role routes; จัดการร้านยัง preview    | D3                     | B               | F01/F02/F03           |
| F06     | TODO                                                           | D4                     | I               | F02/F03               |
| F07     | TODO                                                           | D4–5                   | AI              | F03/F06               |
| F08     | TODO                                                           | D5                     | I               | F06                   |
| F09     | UI PREVIEW: แยก path แล้ว; purchase/AI ยังไม่เชื่อม            | D5                     | A               | F07/F08               |
| F10     | UI PREVIEW: แยก path แล้ว; รายการขายยังไม่เชื่อม               | D5                     | B               | F06/F08               |
| F11     | DB views มีแล้ว; API TODO                                      | D6                     | I               | F08                   |
| F12     | SHELL ONLY: มี government routes; dashboard ยังไม่มี           | D6                     | B               | F11                   |
| F13     | PARTIAL: Auth tests/route checks; full E2E/NFR ยังไม่ครบ       | D6–7                   | ทุกคน / I รวมผล | F09–F12               |
| F14     | TODO                                                           | D7 หรือหลัง gates ผ่าน | ทุกคน / I รวมผล | F13                   |

## Daily Flags

สถานะรอบใหม่เริ่มที่ TODO; อัปเดตเป็น DOING → PR → DONE ตามผลจริง หรือ BLOCKED พร้อมลิงก์ issue. ไม่ยกสถานะ UI Preview เป็น DONE ของ Feature.

| วัน          | Daily Flag                  | Feature     | สถานะ | Dependency                                                                         | Issue / PR |
| ------------ | --------------------------- | ----------- | ----- | ---------------------------------------------------------------------------------- | ---------- |
| D1 / 7 ต.ค.  | [`R1-D1-A`](APP_DEV_A.md)   | F04/F09     | DOING | ใช้ UI เดิม; ส่ง field list ให้ I; browser QA 360/1920 px ยังต้องทำ                | —          |
| D1 / 7 ต.ค.  | [`R1-D1-B`](APP_DEV_B.md)   | F05/F10/F12 | DOING | ยังไม่เปลี่ยนสถานะร้านจริง; ส่ง DTO ที่ต้องใช้ให้ I                                | —          |
| D1 / 7 ต.ค.  | [`R1-D1-AI`](AI_DEV.md)     | F07         | TODO  | ร่วมล็อก F01; ไม่คิด Coins/visited rule แยกจาก I                                   | —          |
| D1 / 7 ต.ค.  | [`R1-D1-I`](INTEGRATION.md) | F00/F01     | DOING | ไม่แก้ baseline ที่ apply แล้ว; contract/seed พร้อมให้ทุกคนใช้                     | —          |
| D2 / 8 ต.ค.  | [`R1-D2-A`](APP_DEV_A.md)   | F04         | DOING | F01 + F02 ที่ merge แล้ว; fixture ใช้ได้เฉพาะ preview mode                         | —          |
| D2 / 8 ต.ค.  | [`R1-D2-B`](APP_DEV_B.md)   | F05         | DOING | F01/F02; role switch ต้นแบบไม่ใช่ auth guard                                       | —          |
| D2 / 8 ต.ค.  | [`R1-D2-AI`](AI_DEV.md)     | F07         | TODO  | F01 + PrismaService; DB candidate filter ทดสอบได้โดยไม่รอ provider                 | —          |
| D2 / 8 ต.ค.  | [`R1-D2-I`](INTEGRATION.md) | F02         | DOING | F00/F01; ยอดมาจาก ledger/DB จริง                                                   | —          |
| D3 / 9 ต.ค.  | [`R1-D3-A`](APP_DEV_A.md)   | F04         | TODO  | F03; ร้านไม่ร่วมไม่ปรากฏ; ปฏิเสธพิกัดแล้วยังค้นหาได้                               | —          |
| D3 / 9 ต.ค.  | [`R1-D3-B`](APP_DEV_B.md)   | F05         | DOING | F03; owner isolation, validation/error และสถานะ pending/approved                   | —          |
| D3 / 9 ต.ค.  | [`R1-D3-AI`](AI_DEV.md)     | F07         | TODO  | F03 + F06 interface ที่ตกลง; scoring adapter ชั่วคราวยังไม่ใช่ endpoint DONE       | —          |
| D3 / 9 ต.ค.  | [`R1-D3-I`](INTEGRATION.md) | F03         | DOING | F02; permission/filtering ที่ server; ส่งข้อมูลร้านจริงให้ทุกคน                    | —          |
| D4 / 10 ต.ค. | [`R1-D4-A`](APP_DEV_A.md)   | F09         | TODO  | F06 preview เมื่อ merge; ยังไม่อ้างว่าชำระสำเร็จหาก F08 ไม่พร้อม                   | —          |
| D4 / 10 ต.ค. | [`R1-D4-B`](APP_DEV_B.md)   | F10         | TODO  | F06; ร้านไม่กำหนด Coins เอง; server validation                                     | —          |
| D4 / 10 ต.ค. | [`R1-D4-AI`](AI_DEV.md)     | F07         | TODO  | F03/F06; ไม่มี candidate ส่ง empty; provider ล่มยังใช้ DB จริง                     | —          |
| D4 / 10 ต.ค. | [`R1-D4-I`](INTEGRATION.md) | F06         | TODO  | F02/F03; ล็อกนโยบายสิทธิใน decisions ก่อน implement                                | —          |
| D5 / 11 ต.ค. | [`R1-D5-A`](APP_DEV_A.md)   | F09         | TODO  | F07/F08; กดซ้ำไม่ตัดยอด/เพิ่ม Coins ซ้ำ                                            | —          |
| D5 / 11 ต.ค. | [`R1-D5-B`](APP_DEV_B.md)   | F10/F12     | TODO  | F08; ร้านเห็นเฉพาะรายการตน; F11 ยังไม่พร้อมใช้ contract fixture ชัดเจน             | —          |
| D5 / 11 ต.ค. | [`R1-D5-AI`](AI_DEV.md)     | F07/F13     | TODO  | F07/F09; รายงานผลจริงและข้อจำกัด                                                   | —          |
| D5 / 11 ต.ค. | [`R1-D5-I`](INTEGRATION.md) | F08         | TODO  | F06; duplicate/concurrent, insufficient funds/budget และ month boundary tests      | —          |
| D6 / 12 ต.ค. | [`R1-D6-A`](APP_DEV_A.md)   | F13         | TODO  | F04/F09; browser evidence และผลทดสอบจริง                                           | —          |
| D6 / 12 ต.ค. | [`R1-D6-B`](APP_DEV_B.md)   | F12/F13     | TODO  | F11 เมื่อ merge; KPI ตรง seed และไม่เปิดเผยรายบุคคล                                | —          |
| D6 / 12 ต.ค. | [`R1-D6-AI`](AI_DEV.md)     | F13         | TODO  | F07/F09; แนบ cases ที่ผ่าน/ไม่ผ่าน                                                 | —          |
| D6 / 12 ต.ค. | [`R1-D6-I`](INTEGRATION.md) | F11/F13     | TODO  | F08; report privacy/filter/KPI, 100 concurrent p95 ≤ 3s เป็นเป้าหมายไม่ใช่ผลยืนยัน | —          |
| D7 / 13 ต.ค. | [`R1-D7-A`](APP_DEV_A.md)   | F14         | TODO  | F13 และ blocker ที่เกี่ยวปิดแล้ว                                                   | —          |
| D7 / 13 ต.ค. | [`R1-D7-B`](APP_DEV_B.md)   | F14         | TODO  | F12/F13; ไม่มี KPI mock ใน demo integrated                                         | —          |
| D7 / 13 ต.ค. | [`R1-D7-AI`](AI_DEV.md)     | F14         | TODO  | F13; grounded response ตรวจซ้ำ                                                     | —          |
| D7 / 13 ต.ค. | [`R1-D7-I`](INTEGRATION.md) | F14         | TODO  | F13 + PR ทุกคน; ไม่ tag หาก acceptance สำคัญยังไม่ผ่าน                             | —          |

อัปเดตตามงานใน working tree ณ **11 ตุลาคม 2569 (Asia/Bangkok)**; งานที่เริ่มทำระบุ DOING และยังไม่มี Daily Flag ที่ปิด DONE หรือเข้า PR จากหลักฐานรอบนี้. งาน Auth/Registration ทำได้แล้วไม่ได้แปลว่า F02/F03 ผ่านครบ เพราะ wallet/Coins, store CRUD/approval และ ownership acceptance ยังเหลือ. Release F14 ยังต้องรอ F13 และ gates ตาม [Integration](INTEGRATION.md).

## ความคืบหน้าที่ตรวจแล้ว — 11 ตุลาคม 2569

| ส่วน                         | ทำแล้ว                                                                                                                                                                                                                                                         | ยังค้าง / acceptance                                                                                                                                                                     |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F00/F01 — ข้อมูลและ contract | Demo seed CUSTOMER/SELLER/GOVERNMENT รันซ้ำไม่สร้างซ้ำ; Auth/Register contract, decisions และ Postman                                                                                                                                                          | PrismaService กลาง, seed ธุรกิจครบ scenarios, CI และ clean-database deploy/restore ยังไม่ครบ                                                                                             |
| F02 — Authentication         | Login/Register 3 roles, scrypt password hash, JWT อายุ 1 ชั่วโมงใน HttpOnly cookie, `/me`, Logout; layout ตรวจ role; Context + hooks + Axios กลาง                                                                                                              | Wallet/Coins reads จาก ledger, guard/ownership สำหรับ business API และ full auth E2E ยังไม่ครบ                                                                                           |
| F03 — ร้านค้า                | Register SELLER สร้าง user+shop แบบ atomic, owner ผูกบัญชีใหม่, server ตั้ง PENDING; validate รายละเอียดร้าน                                                                                                                                                   | Owner CRUD/multi-store, government approval/suspend, public search/filter และ owner-isolation tests ยังไม่มี                                                                             |
| F04/F05 — Web integration    | `/login`, `/register`; ลูกค้ากรอกชื่อ–นามสกุล/เลข 13 หลัก, ร้านกรอกรายละเอียดร้าน, รัฐใช้ credentials เท่านั้น; shadcn Select, Sonner alerts, Logout confirmation; Bai Jamjuree/Chivo Mono                                                                     | Map/API search, account/wallet จริง, แบบฟอร์มจัดการร้านจริง; browser QA ของ Register/Select/routes ล่าสุดยังไม่ครบ                                                                       |
| F09/F10 — เมนูและหน้าจอ      | Customer `/wallet`, `/wallet/explore`, `/wallet/quests`, `/wallet/history`, `/wallet/account`; seller `/store`, `/store/receive`, `/store/history`, `/store/settings`, `/store/account`; Logout อยู่ account                                                   | ยอดเงิน/Coins/ประวัติ/รับเงิน/AI และแก้ร้านส่วนเดิมยังเป็น fixtures; F06/F07/F08 ยังไม่เริ่ม integration                                                                                 |
| F12 — Government             | `/government`, `/government/stores`, `/government/coin-rules`, `/government/reports`, `/government/account` พร้อม shared role layout                                                                                                                           | Approval/rule/report pages เป็น placeholder; ยังไม่มี dashboard หรือ KPI จริง                                                                                                            |
| F13 — การตรวจ                | ล่าสุด web/API lint/build และ Prettier write/check ผ่าน; API unit tests 16 กรณีผ่าน; ทดสอบ Login จริง 3 roles + `/me` + HttpOnly cookie; authenticated GET ครบ 15 paths ได้ 200 และข้าม role ถูก redirect; nested user+shop บน DB ผ่านและ rollback ข้อมูลทดสอบ | Unit tests ใช้ mock DB; การสมัครสำเร็จครบ 3 roles ผ่าน browser, Back/Forward, responsive ของ UI ล่าสุด, full Postman smoke, business E2E, load/security และ backup/restore ยังไม่ตรวจครบ |

หลักฐานและวิธีลอง: [Test.md](../Test.md), [API contract](../docs/api-contract.md), [decisions](../docs/decisions.md), [Auth tests](../apps/api/src/auth/auth.service.spec.ts), [Postman](../apps/api/postman/THAI-Please.postman_collection.json). การทดสอบ Login ที่ 360/1920 px ทำก่อนปรับ Register/Select/routes ล่าสุด จึงยังไม่ถือเป็น responsive acceptance ของทุกหน้าปัจจุบัน.

### กติกาที่ยังต้องล็อกก่อนงานถัดไป

- `shops.area_code` ยังไม่มีมาตรฐานรหัสและข้อมูล master จังหวัด/อำเภอ/ตำบล; ฟอร์มยังเป็นช่องกรอกเอง ไม่ได้ทำ dropdown พื้นที่แล้ว
- Government self-register ACTIVE เป็นพฤติกรรม prototype ตามคำสั่งผู้ใช้; invitation/approval สำหรับใช้งานจริงยังต้องตกลง
- ชื่อ–นามสกุลลูกค้ารวมเก็บใน `users.display_name`; ไม่มีการเพิ่ม schema field แยก และยังไม่มีข้อมูลติดต่อ/ที่อยู่
- หน้าร้าน/ยอดเงิน/Coins/ธุรกรรมต้องเชื่อม API จริงก่อนยก UI Preview เป็น feature DONE

## บันทึกส่งต่องาน (Collaboration handoff log)

ทุกงานต้องบันทึกก่อนส่งผล ตาม [กติกากลางใน AGENTS.md](../AGENTS.md#required-progress-and-collaboration-handoff). ใช้รูปแบบ: วันที่/เวลา Asia/Bangkok → งาน/Flag/บทบาท → ไฟล์หรือ routes → ผลตรวจจริง → blocker/กติกาค้าง → ขั้นตอนถัดไป. ถ้าไม่เกี่ยวกับ Feature ให้ระบุ maintenance; ห้ามใส่ secrets หรือ credentials.

### 2026-10-11 23:32 Asia/Bangkok — Maintenance: บังคับบันทึกความคืบหน้าทุกงาน

- งาน/ขอบเขต: ปรับกติกา collaboration ใน `AGENTS.md` และ `.agent/skills/{web-frontend,nest-api,prisma-data}/SKILL.md` ให้ทุกงานรวม review/config/docs บันทึกในไฟล์นี้ก่อน final พร้อมรักษาการแก้ของผู้ร่วมงาน
- สถานะ: งานเอกสารนี้ดำเนินการแล้ว; ไม่ปิด Feature/Daily Flag จากการแก้ skill และแก้แถว Daily Flags ที่เริ่มจริงเป็น DOING ให้ตรงกับสรุปความคืบหน้า
- ผลตรวจ: `quick_validate.py` ผ่านทั้ง 3 skill; `pnpm --filter web exec prettier --write` และ `--check` ผ่าน AGENTS.md, PLAN/PLAN.md และ SKILL.md ทั้ง 3 ไฟล์; ไม่มีการแก้ application code จึงไม่รัน app tests/build ซ้ำ
- ค้าง: มาตรฐาน area_code/master พื้นที่, government provisioning และ browser QA ยังเป็นรายการค้างตามด้านบน
- ทำต่อ: อ่านสรุป flag และเลือกงานค้างตาม dependency; ล็อกมาตรฐานพื้นที่ใน decisions ก่อนเปลี่ยนฟอร์มเป็น dropdown จังหวัด/อำเภอ/ตำบล หรือทำ acceptance ของ F02/F03 ต่อ แล้วเพิ่ม handoff entry ของงานนั้น

### 2026-10-11 23:37 Asia/Bangkok — F03/F05: แผนที่ตำแหน่งร้านตอน Register

- งาน/Flag: ขยาย Register SELLER ในขอบเขต R1-D3-B / R1-D3-I; สถานะ F03/F05 ยังคง PARTIAL และ Daily Flag DOING
- ทำแล้ว: React Leaflet + OpenStreetMap โหลดฝั่ง client เมื่อกดเปิดแผนที่; คลิก/ลากหมุดเติม latitude/longitude และกรอกพิกัดเองได้; เพิ่มที่อยู่ข้อความที่เจ้าของร้านยืนยัน แสดงเครดิต OSM และแจ้ง tile error ผ่าน Sonner
- ไฟล์หลัก: apps/web/src/components/maps/, apps/web/src/app/register/page.tsx, apps/web/src/lib/api.ts, apps/api/src/auth/, apps/api/prisma/schema.prisma, migration 20261011164000_shop_address; อัปเดต API contract, Postman, README, Test.md และ web-frontend skill
- DB: migrate deploy สำเร็จ เพิ่ม shops.address แบบ nullable เพื่อรักษาร้านเดิม; API บังคับที่อยู่ 1–500 ตัวสำหรับสมัครร้านใหม่; ไม่แก้ baseline หรือ reset DB
- ผลตรวจจริง: web/API lint และ build ผ่าน; API unit tests 16 กรณีผ่าน (mock DB รวม invalid address); Prisma format/validate/generate ผ่าน; ทดสอบ ALTER เพิ่ม nullable address กับข้อมูลเดิมใน transaction แล้ว rollback ผ่าน; Prettier write/check ผ่านไฟล์ที่แก้
- Browser: แท็บร้านเปิด map/tiles และเครดิตได้; คลิกแผนที่สร้าง marker และเติมพิกัด 13.759394 / 100.497608 จริง; ยังไม่ได้ตรวจลากหมุด, responsive ล่าสุด หรือ submit สมัครครบทั้ง flow ผ่าน browser
- ค้าง: ไม่ทำ reverse geocoding/ค้นหาที่อยู่หรือขอ device location; area_code ยังไม่มีมาตรฐาน; map นี้เป็น register picker ยังไม่ใช่ F04 public shop map/search
- ทำต่อ: ล็อก master พื้นที่และตรวจ full Register E2E/owner isolation; ทำ store CRUD/approval และ public search ตาม dependencies ก่อนปิด Feature

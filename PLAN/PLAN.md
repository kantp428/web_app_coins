# THAI Please — Flag Board R1

รอบเป้าหมาย **7–13 ตุลาคม 2569 (Asia/Bangkok)**. บอร์ดนี้เก็บ Flag, สถานะ และ dependency; งาน/acceptance อยู่ในใบงาน 4 บทบาทด้านล่าง. วันที่เป็นเป้าหมาย ไม่ใช่หลักฐานว่าผ่านการตรวจรับ.

| บทบาท                                       | ใบงาน                            |
| ------------------------------------------- | -------------------------------- |
| A — ลูกค้า                                  | [APP_DEV_A.md](APP_DEV_A.md)     |
| B — ร้านค้า/รัฐ                             | [APP_DEV_B.md](APP_DEV_B.md)     |
| AI — Recommendation                         | [AI_DEV.md](AI_DEV.md)           |
| I — Backend/ข้อมูล/Integration และกติกากลาง | [INTEGRATION.md](INTEGRATION.md) |

## Feature Flags

| Feature | สถานะล่าสุด                                                                                   | วันเป้าหมาย            | เจ้าของ         | Dependency            |
| ------- | --------------------------------------------------------------------------------------------- | ---------------------- | --------------- | --------------------- |
| F00     | PARTIAL: repo/DB/baseline + demo seed 3 roles/20 nearby shops                                 | D1                     | I               | —                     |
| F01     | PARTIAL: Auth/Register contract + Postman มีแล้ว                                              | D1                     | I               | F00 ส่วนที่เกี่ยวข้อง |
| F02     | PARTIAL: Auth + wallet help/top-up/history + current-month Coins จริง                         | D2                     | I               | F01                   |
| F03     | PARTIAL: สมัคร PENDING + government approval/search จริง; owner CRUD ยังไม่มี                 | D3                     | I               | F02                   |
| F04     | PARTIAL: Login/Register + DB Explore pin/routes; account preview                              | D3                     | A               | F01/F02/F03           |
| F05     | PARTIAL: สมัครร้าน + government approval จริง; owner จัดการร้านยัง preview                    | D3                     | B               | F01/F02/F03           |
| F06     | PARTIAL: rules/linear ceil rates + QR Coin preview จริง; standalone preview TODO              | D4                     | I               | F02/F03               |
| F07     | TODO                                                                                          | D4–5                   | AI              | F03/F06               |
| F08     | PARTIAL: QR + Coins + Main Quest grant/spend/expiry จริง; ไม่รองรับ refund; review gates ค้าง | D5                     | I               | F06                   |
| F09     | PARTIAL: QR/Main Quest/wallet history จริง; monthly purchase history/AI ค้าง                  | D5                     | A               | F07/F08               |
| F10     | PARTIAL: Government + seller current Coins API/UI; seller transactions TODO                   | D5                     | B               | F06/F08               |
| F11     | DB views มีแล้ว; API TODO                                                                     | D6                     | I               | F08                   |
| F12     | SHELL ONLY: มี government routes; dashboard ยังไม่มี                                          | D6                     | B               | F11                   |
| F13     | PARTIAL: Auth tests/route checks; full E2E/NFR ยังไม่ครบ                                      | D6–7                   | ทุกคน / I รวมผล | F09–F12               |
| F14     | TODO                                                                                          | D7 หรือหลัง gates ผ่าน | ทุกคน / I รวมผล | F13                   |

## Daily Flags

สถานะรอบใหม่เริ่มที่ TODO; อัปเดตเป็น DOING → PR → DONE ตามผลจริง หรือ BLOCKED พร้อมลิงก์ issue. ไม่ยกสถานะ UI Preview เป็น DONE ของ Feature.

| วัน          | Daily Flag                  | Feature     | สถานะ                                                                                    | Dependency                                                                                                     | Issue / PR |
| ------------ | --------------------------- | ----------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------- |
| D1 / 7 ต.ค.  | [`R1-D1-A`](APP_DEV_A.md)   | F04/F09     | DOING                                                                                    | ใช้ UI เดิม; ส่ง field list ให้ I; browser QA 360/1920 px ยังต้องทำ                                            | —          |
| D1 / 7 ต.ค.  | [`R1-D1-B`](APP_DEV_B.md)   | F05/F10/F12 | DOING                                                                                    | ยังไม่เปลี่ยนสถานะร้านจริง; ส่ง DTO ที่ต้องใช้ให้ I                                                            | —          |
| D1 / 7 ต.ค.  | [`R1-D1-AI`](AI_DEV.md)     | F07         | TODO                                                                                     | ร่วมล็อก F01; ไม่คิด Coins/visited rule แยกจาก I                                                               | —          |
| D1 / 7 ต.ค.  | [`R1-D1-I`](INTEGRATION.md) | F00/F01     | DOING                                                                                    | ไม่แก้ baseline ที่ apply แล้ว; contract/seed พร้อมให้ทุกคนใช้                                                 | —          |
| D2 / 8 ต.ค.  | [`R1-D2-A`](APP_DEV_A.md)   | F04         | DOING                                                                                    | F01 + F02 ที่ merge แล้ว; fixture ใช้ได้เฉพาะ preview mode                                                     | —          |
| D2 / 8 ต.ค.  | [`R1-D2-B`](APP_DEV_B.md)   | F05         | DOING                                                                                    | F01/F02; role switch ต้นแบบไม่ใช่ auth guard                                                                   | —          |
| D2 / 8 ต.ค.  | [`R1-D2-AI`](AI_DEV.md)     | F07         | TODO                                                                                     | F01 + PrismaService; DB candidate filter ทดสอบได้โดยไม่รอ provider                                             | —          |
| D2 / 8 ต.ค.  | [`R1-D2-I`](INTEGRATION.md) | F02         | PARTIAL: wallet ส่งยอดช่วยเหลือคงเหลือรายวัน/เดือนจาก ledger จริง                        | F00/F01; current-month Coins read มีแล้ว; Main Quest API จริง; monthly history ยังไม่ครบ                       | —          |
| D3 / 9 ต.ค.  | [`R1-D3-A`](APP_DEV_A.md)   | F04         | PARTIAL: DB search/separate pin-shop maps/OSRM/Google Maps จริง                          | F03; drag/card-marker route/filter/360–1920 ผ่าน; GPS permission QA ยังไม่รัน                                  | —          |
| D3 / 9 ต.ค.  | [`R1-D3-B`](APP_DEV_B.md)   | F05         | DOING                                                                                    | F03; owner isolation, validation/error และสถานะ pending/approved                                               | —          |
| D3 / 9 ต.ค.  | [`R1-D3-AI`](AI_DEV.md)     | F07         | TODO                                                                                     | F03 + F06 interface ที่ตกลง; scoring adapter ชั่วคราวยังไม่ใช่ endpoint DONE                                   | —          |
| D3 / 9 ต.ค.  | [`R1-D3-I`](INTEGRATION.md) | F03         | DOING                                                                                    | F02; permission/filtering ที่ server; ส่งข้อมูลร้านจริงให้ทุกคน                                                | —          |
| D4 / 10 ต.ค. | [`R1-D4-A`](APP_DEV_A.md)   | F09         | TODO                                                                                     | F06 preview เมื่อ merge; ยังไม่อ้างว่าชำระสำเร็จหาก F08 ไม่พร้อม                                               | —          |
| D4 / 10 ต.ค. | [`R1-D4-B`](APP_DEV_B.md)   | F10         | PARTIAL: Government + seller current Coins API/UI; seller transactions TODO              | D5                                                                                                             | B          | F06/F08 |
| D4 / 10 ต.ค. | [`R1-D4-AI`](AI_DEV.md)     | F07         | TODO                                                                                     | F03/F06; ไม่มี candidate ส่ง empty; provider ล่มยังใช้ DB จริง                                                 | —          |
| D4 / 10 ต.ค. | [`R1-D4-I`](INTEGRATION.md) | F06         | PARTIAL: rules/linear ceil rates + QR Coin preview จริง; standalone preview TODO         | D4                                                                                                             | I          | F02/F03 |
| D5 / 11 ต.ค. | [`R1-D5-A`](APP_DEV_A.md)   | F09         | PARTIAL: Main Quest/QR/wallet history จริง; monthly history/AI ค้าง                      | F07/F08; กดซ้ำไม่ตัดยอด/เพิ่ม Coins ซ้ำ                                                                        | —          |
| D5 / 11 ต.ค. | [`R1-D5-B`](APP_DEV_B.md)   | F10/F12     | TODO                                                                                     | F08; ร้านเห็นเฉพาะรายการตน; F11 ยังไม่พร้อมใช้ contract fixture ชัดเจน                                         | —          |
| D5 / 11 ต.ค. | [`R1-D5-AI`](AI_DEV.md)     | F07/F13     | TODO                                                                                     | F07/F09; รายงานผลจริงและข้อจำกัด                                                                               | —          |
| D5 / 11 ต.ค. | [`R1-D5-I`](INTEGRATION.md) | F08         | PARTIAL: QR + Coins + Main Quest grant/spend/expiry; ไม่รองรับ refund; review gates ค้าง | F06; settlement/quest budget/duplicate/concurrency/month boundary DB ผ่าน; ไม่รองรับ refund; review gates ค้าง | —          |
| D6 / 12 ต.ค. | [`R1-D6-A`](APP_DEV_A.md)   | F13         | TODO                                                                                     | F04/F09; browser evidence และผลทดสอบจริง                                                                       | —          |
| D6 / 12 ต.ค. | [`R1-D6-B`](APP_DEV_B.md)   | F12/F13     | TODO                                                                                     | F11 เมื่อ merge; KPI ตรง seed และไม่เปิดเผยรายบุคคล                                                            | —          |
| D6 / 12 ต.ค. | [`R1-D6-AI`](AI_DEV.md)     | F13         | TODO                                                                                     | F07/F09; แนบ cases ที่ผ่าน/ไม่ผ่าน                                                                             | —          |
| D6 / 12 ต.ค. | [`R1-D6-I`](INTEGRATION.md) | F11/F13     | TODO                                                                                     | F08; report privacy/filter/KPI, 100 concurrent p95 ≤ 3s เป็นเป้าหมายไม่ใช่ผลยืนยัน                             | —          |
| D7 / 13 ต.ค. | [`R1-D7-A`](APP_DEV_A.md)   | F14         | TODO                                                                                     | F13 และ blocker ที่เกี่ยวปิดแล้ว                                                                               | —          |
| D7 / 13 ต.ค. | [`R1-D7-B`](APP_DEV_B.md)   | F14         | TODO                                                                                     | F12/F13; ไม่มี KPI mock ใน demo integrated                                                                     | —          |
| D7 / 13 ต.ค. | [`R1-D7-AI`](AI_DEV.md)     | F14         | TODO                                                                                     | F13; grounded response ตรวจซ้ำ                                                                                 | —          |
| D7 / 13 ต.ค. | [`R1-D7-I`](INTEGRATION.md) | F14         | TODO                                                                                     | F13 + PR ทุกคน; ไม่ tag หาก acceptance สำคัญยังไม่ผ่าน                                                         | —          |

อัปเดตตามงานใน working tree ณ **11 ตุลาคม 2569 (Asia/Bangkok)**; งานที่เริ่มทำระบุ DOING และยังไม่มี Daily Flag ที่ปิด DONE หรือเข้า PR จากหลักฐานรอบนี้. งาน Auth/Registration ทำได้แล้วไม่ได้แปลว่า F02/F03 ผ่านครบ เพราะ wallet/Coins, store CRUD/approval และ ownership acceptance ยังเหลือ. Release F14 ยังต้องรอ F13 และ gates ตาม [Integration](INTEGRATION.md).

## ความคืบหน้าที่ตรวจแล้ว — 11 ตุลาคม 2569

| ส่วน                         | ทำแล้ว                                                                                                                                                                                                                                                         | ยังค้าง / acceptance                                                                                                                                                                     |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F00/F01 — ข้อมูลและ contract | Demo seed CUSTOMER/SELLER/GOVERNMENT รันซ้ำไม่สร้างซ้ำ; Auth/Register contract, decisions และ Postman                                                                                                                                                          | PrismaService กลาง, seed ธุรกิจครบ scenarios, CI และ clean-database deploy/restore ยังไม่ครบ                                                                                             |
| F02 — Authentication         | Login/Register 3 roles, scrypt password hash, JWT อายุ 1 ชั่วโมงใน HttpOnly cookie, `/me`, Logout; layout ตรวจ role; Context + hooks + Axios กลาง                                                                                                              | Wallet/Coins reads จาก ledger, guard/ownership สำหรับ business API และ full auth E2E ยังไม่ครบ                                                                                           |
| F03 — ร้านค้า                | Register SELLER สร้าง user+shop แบบ atomic, owner ผูกบัญชีใหม่, server ตั้ง PENDING; validate รายละเอียดร้านและ address JSON                                                                                                                                   | Owner CRUD/multi-store, government approval/suspend, public search/filter และ owner-isolation tests ยังไม่มี                                                                             |
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

## ขอบเขตธุรกรรมล่าสุด — 13 ตุลาคม 2569

ผู้ใช้ยืนยันว่ารายการซื้อที่จ่ายสำเร็จไม่รองรับยกเลิก/คืนเงิน จึงไม่ต้องพัฒนา refund/reversal Coins เป็นงานค้างของ F08. เงินและ Coins ที่ commit แล้วคงอยู่; QR ที่ยังไม่จ่ายยังหมดอายุ/ยกเลิกก่อนชำระได้ตามระบบเดิม. ข้อกำหนด refund ที่ปรากฏในบันทึกเก่าเป็นบริบท ณ เวลานั้นและถูกแทนที่ด้วยขอบเขตนี้. F08 ยังคง PARTIAL จนผ่าน acceptance/review gates จริง ไม่ยกเป็น DONE จากการตัด scope.

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

### 2026-10-12 Asia/Bangkok — F03/F05: ตรวจ Register map ต่อ

- ขอบเขต R1-D3-B / R1-D3-I ยัง DOING; ใช้ web-frontend skill ตรวจ UI เดิม ไม่มีการแก้ application code
- Browser ผ่าน: กรอกพิกัดเองสร้าง marker; ลาก marker แล้ว latitude/longitude เปลี่ยนเป็น 13.744388 / 100.519753; ที่ viewport 360x800 แผนที่/เครดิตแสดงครบและไม่มี horizontal overflow (documentWidth 345, viewport 360)
- เริ่ม web dev ชั่วคราวเพื่อ QA เพราะ localhost เดิมหยุด; ปิด server ที่เริ่มในรอบนี้และคืน viewport หลังตรวจ
- ผลตรวจรอบก่อนยังใช้ได้: web/API lint/build, API unit tests 16, Prisma และ formatting ผ่าน; รอบนี้แก้เอกสารเท่านั้นและตรวจ Prettier write/check
- ค้าง: full successful register E2E และ persistence ผ่าน HTTP ยังไม่ได้ตรวจ; ไม่มี reverse geocoding; area_code/master พื้นที่ยังต้องล็อก
- ทำต่อ: ตรวจสมัครจริงครบ flow ใน test environment และ owner CRUD/approval ตาม F03 dependencies; ไม่ยก F03/F05 เป็น DONE จาก map picker

### 2026-10-12 Asia/Bangkok — F03/F05: JSON address + automatic reverse geocoding

- Flags R1-D3-B/R1-D3-I ยัง DOING: เปลี่ยน shops.address เป็น JSONB {line1,province,district,subDistrict,postcode}; migration 20261012001000_shop_address_json apply สำเร็จ รักษา text เดิมเป็น line1/null เดิมเป็น null
- Web: แยกช่องที่อยู่ แก้เองได้; useReverseGeocode + Axios กลาง debounce800ms/abort stale responses, retry button, Sonner errors; PC Ctrl+wheel zoom โดยไม่เปิด ordinary scroll zoom
- API: GET /geocoding/reverse ผ่าน Next GET /api/geocoding; validate coordinates; configurable Nominatim provider, queue max3, serialized >=1100ms, 24h/500-entry cache; รับ registration address JSON แบบ whitelist/trim/length/postcode validation
- ไฟล์: src/components/maps/, register/page.tsx, hooks/use-reverse-geocode.ts, lib/api.ts, api/geocoding/route.ts (web); src/geocoding/, app.module.ts, src/auth/, prisma/schema.prisma + migration (API); contract/Postman/env.example/README/Test.md/decisions และ web-frontend skill
- ตรวจผ่าน: web/API lint/build; API tests 22 (Bangkok/provincial parser, invalid inputs, cache, provider failure และคิว >=1100ms); Prisma format/validate/generate; DB transaction ทดสอบ text/null conversion แล้ว rollback และตรวจ shops.address เป็น jsonb; Prettier write/check ไฟล์ที่แก้
- HTTP จริง: reverse พิกัดตัวอย่าง 13.7455/100.534 ได้สยามสแควร์ซอย 4 / กรุงเทพมหานคร / ปทุมวัน / ปทุมวัน / 10330; invalid latitude91 ได้400. Browser กรอกพิกัดแล้วทั้ง5ช่องเติมอัตโนมัติจริง
- ค้าง: Ctrl+wheel ยังไม่ได้ยืนยันด้วย wheel interaction ใน browser; responsive รอบ JSON และ successful register E2E ยังไม่ครบ; area_code ไม่อนุมานจาก postcode. ข้อมูล provider อาจขาด ต้องให้เจ้าของยืนยัน/เติม
- ข้อจำกัด deployment: คิว/cache อยู่ใน API process เดียว ต้องมี shared limiter/cache หรือใช้ provider อื่นก่อน scale replicas ตาม Nominatim policy; ใช้เฉพาะ user-triggered reverse lookup ไม่ใช้ autocomplete/bulk
- ทำต่อ: browser wheel/responsive + successful register E2E, owner CRUD/approval ตาม dependency; ไม่ปิดทั้ง F03/F05 จากงานนี้

### 2026-10-12 Asia/Bangkok — F05: ปรับ Ctrl+wheel zoom ให้ต่อเนื่อง

- Flag R1-D3-B ยัง DOING; แก้ apps/web/src/components/maps/shop-location-map.tsx ด้วย web-frontend/format-prettier skills
- สาเหตุ: handler เดิม setZoom ±1 ทุก wheel event และ animate:false ทำให้ trackpad/wheel กระโดดระดับและตัด animation
- เปลี่ยนเป็น Leaflet native wheel handler (รวม delta, debounce80ms, zoom รอบ cursor, animation) กำหนด zoomSnap0.25/zoomDelta0.5 และ wheelPxPerZoomLevel120; capture listener ยอมให้ Leaflet รับเฉพาะ Ctrl+wheel ส่วน wheel ปกติเลื่อนหน้า และ block browser Ctrl zoom ขณะ disabled
- ตรวจผ่าน: Prettier write/check, web lint และ production build; อ่าน implementation ของ Leaflet ที่ติดตั้งยืนยัน delta batching/zoomAround ใช้ public options ไม่มีการเรียก private API
- ค้าง: ยังไม่ได้ทดสอบ physical Ctrl+wheel/trackpad gesture จริง; ไม่อ้าง browser smoothness acceptance หรือปิด F05
- ทำต่อ: ลอง Ctrl+wheel บน mouse/trackpad ทั้งซูมเข้าออก/ตำแหน่ง cursor และ ordinary scroll; ปรับ sensitivity ตามผลจริง ก่อนทำ register E2E ที่ค้าง

### 2026-10-12 Asia/Bangkok — F05: แผนที่ท้ายข้อมูลร้านและที่อยู่แสดงผลอย่างเดียว

- R1-D3-B ยัง DOING; ตามคำสั่งผู้ใช้ย้าย ShopLocationPicker ลงหลังเวลาเปิด–ปิด/ขนาดร้าน ก่อน credentials ใน /register
- เปลี่ยนบ้านเลขที่/ถนน จังหวัด เขต/อำเภอ แขวง/ตำบล postcode และ latitude/longitude จาก input เป็น dl/dt/dd อ่านอย่างเดียวใต้แผนที่; watch ค่า form ที่เติมจาก geocoding และส่ง payload JSON เดิม; areaCode ยังเป็นช่องกรอกแยกตาม contract ที่ยังไม่ล็อก
- เมื่อ provider คืนบางส่วน ไม่บังคับ field ที่ผู้ใช้แก้ไม่ได้ให้ครบทุกช่อง; validate ความยาว/รูปแบบและอย่างน้อยหนึ่งส่วนของที่อยู่ให้ตรง API พร้อม retry/toast. คำสั่งนี้แทนแนวทาง manual address inputs เดิมเฉพาะหน้า Register
- ไฟล์แก้ apps/web/src/app/register/page.tsx และ components/maps/shop-location-picker.tsx; ไม่เปลี่ยน API/schema
- ผลตรวจ: Prettier write/check, web lint และ production build ผ่านหลังเอา inputMode branch ของพิกัดที่ไม่ได้เป็น input แล้วออก
- ค้าง: ยังไม่ได้ browser QA layout ล่าสุด/submit สมัครสำเร็จ; ถ้า provider ใช้ไม่ได้ให้ retry หรือเลือกตำแหน่งใหม่ ข้อมูลพื้นที่อาจไม่ครบ
- ทำต่อ: ตรวจ browser responsive, retry และ JSON submit E2E; F03/F05 ยังไม่ปิด DONE

### 2026-10-12 Asia/Bangkok — F03/F05: categories many-to-many

- R1-D3-I/R1-D3-B ยัง DOING; user authorized DB adjustment. เพิ่ม categories(category_id/name unique/slug unique) และ shop_categories composite PK(shop_id,category_id), FK + reverse index; migration 20261012003000_shop_categories apply สำเร็จ
- ย้าย legacy shops.category เป็น master/join แล้วลบคอลัมน์เดิม; rebuild ix_shops_map ตาม status/area. Master เริ่ม 7 หมวดไทยและรักษาหมวดเดิมเป็นรายการเพิ่ม; taxonomy prototype บันทึก decisions แล้ว
- API: GET /categories public คืน ID string/name/slug; register SELLER รับ categoryIds 1–10 unique positive bigint strings ตรวจ master ก่อน atomic user/shop/join; invalid/unknown/duplicate ได้400 ไม่สร้างบัญชี
- Web: GET /api/categories + useCategories ผ่าน Axios กลาง; Register เลือกหลายหมวดจาก DB พร้อมโหลด/retry/Sonner. Wallet fixtures ไม่เปลี่ยนและยังไม่ใช่ search integration
- ไฟล์: prisma/schema.prisma + migration, src/categories/, app.module.ts, src/auth/ (API); register/page.tsx, lib/api.ts, hooks/use-categories.ts, api/categories/route.ts (web); contract/Postman/README/decisions/Test.md
- ตรวจผ่าน: isolated-schema migration ใน DB transaction ครอบ backfill legacy/หลายหมวด/duplicate PK/FK invalid แล้ว rollback (ไม่ใช่ clean full-database baseline test); nested Prisma user/shop/2หมวดจริงและ rollback ไม่เหลือบัญชี QA; GET /categories จริงได้7รายการ; browser เลือกคาเฟ่+เบเกอรี่พร้อมกันได้
- ตรวจผ่าน: web/API lint/build, API tests23, Prisma format/validate/generate, Prettier write/check ไฟล์ที่แก้; migration deploy สำเร็จ
- ค้าง: taxonomy ยังต้อง business review, category admin endpoint ยังไม่มี; full HTTP register/browser submit E2E, clean full-database deploy และ owner CRUD/public filter ยังต้องทำ
- ทำต่อ: business taxonomy review + owner CRUD/filter ด้วย relation ใหม่, register E2E ก่อนปิด F03/F05; ใช้ IDs จาก GET /categories ไม่ hardcode ID

### 2026-10-12 Asia/Bangkok — F05: Search multiple category dropdown

- R1-D3-B ยัง DOING; เปลี่ยนปุ่มหมวดใน Register เป็น shadcn/Base UI Combobox multiple ค้นหาชื่อจาก master ที่โหลดผ่าน hook/Axios เดิม เลือกหลายรายการ แสดง chips และลบแต่ละหมวดได้; จำกัด10หมวดผ่าน toast; selected values ยังคง categoryIds
- ไฟล์: register/page.tsx, components/maps/shop-category-select.tsx, ui/combobox.tsx + input-group.tsx/textarea.tsx (shadcn dependencies); button/input ถูก generator เขียนรูปแบบใหม่แล้ว Prettier ทำกลับเหมือนเดิม ไม่มี behavior diff
- ตรวจผ่าน: browser ค้นหาคาเฟ่/เบเกอรี่ เลือกสองหมวดผ่าน ArrowDown/Enter, Escape ปิด; ปุ่มลบคาเฟ่ทำงาน ช่องค้นหาล้างหลังเลือก และผลไม่มีรายการแสดงไม่พบหมวดหมู่; web lint/build และ Prettier write/check ผ่านไฟล์ที่แก้
- API/schema ไม่เปลี่ยน ไม่รัน API tests ซ้ำจาก UI-only task; ค้าง responsive ล่าสุด/full successful register E2E
- ทำต่อ: responsive dropdown/keyboard focus และ register submit E2E ต่อ; ไม่ปิด F05 ทั้ง feature

### 2026-10-12 Asia/Bangkok — F05: ค้นหาภายใน dropdown เท่านั้น

- R1-D3-B ยัง DOING; เปลี่ยน shop-category-select.tsx ให้ช่องหลักเป็น trigger แสดงชื่อหมวดที่เลือก ไม่มีช่องพิมพ์ก่อนเปิด dropdown
- ช่องค้นหาอยู่บน popup พร้อม autofocus; เลือกหลายหมวด/ยกเลิกโดยกดรายการเดิม จำกัด10หมวด และล้างคำค้นเมื่อเลือก/ปิด; ใช้ categoryIds เดิม ไม่แก้ API/schema
- ตรวจผ่าน: browser กดเปิดก่อนจึงแสดงช่องค้นหา ค้นหาคาเฟ่และเบเกอรี่ผ่าน ArrowDown/Enter แล้ว Escape ปิด ช่องหลักแสดงทั้งสองหมวด; Prettier write/check, web lint/build ผ่าน
- ค้าง: responsive/full register submit E2E ตามรายการเดิม; ทำต่อ keyboard/refocus และ responsive acceptance ก่อนปิด F05

### 2026-10-12 Asia/Bangkok — F05: ปรับสี category dropdown/search

- R1-D3-B ยัง DOING; สาเหตุพื้นหลังเทาจาก shadcn ComboboxContent child input-group bg-input/30; เปลี่ยนเป็น bg-popover ให้ตรงพื้น dropdown และใช้ border-input ปกติ
- เอา visual aria-invalid:border-destructive ออกจาก category trigger ตามคำสั่งผู้ใช้ ช่องว่าง/validation ไม่ทำกรอบแดง; คง aria-invalid สำหรับ accessibility และ Sonner validation เดิม
- ไฟล์ components/ui/combobox.tsx และ components/maps/shop-category-select.tsx; ไม่แก้ API/schema
- ผลตรวจ: Prettier write/check, web lint/build ผ่าน; ยังไม่ได้ visual browser QA สีรอบนี้
- ทำต่อ: ตรวจสี light/dark และ responsive พร้อม full Register E2E ที่ค้าง; ไม่ปิด F05

### 2026-10-12 Asia/Bangkok — F05: เอากรอบเทา search และเพิ่ม gap

- R1-D3-B ยัง DOING; แก้ globals.css เฉพาะ .shop-category-dropdown ให้ input-group/control รวม focus-within/focus-visible ไม่มี border/outline/box-shadow ใช้พื้น popover; shop-category-select.tsx เพิ่ม mt-2 ให้รายการห่าง search 8px
- ตรวจ browser ขณะ autofocus: computed border0px/outline none/shadow none ทั้ง wrapper และ input; list marginTop8px และ screenshot แสดงช่องค้นหาไร้กรอบเทาจริง
- Prettier write/check, web lint และ production build ผ่าน; ไม่แก้ API/schema ไม่ต้องรัน API tests ซ้ำ
- ค้าง responsive/dark mode/full register E2E ตามเดิม; ทำต่อ acceptance ดังกล่าวก่อนปิด F05

### 2026-10-12 Asia/Bangkok — F05: คืนกรอบ search บาง คงไม่มีเงา

- ตามคำชี้แจงผู้ใช้ คืน border1px var(--input) ให้ search input-group ทั้งปกติ/focus ใน globals.css; คง box-shadow none/outline none และพื้น popover เดิม ช่อง input ด้านในไม่มีกรอบซ้อน; gap8px เดิม
- R1-D3-B ยัง DOING; Prettier write/check, web lint/build ผ่าน; ไม่แก้ API/schema ไม่มี browser QA เพิ่มรอบนี้
- ทำต่อ responsive/dark-mode/full register E2E ตามรายการค้างเดิม

### 2026-10-12 Asia/Bangkok — F05: ตัดชื่อหมวดที่ยาวด้วย ellipsis

- R1-D3-B ยัง DOING; shop-category-select.tsx เปลี่ยน selected label เป็น truncate บรรทัดเดียว แสดง ellipsis เมื่อเกินพื้นที่; title เก็บชื่อเต็มให้ hover ดูได้ ไม่ตัดค่าหมวดที่ส่ง API
- ตรวจผ่าน Prettier write/check, web lint/build; ไม่เปลี่ยน API/schema; ยังไม่ได้ browser overflow QA รอบนี้
- ทำต่อ responsive/overflow visual และ full Register E2E ตามรายการเดิม

### 2026-10-12 Asia/Bangkok — F05: แก้กรอบ search ขาด/ซ้อน

- สาเหตุ input สูง32px อยู่ใน wrapper สูง32px ที่มี border ทำให้พื้นที่ด้านในเหลือ30px; พื้น input บังกรอบล่างและ addon ว่างทำให้ช่องขวาเหลือ
- แก้ globals.css ให้ input height100%/min-height0 พื้นโปร่งใส และ wrapper overflow hidden; combobox.tsx ไม่ render addon เมื่อไม่มี trigger/clear; กรอบบาง1px/ไม่มีเงาและ gap8px เดิม
- ตรวจ browser screenshot ขณะ autofocus กรอบบางโค้งครบแล้ว; Prettier write/check, web lint/build ผ่าน; R1-D3-B ยัง DOING
- ค้าง responsive/dark mode/full Register E2E ตามเดิม

### 2026-10-12 Asia/Bangkok — F05: ใช้ตำแหน่งปัจจุบันตอนสมัครร้าน

- R1-D3-B ยัง DOING; เพิ่มปุ่มใช้ตำแหน่งปัจจุบันใน components/maps/shop-location-picker.tsx เรียก navigator.geolocation.getCurrentPosition เมื่อกดเท่านั้น (high accuracy/timeout15s/cache60s)
- สำเร็จเปิดแผนที่และส่งพิกัด6ตำแหน่งเข้า form/hook geocoding เดิม จึงย้ายหมุดและเติม address JSON อัตโนมัติ; ปิดการกดซ้ำ/เปลี่ยนหมุดระหว่างหา location และไม่อัปเดตหลัง component unmount
- Error permission denied/timeout/unavailable/unsupported ใช้ Sonner และให้เลือกหมุดเอง/ลองใหม่; แสดงคำอธิบายขอสิทธิ์และส่งพิกัดไป Nominatim ก่อนใช้
- Prettier write/check, web lint/build ผ่าน; ยังไม่ได้ยืนยัน geolocation จริงของอุปกรณ์/permission prompt ใน browser ไม่อ้าง end-to-end location acceptance
- ไม่แก้ API/schema; ทำต่อทดสอบบนอุปกรณ์จริงผ่าน HTTPS/localhost และ full Register E2E ตามเดิมก่อนปิด F05

### 2026-10-12 Asia/Bangkok — F03/F05: วันเปิด dropdown/select-all และแถบเวลา

- R1-D3-B/R1-D3-I ยัง DOING; เพิ่ม components/maps/shop-opening-hours.tsx ใน Register: shadcn multiple Select วันจันทร์–อาทิตย์, เลือกทุกวัน/ยกเลิกทุกวัน, เลือกบางวันได้; แถวเวลาเปิด—ปิดใช้ HH:mm24h แบบข้อความเพื่อไม่ให้ locale AM/PM ถูกตัดบนมือถือ
- API/register รับ openingHours JSON {days,open,close,timeZone:Asia/Bangkok}; validate1–7วันไม่ซ้ำ รหัสวันถูกต้อง เวลา00:00–23:59 ไม่เท่ากัน; close<open คือปิดวันถัดไป แสดงคำอธิบายใน UI. เวลาเดียวกันทุกวันที่เลือก; daily/multiple intervals/24h ยังนอก scope
- ไม่ต้อง migration เพราะ opening_hours เดิมเป็น Json; รักษาข้อมูลเก่า {text} ไม่ rewrite. Future read API ต้องรองรับ legacy/new shapes จนกว่าจะตกลง backfill
- ไฟล์: register/page.tsx, lib/api.ts, components/maps/shop-opening-hours.tsx; API auth.service.ts/spec; Postman + contract/decisions/Test.md
- ตรวจผ่าน: API tests24 รวม invalidวัน/ซ้ำ/เวลา/timezone และ overnight; API lint/build, web lint/build, Prettier write/check
- Browser: เลือกทุกวันครบ7, ยกเลิกครบ, เลือกจันทร์+ศุกร์ได้; กรอก18:00–02:00แสดงปิดวันถัดไป; viewport360ไม่มี horizontal overflow. พบ native time12hแคบบนมือถือจึงเปลี่ยนเป็น explicit24h text และทดสอบค่าทั้งสองผ่าน
- ค้าง full HTTP/browser successful registration และ legacy-read/backfill acceptance; ทำต่อ E2E + owner CRUD ตาม dependencies ไม่ปิด F03/F05 จากงานนี้

### 2026-10-12 Asia/Bangkok — Review: Coins ต่อร้าน/วัน

- อ่าน schema/CoreIdea/Integration เพื่ออธิบาย coin_rule_versions (กติกา), purchases (ร้าน/ยอดขาย/เวลา), coin_entries (แต้มที่ให้จริง) และ monthly_periods (รอบเดือน); ไม่มีตารางกำหนด Coins คงที่ต่อร้านต่อวัน
- ไม่แก้ schema/API/code หรือเปลี่ยน Flag; F06/F08 ยังต้อง implement ตาม plan. ยอดรายวันต้องเลือกวัน awarded_at หรือ confirmed_at ตามนิยามรายงาน ใช้ Asia/Bangkok และพิจารณา reversed_at/refund
- ทำต่อถ้าต้องการ daily shop override ต้องล็อก priority/ช่วงเวลาทับซ้อน/ลูกค้าใหม่หรือซ้ำใน decisions ก่อนเพิ่ม table; รอบนี้ตรวจเอกสารเท่านั้น Prettier write/check PLAN ผ่าน

### 2026-10-12 Asia/Bangkok — Review: เงินในบัญชี

- ตรวจ schema และ migration: wallets แยก CASH/BASE/REWARD, money_entries เก็บ signed_amount; v_wallet_balances ให้ available_balance โดย REWARD ใช้สิทธิที่ยังไม่หมดอายุผ่าน v_main_quest_grant_balances
- balance/help_balance ไม่ใช่ column จริง; ชื่อ response ต้องตกลง mapping โดยแยกเงินลูกค้า/สิทธิพื้นฐาน/รางวัลตาม Integration. ไม่แก้ schema/API หรือสถานะ Feature; ตรวจเอกสารเท่านั้น ไม่รัน tests. งานถัดไปเชื่อม wallet API กับ ledger/view ตาม contract

### 2026-10-12 Asia/Bangkok — F06/F08: Coin rate period storage

- เพิ่ม coin_rate_periods (global half-open timestamptz windows, unique start, GiST exclusion กันทับซ้อน) และ shop_coin_rates (unique shop/period, FK shop/rule/period, Coins1–10, decimal sales snapshot/window); migration 20261012005000_coin_rate_periods apply DB สำเร็จ ไม่มีข้อมูลเดิมเปลี่ยน
- แก้ schema.prisma, migration, prisma/test-coin-rates.mjs, decisions/contract/Postman description. Prisma format/validate/generate และ API build ผ่าน; isolated clean schema test พร้อม parent stubs ผ่าน adjacent/overlap/invalid window/duplicate/FK/Coin bounds/negative sales แล้ว rollback ไม่สร้าง QA data ค้าง; ไม่ได้ run full clean DB seed
- F06 เป็น PARTIAL เฉพาะ schema; F08 ยัง TODO. ยังไม่มี endpoint/scheduler/rate rows หรือ ledger linkage. เวลา06/18และนิยามลูกค้าใหม่/ซ้ำยังต้องล็อกก่อน implement rate generation/award. ขั้นต่อไปผูก transaction กับเรตและทดสอบ concurrency ตาม F08; Prettier write/check ไฟล์ที่รองรับผ่าน (.prisma ใช้ prisma format, SQL ไม่มี formatter ที่ติดตั้ง)

### 2026-10-12 Asia/Bangkok — R1-D4-I/B F06/F10: Government Coin Rules

- เพิ่ม GET/POST /government/coin-rules ตรวจ JWT+ACTIVE user ผ่าน AuthService.me และ role GOVERNMENT; validation ตาม DB (repeat1, new-low8–10, other1–low, decimal money, days1–3650). GET rules50 + periods10/rates100ต่อรอบพร้อม count; IDs/decimalเป็น string. POST ใช้ transaction advisory lock สร้าง version ใหม่/ปิด effective_to เดิม เริ่ม cutoffถัดไป06/18เวลาไทย;409ถ้ามีกฎรอเริ่ม ป้องกัน double-submit
- Web /government/coin-rules ฟอร์ม RHF/Zod + Axios/useCoinRules, BFF /api/government/coin-rules ใช้ HttpOnly cookie และตรวจ Origin POST; current/pending/history, stored periods/rates, Sonner validation/result/retry, ConfirmDialog, ปิด inputขณะ pending. ไม่มี endpoint edit/delete; preserve locked rates. อัปเดต docs/decisions.md, docs/api-contract.md และ Postman มี201/400/401/403/409
- ตรวจ: API lint/build และ tests33 ผ่าน; web lint/build ผ่าน; Prisma schemaไม่เปลี่ยน. prisma/test-government-coin-rules.mjs รัน migration chain ทั้งหมดบน clean isolated schema, real DB concurrent createสำเร็จ1/conflict1,อ่าน persistence/version rollover/old values preserved ผ่าน แล้วลบ schemaทดสอบ ไม่สร้างกฎตัวอย่างใน public DB; seedไม่ได้รัน
- HTTPจริง Government GET200/invalidPOST400, Seller GET+POST403, unauthAPI+web401, cross-origin webPOST403. Browser demo Government:โหลด empty DB, invalidแสดงSonner, validเปิดConfirmDialogและcancel;360/1920ไม่มีhorizontal overflow. ไม่ submit valid rule ผ่าน browserบน publicDB; success persistenceตรวจผ่าน isolated service integration
- F06/F10ยัง PARTIAL: หน้าGovernment rule managementพร้อม แต่ purchase preview/seller display/schedulerสร้าง shop_coin_rates และ F08 award linkageยังค้าง. Next: implement period generationจาก sales snapshot/active rule และผูก purchase/coin_entriesกับrate;ตรวจ concurrency/period boundary/refunds. Prettier write/checkไฟล์แก้ผ่าน

### 2026-10-12 Asia/Bangkok — F06/F10: mock historical rules

- เพิ่ม prisma/seed-coin-rules.mjs และ package script seed:coin-rules; บันทึก3 expired versions1–3 ลง DB สำเร็จ ช่วง1ก.ย.–1ต.ค.2569 ไม่มี active/pending rule ใหม่. เจ้าของ demo_governmentเดิม;shared advisory lock, production guard, exact-match idempotency, collision/overlap abort ไม่เปลี่ยนข้อมูลเดิม
- เพิ่ม prisma/test-seed-coin-rules.mjs ตรวจ clean migration chain+seed/idempotency/version collision preserving existing data ผ่าน แล้วลบ QA schema;รันseedจริง2ครั้ง created3/existing3. ตรวจข้อมูล DBโดยตรง; HTTPไม่ได้ตรวจเพราะport3000 ECONNREFUSED ไม่มีserverรัน รอบนี้ไม่เปลี่ยนUI/API/schema
- เอกสาร decisions/Test.md อัปเดต; Prettier write/checkไฟล์ที่แก้ผ่าน. F06/F10ยังPARTIALตามเดิม; nextเปิดAPI+webแล้วrefreshหน้าประวัติ, generation/preview/awardค้างตามhandoffเดิม

### 2026-10-12 Asia/Bangkok — R1-D4-B F10: Government desktop layout

- ปรับ components/auth/government-shell.tsx ใช้desktop sidebar248px sticky full-heightทุกหน้าGovernment, icons/current-page, account identity/footer, top breadcrumb และ content max1600px;จอ<lgใช้ปุ่มเปิด/ปิดเมนู aria-expanded/controls และปิดหลังเลือกroute
- coin-rules/page.tsx ฟอร์ม3คอลัมน์บนxl,2บนsm,1บนmobile;ประวัติกฎเป็นsemantic table10คอลัมน์ (version/status/effective dates/money/window/Coins),เงิน2ทศนิยม/mono, status badges,loading/empty, focusable horizontal scroll region. ไม่เปลี่ยนAPI/DB/กติกา
- ตรวจbrowserจริง1920pxเห็นDB mock3rows,sidebarและform/table;360px documentWidth345ไม่มีpage overflow,เมนูเปิด/เลือกบัญชีแล้วปิดผ่าน. Web lint/buildและPrettier write/checkผ่าน;ไม่มีtestsใหม่เพราะเป็นlayout. F10ยังPARTIALตามdependenciesเดิม;next seller rule/transactionsและrate generationตามhandoff

### 2026-10-12 Asia/Bangkok — F06/F10: active mock rule

- เพิ่ม prisma/seed-current-coin-rule.mjs + package seed:coin-rules:current; shared lock/production guard, preserve active/refuse pending, version max+1 current Bangkok cutoff. รันจริงได้version4และรันซ้ำexisting4;ไม่เปลี่ยนhistorical1–3หรือshop rates/ledger
- test-seed-coin-rules.mjsเพิ่ม current seed/idempotency/effective_from<=now/effective_to null/count4;clean migration isolated DB testผ่านและลบQA schemaแล้ว. Prettier write/checkผ่าน;ไม่มีUI/API/schema change,ไม่รันbuildซ้ำ. F06/F10ยังPARTIAL;nextrefreshGovernmentเพื่อเห็นv4และทำgeneration/preview/awardตามเดิม

### 2026-10-12 Asia/Bangkok — F03/F04: Nearby shops replaces area_code

- User supersedes area-based discovery/grouping. Migration20261012006000_nearby_shops applyจริง:drop shops.area_code,rebuild status index; purchases.shop_area_snapshot nullable deprecated audit-onlyรักษาประวัติเดิม/report indexไม่ใช้area. เอาareaCodeออกRegister schema/default/input/payload/APIvalidation/nestedcreate/specและlib types. Applied baseline migrationsไม่แก้
- เพิ่ม GET /stores CUSTOMER-only authenticated:requiredlat/lng,radius0.1–50 default5km,APPROVED only,HaversineparameterizedSQL nearest/id order limit50. Web BFF /api/stores+Axios/useNearbyStores,NearbyStores componentแทนExplorefixtures:opt-in current location,manualcoordfallback,radius,abort/stale guard,Sonnererrors,pending/empty. ไม่เก็บcustomercoordหรือส่งgeocoder. Home/AI fixturesส่วนอื่นยังpreview;ไม่มีCoinestimateก่อนpreview/rate service
- APIlint/tests36/buildผ่าน;cleanfullmigration+DBintegration test-nearby-stores.mjsผ่านnoarea shopinsert/approvedonly/order/radius/zero-distance/date-line/empty,ลบQA schemaแล้ว. Prismaformat/validate/generateผ่าน. HTTP CUSTOMER200/invalid400,SELLER403,unauth401. Browsercustomer manual13.75/100.5 returns emptyจริง,360pxไม่overflow;actualdevice geolocationยังไม่ทดสอบ
- Docsdecisions/contract+Postmanregister bodiesและnearby200/400/401/403ปรับแล้ว. Weblint/build+Prettierwrite/checkผ่าน;SQLไม่มีformatterและ.prismaใช้prismaformat. F03/F04ยังPARTIAL(approvalCRUD/homeintegration/coinpreviewค้าง),F07AI scopeและF11geographicimpactdefinitionsต้องปรับตามdecisionใหม่ก่อนทำ. Nextอนุมัติ/seedร้านสำหรับcustomerfullnearbyflowและต่อAI/previewตามradius;ไม่เรียกcompletionของทั้งfeature

### 2026-10-12 09:12 Asia/Bangkok — F03/F05/F07: Shop description context

- เพิ่มshops.description nullableVARCHAR2000พร้อมnonemptycheck migration20261012007000_shop_description applyจริง;legacyNULLไม่backfill. RegisterSELLERบังคับtrim1–2000,textareaใต้ชื่อร้านพร้อมตัวอย่างเมนู;AuthService atomicnestedwrite และGET/storesส่งdescription:string|null. ไม่ได้เชื่อมmodel/recommendationในรอบนี้
- ไฟล์schema/migration,auth.service+spec,stores.controller,register/page,lib/api,test-nearby-stores.mjs,contract/decisions/Postmanปรับ;invalidmissing/blank/over2000และtrimcoveredในAPItests36ผ่าน. CleanmigrationDBintegrationตรวจThai description roundtrip/legacyNULL/blankconstraintผ่านแล้วลบQA schema;Prismaformat/validate/generateผ่าน,API+weblint/buildผ่าน,Prettierwrite/checkผ่าน
- BrowserRegisterSELLERเห็นtextareaใต้ชื่อร้าน,กรอกตัวอย่างภาษาไทยได้และmaxlength2000;ไม่ได้submitfullregistrationบนpublicDB. F03/F05ยังPARTIAL,F07ยังTODO;nextrecommendationcandidateส่งdescriptionเป็นuntrusteddataตามdecisions,ไม่ใช้เป็นmodelinstruction;owneredit/backfillตามCRUDงานถัดไป

### 2026-10-12 13:35 Asia/Bangkok — R1-D2-I/F02 + R1-D5-I/F08: wallet audit

- ตรวจแบบ read-only พบว่า Prisma/baseline มี wallets, money_entries, purchases, coin_entries, reward_grants, monthly_periods และ views คำนวณยอด/Coins พร้อม constraints ด้านชนิด wallet, ledger sign, purchase idempotency และ grant ต่อเดือน แต่ AppModule ไม่มี wallet/purchase service หรือ controller; route ที่มีจริงจึงยังอ่านยอด, preview/confirm purchase, ledger, history, quest grant หรือ refund ไม่ได้ และ Postman ไม่มี wallet/purchase contract ที่ใช้งานได้
- หน้า customer/seller wallet ยังใช้ fixture ใน components/wallet/wallet-app.tsx สำหรับยอด, Coins 64/100 และประวัติ 3 รายการ; เฉพาะ nearby stores ที่แยก component เชื่อม GET /stores แล้ว. docs/api-contract.md ระบุ rate storage/rules มีแล้ว แต่ scheduler, preview, award และ ledger linkage ยัง pending. ดังนั้น F02 คง PARTIAL และ F08 คง TODO; ไม่แก้ application code หรือ business rule
- ตรวจ route/module/schema/contract และ baseline SQL แล้ว. `pnpm --filter api test` ไม่จบและไม่มี output ภายในประมาณ 90 วินาทีจึงยุติ; การอ่านจำนวนแถว DB และ `prisma migrate status` ทำไม่ได้เพราะ network sandbox และคำขอสิทธิ์เชื่อมต่อภายนอกถูกปฏิเสธ จึงยังไม่ยืนยันข้อมูล runtime ปัจจุบัน. Next: ล็อกกติกา allocation/preview ที่ยังค้าง แล้ว implement authenticated wallet read จาก ledger/view ก่อน ต่อด้วย F06 preview และ F08 transaction/idempotency/concurrency tests พร้อม contract/Postman

### 2026-10-12 13:52 Asia/Bangkok — R1-D2-I/F02 + R1-D5-I/F08 + F04/F05/F09/F10: live wallet and one-time QR payments

- เพิ่ม migration 08000/09000, payment_requests และ ledger linkage: CUSTOMER มี CASH(balance)+BASE(help 1,000 บาท/เดือน lazy idempotent), SELLER มี CASH; top-up จำลอง, test reset help แบบ append-only, history จำกัดตาม user. QR UUID ใช้ครั้งเดียว; transaction lock request/wallet, หัก BASE60%+CASH40% และเครดิต seller100%, เงินไม่พอหรือใช้ซ้ำ rollback/409. demo seller ไม่มีร้านจึงอนุญาต shop nullable และใช้ display name; กติกาบันทึกใน decisions/contract
- เพิ่ม API GET wallets/me/history/payment-requests/:id; POST wallets/top-up/help/reset, seller/payment-requests, payment-requests/:id/pay พร้อม Postman. Web BFF /api/wallet และ LiveWallet แทน fixture ใน home/history/receive: เติมเงิน, reset help, กรอกรหัส QR/preview/confirm, seller สร้าง payload และดู history. ยังไม่มี camera QR renderer/decoder, Coins award, refund/cancel/expiry และ automated concurrent/insufficient/month-boundary DB tests จึงคง Feature เป็น PARTIAL
- Applied migrations สำเร็จบน configured development DB. E2E demo จริง: login CUSTOMER/SELLER200, top-up1.00→balance1.00, create QR1.00→preview help0.60/cash0.40, pay201, payซ้ำ409, reset→help1000.00, customer/seller history200; test dataค้างเป็น ledger audit ตาม design. Checks: Prisma format/validate/generateผ่าน; API lint/build + Vitest36ผ่าน; web lint/buildผ่าน; Prettier write/checkไฟล์ source/docsผ่าน. Next: เพิ่ม concurrent scan/insufficient/month boundary integration tests, real QR image/camera, refund และเชื่อม Coin F06/F08

### 2026-10-12 13:56 Asia/Bangkok — F02/F04: locate customer top-up UI

- ตรวจแบบ read-only และชี้ตำแหน่งการเติมเงินปัจจุบัน: CUSTOMER เข้า `/wallet` แล้วใช้ช่องจำนวนเงินกับปุ่ม “เติมเงิน” ใน LiveWallet; web ส่ง action `topup` ผ่าน `/api/wallet` ไป `POST /wallets/top-up`. ไม่แก้ application code และไม่รัน build/test เพราะเป็นการตรวจตำแหน่งเท่านั้น; ตรวจ Prettier ของ PLAN ผ่าน. Next: หากหน้าเดิมยังไม่เห็น ให้ restart API/Web เพื่อโหลดโค้ดล่าสุดและล็อกอินบทบาท CUSTOMER

### 2026-10-12 14:01 Asia/Bangkok — F02/F04: stale wallet preview diagnosis

- ตรวจภาพและ source แบบ read-only: หน้า localhost:3001 ยังแสดง fixture เดิม ฿2,450/64 Coins แม้ source ปัจจุบัน mount LiveWallet ที่หน้า `/wallet` และปุ่ม “เติมเงิน” อยู่ใต้การ์ดยอดเงิน. พอร์ต3001มี node PID26896 ฟังอยู่ จึงสรุปว่า process/build ที่กำลัง serve ยังไม่โหลด source ล่าสุด; ไม่หยุด process หรือแก้ application code. ไม่รัน build/testเพราะเป็น diagnosis; Prettier PLAN ผ่าน. Next: หยุด web process เดิมแล้วรัน `pnpm --filter web dev` ใหม่ จากนั้น hard refresh `/wallet`; restart API ด้วยหากคำขอ wallet ล้มเหลว

### 2026-10-12 14:08 Asia/Bangkok — F02/F04/F09: restore wallet visual design with live data

- ปรับ LiveWallet หน้า CUSTOMER `/wallet` ให้ใช้ visual hierarchy แบบ UI เดิม: การ์ดดำยอดเงิน, help/วงเงินรายเดือนสองคอลัมน์, shortcut สแกนจ่าย/ร้านใกล้ฉัน/AI, section จัดการกระเป๋า, QR payment และ Main Quest/history card. คง balance/help/top-up/reset/QR preview+pay จาก API จริง; ไม่คืน fixture ฿2,450 หรือ64Coins และระบุ Coins ว่ายังไม่เชื่อม
- เปลี่ยนเฉพาะ `apps/web/src/components/wallet/live-wallet.tsx`; Prettier write/check, web lint และ web production build ผ่าน. ยังไม่ได้ browser QA จาก process dev ที่เปิดอยู่. Next: restart `pnpm --filter web dev`, hard refresh `/wallet` แล้วตรวจ 360/1920px พร้อม top-up/QR interaction; F04/F09 คง PARTIAL

### 2026-10-12 14:15 Asia/Bangkok — F08/F09/F10: camera QR scan and encoded seller QR

- เปลี่ยน CUSTOMER `/wallet` จากกรอก UUID เป็นเปิดกล้องหลังผู้ใช้กดปุ่ม, ใช้ browser BarcodeDetector อ่าน `qr_code`, ดึง UUID จาก payload แล้วหยุดกล้อง/โหลด preview อัตโนมัติ; มีกรอบสแกน, ปุ่มปิด, cleanup media tracks และ Sonner เมื่อ browserไม่รองรับ/ไม่ได้สิทธิกล้อง. ไม่มีการขอกล้องอัตโนมัติ
- เพิ่ม `qrcode.react` ให้ SELLER `/store/receive` render QR SVG ที่ encode payment-request UUID จริงแทนไอคอน เพื่อให้ customer scan flow ใช้งานครบ. แก้ `live-wallet.tsx`, `apps/web/package.json`, `pnpm-lock.yaml`; Prettier write/check, web lint และ production build ผ่าน. ยังไม่ได้ทดสอบกล้องอุปกรณ์จริง; BarcodeDetector ต้องใช้ browserที่รองรับและ secure context/localhost. Next: restart web, ทดสอบ seller QR→customer camera บน Chrome/Edge และอุปกรณ์มือถือ พร้อมกรณี deny permission/QRใช้ซ้ำ; F08/F09/F10 คง PARTIAL

### 2026-10-12 14:25 Asia/Bangkok — F04/F09: split wallet actions into dedicated routes

- หน้า CUSTOMER `/wallet` เหลือยอดเงินจริง, shortcut 4 ปุ่ม และ Main Quest เท่านั้น; เอา section จัดการกระเป๋า/ชำระ QR ออกจาก home. ปุ่มเป็น สแกนจ่าย→`/wallet/scan`, QR เติมเงิน→`/wallet/top-up`, ร้านใกล้ฉัน→`/wallet/explore`, ผู้ช่วย AI→แจ้งสถานะเดิม
- แยก `customer-qr-scanner.tsx` และ `customer-top-up.tsx`; เพิ่ม route pages scan/top-up และ customerRoutes. หน้า scan ขอสิทธิกล้องเมื่อกดเท่านั้น/preview+pay; หน้า top-up มีเติมเงินและ reset help. Seller receive render QR SVG จริงผ่าน qrcode.react. Prettier write/checkไฟล์แก้ผ่าน, web lint และ production build31routesผ่าน; ยังไม่ได้ browser/device camera QA. Next: restart web และตรวจ4ปุ่ม/route/back navigationที่360/1920px รวมกล้องจริง; F04/F09คงPARTIAL

### 2026-10-12 Asia/Bangkok — F02/F08/F09/F10: monthly help fallback and payment lifecycle

- แก้ BASE help ให้นับเฉพาะเดือนปัจจุบัน Asia/Bangkok; เป้ารัฐช่วย60%แต่ถ้า helpไม่พอให้ใช้เท่าที่เหลือและโยนส่วนขาดไป CASH ลูกค้า จึงปฏิเสธเฉพาะ CASHไม่พอ. History รวม debit help/cash เป็น payment เดียวพร้อม breakdown
- Top-up เพิ่ม Idempotency-Key กัน retryเพิ่มยอดซ้ำ; reset help ปรับยอดเดือนนี้ให้เท่ากับ1,000และเปิดเฉพาะ non-production + ENABLE_TEST_WALLET_ACTIONS=true. เพิ่ม shared PrismaService สำหรับ wallet module
- Seller request ต้องมี owned shop, อายุ15นาที, list/cancel ได้; preview/payกัน CANCELLED/EXPIRED. Pay transaction สร้าง SUCCEEDED Purchase และ link request; migration20261012010000 apply Neon แล้ว. demo seed สร้าง APPROVED shop ให้ seller
- Web เพิ่ม manual UUID fallback, warning เมื่อต้องจ่ายส่วนรัฐที่ขาด, canPay guard, seller status polling/cancel/expiry และ history breakdown; Postman เพิ่ม idempotent top-up/list/cancel. อัปเดต contract/decisions/Test/README
- ตรวจผ่าน: Prisma format/validate/generate + migrate deploy, API lint/build และ Vitest40, web lint/build31routes. Live E2Eยืนยัน help1000, previewยอด2000ได้ target1200/help1000/customer1000, top-up retryไม่เพิ่มซ้ำ, cancelแล้วpay409; หลังแก้ timestamp/zero-help ledger/concurrency mapping แล้ว QR เดียวพร้อมกันได้201หนึ่งครั้ง+409หนึ่งครั้ง และเมื่อ help0 หัก CASH2000เต็มพร้อมสร้าง Purchase
- F02/F08/F09/F10คง PARTIAL: Coins award/rule linkage, refund/reversal, history pagination และ device camera QA ยังไม่เสร็จ. Next: ทำ Coin award+refund ตาม F06/F08 แล้วเพิ่ม automated DB integration regression สำหรับ concurrent scan

### 2026-10-12 Asia/Bangkok — F10: seller create QR submit fix

- แก้ `/store/receive` กดสร้างแล้วเงียบ: shared Base UI Button ไม่ submit form โดยปริยาย จึงเพิ่ม `type="submit"` และ pending label. ตรวจ API พอร์ต3000โดยตรงสร้างยอด111111ได้201; web lint/build31routesผ่าน; browserจริงสร้าง12.34แล้วเห็น QR UUID/expiry/toast และรายการ PENDING สำเร็จ. มี test requests 111111 และ12.34ค้างเพื่อ audit/ยกเลิกผ่านUIได้

### 2026-10-12 Asia/Bangkok — API controller/service separation maintenance

- แยก service ที่เคยฝังใน controller ครบ5 domain: categories, geocoding, stores, coin-rules และ wallets เป็น `*.service.ts`; controller เหลือเฉพาะ HTTP decorators/request mapping และ AppModule import provider จาก service file. Auth/App แยก service อยู่แล้วจึงไม่เปลี่ยน
- ย้าย unit spec ที่ทดสอบ service/helper เป็น `*.service.spec.ts`. ไม่มี route, request/response, DB schema หรือ business rule เปลี่ยน จึงไม่แก้ API contract/Postman และไม่เปลี่ยนสถานะ Feature
- ตรวจ API Vitest40/40, oxlint type-aware และ Nest build ผ่าน; Prettier write/check source ที่แก้ผ่าน. Next: refactor Auth/Categories/Stores/CoinRules ให้ใช้ shared PrismaService แทนสร้าง PrismaClient ราย serviceในงาน maintenance ถัดไป

### 2026-10-12 18:42 Asia/Bangkok — R1-D2-I/F02 + R1-D5-I/F08 + F04/F09: Thai Chuai Thai daily/monthly remaining

- CUSTOMER `/wallet` เปลี่ยนการ์ดจาก “วงเงินช่วยจ่ายพื้นฐาน/วงเงินต่อเดือน” เป็นยอดไทยช่วยไทยคงเหลือวันนี้จากเพดาน 200 บาท และยอดช่วยเหลือคงเหลือเดือนนี้จากวงเงิน 1,000 บาท โดยใช้ค่าจาก `GET /wallets/me`
- Backend นับ BASE `PAYMENT_DEBIT` ตามวัน Asia/Bangkok แล้วจำกัด preview/pay ไม่เกินยอดรายวันที่เหลือและยอดเดือนที่เหลือ; ส่วนขาดยัง fallback ไป CASH ตามกติกาเดิม. อัปเดต decisions, API contract และ Postman wallet summary แล้ว; ไม่มี schema/migration
- ตรวจผ่าน: API Vitest 41/41, API lint/build, web lint/build 31 routes, Prettier write/check และ `git diff --check`. ยังไม่ได้ทำ browser QA หรือ DB E2E หลายรายการในวันเดียว/ข้ามเที่ยงคืน. Next: ทดสอบ live payment สะสมถึง 200 บาทและวันถัดไปรีเซ็ต พร้อม concurrent regression ก่อนปิด F08

### 2026-10-12 19:06 Asia/Bangkok — R1-D2-I/F02 + F04: test daily/monthly help reset controls

- เพิ่มปุ่ม `/wallet/top-up` สำหรับรีเซ็ตสิทธิรายวันเป็น 200 บาทและรีเซ็ตยอดช่วยเหลือรายเดือนเป็น 1,000 บาท โดยแสดงเฉพาะ non-production ที่ `ENABLE_TEST_WALLET_ACTIONS=true`; Sonner แจ้งผลและปิดปุ่มระหว่างรอ
- เพิ่ม `POST /wallets/help/reset-daily` ผ่าน web BFF/API และ Postman. รีเซ็ตรายวันใช้ BASE marker คู่บวก/ลบสุทธิศูนย์เพื่อคงยอดเดือนและ audit history แล้วนับเฉพาะ payment debit หลัง marker; reset เดือนใช้ endpoint เดิม. อัปเดต decisions/contract; ไม่มี schema/migration
- ตรวจผ่าน: API Vitest 41/41, API lint/build, web lint/build 31 routes, Prettier write/check และ `git diff --check`. ยังไม่ได้กดปุ่มกับ DB/browser จริง. Next: เปิด test actions แล้วตรวจว่าปุ่มรายวันคืนเฉพาะ daily remaining ส่วน monthly remaining ไม่เปลี่ยน และปุ่มรายเดือนคืนยอด 1,000 บาท

### 2026-10-12 19:11 Asia/Bangkok — F02/F04 reset controls visibility configuration

- ตรวจพบ `apps/api/.env` ไม่มี `ENABLE_TEST_WALLET_ACTIONS`; เพิ่มค่า `true` ใน local env และ restart เฉพาะ API dev processes แล้ว. ยืนยันพอร์ต 3000 กลับมา listen และค่าคอนฟิกเป็น true; `.env` เป็น local/ignored และไม่มี secret ถูกบันทึกใน plan
- ไม่แก้ application source เพิ่มและไม่รัน build/test ซ้ำ เพราะเป็นการเปิด feature flag ที่ผ่าน checks ใน entry ก่อนหน้า. Next: refresh `/wallet/top-up`; หากหน้าเปิดค้างอยู่ให้ hard refresh แล้วกดทดสอบ reset รายวัน/รายเดือนกับยอดจริง

### 2026-10-12 19:13 Asia/Bangkok — local API port conflict cleanup

- วินิจฉัย `EADDRINUSE :3000`: API background ที่เริ่มเวลา 19:11 ยัง listen อยู่ ขณะที่ terminal ผู้ใช้เริ่ม Nest watch อีกชุดเวลา 19:12. ปิดเฉพาะ process tree ชุด background และยืนยันพอร์ต 3000 ว่าง; คง Nest watcher ของ terminal ผู้ใช้ไว้
- ไม่แก้ source/config และไม่รัน build/testเพราะเป็น local process cleanup. Next: หยุด watcher ที่ error ด้วย Ctrl+C แล้วรัน API จาก terminal เดิมอีกครั้งเพียงหนึ่งชุด

### 2026-10-12 Asia/Bangkok — F04/F09: top-up submit and ZXing QR image fallback

- แก้ `/wallet/top-up` กดเติมเงินแล้วเงียบด้วย `type="submit"` บน Base UI Button และ pending label; proxy/idempotency เดิมไม่เปลี่ยน
- เพิ่ม `@zxing/browser` และเปลี่ยน `/wallet/scan` จาก BarcodeDetector เป็น BrowserQRCodeReader สำหรับกล้อง; เพิ่มเลือกไฟล์ image/* ขนาดไม่เกิน10MB, decode ผ่าน object URL ใน browserและไม่ upload, คง manual UUID fallback/preview/pay เดิม
- ตรวจ web Prettier, ESLint และ production build31routesผ่าน. Browser QA หลัง loginถูก redirectกลับ `/login` จึงยังไม่ยืนยัน camera permission/รูปจริง; Next: ให้ API+web dev ทำงาน, login CUSTOMER แล้วทดสอบ QRรูปชัด/ไม่มีQR/ไฟล์เกิน10MBและกล้องมือถือ. F04/F09คงPARTIAL

### 2026-10-12 Asia/Bangkok — F10: copy QR code and save seller QR image

- เพิ่ม helper แปลง QR SVG เป็น PNG512x512พื้นขาวบน browser; `/store/receive` แสดงปุ่มคัดลอก UUID/scan payload เป็นข้อความผ่าน Clipboard API และบันทึกไฟล์ชื่อ `thai-please-qr-<amount>.png`, พร้อม Sonner success/fallback และปุ่ม type=button
- ตรวจ web ESLint/build31routesผ่าน; browserจริงสร้าง QR9.99และเห็น UUID/expiry/ปุ่มคัดลอก+บันทึกครบ. การทดสอบ download ถูก browserปฏิเสธ permission จึงยังไม่ยืนยันไฟล์/clipboardจริง; มี request9.99 PENDING จาก QA. Next: ผู้ใช้กดอนุญาต download แล้วตรวจ PNGและวาง clipboardในแอปรูปภาพ; F10คงPARTIAL

### 2026-10-12 21:40 Asia/Bangkok — R1-D3-I/R1-D3-B, F03/F05: government store approval

- เปลี่ยน `/government/stores` จาก placeholder เป็นรายการร้านจริง กรองรอตรวจ/อนุมัติ/ระงับ/ทั้งหมด แสดง owner/หมวด/คำอธิบาย/ที่อยู่/พิกัด/ผลตรวจ และมี confirm อนุมัติหรือระงับพร้อมเหตุผลผ่าน Sonner/pending state
- เพิ่ม GOVERNMENT-only `GET /government/stores`, `GET /government/stores/:id`, `PATCH /government/stores/:id`; validate BigInt ID/filter/body/transition และบันทึก `reviewed_by/reviewed_at/review_reason`. Migration `20261012011000_shop_approval_audit` apply บน configured Neon สำเร็จ. ร้านต้อง APPROVED จึงสร้าง QR ได้ และถ้าถูกระงับ QR ที่ค้างชำระจะ settle ไม่ได้
- เพิ่ม Next BFF/Axios hook/types, API validation tests, Postman cases 200/400/403 และอัปเดต contract/decisions. รอบสุดท้ายหลัง enforcement: Prisma format/validate ผ่าน; API Vitest44/44 + lint/build และ web lint/build32 routes ผ่าน; `git diff --check` ผ่าน
- F03/F05 คง PARTIAL เพราะ seller owner CRUD/multi-store edit และ browser E2E การอนุมัติจริงยังไม่ครบ. การคืนสถานะ SUSPENDED→APPROVED และ immutable approval-event ledger ยังไม่อยู่ใน policy. Next: ทดสอบ browser GOVERNMENT อนุมัติร้าน PENDING → seller สร้าง QR → customer เห็นร้าน; ต่อ owner CRUD

### 2026-10-13 02:35 Asia/Bangkok — F04: top-up shortcut label

- เปลี่ยนข้อความปุ่มลัดใน customer wallet จาก “QR เติมเงิน” เป็น “เติมเงิน” ที่ `apps/web/src/components/wallet/live-wallet.tsx`; route `/wallet/top-up` และพฤติกรรมเดิมไม่เปลี่ยน สถานะ F04 คง PARTIAL
- ตรวจผ่าน Prettier write/check สำหรับไฟล์ UI ที่แก้; ไม่รัน build หรือ browser QA เพราะเป็นการแก้ข้อความอย่างเดียว. Next: ตรวจป้าย “เติมเงิน” บนหน้า `/wallet` ใน viewport ที่ใช้งานจริง

### 2026-10-13 02:46 Asia/Bangkok — F04/F09: customer FR-C01–C07 fixture-readiness review

- ตรวจเส้นทางลูกค้าและ component ปัจจุบันแล้ว: FR-C02, FR-C03, FR-C04, FR-C06 และ FR-C07 สามารถพัฒนา UI/interaction/loading-error-empty states ต่อด้วย fixture ที่ระบุชัดว่าเป็น preview ได้โดยยังไม่เชื่อม Database; FR-C01 ทำได้เฉพาะ presentation ของข้อมูลบัญชี/ยอด ส่วนการยืนยันตัวตนและยอดจริงต้องใช้ API; FR-C05 ต้องคำนวณและยืนยันฝั่ง server จึงทำได้เพียงแสดงตัวอย่างผลลัพธ์
- ไม่แก้ application source และไม่รัน build/test เพราะเป็นการ review/investigation เท่านั้น; F04 คง PARTIAL และ F09 คง UI PREVIEW. Next: ทำ FR-C02 Interactive Map ด้วย fixture ก่อน แล้วทำ FR-C04 purchase preview states และ FR-C06/FR-C07 monthly UI โดยแยก fixture adapter เพื่อเปลี่ยนเป็น API ภายหลัง

### 2026-10-13 02:54 Asia/Bangkok — R1-D5-A/F09: FR-C06 Main Quest and FR-C07 monthly history preview

- เพิ่ม fixture รายเดือนแยกจาก UI สำหรับสถานะ Main Quest “กำลังสะสม”, “รับสิทธิ์แล้ว”, “ใช้สิทธิ์แล้ว” และเดือนว่าง; `/wallet/quests` เลือกเดือน ดู progress/Coins ที่ขาด/เป้าหมาย 100 Coins/วงเงิน 100 บาทและเวลารับหรือใช้สิทธิ์ได้ โดยไม่เพิ่มหรือแก้ Database
- ปรับ `/wallet/history` เป็นประวัติรายเดือนแบบเลือกเดือน มีสรุปยอดซื้อ/Coins/สิทธิ์ที่ใช้ รายการซื้อพร้อม Coins ประวัติรับวงเงิน Main Quest และ empty state; ระบุชัดว่าเป็น UI Preview/fixture ส่วน seller history และ wallet API เดิมไม่เปลี่ยน
- ตรวจผ่าน Prettier write/check ของ source ที่แก้, web ESLint และ production build 32 routes; ยังไม่ได้ทำ browser QA 360/1920 px. F09 คง UI PREVIEW เพราะ Coins/quest/history ยังไม่เชื่อม API จริง. Next: ตรวจ responsive/keyboard ของ month selector แล้วแทน fixture adapter ด้วย API เมื่อ F08 พร้อม

### 2026-10-13 03:03 Asia/Bangkok — R1-D5-A/F09: Main Quest month expiry preview

- ปรับ fixture และ `/wallet/quests` ให้สิทธิ์ Main Quest ใช้ได้เฉพาะเดือนที่ได้รับ: สิทธิ์ที่ไม่ได้ใช้เมื่อข้ามเดือนแสดง “หมดอายุ” พร้อมเวลาหมดอายุ และรอบเก่าที่สะสมไม่ครบแสดง “จบรอบแล้ว” โดยไม่มีปุ่มกลับไปสะสม; `/wallet/history` แสดง badge “หมดอายุ” แทน “พร้อมใช้” สำหรับสิทธิ์รอบก่อน
- ไม่เพิ่มหรือแก้ Database/API; เป็น UI Preview ตามกติกา Main Quest เดิม. ตรวจผ่าน Prettier write/check, web ESLint, production build 32 routes และ `git diff --check`; ยังไม่ได้ทำ browser QA. Next: ให้ backend ส่งสถานะ/เวลา expiry จริงเมื่อ F08 เชื่อม quest API

### 2026-10-13 04:23 Asia/Bangkok — cross-cutting maintenance: dev terminal investigation

- ตรวจ root/apps package scripts: `pnpm dev` ใช้ concurrently รวม web/API ใน terminal เดียว; scripts แยกคือ `dev:web` และ `dev:api`. ตรวจเอกสาร Microsoft Windows Terminal เพื่อแนะนำ split-pane จาก PowerShell; ไม่แก้ runtime scripts และไม่เปลี่ยน Feature/Daily Flag
- เปลี่ยนเฉพาะ `PLAN/PLAN.md`; ไม่รัน dev/build/test เพราะเป็นการตรวจ scripts และให้คำแนะนำ ไม่ได้ทดสอบเปิด terminal จริง. ตรวจ Markdown ด้วย `pnpm --filter web exec prettier --write ../../PLAN/PLAN.md` และ `--check` ตามผลคำสั่งในรอบนี้. Next: ใช้คำสั่ง Windows Terminal จาก repo root เพื่อเปิด web/API คนละ pane

### 2026-10-13 04:25 Asia/Bangkok — cross-cutting maintenance: VS Code split dev task

- เพิ่ม `.vscode/tasks.json`: `Dev: Front + Back` เรียก `dev:web`/`dev:api` พร้อมกันจาก workspace root และใช้ presentation group เดียวเพื่อ split terminal; ตั้ง default build task สำหรับ Ctrl+Shift+B, dedicated panels และ instance limit 1. เพิ่ม exception ใน `.gitignore` เพื่อให้แชร์ tasks ได้; ไม่เปลี่ยน Feature/Daily Flag
- ตรวจ JSON parse และอ้างอิง scripts กับ root package ด้วย PowerShell; ตรวจ `pnpm --filter web exec prettier --write ../../.vscode/tasks.json ../../PLAN/PLAN.md`, `--check` และ `git diff --check`. ไม่รัน app build/test เพราะเปลี่ยน editor configuration เท่านั้น และยังไม่ได้ทดสอบ VS Code UI จริง. ไม่มี business decision/blocker ใหม่. Next: เปิด repo root ใน VS Code แล้วกด Ctrl+Shift+B เพื่อยืนยัน front/back แสดงคนละ pane

### 2026-10-13 04:33 Asia/Bangkok — F06/F08/F09 next-work review

- เทียบ PLAN/INTEGRATION, decisions, Prisma schema และ payment settlement: มี rule version/period/rate storage และ QR purchase สำเร็จแล้ว แต่ settlement ยังไม่เขียน coin_entries และ reward_subsidy_used เป็นศูนย์; Main Quest/history ยังเป็น preview ตามบอร์ด. แนะนำทำ F06 rate generation/coin preview → F08 atomic coin award/reads → Main Quest budget/grant/expiry → F09 เชื่อม UI จริง; ไม่เปลี่ยนสถานะ flags จากการ review
- เปลี่ยนเฉพาะ PLAN/PLAN.md; ตรวจ Prettier write/check และ git diff --check; ไม่รัน build/test เพราะไม่มี runtime change. ก่อน implement ต้องทบทวน cutoff defaults, นิยามซื้อซ้ำ/เคยได้รับ Coins และ policy เมื่อไม่มี rate/งบไม่พอใน docs/decisions.md ให้สอดคล้อง Integration. Next: ทำ coin calculation/preview service ที่ใช้ร่วมกันก่อนต่อ ledger ใน payment transaction พร้อม duplicate/concurrency และ month-boundary tests

### 2026-10-13 04:44 Asia/Bangkok — R1-D4-I/R1-D4-B, F06/F10: automatic shop Coin rates + test button

- เพิ่ม CoinRatesService: API startup + poll ทุก 60 วินาทีสร้างรอบ 06:00/18:00 Bangkok ปัจจุบัน; ใช้ rule ณ starts_at, Decimal sales ใน lookback ก่อน cutoff, APPROVED shops และบันทึก shop_coin_rates พร้อม snapshot. ใช้ advisory lock ร่วม rule writers และ transaction ทั้งรอบ; กดซ้ำ/หลาย instance ใช้รอบเดิม ไม่ทับหรือเพิ่มเรตที่ล็อกแล้ว. ENABLE_AUTO_COIN_RATES=false ปิด worker; downtime catch-up เฉพาะรอบปัจจุบัน
- เพิ่ม GOVERNMENT-only non-production POST /government/coin-rules/generate-rates + same-origin Next BFF และปุ่ม “สร้างเรตรอบปัจจุบันทันที (ทดสอบ)” ที่ /government/coin-rules พร้อม confirm/pending/Sonner/reload และช่วงยอดขาย; ปรับ GET flags, Axios/hook, app provider, .env.example, decisions, contract และ Postman 200/repeat/400/401/403/409. ไม่มี schema/migration ใหม่ และยังไม่แจก Coins/รางวัล
- ตรวจผ่าน: API unit 54/54, API lint/build; opt-in PostgreSQL 3/3 (apply migrations ทั้งชุดใน schema ชั่วคราวแล้ว cleanup; concurrent winner, cutoff/refunds, frozen retry/next round และ rollback เมื่อ insert ล้มเหลว); web lint/build 33 routes; API smoke 200/reuse/400/401/403 และ browser GOVERNMENT login→button→confirm→stored 3-shop round. ตรวจ 360/1920 px ไม่มี page overflow และ cancel/Escape; Prettier write/check กับ git diff --check ผ่าน. Default unit suite skip opt-in DB 3 cases โดยรันทดสอบแยกจริงแล้ว
- F06/F10 คง PARTIAL: purchase preview, F08 award linkage และ seller rules ยังเหลือ. No-effective-rule ตอบ 409; partial-refund policy ยัง deferred ใน decisions. Next: ใช้ frozen shop_coin_rates ใน purchase preview/settlement แล้วเพิ่ม coin_entries แบบ atomic พร้อม customer monthly Coins reads

### 2026-10-13 04:53 Asia/Bangkok — R1-D4-B/F10: rule history date/time readability

- ปรับเฉพาะ apps/web/src/app/(government)/government/coin-rules/page.tsx: คอลัมน์เริ่มใช้งาน/สิ้นสุดใช้ semantic time แยกวันที่และเวลาคนละบรรทัด gap-1.5 พร้อม font-mono/tabular-nums; เวลาสีรองและขนาดเล็กกว่า วันที่ยังใช้ Asia/Bangkok และสิ้นสุดว่างแสดงขีดเดิม. F10 คง PARTIAL
- ตรวจผ่าน web Prettier write/check, pnpm --filter web lint/build (33 routes) และ git diff --check; ยังไม่ได้ตรวจ browser รอบนี้. ไม่มี business decision/blocker ใหม่. Next: refresh /government/coin-rules แล้วตรวจ spacing ของประวัติกฎใน viewport ที่ใช้งาน

### 2026-10-13 04:58 Asia/Bangkok — cross-cutting maintenance: Thai mono font replacement

- ตรวจ name table ของไฟล์ผู้ใช้ apps/web/src/fonts/Arundinamono.ttf ได้ Arundina Sans Mono / Regular; เปลี่ยน apps/web/src/app/layout.tsx จาก Chivo Mono เป็น next/font/local น้ำหนัก 400 และเปลี่ยน --font-mono ใน globals.css ให้ใช้ --font-arundina-sans-mono ทั่วเว็บ. คงไฟล์ฟอนต์อื่นที่ผู้ใช้เพิ่มไว้ และไม่เปลี่ยน Feature/Daily Flag
- ตรวจผ่าน Prettier write/check สำหรับ layout.tsx/globals.css, pnpm --filter web lint/build (33 routes), ไม่พบ Chivo references ใน web source และ git diff --check; ยังไม่ได้ browser QA รอบนี้. ไม่มี business decision/blocker ใหม่. Next: refresh หน้าที่ใช้ font-mono เพื่อตรวจ glyph ภาษาไทย/ตัวเลขและระยะห่างด้วย Arundina

### 2026-10-13 05:00 Asia/Bangkok — cross-cutting maintenance: mono font size adjustment

- เพิ่ม size-adjust:120% ใน next/font/local ของ Arundina Sans Mono ที่ apps/web/src/app/layout.tsx เพื่อขยาย glyph/metrics ทั่ว font-mono โดยคงลำดับขนาดจาก text-* เดิม; ไม่เปลี่ยน Feature/Daily Flag
- ตรวจผ่าน Prettier write/check, pnpm --filter web lint/build (33 routes), พบ size-adjust:120% ใน CSS build และ git diff --check; ยังไม่ได้ browser QA รอบนี้. ไม่มี blocker/decision ใหม่. Next: refresh หน้าประวัติ/ยอดเงินเพื่อตรวจความอ่านง่ายของขนาดใหม่

### 2026-10-13 05:02 Asia/Bangkok — R1-D4-B/F10: two-digit days in rule history

- ปรับ HistoryDateTime ใน apps/web/src/app/(government)/government/coin-rules/page.tsx เป็น day:2-digit/month:short/year:numeric; คอลัมน์เริ่มใช้งาน/สิ้นสุดแสดง 01 แทน 1 โดยคงเดือนย่อ ปี พ.ศ. เวลาไทย และ mono เดิม. F10 คง PARTIAL
- ตรวจ Intl ตัวอย่างได้ 01 ต.ค. 2569; Prettier write/check, web lint/build (33 routes) และ git diff --check ผ่าน. ไม่เพิ่ม unit tests สำหรับ formatting ขนาดเล็กและยังไม่ได้ browser QA รอบนี้. ไม่มี blocker/decision ใหม่. Next: refresh ตารางเพื่อตรวจวันที่หนึ่งหลัก

### 2026-10-13 05:03 Asia/Bangkok — cross-cutting maintenance / F10: revert mono Bold trial

- ผู้ใช้ขอคืนการทดลอง Bold: คืน layout.tsx ให้โหลด Arundina Sans Mono Regular 400 อย่างเดียว และคืน weight classes ของวันที่/เวลา/เวอร์ชัน/ตัวเลขใน government/coin-rules/page.tsx ตามก่อนทดลอง. คง size-adjust:150% ที่ผู้ใช้ตั้งไว้, วันที่สองหลัก และ spacing เดิม; F10 คง PARTIAL
- ตรวจผ่าน Prettier write/check, web lint/build (33 routes) และ git diff --check; ไม่มี browser QA เพิ่มสำหรับการคืน styling. ไม่มี blocker/decision ใหม่. Next: refresh ตารางเพื่อตรวจน้ำหนักเดิม

### 2026-10-13 05:10 Asia/Bangkok — R1-D4-I/R1-D4-B, F06/F10: rate round summary history

- เปลี่ยน /government/coin-rules จากรายการรายร้านเป็นตารางล่าสุด 10 รอบ: เวลาสร้าง/เริ่ม/สิ้นสุดแยก date/time พร้อม mono, จำนวนร้านทั้งหมด, ยอด snapshot ต่ำกว่า 10,000/ตั้งแต่ 10,000 บาท และ Coins ที่แจกจริงตาม awarded_at ในช่วงรอบ [start,end). GET รวมทุกร้านโดยไม่มีเพดาน 100 ร้าน; ยอด Coins เป็น gross ก่อน reversal และรอบว่างเป็น 0 ตาม docs/decisions.md. ปรับ service/spec, web page/API types, docs/api-contract.md และ Postman ให้ตรงกัน
- ตรวจผ่าน API lint/build, unit 54/54, opt-in PostgreSQL 4/4 (schema ชั่วคราวพร้อม migrations/cleanup; เพิ่มสรุปเกิน 100 ร้านผ่าน mock, ขอบเขตเวลา, reversal, รอบว่างและ latest 10); web lint/build 33 routes, Prettier write/check และ git diff --check. Browser ข้อมูลจริงแสดงร้านรวม 3/ต่ำกว่า 2/ตั้งแต่ 1/Coins 0; ยังไม่ได้ตรวจ responsive 360/1920 px ซ้ำในรอบนี้
- F06/F10 คง PARTIAL; F08 ยังไม่เขียน coin_entries จึงยังไม่มี Coins แจกจริงในระบบปัจจุบัน. Next: เชื่อม frozen shop rates กับ purchase preview/atomic award ใน F08 แล้วตรวจยอด ledger แสดงในรอบที่เกี่ยวข้อง

### 2026-10-13 05:13 Asia/Bangkok — R1-D4-B/F10: ISO-style history dates

- ปรับ HistoryDateTime ที่ apps/web/src/app/(government)/government/coin-rules/page.tsx ให้ทั้งประวัติกฎและประวัติอัปเดตเรตใช้ yyyy-MM-dd ปี ค.ศ. ตัวเลข Latin; เวลา HH:mm แบบ 24 ชั่วโมงแยกบรรทัด คง Asia/Bangkok/mono/spacing เดิม. F10 คง PARTIAL; ไม่มี business rule หรือ API change
- ตรวจผ่าน web Prettier write/check, pnpm --filter web lint และ pnpm --filter web build (33 routes), git diff --check; ไม่เพิ่ม tests สำหรับ display formatting และไม่ได้ตรวจ browser ซ้ำ. Next: refresh /government/coin-rules เพื่อตรวจรูปแบบวันที่ใหม่

### 2026-10-13 05:23 Asia/Bangkok — R1-D5-I/F08, F02/F06/F09: atomic QR Coin awards

- เพิ่ม apps/api/src/wallets/purchase-coins.ts และเชื่อม wallets.service.ts: QR preview/settlement ใช้ frozen rate ณ confirmed_at, minimum inclusive, repeat จาก coin entry เดิมทุกเดือนรวม reversal. เขียน purchase+Coins+money+PAID ใน Serializable transaction เดียว; unique/locks ป้องกันแจกซ้ำและ race ตอบ 409. ไม่มี rate/ยอดต่ำให้ 0 พร้อมเหตุผล; ไม่ backfill. เดือนใหม่สร้าง ledger period DRAFT budget=0 หากไม่มี โดยไม่แก้งบเดิม ตาม docs/decisions.md
- GET /wallets/me ส่ง current-month unreversed Coins จริง; /wallet แสดงยอด และ /wallet/scan แสดง estimate/เหตุผล zero + toast actual award. ปรับ docs/api-contract.md และ Postman summary/preview/pay tests ให้ตรงกัน. F02/F06/F08 คง PARTIAL; Main Quest/history preview F09 ยังใช้ fixture ไม่มี auto grant/refund API ใหม่หรือ schema migration
- ตรวจผ่าน pnpm --filter api test (59 unit; opt-in DB skipped ใน default suite), api lint/build; RUN_COIN_AWARDS_DB_TESTS=true pnpm --filter api exec vitest run src/wallets/purchase-coins.db.spec.ts ผ่าน 8/8 ใน random schema พร้อม migrations ทั้งชุดและ cleanup: minimum/missing rate, duplicate, concurrent first/repeat+retry, rollback, month/reversal, cutoff, role/expired/cancelled/suspended/insufficient CASH. Web lint/build 33 routes, Prettier write/check และ git diff --check ผ่าน. Browser demo /wallet แสดง Coins จริง 0, responsive 360/1920 ไม่มี page overflow และ /wallet/scan โหลดได้; ไม่จ่ายรายการในฐานข้อมูลหลักและยังไม่ได้ browser end-to-end ยืนยันซื้อจริง
- ไม่มี blocker ใหม่; next: ทำ Main Quest budget/grant once ต่อเดือนและ refund reversal แบบ atomic แล้วเชื่อม quests/monthly history จาก API แทน fixture. UI shell ยังมีป้าย Preview เดิมแม้ยอด wallet มาจาก API

### 2026-10-13 05:28 Asia/Bangkok — cross-cutting maintenance / F01: redirect auth verification failures

- ปรับ apps/web/src/lib/auth.ts requireRole ให้ fetch/network/timeout, non-2xx, JSON parse failure และข้อมูลผู้ใช้ไม่ครบ/role ไม่ถูกต้อง redirect /login แทน throw Error; valid session และการส่ง role อื่นไปหน้า role ของตนคงเดิม. ไม่มี API contract/business rule change; F01 คง PARTIAL
- ตรวจ source ที่ transpile ด้วย TypeScript + VM mocks ผ่าน 9/9: ไม่มี cookie, network error, 401, 503, malformed JSON, null profile, unknown role, wrong-role routing และ valid session. Web Prettier write/check, lint, production build (33 routes) และ git diff --check ผ่าน. ไม่ทำ browser QA เพราะเป็น server guard ไม่มี layout change. Next: ลองเปิด protected route ขณะ API ไม่พร้อมเพื่อยืนยันไป /login

### 2026-10-13 05:31 Asia/Bangkok — cross-cutting maintenance / F02/F06/F08/F10: pooled search_path regression fix

- ตรวจฐานข้อมูลจริงพบ public.money_entries ยังอยู่ แต่ current_schema=null และ search_path ค้างเป็น disposable coin_rates_test schema ที่ถูกลบแล้ว; raw SQL ไม่ระบุ schema จึง 42P01 แม้ Prisma ORM ยังอ่าน public ได้. ไม่ลบหรือย้ายตาราง/ข้อมูลจริง
- เพิ่ม apps/api/src/prisma/sql-table.ts พร้อม identifier validation/qualification และ databaseSchema ของ PrismaService; wallet balance/daily usage/row locks กับ rate-round summary ใช้ qualified tables ตรง Prisma adapter (production public). แก้ coin-rates.db.spec.ts และ purchase-coins.db.spec.ts ใช้ BEGIN/SET LOCAL/COMMIT สำหรับ migration setup (ตัด transaction wrappers เฉพาะสำเนา SQL ใน test ไม่แก้ migration ต้นฉบับ), regression ตั้ง search_path=pg_catalog และฉีด test schema ให้ raw SQL. ปรับ unit mock/spec, docs/api-contract.md และ Postman descriptions; contract/business rules เดิมไม่เปลี่ยน สถานะ features คง PARTIAL
- ตรวจผ่าน pnpm --filter api test 61/61 unit; RUN_COIN_AWARDS_DB_TESTS=true และ RUN_COIN_RATES_DB_TESTS=true pnpm --filter api exec vitest run src/wallets/purchase-coins.db.spec.ts src/coin-rules/coin-rates.db.spec.ts ผ่าน 12/12 รวม concurrent payment/award/rate และ rollback บน schema ชั่วคราวพร้อม cleanup; api lint/build, Prettier write/check และ git diff --check ผ่าน. Live HTTP login→CUSTOMER GET /wallets/me 200 และ GOVERNMENT GET /government/coin-rules 200; ไม่สร้างรายการซื้อในฐานข้อมูลหลักและไม่รัน web build เพราะแก้เฉพาะ API/data query
- ไม่มี blocker ใหม่. Next: refresh หน้า wallet หลัง login; query ใหม่ไม่ขึ้นกับ stale pooled search_path และงาน Main Quest/refund ยังค้างตาม F08

### 2026-10-13 05:36 Asia/Bangkok — R1-D4-B/F10: seller current shop Coins and minimum purchase

- เพิ่ม readSellerCoinRates ใน apps/api/src/wallets/purchase-coins.ts และ GET /wallets/me shopCoinRates: เฉพาะร้าน owner ของ SELLER, frozen current half-open round, minimum purchase จาก rule ของเรต พร้อม new/repeat Coins, version และเวลารอบ; ร้านไม่อนุมัติ/ไม่มีเรตส่ง null, CUSTOMER ส่ง []. ไม่มีการคำนวณกฎใหม่หรือ schema/money mutation
- ปรับ apps/web/src/components/wallet/live-wallet.tsx ที่ /store ให้แสดงชื่อร้านจริงในการ์ด Coins, ซื้อครบกี่บาทต่อรายการ, ไม่เคย/เคยได้รับ Coins, เวอร์ชันกฎและเวลาสิ้นสุดเรต; มี loading/error/retry/empty/no-rate/pending/suspended states, refresh ทุก 60 วินาทีและปุ่มอัปเดต. ปรับ docs/api-contract.md, Postman seller summary case และ unit spec. F10 คง PARTIAL เพราะ seller transaction view ยังไม่ครบ
- ตรวจผ่าน pnpm --filter api test 62/62 unit (opt-in DB skip; ไม่รันซ้ำเพราะเปลี่ยน read-only projection), api lint/build, web lint/build 33 routes, Prettier write/check และ git diff --check. Live SELLER summary 200 อ่านเรต 5/1 Coins ขั้นต่ำ 50 บาท; browser /store ตรง API, ปุ่มอัปเดตทำงาน, viewport 360/1920 ไม่มี page overflow. Unit ตรวจ owner filter/current interval/null-rate/suspended serialization; ไม่มี blocker/business decision ใหม่. Next: เชื่อม seller transactions/history และเปลี่ยน seller shell ชื่อ/ป้าย preview เดิมให้ใช้ร้านจริงเมื่อทำ F05

### 2026-10-13 05:49 Asia/Bangkok — R1-D5-A/R1-D5-I, F08/F09: live Main Quest and Preview cleanup

- เพิ่ม [main-quest.ts](../apps/api/src/wallets/main-quest.ts), GET /quests/me และ POST /quests/me/claim; monthly Coins จริง, target100→reward100THB ครั้งเดียว/เดือน, OPEN budget/period locks/Serializable/unique allocation, retry เมื่อมีงบ, grant หลัง settle และใช้ได้บิลถัดไป. QR preview/pay หัก BASE→REWARD→CASH, ledger link grant/purchase/UUID, ไม่เขียน zero debit และ expiry ตามขอบเขตเดือน Bangkok โดยเก็บประวัติ. ไม่มี migration หรือแก้งบจริง; กติกาบันทึกก่อน implementation ใน docs/decisions.md
- /wallet/quests ใช้ [customer-main-quest.tsx](../apps/web/src/components/wallet/customer-main-quest.tsx) ผ่าน same-origin wallet BFF: progress, 12เดือน, grant/used/available/expired, claim/refresh/retry/loading และ refresh ทุก60วินาที. Scanner/history แยกยอด reward; wallet shell เอา Preview ออกจากหน้า API-backed home/scan/top-up/explore/quests และ seller receive/history, seller heading จาก authenticated user. คง Preview ที่ customer monthly history/account/settings ซึ่งยัง fixture; metadata เลิกเรียกทั้งเว็บ Mobile UI Preview. Contract/Postman ปรับพร้อม endpoints และ auth/role/invalid-month/repeat-grant cases
- ตรวจผ่าน API lint/build, pnpm --filter api test 64/64 unit (14 opt-in DB cases skipped ตามค่า default); RUN_COIN_AWARDS_DB_TESTS=true pnpm --filter api exec vitest run src/wallets/purchase-coins.db.spec.ts ผ่าน10/10 ใน random disposable schema พร้อม migrations/cleanup: budget waiting, auto grant, allocation failure rollback ทั้ง purchase/Coins/money/grant/QR, repeat/concurrent claim, next-bill reward use, zero CASH debit, expiry/no carry, และสอง eligible customers แข่งงบก้อนสุดท้ายได้เพียงหนึ่ง grant. Web lint/build33routes ผ่าน; Prettier write/check ผ่าน. Browser demo Quest แสดง Coins5 จาก API, เลือกย้อนหลังเป็น ENDED, refresh, ไม่มี Preview; customer monthly history ยังมี Preview. ตรวจ360/1920pxไม่มี page overflow. ไม่จ่าย/ให้รางวัลในฐานข้อมูลหลัก และไม่ได้รัน Postman collection จริง
- F08/F09 คง PARTIAL เพราะ refund reversal, customer monthly purchase history และ AI integration ยังเหลือ; reward ต้องมี monthly_periods OPEN พร้อมงบจริงจึงแจกได้. Next: government monthly budget management และ customer purchase-history API/refund reversal ตามกติกาเดิม; review acceptance gates ก่อนยกสถานะ DONE

### 2026-10-13 05:50 Asia/Bangkok — R1-D5-A/F09: circular Quest progress and normal font

- ปรับ apps/web/src/components/wallet/customer-main-quest.tsx ที่ /wallet/quests จากแถบแนวนอนเป็น SVG circle progress พร้อมตัวเลข Coins/เป้าหมายตรงกลาง, progressbar semantics และ reduced-motion; เอา font-mono ออกจากตัวเลข เดือน ยอดรางวัลและ date/time ทั้ง component. คง API/การให้สิทธิ์และสถานะเดิม; F09 คง PARTIAL ตามงานที่เหลือ
- ตรวจผ่าน pnpm --filter web exec prettier --write/--check src/components/wallet/customer-main-quest.tsx, pnpm --filter web lint/build (33 routes); browser ตรวจวงกลมแสดง Coins จริง 5/100 และฟอนต์ปกติ. ไม่มี business decision/API change และไม่เพิ่ม tests สำหรับ styling; next: ผู้ใช้ตรวจขนาดวงกลม/spacing ตามต้องการ แล้วทำ customer history/AI integration ที่ค้าง

### 2026-10-13 05:52 Asia/Bangkok — R1-D5-A/F09: shadcn Quest month selector, latest year only

- เปลี่ยน /wallet/quests ใน apps/web/src/components/wallet/customer-main-quest.tsx เป็น shadcn Select/Trigger/Value/Content/Item ที่ติดตั้งไว้ พร้อม label และ pending state. กรองเฉพาะปีของเดือนล่าสุดที่ API ส่งมา (Bangkok current year) แทนแสดงเดือนข้ามปี; API ยังรองรับย้อนหลัง12เดือนเหมือนเดิม ไม่แก้กฎ/ข้อมูล
- ตรวจผ่าน web Prettier write/check, pnpm --filter web lint/build (33 routes) และ browser เปิดรายการได้เฉพาะ2026-10 ถึง2026-01 ไม่มี2025, เลือก2026-09แล้วโหลดข้อมูลได้. F09 คง PARTIAL; ไม่มี blocker/decision ใหม่และไม่เพิ่ม tests สำหรับ selector presentation. Next: customer monthly history/AI integration ตามบอร์ด

### 2026-10-13 05:55 Asia/Bangkok — R1-D5-A/F09: Quest dropdown below trigger

- ตั้ง SelectContent ของ apps/web/src/components/wallet/customer-main-quest.tsx เป็น side=bottom, align=start, alignItemWithTrigger=false เพื่อให้รายการเปิดใต้ช่องเดือนแทนจัด selected item ทับ trigger. F09 คง PARTIAL; ไม่มี API/business change
- ตรวจผ่าน web Prettier write/check, pnpm --filter web lint/build (33 routes), browser screenshot ยืนยัน dropdown อยู่ใต้ trigger. ไม่เพิ่ม tests สำหรับ positioning; next: customer history/AI integration ตามบอร์ด

### 2026-10-13 17:53 Asia/Bangkok — R1-D3-A/F04: remove area selector and verify web

- ตรวจสถานะ `/wallet/explore` หลังเอาช่องเลือกพื้นที่ที่แสดงค่า “manual” ออกแล้ว; ยังคงปุ่มใช้ตำแหน่งปัจจุบันและช่องกรอกละติจูด/ลองจิจูด/รัศมีไว้
- ตรวจผ่าน Prettier write/check ของ `nearby-stores.tsx`, web ESLint และ production build 32 routes; ยังไม่ได้ทำ browser QA. F04 คง PARTIAL. Next: เปิด `/wallet/explore` ตรวจว่าไม่มี dropdown “manual” และค้นหาด้วยพิกัดได้ตามเดิม

### 2026-10-13 19:23 Asia/Bangkok — R1-D3-A/F04: rebuild customer Explore

- ทำ `/wallet/explore` ใหม่โดยไม่มี dropdown “manual”: คง geolocation แบบกดอนุญาตและกรอกพิกัดเอง, เชื่อมร้าน approved จาก `GET /stores`, เพิ่มค้นหาชื่อ/หมวด/พื้นที่ กรองหมวด เลือกร้านจากรายการ และ React Leaflet/OpenStreetMap พร้อมหมุดตำแหน่งค้นหา/ร้าน โดยโหลด tiles เมื่อกดเปิดแผนที่
- เพิ่มโหมดร้านตัวอย่างที่ติดป้ายชัดเจนพร้อม Coins ตัวอย่างสำหรับกรณียังไม่มีร้านจริง; ร้านจาก API แสดง Coins ว่า “รอเชื่อมระบบ” ไม่คำนวณใน frontend และไม่เพิ่ม Database/API/Postman
- ตรวจผ่าน Prettier write/check, web ESLint, production build 32 routes และ `git diff --check`; ยังไม่ได้ทำ browser QA 360/1920 px. F04 คง PARTIAL. Next: ทดสอบปฏิเสธตำแหน่ง→กรอกพิกัด→ค้นหา→เปิดแผนที่→เลือกหมุดใน browser จริง

### 2026-10-13 19:28 Asia/Bangkok — R1-D3-A/F04 + R1-D4-A/F09: FR-C02/FR-C04 combined UI preview

- ยืนยัน FR-C02 บน `/wallet/explore` มี Interactive Map, หมุดร้านจริง/ตัวอย่าง, ค้นหาชื่อ/พื้นที่, กรองหมวด, เลือกร้านดูระยะ/หมวด/Coins และกรอกพิกัดเองเมื่อไม่อนุญาตตำแหน่ง โดยไม่มี dropdown “manual”
- ปรับ `/wallet/scan` ให้ preview จาก QR จริงแสดงยอดซื้อ/ช่วยจ่าย/จ่ายเองจาก API และ Coins “รอเชื่อมระบบ”; เพิ่ม UI Preview ที่ไม่ยิง pay สำหรับพร้อมยืนยัน, ยอดเงินไม่พอ, สิทธิ์ช่วยจ่ายหมด และยืนยันซ้ำ พร้อม loading/pending label และข้อความไม่ตัดเงินจริง
- ไม่เพิ่ม Database/API/Postman. ตรวจผ่าน Prettier write/check, web ESLint, production build 32 routes และ `git diff --check`; ยังไม่ได้ทำ browser QA กล้อง/แผนที่. F04 คง PARTIAL และ F09 คง UI PREVIEW. Next: ทดสอบ flow จริงใน browser ที่ 360/1920 px และเชื่อม Coin estimate เมื่อ F06/F08 พร้อม

### 2026-10-13 20:28 Asia/Bangkok — R1-D4-A/F09: remove purchase mock controls

- เอากล่อง “ทดลองหน้าพรีวิว”, badge “ไม่ตัดเงินจริง” และปุ่มสถานะจำลองพร้อมยืนยัน/ยอดเงินไม่พอ/หมดสิทธิ์ช่วยจ่าย/ยืนยันซ้ำออกจาก `/wallet/scan` พร้อมล้าง state/handler mock ที่เกี่ยวข้อง
- คงหน้าพรีวิว QR จริงจาก API ซึ่งแสดงยอดซื้อ/ช่วยจ่าย/จ่ายเอง, loading, error และ Coins “รอเชื่อมระบบ” ไว้ตามเดิม; ไม่แก้ Database/API/Postman
- ตรวจผ่าน Prettier write/check, web ESLint, production build 32 routes และ `git diff --check`; ยังไม่ได้ทำ browser QA. F09 คง UI PREVIEW. Next: ทดสอบ QR/payment request จริงและค่อยเพิ่ม error-state UI จาก response จริงเมื่อ contract รองรับ

### 2026-10-13 20:44 Asia/Bangkok — cross-cutting maintenance: resolve PLAN merge conflict

- รวม conflict ใน `PLAN/PLAN.md`: ใช้ Feature/Daily Flag ฝั่งที่มีหลักฐานล่าสุดเรื่อง Coins/Main Quest และเก็บ collaboration handoff log จากทั้งสองฝั่งครบถ้วนโดยเรียงตามเวลา; ไม่เปลี่ยนสถานะ Feature เพิ่มจากหลักฐานเดิม
- ตรวจ conflict markers, Markdown format/check และ `git diff --check`; ไม่รัน app build/test เพราะแก้เฉพาะเอกสารแผน. Next: ดำเนินการ merge commit ต่อหลังตรวจ staged diff

### 2026-10-13 20:39 Asia/Bangkok — R1-D4-B/F10: rate history threshold column

- ปรับ apps/web/src/app/(government)/government/coin-rules/page.tsx: เพิ่มคอลัมน์เกณฑ์ (บาท) แสดง10,000 ตรงกับ fixed reporting threshold ของ API, เปลี่ยนหัวกลุ่มเป็นน้อยกว่าเกณฑ์/ตั้งแต่เกณฑ์ขึ้นไปเพื่อคง < และ >= ตามจริง, อธิบายยอดเท่ากับเกณฑ์ในหมายเหตุ และ empty row colspan9. ไม่เปลี่ยนกฎ/API/จำนวนร้าน; F10 คง PARTIAL
- ตรวจผ่าน web Prettier write/check, pnpm --filter web lint และ git diff --check; pnpm --filter web build ผ่าน33routes; ยังไม่ได้ browser QA รอบนี้. ไม่มี business decision/blocker ใหม่; next: ตรวจตารางหลัง refresh /government/coin-rules

### 2026-10-13 20:40 Asia/Bangkok — F06/F08/F10 investigation: current Coin rule verification

- ตรวจ quotePurchaseCoins และ CoinRatesService เทียบ read-only SQL ผ่าน node/pg+dotenv ใน apps/api: active rule v4 minimum50, threshold10000, lookback7days, new-low10/new-other5/repeat1; current frozen rate round13Oct18:00–14Oct06:00 Bangkok ตรงv4. ไม่มีการแก้ application/DB หรือเปลี่ยน Feature status
- ตรวจ active effective interval และ distinct current frozen rates จาก public tables สำเร็จ; ไม่รัน app tests/build เพราะเป็น investigation/documentation-only. Next: หากเปลี่ยนกฎให้สร้าง version ใหม่ผ่าน government UI และมีผลรอบถัดไป; คง frozen rates เดิมตาม contract

### 2026-10-13 20:51 Asia/Bangkok — R1-D4-I/F06: continuous new-customer Coin scale with ceiling

- เปลี่ยน apps/api/src/coin-rules/coin-rates.service.ts ให้คำนวณ Decimal ceil(max−(max−min)×clamp(sales,0,threshold)/threshold), ใช้ new_low_sales_coins/new_other_coins เป็นปลายช่วงเดิม; threshold0ใช้ค่าต่ำสุด, endpointsเท่ากันให้เรตคงที่. ลูกค้าซ้ำ/ขั้นต่ำ/lookback/cutoff คงเดิม; ใช้เฉพาะรอบที่สร้างใหม่ ไม่แก้ frozen shop_coin_rates/ledger เดิม และไม่มี migration. บันทึกการตัดสินใจก่อนแก้ใน docs/decisions.md; ปรับ docs/api-contract.md และ Postman descriptions ให้ตรงสูตร
- เพิ่ม unit cases สำหรับยอด0/ขอบเขตปัดขึ้น/ทศนิยม/ค่าครึ่งทาง/เกินเกณฑ์/ปลายช่วงที่ตั้งค่า/threshold0/equal endpoints และแก้ rate-generation unit/DB expected ที่9999.99จาก10เป็น6. ตรวจผ่าน pnpm --filter api lint/test/build (80 unit,14 opt-in DB skippedในdefault); RUN_COIN_RATES_DB_TESTS=true pnpm --filter api exec vitest run src/coin-rules/coin-rates.db.spec.ts ผ่าน4/4 บน disposable schemaพร้อม migrations/cleanup: concurrent winner, Decimal sales/refund cutoff, frozen reuse/next round, summary และ rollback. Prettier write/check ผ่าน; ไม่มี web change ในงานนี้จึงไม่รัน web build และไม่ได้รัน Postman collectionจริง
- F06 คง PARTIAL ตาม standalone preview/gates ที่เหลือ. ไม่มี blocker; next: รอบใหม่06:00/18:00จะบันทึกเรตแบบscaleตามกฎเดิม และตรวจ /store/QR previewจาก frozen rateจริงโดยไม่ rebuildรอบปัจจุบัน

### 2026-10-13 20:56 Asia/Bangkok — R1-D4-B/R1-D4-I, F06/F10: formula and sales→Coins history details

- ประวัติกฎ /government/coin-rules รวม3คอลัมน์ใหม่ยอดต่ำ/ใหม่ทั่วไป/ซ้ำเป็นรายละเอียด Coins: สูตรตามค่ากฎแต่ละเวอร์ชัน, ตัวอย่างยอดขาย0/25/50/75/100%→Coins และเรตซ้ำ; colspan8 และหมายเหตุสูตรปัจจุบันสำหรับรอบใหม่ ไม่อ้างว่าเปลี่ยน frozen history. เพิ่ม calculationDetail ใน GET rules[], web DTO และ Postman/contract; บันทึกกติกาใน decisions ก่อนแก้
- ย้าย Decimal scale helper ไป apps/api/src/coin-rules/coin-scale.ts เพื่อให้ rate generation กับ explanatory samples ใช้สูตรเดียวกัน; server floorยอดตัวอย่างถึงสตางค์ก่อนคำนวณ/deduplicate, threshold0ไม่หารศูนย์. Webแสดงค่าserver ไม่คำนวณ Coins เอง. แก้ coin-rules.service/spec, coin-rates import/re-export, เพิ่ม coin-scale.spec, web page/api.ts; ไม่มี migration/mutationข้อมูลจริง
- ตรวจผ่าน API lint/test/build (82 unit,14 opt-in skipped ในdefault), RUN_COIN_RATES_DB_TESTS=true pnpm --filter api exec vitest run src/coin-rules/coin-rates.db.spec.ts ผ่าน4/4 disposable schema/migrations/cleanup; web lint/build33routes และ Prettier write/check ผ่าน. Browser GOVERNMENT demo เห็นv4สูตร10→5, คู่0→10/2500→9/5000→8/7500→7/10000→5 และv2ใช้8000/9→4ตามกฎจริง; ตรวจ360/1920ไม่มีpage overflow ตารางเลื่อนแนวนอนได้. ไม่รัน Postman collectionจริง
- F06/F10 คง PARTIAL ตามบอร์ด; ไม่มี blockerใหม่. Next: ตรวจเรตรอบใหม่จากสูตรscaleและต่อ seller transaction view/acceptance ที่ค้าง

### 2026-10-13 20:58 Asia/Bangkok — R1-D4-B/F10: five sales/Coins comparison columns

- ปรับ apps/web/src/app/(government)/government/coin-rules/page.tsx เอาสูตรและdetail chips ออกจากประวัติกฎ เปลี่ยนเป็น5คอลัมน์ตัวอย่างเรียงเทียบกัน แต่ละช่องยอดขายบาทด้านบน/Coinsด้านล่างจาก API; ตัวอย่างไม่ครบแสดงขีด, colspan12 และ captionตรงข้อมูล. ปรับคำอธิบายUIใน docs/api-contract.md; API/สูตร/ledgerไม่เปลี่ยน และF10คงPARTIAL
- ตรวจผ่าน web Prettier write/check, pnpm --filter web lint/build33routes และ git diff --check; browser v4เห็น0บาท/10Coins,2500/9,5000/8,7500/7,10000/5 แยก5cells และไม่แสดงformula. ไม่เพิ่ม tests สำหรับ presentation และไม่รันAPItestsเพราะไม่มีbackendchange. ไม่มีdecision/blockerใหม่; next: seller transaction view/acceptance ตามบอร์ด

### 2026-10-13 21:04 Asia/Bangkok — cross-cutting maintenance/F08: merge PLAN conflict and confirm transaction scope

- แก้ conflict ระหว่าง HEAD กับ coin-rule ใน PLAN/PLAN.md โดยเก็บ handoff ทั้งฝั่ง Explore/QR/AI และฝั่ง Coin scale/ตารางกฎ ไม่เลือกทับฝ่ายใด; ตรวจทุก heading จาก index stages2/3 ว่ายังอยู่ครบ. ปรับเฉพาะ current F08/R1-D5-I rows และ dependency R1-D2-I ให้ตรง Main Quest จริง, ถอน refund จากงานค้างตามผู้ใช้ยืนยันไม่ยกเลิก/คืนรายการสำเร็จ พร้อม scope noteที่แทนข้อกำหนดเก่าโดยไม่ลบประวัติ
- ตรวจผ่าน pnpm --filter web exec prettier --write/--check ../../PLAN/PLAN.md, conflict-marker check, preserved-heading assertions และ git diff --check -- PLAN/PLAN.md. งานdocumentation-only ไม่รัน app tests/build. Stageเฉพาะ PLAN/PLAN.md เพื่อmark conflict resolved; ไม่แก้ staged source files อื่นและไม่สร้าง merge commit
- F08 คงPARTIALจนผ่านreview/acceptanceจริง; ไม่มีblockerการmergeไฟล์นี้. Next: ผู้ใช้ตรวจ staged diff แล้วดำเนิน merge commit ตาม workflow; customer monthly history/AI/government budget management ยังอยู่ตามบอร์ด

### 2026-10-13 20:53 Asia/Bangkok — R1-D5-A/R1-D5-I, F02/F09: daily wallet history and awarded Coins

- เปลี่ยน CUSTOMER `/wallet/history` จาก monthly fixture เป็น ledger history จริงเหมือน seller และจัดกลุ่มรายการตามวัน Asia/Bangkok; คง Card/สีเดิม ใช้ `+` สีเขียวสำหรับเงินเข้าและ `−` สีแดงสำหรับเงินออก โดยไม่เพิ่มหัวข้อรายรับ/รายจ่ายแยกย่อย
- รายการชำระยังแสดง “จ่ายเอง”, “สิทธิ์ช่วยจ่าย” และ Main Quest breakdown; เพิ่ม `coinsEarned` จาก non-reversed `coin_entries` ของ purchase จริงใน `GET /wallets/history` แล้วแสดง `+N Coins`. ไม่มีการคำนวณ Coins หรือยอดเงินใหม่ใน browser และ seller history ไม่เปิดเผย Coins ของลูกค้า
- ปรับ `wallets.service.ts`, `live-wallet.tsx`, `wallet-app.tsx`, contract และ Postman assertion. ตรวจผ่าน API Vitest64/64 (14 opt-in DB skipped), API lint/build, web lint/build33 routes และ Prettier ของไฟล์แก้. ยังไม่ได้ browser QA ด้วยข้อมูลหลายวัน; F09 คง PARTIAL เพราะ monthly purchase-history filter/refund/AI ยังเหลือ. Next: เปิด `/wallet/history` ด้วยบัญชีที่มี Coin award ตรวจ responsive และเพิ่ม pagination/month filter จาก API

### 2026-10-13 21:00 Asia/Bangkok — R1-D5-A/F09: history amount breakdown alignment

- ย้าย “จ่ายเอง/สิทธิ์ช่วยจ่าย” และ Main Quest breakdown จากรายละเอียดฝั่งซ้ายไปอยู่ใต้จำนวนเงินฝั่งขวาใน Card `/wallet/history`; คง `+` เขียว/`−` แดง, Coins, การจัดกลุ่มรายวัน และข้อมูล API เดิม
- แก้เฉพาะ `apps/web/src/components/wallet/live-wallet.tsx`; ตรวจ Prettier write/check, web lint และ production build33 routes ผ่าน. ยังไม่ได้ browser QA ที่ viewport แคบ; F09 คง PARTIAL. Next: refresh `/wallet/history` และตรวจการตัดบรรทัดที่ 360px กับรายการชื่อร้านยาว

### 2026-10-13 21:05 Asia/Bangkok — R1-D5-A/F09: align breakdown with Coins

- ปรับ Card `/wallet/history` เป็น grid สองคอลัมน์: ชื่อร้าน/เวลา/Coins ฝั่งซ้าย และจำนวนเงิน/รายละเอียดจ่ายเองกับสิทธิ์ช่วยจ่ายฝั่งขวา โดยให้ breakdown อยู่ระดับเดียวและใช้ขนาด `text-xs` เท่ากับ Coins; คงสีและข้อมูลเดิม
- แก้เฉพาะ `apps/web/src/components/wallet/live-wallet.tsx`; Prettier write/check, web lint และ production build33 routes ผ่าน. ยังไม่ได้ browser QA ที่ 360px; F09 คง PARTIAL. Next: refresh หน้าและตรวจชื่อร้านยาวกับ breakdown ที่มี Main Quest

### 2026-10-13 21:07 Asia/Bangkok — cross-cutting maintenance/F09: resolve subsequent origin/dev merge

- ตรวจพบ mergeชุดใหม่กับ b7082ec หลัง merge coin-ruleจบแล้ว; resolve3conflictsใน PLAN/PLAN.md โดยเก็บทุกhandoff headingจากstages2/3, รักษาF06linear scale/F08no-refund scope และรับF09daily wallet historyจริง/R1-D5-Aล่าสุด. ไม่ย้อนรายการประวัติเก่าและไม่ยกFeatureเป็นDONE
- ตรวจผ่าน API lint/test/build (82 unit,14 opt-in skipped), web lint/build33routes และ Prettier write/check; แก้trailing whitespaceของ incoming live-wallet.tsxด้วยowning-package Prettierอย่างเดียว. งานmergeไม่รันDB/browserซ้ำ. Stageไฟล์ที่resolveและจบmerge commitในเครื่อง; ไม่push
- ไม่มีconflict/blockerไฟล์ค้าง; next: ตรวจgit statusหลังcommit และดำเนินreview/remote syncตามworkflow. History month filter/pagination/AIและreview gatesยังอยู่ตามบอร์ด

### 2026-10-13 21:11 Asia/Bangkok — R1-D4-B/F10: seller five-step Coins cards

- /store entry apps/web/src/app/(seller)/store/page.tsx ใช้ WalletApp/LiveWallet อยู่แล้ว; เพิ่มใน apps/web/src/components/wallet/live-wallet.tsx เป็น ordered cardsบนลงล่าง ยอดขายคู่CoinsจากAPI, ช่วงlookbackและยอดขายsnapshotร้าน, คงเรตnew/repeatที่ล็อกจริง/ขั้นต่ำ/เวอร์ชัน/เวลาสิ้นสุดพร้อมloading/error/no-rateเดิม. ไม่แสดงสูตร; ระบุว่าscale examplesประกอบกฎปัจจุบัน ไม่ใช่การเปลี่ยนเรตรอบเก่า
- เพิ่มsalesWindowDays/salesTotalSnapshot/scaleExamplesใน seller GET /wallets/me ผ่าน purchase-coins.ts โดยใช้ shared Decimal ruleScaleDetailจากruleของfrozen rate, คงowner/current interval/approval filtersและไม่มีDBwrites/migration. ปรับ seller projection unit, docs/api-contract.md และPostman assertions. CustomerยังรับshopCoinRates[]และไม่เห็นข้อมูลร้านอื่น
- ตรวจผ่าน API lint/test/build (82unit;14opt-in skipped), web lint/build33routes, owning-package Prettier write/check และ git diff --check. Browser SELLER /store แสดง5cardsจริง0→10/2500→9/5000→8/7500→7/10000→5 พร้อมfrozen new5/repeat1/minimum50; ตรวจ360/1920ไม่มีpageoverflowและการ์ดเรียงแนวตั้ง. ไม่รันDBtestsซ้ำเพราะread-only projectionและshared helperผ่านก่อนหน้า; ไม่รันPostman collectionจริง
- F10คงPARTIALตามseller transaction/review gatesที่เหลือ; ไม่มีblocker/กติกาธุรกิจใหม่. Next: ตรวจเรตรอบใหม่และseller transactionsตามบอร์ด

### 2026-10-13 21:15 Asia/Bangkok — R1-D4-B/F10: store shows current Coins only

- ปรับ apps/web/src/components/wallet/live-wallet.tsx ที่ /store เอา5scale example cards/sales snapshot explanationออก เหลือเรตfrozenจริงของร้านนี้: ลูกค้าใหม่/ลูกค้าซ้ำ, ขั้นต่ำต่อบิล, rule versionและเวลาสิ้นสุด. ขยายจำนวนCoinsด้วยfontปกติให้เด่น; คงloading/error/no-rateและowner filtering. ปรับคำอธิบายUIใน docs/api-contract.md; ไม่เปลี่ยนAPI/schema/สูตร/ledger
- ตรวจผ่าน web Prettier write/check, pnpm --filter web lint/build33routes; browser /storeเห็นnew5/repeat1/minimum50 และไม่มี5ตัวอย่าง. ไม่เพิ่มtestsสำหรับpresentationหรือรันAPItestsซ้ำเพราะไม่มีbackendchange. F10คงPARTIAL; ไม่มีblocker/decisionใหม่. Next: seller transactions/reviewตามบอร์ด

### 2026-10-13 21:19 Asia/Bangkok — R1-D4-B/F10: repeat-customer history case

- เพิ่มคอลัมน์ลูกค้าซ้ำท้าย5ตัวอย่างในประวัติกฎ apps/web/src/app/(government)/government/coin-rules/page.tsx แสดง repeat_coins จริงของแต่ละversion พร้อมเงื่อนไขซื้อครบขั้นต่ำ; ปรับempty row colspan13. ไม่เปลี่ยนAPI/กฎ/การคำนวณและคง5ตัวอย่างลูกค้าใหม่เดิม
- ตรวจผ่าน owning-package Prettier write/check, pnpm --filter web lint/build33routes และ sourceตรวจcolumn/rowจำนวนตรงกัน. ไม่เพิ่มtestsสำหรับpresentationและยังไม่ได้browserQAรอบนี้. F10คงPARTIAL; ไม่มีblocker/decisionใหม่. Next: refreshตารางตรวจคอลัมน์ลูกค้าซ้ำและทำreviewตามบอร์ด

### 2026-10-13 21:24 Asia/Bangkok — cross-cutting maintenance/F02: investigate missing test reset controls

- ตรวจ CustomerTopUp อ่านtestActionsEnabledจากwallet summaryและซ่อนปุ่มเมื่อfalse; WalletsServiceเปิดเฉพาะNODE_ENV!=production && ENABLE_TEST_WALLET_ACTIONS==='true'. เครื่องนี้ไม่พบflagในapi envและdotenvตรวจค่าเป็นunset; .env.exampleตั้งfalseโดยdefault. WebAPI_URLชี้localhost3000
- Read-only config/source checksสำเร็จ; liveHTTPloginตรวจruntimeไม่สำเร็จเพราะECONNRESET จึงไม่อ้างผลliveflag. ไม่แก้env/เปิดtestactionsหรือresetเงินจริง, ไม่มีsource/API changeและไม่รันappbuild/testsสำหรับinvestigation. วิธีแก้ในdev: ตั้งENABLE_TEST_WALLET_ACTIONS=trueในapps/api/.envแล้วrestartAPI/refreshweb; productionยังปิดเสมอ
- Featuresคงสถานะเดิม. Next: เปิดflagเฉพาะdevelopmentที่ต้องการทดสอบและตรวจGETwallet summaryส่งtrue; หากยังไม่ขึ้นตรวจAPIavailability/summaryerror (UIcatchซ่อนปุ่มไว้)

### 2026-10-14 04:11 Asia/Bangkok — R1-D1-I/F00 + R1-D3-I/F03: 20 nearby mock shops across all categories

- เพิ่ม apps/api/prisma/seed-nearby-shops.mjs และ package script seed:nearby-shops; สร้างบัญชีSELLERช่วงdemo_shop_01..20และร้านAPPROVED20ร้าน พร้อมคำอธิบายภาษาไทยติดป้ายข้อมูลทดสอบ/ที่อยู่จำลอง/เวลาเปิด/CASHwallet/หมวดร้าน. ใช้พิกัดกระจายแบบspherical destinationภายใน5kmของจุดที่ผู้ใช้ให้มา; ไม่บันทึกพิกัดผู้ใช้หรือรหัสผ่านในhandoffนี้. ครบ7หมวด: อาหาร/คาเฟ่/เบเกอรี่/เครื่องดื่ม/ของใช้/บริการอย่างละ3 และอื่นๆ2. ไม่แตะร้านจริง/ยอดเงิน/Coins/ratesที่ล็อกไว้
- Seeddefaultdry-run, productionguard, reserved-name/password/ownership collision checks, advisorylockและtransactionทั้งชุด; --applyจึงเขียนDB. บันทึกขอบเขตก่อนimplementในdocs/decisions.md. รันapplyครั้งแรกสร้าง20users/20shops; รันซ้ำสร้าง0/0. ตรวจDB20ร้านครบcategories/status/descriptions/scryptcredentialsและระยะจากพิกัดที่ปัด6ตำแหน่ง max4.59717km
- ตรวจผ่าน pnpm --filter api exec node --check prisma/seed-nearby-shops.mjs, pnpm --filter api seed:nearby-shops (dry-run), apply2รอบพร้อมassertions, owning-package Prettier write/check และ git diff --check. APIเดิมปิดอยู่จึงเปิดdist/main.jsชั่วคราวโดยENABLE_AUTO_COIN_RATES=falseเพื่อread-onlysmoke: sellerlogin/wallet200และCUSTOMER GETstoresค้นเจอ20mock/7categoriesทั้งหมดใน5km; หยุดprocessทดสอบแล้ว. ไม่รันappbuild/fullunitเพราะseed/config/docs-onlyและไม่มีschema/APIchange
- F00/F03คงPARTIALตามacceptanceที่เหลือ. ไม่มีblocker; next: เปิดแอปตามปกติแล้วค้นหาจุดทดสอบ/ล็อกอินบัญชีร้านใหม่; ร้านใหม่เข้ารอบCoinถัดไปตามfrozen-roundpolicy. คำสั่งใช้ซ้ำ: pnpm --filter api seed:nearby-shops --apply (ไม่มี --apply จะตรวจแผนอย่างเดียว)

### 2026-10-14 04:23 Asia/Bangkok — R1-D3-A/F04: DB Explore draggable origin and road routing

- ปรับ nearby-stores.tsx/nearby-stores-map.tsx และ use-nearby-stores.ts: ลบpreviewร้านจำลอง ใช้APPROVED DBstores/categoriesจริง, ค้นหาชื่อ/description/หมวด/พื้นที่ในขอบเขต, bar2:1; คงLAT/LONG/radiusและexplicitcurrent-location. เปิดmapก่อนมีร้านได้, คลิกพื้นที่ว่าง/ลากoriginpinเพื่อค้นหาใหม่, วาดradiusCircle, คงOSMattribution/Ctrl-wheel. ระยะรายการเป็นHaversineจากAPI ไม่อ้างว่าเป็นระยะถนน
- เลือกmarkerหรือcardแสดงOSRMdrivingPolyline/road distance/estimatedminutesจากoriginที่เลือกและGoogleMapsplace linkของร้านจริง. ใหม่ GET apps/web/src/app/api/routing/route.ts ตรวจsession/CUSTOMER viaNestme/validatedcoordinates, no-store/12s timeout/abort stale requests/NoRoute/invalidgeometry; routefailureคงร้าน/ระยะเส้นตรงและretryได้. เพิ่มOSRM_BASE_URLในweb.env.example, docs/decisions.mdก่อนimplementation, contractและmatchingPostmanBFFcases. ไม่มีNest/schema/money/Coinschange
- ตรวจผ่าน pnpm --filter web exec node --test scripts/check-routing.mjs 12/12 (auth/role/invalidcoordinates/options/lon-lat conversion/no-route/malformed/upstream/network), web lintไม่มีwarnings, productionbuild34routes, owning-packagePrettier write/check และgit diff --check. LiveOSRM200และbrowserDBsearchพบ20ร้าน; cardrouteแสดงroad2.84km/4minเทียบstraight1.11km; dragpinเปลี่ยนLAT/LONG/ค้นใหม่และล้างrouteเก่า; categoryคาเฟ่3ร้าน, markerselectionrouteจริง, queryละมุน1/ไม่พบ0. GoogleMapshrefตรงselectedshop; viewport360/1920ไม่มีoverflow วัดsearch198px/category99px. ไม่กดGPSpermissionจริง/ไม่ทดสอบGoogleMapsปลายทางหรือfullPostmancollection; ไม่รันNesttestsเพราะไม่มีNestcodechange
- F04/R1-D3-AคงPARTIALตามremainingacceptance/permissionQA; OSRMdemoเป็นbest-effortตามไฟล์ตัวอย่างผู้ใช้ ไม่มีtrafficETA. ไม่มีblockerใหม่. Next: userทดลองGetCurrentLocationบนอุปกรณ์จริงและทำaccount/AI/fullreviewตามบอร์ด; ตั้งOSRMendpointของระบบเมื่อใช้งานถาวร

### 2026-10-14 04:38 Asia/Bangkok — R1-D4-I/R1-D4-B, F06/F10: regenerate unused current Coin round for testing

- จำนวนร้านในประวัติเป็น frozen snapshot จึงยังเป็น3หลังเพิ่ม20mockshops. เพิ่มปุ่มยืนยันสร้างรอบปัจจุบันใหม่ (ทดสอบ) ใน government/coin-rules และ POST generate {regenerate:true} เฉพาะ GOVERNMENT/non-production; default {} และ workerยังreuseรอบเดิม. ใช้periodเดิม/กฎและยอดขายก่อนเริ่มรอบ รวมร้านAPPROVEDล่าสุด แทนที่ratesในtransaction และ409หากรอบเคยแจกCoins. บันทึกdecisionก่อนimplementใน docs/decisions.md; contract/Postmanตรงกัน
- แก้ coin-rates.service.ts/tests, purchase-coins.ts/tests และ wallets.service.ts ให้ settlementถือperiod shared lockเทียบกับ regeneration exclusive lock ป้องกันrace; ไม่มีschema/migrationหรือแก้ledger. Webแก้ page/hook/lib API พร้อมdialog/toast. Livebrowserกดสร้างใหม่สำเร็จ current round3→23ร้าน รอบเก่ายัง3; หลักฐาน artifacts/coin-rates-regenerated.png
- ตรวจผ่าน API lint/test/build (84unit); opt-in DB rates7/7 และpurchase awards10/10 ในdisposable schemas รวมrollback/award guard/shared-lock coordination. Web lint/build34routes, owning-package Prettier write/check และ git diff --check. ไม่รันfullPostmancollection/ไม่ทำรายการซื้อในDBหลัก; ไม่ทดสอบresponsiveเพิ่มรอบนี้
- F06/F10คงPARTIALตามacceptance/reviewที่เหลือ. ไม่มีblocker; next: ทดลองซื้อกับร้านใหม่จากfrozen rateและทำreviewตามบอร์ด. รอบที่แจกCoinsแล้วต้องรอรอบถัดไป ไม่เปิดทางเขียนทับประวัติการแจก

### 2026-10-14 04:44 Asia/Bangkok — R1-D4-I/R1-D4-B, F06/F10: five stage shop counts and refresh

- GET coin-rules summaryเพิ่มstageShopCounts5ช่องจากfrozen sales/rule thresholdในDB: <25%,25–<50%,50–<75%,75–<100%,>=100%; threshold0อยู่Stage5. บันทึกdecisionก่อนimplementและอัปเดตcontract/Postman; legacy2countsคงไว้สำหรับcompatibility. ไม่แก้สูตรCoins/schema/ledger/rates
- ตารางgovernment/coin-rulesแทนสองกลุ่มเดิมและเกณฑ์คงที่ด้วยStage1–5 พร้อมCoinsแจกจริงและrefresh read-only ใช้loading/error/retryเดิม. แก้coin-rules.service.ts,coin-rates.db.spec.ts,web lib/api.ts/page และdocs/Postman. Browserกดrefreshสำเร็จ current23ร้าน = [22,0,0,0,1], Coins0; รอบเก่า3ร้าน/Coins5. หลักฐานartifacts/coin-rates-stages.png
- ผ่าน pnpm --filter api lint/test/build (84unit), RUN_COIN_RATES_DB_TESTS=true vitest run src/coin-rules/coin-rates.db.spec.ts (8/8 รวมexactquarterboundaries/zero threshold/countsumและrollbackfixture), web lint/build34routes, owning-packagePrettier write/check และgit diff --check. ไม่รันfullPostmanหรือresponsiveเพิ่ม; ไม่มีDBหลักwritesในงานนี้
- F06/F10คงPARTIALตามreview/acceptanceที่เหลือ. ไม่มีblocker; next: reviewช่วงStageและseller transaction acceptanceตามบอร์ด

### 2026-10-14 04:46 Asia/Bangkok — R1-D4-I/R1-D4-B, F06/F10: sales bounds per history Stage

- เพิ่มstageSalesRangesจากกฎfrozenของแต่ละรอบในcoin-rules.service.ts และweb API type; ตารางแสดงช่วงยอดขายบาทใต้จำนวนร้านStage1–5ในแต่ละแถว. ตัวอย่างเกณฑ์10000: 0–<2500 / 2500–<5000 / 5000–<7500 / 7500–<10000 / 10000ขึ้นไป. ไม่มีrate/ledger/schemawrites; ช่วงempty roundเป็น[]และthreshold0เป็นช่วงว่างStage1–4/Stage5ตั้งแต่0. ปรับcontract/Postman assertionsและDBspec
- ผ่าน API lint/build และ opt-in coin-rates DB8/8 รวมranges/count/boundary assertions; web lint/build34routes; owning-packagePrettier write/check และgit diff --check. ไม่ทำbrowser/screenshotตามความต้องการผู้ใช้และไม่รันfullPostman. F06/F10คงPARTIALตามacceptanceที่เหลือ; ไม่มีblocker/กติกาใหม่. Next: reviewตารางช่วงยอดขายพร้อมflagsที่เหลือ

### 2026-10-14 09:39 Asia/Bangkok — R1-D3-A/F04: separate Explore origin picker and shop map

- `/wallet/explore`: แยกแผนที่เลือกจุดค้นหา (คลิก/ลาก pin) จากแผนที่ร้านและเส้นทาง; shop map ไม่ย้าย origin. เอา LAT/LONG inputs/state ออก แสดงพิกัด pin 6 ตำแหน่งแบบอ่านอย่างเดียวใต้ picker และใน popup; คง radius/search/category/GPS แบบ explicit และ route เดิม. แก้ apps/web/src/components/wallet/nearby-stores.tsx, nearby-stores-map.tsx และ docs/api-contract.md (UI description); ไม่มี API/backend/business-rule change หรือ decision ใหม่
- ผ่าน pnpm --filter web lint, pnpm --filter web build (34 routes), owning-package Prettier write/check และ git diff --check. Build ที่เรียกซ้ำระหว่าง build แรกถูก lock ปฏิเสธ; build แรกจบผ่าน. ไม่เพิ่ม tests สำหรับ reversible UI change; ยังไม่รัน browser/keyboard/responsive/GPS QA รอบนี้
- F04/R1-D3-A คง PARTIAL ตาม review/acceptance ที่เหลือ. ไม่มี blocker; next: ตรวจ click/drag picker, shop marker selection และ layout 360/1920 px ใน browser พร้อม GPS permission QA

### 2026-10-14 09:40 Asia/Bangkok — R1-D3-A/F04: dedicated manual pin button

- `/wallet/explore` เพิ่มปุ่ม “ปักหมุดตำแหน่งเอง” เปิด/ปิดเฉพาะ origin picker ซึ่งซ่อนตอนเริ่ม; แยก state/ปุ่ม “ดูแผนที่ร้าน” อิสระ. GPS/เลือก card ร้านเปิดเฉพาะ shop map ไม่เปิด picker. คง LAT/LONG แบบอ่านอย่างเดียวและ click/drag search เดิม; เพิ่ม aria-expanded/controls. แก้ apps/web/src/components/wallet/nearby-stores.tsx และ docs/api-contract.md; ไม่มี API หรือกติกาธุรกิจใหม่
- ผ่าน pnpm --filter web lint, pnpm --filter web build (34 routes), web Prettier write/check และ git diff --check. ไม่เพิ่ม tests สำหรับ UI toggle; browser/keyboard/360–1920 QA ยังไม่รันรอบนี้
- F04/R1-D3-A คง PARTIAL; ไม่มี blocker. Next: ตรวจปุ่มเปิด/ปิดสองแผนที่แยกกัน, picker click/drag และ GPS flow ใน browser

### 2026-10-14 09:44 Asia/Bangkok — R1-D3-A/F04: pin details above inline radius/search

- `/wallet/explore` ย้าย picker เหนือรัศมี; เมื่อเลือก pin/GPS แสดง LAT/LONG 6 ตำแหน่ง และจังหวัด/อำเภอ/ตำบล/รหัสไปรษณีย์จาก useReverseGeocode เดิมผ่าน BFF. ไม่ hardcode ที่อยู่ตัวอย่าง; เคลียร์ address เมื่อจุดเปลี่ยน, debounce/abort เดิมป้องกันผลเก่า, มี loading/toast/retry และค่าที่ไม่มีแสดง —. รายละเอียดคงอยู่เมื่อปิด picker. รัศมีและปุ่มค้นหาอยู่ flex row เดียวกัน. แก้ apps/web/src/components/wallet/nearby-stores.tsx และ docs/api-contract.md; ไม่มี endpoint/schema/business-rule change
- ผ่าน pnpm --filter web lint, pnpm --filter web build (34 routes), owning-package Prettier write/check และ git diff --check. ไม่เพิ่ม tests สำหรับ UI presentation; ยังไม่รัน browser/GPS/live reverse lookup/360–1920 QA รอบนี้
- F04/R1-D3-A คง PARTIAL; ไม่มี blocker/decision ใหม่. Next: ตรวจ pin หลายตำแหน่งและ missing-address/error/retry พร้อม layout ใน browser

### 2026-10-14 09:50 Asia/Bangkok — R1-D3-A/F04: two-row Explore search controls

- `/wallet/explore` แถวแรกช่องค้นหาชื่อร้าน/พื้นที่ขยายเต็มพื้นที่กับปุ่ม submit ค้นหา; แถวสองรัศมีและหมวดหมู่กว้างเท่ากัน พร้อม labels/h-10/min-w-0. รวม controls ใน form เดียว Enter/ปุ่มใช้ origin/radius เดิม; คง text/category filtering เดิม. แก้ apps/web/src/components/wallet/nearby-stores.tsx และ docs/api-contract.md; ไม่มี API/business-rule change
- ผ่าน pnpm --filter web lint, pnpm --filter web build (34 routes), web Prettier write/check และ git diff --check. ไม่เพิ่ม tests สำหรับ layout; browser/keyboard/360–1920 QA ยังไม่รันรอบนี้
- F04/R1-D3-A คง PARTIAL; ไม่มี blocker/decision ใหม่. Next: ตรวจสองแถวบน mobile/desktop และ Enter/search/category flow ใน browser

### 2026-10-14 10:00 Asia/Bangkok — R1-D3-A/F04: debounce search and matching control heights

- `/wallet/explore` เพิ่ม text filter debounce300ms พร้อม cleanup timer; submit/Enter ใช้ query ปัจจุบันทันทีและ refresh radius เดิม, category ยังทันที. พิมพ์ไม่เพิ่มAPI calls. เพิ่ม label ค้นหาร้านผูก input id และจัด search input/button/radius/category สูง40pxเท่ากัน แถวแรกชิดล่าง. แก้ apps/web/src/components/wallet/nearby-stores.tsx และ docs/api-contract.md; ไม่มี API/business-rule change
- ผ่าน pnpm --filter web lint, pnpm --filter web build (34 routes), owning-package Prettier write/check และ git diff --check. ไม่เพิ่ม tests สำหรับ local debounce/UI; browser timing/keyboard/360–1920 QA ยังไม่รันรอบนี้
- F04/R1-D3-A คง PARTIAL; ไม่มี blocker/decision ใหม่. Next: ตรวจพิมพ์เร็ว/ล้าง query/Enter และความสูง controls บน mobile/desktop ใน browser

### 2026-10-14 10:03 Asia/Bangkok — R1-D3-A/F04: fix Select height override and remove search button

- `/wallet/explore` ลบปุ่มค้นหา ช่องชื่อร้านเต็มแถวและคง debounce300ms/Enter. พบ SelectTrigger ใช้ data-[size=default]:h-8 ซึ่ง specificity ทับ h-10; override variant เป็น h-10 เฉพาะหมวดหมู่หน้า Explore พร้อม block label. รัศมีเปลี่ยนแล้ว refresh เมื่อ blur/Enter เพื่อใช้ได้โดยไม่มีปุ่ม. แก้ apps/web/src/components/wallet/nearby-stores.tsx และ docs/api-contract.md; ไม่มี shared UI/API/business-rule change
- ผ่าน pnpm --filter web lint, pnpm --filter web build (34 routes), owning-package Prettier write/check และ git diff --check. ไม่เพิ่ม tests สำหรับ presentation; browser computed-height/keyboard/360–1920 QA ยังไม่รันรอบนี้
- F04/R1-D3-A คง PARTIAL; ไม่มี blocker/decision ใหม่. Next: วัด radius/category 40px ใน browser และตรวจ radius blur/Enter กับ debounce flow

### 2026-10-14 10:07 Asia/Bangkok — R1-D3-A/F04: align field labels and colocate map toggle

- จากภาพผู้ใช้ radius/category เริ่มคนละแนว: เปลี่ยน wrappers ทั้งคู่เป็น flex-col/gap-1 พร้อมหัวข้อ block/leading-5 เหมือนกัน แทน text node/inline span กับ space-y. คง40px variant override. ย้ายปุ่มดู/ซ่อนแผนที่ร้านจากกลุ่มGPS/pin มาเป็นคอลัมน์ที่สามแถว radius/category และชิดล่าง; radius/category แบ่งพื้นที่ที่เหลือเท่ากัน. แก้ apps/web/src/components/wallet/nearby-stores.tsx และ docs/api-contract.md; ไม่มี API/business-rule change
- ผ่าน pnpm --filter web lint, pnpm --filter web build (34 routes), owning-package Prettier write/check และ git diff --check. ตรวจภาพผู้ใช้และ source layout; ยังไม่รัน browser computed bounds/360–1920 QA รอบนี้ ไม่เพิ่ม tests สำหรับ presentation
- F04/R1-D3-A คง PARTIAL; ไม่มี blocker/decision ใหม่. Next: ตรวจขอบบน/ล่างของ radius/category/map toggle ใน browser mobile/desktop และ toggle flow

### 2026-10-14 10:10 Asia/Bangkok — R1-D3-A/F04: location details before location actions

- `/wallet/explore` ย้ายรายละเอียดตำแหน่งที่เลือกขึ้นเหนือกลุ่มปุ่มใช้ตำแหน่งปัจจุบัน/ปักหมุดตำแหน่งเอง/ดูหรือซ่อนแผนที่ร้าน; นำ map toggle กลับกลุ่มเดิม. Picker อยู่ใต้ปุ่มและเหนือ search; radius/category กลับสองคอลัมน์เท่ากัน คง aligned labels/40px/debounce เดิม. แก้ apps/web/src/components/wallet/nearby-stores.tsx และ docs/api-contract.md; ไม่มี API/business-rule change
- ผ่าน pnpm --filter web lint, pnpm --filter web build (34 routes), owning-package Prettier write/check และ git diff --check. ไม่เพิ่ม tests สำหรับ reorder UI; browser/keyboard/360–1920 QA ยังไม่รันรอบนี้
- F04/R1-D3-A คง PARTIAL; ไม่มี blocker/decision ใหม่. Next: ตรวจลำดับรายละเอียด/ปุ่ม/picker/search และ responsive ใน browser

### 2026-10-14 10:14 Asia/Bangkok — R1-D3-A/F04: compact shop-marker popup with application font

- `/wallet/explore` popup หมุดร้านใช้ font-sans ตามระบบ (Bai Jamjuree), text-sm/leading-6; เหลือหมวดหมู่และระยะเส้นตรงจาก API เท่านั้น พร้อมไม่มีหมวดหมู่ fallback. เอาชื่อร้านและข้อความแนะนำเส้นทางออกจาก popup; marker title และ card/route เดิมคงอยู่. ใช้ div แทน p เพื่อหลีกเลี่ยง paragraph margins ของ Leaflet. แก้ apps/web/src/components/wallet/nearby-stores-map.tsx; ไม่มี API/business-rule change
- ผ่าน pnpm --filter web lint, pnpm --filter web build (34 routes), owning-package Prettier write/check และ git diff --check. ไม่เพิ่ม tests สำหรับ presentation; browser popup/font/responsive QA ยังไม่รันรอบนี้
- F04/R1-D3-A คง PARTIAL; ไม่มี blocker/decision ใหม่. Next: กดหมุดร้านตรวจ popup สองบรรทัดและฟอนต์ใน browser

### 2026-10-14 10:21 Asia/Bangkok — R1-D3-A/F04: category Lucide icons

- `/wallet/explore` เพิ่ม category-icon.tsx mapping slug/ชื่อไทย: food/Soup, cafe/Coffee, bakery/Cookie, beverages/Wine, household/Lamp, services/Bath, other/Ellipsis. ใช้ใน dropdown/selected value, list card, popup และแทน ฿ บน shop marker ด้วย Lucide SVG (หมวดแรกของร้าน, unknown/empty fallback Ellipsis); cache Leaflet icons ตามหมวด. คงชื่อไทย/ทุกหมวด/ไม่มีหมวดและ search behavior. แก้ nearby-stores.tsx, nearby-stores-map.tsx และเพิ่ม category-icon.tsx; ไม่มี API/business-rule change
- ผ่าน pnpm --filter web lint, pnpm --filter web build (34 routes), owning-package Prettier write/check และ git diff --check. ไม่เพิ่ม tests สำหรับ icon mapping/presentation; browser dropdown/marker/popup/responsive QA ยังไม่รันรอบนี้
- F04/R1-D3-A คง PARTIAL; ไม่มี blocker/decision ใหม่. Next: ตรวจ7หมวดและร้านหลายหมวดใน browser ทั้ง marker/dropdown/card

### 2026-10-14 10:25 Asia/Bangkok — R1-D3-A/F04: routing failure Google Maps dialog

- `/wallet/explore` เมื่อ route request ล้มเหลวเปิด Dialog “ไม่สามารถแสดงเส้นทางได้” พร้อม MapPin และลิงก์ “เปิดโดยใช้ Google Maps” ของร้านที่เลือก target blank/noopener/noreferrer กับปุ่มปิด. แทน route-error toast ด้วย dialog; คง inline retry/straight distance เดิม. Dialog ผูก current routeKey ไม่แสดง failure ของ aborted/stale request; ปิดแล้วไม่เปิดซ้ำเองสำหรับ key เดิม, retry key ใหม่เปิดได้. แก้ apps/web/src/components/wallet/nearby-stores.tsx; ไม่มี API/business-rule change
- ผ่าน pnpm --filter web lint, pnpm --filter web build (34 routes), owning-package Prettier write/check และ git diff --check. ไม่เพิ่ม tests สำหรับ presentation; browser forced-route-failure/dialog keyboard/external-link QA ยังไม่รันรอบนี้
- F04/R1-D3-A คง PARTIAL; ไม่มี blocker/decision ใหม่. Next: จำลอง route API failure ตรวจ dialog/ปิด/retry และ Google Maps link ใน browser

### 2026-10-14 10:29 Asia/Bangkok — R1-D3-A/F04: numeric radius input

- `/wallet/explore` เปลี่ยนรัศมีเป็น type=number, required, min0.1/max50 ตาม validation เดิมและ step0.1; คง decimal keyboard/blur/Enter search. แก้ apps/web/src/components/wallet/nearby-stores.tsx; ไม่มี API/business-rule change
- ผ่าน pnpm --filter web lint, pnpm --filter web build (34 routes), owning-package Prettier write/check และ git diff --check. ไม่เพิ่ม tests สำหรับ native input attributes; browser numeric/empty/out-of-range QA ยังไม่รันรอบนี้
- F04/R1-D3-A คง PARTIAL; ไม่มี blocker/decision ใหม่. Next: ตรวจ numeric input/step และ blur/Enter validation ใน browser

# THAI Please — Flag Board R1

รอบเป้าหมาย **7–13 ตุลาคม 2569 (Asia/Bangkok)**. บอร์ดนี้เก็บ Flag, สถานะ และ dependency; งาน/acceptance อยู่ในใบงาน 4 บทบาทด้านล่าง. วันที่เป็นเป้าหมาย ไม่ใช่หลักฐานว่าผ่านการตรวจรับ.

| บทบาท                                       | ใบงาน                            |
| ------------------------------------------- | -------------------------------- |
| A — ลูกค้า                                  | [APP_DEV_A.md](APP_DEV_A.md)     |
| B — ร้านค้า/รัฐ                             | [APP_DEV_B.md](APP_DEV_B.md)     |
| AI — Recommendation                         | [AI_DEV.md](AI_DEV.md)           |
| I — Backend/ข้อมูล/Integration และกติกากลาง | [INTEGRATION.md](INTEGRATION.md) |

## Feature Flags

| Feature | สถานะล่าสุด                                                               | วันเป้าหมาย            | เจ้าของ         | Dependency            |
| ------- | ------------------------------------------------------------------------- | ---------------------- | --------------- | --------------------- |
| F00     | PARTIAL: repo/DB/baseline + demo seed 3 roles                             | D1                     | I               | —                     |
| F01     | PARTIAL: Auth/Register contract + Postman มีแล้ว                          | D1                     | I               | F00 ส่วนที่เกี่ยวข้อง |
| F02     | PARTIAL: Auth/role paths ผ่าน; wallet/Coins reads ยังไม่มี                | D2                     | I               | F01                   |
| F03     | PARTIAL: สมัครร้านสร้าง PENDING; CRUD/approval/search ยังไม่มี            | D3                     | I               | F02                   |
| F04     | PARTIAL: Login/Register + routes; ร้าน/ยอดเงินยัง preview                 | D3                     | A               | F01/F02/F03           |
| F05     | PARTIAL: สมัครร้านจริง + role routes; จัดการร้านยัง preview               | D3                     | B               | F01/F02/F03           |
| F06     | PARTIAL: Government rules API/UI + period schema; preview/generation TODO | D4                     | I               | F02/F03               |
| F07     | TODO                                                                      | D4–5                   | AI              | F03/F06               |
| F08     | TODO                                                                      | D5                     | I               | F06                   |
| F09     | UI PREVIEW: แยก path แล้ว; purchase/AI ยังไม่เชื่อม                       | D5                     | A               | F07/F08               |
| F10     | PARTIAL: Government rules API/UI; seller transactions/rules TODO          | D5                     | B               | F06/F08               |
| F11     | DB views มีแล้ว; API TODO                                                 | D6                     | I               | F08                   |
| F12     | SHELL ONLY: มี government routes; dashboard ยังไม่มี                      | D6                     | B               | F11                   |
| F13     | PARTIAL: Auth tests/route checks; full E2E/NFR ยังไม่ครบ                  | D6–7                   | ทุกคน / I รวมผล | F09–F12               |
| F14     | TODO                                                                      | D7 หรือหลัง gates ผ่าน | ทุกคน / I รวมผล | F13                   |

## Daily Flags

สถานะรอบใหม่เริ่มที่ TODO; อัปเดตเป็น DOING → PR → DONE ตามผลจริง หรือ BLOCKED พร้อมลิงก์ issue. ไม่ยกสถานะ UI Preview เป็น DONE ของ Feature.

| วัน          | Daily Flag                  | Feature     | สถานะ                                                                     | Dependency                                                                         | Issue / PR |
| ------------ | --------------------------- | ----------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------- |
| D1 / 7 ต.ค.  | [`R1-D1-A`](APP_DEV_A.md)   | F04/F09     | DOING                                                                     | ใช้ UI เดิม; ส่ง field list ให้ I; browser QA 360/1920 px ยังต้องทำ                | —          |
| D1 / 7 ต.ค.  | [`R1-D1-B`](APP_DEV_B.md)   | F05/F10/F12 | DOING                                                                     | ยังไม่เปลี่ยนสถานะร้านจริง; ส่ง DTO ที่ต้องใช้ให้ I                                | —          |
| D1 / 7 ต.ค.  | [`R1-D1-AI`](AI_DEV.md)     | F07         | TODO                                                                      | ร่วมล็อก F01; ไม่คิด Coins/visited rule แยกจาก I                                   | —          |
| D1 / 7 ต.ค.  | [`R1-D1-I`](INTEGRATION.md) | F00/F01     | DOING                                                                     | ไม่แก้ baseline ที่ apply แล้ว; contract/seed พร้อมให้ทุกคนใช้                     | —          |
| D2 / 8 ต.ค.  | [`R1-D2-A`](APP_DEV_A.md)   | F04         | DOING                                                                     | F01 + F02 ที่ merge แล้ว; fixture ใช้ได้เฉพาะ preview mode                         | —          |
| D2 / 8 ต.ค.  | [`R1-D2-B`](APP_DEV_B.md)   | F05         | DOING                                                                     | F01/F02; role switch ต้นแบบไม่ใช่ auth guard                                       | —          |
| D2 / 8 ต.ค.  | [`R1-D2-AI`](AI_DEV.md)     | F07         | TODO                                                                      | F01 + PrismaService; DB candidate filter ทดสอบได้โดยไม่รอ provider                 | —          |
| D2 / 8 ต.ค.  | [`R1-D2-I`](INTEGRATION.md) | F02         | DOING                                                                     | F00/F01; ยอดมาจาก ledger/DB จริง                                                   | —          |
| D3 / 9 ต.ค.  | [`R1-D3-A`](APP_DEV_A.md)   | F04         | TODO                                                                      | F03; ร้านไม่ร่วมไม่ปรากฏ; ปฏิเสธพิกัดแล้วยังค้นหาได้                               | —          |
| D3 / 9 ต.ค.  | [`R1-D3-B`](APP_DEV_B.md)   | F05         | DOING                                                                     | F03; owner isolation, validation/error และสถานะ pending/approved                   | —          |
| D3 / 9 ต.ค.  | [`R1-D3-AI`](AI_DEV.md)     | F07         | TODO                                                                      | F03 + F06 interface ที่ตกลง; scoring adapter ชั่วคราวยังไม่ใช่ endpoint DONE       | —          |
| D3 / 9 ต.ค.  | [`R1-D3-I`](INTEGRATION.md) | F03         | DOING                                                                     | F02; permission/filtering ที่ server; ส่งข้อมูลร้านจริงให้ทุกคน                    | —          |
| D4 / 10 ต.ค. | [`R1-D4-A`](APP_DEV_A.md)   | F09         | TODO                                                                      | F06 preview เมื่อ merge; ยังไม่อ้างว่าชำระสำเร็จหาก F08 ไม่พร้อม                   | —          |
| D4 / 10 ต.ค. | [`R1-D4-B`](APP_DEV_B.md)   | F10         | PARTIAL: Government rules API/UI; seller transactions/rules TODO          | D5                                                                                 | B          | F06/F08 |
| D4 / 10 ต.ค. | [`R1-D4-AI`](AI_DEV.md)     | F07         | TODO                                                                      | F03/F06; ไม่มี candidate ส่ง empty; provider ล่มยังใช้ DB จริง                     | —          |
| D4 / 10 ต.ค. | [`R1-D4-I`](INTEGRATION.md) | F06         | PARTIAL: Government rules API/UI + period schema; preview/generation TODO | D4                                                                                 | I          | F02/F03 |
| D5 / 11 ต.ค. | [`R1-D5-A`](APP_DEV_A.md)   | F09         | TODO                                                                      | F07/F08; กดซ้ำไม่ตัดยอด/เพิ่ม Coins ซ้ำ                                            | —          |
| D5 / 11 ต.ค. | [`R1-D5-B`](APP_DEV_B.md)   | F10/F12     | TODO                                                                      | F08; ร้านเห็นเฉพาะรายการตน; F11 ยังไม่พร้อมใช้ contract fixture ชัดเจน             | —          |
| D5 / 11 ต.ค. | [`R1-D5-AI`](AI_DEV.md)     | F07/F13     | TODO                                                                      | F07/F09; รายงานผลจริงและข้อจำกัด                                                   | —          |
| D5 / 11 ต.ค. | [`R1-D5-I`](INTEGRATION.md) | F08         | TODO                                                                      | F06; duplicate/concurrent, insufficient funds/budget และ month boundary tests      | —          |
| D6 / 12 ต.ค. | [`R1-D6-A`](APP_DEV_A.md)   | F13         | TODO                                                                      | F04/F09; browser evidence และผลทดสอบจริง                                           | —          |
| D6 / 12 ต.ค. | [`R1-D6-B`](APP_DEV_B.md)   | F12/F13     | TODO                                                                      | F11 เมื่อ merge; KPI ตรง seed และไม่เปิดเผยรายบุคคล                                | —          |
| D6 / 12 ต.ค. | [`R1-D6-AI`](AI_DEV.md)     | F13         | TODO                                                                      | F07/F09; แนบ cases ที่ผ่าน/ไม่ผ่าน                                                 | —          |
| D6 / 12 ต.ค. | [`R1-D6-I`](INTEGRATION.md) | F11/F13     | TODO                                                                      | F08; report privacy/filter/KPI, 100 concurrent p95 ≤ 3s เป็นเป้าหมายไม่ใช่ผลยืนยัน | —          |
| D7 / 13 ต.ค. | [`R1-D7-A`](APP_DEV_A.md)   | F14         | TODO                                                                      | F13 และ blocker ที่เกี่ยวปิดแล้ว                                                   | —          |
| D7 / 13 ต.ค. | [`R1-D7-B`](APP_DEV_B.md)   | F14         | TODO                                                                      | F12/F13; ไม่มี KPI mock ใน demo integrated                                         | —          |
| D7 / 13 ต.ค. | [`R1-D7-AI`](AI_DEV.md)     | F14         | TODO                                                                      | F13; grounded response ตรวจซ้ำ                                                     | —          |
| D7 / 13 ต.ค. | [`R1-D7-I`](INTEGRATION.md) | F14         | TODO                                                                      | F13 + PR ทุกคน; ไม่ tag หาก acceptance สำคัญยังไม่ผ่าน                             | —          |

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

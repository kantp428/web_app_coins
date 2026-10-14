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
| F04     | PARTIAL: DB Explore pin/routes + paginated scoped discovery/LLM search    | D3                     | A               | F01/F02/F03           |
| F05     | PARTIAL: สมัครร้านจริง + role routes; จัดการร้านยัง preview               | D3                     | B               | F01/F02/F03           |
| F06     | PARTIAL: Government rules API/UI + period schema; preview/generation TODO | D4                     | I               | F02/F03               |
| F07     | PARTIAL: scoped LLM search/tool/fallback + Explore UI; live E2E pending   | D4–5                   | AI              | F03/F06               |
| F08     | TODO                                                                      | D5                     | I               | F06                   |
| F09     | PARTIAL: Explore AI เชื่อมจริง; acceptance/browser QA รวมยังค้าง          | D5                     | A               | F07/F08               |
| F10     | PARTIAL: Government rules API/UI; seller transactions/rules TODO          | D5                     | B               | F06/F08               |
| F11     | DB views มีแล้ว; API TODO                                                 | D6                     | I               | F08                   |
| F12     | SHELL ONLY: มี government routes; dashboard ยังไม่มี                      | D6                     | B               | F11                   |
| F13     | PARTIAL: Auth tests/route checks; full E2E/NFR ยังไม่ครบ                  | D6–7                   | ทุกคน / I รวมผล | F09–F12               |
| F14     | TODO                                                                      | D7 หรือหลัง gates ผ่าน | ทุกคน / I รวมผล | F13                   |

## Daily Flags

สถานะรอบใหม่เริ่มที่ TODO; อัปเดตเป็น DOING → PR → DONE ตามผลจริง หรือ BLOCKED พร้อมลิงก์ issue. ไม่ยกสถานะ UI Preview เป็น DONE ของ Feature.

| วัน | Daily Flag | Feature | สถานะ | Dependency | Issue / PR |
| ------------ | --------------------------- | ----------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------- | ------- |
| D1 / 7 ต.ค. | [`R1-D1-A`](APP_DEV_A.md) | F04/F09 | DOING | ใช้ UI เดิม; ส่ง field list ให้ I; browser QA 360/1920 px ยังต้องทำ | — |
| D1 / 7 ต.ค. | [`R1-D1-B`](APP_DEV_B.md) | F05/F10/F12 | DOING | ยังไม่เปลี่ยนสถานะร้านจริง; ส่ง DTO ที่ต้องใช้ให้ I | — |
| D1 / 7 ต.ค. | [`R1-D1-AI`](AI_DEV.md) | F07 | PARTIAL: auth/3+2 + user-confirmed DDGS Search/sources contract | ดู decisions 12 ต.ค.; semantic fallback/review pending | — |
| D1 / 7 ต.ค. | [`R1-D1-I`](INTEGRATION.md) | F00/F01 | DOING | ไม่แก้ baseline ที่ apply แล้ว; contract/seed พร้อมให้ทุกคนใช้ | — |
| D2 / 8 ต.ค. | [`R1-D2-A`](APP_DEV_A.md) | F04 | DOING | F01 + F02 ที่ merge แล้ว; fixture ใช้ได้เฉพาะ preview mode | — |
| D2 / 8 ต.ค. | [`R1-D2-B`](APP_DEV_B.md) | F05 | DOING | F01/F02; role switch ต้นแบบไม่ใช่ auth guard | — |
| D2 / 8 ต.ค. | [`R1-D2-AI`](AI_DEV.md) | F07 | PARTIAL: retrieval/SQL ranker implemented; live SQL test pending | ไม่มี development DATABASE_URL; unit scope/validation ผ่าน | — |
| D2 / 8 ต.ค. | [`R1-D2-I`](INTEGRATION.md) | F02 | DOING | F00/F01; ยอดมาจาก ledger/DB จริง | — |
| D3 / 9 ต.ค. | [`R1-D3-A`](APP_DEV_A.md) | F04 | TODO | F03; ร้านไม่ร่วมไม่ปรากฏ; ปฏิเสธพิกัดแล้วยังค้นหาได้ | — |
| D3 / 9 ต.ค. | [`R1-D3-B`](APP_DEV_B.md) | F05 | DOING | F03; owner isolation, validation/error และสถานะ pending/approved | — |
| D3 / 9 ต.ค. | [`R1-D3-AI`](AI_DEV.md) | F07 | PARTIAL: Backend context/candidates + FastAPI/Postman | ไม่มี location filter; live Backend/model E2E และ review pending | — |
| D3 / 9 ต.ค. | [`R1-D3-I`](INTEGRATION.md) | F03 | DOING | F02; permission/filtering ที่ server; ส่งข้อมูลร้านจริงให้ทุกคน | — |
| D4 / 10 ต.ค. | [`R1-D4-A`](APP_DEV_A.md) | F09 | TODO | F06 preview เมื่อ merge; ยังไม่อ้างว่าชำระสำเร็จหาก F08 ไม่พร้อม | — |
| D4 / 10 ต.ค. | [`R1-D4-B`](APP_DEV_B.md) | F10 | PARTIAL: Government rules API/UI; seller transactions/rules TODO | D5 | B | F06/F08 |
| D4 / 10 ต.ค. | [`R1-D4-AI`](AI_DEV.md) | F07 | PARTIAL: verified IDs/active rates + public Search/citations/limits | อ่าน stored rates เท่านั้น; Search ล่มแจ้งข้อจำกัด; broader grounding pending | — |
| D4 / 10 ต.ค. | [`R1-D4-I`](INTEGRATION.md) | F06 | PARTIAL: Government rules API/UI + period schema; preview/generation TODO | D4 | I | F02/F03 |
| D5 / 11 ต.ค. | [`R1-D5-A`](APP_DEV_A.md) | F09 | TODO | F07/F08; กดซ้ำไม่ตัดยอด/เพิ่ม Coins ซ้ำ | — |
| D5 / 11 ต.ค. | [`R1-D5-B`](APP_DEV_B.md) | F10/F12 | TODO | F08; ร้านเห็นเฉพาะรายการตน; F11 ยังไม่พร้อมใช้ contract fixture ชัดเจน | — |
| D5 / 11 ต.ค. | [`R1-D5-AI`](AI_DEV.md) | F07/F13 | TODO | F07/F09; รายงานผลจริงและข้อจำกัด | — |
| D5 / 11 ต.ค. | [`R1-D5-I`](INTEGRATION.md) | F08 | TODO | F06; duplicate/concurrent, insufficient funds/budget และ month boundary tests | — |
| D6 / 12 ต.ค. | [`R1-D6-A`](APP_DEV_A.md) | F13 | TODO | F04/F09; browser evidence และผลทดสอบจริง | — |
| D6 / 12 ต.ค. | [`R1-D6-B`](APP_DEV_B.md) | F12/F13 | TODO | F11 เมื่อ merge; KPI ตรง seed และไม่เปิดเผยรายบุคคล | — |
| D6 / 12 ต.ค. | [`R1-D6-AI`](AI_DEV.md) | F13 | PARTIAL: 50 AI tests + token-free HTTP/Qwen/DDGS smoke; DB E2E pending | F07/F09; prior 43 Backend tests ผ่าน, opt-in SQL ยังไม่มี DATABASE_URL | — |
| D6 / 12 ต.ค. | [`R1-D6-I`](INTEGRATION.md) | F11/F13 | TODO | F08; report privacy/filter/KPI, 100 concurrent p95 ≤ 3s เป็นเป้าหมายไม่ใช่ผลยืนยัน | — |
| D7 / 13 ต.ค. | [`R1-D7-A`](APP_DEV_A.md) | F14 | TODO | F13 และ blocker ที่เกี่ยวปิดแล้ว | — |
| D7 / 13 ต.ค. | [`R1-D7-B`](APP_DEV_B.md) | F14 | TODO | F12/F13; ไม่มี KPI mock ใน demo integrated | — |
| D7 / 13 ต.ค. | [`R1-D7-AI`](AI_DEV.md) | F14 | TODO | F13; grounded response ตรวจซ้ำ | — |
| D7 / 13 ต.ค. | [`R1-D7-I`](INTEGRATION.md) | F14 | TODO | F13 + PR ทุกคน; ไม่ tag หาก acceptance สำคัญยังไม่ผ่าน | — |

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

### 2026-10-12 16:19 Asia/Bangkok — Maintenance: สรุปหน้าที่ AI Dev

- อ่าน AI_DEV.md, INTEGRATION.md, แผน A, CoreIdea, API contract และ decisions เพื่อสรุป F07/F13/F14, dependencies และ acceptance; แก้เฉพาะบันทึก PLAN/PLAN.md ไม่เปลี่ยนสถานะ Feature/Daily Flag จากการอ่านเอกสาร
- ข้อมูลล่าสุด: discovery ใช้พิกัด/radius แทน area_code; description ร้านเป็น untrusted data; F06 generation/preview/rule service สำหรับ recommendation ยังต้องทำต่อ
- ตรวจ: pnpm Prettier เรียกไม่ได้จาก PowerShell execution policy; ลอง pnpm.cmd write/check แล้วไม่คืนผล และไม่มี node_modules/Prettier ใน workspace จึงยังยืนยัน formatting ไม่ได้; ไม่รัน app tests/build เพราะสรุปเอกสารเท่านั้น ไม่มีการแก้ application code
- ขั้นต่อไป: เริ่ม R1-D1-AI ล็อก recommendation DTO/provider/fallback และนโยบายไม่มีพิกัดร่วมกับ A/I; เตรียม retrieval/ranker tests แล้วเชื่อม F03/F06 เมื่อพร้อม

### 2026-10-12 17:36 Asia/Bangkok — AI preparation / F07: FastAPI chatbot scaffold

- งาน cross-cutting เตรียม AI ตามคำขอผู้ใช้ใน `ai-service/`; ไม่ตรง acceptance ของ Daily Flag recommendation เต็มชุด จึงคง Daily Flags เดิมและระบุ F07 PARTIAL เท่านั้น ไม่มี PR/review/CI gate ที่ปิดแล้ว
- เพิ่ม [main.py](../ai-service/main.py) สำหรับ `GET /health`, `POST /chat`, `/docs`, `/openapi.json`; แยก schemas, async mock adapter และ prompt ที่ยังไม่ใช้งานจริง พร้อม runtime dependency lock, dev requirements, Python ignores, tests และ [คู่มือรัน](../ai-service/README.md)
- ปรับ README stack, [contract](../docs/api-contract.md), [decisions](../docs/decisions.md#2026-10-12--standalone-fastapi-chatbot-scaffold), [FastAPI skill](../.agent/skills/fastapi-ai/SKILL.md) และ [Postman](../apps/api/postman/THAI-Please.postman_collection.json) หมวด AI service (local mock), ตัวแปร aiBaseUrl และ 10 requests พร้อม expected status/test scripts
- ตรวจจริง: `.venv/Scripts/python.exe -m unittest discover -s tests -v` ผ่าน 7 tests (รวม 7 invalid-input subcases); `pip check` ผ่าน; Black write/check ผ่าน Python 5 ไฟล์; `python -X utf8 .../skill-creator/scripts/quick_validate.py .agent/skills/fastapi-ai` ผ่าน. Uvicorn จริงบน temporary loopback port รับทั้ง 10 requests จาก collection ได้ 200/422 ตามคาดและหยุด process แล้ว; ไม่ได้รัน Postman JavaScript runner
- Formatting: pnpm --filter api exec prettier ค้าง/timeout ใน environment นี้; ใช้ Prettier 3.4.2 ตาม API package ติดตั้งแยกใน ignored ai-service/.tools แล้วเรียกผ่าน Node โดยตรง write/check Markdown/JSON ที่แก้ผ่านตาม config เดิม. Python ใช้ Black เพราะ Prettier ปัจจุบันไม่รองรับ .py. ไม่รัน web/NestJS build เพราะไม่แก้ runtime ของสองแอปนั้น
- ข้อจำกัด/ขั้นต่อไป: mock acknowledgement แบบ stateless ยังไม่มี model/auth/history/ร้าน/Coins จริง; dependency TestClient แจ้ง deprecation ของ httpx แต่ tests ผ่าน. ตกลง provider/model, history retention และ authenticated NestJS boundary ใน decisions แล้วค่อยทำ retrieval/rule grounding ตาม F03/F06 และเชื่อม F09; ไม่มี blocker สำหรับการลอง scaffold local

### 2026-10-12 17:38 Asia/Bangkok — Maintenance / AI: คำสั่ง service ใน Test.md

- เพิ่ม [Test.md — AI service](../Test.md#ai-service--fastapi-chatbot): ติดตั้ง Python venv/dependencies, เปิด/หยุด Uvicorn, Swagger, PowerShell ภาษาไทย, Postman aiBaseUrl, validation/expected responses และ unit tests/Black/pip check; ผล tests ที่อ้างเป็นหลักฐานจากรอบ scaffold ไม่ใช่การรันใหม่
- เพิ่มกติกาใน [AGENTS.md](../AGENTS.md#service-usage-documentation) และ [fastapi-ai skill](../.agent/skills/fastapi-ai/SKILL.md) ให้คอยอัปเดต Test.md ในงานที่เปลี่ยนวิธีใช้งาน service; [ai-service/README.md](../ai-service/README.md) ลิงก์กลับคู่มือกลาง
- ตรวจ: Node เรียก Prettier 3.4.2 ที่ติดตั้งตาม API package ผ่าน `--write` และ `--check` ทั้ง 5 Markdown; `python -X utf8 .../skill-creator/scripts/quick_validate.py .agent/skills/fastapi-ai` และ `git diff --check` ผ่าน. ไม่รัน app build/runtime tests ซ้ำเพราะแก้เอกสารเท่านั้น
- ไม่มี business decision/blocker ใหม่; Feature/Daily Flags คงเดิม. ขั้นต่อไป: ใช้คำสั่งใน Test.md ลอง service และปรับคู่มือใน task เดียวกันเมื่อเชื่อม provider/configuration/API ใหม่

### 2026-10-12 17:39 Asia/Bangkok — Maintenance / AI: ใช้ README ของ service

- ผู้ใช้ปรับแนวทางจาก entry ก่อนหน้า: service ที่มี README ให้เก็บและคอยอัปเดตคำสั่งใช้งานใน README ของตนเอง เอาหมวด AI service ออกจาก [Test.md](../Test.md) และคงข้อมูลทดสอบส่วนอื่นไว้
- [ai-service/README.md](../ai-service/README.md) เป็นคู่มือหลัก เพิ่มรายละเอียดเปิด/หยุด service, Postman และ pip check ที่มีในหมวดเดิม; ปรับ [AGENTS.md](../AGENTS.md#service-usage-documentation) และ [fastapi-ai skill](../.agent/skills/fastapi-ai/SKILL.md) ให้ใช้แนวทางนี้แทนกติกาเดิม
- ตรวจ: Prettier 3.4.2 ผ่าน Node `--write`/`--check` ทั้ง 5 Markdown; skill quick_validate และ `git diff --check` ผ่าน. ไม่รัน runtime tests/build เพราะเปลี่ยนเอกสารเท่านั้น; ไม่มี business decision/blocker ใหม่ และคง Feature/Daily Flags เดิม
- ขั้นต่อไป: อัปเดต README ของ service ใน task เดียวกันเมื่อคำสั่ง/configuration/API เปลี่ยน โดยให้สอดคล้องกับ contract และ Postman

### 2026-10-12 17:45 Asia/Bangkok — Maintenance / AI: อธิบาย built-in docs route

- ตรวจ [main.py](../ai-service/main.py#L8) และ FastAPI ที่ติดตั้งใน .venv: constructor กำหนด docs_url/openapi_url โดย default; setup() เพิ่ม Swagger HTML route ผ่าน add_route อัตโนมัติ จึงไม่มี decorator /docs ในโค้ดแอป
- ตรวจด้วย rg/Get-Content จาก source จริง; แก้เฉพาะ handoff นี้และ Prettier write/check PLAN/PLAN.md พร้อม git diff --check ผ่าน. ไม่รัน tests/build เพราะอธิบายโค้ดโดยไม่เปลี่ยน runtime; ไม่มี blocker และไม่เปลี่ยน Feature/Daily Flags
- ขั้นต่อไป: เปิด /docs เมื่อ service รัน หรือกำหนด docs_url ใน FastAPI constructor หากต้องการเปลี่ยน path ภายหลัง

### 2026-10-12 18:54 Asia/Bangkok — R1-D1-AI / F07: Qwen3 4B connection + Service1 proposal

- ผู้ใช้เลือก Qwen3 4B ให้เชื่อมโมเดลก่อน และให้คุยรายละเอียด intent/recommendation/tools/filtering/Search ก่อน implement เต็มชุด; บันทึก [decisions](../docs/decisions.md#2026-10-12--qwen3-4b-connection-and-service1-design-scope) ก่อนลงมือและ [Service1 design](../ai-service/DESIGN.md) เสนอ reply/storeIds สูงสุด 5 รหัสจริง โดยยังไม่ใช้ response นี้จริง
- ต่อยอด package ที่ผู้ใช้แยกไว้: [main.py](../ai-service/main.py), router/chat.py, schemas/chat.py, config.py, services/llm.py และ prompts/system.py; แก้ import เดิมที่ชี้ schemas.py ซึ่งถูกย้ายแล้ว. คืน /health ตาม contract และคง /test ที่ผู้ใช้เปลี่ยนไว้เป็น hidden alias
- เชื่อม Ollama native /api/chat, default qwen3:4b; ส่ง system/user, stream:false/think:false และคืนเฉพาะ final assistant content เป็น `{reply,mode:"model",model}`. ทดสอบจริงพบ template ส่ง thinking ปนใน content จึงเพิ่ม /no_think, ตัดก่อน closing thinking tag และ reject unfinished/empty final answer พร้อม regression tests. จัดการ 502/503/504 โดยไม่คืน upstream body หรือ fallback mock; ตั้ง URL/model/timeout ผ่าน .env.example, เพิ่ม httpx/python-dotenv runtime และ regenerate lock เฉพาะ runtime 18 packages
- [README ของ service](../ai-service/README.md) มีคำสั่งติดตั้ง Ollama/pull model/config/run/test และข้อจำกัด; ปรับ root README, FastAPI skill, API contract และ Postman หมวด AI service (Qwen3 4B): 11 standard requests + 3 provider error scenarios พร้อม aiModel/expected status. ไม่เพิ่มคำสั่งใน Test.md
- ตรวจจริง: จาก ai-service รัน `.venv/Scripts/python.exe -m unittest discover -s tests -v` ผ่าน 17 tests รวม payload/system prompt/Thai/validation/final-content-only/inline-thinking/config/error cases ด้วย httpx MockTransport; `pip check` ผ่าน. เรียก unittest จาก root ครั้งหนึ่ง import config ไม่พบ แล้วรันจาก owning directory ตาม README ผ่าน. Uvicorn จริง + HTTP Ollama stub ผ่าน 11 standard collection requests และ missing-model503/invalidJSON502/upstream500→502; Postman JavaScript runner ไม่ได้รัน. Black write/check Python 7 ไฟล์ผ่าน โดยใช้ --workers 1 --no-cache หลัง cached workers ค้าง; Prettier 3.4.2 ผ่าน Node write/check Markdown/JSON ทั้ง 8 ไฟล์; skill quick_validate และ git diff --check ผ่าน. ไม่รัน NestJS/web build เพราะไม่แก้ runtime ของสองแอป
- Runtime จริง: ผู้ใช้ยืนยัน local Ollama; เตรียม official Windows standalone CPU 0.40.3 ใน ignored ai-service/.tools/ollama, executable signature Valid, เปิด loopback11434 และดาวน์โหลด qwen3:4b (SHA256 verified) ไว้ใน .tools/ollama-models โดยไม่แก้ PATH. `ollama list` พบโมเดลและ `ollama ps` แสดง CPU; FastAPI/Uvicorn บน temporary port → Ollama → Qwen3 จริงตอบ /chat 200 พร้อมภาษาไทย เฉพาะ final answer ผ่านหลังแก้ inline-thinking ใช้ 69.91 วินาที. หยุด temporary Uvicorn แล้ว คง Ollama background server ไว้; README มีคำสั่งเปิดใหม่. การติดตั้งผ่าน winget ดาวน์โหลดช้าจึงหยุดและใช้ standalone ทางการแทน
- ข้อจำกัด: live smoke เป็นคำทักทายหนึ่งกรณี ไม่ใช่ benchmark/intent/grounding evaluation; CPU อาจเกิน timeout120s สำหรับคำตอบยาว และ TestClient มี deprecation warning แต่ tests ผ่าน. ยังไม่มี auth/history/DB retrieval/tool loop/Search/storeIds ใน API; F07 PARTIAL และ R1-D1-AI DOING ไม่ใช่ acceptance DONE. ขั้นต่อไป: คุยแหล่งข้อมูลระบบ, filters/ranking, Search scope/provider/citations และ auth/history ใน DESIGN.md ก่อน implement workflow และปรับ F09 contract ร่วมกัน

### 2026-10-12 20:43 Asia/Bangkok — R1-D1-AI / F07: GPU runtime + Backend API/Auth review

- ผู้ใช้ขอให้ Qwen3 ใช้ GPU และสรุป Backend API/Auth เพื่อเตรียมเชื่อมตัวตนผู้ถาม. ตรวจ `nvidia-smi --query-gpu=name,memory.total,memory.free,driver_version --format=csv,noheader` พบ RTX 3050 6GB Laptop GPU/driver617.42; เพิ่ม official Ollama 0.40.3 CUDA13 DLLs 13 ไฟล์ (ZIP CRC verified) ใน ignored ai-service/.tools/ollama/lib/ollama/cuda_v13 แล้ว restart เฉพาะ standalone server ของโปรเจกต์ด้วย CUDA_VISIBLE_DEVICES=0, context4096, parallel1. คง server ไว้ ไม่มีการแก้ global PATH/driver หรือดาวน์โหลด model weights ซ้ำ
- ตรวจจริง: log offload36/36 layers; `ollama ps` =100% GPU และ `/api/ps` size_vram เท่ากับ model size ประมาณ3.2GB. FastAPI/Uvicorn บน temporary port → Ollama/Qwen3 จริง `/chat` 200 ใน101.55s รวม cold load/warm-up; คำทักทายเดิมผ่าน FastAPI TestClient + Ollama จริงโดยไม่มี dependency overrides หลังโหลดแล้ว200 ใน9.17s ทั้งคู่คืนภาษาไทยไม่มี thinking tags. หยุด temporary Uvicorn แล้ว; ตัวเลขเป็น smoke2ครั้งไม่ใช่ benchmark และ TestClient ยังมี deprecation warning
- ตรวจ registered controllers/services, AuthService.me และ Next.js session handlers: พบ9 NestJS routes; `/me` ตรวจ JWT HS256/issuer/audience/expiry + ACTIVE/current role แล้วคืน id/role/displayName, `/stores` CUSTOMER, `/government/coin-rules` GOVERNMENT. สรุปใน [DESIGN.md](../ai-service/DESIGN.md#backend-apis-ที่ตรวจพบ--12-ตค-2569); wallet/Coins/history/store-by-ID/recommendation endpoints ยังไม่มี. เป็น source review ไม่ได้เรียก Backend ที่ใช้ DB จริงหรือทดสอบ login ด้วยบัญชีจริง
- แก้ [README](../ai-service/README.md) คำสั่ง GPU/การตรวจ offload/ผลจริง, DESIGN.md และ [decisions](../docs/decisions.md#2026-10-12--gpu-runtime-and-backend-identity-review) เสนอ Next cookie → AI Bearer → Backend/me → verified context/tools โดย token ไม่เข้าโมเดล. `/chat` ยังไม่มี Auth/identity integration; ไม่เปลี่ยน HTTP contract/Backend routes จึงไม่มี Postman change. Prettier3.4.2 ผ่าน Node write/check Markdown4ไฟล์และ git diff --check ผ่าน; ไม่รัน unit tests/build ซ้ำเพราะไม่แก้ Python/TS source โดยใช้ real GPU smoke ตรวจ runtime ที่เปลี่ยน
- F07 คง PARTIAL, R1-D1-AI คง DOING. ขั้นต่อไป: ตกลงและ implement Auth boundary ผ่าน `/me` ก่อนเชื่อมข้อมูลส่วนบุคคล; กำหนด customer-readable system rules/candidate/card APIs และ test 401/403/expired token/account-role changes ร่วมกับ A/I. ยังไม่เปิด Tool Calling/DB filtering/Search ในรอบนี้

### 2026-10-12 20:45 Asia/Bangkok — Maintenance / AI: CUDA กับ Python requirements

- ตรวจ requirements.txt/requirements-dev.txt และ services/llm.py: FastAPI ใช้ httpx เรียก Ollama ผ่าน HTTP ไม่ได้โหลดโมเดลด้วย Python; CUDA libraries อยู่กับ Ollama runtime จึงไม่เพิ่ม CUDA/torch ลง requirements ปัจจุบัน. หากเปลี่ยนเป็นรันโมเดลผ่าน Python โดยตรง ต้องทบทวน dependencies/backend GPU ของ framework นั้นก่อน
- แก้เฉพาะ handoff; Feature/Daily Flags คงเดิม. Prettier ผ่าน Node write/check PLAN/PLAN.md และ git diff --check ผ่าน; ไม่รัน tests/build เพราะไม่มี runtime/config change. ขั้นต่อไปคงเชื่อม identity ผ่าน /me ตามแบบที่บันทึกไว้

### 2026-10-12 20:47 Asia/Bangkok — Maintenance / AI: ตำแหน่ง GPU configuration

- ตรวจ README คำสั่งเปิด Ollama: CUDA_VISIBLE_DEVICES=0 ถูกตั้งเป็น environment ของ server process ก่อน serve พร้อม CUDA13 libraries ใน .tools/ollama/lib/ollama/cuda_v13; ไม่ใช่ setting ใน llm.py หรือ .env ของ FastAPI และไม่ใช่ persistent global environment. ใช้คำสั่ง README เมื่อเปิด server ใหม่
- อ่าน server log ยืนยัน CUDA/RTX3050 และ `offloaded 37/37 layers to GPU`; แก้จำนวนใน README เป็น37/37ตาม log (entry GPU ก่อนหน้าระบุ36จากการนับ repeating/output layers). ไม่เปลี่ยน runtime/API/สถานะ Flag. Prettier ผ่าน Node write/check README/PLAN และ git diff --check ผ่าน; ไม่รัน inference/tests/build ซ้ำเพราะตอบตำแหน่ง config และแก้เอกสารเท่านั้น. ขั้นต่อไปคง identity integration ตาม DESIGN.md

### 2026-10-12 20:52 Asia/Bangkok — Maintenance / AI: คู่มือติดตั้ง GPU libraries

- ตรวจเอกสาร Ollama Windows/GPU ทางการแล้วเพิ่ม [README](../ai-service/README.md#ติดตั้ง-gpu-libraries-ใหม่): Windows installer รวม NVIDIA support หรือ standalone0.40.3 ZIP ที่มี GPU dependencies; ขั้นตอนหยุด server, แตก ZIP/copy CUDA13 DLLs จาก release เดียวกัน, เปิดใหม่และตรวจ offload พร้อม PowerShell ตัวอย่าง. ไม่ใช้ pip/CUDA Toolkit สำหรับ prebuilt Ollama ชุดนี้; ระบุว่าบนเครื่องติดตั้งแล้วและไม่รัน download/install ซ้ำ
- แก้ README/PLAN เท่านั้น คง Feature/Daily Flags. ตรวจ syntax ของ PowerShell blocks ด้วย Parser โดยไม่ execute, Prettier ผ่าน Node write/check ทั้ง2ไฟล์ และ git diff --check ผ่าน; ไม่รัน app tests/build/inference เพราะเป็นคู่มือติดตั้ง ไม่มี runtime/API change. ขั้นต่อไปใช้คู่มือเมื่อติดตั้งเครื่องใหม่ และทำ identity integration ตาม DESIGN.md

### 2026-10-12 20:59 Asia/Bangkok — Maintenance / AI: ชี้แจง automatic GPU support

- ผู้ใช้ทักว่าติดตั้ง Ollama ปกติควรมี GPU acceleration อัตโนมัติ; ตรวจเอกสาร Windows ทางการยืนยัน installer/standalone ZIP รวม NVIDIA GPU dependencies. แก้ README ให้ชัดว่าการเติม CUDA ครั้งนี้เกิดจากผมเลือกดึงเฉพาะไฟล์ CPU จาก ZIP ในรอบแรกเพื่อลด download ไม่ใช่ข้อกำหนดติดตั้งปกติ; CUDA_VISIBLE_DEVICES=0 เป็นตัวเลือกจำกัด GPU ไม่ใช่สวิตช์ที่ต้องใส่เสมอ
- แก้ README/PLAN เท่านั้น คง flags/runtime/API. Prettier ผ่าน Node write/check ทั้ง2ไฟล์และ git diff --check ผ่าน; ไม่รัน tests/build/inference เพราะชี้แจงเอกสาร ไม่มีโค้ดหรือ runtime เปลี่ยน. ขั้นต่อไปใช้ installer/ZIP ครบชุดสำหรับเครื่องใหม่และคง identity integration ตาม DESIGN.md

### 2026-10-12 21:09 Asia/Bangkok — Maintenance / AI: Token จากหน้าบ้านสำหรับ tools

- ตรวจ Next login/stores handlers และ FastAPI chat router เทียบกับ DESIGN.md: เว็บมี HttpOnly session cookie; เสนอให้ Next route อ่าน cookie แล้วส่ง Bearer ไป AI, AI ตรวจ /me และใช้ token เดิมเรียก protected read APIs ตามสิทธิ์ของผู้ถาม. โมเดลเลือก tool ส่วน server เป็นผู้เรียก API/แนบ credential; ส่งเฉพาะ verified context ที่จำเป็นให้โมเดล. ปัจจุบัน /chat ยังไม่ได้ตรวจหรือส่งต่อ token และยังไม่มี Next chat proxy
- แก้ handoff เท่านั้น ไม่เปลี่ยน flags/API/Auth policy หรือ implement workflow. Prettier ผ่าน Node write/check PLAN และ git diff --check ผ่าน; ไม่รัน tests/build เพราะอธิบาย flow เดิมโดยไม่เปลี่ยน source. ขั้นต่อไป implement/test cookie-to-AI-to-/me boundary ก่อนใช้ข้อมูลส่วนบุคคล ตามข้อเสนอใน DESIGN.md

### 2026-10-12 21:16 Asia/Bangkok — Maintenance / AI: เว็บและ AI บนเครื่องเดียวกัน

- ผู้ใช้ยกเลิกข้อสมมติเว็บเพื่อน/AI tunnel ระหว่างการอธิบาย แล้วให้เว็บกับ AI รันเครื่องนี้ทั้งคู่; ปรับ README, DESIGN และ decisions เป็น Next.js → loopback8000 FastAPI → loopback11434 Ollama พร้อมคงข้อเสนอ cookie/Bearer → Backend/me ก่อน personal-data tools. Backend URL อิงที่ NestJS รันจริง ไม่สมมติ host/port เพิ่ม; ไม่มีการเปิด tunnel/เริ่มเว็บหรือ Backend หรือ implement Auth ในการชี้แจงนี้
- คง Feature/Daily Flags; แก้เอกสาร4ไฟล์เท่านั้น. Prettier ผ่าน Node write/check README/DESIGN/decisions/PLAN และ git diff --check ผ่าน; ไม่รัน app tests/build เพราะไม่มี runtime/API change. ขั้นต่อไป implement/test local Next chat proxy และ AI identity boundary ตาม DESIGN.md เมื่อตกลง workflow

### 2026-10-12 22:18 Asia/Bangkok — R1-D2-AI / F07 (+ D1/D3/D4, F13): authenticated recommendations 3+2

- ผู้ใช้อนุมัติ implement และยืนยันขาดโควตาคืนเท่าที่มี; บันทึก [decision](../docs/decisions.md#2026-10-12--recommendation-implementation-three-new-two-repeat) ก่อน coding แทน unvisited-only เดิม. ร้าน APPROVED ตรง category แบบ OR; ใหม่สูงสุด3/เคยซื้อสูงสุด2 ไม่เติมข้ามกลุ่ม. Visit ใช้ประวัติ confirmed SUCCEEDED/REFUNDED ทุกเดือน; อ่าน stored new/repeat Coins ใน active period ไม่คิดอัตราหรือ award ขึ้นใหม่
- เพิ่ม [NestJS read APIs](../apps/api/src/recommendations/recommendations.controller.ts): GET `/recommendations/context`, POST `/recommendations/candidates` (200), CUSTOMER Bearer/ownership ผ่าน AuthService.me. SQL กรอง/แบ่งโควตา/จัดอันดับ Coins ที่ทราบก่อน, unknownท้าย, numeric ID tie; ไม่มี schema/migration/ledger writes. ลงทะเบียน AppModule และเพิ่ม unit/opt-in PostgreSQL TEMP-table tests
- [FastAPI /chat](../ai-service/router/chat.py) ต้องแนบ token และตรวจ context ก่อน inference. เพิ่ม Backend settings/adapter, Qwen native tool search_system_shops ที่ตรวจ master IDs/arguments และจำกัดหนึ่ง read/two inference calls. Model ได้ history summary20ร้านล่าสุด ไม่มี token/profile; ส่ง public reply + storeIds จาก Backend เท่านั้น พร้อม mode/model เดิม. อัปเดต main.py/OpenAPI metadata เป็น0.3.0 และ descriptions รวม Backend errors. ข้อมูลไม่มี purchased item lines; รู้เฉพาะร้าน/ประเภท ไม่อ้างสินค้าที่ซื้อจริง
- อัปเดต [README](../ai-service/README.md), DESIGN, API contract, decisions และ shared [Postman](../apps/api/postman/THAI-Please.postman_collection.json) ทั้ง chat auth/recommend/validation/provider และ context/candidates 401/403/400. คำสั่ง service อยู่ README ไม่เพิ่ม Test.md
- Checks: `.venv/Scripts/python.exe -m unittest discover -s tests -q` ใน ai-service ผ่าน28; `pip check` ผ่าน; Black write/check (`--workers 1 --no-cache`) ไฟล์ Python ที่แก้ผ่าน. Backend direct installed `.bin/vitest.cmd run` ผ่าน43/skip1 opt-in, `.bin/oxlint.cmd --type-aware src/ test/` และ `.bin/nest.cmd build` ผ่าน (cwd apps/api; เรียก oxlint ตรงจาก root หา tsgolint ไม่เจอ แก้โดยใช้ cwd package แล้วผ่านไม่มี warning). Initial missing generated client แก้ด้วย `.bin/prisma.cmd generate` โดยไม่ migrate. Prettier package API write/check ทุก TS/Markdown/JSON ที่แก้, Postman JSON/test-script syntax และ git diff --check ผ่าน
- Real Qwen/GPU fixture smoke `python -X utf8 tests/smoke_ollama.py` ผ่าน greeting/no tool, food+cafe/two real interpreted categories/5 verified fixture IDs, off-topic/no tool; ล่าสุด5.02s/55.75s/9.73s ตามลำดับ เป็น smoke ไม่ใช่ benchmark. แก้ prompt หลังพบโมเดลเรียกร้านเคยซื้อว่าเคยแนะนำ; รอบสุดท้ายใช้เคยซื้อถูกต้อง. `ollama ps` ยืนยัน100% GPU/context4096. Backend ใน smoke เป็น fixture ไม่ใช่ live DB
- Blocker/limits: opt-in PostgreSQL test ลองแล้วไม่ผ่านเพราะไม่มี development DATABASE_URL (normal suite จึง skip1); Docker daemon ไม่ทำงาน จึงยังไม่ยืนยัน SQL/live Backend + model E2E. ไม่มี Next chat proxy/UI/card-by-ID/Search/location/price/product filtering/conversation memory/semantic fallback. คง F07/F13 PARTIAL ไม่มี PR/DONE. ขั้นต่อไปตั้ง Backend DATABASE_URL/JWT_SECRET/ข้อมูล master แล้วรัน opt-in SQL + authenticated live smoke ก่อนเชื่อม Next HttpOnly-cookie chat proxy และทำ broader grounding/review

### 2026-10-12 22:44 Asia/Bangkok — Maintenance / AI: อธิบาย recommendation read APIs

- ตรวจ [Backend controllers/service](../apps/api/src/recommendations/recommendations.controller.ts) และ [FastAPI chat](../ai-service/router/chat.py) เพื่ออธิบาย GET `/recommendations/context` (ตรวจบัญชี/หมวดหมู่/สรุปประวัติ20ร้านล่าสุด) เทียบกับ POST `/recommendations/candidates` (รับ categoryIds, DB กรอง APPROVED/ประวัติทุกเดือน/โควตา3+2 และจัดอันดับ stored Coins). ทั้งคู่ CUSTOMER Bearer; AI server เป็นผู้เรียก ไม่ใช่โมเดลส่ง token เอง; public chat คืน storeIds แยกจาก internal candidate DTO
- แก้ PLAN handoff เท่านั้น คง flags/source/contracts. Prettier package API write/check PLAN และ git diff --check ผ่าน; ไม่รัน tests/build เพราะอธิบายโค้ดเดิม ไม่มี runtime change. ข้อจำกัด/ขั้นต่อไปคงเดิม: ตั้ง development DATABASE_URL แล้วตรวจ live SQL/Backend integration ก่อนเชื่อมหน้าเว็บ

### 2026-10-12 23:36 Asia/Bangkok — R1-D1/D4/D6-AI / F07/F13: DDGS public Search + four README cases

- ผู้ใช้อนุมัติ Search และเลือก DDGS ไม่ใช้ API key พร้อมขอ README ครบ 4 รูปแบบ; บันทึก [decision](../docs/decisions.md#2026-10-12--related-public-web-search-and-four-chat-examples) ก่อน coding. เพิ่ม [web_search.py](../ai-service/services/web_search.py), settings/.env.example และ pin ddgs9.16.0/lxml6.1.3/primp2.0.1 ใน runtime lock; ติดตั้ง local venv สำเร็จ ไม่เพิ่ม CUDA/weights/API key
- [POST /chat](../ai-service/router/chat.py) v0.4.0 ใช้ tool search_related_web เพิ่มจาก search_system_shops; อย่างละ1 read/รวม2 reads/3 inference calls. Public-topic/obvious-PII guards, official HTTPS sources/snippets only, no arbitrary page fetch, timeout/2 bounded workers. ส่ง sources:[{title,url}] แยก storeIds; server ตรวจ/render citation links และกำกับประกาศเก่า. Search disabled/blocked/empty/busy/failure แจ้งข้อจำกัด ไม่ทิ้ง IDs ที่ได้จาก DB ใน mixed request. Token/profile/history object ไม่ส่ง provider
- อัปเดต [README](../ai-service/README.md#ตัวอย่างคำถามครบ-4-รูปแบบ) ด้วยคำถาม/body/ผลที่คาดหวัง: plain chat, ถาม+ร้าน, public Search, นอกเรื่อง และ mixed/empty/short-quota/disabled/auth cases. ปรับ DESIGN/[API contract](../docs/api-contract.md)/[Postman](../apps/api/postman/THAI-Please.postman_collection.json) ให้ตรง sources/tool budget; Postman เพิ่ม public/mixed/off-topic/manual-disabled requests. ไม่แก้ Test.md หรือ NestJS runtime
- ตรวจจริงจาก ai-service: `.venv/Scripts/python.exe -m unittest discover -s tests -q` PASS42 และ `-m pip check` PASS. เริ่มเพิ่ม fallback test แล้วพบ missing mock import แก้แล้ว PASS. `python -X utf8 tests/smoke_ollama.py` กับ Qwen จริง+Backend fixture PASS greeting12.47s/food+cafe33.68s/off-topic8.67s. `python -X utf8 tests/smoke_web_search.py --model` กับ Qwen+DDGS จริง PASS3 official sources/no storeIds รอบสุดท้าย23.86s; เป็น connectivity/contract smoke ไม่ใช่ benchmark/full factual evaluation
- DDGS ช่วงแรกไม่คืนผล: diagnostics พบ HTTP202 challenge/Brave429, Yahoo ค้นผลทางการได้; multi-backend aggregation ข้าม engines ที่ provider ซ้ำ จึงใช้ DuckDuckGo→Yahoo แยก attempts คำค้นเดิม. ไม่มีการลด TLS หรือเปิด arbitrary URL. พบผลต่างปี/เฟส จึงเพิ่ม prompt แยกช่วงและ server กำกับ freshness. Search ยังไม่รับประกัน availability/accuracy; lexical guard ไม่ใช่ semantic classifier/DLP สมบูรณ์
- Black write/check Python ที่แก้, API Prettier write/check Markdown/JSON และ git diff --check PASS; JSON +65 Postman scripts syntax PASS (ไม่ได้รัน collection runner กับ Backend จริง). ไม่รัน web/Nest builds เพราะไม่แก้ runtime สองแอป. คง F07/F13 PARTIAL; live DB ยังไม่มี development DATABASE_URL และ Next chat proxy/UI/card-by-ID ยังไม่ต่อ. ขั้นต่อไปตั้ง DB แล้วรัน opt-in SQL/authenticated live E2E ก่อนต่อเว็บ พร้อมขยาย grounding/date/scope evaluation และตัดสินใจ production Search provider

### 2026-10-12 23:45 Asia/Bangkok — Maintenance / AI, related R1-D6-AI / F07/F13: token-free model test API

- ผู้ใช้ขอเส้นทดสอบแชท/Search/นอกเรื่องโดยไม่แนบ token และไม่ทำ recommendation; บันทึก [decision](../docs/decisions.md#2026-10-12--token-free-model-test-chat) ก่อน coding. เพิ่ม [POST /chat/test](../ai-service/router/chat.py), response แบบ /chat โดย storeIds ว่างเสมอ ไม่มี Auth/Backend dependency. [LLM workflow](../ai-service/services/llm.py) รองรับ absent context โดยไม่สร้าง actor/history/categories สมมติ; อนุญาตเพียง public Search ครั้งเดียว/สอง inference calls ปฏิเสธ shop/repeated/invalid calls ก่อน read. /chat เดิมยัง CUSTOMER Bearer; ไม่แก้ NestJS/runtime/dependencies
- OpenAPI v0.4.1 และ [README](../ai-service/README.md#ทดสอบโมเดลโดยไม่แนบ-token) มี PowerShell/Swagger ไม่ใช้ Authorization, สามกรณีทดสอบและขอร้านแล้วใช้ /chat+token. ปรับ DESIGN/[contract](../docs/api-contract.md) และ [Postman](../apps/api/postman/THAI-Please.postman_collection.json) เพิ่ม6 requests explicit No Auth รวม validation; ไม่เพิ่มคำสั่งใน Test.md
- ตรวจจริง: จาก ai-service `.venv/Scripts/python.exe -m unittest discover -s tests -q` PASS50 รวม8ใหม่ใน [test_chat_test.py](../ai-service/tests/test_chat_test.py) ตรวจว่า Backend dependency ห้าม resolve, ไม่มี shop tools/context, public Search/errors/validation, OpenAPI security แยก /chat. แก้ test แรกที่ใช้ Backend-forbidden override ไปเรียก /chat จน override ขัดกับ dependency เดิม; เอา assertionซ้ำออกและคง auth suite เดิมผ่านครบ
- `.venv/Scripts/python.exe -X utf8 tests/smoke_chat_test.py` ผ่าน HTTP TestClient→Qwen/DDGS จริง ไม่มี token/Backend: plain47.99s, Search59.72s/3 official sources, off-topic10.53s, recommendation-denial20.37s ทั้งหมด200/storeIdsว่าง. เป็น local smoke ไม่ใช่ benchmark/grounding acceptance. Black write/check Python6ไฟล์รวม ignored helper, API Prettier write/check Markdown/JSON6ไฟล์, git diff --check และ Postman JSON/71 scripts syntax/6 No Auth routes PASS; ไม่รัน collection runner หรือ web/Nest build เพราะไม่มี runtime change ในสองแอป
- ไม่มี blocker สำหรับเส้นทดสอบนี้. F07/F13 ยัง PARTIAL เนื่องจาก DB/UI/E2E/review gates เดิม; DDGS freshness/availability และ lexical scope evaluation ยังเป็นข้อจำกัดเดิม. ขั้นต่อไป restart FastAPI แล้วใช้ /docs→POST /chat/test ทดสอบข้อความ; งาน recommendation ให้ตั้ง development DATABASE_URL และตรวจ authenticated live E2E ก่อนต่อ Next UI

### 2026-10-12 23:46 Asia/Bangkok — Maintenance / AI: อธิบาย smoke test scripts

- ตรวจ [smoke_ollama.py](../ai-service/tests/smoke_ollama.py), [smoke_web_search.py](../ai-service/tests/smoke_web_search.py) และ [smoke_chat_test.py](../ai-service/tests/smoke_chat_test.py) เพื่ออธิบายการตรวจเส้นทางหลักกับ Ollama/DDGS จริง, fixture context และ HTTP TestClient แบบไม่ใช้ token/Backend. เป็น opt-in scripts ไม่รันตอนเปิด service หรือ unittest discovery แบบ test_*.py; ไม่ใช่ full DB E2E
- แก้เฉพาะ handoff นี้ คง Feature/Daily Flags/runtime/contracts. ตรวจ source ด้วย rg/Get-Content; Prettier package API write/check PLAN และ git diff --check ผ่าน. ไม่รัน smoke/tests/build ซ้ำเพราะเป็นการอธิบายโค้ดเดิม. ไม่มี blocker; ขั้นต่อไปใช้คำสั่ง smoke_chat_test จาก README เมื่อต้องการตรวจโมเดลและ Search จริงหลังเปลี่ยนโค้ด

### 2026-10-14 13:07 Asia/Bangkok — F04/F07/F09: audit ข้อกำหนด LLM-assisted Explore search

- อ่าน AGENTS.md, PLAN/PLAN.md, PLAN/AI_DEV.md, PLAN/APP_DEV_A.md, PLAN/INTEGRATION.md, docs/api-contract.md, docs/decisions.md และ skills nest-api/prisma-data/web-frontend/fastapi-ai ครบแล้ว; ตรวจ source ของ NestJS recommendations/stores, FastAPI AI orchestration และหน้า `/wallet/explore` เทียบกับข้อกำหนดที่ได้รับ
- พบของเดิมยังเป็นคนละ flow: GET `/stores` จำกัด50รายการ/ยังไม่มี pagination ตาม scope, recommendations ใช้นโยบาย3ร้านใหม่+2ร้านเคยซื้อและ Coins, ส่วน Explore คำนวณระยะทางบางส่วนฝั่งเว็บ. งานใหม่นี้ต้องไม่สืบทอดเงื่อนไขร้านไม่เคยซื้อหรือ Coins ranking โดยอัตโนมัติ และต้องคง map/cards/categories/routes เดิม
- ยังไม่แก้ source/contracts/decisions เพราะข้อความ requirement ถูกตัดหลัง POST `/stores/descriptions` และแจ้งว่ายังขาด52บรรทัด ซึ่งอาจกำหนด provider boundary, fallback/error UX, security และ acceptance tests; ไม่เดาเงื่อนไขที่หายไป. Checks รอบนี้เป็น read-only `rg`/`Get-Content`; ไม่รัน tests/build. ขั้นต่อไปให้ผู้ใช้ส่งข้อความตั้งแต่หลัง `- CUSTOMER auth และตรวจ scope จาก DB` จนจบ แล้วบันทึก decisions ที่ครบก่อน implement

### 2026-10-14 13:19 Asia/Bangkok — F04/F07/F09/F13: LLM-assisted Explore shop search

- บันทึก decisions ก่อน implement แล้วเพิ่ม NestJS orchestration แบบ CUSTOMER-only: GET `/stores` รองรับ category/pagination/metadata, POST `/recommendations/search`, `/stores/descriptions` และ `/stores/batch`. StoresService ใช้ PrismaService ร่วมและสร้าง scope APPROVED/radius/category จาก DB ทุกขั้น; ระยะ Haversine คำนวณ backend, hydration รักษาลำดับและตัดร้านที่หลุด scope. ไม่มีนโยบายร้านใหม่3+เก่า2หรือ Coins ranking
- เพิ่ม Ollama provider adapter/config server-only, structured `{shopIds}`, tool `get_shop_descriptions` แบบ read-only/scoped/batch, validation JSON/duplicate/out-of-scope, candidate batches50 สูงสุด500 + merge, timeout/token/tool-call/rate limits และ deterministic lexical fallback ทั้ง candidate set. Query/merchant text กำกับเป็น untrusted; browser ไม่รับ key/model และไม่ส่ง candidate/distance ให้เชื่อ
- หน้า `/wallet/explore` คง map/cards/category icons/pin/GPS opt-in/popup/OSRM/Google Maps dialog เดิม. Query ว่างโหลด discovery ทุกหน้าจน `hasNextPage=false`; query มีข้อความ debounce300ms แล้ว search→hydrate (แบ่งครั้งละ100). Origin/radius/category/query abort request เก่าและตรวจ request generation; ล้าง query กลับ discovery ทันที; fallback มีข้อความเตือนข้อจำกัด
- เพิ่ม Next HttpOnly-cookie BFF routes, `.env.example`, contract/decisions/Postman และ unit tests scope/pagination/fallback/model invalid IDs/duplicate JSON/tool scope. Checks: API Vitest91ผ่าน/18 skip, oxlint type-awareผ่าน, Nest buildผ่าน; web ESLintผ่านก่อน hydration batch แล้วพบ prefer-const1จุดและแก้แล้ว, Next production buildผ่าน37 routesก่อนการแก้ const ที่ไม่เปลี่ยน behavior; Postman JSON/70 test scripts syntaxผ่าน และ git diff --check ผ่านก่อน handoff. ไม่รัน provider/Ollama หรือ authenticated live DB/browser E2E ในรอบนี้ จึงคง F07/F09/F13 PARTIAL; in-memory rate limit ต้องเปลี่ยนเป็น shared store ก่อนหลาย replicas และ lexical fallback เข้าใจ semantic ได้น้อยกว่า LLM

### 2026-10-15 00:59 Asia/Bangkok — cross-cutting maintenance/F04/F07: focused AI Postman collection

- สร้าง apps/api/postman/For-AI.postman.json ตาม HEAD421c916 (feat: implement LLM-assisted shop search and recommendations): 7requests เฉพาะ CUSTOMERlogin/categories/paginated discovery/search/batch descriptions/hydration/empty-query bypass. มี inherited customerToken, scope variables, CSVcategoryIds→JSON, safe query JSON escaping, capture description IDs/recommendation IDs/hydration100+remaining และ assertions. อธิบาย internal tool vs HTTP API, pagination/fallback และไม่รวมpayment/Coins/admin/provider endpoints. ไฟล์เป้าหมายเดิมเป็น untracked empty file; ไม่แก้ runtime/API/main collection
- ตรวจ JSON parse, 7request scope, 8test/prerequest scripts syntax และ substituted request bodies ผ่านด้วย pnpm --filter api exec node. API-package Prettier write/check สำหรับcollection/PLAN และ git diff --check ผ่าน. ไม่รัน appbuild/unit หรือ liveHTTP/DB/Ollama เพราะ collection/docs-only; collectionยังไม่ใช่หลักฐานliveLLM
- F04/F07 คง PARTIALตามบอร์ด; ไม่มี blocker/decision ใหม่. Next: importcollection ตั้ง CUSTOMERcredentials/baseUrl/scope แล้วรัน01→06; discoveryตามhasNextPageและhydrateรายการเกิน100เป็นหลายbatch

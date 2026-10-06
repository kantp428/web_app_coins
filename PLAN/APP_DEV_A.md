# App Dev A — ลูกค้า

อ่าน [Flag board](PLAN.md) เพื่อเลือก Daily Flag ของรอบ R1 และอัปเดตสถานะที่บอร์ดหลักเพียงจุดเดียว. รายละเอียด requirement/กติกากลาง/contract และ baseline อยู่ใน [Integration](INTEGRATION.md). Product context อยู่ใน [CoreIdea](../CoreIdea.md); ข้อสรุปที่ยังไม่ล็อกให้บันทึกใน [decisions](../docs/decisions.md) ก่อน implement. API contract อยู่ที่ `docs/api-contract.md` จาก repo root (ยังเป็นงาน F01).

วันที่เป้าหมาย D1–D7 คือ 7–13 ตุลาคม 2569 ตาม Asia/Bangkok. ใช้ UI/DB เดิมต่อ ไม่สร้างซ้ำ; UI Preview ไม่เท่ากับ integration DONE. หาก dependency ยังไม่ merge ให้ทำงานเตรียม/test ในพื้นที่ของตนและรายงาน blocker แทนการอ้างว่า endpoint พร้อม.

## ใบงานและพื้นที่รับผิดชอบ

### ใบงานรายคน: App Dev A — ฝั่งลูกค้า

**Flag:** `F04` → `F09`; Requirement `FR-C01–C07`, `NFR-02/06`. **พื้นที่ไฟล์:** `apps/web/src/app/(customer)/` และ component ลูกค้า; ใช้ shared component ได้ผ่าน PR ที่ B review. **Codex:** Normal สำหรับหน้า/form/map; Pro เฉพาะ review การแสดงยอดและการยืนยันซื้อ.

1. `F04` หลัง `F01`: ใช้ customer wallet shell/account/search/store card ที่มีแล้ว เพิ่ม login และเตรียม API states โดยคงยอด Coins แยกจากเงินบาท. เมื่อ `F03` พร้อมให้เชื่อม API จริง; ขอ consent ก่อนใช้พิกัด และมีทางค้นหาโดยไม่ส่งพิกัด. **ส่งมอบ:** ลูกค้าค้นหาร้านร่วมโครงการ ดูหมวดหมู่/ตำแหน่ง/สถานะ Coins ได้; 360–1920 px และ keyboard ใช้งานได้.
2. `F09` หลัง `F07/F08`: ทำ chat UI ที่แสดงร้านจาก API, หน้าพรีวิวยอดซื้อ/ส่วนช่วยจ่าย/เงินที่ต้องจ่ายเองก่อนปุ่มยืนยัน, ประวัติ, Coins และ Main Quest รายเดือน. **ส่งมอบ:** demo ลูกค้าตั้งแต่ค้นหา → แนะนำ → preview → ยืนยัน → เห็นยอดใหม่; มี loading/error/empty state. UI แสดงยอด/Coins จาก server เท่านั้น.
3. `F13`: ทดสอบเส้นทางลูกค้า, การปฏิเสธพิกัด, ร้านไม่เข้าเงื่อนไข, ยืนยันซ้ำและเดือนใหม่; บันทึกผล/bug ให้คนกลาง.

**จุดส่งต่อ:** A รับ DTO/ตัวอย่าง response จาก `F01`; แจ้ง I หาก API ไม่ตรง contract; ส่งภาพหน้าจอและขั้นตอน demo ให้ B/I ตรวจ PR. A ไม่แก้กติกา Coins หรือยอดใน frontend.

## Daily Flags — งานและ acceptance

| วัน / วันที่ | คน  | Daily Flag → Feature | งานที่ต้องส่งมอบ                                                                                                                                 | Dependency / acceptance                                             |
| ------------ | --- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| D1 / 7 ต.ค.  | A   | `R1-D1-A` → F04/F09  | Review wallet ที่มี; แยก fixture ออกจาก component, จัด shell/component ให้ต่อ API ได้; ระบุ field account/search/quest/history และร่างหน้า login | ใช้ UI เดิม; ส่ง field list ให้ I; browser QA 360/1920 px ยังต้องทำ |
| D2 / 8 ต.ค.  | A   | `R1-D2-A` → F04      | ต่อ login/account/wallet กับ F02; loading/error/empty, แยกเงินสามส่วนและ Coins                                                                   | F01 + F02 ที่ merge แล้ว; fixture ใช้ได้เฉพาะ preview mode          |
| D3 / 9 ต.ค.  | A   | `R1-D3-A` → F04      | ต่อ search/store card; เลือก map provider ตาม D1, consent ตำแหน่งและ manual area                                                                 | F03; ร้านไม่ร่วมไม่ปรากฏ; ปฏิเสธพิกัดแล้วยังค้นหาได้                |
| D4 / 10 ต.ค. | A   | `R1-D4-A` → F09      | สร้าง purchase preview screen/ยอดแยก, เตรียม confirm และปรับ chat UI จาก mock เป็น API states                                                    | F06 preview เมื่อ merge; ยังไม่อ้างว่าชำระสำเร็จหาก F08 ไม่พร้อม    |
| D5 / 11 ต.ค. | A   | `R1-D5-A` → F09      | ต่อ confirm/idempotency, quest/Coins/history รายเดือน และ recommendation cards; จบ customer flow                                                 | F07/F08; กดซ้ำไม่ตัดยอด/เพิ่ม Coins ซ้ำ                             |
| D6 / 12 ต.ค. | A   | `R1-D6-A` → F13      | Customer E2E + keyboard/responsive/error; แก้ blocker และช่วย run load scenarios                                                                 | F04/F09; browser evidence และผลทดสอบจริง                            |
| D7 / 13 ต.ค. | A   | `R1-D7-A` → F14      | Customer regression/demo และข้อจำกัด; review UI B                                                                                                | F13 และ blocker ที่เกี่ยวปิดแล้ว                                    |

## กติกาก่อนส่งงาน

หนึ่ง Daily Flag ต่อหนึ่ง PR; ใช้ branch `codex/<daily-flag>-<short-name>` ตัวพิมพ์เล็ก. รัน Prettier และ --check เฉพาะไฟล์ที่สร้าง/แก้; รัน lint/build/test ตามพื้นที่งานและบันทึกผลจริง. UI ต้องตรวจ keyboard/360–1920 px. Backend/API ต้องอัปเดต Postman collection ใน PR เดียวกัน. อ่าน Definition of Done และ requirement ที่อ้างถึงใน [Integration](INTEGRATION.md) ก่อนเริ่มงาน.

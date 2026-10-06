# App Dev B — ร้านค้าและรัฐ

อ่าน [Flag board](PLAN.md) เพื่อเลือก Daily Flag ของรอบ R1 และอัปเดตสถานะที่บอร์ดหลักเพียงจุดเดียว. รายละเอียด requirement/กติกากลาง/contract และ baseline อยู่ใน [Integration](INTEGRATION.md). Product context อยู่ใน [CoreIdea](../CoreIdea.md); ข้อสรุปที่ยังไม่ล็อกให้บันทึกใน [decisions](../docs/decisions.md) ก่อน implement. API contract อยู่ที่ `docs/api-contract.md` จาก repo root (ยังเป็นงาน F01).

วันที่เป้าหมาย D1–D7 คือ 7–13 ตุลาคม 2569 ตาม Asia/Bangkok. ใช้ UI/DB เดิมต่อ ไม่สร้างซ้ำ; UI Preview ไม่เท่ากับ integration DONE. หาก dependency ยังไม่ merge ให้ทำงานเตรียม/test ในพื้นที่ของตนและรายงาน blocker แทนการอ้างว่า endpoint พร้อม.

## ใบงานและพื้นที่รับผิดชอบ

### ใบงานรายคน: App Dev B — ฝั่งร้านค้าและรัฐ

**Flag:** `F05` → `F10` → `F12`; Requirement `FR-S01–S03`, `FR-G01–G04`, `NFR-06/07`. **พื้นที่ไฟล์:** `apps/web/src/app/(seller)/`, `apps/web/src/app/(government)/` และ component ของสองบทบาท. **Codex:** Normal สำหรับ form/table/dashboard; Pro เฉพาะ review ความถูกต้อง KPI/การแบ่งสิทธิ์.

1. `F05` หลัง `F01`: ใช้ seller shell/form ที่มีแล้ว เพิ่ม login, ปรับฟอร์มเป็น React Hook Form + Zod, เพิ่ม multi-store และ government shell/หน้าตรวจสถานะ; ต่อ `F03` API เมื่อพร้อม. **ส่งมอบ:** คนขายแก้เฉพาะร้านตัวเอง; รัฐเห็นและจัดการสถานะร้าน; มี validation/error ภาษาไทย.
2. `F10` หลัง `F06/F08`: ทำหน้าคนขายดูสถานะธุรกรรม, ยอดลูกค้าจ่าย, ส่วนช่วยจ่าย และเกณฑ์ Coins; ทำฟอร์มรัฐตั้ง rule version. **ส่งมอบ:** ไม่คำนวณ Coins เอง; ข้อมูลตรง API และสิทธิ์ role.
3. `F12` หลัง `F11`: ทำ Dashboard/งบ Main Quest พร้อมตัวกรองเวลา/พื้นที่, นิยาม KPI และเวลาอัปเดต. **ส่งมอบ:** ตัวเลขตรงข้อมูล seed/API, ไม่มีข้อมูลซื้อรายบุคคล, responsive.
4. `F13`: ทดสอบ role ร้านค้า/รัฐและการข้ามสิทธิ์, filter Dashboard และตัวเลขเทียบต้นทาง; บันทึกผล/bug ให้คนกลาง.

**จุดส่งต่อ:** B รับ DTO/ตัวอย่าง response จาก `F01`; แจ้ง I หาก report ไม่มีนิยาม/เวลาอัปเดต; review UI ของ A และส่ง demo flow ร้านค้า/รัฐให้ I.

## Daily Flags — งานและ acceptance

| วัน / วันที่ | คน  | Daily Flag → Feature    | งานที่ต้องส่งมอบ                                                                                                | Dependency / acceptance                                                |
| ------------ | --- | ----------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| D1 / 7 ต.ค.  | B   | `R1-D1-B` → F05/F10/F12 | Review seller UI; เตรียม multi-store และ RHF+Zod form; สร้าง government shell/approval wireframe และ field list | ยังไม่เปลี่ยนสถานะร้านจริง; ส่ง DTO ที่ต้องใช้ให้ I                    |
| D2 / 8 ต.ค.  | B   | `R1-D2-B` → F05         | ต่อ login/role shell; form validation และ government approval UI พร้อม API states                               | F01/F02; role switch ต้นแบบไม่ใช่ auth guard                           |
| D3 / 9 ต.ค.  | B   | `R1-D3-B` → F05         | ต่อ seller CRUD/multi-store และ government approval กับ API จริง                                                | F03; owner isolation, validation/error และสถานะ pending/approved       |
| D4 / 10 ต.ค. | B   | `R1-D4-B` → F10         | Government coin rules form/version และ seller rule display                                                      | F06; ร้านไม่กำหนด Coins เอง; server validation                         |
| D5 / 11 ต.ค. | B   | `R1-D5-B` → F10/F12     | Seller transactions จาก DB, breakdown/เดือน/สถานะ; เตรียม report filter UI                                      | F08; ร้านเห็นเฉพาะรายการตน; F11 ยังไม่พร้อมใช้ contract fixture ชัดเจน |
| D6 / 12 ต.ค. | B   | `R1-D6-B` → F12/F13     | ต่อ budget/impact dashboard; seller/government E2E, zero denominator และ filter tests                           | F11 เมื่อ merge; KPI ตรง seed และไม่เปิดเผยรายบุคคล                    |
| D7 / 13 ต.ค. | B   | `R1-D7-B` → F14         | Seller/government regression/demo และ review A                                                                  | F12/F13; ไม่มี KPI mock ใน demo integrated                             |

## กติกาก่อนส่งงาน

หนึ่ง Daily Flag ต่อหนึ่ง PR; ใช้ branch `codex/<daily-flag>-<short-name>` ตัวพิมพ์เล็ก. รัน Prettier และ --check เฉพาะไฟล์ที่สร้าง/แก้; รัน lint/build/test ตามพื้นที่งานและบันทึกผลจริง. UI ต้องตรวจ keyboard/360–1920 px. Backend/API ต้องอัปเดต Postman collection ใน PR เดียวกัน. อ่าน Definition of Done และ requirement ที่อ้างถึงใน [Integration](INTEGRATION.md) ก่อนเริ่มงาน.

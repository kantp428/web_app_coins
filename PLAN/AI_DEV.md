# AI Dev — แนะนำร้าน

อ่าน [Flag board](PLAN.md) เพื่อเลือก Daily Flag ของรอบ R1 และอัปเดตสถานะที่บอร์ดหลักเพียงจุดเดียว. รายละเอียด requirement/กติกากลาง/contract และ baseline อยู่ใน [Integration](INTEGRATION.md). Product context อยู่ใน [CoreIdea](../CoreIdea.md); ข้อสรุปที่ยังไม่ล็อกให้บันทึกใน [decisions](../docs/decisions.md) ก่อน implement. API contract อยู่ที่ `docs/api-contract.md` จาก repo root (ยังเป็นงาน F01).

วันที่เป้าหมาย D1–D7 คือ 7–13 ตุลาคม 2569 ตาม Asia/Bangkok. ใช้ UI/DB เดิมต่อ ไม่สร้างซ้ำ; UI Preview ไม่เท่ากับ integration DONE. หาก dependency ยังไม่ merge ให้ทำงานเตรียม/test ในพื้นที่ของตนและรายงาน blocker แทนการอ้างว่า endpoint พร้อม.

## ใบงานและพื้นที่รับผิดชอบ

### ใบงานรายคน: AI Dev — แนะนำร้าน

**Flag:** `F07` (+ `F13` ส่วน AI); Requirement `FR-C03`, `NFR-02/04`. **พื้นที่ไฟล์:** `apps/api/src/recommendations/`, test/evaluation ของโมดูล, `apps/api/postman/` เฉพาะ request ของตน. **Codex:** Normal สำหรับ adapter/DTO/Postman; Pro สำหรับตรวจ grounding, การกรองร้านและกรณีโมเดลตอบผิด.

1. ก่อน coding ตรวจ contract ของ `F01`, ร้านจาก `F03`, rule service ของ `F06`. ออกแบบ `POST /recommendations` ให้ server ดึงประวัติจาก token; รับพิกัดเฉพาะเมื่อ consent; คัดเฉพาะร้านร่วมโครงการที่ลูกค้าไม่เคยซื้อสำเร็จจากทุกเดือน.
2. จัดอันดับตามความสนใจ/ระยะทาง/เกณฑ์ร้านยอดขายต่ำ; ส่งเฉพาะ candidate ที่คัดแล้วเข้า model/adapter. ก่อนตอบตรวจ `storeId` กับ DB และคำนวณ `coinEstimate` ผ่าน rule service จริง. คำตอบมี `storeId`, `coinEstimate`, `reason`, `sourceRuleVersion`; หากไม่มีร้านให้ตอบ empty state; provider ล่มให้ fallback deterministic.
3. **ส่งมอบ:** test ร้านเคยซื้อ/ไม่ร่วม/ไม่มีพิกัด/ไม่มี candidate/model แต่งรหัสร้าน; Postman request พร้อม success/error และตัวอย่าง response. ส่งสัญญา response ให้ A ก่อน A ทำ `F09`; ส่งผลทดสอบให้ I ใน `F13`.

## Daily Flags — งานและ acceptance

| วัน / วันที่ | คน  | Daily Flag → Feature | งานที่ต้องส่งมอบ                                                                                     | Dependency / acceptance                                                      |
| ------------ | --- | -------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| D1 / 7 ต.ค.  | AI  | `R1-D1-AI` → F07     | ออกแบบ candidate DTO, provider/fallback และ evaluation scenarios จาก schema จริง                     | ร่วมล็อก F01; ไม่คิด Coins/visited rule แยกจาก I                             |
| D2 / 8 ต.ค.  | AI  | `R1-D2-AI` → F07     | Implement/test retrieval adapter และ deterministic ranker                                            | F01 + PrismaService; DB candidate filter ทดสอบได้โดยไม่รอ provider           |
| D3 / 9 ต.ค.  | AI  | `R1-D3-AI` → F07     | ต่อ retrieval กับ store service; controller/DTO/Postman, empty state และ rejected location scenarios | F03 + F06 interface ที่ตกลง; scoring adapter ชั่วคราวยังไม่ใช่ endpoint DONE |
| D4 / 10 ต.ค. | AI  | `R1-D4-AI` → F07     | Grounding กับ rule service จริง, provider/fallback และ evaluation ไม่แต่งร้าน/Coins                  | F03/F06; ไม่มี candidate ส่ง empty; provider ล่มยังใช้ DB จริง               |
| D5 / 11 ต.ค. | AI  | `R1-D5-AI` → F07/F13 | Integration chat กับ A; regression ทั้งร้านเดิม/ร้านใหม่/ไม่มีพิกัด/provider failure                 | F07/F09; รายงานผลจริงและข้อจำกัด                                             |
| D6 / 12 ต.ค. | AI  | `R1-D6-AI` → F13     | Grounding/security evaluation, no candidate และ fallback regression                                  | F07/F09; แนบ cases ที่ผ่าน/ไม่ผ่าน                                           |
| D7 / 13 ต.ค. | AI  | `R1-D7-AI` → F14     | Final eval บน seed/demo และบันทึก provider/fallback limitations                                      | F13; grounded response ตรวจซ้ำ                                               |

## กติกาก่อนส่งงาน

หนึ่ง Daily Flag ต่อหนึ่ง PR; ใช้ branch `codex/<daily-flag>-<short-name>` ตัวพิมพ์เล็ก. รัน Prettier และ --check เฉพาะไฟล์ที่สร้าง/แก้; รัน lint/build/test ตามพื้นที่งานและบันทึกผลจริง. UI ต้องตรวจ keyboard/360–1920 px. Backend/API ต้องอัปเดต Postman collection ใน PR เดียวกัน. อ่าน Definition of Done และ requirement ที่อ้างถึงใน [Integration](INTEGRATION.md) ก่อนเริ่มงาน.

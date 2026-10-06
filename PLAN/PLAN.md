# THAI Please — Flag Board R1

รอบเป้าหมาย **7–13 ตุลาคม 2569 (Asia/Bangkok)**. บอร์ดนี้เก็บ Flag, สถานะ และ dependency; งาน/acceptance อยู่ในใบงาน 4 บทบาทด้านล่าง. วันที่เป็นเป้าหมาย ไม่ใช่หลักฐานว่าผ่านการตรวจรับ.

| บทบาท                                       | ใบงาน                            |
| ------------------------------------------- | -------------------------------- |
| A — ลูกค้า                                  | [APP_DEV_A.md](APP_DEV_A.md)     |
| B — ร้านค้า/รัฐ                             | [APP_DEV_B.md](APP_DEV_B.md)     |
| AI — Recommendation                         | [AI_DEV.md](AI_DEV.md)           |
| I — Backend/ข้อมูล/Integration และกติกากลาง | [INTEGRATION.md](INTEGRATION.md) |

## Feature Flags

| Feature | สถานะเริ่มรอบ                      | วันเป้าหมาย            | เจ้าของ         | Dependency            |
| ------- | ---------------------------------- | ---------------------- | --------------- | --------------------- |
| F00     | PARTIAL: repo/DB/baseline มีแล้ว   | D1                     | I               | —                     |
| F01     | TODO                               | D1                     | I               | F00 ส่วนที่เกี่ยวข้อง |
| F02     | TODO                               | D2                     | I               | F01                   |
| F03     | TODO                               | D3                     | I               | F02                   |
| F04     | UI PREVIEW                         | D3                     | A               | F01/F02/F03           |
| F05     | SELLER UI PREVIEW; GOVERNMENT TODO | D3                     | B               | F01/F02/F03           |
| F06     | TODO                               | D4                     | I               | F02/F03               |
| F07     | TODO                               | D4–5                   | AI              | F03/F06               |
| F08     | TODO                               | D5                     | I               | F06                   |
| F09     | UI PREVIEW บางหน้า                 | D5                     | A               | F07/F08               |
| F10     | UI PREVIEW บางหน้า                 | D5                     | B               | F06/F08               |
| F11     | DB views มีแล้ว; API TODO          | D6                     | I               | F08                   |
| F12     | TODO                               | D6                     | B               | F11                   |
| F13     | TODO                               | D6–7                   | ทุกคน / I รวมผล | F09–F12               |
| F14     | TODO                               | D7 หรือหลัง gates ผ่าน | ทุกคน / I รวมผล | F13                   |

## Daily Flags

สถานะรอบใหม่เริ่มที่ TODO; อัปเดตเป็น DOING → PR → DONE ตามผลจริง หรือ BLOCKED พร้อมลิงก์ issue. ไม่ยกสถานะ UI Preview เป็น DONE ของ Feature.

| วัน          | Daily Flag                  | Feature     | สถานะ | Dependency                                                                         | Issue / PR |
| ------------ | --------------------------- | ----------- | ----- | ---------------------------------------------------------------------------------- | ---------- |
| D1 / 7 ต.ค.  | [`R1-D1-A`](APP_DEV_A.md)   | F04/F09     | TODO  | ใช้ UI เดิม; ส่ง field list ให้ I; browser QA 360/1920 px ยังต้องทำ                | —          |
| D1 / 7 ต.ค.  | [`R1-D1-B`](APP_DEV_B.md)   | F05/F10/F12 | TODO  | ยังไม่เปลี่ยนสถานะร้านจริง; ส่ง DTO ที่ต้องใช้ให้ I                                | —          |
| D1 / 7 ต.ค.  | [`R1-D1-AI`](AI_DEV.md)     | F07         | TODO  | ร่วมล็อก F01; ไม่คิด Coins/visited rule แยกจาก I                                   | —          |
| D1 / 7 ต.ค.  | [`R1-D1-I`](INTEGRATION.md) | F00/F01     | TODO  | ไม่แก้ baseline ที่ apply แล้ว; contract/seed พร้อมให้ทุกคนใช้                     | —          |
| D2 / 8 ต.ค.  | [`R1-D2-A`](APP_DEV_A.md)   | F04         | TODO  | F01 + F02 ที่ merge แล้ว; fixture ใช้ได้เฉพาะ preview mode                         | —          |
| D2 / 8 ต.ค.  | [`R1-D2-B`](APP_DEV_B.md)   | F05         | TODO  | F01/F02; role switch ต้นแบบไม่ใช่ auth guard                                       | —          |
| D2 / 8 ต.ค.  | [`R1-D2-AI`](AI_DEV.md)     | F07         | TODO  | F01 + PrismaService; DB candidate filter ทดสอบได้โดยไม่รอ provider                 | —          |
| D2 / 8 ต.ค.  | [`R1-D2-I`](INTEGRATION.md) | F02         | TODO  | F00/F01; ยอดมาจาก ledger/DB จริง                                                   | —          |
| D3 / 9 ต.ค.  | [`R1-D3-A`](APP_DEV_A.md)   | F04         | TODO  | F03; ร้านไม่ร่วมไม่ปรากฏ; ปฏิเสธพิกัดแล้วยังค้นหาได้                               | —          |
| D3 / 9 ต.ค.  | [`R1-D3-B`](APP_DEV_B.md)   | F05         | TODO  | F03; owner isolation, validation/error และสถานะ pending/approved                   | —          |
| D3 / 9 ต.ค.  | [`R1-D3-AI`](AI_DEV.md)     | F07         | TODO  | F03 + F06 interface ที่ตกลง; scoring adapter ชั่วคราวยังไม่ใช่ endpoint DONE       | —          |
| D3 / 9 ต.ค.  | [`R1-D3-I`](INTEGRATION.md) | F03         | TODO  | F02; permission/filtering ที่ server; ส่งข้อมูลร้านจริงให้ทุกคน                    | —          |
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

F00 เป็น PARTIAL และ F04/F05/F09/F10 เป็น UI Preview ตามสถานะเริ่มรอบ; Daily Flag รอบ R1 ยังไม่ปิด. ประวัติ baseline และผลตรวจเดิมดู [Integration](INTEGRATION.md). Release F14 ต้องรอ F13 ผ่าน; หาก dependency ล่าช้าให้เลื่อนเป้าหมายและบันทึก blocker.

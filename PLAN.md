# แผนพัฒนา THAI Please (1 สัปดาห์)

> เอกสารนี้ออกแบบให้ย้ายไป root ของ repository แอปพร้อม `CoreIdea` โดยไม่ต้องย้ายไฟล์อื่นจากโปรเจกต์เอกสารเดิม. Feature และเกณฑ์รับงานที่จำเป็นอยู่ในไฟล์นี้แล้ว. วันที่ในตารางคือ **Day 1–7 นับจากวันเริ่มงานของทีม**. `CoreIdea` ใช้อธิบายแนวคิดและเป้าหมาย; หากรายละเอียดขัดกัน ให้ทีมบันทึกข้อสรุปใน `docs/decisions.md` ก่อน implement.

## วิธีอ่านสำหรับ AI / Codex

1. รับ **ชื่อคนหรือบทบาท + Daily Flag ID (`D1-A` เป็นต้น)** จากผู้มอบหมาย แล้วอ่านหัวข้อ `กติกาบังคับ`, `ใบงานรายคน`, แถว Daily Flag และรหัส Feature Flag (`Fxx`) ที่งานอ้างถึง. หนึ่ง Daily Flag ต่อหนึ่ง PR.
2. ตรวจ `git status`, dependency ของ Flag และ `docs/api-contract.md` ก่อนแก้โค้ด. ถ้า contract ยังไม่มี ให้ทำ/รอ `F01`; ห้ามคิด request/response คนละแบบเอง. อ่านรหัส Feature/Requirement ในหัวข้อ 1 ของไฟล์นี้ที่ Flag อ้างถึง.
3. แก้เฉพาะพื้นที่ไฟล์ที่ระบุในใบงาน. หากจำเป็นต้องแก้ schema, shared API หรือไฟล์ของอีกคน ให้แจ้งเจ้าของและบันทึกใน PR. Migration ที่ merge แล้วให้สร้างไฟล์ใหม่ ไม่แก้ย้อนหลัง.
4. ก่อนจบให้ตรวจ acceptance ของ Flag, รัน test ที่เกี่ยว, อัปเดต Postman เมื่อแตะ Backend และสรุปผลทดสอบจริง. ถ้าไม่ได้รันทดสอบให้เขียนว่า `ยังไม่ทดสอบ`; ห้ามอ้างว่าเสร็จเพียงเพราะเขียนโค้ดแล้ว.

Prompt เริ่มงานที่ใช้ซ้ำได้:

```text
ทำงานในบทบาท <App Dev A | App Dev B | AI Dev | คนกลาง> เฉพาะ Daily Flag <D#-A|B|AI|I>
จาก PLAN.md อ่านใบงานรายคนและ Feature ID ที่เกี่ยว ตรวจ dependency
กับ git status ก่อนลงมือ จำกัดไฟล์ตามเจ้าของงาน ใช้ API contract กลาง
หากแก้ Backend ให้ปรับ Postman collection ใน PR เดียวกัน
จบด้วยสรุปไฟล์ที่แก้ คำสั่งและผลทดสอบ ความเสี่ยง และสิ่งที่ต้องส่งต่อ
```

## 1. เป้าหมายและขอบเขต

ส่งมอบ web app ต้นแบบที่เดิน flow ได้จริง: ลูกค้าเข้าสู่ระบบ → ค้นหาร้าน/คุย AI → เห็นยอดก่อนซื้อ → ยืนยันซื้อ → ได้ Coins/รางวัล; คนขายจัดการร้านและดูรายการ; เจ้าหน้าที่อนุมัติร้าน ตั้งกติกา และดูงบกับ Social Impact Dashboard. ใช้ข้อมูล seed และ **จำลองผลชำระเงิน**; ไม่มีการเชื่อมชำระเงินจริงในสัปดาห์นี้. ทุกข้อมูลธุรกรรมและยอดเงินต้องมาจาก PostgreSQL ไม่ใช้ mock หลัง integration.

Stack ที่ตกลง: Frontend **Next.js, shadcn/ui, Lucide React, React Hook Form, Axios, Zod**; Backend **NestJS, Prisma, PostgreSQL**. สำหรับแผนที่/AI ยังไม่ล็อกผู้ให้บริการ: วันแรกทีมเลือกวิธีที่รันซ้ำได้ในเครื่องทดสอบ พร้อม fallback สำหรับกรณีไม่มี API key; หากต้องเพิ่ม dependency หรือบริการ ให้ทำตามกติกา stack/skill ในหัวข้อ 6.

เกณฑ์ข้อมูลที่ยึดร่วมกัน: เงินใช้ decimal ฝั่ง DB/API ส่งเป็นสตริงทศนิยม, Coins เป็นจำนวนเต็มแยกจากเงินบาท, เดือนตาม `Asia/Bangkok`, ร้าน “ยังไม่เคยไป” ตรวจจาก **ธุรกรรมสำเร็จทั้งหมด** (รอบเดือนมีผลเฉพาะยอด Coins), กติกา Coins เก็บเป็น version, Dashboard แสดงข้อมูลรวมเท่านั้น. ก่อนเริ่ม implement ให้คนกลางบันทึกข้อสมมติที่ยังไม่มีค่าแน่นอน เช่น วงเงินพื้นฐาน/สัดส่วนช่วยจ่าย/เกณฑ์ร้านยอดขายต่ำ/นิยามร้านรายย่อย ใน `docs/decisions.md`; ใช้ค่าตั้งต้นใน seed และไม่อ้างว่าเป็นนโยบายจริง.

### Feature catalog — ข้อกำหนดที่ต้องทำในโปรเจกต์ใหม่

รหัสด้านล่างเป็น source of truth สำหรับการแตก issue/Flag และตรวจ demo. `FR` คือสิ่งที่ผู้ใช้ทำได้หรือระบบต้องทำ; `NFR` คือเกณฑ์คุณภาพ. ฟีเจอร์หนึ่งอาจอยู่ในหลาย Flag เพราะมี API และ UI แยกกัน.

| ID | Feature | พฤติกรรมที่ต้องมี | Flag หลัก |
|---|---|---|---|
| FR-C01 | บัญชีลูกค้า | login และดูบัญชี สิทธิประโยชน์ ยอดเงินบาท/วงเงินช่วยจ่าย/Coins แยกกัน | F02, F04 |
| FR-C02 | ค้นหาร้านบนแผนที่ | interactive map แสดงร้านร่วมโครงการ พิกัด หมวดสินค้า สถานะรับ Coins; ค้นหา/กรองและเปรียบเทียบก่อนซื้อ | F03, F04 |
| FR-C03 | AI Chatbot แนะนำร้าน | สนทนาภาษาธรรมชาติ ใช้พิกัดที่ยินยอม ความสนใจ และประวัติซื้อ; แนะนำเฉพาะร้านที่ไม่เคยซื้อ พร้อม Coins ที่จะได้ | F07, F09 |
| FR-C04 | ยืนยันซื้อ | ก่อนยืนยันแสดงยอดซื้อ ส่วนช่วยจ่าย และยอดจ่ายเอง; ใช้วงเงินตามสิทธิ์; บันทึกธุรกรรมสำเร็จและสถานะ | F06, F08, F09 |
| FR-C05 | Tiered Coins | ธุรกรรมสำเร็จที่เข้าเงื่อนไขได้ 1–10 Coins; ร้านใหม่สำหรับลูกค้าคนนั้น โดยเฉพาะร้านยอดขายผ่านระบบต่ำ ได้ 8–10 ตาม rule; ร้านเดิมที่เคยได้ Coins แล้วได้ 1 | F06, F08 |
| FR-C06 | Main Quest | แสดง progress รายเดือน; เมื่อครบ 100 Coins ให้สิทธิช่วยจ่ายเพิ่ม 100 บาท ใช้ได้ในเดือนนั้นและมอบครั้งเดียวต่อเดือน | F08, F09 |
| FR-C07 | รอบเดือน/ประวัติ | เดือนใหม่ Coins ปัจจุบันเริ่มที่ 0 โดยไม่ลบประวัติซื้อ/สะสม/รับสิทธิรอบก่อน และไม่เปลี่ยนยอดเงินบาท | F08, F09 |
| FR-S01 | จัดการร้าน | คนขาย login และจัดการชื่อร้าน พิกัด หมวดสินค้า เวลาเปิด เพื่อใช้บนแผนที่และ AI | F02, F03, F05 |
| FR-S02 | ดูธุรกรรมร้าน | คนขายดูรายการซื้อ สถานะ ยอดลูกค้าจ่ายและส่วนช่วยจ่าย เฉพาะร้านตนเอง | F08, F10 |
| FR-S03 | ดูกติกา Coins | คนขายเห็นเกณฑ์ของร้านตน; server คำนวณ Coins จากประวัติลูกค้าและยอดขายผ่านระบบ ไม่ให้ร้านกำหนดเอง | F06, F10 |
| FR-G01 | อนุมัติร้าน | เจ้าหน้าที่ login ตรวจข้อมูลร้านและเปลี่ยนสถานะการเข้าร่วมโครงการ | F02, F03, F05 |
| FR-G02 | ตั้งกติกา Coins | เจ้าหน้าที่กำหนด rule 1–10, เกณฑ์ร้านยอดขายต่ำ, ร้านใหม่/ร้านเดิม; เก็บ rule version ไม่แก้ประวัติเดิม | F06, F10 |
| FR-G03 | ติดตามงบ Main Quest | รัฐเห็นงบตั้งต้น ยอดมอบ ยอดใช้จริงสุทธิ ยอดยังใช้ได้/หมดอายุ/ยังไม่จัดสรร รายเดือน แยกจากวงเงินพื้นฐาน | F11, F12 |
| FR-G04 | Social Impact Dashboard | จำนวนร้านที่ได้ลูกค้าใหม่ สัดส่วนยอดซื้อสู่ร้านรายย่อย การใช้สิทธิ; กรองเวลาและพื้นที่ พร้อมนิยาม KPI | F11, F12 |

**ขอบเขตการทำงานร่วมกันของ Feature:** ร้านที่ไม่เข้าร่วมไม่ขึ้นแผนที่/AI; ประวัติ “เคยซื้อ” อิงธุรกรรมสำเร็จทุกเดือน ไม่ใช่แค่เดือนปัจจุบัน; Coins แยกจากเงินและใช้ชำระแทนเงินบาทไม่ได้; UI ใช้ยอด/คะแนนจาก API. ต้นแบบจำลองผลการชำระเงิน แต่การยืนยันรายการและตัดยอดต้องเป็นธุรกรรมฐานข้อมูลเดียวกัน. ร้านที่ AI แนะนำต้องตรวจ ID และอัตรา Coins จากระบบก่อนตอบ. หากไม่มีร้านเข้าเงื่อนไขให้แสดงว่าไม่พบร้าน.

### รายละเอียด Feature สำหรับนำไปสร้างแอป

ส่วนนี้ระบุหน้าจอ ข้อมูลเข้า ผลลัพธ์ และกรณีตรวจรับที่ต้องมีในโปรเจกต์ใหม่. ใช้ร่วมกับตาราง Flag ด้านล่าง; ค่าตัวเลขที่ไม่ได้กำหนดในเอกสารนี้ให้ F01 ระบุเป็นค่าทดสอบใน `docs/decisions.md` ก่อนเขียน business logic.

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

| ID | เกณฑ์ตรวจ | Flag ที่พิสูจน์ |
|---|---|---|
| NFR-01 | ทุก API ตรวจ role/ownership ฝั่ง server; ลูกค้าเห็นของตน คนขายเห็นร้านตน รัฐเข้าถึงเฉพาะสิทธิ์เจ้าหน้าที่; ข้ามสิทธิ์ต้องถูกปฏิเสธ | F02, F13 |
| NFR-02 | ใช้ HTTPS ในสภาพแวดล้อม deploy, ขออนุญาตก่อนใช้พิกัด, Dashboard ไม่เปิดเผยประวัติซื้อรายบุคคล | F04, F07, F11, F13 |
| NFR-03 | ค้นหาร้านและดูประวัติ ตอบกลับ ≤ 3 วินาทีอย่างน้อย 95% เมื่อมีผู้ใช้พร้อมกัน 100 คน; ระบุเครื่อง/ข้อมูล/วิธีวัด | F13 |
| NFR-04 | AI อ้างร้าน/Coins จริงจากระบบ, ตรวจว่าไม่เคยซื้อ, และมี empty state เมื่อไม่มีร้าน | F07, F13 |
| NFR-05 | ส่งธุรกรรมหรือรับรางวัลซ้ำไม่เพิ่มยอดซ้ำ; เดือนใหม่ไม่ลบ history หรือเปลี่ยนยอดเงินบาท | F08, F13 |
| NFR-06 | ภาษาไทย, ความกว้าง 360–1920 px ไม่ล้น, error เป็นข้อความ, ปุ่มหลักใช้ผ่าน keyboard | F04, F05, F09, F10, F12 |
| NFR-07 | KPI ตรงกับธุรกรรมต้นทางตาม filter เดียวกัน; แสดงนิยาม KPI และเวลาปรับปรุงล่าสุด | F11, F12, F13 |
| NFR-08 | สำรองข้อมูลทุก 24 ชั่วโมง; ทดสอบ restore ≤ 4 ชั่วโมง โดยข้อมูลสูญหายย้อนหลัง ≤ 24 ชั่วโมง | F14 |

**กรณีทดสอบขั้นต่ำใน seed:** 3 บทบาท, ร้านร่วม/ไม่ร่วม, ร้านเล็ก/ใหญ่, ลูกค้าเคยซื้อ/ไม่เคยซื้อ, rule เก่า/ใหม่, ลูกค้าใกล้ 100 Coins, สองเดือน, งบเหลือ/ไม่พอ, รายการซ้ำ และพื้นที่ที่ไม่มีร้าน. F01 กำหนดจำนวน/รูปข้อมูลและค่าที่ไม่ได้ระบุไว้ใน `docs/decisions.md`.

## 2. คนและพื้นที่รับผิดชอบ

| คน | หน้าที่หลัก | เจ้าของไฟล์หลัก | ตรวจ PR ของ |
|---|---|---|---|
| App Dev A | ลูกค้า, แผนที่, หน้าคุย AI | `apps/web/src/app/(customer)/`, components ฝั่งลูกค้า | App Dev B |
| App Dev B | คนขาย/รัฐ, Dashboard | `apps/web/src/app/(seller)/`, `(government)/` | App Dev A |
| AI Dev | ระบบแนะนำร้าน, prompt/adapter/evaluation | `apps/api/src/recommendations/`, ชุดทดสอบ AI | PR ที่กระทบ recommendation |
| คนกลาง (Integration/Backend owner) | repo, schema, auth, API ธุรกรรม/Coins/รายงาน, Postman, CI, merge | `apps/api/` ยกเว้น recommendations, `apps/api/prisma/`, `apps/api/postman/`, `docs/` | ทุก PR ที่กระทบ API/schema |

### ใบงานรายคน: App Dev A — ฝั่งลูกค้า

**Flag:** `F04` → `F09`; Requirement `FR-C01–C07`, `NFR-02/06`. **พื้นที่ไฟล์:** `apps/web/src/app/(customer)/` และ component ลูกค้า; ใช้ shared component ได้ผ่าน PR ที่ B review. **Codex:** Normal สำหรับหน้า/form/map; Pro เฉพาะ review การแสดงยอดและการยืนยันซื้อ.

1. `F04` หลัง `F01`: สร้าง login/customer shell, หน้า account ที่แยก Coins กับเงินบาท, หน้าค้นหาร้านและ store card. เมื่อ `F03` พร้อมให้เชื่อม API จริง; ขอ consent ก่อนใช้พิกัด และมีทางค้นหาโดยไม่ส่งพิกัด. **ส่งมอบ:** ลูกค้าค้นหาร้านร่วมโครงการ ดูหมวดหมู่/ตำแหน่ง/สถานะ Coins ได้; 360–1920 px และ keyboard ใช้งานได้.
2. `F09` หลัง `F07/F08`: ทำ chat UI ที่แสดงร้านจาก API, หน้าพรีวิวยอดซื้อ/ส่วนช่วยจ่าย/เงินที่ต้องจ่ายเองก่อนปุ่มยืนยัน, ประวัติ, Coins และ Main Quest รายเดือน. **ส่งมอบ:** demo ลูกค้าตั้งแต่ค้นหา → แนะนำ → preview → ยืนยัน → เห็นยอดใหม่; มี loading/error/empty state. UI แสดงยอด/Coins จาก server เท่านั้น.
3. `F13`: ทดสอบเส้นทางลูกค้า, การปฏิเสธพิกัด, ร้านไม่เข้าเงื่อนไข, ยืนยันซ้ำและเดือนใหม่; บันทึกผล/bug ให้คนกลาง.

**จุดส่งต่อ:** A รับ DTO/ตัวอย่าง response จาก `F01`; แจ้ง I หาก API ไม่ตรง contract; ส่งภาพหน้าจอและขั้นตอน demo ให้ B/I ตรวจ PR. A ไม่แก้กติกา Coins หรือยอดใน frontend.

### ใบงานรายคน: App Dev B — ฝั่งร้านค้าและรัฐ

**Flag:** `F05` → `F10` → `F12`; Requirement `FR-S01–S03`, `FR-G01–G04`, `NFR-06/07`. **พื้นที่ไฟล์:** `apps/web/src/app/(seller)/`, `apps/web/src/app/(government)/` และ component ของสองบทบาท. **Codex:** Normal สำหรับ form/table/dashboard; Pro เฉพาะ review ความถูกต้อง KPI/การแบ่งสิทธิ์.

1. `F05` หลัง `F01`: ทำ shell/login, ฟอร์มร้านด้วย React Hook Form + Zod, รายการร้านและหน้าเจ้าหน้าที่ตรวจ/เปลี่ยนสถานะ; ต่อ `F03` API เมื่อพร้อม. **ส่งมอบ:** คนขายแก้เฉพาะร้านตัวเอง; รัฐเห็นและจัดการสถานะร้าน; มี validation/error ภาษาไทย.
2. `F10` หลัง `F06/F08`: ทำหน้าคนขายดูสถานะธุรกรรม, ยอดลูกค้าจ่าย, ส่วนช่วยจ่าย และเกณฑ์ Coins; ทำฟอร์มรัฐตั้ง rule version. **ส่งมอบ:** ไม่คำนวณ Coins เอง; ข้อมูลตรง API และสิทธิ์ role.
3. `F12` หลัง `F11`: ทำ Dashboard/งบ Main Quest พร้อมตัวกรองเวลา/พื้นที่, นิยาม KPI และเวลาอัปเดต. **ส่งมอบ:** ตัวเลขตรงข้อมูล seed/API, ไม่มีข้อมูลซื้อรายบุคคล, responsive.
4. `F13`: ทดสอบ role ร้านค้า/รัฐและการข้ามสิทธิ์, filter Dashboard และตัวเลขเทียบต้นทาง; บันทึกผล/bug ให้คนกลาง.

**จุดส่งต่อ:** B รับ DTO/ตัวอย่าง response จาก `F01`; แจ้ง I หาก report ไม่มีนิยาม/เวลาอัปเดต; review UI ของ A และส่ง demo flow ร้านค้า/รัฐให้ I.

### ใบงานรายคน: AI Dev — แนะนำร้าน

**Flag:** `F07` (+ `F13` ส่วน AI); Requirement `FR-C03`, `NFR-02/04`. **พื้นที่ไฟล์:** `apps/api/src/recommendations/`, test/evaluation ของโมดูล, `apps/api/postman/` เฉพาะ request ของตน. **Codex:** Normal สำหรับ adapter/DTO/Postman; Pro สำหรับตรวจ grounding, การกรองร้านและกรณีโมเดลตอบผิด.

1. ก่อน coding ตรวจ contract ของ `F01`, ร้านจาก `F03`, rule service ของ `F06`. ออกแบบ `POST /recommendations` ให้ server ดึงประวัติจาก token; รับพิกัดเฉพาะเมื่อ consent; คัดเฉพาะร้านร่วมโครงการที่ลูกค้าไม่เคยซื้อสำเร็จจากทุกเดือน.
2. จัดอันดับตามความสนใจ/ระยะทาง/เกณฑ์ร้านยอดขายต่ำ; ส่งเฉพาะ candidate ที่คัดแล้วเข้า model/adapter. ก่อนตอบตรวจ `storeId` กับ DB และคำนวณ `coinEstimate` ผ่าน rule service จริง. คำตอบมี `storeId`, `coinEstimate`, `reason`, `sourceRuleVersion`; หากไม่มีร้านให้ตอบ empty state; provider ล่มให้ fallback deterministic.
3. **ส่งมอบ:** test ร้านเคยซื้อ/ไม่ร่วม/ไม่มีพิกัด/ไม่มี candidate/model แต่งรหัสร้าน; Postman request พร้อม success/error และตัวอย่าง response. ส่งสัญญา response ให้ A ก่อน A ทำ `F09`; ส่งผลทดสอบให้ I ใน `F13`.

### ใบงานรายคน: คนกลาง — Integration และ Backend

**Flag:** `F00–F03`, `F06`, `F08`, `F11`, `F13–F14`; Requirement ทั้งหมดฝั่ง API และ `NFR-01/03/05/07/08`. **พื้นที่ไฟล์:** root config, `apps/api/` ยกเว้น recommendations, `apps/api/prisma/`, `apps/api/postman/`, `docs/`. **Codex:** Normal สำหรับ scaffold/CRUD/docs/Postman; Pro สำหรับ schema, auth, ledger, idempotency, quest, report reconciliation.

1. `F00–F01` (D1): ตั้ง repo/DB/CI/seed, ตกลง schema และ API request/response กับ A/B/AI, บันทึกค่าที่ Requirement ยังไม่ระบุใน `docs/decisions.md`. **ส่งมอบ:** ทุกคนรัน local ได้; contract มีตัวอย่าง response และ Postman skeleton.
2. `F02–F03` (D1–3): auth/role/ownership, account/wallet, API ร้านและการอนุมัติ. **ส่งมอบ:** 401/403 และ owner isolation ผ่าน; endpoint มี Postman. ส่ง endpoint/store seed ให้ A/B/AI ทันทีหลัง merge.
3. `F06` (D3–4): rule version และ purchase preview. **ส่งมอบ:** ร้านใหม่/ร้านเดิมได้ Coins ตามเกณฑ์ 1–10; preview แสดงเงินครบทุกส่วน; ส่ง rule service ให้ AI และ API ให้ A/B.
4. `F08` (D4–5): confirm purchase จำลอง, ledger, idempotency/concurrency, Coins และ Main Quest/รอบเดือน. **ส่งมอบ:** ซื้อซ้ำไม่เพิ่มยอด, grant ไม่ซ้ำ, เงินไม่ติดลบ, history คงอยู่; ส่ง API ให้ A/B.
5. `F11` (D5–6): report งบและ Social Impact รวมข้อมูลตาม filter โดย reconcile กับธุรกรรมจริง. **ส่งมอบ:** ไม่เปิดเผยรายบุคคล, มีนิยาม KPI/last updated, Postman ครบ; ส่ง response ให้ B.
6. `F13–F14` (D6–7): รวมผลทดสอบ 3 role, load test, backup/restore, smoke Postman, README/demo และ release tag. **ส่งมอบ:** รายงานผลจริงและข้อจำกัด; merge PR ตาม dependency หลัง review/CI.

**กติกาคิวงาน:** I เป็นเจ้าของ `schema.prisma`, migration และการ merge Postman เพื่อลด conflict; หากงานค้าง ให้แยก module ที่ไม่แตะ schema กลางเป็น issue ใหม่ให้ A/B รับ โดยระบุ API contract, file scope และผู้ review ก่อนเริ่ม.

## 3. Flag, branch และกติกา PR

`F00–F14` คือ **Feature Flag/กลุ่มงาน** ที่ใช้ติดตาม Requirement; `D1-A` ถึง `D7-I` คือ **Daily Flag/หน่วยลงมือทำ** ของสมาชิกแต่ละคน. ทุกคนมีหนึ่ง Daily Flag ทุกวัน. สถานะ Daily Flag: `TODO` → `DOING` → `PR` → `DONE`; `BLOCKED` ต้องระบุ dependency และงานทดแทนในวันนั้น. ใช้ branch `feat/<daily-flag>-<short-name>` หรือ `fix/<daily-flag>-<short-name>`; หนึ่ง Daily Flag = หนึ่ง issue/branch/PR จาก `main` ล่าสุด. PR เข้า `main` ผ่าน review อย่างน้อย 1 คนและ CI ผ่าน; merge ตาม dependency และ rebase ก่อน merge. PR ระบุ Daily Flag, Feature Flag/Requirement ID, endpoint/หน้าที่เปลี่ยน, migration, วิธีทดสอบ, Postman request ที่แก้ และภาพหน้าจอถ้ามี UI. ห้าม commit secret/`.env`; มี `.env.example` แทน.

**Definition of Done ทุก flag:** โค้ดรันได้, lint/typecheck ผ่าน, ทดสอบกรณีสำเร็จและกรณีผิดพลาดที่สำคัญ, UI ภาษาไทยใช้งานที่ 360 และ 1920 px, auth/permission ตรวจฝั่ง API, เอกสารและ seed ตามที่กระทบ. **ทุก PR ที่แก้ Backend/API ต้องปรับ `apps/api/postman/THAI-Please.postman_collection.json` ใน PR เดียวกันทุกครั้ง** รวม request, ตัวแปร, ตัวอย่าง body, expected status และกรณี 401/403/validation/duplicate ตามความเกี่ยวข้อง; ตรวจว่าทุก endpoint ใหม่หรือเปลี่ยนมี request ใน collection. คำว่า Backend รวมโมดูล AI ใน NestJS, cron, report และการแก้ route เดิม. คนกลาง review เงื่อนไขนี้ก่อน merge.

## 4. แผนงานตามวันและ dependency

### Daily Flags — ทุกคนมีงานและ PR ทุกวัน

ให้เปิด issue ทั้ง 28 รายการตั้งแต่ D1. งานที่ต้องรอ API ให้เริ่มจาก UI shell, fixture, contract test หรือ test case ที่ไม่แก้ API กลาง; เมื่อ dependency merge จึงเชื่อม API จริงใน Daily Flag ถัดไป. ทุกแถวต้องจบด้วย PR หรือ issue ที่ระบุผลตรวจและ blocker ชัดเจน. หากงานวันนั้นถูกบล็อก คนกลางจัดงานทดแทนในพื้นที่ไฟล์ของเจ้าของโดยรักษา Daily Flag เดิม ไม่ปล่อยให้วันนั้นว่าง.

| วัน | คน | Daily Flag → Feature Flag | งานที่ต้องส่งมอบในวันนั้น | Dependency / ขอบเขต |
|---|---|---|---|---|
| D1 | A | `D1-A` → F04 | สร้าง customer route/layout, login/account wireframe, แผนที่และ store card จาก fixture ที่อิง Feature catalog | รอ F01 เพื่อล็อก DTO; UI ของ A เท่านั้น |
| D1 | B | `D1-B` → F05 | สร้าง seller/government route/layout, wireframe ฟอร์มร้าน/ตรวจร้าน และ field list ส่ง I | รอ F01 เพื่อล็อก DTO; UI ของ B เท่านั้น |
| D1 | AI | `D1-AI` → F01/F07 | ระบุ request/response recommendation, candidate filter, no-result/fallback cases และชุดข้อมูล eval ให้ I ตรวจ | เอกสาร/fixture AI; ยังไม่แตะ schema กลาง |
| D1 | I | `D1-I` → F00/F01 | bootstrap repo/DB/CI, migration+seed ขั้นต่ำ, API contract/decisions/Postman skeleton; รับ field list จากทุกคน | merge ก่อนงาน API ของ D2 |
| D2 | A | `D2-A` → F04 | ต่อ login/account กับ F02 API, แยกยอด Coins/บาท, loading/error และ responsive | F01; F02 API ถ้า merge แล้ว |
| D2 | B | `D2-B` → F05 | ฟอร์มร้าน RHF+Zod และหน้ารัฐตรวจร้าน; ต่อ F02 auth, เตรียม client ของ F03 | F01; F02 API ถ้า merge แล้ว |
| D2 | AI | `D2-AI` → F07 | ทำ candidate retrieval/filter และ deterministic ranker ตาม contract พร้อม unit test ร้านเคยซื้อ/ไม่ร่วม | F01 และ model ร้านจาก F03; ใช้ adapter ถ้า F03 ยังไม่ merge |
| D2 | I | `D2-I` → F02 | auth, role/ownership, `/me`, wallet summary, 401/403 tests และ Postman | F01 |
| D3 | A | `D3-A` → F04 | ต่อ store search/map/store card กับ F03; consent พิกัดและค้นหาพื้นที่แทน | F03 API; UI ของ A |
| D3 | B | `D3-B` → F05 | ต่อ seller store CRUD และ government approval กับ F03; ทดสอบ owner isolation ใน UI | F03 API; UI ของ B |
| D3 | AI | `D3-AI` → F07 | ทำ recommendation controller/DTO/adapter, empty result และ Postman; เชื่อม store service | F03, F06 contract; ไม่แก้ rule service |
| D3 | I | `D3-I` → F03/F06 | API ร้าน+อนุมัติ และ rule version/preview contract; tests + Postman; ส่ง response ให้ A/B/AI | F02 |
| D4 | A | `D4-A` → F09 | chat UI/การ์ดคำแนะนำ เชื่อม F07; เตรียม preview/confirm จาก contract | F07 API; ส่วนซื้อรอ F08 |
| D4 | B | `D4-B` → F10 | หน้ากติกา Coin ของร้าน/รัฐ และ transaction table จาก contract | F06 API; transaction ต่อจริงหลัง F08 |
| D4 | AI | `D4-AI` → F07 | ตรวจ store ID และ coin estimate จาก rule service จริง; test hallucination/provider failure; Postman | F06 service; ส่ง response ให้ A |
| D4 | I | `D4-I` → F06/F08 | ปิด rule/preview แล้วทำ purchase confirm+ledger/idempotency ขั้นแรก; tests + Postman | F06 ก่อน F08 |
| D5 | A | `D5-A` → F09 | เชื่อม preview/confirm, Coins/quest/history กับ F08; demo ลูกค้าทั้ง flow | F08 API |
| D5 | B | `D5-B` → F10/F12 | ต่อ seller transactions/rules กับ F08; สร้าง government Dashboard shell/filter จาก F11 contract | F08; F11 response ยังรอได้ |
| D5 | AI | `D5-AI` → F07/F13 | eval บน seed จริง: ร้านเคยซื้อ, ไม่มีร้าน, ไม่มีพิกัด, rule เปลี่ยน; แก้ recommendation bug + Postman | F07/F08 seed |
| D5 | I | `D5-I` → F08/F11 | ปิด quest/month boundary/concurrent duplicate และเริ่ม report API งบ; tests + Postman | F08 ก่อน F11 |
| D6 | A | `D6-A` → F13 | E2E ลูกค้า, mobile/keyboard, consent/duplicate/month error; แก้ bug UI ของ A | F09 |
| D6 | B | `D6-B` → F12/F13 | ต่อ Dashboard กับ F11, ตรวจ KPI/งบกับ seed, E2E ร้าน+รัฐ และ responsive | F11 API |
| D6 | AI | `D6-AI` → F13 | adversarial/grounding eval, cross-role/privacy ของ recommendation, เก็บผลทดสอบและแก้ bug AI | F07 |
| D6 | I | `D6-I` → F11/F13 | ปิด Social Impact API/reconciliation; load test 100 concurrent p95; รวมผล NFR/bug; Postman | F08/F11 |
| D7 | A | `D7-A` → F14 | regression ลูกค้า, demo script/ภาพหน้าจอ, ปิด blocker ในพื้นที่ A และ review UI B | F13 |
| D7 | B | `D7-B` → F14 | regression ร้าน+รัฐ, นิยาม KPI บนหน้า, ปิด blocker ในพื้นที่ B และ review UI A | F13 |
| D7 | AI | `D7-AI` → F14 | final eval AI บน seed/demo, บันทึก fallback/ข้อจำกัด, review คำตอบที่อ้างร้าน/Coins | F13 |
| D7 | I | `D7-I` → F14 | backup/restore จับเวลา, smoke Postman, README/runbook, final merge/CI และ release tag | F13 และ PR ของทุกคน |

**จุด sync รายวัน:** ต้นวันระบุ dependency ที่ merge แล้วและ API response ล่าสุด; กลางวันส่ง contract/endpoint ให้เจ้าของ UI/AI; ท้ายวันเปิด PR พร้อมหลักฐาน DoD และอัปเดต blocker. ถ้า API เลื่อนไปวันถัดไป ให้ Daily Flag ฝั่ง UI ส่ง fixture/contract tests ของวันนั้นก่อน แล้วเปิด Daily Flag วันถัดไปเพื่อต่อ API จริง.

| วัน | Flag / เจ้าของ | งานและ Requirement | ผลรับมอบ/เกณฑ์ผ่าน | ต้องรอ |
|---|---|---|---|---|
| D1 | `F00` คนกลาง | ตั้ง monorepo `apps/web`, `apps/api`, Docker Postgres, Prisma, lint/typecheck, CI, seed และ README runbook; ร่าง entity จากหัวข้อ 5 ในไฟล์นี้ | ทุกคนรัน local ได้; migration แรกและ seed บัญชี 3 บทบาท | — |
| D1 | `F01` คนกลาง + review ทุกคน | ตกลง data/API contract: auth, store, purchase, coins, quest, reports, recommendation; Zod DTO/รูป error, decimal, timezone, pagination, test account; ลง `docs/api-contract.md` และ `docs/decisions.md` | ทุกคน approve contract ก่อนเริ่ม endpoint/UI; Postman collection skeleton และ environment ตัวอย่าง | F00 |
| D1–2 | `F02` คนกลาง | login/role guard/ownership; บัญชีลูกค้าและยอด wallet/Coins แยกกัน (`FR-C01/S01/G01`, `NFR-01/02`) | 401/403 และการข้ามสิทธิ์ถูกปฏิเสธ; seed login ได้; Postman ครบ | F01 |
| D2–3 | `F03` คนกลาง | API ร้าน: owner CRUD, รัฐตรวจ/เปิดปิดเข้าร่วม, public search/filter/พิกัด/หมวดหมู่/รับ Coins (`FR-C02/S01/G01`) | ร้านที่ไม่เข้าร่วมไม่ปรากฏ; owner แก้ได้เฉพาะร้านตน; Postman ครบ | F02 |
| D2–3 | `F04` App Dev A | shell ลูกค้า, login, บัญชี/ยอด, แผนที่ค้นหาและ store card; ขอพิกัดหลังยินยอมและมีค้นหาพื้นที่แทน (`FR-C01/02`, `NFR-02/06`) | ใช้ API จริงหลัง F03; พิกัดปฏิเสธแล้วยังค้นหาได้; responsive/keyboard | F01, F03 API |
| D2–3 | `F05` App Dev B | shell คนขาย/รัฐ, login, ฟอร์มร้าน (RHF+Zod), ตรวจร้าน, รายการร้าน (`FR-S01/G01`, `NFR-06`) | owner และรัฐทำงานกับ API จริง; สถานะ error ชัดเจน | F01, F03 API |
| D3–4 | `F06` คนกลาง | versioned Tiered Coins และ preview รายการซื้อ: เกณฑ์ 1–10, ร้านใหม่ยอดต่ำ 8–10, ร้านเดิมที่เคยได้ Coins 1; รัฐตั้งกติกา (`FR-C04/05/S03/G02`) | preview แสดงยอดรวม/เงินตัวเอง/ช่วยจ่ายและ Coins จากกติกาปัจจุบัน; snapshot rule version; Postman ครบ | F02, F03 |
| D3–4 | `F07` AI Dev | NestJS recommendation API: คัดร้านเข้าร่วมที่ไม่เคยซื้อสำเร็จ, ใช้ความสนใจ/พื้นที่ที่ยินยอม, จัดอันดับ, ส่งเฉพาะ candidates ให้ model/adapter, ตรวจ store ID และ Coins ผ่าน service จริงก่อนตอบ (`FR-C03`, `NFR-04`) | ไม่แต่งร้าน/Coins; ไม่มีร้านให้ตอบ empty state; provider ล่มมีผลลัพธ์ deterministic; ทดสอบกรณีร้านเคยซื้อ/ไม่มีพิกัด; Postman ครบ | F03, F06 contract |
| D4–5 | `F08` คนกลาง | confirm purchase แบบจำลองชำระเงิน, ledger เงิน/Coins, idempotency key, transaction DB/locking, Main Quest 100 Coins → 100 บาทหนึ่งครั้งต่อเดือน, รอบเดือนใหม่ไม่ลบ history (`FR-C04–07/S02`, `NFR-05`) | ยอดไม่ติดลบ/ซ้ำ, เงินสามส่วนรวมเท่ายอดซื้อ, reward ใช้ได้เฉพาะเดือน, ทดสอบ concurrent duplicate; Postman ครบ | F06 |
| D4–5 | `F09` App Dev A | chat UI, preview/confirm ซื้อ, Coins/quest progress/ประวัติรายเดือน (`FR-C03–07`) | demo flow ลูกค้าจบด้วย API จริง; ยืนยันหลังเห็นยอด; error/empty state | F07, F08 API |
| D4–5 | `F10` App Dev B | หน้าคนขายดูยอด/สถานะ/เกณฑ์ Coins; หน้ารัฐแก้กติกา (`FR-S02/03/G02`) | สิทธิ์และข้อมูลถูกต้องตามร้าน; ไม่มีการคำนวณ Coins เองใน UI | F06, F08 API |
| D5–6 | `F11` คนกลาง | API งบ Main Quest และ Social Impact: filter เวลา/พื้นที่, นิยามตัวชี้วัด, last updated, งบตั้งต้น/มอบ/ใช้/คงเหลือ/หมดอายุ แยกจากสิทธิพื้นฐาน (`FR-G03/04`, `NFR-02/07`) | reconcile กับธุรกรรม seed; ไม่มีประวัติรายบุคคล; เดือนศูนย์แสดง 0; Postman ครบ | F08 |
| D5–6 | `F12` App Dev B | รัฐ: Dashboard/งบพร้อม filter และนิยาม KPI (`FR-G03/04`) | เทียบตัวเลขกับ API และ seed; UI responsive | F11 API |
| D6 | `F13` ทุกคน; คนกลางรวมผล | E2E 3 บทบาท, security/duplicate/AI/เดือนใหม่, load test ค้นหาร้านและประวัติ 100 concurrent เป้าหมาย p95 ≤ 3s (`NFR-01–07`) | แนบผลจริง สภาพแวดล้อม และ issue ที่ยังไม่ผ่าน; แก้ bug ระดับ blocker | F09–F12 |
| D7 | `F14` คนกลาง + ทุกคน | backup/restore PostgreSQL และจับเวลา, final regression, README/demo script, tag release (`NFR-08`) | มีวิธี backup ทุก 24 ชม., ทดสอบ restore ≤ 4 ชม. และข้อมูลย้อนหลัง ≤ 24 ชม.; Postman collection รัน smoke ครบ | F13 |

เมื่อเวลาจำกัด ให้รักษา `F00–F03`, `F06`, `F08`, `F11` และ flow UI ที่เชื่อมข้อมูลจริงก่อน; ตัดงานตกแต่ง UI/animation ก่อนตัด correctness, สิทธิ์, Postman หรือทดสอบยอด. หากแผนที่หรือ AI provider ยังไม่พร้อม ใช้ adapter/fallback ที่แสดงข้อมูลร้านจริงจาก DB และบันทึกข้อจำกัดใน README. ผลทดสอบ NFR ที่ไม่ถึงเป้าต้องรายงานตามจริง ไม่เขียนว่า “ผ่าน”.

## 5. Contract และจุดเชื่อมที่ต้องล็อกใน Day 1

- **Data model ขั้นต่ำ:** `User` (role: customer/seller/government), `Store` (owner, status, location, category, hours, area, size), `Purchase` (customer, store, status, amount breakdown, rule version, area/size snapshot, idempotency key), `Wallet/MoneyEntry` (เงินลูกค้า/สิทธิพื้นฐาน/สิทธิ Main Quest แยก ledger), `MonthlyPeriod`, `CoinEntry` (purchase, period, rule, reversal), `CoinRuleVersion`, `RewardGrant` (customer, period, expiry, budget). คนขายหนึ่งคนมีหลายร้านได้; ทุก transaction ต้องผูกเจ้าของ/ร้านจริง. สถานะ visited คำนวณจาก Purchase สำเร็จ ไม่เก็บค่าซ้ำ.
- **Invariant:** ยอดซื้อ = เงินลูกค้าจ่าย + ส่วนสิทธิพื้นฐาน + ส่วน Main Quest; ใช้ decimal คงที่; ยอดคงเหลือคำนวณจาก ledger; Coin จากหนึ่ง purchase สำเร็จได้ไม่เกินหนึ่งครั้ง; grant ไม่เกินหนึ่งครั้งต่อลูกค้าต่อเดือน; refund/reversal เก็บประวัติและปรับยอดสุทธิ; Main Quest ใช้ได้ภายในเดือนที่ให้. DB transaction + unique constraint/idempotency ป้องกันคำขอพร้อมกัน. รายงานงบ/Impact คำนวณจากรายการสำเร็จและ snapshot ณ เวลาซื้อเพื่อ audit ได้.
- API ขั้นต่ำ: `POST /auth/login`, `GET /me`, `GET /wallets/me`, `GET /stores`, `GET/PATCH /seller/stores/:id`, `GET /seller/purchases`, `GET/PATCH /government/stores/:id`, `GET/POST /government/coin-rules`, `POST /purchases/preview`, `POST /purchases` (header `Idempotency-Key`), `GET /purchases/me`, `GET /coins/me`, `GET /quests/me`, `POST /recommendations`, `GET /government/quest-budget`, `GET /government/impact`.
- API backend เป็นแหล่งคำนวณยอดเงิน, Coins, visited status, reward และ KPI; frontend แสดงค่าที่ตอบมา. `POST /recommendations` ส่งเพียงข้อความ/ตัวกรองและพิกัดเมื่อยินยอม; server ดึงประวัติจาก token เอง. คำตอบมี `storeId`, `coinEstimate`, `reason`, `sourceRuleVersion` เพื่อเปิด store card ได้.
- ค่า default ของระบบทดสอบต้องระบุชัดใน `docs/decisions.md`; seed มีกรณีตาม Feature catalog ด้านบน. หาก `CoreIdea` เสนอรายละเอียดเพิ่มหรือขัดกับ Feature catalog ให้ทีมตกลงและบันทึกการตัดสินใจก่อนแก้ contract.

## 6. วิธีใช้ Codex และการเปลี่ยน Stack

- หนึ่ง prompt ต่อหนึ่ง **Daily Flag** ที่จบใน PR เดียว; ระบุ Feature Flag ที่ Daily Flag อ้างถึง. ส่งเฉพาะใบงานรายคน, Feature ID, contract, acceptance criteria และขอบเขตไฟล์จากเอกสารนี้; ไม่ต้องใช้เอกสารต้นทางอื่น. จดสรุปสั้น ๆ ใน issue/PR เพื่อส่งต่องานข้าม session.
- ใช้โควตา **Normal** กับ scaffold, UI/form, CRUD, Postman request, เอกสาร และงานแก้เฉพาะจุด; ใช้ **Pro** กับ schema/ledger/idempotency/concurrency, rule/quest, ความปลอดภัย และการตรวจ AI grounding. ให้คนตรวจ diff และทดสอบเองเสมอ; อย่าส่ง secret หรือข้อมูลจริงเข้า prompt.
- ถ้าเพิ่ม/ลด/เปลี่ยน stack หรือ provider ให้ผู้เสนอทำ PR เดียวกับการเปลี่ยน: ปรับรายการ stack ใน `PLAN.md`/README, lockfile และ `.env.example`, ADR ใน `docs/decisions.md`, และ **สร้างหรือปรับ SKILL** ใน `.agent/skills/<topic>/SKILL.md` อธิบายเมื่อใช้ stack ใหม่นี้ วิธี run/test, contract, ข้อควรระวัง และตัวอย่าง prompt สั้น ๆ. Reviewer ต้องตรวจ SKILL ก่อน merge. การปรับ package ภายใน stack เดิมที่ไม่เปลี่ยนแนวทางใช้งานให้บันทึกใน PR; ถ้าเปลี่ยนวิธีทำงานของทีมให้ปรับ SKILL ด้วย.

## 7. Checklist ปิดสัปดาห์

- [ ] ทุก FR-C01–C07, FR-S01–S03, FR-G01–G04 มีหน้าจอ/API และ scenario demo ที่ระบุผู้รับผิดชอบ
- [ ] Postman collection ตรวจทุก API พร้อม positive/negative cases และ environment ตัวอย่างไม่มี secret
- [ ] Migration + seed รันจากเครื่องใหม่ได้; no hardcoded KPI/Coins ใน UI
- [ ] ทดสอบข้ามสิทธิ์, ซื้อซ้ำพร้อมกัน, รางวัลซ้ำ, boundary สิ้นเดือน, AI hallucination/empty state, Dashboard reconcile
- [ ] บันทึกผลทดสอบ NFR-03 และ NFR-08 พร้อมสภาพแวดล้อม/เวลา ไม่อ้างผลที่ยังไม่ทดสอบ
- [ ] README มีคำสั่งเริ่มระบบ, demo accounts, limitations และลิงก์ `docs/decisions.md`; release tag หลัง PR ทั้งหมด merge

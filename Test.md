# บัญชีทดสอบ Login

ใช้เฉพาะ development/demo เท่านั้น เลขบัตรประชาชนด้านล่างเป็นเลขสมมติ ไม่ใช่ข้อมูลบุคคลจริง

| แท็บ Login | Role       | Username          | Password              | หน้าหลัง Login |
| ---------- | ---------- | ----------------- | --------------------- | -------------- |
| ลูกค้า     | CUSTOMER   | `0000000000000`   | `DemoCustomer!2026`   | `/wallet`      |
| ร้านค้า    | SELLER     | `demo_shop`       | `DemoShop!2026`       | `/store`       |
| ภาครัฐ     | GOVERNMENT | `demo_government` | `DemoGovernment!2026` | `/government`  |

## เตรียมและเปิดใช้งาน

1. ตั้ง `DATABASE_URL` และ `JWT_SECRET` (secret สุ่มอย่างน้อย 32 bytes) ใน `apps/api/.env`
2. จาก root รัน `pnpm --filter api seed:demo` เพื่อเพิ่มบัญชีทดสอบ
3. รัน `pnpm dev` แล้วเปิด <http://localhost:3001/login>
4. เลือกแท็บให้ตรงกับบัญชีแล้วกรอกข้อมูลตามตาราง

Seed รันซ้ำได้โดยไม่เปลี่ยน ID หรือรหัสผ่านเดิม ถ้า username ซ้ำแต่ role/status/password ไม่ตรงจะหยุดและ rollback ทั้งชุด ไม่มีการเพิ่มยอดเงินหรือ Coins; demo seller มีร้าน APPROVED สำหรับทดสอบ QR/Purchase

## สิ่งที่ควรตรวจ

- Login ถูกต้องแล้วเข้าหน้าที่ตรงกับ role
- รหัสผ่านผิดหรือเลือก role ผิดต้องเข้าสู่ระบบไม่ได้
- Logout แล้วเข้า `/wallet`, `/store`, `/government` ไม่ได้จนกว่าจะ login ใหม่
- หน้าลูกค้าแสดงชื่อบัญชีทดสอบผ่าน AuthContext

## ผลตรวจ 11 ตุลาคม 2026

เพิ่มบัญชีลง DB ที่ตั้งค่าในโปรเจกต์แล้ว: CUSTOMER ID `1`, SELLER ID `2`, GOVERNMENT ID `3` รหัสผ่านเก็บใน DB เป็น scrypt hash

ตรวจ Login จริงครบ 3 role แล้ว: Nest `/auth/login` และ `/me` ผ่าน; Web `/api/auth/login` ตั้ง HttpOnly cookie และเปิด `/wallet`, `/store`, `/government` ได้ HTTP 200 หลังตั้ง JWT_SECRET ใน local environment และ reload API

## เส้นทางหน้าจอ

- ลูกค้า: `/wallet`, `/wallet/explore`, `/wallet/quests`, `/wallet/history`, `/wallet/account`
- ร้านค้า: `/store`, `/store/receive`, `/store/history`, `/store/settings`, `/store/account`
- รัฐ: `/government`, `/government/stores`, `/government/coin-rules`, `/government/reports`, `/government/account`
- ทดสอบ refresh และ Back/Forward ในแต่ละเส้นทาง; Logout อยู่หน้า account ของทุก role
- หน้ารัฐด้านอนุมัติร้าน กติกา และรายงานเป็น placeholder ยังไม่เชื่อม API

ผลตรวจ routes: Login ด้วยบัญชีจริงทั้ง 3 role แล้ว GET ครบ 15 path ได้ HTTP 200; ทดสอบเข้าข้าม role ครบ 3 role และถูก redirect กลับ root ของ role ตนเอง ยังไม่ได้ตรวจ Back/Forward และ responsive ของเส้นทางใหม่ใน browser

## สมัครสมาชิก

จากหน้า Login กด สมัครสมาชิก → `/register` แล้วเลือก role กรอกชื่อที่แสดง ชื่อผู้ใช้ รหัสผ่านและยืนยันรหัสผ่าน สมัครสำเร็จกลับไป Login ไม่มีการ login อัตโนมัติ

- Customer: เลขสมมติ 13 หลักที่ยังไม่ซ้ำ
- Seller/Government: username 3–64 ตัว a-z/A-Z/0-9/จุด/ขีดกลาง/ขีดล่าง
- รหัสผ่าน 8–128 ตัวอักษร; ยืนยันต้องตรงกัน
- ตรวจชื่อผู้ใช้ซ้ำและรหัสผ่านไม่ตรงผ่าน alert แบบลอย
- การสมัครรัฐเปิดเองได้เฉพาะตามขอบเขต prototype ที่ตกลงใน decisions.md

## ข้อมูลสมัครสมาชิกตาม role (ปรับล่าสุด)

- ลูกค้า: ชื่อ, นามสกุล, เลขบัตรประชาชน 13 หลัก, รหัสผ่านและยืนยัน
- ร้านค้า: ชื่อร้าน, หมวดหมู่, รหัสพื้นที่, ละติจูด, ลองจิจูด, เวลาเปิด–ปิด, ขนาดร้าน, username, รหัสผ่านและยืนยัน ร้านถูกสร้างเป็น PENDING พร้อมบัญชี
- ภาครัฐ: username, รหัสผ่านและยืนยันเท่านั้น ไม่มีข้อมูลส่วนตัวเพิ่มเติม
- ชื่อบัญชีลูกค้าใช้ชื่อ–นามสกุล ร้านค้าใช้ชื่อร้าน และภาครัฐใช้ username

## แผนที่สมัครร้าน — 11 ตุลาคม 2026

- เปิด /register → ร้านค้า → เปิดแผนที่เลือกตำแหน่งร้าน
- คลิกแผนที่หรือย้ายหมุดเพื่อเติมละติจูด/ลองจิจูด; แก้ตัวเลขเองได้
- กรอกที่อยู่ร้านเป็นข้อความด้วยตนเอง (1–500 ตัว); ยังไม่มีค้นหาที่อยู่หรือแปลงหมุดเป็นที่อยู่
- สมัครร้านต้องส่ง shop.address พร้อมรายละเอียดเดิม; API สร้าง user+shop แบบ atomic และตั้ง PENDING
- เพิ่ม migration 20261011164000_shop_address และ apply DB ที่ตั้งค่าแล้ว; ข้อมูลร้านเดิมมี address เป็น null ได้
- ผลตรวจ: web/API lint/build ผ่าน, API tests 16 ผ่าน, Prisma validate/generate และ Prettier ผ่าน; browser แสดง tiles/เครดิต และคลิกเติมพิกัดสำเร็จ
- ยังไม่ได้ตรวจลากหมุด, responsive ล่าสุด และสมัครสำเร็จผ่าน browser ครบ flow

ผลตรวจต่อ 12 ตุลาคม 2026: manual coordinates แสดง marker, ลากหมุดเปลี่ยนพิกัดจริง; viewport 360x800 แสดง map/attribution ครบและไม่มีแนวนอนล้น ยังไม่ได้ตรวจ submit สมัครสำเร็จครบ flow ผ่าน browser

## ที่อยู่ JSON / auto geocoding — 12 ตุลาคม 2026

แทนที่คำอธิบายที่อยู่แบบข้อความ/ไม่ทำ geocoding ด้านบน: shop.address ตอนนี้เป็น {line1, province, district, subDistrict, postcode}; ค่าแต่ละ field เป็น string. กรอกพิกัดหรือคลิก/ลากหมุดจะเติมที่อยู่ผ่าน Nominatim หลังหยุดเปลี่ยน800ms ตรวจและแก้ก่อนสมัคร; ปุ่มเติมอีกครั้งใช้ retry. ไม่ใช้ postcode แทน areaCode.

PC: Ctrl + scroll ซูมแผนที่; scroll ปกติเลื่อนหน้า. Migration JSONB apply แล้วรักษาข้อความเดิมใน line1. HTTP และ browser พิกัดตัวอย่าง13.7455/100.534 เติมทั้ง5ช่องผ่าน; invalid latitude91 ได้400. API tests22, web/API lint/build, Prisma และ Prettier ผ่าน. ยังไม่ได้ทดสอบ wheel gesture จริง/responsiveล่าสุดหรือสมัครสำเร็จครบ flow.

## หมวดหมู่หลายรายการ — 12 ตุลาคม 2026

DB ใช้ categories + shop_categories แทน shops.category; migration 20261012003000_shop_categories apply แล้ว. Register ร้านเลือกหมวดจากรายการกลางได้1–10รายการ ส่ง shop.categoryIds เป็น string array. เรียก GET /categories เพื่อเอา IDs จริงก่อนทดสอบ (Postman request แรกตั้ง categoryId ให้); duplicate/unknown/empty IDs ได้400. Browser เลือกคาเฟ่+เบเกอรี่พร้อมกันผ่าน; Prisma nested user/shop/2หมวดแล้ว rollback ผ่าน; API tests23 และ web/API lint/build ผ่าน. ยังไม่ตรวจ full successful register ผ่าน HTTP/browser.

## ใช้ตำแหน่งปัจจุบันตอนสมัครร้าน

/register → ร้านค้า → ใช้ตำแหน่งปัจจุบัน → อนุญาต location ใน browser. สำเร็จเปิดแผนที่ ย้ายหมุดและเติมที่อยู่จากพิกัด ตรวจว่าตรงกับร้านก่อนสมัคร. หากไม่อนุญาต/timeout จะมี Sonner alert และเลือกหมุดเองได้. ต้อง HTTPS หรือ localhost. lint/build ผ่าน แต่ยังไม่ได้ทดสอบตำแหน่งจริงบนอุปกรณ์.

## วันและเวลาเปิด–ปิด — 12 ตุลาคม 2026

Register ร้าน: dropdown วันเปิด เลือกหลายวันหรือเลือกทุกวัน/ยกเลิกทุกวัน; ช่องเวลาเปิด—ปิดกรอก24ชั่วโมง HH:mm เช่น08:00—18:00. เวลาเดียวกันทุกวันที่เลือก;18:00—02:00หมายถึงปิดวันถัดไป. API ส่ง openingHours {days:[MON,TUE,...],open,close,timeZone:Asia/Bangkok} เก็บ JSONเดิม ไม่ต้อง migrate;ข้อมูลเก่า{text}ยังอยู่. Tests24 และ web/API lint/buildผ่าน; browser select-all/บางวัน/overnightผ่าน ยังไม่ตรวจสมัครสำเร็จครบ flow.

## Mock historical Coin rules

Run pnpm --filter api seed:coin-rules after seed:demo. Adds expired versions1–3 (1 Sep–1 Oct2026, Asia/Bangkok) to Government /government/coin-rules history. Idempotent; refuses conflicting versions/windows and production. Values are demo only; no active/pending rule or shop rates created.

Current mock rule: pnpm --filter api seed:coin-rules:current. Creates an active version if none exists; minimum50บาท, threshold10000บาท/7days, new-low10/new-other5/repeat1. Existing active rule retained, pending rule refused.

## Wallet help fallback / QR lifecycle — 12 ตุลาคม 2026

- Help ใช้เฉพาะยอดของเดือนปัจจุบันตาม Asia/Bangkok และตั้งต้น 1,000 บาท; เดือนเก่าไม่สะสมมาใช้ต่อ
- Preview/Pay ตั้งเป้ารัฐช่วย 60%; ถ้า help เหลือน้อยกว่านั้น ใช้ help เท่าที่มีและหักส่วนขาดจาก balance ลูกค้า ถ้า balance ลูกค้าไม่พอจึงปฏิเสธ
- Top-up ต้องมี Idempotency-Key; ส่งซ้ำ key เดิมไม่เพิ่มยอดซ้ำ. Reset help แสดง/เรียกได้เฉพาะ non-production และ ENABLE_TEST_WALLET_ACTIONS=true
- Seller QR อายุ 15 นาที, ดูรายการล่าสุดและยกเลิก PENDING ได้; paid/cancelled/expired ใช้จ่ายไม่ได้ และการจ่ายสำเร็จสร้าง Purchase เชื่อมกับ payment request
- Unit tests ผ่าน 40 tests; API/web lint และ production build ผ่าน; Prisma format/validate/generate และ migration deploy ผ่าน. Live E2E ยืนยัน fallback, top-up retry, cancel และ QR เดียวถูกจ่ายพร้อมกันได้ 201 หนึ่งคำขอ/409 หนึ่งคำขอ; กรณี help เหลือ 0 หัก balance ลูกค้าเต็ม 2,000 บาทและสร้าง Purchase สำเร็จ. ยังไม่ได้ทดสอบกล้องบนอุปกรณ์จริง
- แก้หน้า `/store/receive`: ปุ่ม Base UI เดิมไม่มี `type="submit"` จึงกดแล้วไม่เรียก form handler; กำหนด submit ชัดเจนและแสดง “กำลังสร้าง QR...” ระหว่างรอ
- แก้หน้า `/wallet/top-up`: ปุ่ม Base UI เดิมไม่มี `type="submit"` จึงกดแล้วไม่เรียก top-up handler; กำหนด submit ชัดเจนและแสดง “กำลังเติมเงิน...” ระหว่างรอ
- หน้า `/wallet/scan` เปลี่ยนจาก BarcodeDetector เป็น `@zxing/browser`; รองรับกล้องและปุ่มเลือกภาพ QR (image/* ไม่เกิน 10 MB, decode ใน browser ไม่ upload). Web lint/build31routesผ่าน; browser authenticated QA ถูกเด้งกลับ login จึงยังต้องทดสอบเลือกรูปจริงและกล้องบน Chrome/Edge/มือถือ
- หน้า `/store/receive` หลังสร้าง QR มีปุ่มคัดลอกโค้ด UUID เป็นข้อความและบันทึก PNG ขนาด512x512. Browserจริงสร้างยอด9.99และเห็น QR/UUID/expiry/สองปุ่มครบ; web lint/buildผ่าน. Browser automationถูกปฏิเสธสิทธิ์ดาวน์โหลด จึงยังต้องกดบันทึกจาก browserผู้ใช้เพื่อยืนยันไฟล์จริง

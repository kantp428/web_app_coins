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

Seed รันซ้ำได้โดยไม่เปลี่ยน ID หรือรหัสผ่านเดิม ถ้า username ซ้ำแต่ role/status/password ไม่ตรงจะหยุดและ rollback ทั้งชุด ไม่มีการเพิ่มยอดเงิน Coins หรือร้านค้า

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

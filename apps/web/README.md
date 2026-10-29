# Web — THAI Please

Frontend ของโครงการ ใช้ Next.js, TypeScript และ Tailwind CSS ดูขอบเขตหน้าลูกค้า ร้านค้า และเจ้าหน้าที่ใน [PLAN/PLAN.md](../../PLAN/PLAN.md)

สำหรับผู้ที่เพิ่ง clone โปรเจกต์ ให้เริ่มจาก [คู่มือรันทั้ง monorepo](../../README.md#clone-แล้วรันบนเครื่องใหม่-powershell)

## เริ่มใช้งาน

การ์ดร้านทั้ง Explore และ Chatbot แสดงไอคอนเหรียญกับจำนวน Coins แบบเล็กที่มุมขวาล่าง และยอดซื้อขั้นต่ำอยู่ด้านใต้ ไม่มีกรอบพื้นทองหรือหัวข้ออัตรา ข้อมูลมาจาก `coinRate` ของ Backend ตามบัญชีลูกค้าและรอบปัจจุบัน ถ้ายังไม่มีอัตราจะแสดง “ยังไม่มีข้อมูล Coins” การ์ดไม่คำนวณอัตราหรือเพิ่ม Coins เอง ตรวจการ decode/แสดงผลด้วย `pnpm --filter web test:store-coins` (9กรณี รวมอัตราใหม่/ซ้ำ/null/ข้อมูลผิด) ผล HTTP `test:chat`47กรณีที่บันทึกไว้เป็นรอบก่อนปรับขนาด/ตำแหน่งนี้ ไม่ใช่ browser responsive QA หรือการจ่ายเงินจริง

รันคำสั่งจาก root ของ monorepo:

```powershell
pnpm install
Copy-Item apps/web/.env.example apps/web/.env.local
pnpm dev:web
```

เปิด `http://localhost:3001` ตั้ง `API_URL` เป็น NestJS เช่น `http://localhost:3000` และ `AI_SERVICE_URL` เป็น FastAPI เช่น `http://127.0.0.1:8000` ใน `apps/web/.env.local` ทั้งสองค่าเป็น server-only ไม่ใช้ NEXT_PUBLIC_ เพื่อส่ง token หรือเรียก AI โดยตรงจาก browser หากไม่กำหนด AI_SERVICE_URL จะใช้ loopback8000 ตามตัวอย่าง

หยุด Next dev ด้วย Ctrl+C; เมื่อเปลี่ยน environment ให้เริ่ม server ใหม่ คู่มือเริ่ม/หยุด AI และ Ollama อยู่ที่ [ai-service/README.md](../../ai-service/README.md)

## เปลี่ยนตำแหน่งร้าน

เข้า `/store/settings` ด้วยบัญชี SELLER ระบบโหลดเฉพาะร้านของบัญชีจริง หากมีหลายร้านให้เลือกร้านก่อนแก้ไข กด “ใช้ตำแหน่งปัจจุบัน” หรือเปิดแผนที่เพื่อคลิก/ลากหมุดแบบ Register ได้ พิกัดและที่อยู่แก้ด้วยมือได้เช่นกัน กด “บันทึกตำแหน่งร้าน” แล้วโหลดหน้าใหม่เพื่อตรวจพิกัดที่บันทึก ไม่มีการขอ GPS หรือโหลดแผนที่เองตอนเปิดหน้า

การเลือกตำแหน่งจะค้นหาที่อยู่ผ่าน BFF geocoding เดิม หากหาไม่ได้ให้กรอกเองหรือบันทึกเฉพาะพิกัดโดยไม่มีที่อยู่ได้ ใช้ HTTPS/localhost สำหรับสิทธิ์ GPS ระบบจะไม่เปลี่ยนสถานะอนุมัติหรืออัตรา Coins การเปลี่ยนตำแหน่งมีผลต่อการค้นหาร้านรอบถัดไป หน้านี้แทนฟอร์มต้นแบบเดิมด้วยการจัดการตำแหน่งจริง ส่วนแก้ชื่อ/หมวดหมู่/เวลาเปิดยังไม่ได้เพิ่ม API ในงานนี้

ใช้ `pnpm --filter web test:chat` หลัง build เพื่อตรวจ HTTP fixtures รวม61กรณี (auth/Origin/สิทธิ์ร้าน/บันทึกแล้วอ่านพิกัดใหม่) ผล30ต.ค.2569ผ่านพร้อม lint/build; ยังไม่ได้ตรวจ GPS/map/save ผ่าน browser หรือย้ายตำแหน่งร้านจริงรอบนี้

## QR รับเงินของร้านค้า

หน้า `/store/receive` ใช้ผลตรวจสถานะจาก Backend ทุก3วินาที เมื่อ QR ที่กำลังแสดงเป็น PAID จะซ่อน QR พร้อมปุ่มคัดลอก/บันทึกอัตโนมัติ รวมถึงกรณี CANCELLED/EXPIRED รายการยังอยู่ใน “QR ล่าสุด” ไม่ได้ลบธุรกรรม การโหลดล้มเหลวหรือยังไม่พบรายการไม่ได้ถือว่าจ่ายแล้ว และผลตอบกลับเก่าจะไม่ทำให้ QR ที่ปิดไปแล้วกลับมา

ตรวจ lifecycle ด้วย `pnpm --filter web test:seller-payment-qr` (8กรณี ข้อมูลสังเคราะห์ ไม่สร้างรายการชำระจริง) ผล30ต.ค.2569: script8cases และ web lint/build39routes ผ่าน ยังไม่ได้ตรวจรับชำระผ่านสอง browser จริงรอบนี้

## Coins ในหน้าสแกนจ่าย

`/wallet/scan` แสดงจำนวน Coins ที่คาดว่าจะได้รับจาก `GET /payment-requests/:id` ในช่องสรุปก่อนยืนยันแล้ว ไม่มีข้อความ “รอเชื่อมระบบ” หรือแสดงจำนวนซ้ำ หากไม่มีอัตราหรือยอดไม่ถึงขั้นต่ำยังแสดงเหตุผลจาก Backend เมื่อชำระสำเร็จ ข้อความแจ้งผลใช้ Coins ที่ได้จริงจาก POST pay ซึ่งอาจต่างจากประมาณการ หากสแกน QR ที่จ่ายแล้วจะแสดงลิงก์ไปประวัติแทนการนำค่าประมาณที่คำนวณใหม่มาอ้างว่าเป็น Coins ที่ได้รับ

ผลตรวจ30ต.ค.2569: web lint/build ผ่าน39routes เป็นการแก้การแสดงข้อมูลเดิม ไม่เปลี่ยนการชำระหรือกติกา Coins และไม่ได้ทดสอบชำระเงินจริงเพิ่มในรอบนี้

## ค้นหาร้านใน Explore ด้วย AI

เปิด `/wallet/explore` ด้วยบัญชี CUSTOMER เลือกจุดค้นหาผ่าน GPS หรือปักหมุด ตั้งรัศมี0.1–50กม. พิมพ์คำค้นหาแล้วกด “ค้นหาด้วย AI” หรือ Enter ไม่มีตัวเลือกหมวดหมู่ เมื่อข้อความว่างจะแสดงร้านทั้งหมดในขอบเขตตามเดิม

เว็บเรียก `/api/recommendations/search` → `${AI_SERVICE_URL}/stores/search` ให้โมเดลประเมินชื่อ/คำอธิบาย/หมวดหมู่ของร้านทั้งหมดในรัศมีทีละหน้า50ร้าน แล้วโหลดรายละเอียดการ์ดจาก Nest เป็นชุด100IDs ผลลัพธ์ไม่จำกัด5ร้านและไม่ใช้โควตาร้านใหม่3/ร้านเดิม2ของแชต ข้อมูลการ์ดและระยะทางมาจาก Backend เหมือนเดิม การเปลี่ยนขอบเขตยกเลิกคำขอเก่า; AI ล่มแสดงข้อผิดพลาดและลองใหม่ได้ ไม่มี fallback เป็นร้านที่ไม่เกี่ยวข้อง ต้องเปิด Nest, ai-service และ Ollama ตามคู่มือแต่ละ service

```powershell
# pagination/cancellation fixtures รวม251ร้านใน6หน้า; ไม่เรียกโมเดลจริง
pnpm --filter web test:store-search
# หลัง production build ตรวจทั้ง Chat และ Explore BFF/การ hydrate cards ด้วย HTTP fixtures
pnpm --filter web test:chat
```

ผลตรวจรอบนี้: Python72tests, pagination7cases และ HTTP Chat/Explore46cases ผ่าน รวม251IDsและ251การ์ด; web lint/build ผ่าน ไม่มีหลักฐาน live-model semantic accuracy หรือ responsive/keyboard/browser acceptance รอบนี้ ผล HTTP24กรณีที่บันทึกด้านล่างเป็นผลเดิมก่อนเพิ่ม Explore

## หน้าแชตผู้ช่วย AI (รายละเอียด)

- Login CUSTOMER แล้วกด “ผู้ช่วย AI” ในหน้ากระเป๋า หรือเปิด `/AI-chatbot` หน้าและ BFF ตรวจ session; ปุ่มกลับนำไป `/wallet`
- หน้าจอกว้างสูงสุดแบบมือถือ คงหัวข้อและปุ่มข้อความแนะนำเริ่มต้น ตัดปุ่มถังขยะ/ล้างบทสนทนาและคำอธิบายหน้าเริ่มต้นออก textarea ส่งด้วย Enter/ขึ้นบรรทัดใหม่ด้วย Shift+Enter มีสถานะรอ ยกเลิก และลองส่งใหม่ ตัวนับระบุหน่วยตัวอักษร; ขีดจำกัด2,000ตัวอักษรตรงกับ BFF/FastAPI
- การ์ดเริ่มต้นใช้ชุดที่ผู้ใช้เลือก: “แนะนำร้านอาหาร”, “หาร้านกาแฟ”, “ลองร้านใหม่”, “รู้จัก THAI Please” กดแล้วส่งข้อความทันทีผ่าน flow เดียวกับปุ่มส่ง ปิดการ์ดระหว่างรอและป้องกันการกดซ้ำ คำขออาหาร/กาแฟไม่ผูกตำแหน่งหรือรัศมี
- Browser เรียก `POST /api/chat` ด้วย session cookie; BFF ตรวจ Origin และ request/response ก่อนส่ง Bearer ไป `${AI_SERVICE_URL}/chat` ไม่ส่ง token กลับ browser ตั้ง deadline180วินาที/client190วินาที ไม่มี automatic retry
- แชตส่งเฉพาะ `{message}` ไม่ขอ GPS ไม่รอตำแหน่ง และไม่มีตัวกรองรัศมี AI ประเมินชื่อ/description/ประเภทจากร้าน APPROVED ทุกพื้นที่ก่อนให้ Backend เลือกสูงสุด3ร้านใหม่+2ร้านเคยซื้อ ส่วน Explore ยังคง GPS/ปักหมุด/รัศมีตามเดิม
- เพดานประมวลผลเดิม200ร้านและ20ชุด relevance ยังใช้ หากเกินตอบ503ให้ระบุประเภทให้ชัดขึ้น ไม่มีการตัดร้านตามระยะหรือซ่อนผลบางส่วน Legacy location ที่รูปแบบถูกต้องยังรับได้แต่ BFF ทิ้งก่อนส่ง AI
- เมื่อ AI คืน storeIds จะใช้ `/api/recommendations/stores` พร้อม `{shopIds}` ไม่เกิน5รหัส Backend ตรวจ APPROVED และอ่าน Coins ปัจจุบันตามประวัติจริง แสดงชื่อ หมวดหมู่ description ที่อยู่ Coins/ยอดขั้นต่ำและลิงก์ Google Maps จากพิกัดร้านจริง ไม่แสดงระยะทาง ข้อมูลร้านโหลดไม่สำเร็จยังเก็บคำตอบและมีปุ่มโหลดร้านซ้ำ ร้านที่ไม่พร้อมถูกตัดออกโดยไม่สร้างทดแทน
- ข้อความและ description เป็น plain text; แหล่งอ้างอิงเป็น HTTPS links ที่ตรวจแล้ว ไม่มีปุ่มล้างบทสนทนา ทุกครั้งที่เข้าหน้าแชต/กดย้อนกลับหรือไปข้างหน้า/กลับมาจาก browser page cache จะเริ่มหน้าเริ่มต้นโดยไม่มีข้อความ การ์ด หรือ draft เก่า คำขอที่ค้างอยู่ถูกยกเลิกเมื่อ conversation เดิมถูกถอดออก แชตไม่เก็บใน storage และ API ยังไม่จำข้อความก่อนหน้า

หากได้401ให้ Login ใหม่; 403ตรวจบทบาท/Origin; 400ตรวจข้อความ1–2000ตัวอักษร; 502ตรวจข้อมูล upstream; 503ตรวจ AI-service/Ollama และจำนวนร้านที่อาจมากเกินงบ; 504ลองส่งใหม่ เมื่ออยู่หลัง tunnel ให้ตั้ง WEB_PUBLIC_ORIGIN/DEV_ALLOWED_HOSTS ตาม .env.example แชตไม่ต้องใช้สิทธิ์ location

ผลตรวจ30ต.ค.2569สำหรับแชตไม่จำกัดระยะ: web lint/build ผ่าน, HTTP fixtures68กรณีและ Coins DTO/card9กรณีผ่าน รวม message-only/global hydration โดยไม่มี distance และ Explore251ร้านยังใช้รัศมีเดิม ไม่ใช่ live-model/browser acceptance

## โครงไฟล์

- `src/app/(customer)/` — หน้าลูกค้า
- `src/app/(seller)/` — หน้าร้านค้า
- `src/app/(government)/` — หน้าเจ้าหน้าที่
- `src/components/` — component ที่ใช้ร่วมกันเมื่อมีการสร้างจริง

## ตรวจงาน

```powershell
pnpm --filter web lint
pnpm --filter web build
# ทดสอบ utility ตำแหน่งเดิมด้วย stub; แชตปัจจุบันไม่ได้เรียก utility นี้
pnpm --filter web test:chat-location
# ทดสอบ session key เมื่อกลับเข้าหน้า/restore/back-forward โดยไม่อ่านประวัติเบราว์เซอร์จริง
pnpm --filter web test:chat-entry
# หลัง build ทดสอบ BFF และ SSR ผ่าน HTTP กับ fixture servers บน loopback
pnpm --filter web test:chat
# เลือกเปิด fixture ค้างไว้เพื่อตรวจ UI เอง; ใช้เฉพาะข้อมูลสังเคราะห์ ไม่ใช่ AI/DB จริง
pnpm --filter web exec node scripts/check-chat.mjs --ui
```

`test:chat` เริ่ม Next production ที่127.0.0.1:3101 และ temporary backend/AI fixture บนพอร์ตว่าง แล้วหยุด servers ที่สร้างเองเมื่อจบ ไม่ใช้บัญชีจริง ฐานข้อมูล การจ่ายเงิน หรือโมเดล ต้องให้พอร์ต3101ว่าง โหมด --ui แสดง URL session ของ fixture และหยุดด้วย Ctrl+C

ผลรอบ29ต.ค.2569: production build39routes และ HTTP integration24กรณีผ่าน รวม auth/Origin/validation/error sanitization/response IDs-links/scope forwarding/hydration และ page redirect เป็น fixture checks ไม่ใช่ live AI E2E การตรวจหน้า360/1920px, keyboard, GPS denial และ card retry ผ่าน browser ยังไม่ยืนยัน: Computer Use ถูกหยุดเพราะตรวจ URL ปัจจุบันบน Windows ไม่ได้

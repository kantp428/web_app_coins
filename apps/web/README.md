# Web — THAI Please

Frontend ของโครงการ ใช้ Next.js, TypeScript และ Tailwind CSS ดูขอบเขตหน้าลูกค้า ร้านค้า และเจ้าหน้าที่ใน [PLAN/PLAN.md](../../PLAN/PLAN.md)

สำหรับผู้ที่เพิ่ง clone โปรเจกต์ ให้เริ่มจาก [คู่มือรันทั้ง monorepo](../../README.md#clone-แล้วรันบนเครื่องใหม่-powershell)

## เริ่มใช้งาน

รันคำสั่งจาก root ของ monorepo:

```powershell
pnpm install
Copy-Item apps/web/.env.example apps/web/.env.local
pnpm dev:web
```

เปิด `http://localhost:3001` ตั้ง `API_URL` เป็น NestJS เช่น `http://localhost:3000` และ `AI_SERVICE_URL` เป็น FastAPI เช่น `http://127.0.0.1:8000` ใน `apps/web/.env.local` ทั้งสองค่าเป็น server-only ไม่ใช้ NEXT_PUBLIC_ เพื่อส่ง token หรือเรียก AI โดยตรงจาก browser หากไม่กำหนด AI_SERVICE_URL จะใช้ loopback8000 ตามตัวอย่าง

หยุด Next dev ด้วย Ctrl+C; เมื่อเปลี่ยน environment ให้เริ่ม server ใหม่ คู่มือเริ่ม/หยุด AI และ Ollama อยู่ที่ [ai-service/README.md](../../ai-service/README.md)

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
- การ์ดเริ่มต้นใช้ชุดที่ผู้ใช้เลือก: “แนะนำร้านอาหาร”, “หาร้านกาแฟ”, “ลองร้านใหม่”, “รู้จัก THAI Please” กดแล้วส่งข้อความทันทีผ่าน flow เดียวกับปุ่มส่ง ไม่ต้องกดส่งซ้ำ ปิดการ์ดระหว่างรอและป้องกันการกดซ้ำด้วย request guard เดิม คำขออาหารเป็นคำขอทั่วไป ไม่ล็อกเป็นกะเพรา และคำขอกาแฟใช้ตำแหน่งปัจจุบันแทนการอ้างรัศมีที่เลือก
- Browser เรียก `POST /api/chat` ด้วย session cookie; BFF ตรวจ Origin และ request/response ก่อนส่ง Bearer ไป `${AI_SERVICE_URL}/chat` ไม่ส่ง token กลับ browser ตั้ง deadline180วินาที/client190วินาที ไม่มี automatic retry
- ไม่มีปุ่ม/หน้าต่างเลือกตำแหน่ง ปักหมุด กรอกพิกัด หรือปรับรัศมีในหน้าแชตแล้ว ทุกครั้งที่ส่งข้อความ/กดส่งใหม่จะขอตำแหน่งปัจจุบันผ่าน browser permission และใช้รัศมี5กม. ไม่ขอสิทธิ์ตอนเปิดหน้า ไม่ติดตามตำแหน่งต่อเนื่อง ไม่บันทึกพิกัด; อนุญาต fix ที่เก่าไม่เกิน30วินาที จำกัดเวลารอตำแหน่งรวม12วินาที (position timeout10วินาที)
- หากปฏิเสธสิทธิ์ ตำแหน่งใช้ไม่ได้ หรือหมดเวลา จะส่งข้อความโดยไม่แนบ location และแจ้งเตือนครั้งเดียวจนกว่าจะหาตำแหน่งสำเร็จ ยังคุยทั่วไปได้ แต่ AI จะไม่ค้นร้านจนกว่าจะมีพิกัด กดหยุดรอระหว่างขอตำแหน่งได้ callback ที่มาภายหลังจะไม่ส่งข้อความเพิ่มหรือเปลี่ยน scope ของคำตอบเดิม
- เมื่อ AI คืน storeIds จะใช้ `/api/stores/batch` ด้วย scope ณ ตอนส่งข้อความและ categoryIds:[] เพื่อให้ server ตรวจ APPROVED/ระยะซ้ำ แสดงชื่อ หมวดหมู่ description ที่อยู่ ระยะเส้นตรง และลิงก์ Google Maps ตามข้อมูลจริง ไม่มี Coins/visited/image จำลอง ข้อมูลร้านโหลดไม่สำเร็จยังเก็บคำตอบไว้และมีปุ่มโหลดร้านซ้ำ; ร้านที่หลุด scope ไม่ถูกสร้างทดแทน
- ข้อความและ description เป็น plain text; แหล่งอ้างอิงเป็น HTTPS links ที่ตรวจแล้ว ไม่มีปุ่มล้างบทสนทนา ทุกครั้งที่เข้าหน้าแชต/กดย้อนกลับหรือไปข้างหน้า/กลับมาจาก browser page cache จะเริ่มหน้าเริ่มต้นโดยไม่มีข้อความ การ์ด หรือ draft เก่า คำขอที่ค้างอยู่ถูกยกเลิกเมื่อ conversation เดิมถูกถอดออก แชตไม่เก็บใน storage และ API ยังไม่จำข้อความก่อนหน้า

หากได้401ให้ Login ใหม่; 403ตรวจบทบาท/Origin; 400ตรวจข้อความ1–2000ตัวอักษรและพิกัด; 502ตรวจข้อมูล upstream; 503ตรวจ AI-service/Ollama และขอบเขตค้นหาที่อาจมากเกินงบ; 504ลองส่งใหม่ เมื่ออยู่หลัง tunnel ให้ตั้ง WEB_PUBLIC_ORIGIN/DEV_ALLOWED_HOSTS ตาม .env.example การใช้ตำแหน่งต้องเปิดผ่าน HTTPS หรือ localhost และอนุญาต location ในเบราว์เซอร์

## โครงไฟล์

- `src/app/(customer)/` — หน้าลูกค้า
- `src/app/(seller)/` — หน้าร้านค้า
- `src/app/(government)/` — หน้าเจ้าหน้าที่
- `src/components/` — component ที่ใช้ร่วมกันเมื่อมีการสร้างจริง

## ตรวจงาน

```powershell
pnpm --filter web lint
pnpm --filter web build
# ทดสอบ current-location success/denial/abort/timeout/invalid fix ด้วย stub ไม่อ่าน GPS จริง
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

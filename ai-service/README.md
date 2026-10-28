# AI chatbot service

FastAPI chatbot ใช้ Python 3.12+ เชื่อม **Qwen3 4B ผ่าน Ollama native API** พร้อม Tool Calling, Backend Database Filtering สำหรับแนะนำร้าน และ **Search อินเทอร์เน็ตผ่าน DDGS แบบไม่ใช้ API key** ดู [workflow](DESIGN.md) การเรียก `/chat` ต้องแนบ CUSTOMER Bearer token; ประวัติมาจาก Backend ตามบัญชีที่ยืนยันแล้ว ไม่มี mock fallback การเชื่อมหน้าเว็บยังรอทำเพิ่มเติม

ทดสอบโมเดลโดยไม่ต้อง login หรือเปิด Backend ใช้ **`POST /chat/test`** รองรับแชทปกติ Search และถามนอกเรื่อง โดยไม่เปิด tool แนะนำร้าน ดู [ตัวอย่างไม่ใช้ token](#ทดสอบโมเดลโดยไม่แนบ-token)

คู่มือนี้เป็นที่เก็บคำสั่งใช้งานของ service ให้คอยอัปเดตเมื่อวิธีติดตั้ง รัน ตั้งค่า หรือทดสอบเปลี่ยน

## เริ่มใช้งาน (PowerShell จาก repo root)

ติดตั้ง [Ollama](https://ollama.com/download/windows) แล้วดาวน์โหลดโมเดลจาก terminal:

```powershell
ollama pull qwen3:4b
ollama list
```

เปิดแอป Ollama ให้ server ทำงาน หรือใช้ `ollama serve` ใน terminal แยกถ้ายังไม่มี server รันอยู่ ตรวจว่าเข้าถึงได้:

```powershell
Invoke-RestMethod http://127.0.0.1:11434/api/tags
```

Ollama model tag คือ [`qwen3:4b`](https://ollama.com/library/qwen3:4b) ดาวน์โหลดประมาณ 2.5 GB; service ไม่ติดตั้ง Ollama หรือดาวน์โหลด weights ให้โดยอัตโนมัติ ถ้ามี server เครื่องอื่นให้แก้ OLLAMA_BASE_URL ก่อนรัน

### Ollama ที่เตรียมไว้บนเครื่องนี้

เครื่องนี้ใช้ [Ollama standalone สำหรับ Windows](https://docs.ollama.com/windows) เวอร์ชัน 0.40.3 ใน `ai-service/.tools/ollama/` พร้อม CUDA 13 libraries ใน `lib/ollama/cuda_v13/` สำหรับ NVIDIA GeForce RTX 3050 6GB Laptop GPU และเก็บ weights ใน `ai-service/.tools/ollama-models/` ทั้งสองอยู่ใน ignored directory และไม่ได้เพิ่ม executable เข้า PATH จึงใช้คำสั่งเต็มด้านล่างแทน `ollama` บนเครื่องนี้ ไฟล์เหล่านี้ไม่ติดไปกับการ clone repository

#### ติดตั้ง GPU libraries ใหม่

การติดตั้ง Ollama แบบปกติด้วย Windows installer หรือแตก standalone ZIP ครบชุด มี NVIDIA GPU libraries มาแล้ว และ Ollama เลือกใช้ GPU ที่รองรับได้อัตโนมัติเมื่อ driver/VRAM พร้อม. เหตุที่โปรเจกต์นี้ต้องเพิ่ม DLL ภายหลังคือ ตอนแรกผมเลือกดาวน์โหลด/แตกเฉพาะไฟล์ CPU จาก ZIP เพื่อลดขนาด download จึงยังไม่ได้เอา CUDA libraries มาด้วย เป็นผลจากวิธีเตรียม runtime ครั้งนั้น ไม่ใช่ขั้นตอนที่ทุกการติดตั้ง Ollama ต้องทำ

เครื่องนี้ติดตั้งส่วนนี้แล้ว ไม่ต้องดาวน์โหลดซ้ำ. สำหรับเครื่องใหม่ วิธีสะดวกคือใช้ [Ollama Windows installer](https://ollama.com/download/windows) ซึ่งรวม NVIDIA GPU support แล้ว และมี NVIDIA driver ที่รองรับ ตรวจการ์ด/driver ด้วย `nvidia-smi` ก่อน; ไม่ต้องติดตั้ง CUDA ผ่าน pip หรือ CUDA Toolkit เพื่อใช้ Ollama binary นี้

ขั้นตอนด้านล่างใช้เฉพาะกรณีชุด standalone 0.40.3 ของโปรเจกต์ที่ตอนแรกดึงมาเฉพาะไฟล์ CPU แล้วต้องเติม CUDA ให้ครบ:

1. หยุด Ollama server ก่อนคัดลอก DLL ให้ executable กับ libraries เป็น release เดียวกัน
2. ดาวน์โหลด [ollama-windows-amd64.zip เวอร์ชัน 0.40.3](https://github.com/ollama/ollama/releases/download/v0.40.3/ollama-windows-amd64.zip) จาก release ทางการ ZIP มี CLI และ NVIDIA GPU libraries อยู่แล้ว
3. แตก ZIP ลงโฟลเดอร์ชั่วคราว แล้วคัดลอกไฟล์ทั้งหมดจาก `lib/ollama/cuda_v13/` ไปที่ `ai-service/.tools/ollama/lib/ollama/cuda_v13/` โดยคงโครงสร้าง directory ไม่วาง DLL รวมกับ main.py หรือใน .venv. CUDA13 นี้เป็นชุดที่ทดสอบกับ RTX3050/driver617.42 บนเครื่องนี้ เครื่องอื่นต้องเลือก runtime/driver ที่เข้ากันตาม [GPU support](https://docs.ollama.com/gpu)
4. เปิด Ollama ใหม่ด้วย environment ตามคำสั่งด้านล่าง เรียก `/chat` ให้โหลดโมเดล แล้วตรวจ `ollama ps` ว่า PROCESSOR เป็น GPU

ตัวอย่าง PowerShell สำหรับข้อ 2–3 จาก repo root (ใช้เฉพาะกรณีต้องติดตั้ง libraries ใหม่):

```powershell
$ollamaPackageUrl = "https://github.com/ollama/ollama/releases/download/v0.40.3/ollama-windows-amd64.zip"
$ollamaZipPath = Join-Path (Get-Location) "ai-service/.tools/ollama-windows-amd64-0.40.3.zip"
$ollamaExtractPath = Join-Path (Get-Location) "ai-service/.tools/ollama-package-0.40.3"
$ollamaCudaPath = Join-Path (Get-Location) "ai-service/.tools/ollama/lib/ollama/cuda_v13"
Invoke-WebRequest -Uri $ollamaPackageUrl -OutFile $ollamaZipPath
Expand-Archive -LiteralPath $ollamaZipPath -DestinationPath $ollamaExtractPath
New-Item -ItemType Directory -Path $ollamaCudaPath -Force | Out-Null
Get-ChildItem -LiteralPath (Join-Path $ollamaExtractPath "lib/ollama/cuda_v13") -File |
    Copy-Item -Destination $ollamaCudaPath -Force
```

ถ้าติดตั้ง standalone ใหม่ทั้งชุด ให้แตก ZIP ทั้งหมดเพื่อให้ ollama.exe และ libraries อยู่ release เดียวกัน; เก็บ weights แยกตาม OLLAMA_MODELS เดิม

#### เปิด Ollama

จาก repo root ตรวจ server และโมเดลก่อน:

```powershell
Invoke-RestMethod http://127.0.0.1:11434/api/tags
& .\ai-service\.tools\ollama\ollama.exe list
```

หาก server ยังไม่ทำงาน ให้เปิด terminal แยกแล้วรัน:

```powershell
$env:OLLAMA_MODELS = Join-Path (Get-Location) "ai-service/.tools/ollama-models"
$env:OLLAMA_HOST = "127.0.0.1:11434"
$env:OLLAMA_NUM_PARALLEL = "1"
$env:OLLAMA_CONTEXT_LENGTH = "4096"
$env:CUDA_VISIBLE_DEVICES = "0"
& .\ai-service\.tools\ollama\ollama.exe serve
```

คง terminal นี้ไว้ระหว่างใช้งานและกด `Ctrl+C` เพื่อหยุด ห้ามเปิด `serve` ซ้ำเมื่อ port 11434 มี server อยู่แล้ว หากยังไม่มีโมเดล ใช้ `& .\ai-service\.tools\ollama\ollama.exe pull qwen3:4b` หลังเปิด server

GPU ถูกเลือกโดย Ollama server; ไม่ต้องแก้ FastAPI หรือส่งตัวเลือก GPU ใน message. ต้อง restart Ollama หลังเปลี่ยน environment นี้ และต้องมี CUDA libraries/driver ที่รองรับ การตั้ง `CUDA_VISIBLE_DEVICES=0` ใช้จำกัดให้เห็นการ์ดหมายเลข 0 เป็นตัวเลือกเสริม ไม่ใช่สวิตช์ที่ต้องตั้งเพื่อเปิด GPU acceleration ตามปกติ และไม่ได้ยืนยันว่าโมเดลถูก offload แล้ว ตรวจหลังเรียก `/chat` ขณะที่โมเดลยังโหลดอยู่:

```powershell
& .\ai-service\.tools\ollama\ollama.exe ps
nvidia-smi --query-gpu=name,memory.used,memory.total,utilization.gpu --format=csv
```

คอลัมน์ PROCESSOR ของ `ollama ps` ควรแสดง `100% GPU` สำหรับโมเดลนี้ ถ้าแสดง CPU ให้ตรวจ CUDA libraries และ server log ที่ `ai-service/.tools/ollama-server.stderr.log` การใช้ GPU ขึ้นอยู่กับ driver/VRAM ที่ว่าง ดู [Ollama GPU support](https://docs.ollama.com/gpu)

### เปิด FastAPI

```powershell
cd ai-service
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.lock.txt
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --env-file .env --host 127.0.0.1 --port 8000
```

หากมี `.venv` แล้ว ข้ามคำสั่งสร้าง environment ได้ ใช้ Python จาก `.venv` โดยตรงโดยไม่ต้อง activate คง terminal ที่รัน Uvicorn ไว้ระหว่างทดสอบ และกด `Ctrl+C` เพื่อหยุด service

| Environment                  | ค่าเริ่มต้น              | ความหมาย                                                               |
| ---------------------------- | ------------------------ | ---------------------------------------------------------------------- |
| `OLLAMA_BASE_URL`            | `http://127.0.0.1:11434` | URL server Ollama ไม่รวม `/api`                                        |
| `OLLAMA_MODEL`               | `qwen3:4b`               | ชื่อ model tag ที่ server มี                                           |
| `OLLAMA_TIMEOUT_SECONDS`     | `120`                    | HTTP timeout มากกว่า 0 และไม่เกิน 600 วินาที; connect timeout 5 วินาที |
| `BACKEND_BASE_URL`           | `http://127.0.0.1:3000`  | URL NestJS ที่มี recommendation routes ไม่ใช่ URL Next.js              |
| `BACKEND_TIMEOUT_SECONDS`    | `15`                     | Backend HTTP timeout มากกว่า 0 และไม่เกิน 120 วินาที                   |
| `WEB_SEARCH_ENABLED`         | `true`                   | เปิด Search ข้อมูลสาธารณะที่เกี่ยวข้อง ตั้ง false เพื่อปิด             |
| `WEB_SEARCH_TIMEOUT_SECONDS` | `15`                     | เวลารอ Search รวม 1–30 วินาที                                          |
| `WEB_SEARCH_MAX_RESULTS`     | `3`                      | จำนวนแหล่งอ้างอิงสูงสุด 1–5 แหล่ง                                      |

ต้อง restart service หลังเปลี่ยน environment การใช้ `.env` ต้องมี `--env-file .env` ตามคำสั่งด้านบน ค่าที่ตั้งใน process environment มีลำดับก่อน `.env` ตัว service ใช้ local server เป็นค่าเริ่มต้นและไม่มี API key ในการตั้งค่าปัจจุบัน

สำหรับ `/chat` ต้องรัน NestJS รุ่นที่มี `GET /recommendations/context` และ `POST /recommendations/candidates` ก่อน พร้อมตั้ง `DATABASE_URL`/`JWT_SECRET` และข้อมูลร้าน/หมวดหมู่ตามคู่มือ Backend ใน `Test.md`. หากยังไม่ได้ generate Prisma Client ใช้ `pnpm --filter api exec prisma generate` จาก repo root; ไม่ต้องเพิ่ม migration สำหรับงานนี้. หากมี `.env` ของ AI อยู่แล้ว ให้เพิ่ม BACKEND_BASE_URL เองตาม port ที่ใช้จริง (การ copy แบบมีเงื่อนไขไม่เขียนทับไฟล์เดิม). `/chat/test` ไม่ต้องใช้ Backend/DB

เปิด [Swagger UI](http://127.0.0.1:8000/docs) กด **Authorize** แล้ววาง accessToken จาก Backend login (ช่องนี้ใส่เฉพาะ token ไม่ต้องพิมพ์ Bearer). จากนั้นเลือก `POST /chat` → **Try it out** → **Execute** หรือทดสอบจาก PowerShell อีกหน้าต่าง:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/health

# Login ผ่าน Backend/Postman แล้วนำ accessToken มาใช้ เฉพาะ CUSTOMER
$accessToken = Read-Host "CUSTOMER accessToken"
$headers = @{ Authorization = "Bearer $accessToken" }
$body = @{ message = "สวัสดี คุณช่วยเรื่องอะไรได้บ้าง" } | ConvertTo-Json
Invoke-RestMethod -Uri http://127.0.0.1:8000/chat -Method Post -Headers $headers -ContentType "application/json; charset=utf-8" -Body ([System.Text.Encoding]::UTF8.GetBytes($body))

$body = @{ message = "ช่วยแนะนำร้านกินข้าวหรือดื่มกาแฟหน่อย"; location = @{ latitude = 13.75; longitude = 100.5; radiusKm = 5 } } | ConvertTo-Json
Invoke-RestMethod -Uri http://127.0.0.1:8000/chat -Method Post -Headers $headers -ContentType "application/json; charset=utf-8" -Body ([System.Text.Encoding]::UTF8.GetBytes($body))
```

ตัวอย่างรูปแบบคำตอบ (ข้อความจริงขึ้นอยู่กับโมเดล):

```json
{
  "reply": "สวัสดีครับ ผมช่วยตอบคำถามเกี่ยวกับ THAI Please และการใช้จ่ายได้ครับ",
  "storeIds": [],
  "sources": [],
  "mode": "model",
  "model": "qwen3:4b"
}
```

| Route               | ผลลัพธ์                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| `GET /health`       | 200 พร้อม `status`, `service`, `mode`                                                               |
| `POST /chat`        | CUSTOMER Bearer; 200 พร้อม `reply`, `storeIds`, `sources`, `mode`, `model`; 401/403 auth; 422 input |
| `POST /chat/test`   | ไม่ใช้ token/Backend; รูปแบบเดียวกับ /chat แต่ storeIds ว่างเสมอ; 422 input                         |
| `GET /docs`         | Swagger UI                                                                                          |
| `GET /openapi.json` | API schema                                                                                          |

`/health` ตรวจเฉพาะ app liveness; `mode: "model"` หมายถึงโหมดที่ตั้งไว้ ไม่ยืนยันว่า Ollama หรือโมเดลพร้อมใช้งาน คง `/test` เป็น alias ของ health ตามโค้ดล่าสุด โดยไม่แสดงซ้ำใน Swagger

ข้อผิดพลาดตอบเป็น `{ "detail": "..." }`: 401 token หาย/ผิด/หมดอายุ, 403 ไม่ใช่ CUSTOMER, 503 เชื่อมต่อ Backend/Ollama ไม่ได้หรือไม่พบโมเดล, 504 timeout, 502 upstream error/ข้อมูลหรือ tool call ผิดรูปแบบ ไม่มีการแต่งประวัติหรือร้านทดแทนเมื่อระบบล่ม

การแนะนำคืน `storeIds` อย่างเดียวสำหรับข้อมูลการ์ด: สูงสุด **ร้านใหม่ 3 + ร้านที่เคยซื้อ 2**, ไม่ครบคืนเท่าที่มี ไม่เติมข้ามกลุ่ม ทั้งสองกลุ่มต้องตรงประเภทที่ตีความได้ (หลายประเภทใช้ OR). จัดอันดับตาม Coins ที่ทราบจากอัตรารอบปัจจุบัน สูงไปต่ำ; ไม่ทราบอยู่ท้าย; เสมอกันใช้รหัสร้านตามตัวเลข. ถ้าไม่มีอัตราเลยใช้รหัสร้านเรียงตามตัวเลข ไม่คำนวณ Coins ขึ้นใหม่ เช่น `{ "reply":"พบร้านใหม่ 2 ร้านและร้านที่เคยซื้อ 1 ร้านครับ", "storeIds":["101","205","310"], "sources":[], "mode":"model", "model":"qwen3:4b" }` เป็นตัวอย่างรูปแบบเท่านั้น

`message` ต้องเป็น string หลัง trim ยาว 1–2000 ตัวอักษร; `/chat` รับ `location:{latitude,longitude,radiusKm}` เพิ่มได้ โดยพิกัดต้องเป็น JSON number ในช่วง [-90,90]/[-180,180], radiusKm 0.1–50 ค่าเริ่มต้น 5 กม. ต้องส่ง location ทุกคำขอที่ต้องการค้นร้านเพราะ chat เป็น stateless หากไม่มี location/null ยังคุยทั่วไปหรือค้นเว็บได้ แต่ไม่มี shop tool และจะขอให้เลือกจุดค้นหาก่อน ไม่รับฟิลด์อื่น; `/chat/test` ยังรับเฉพาะ message และปฏิเสธ location

AI ส่ง location ไป `POST /recommendations/candidates` โดยตรง ไม่ส่งพิกัดเข้า prompt หรือรับพิกัดจาก tool arguments Backend ใช้ SQL ของ `GET /stores` ร่วมกันกรองร้านในระยะก่อนจัดอันดับ 3+2 โดยไม่จำกัดแค่หน้าแรก พิกัดตัวอย่างต้องเปลี่ยนเป็นจุดที่ผู้ใช้เลือกเอง ไม่มีการขอ GPS หรือขยายรัศมีอัตโนมัติ ข้อผิดพลาดใช้ FastAPI `detail` ตาม [contract](../docs/api-contract.md) Postman อยู่ใน `apps/api/postman/THAI-Please.postman_collection.json` หมวด **AI service (Qwen3 4B)** ใช้ตัวแปร `aiBaseUrl` แยกจาก NestJS และตัวแปร `recommendationLatitude/recommendationLongitude/recommendationRadiusKm` สำหรับแนะนำร้าน

ใน Postman ตั้ง `baseUrl` เป็น NestJS, `aiBaseUrl` เป็น `http://127.0.0.1:8000`, `aiModel` ให้ตรงกับ OLLAMA_MODEL แล้ว Login CUSTOMER เพื่อบันทึกตัวแปร `token`. หมวด AI มี chat/recommend/auth/validation/provider cases; หมวด Recommendation read tools มี context/candidates/auth/filter cases ใช้ `categoryId` จาก List shop categories. Provider error scenarios ต้องมี Backend/context ที่พร้อมและตั้ง model server ตามคำอธิบายแต่ละ request

## ทดสอบโมเดลโดยไม่แนบ Token

เปิด Ollama และ FastAPI ตามคำสั่งด้านบน แล้วเลือก `POST /chat/test` ใน [Swagger](http://127.0.0.1:8000/docs) → **Try it out** ได้ทันที ไม่ต้องกด Authorize. ใช้ body `{ "message": "..." }` และ response แบบเดียวกับ `/chat`: `reply`, `storeIds: []`, `sources`, `mode`, `model`

ตัวอย่าง PowerShell โดยไม่มี Authorization header:

```powershell
$body = @{ message = "สวัสดี คุณช่วยเรื่องอะไรได้บ้าง" } | ConvertTo-Json
Invoke-RestMethod -Uri http://127.0.0.1:8000/chat/test -Method Post -ContentType "application/json; charset=utf-8" -Body ([System.Text.Encoding]::UTF8.GetBytes($body))
```

เปลี่ยน `message` เพื่อทดสอบ:

| กรณี                | message                                                | ผลที่คาดหวัง                                      |
| ------------------- | ------------------------------------------------------ | ------------------------------------------------- |
| ถามปกติ             | สวัสดี คุณช่วยเรื่องอะไรได้บ้าง                        | ตอบในขอบเขตระบบ; sources ว่าง                     |
| Search              | ช่วยค้นข้อมูลโครงการคนละครึ่งจากแหล่งข้อมูลทางการหน่อย | สรุปพร้อม sources/ลิงก์; ถ้าค้นไม่ได้แจ้งข้อจำกัด |
| นอกเรื่อง           | หมาผมน่ารักไหม                                         | แจ้งขอบเขตอย่างสุภาพ; sources ว่าง                |
| ขอร้านผ่านเส้นทดสอบ | ช่วยแนะนำร้านอาหารหน่อย                                | แจ้งให้ใช้ /chat พร้อม CUSTOMER token; ไม่ค้นร้าน |

ไม่มีข้อมูลผู้ใช้ ประวัติซื้อ หรือประเภทของร้านส่งให้โมเดลในเส้นนี้ และไม่มี Backend dependency. ใช้ได้เฉพาะ Search tool เดิมไม่เกินหนึ่งครั้ง/สอง inference calls; ใช้ WEB_SEARCH_* และ guard/แหล่งอ้างอิงเดิม. หากโมเดลพยายามเรียก shop tool จะได้502 ก่อนค้นข้อมูล. Input validation และ model errors502/503/504 เหมือน `/chat`; ไม่ต้องแนบ token แม้ Search. เส้นนี้ใช้ทดลองบน local loopback; `/chat` ยังต้องใช้ token ตามเดิม

Postman มีหมวด **AI service (Qwen3 4B) → Token-free model test (/chat/test)** ตั้ง Authorization เป็น **No Auth** ทุก request. ไม่ต้อง Login CUSTOMER สำหรับหมวดนี้

## ตัวอย่างคำถามครบ 4 รูปแบบ

กรณี 1/3/4 ใช้ body มีเฉพาะ `message` และทดสอบได้ด้วย `POST /chat/test` โดยไม่แนบ token; กรณี 2 และคำถามที่รวมแนะนำร้านต้องใช้ `POST /chat` พร้อม CUSTOMER Bearer token และ `location` ตามตัวอย่าง. ทุกกรณียังใช้ `/chat` แบบมี token ได้ตามเดิม. คัดลอก JSON ไปใช้ใน Swagger ได้ ข้อความตอบขึ้นกับโมเดลและข้อมูลจริง; รหัสร้านในตัวอย่างเป็นสมมติ ไม่มีการรับรองเงื่อนไขโครงการจากตัวอย่างเหล่านี้

### 1. ถามอย่างเดียว ไม่แนะนำร้าน

```json
{ "message": "สวัสดี คุณช่วยเรื่องอะไรในระบบ THAI Please ได้บ้าง" }
```

ตัวอย่างอื่น: “การแนะนำร้านของระบบเลือกจากอะไร”, “ระบบรู้ไหมว่าฉันเคยซื้อสินค้าชิ้นไหน”. ตอบอธิบายขอบเขตตามข้อมูลที่มี ไม่ค้นร้านอัตโนมัติ เช่น “ผมช่วยแนะนำร้านตามประเภทและประวัติร้านที่เคยซื้อได้ครับ”. `storeIds: []`, `sources: []`; ไม่ใช้ tool

### 2. ถามและขอแนะนำร้าน

```json
{
  "message": "คุณช่วยอะไรได้บ้าง แล้วช่วยแนะนำร้านกินข้าวหรือดื่มกาแฟให้หน่อย",
  "location": { "latitude": 13.75, "longitude": 100.5, "radiusKm": 5 }
}
```

ตัวอย่างอื่น: “วันนี้อยากกินก๋วยเตี๋ยว ช่วยแนะนำร้านหน่อย”, “แนะนำร้านอาหารกับร้านเครื่องดื่มให้หน่อย”. โมเดลเทียบความหมายกับประเภทจริง เรียก `search_system_shops` และตอบพร้อม `storeIds` จาก Backend

```json
{
  "reply": "ผมช่วยตอบเรื่องระบบและแนะนำร้านได้ครับ พบร้านใหม่ 3 ร้านและร้านที่เคยซื้อ 2 ร้านครับ",
  "storeIds": ["101", "205", "310", "411", "512"],
  "sources": [],
  "mode": "model",
  "model": "qwen3:4b"
}
```

Frontend นำ IDs ไปสร้างการ์ดเอง ไม่คืนชื่อร้านหรือรายละเอียดร้านใน payload แนะนำ

### 3. ใช้ Search อินเทอร์เน็ต

```json
{ "message": "ช่วยค้นข้อมูลโครงการคนละครึ่งจากแหล่งข้อมูลทางการหน่อย" }
```

ตัวอย่างอื่น: “ค้นเงื่อนไขโครงการไทยพลัสล่าสุดจากเว็บทางการให้หน่อย”, “พร้อมเพย์คืออะไร ช่วยค้นจากธนาคารแห่งประเทศไทย”. โมเดลเรียก `search_related_web` แล้วสรุปจาก snippets พร้อมอ้างอิง `[1]` และลิงก์ทางการใน `reply`; `storeIds: []`, `sources: [{"title":"ชื่อบทความจริงที่ค้นพบ","url":"https://..."}]`. title/URL ต้องมาจากผลค้นจริง รูปแบบนี้แสดงโครงสร้าง ไม่ใช่ผลค้นสำเร็จที่รับประกันทุกคำถาม

ถามสองอย่างพร้อมกันได้:

```json
{
  "message": "ช่วยค้นข้อมูลโครงการคนละครึ่งจากเว็บทางการ แล้วแนะนำร้านอาหารในระบบด้วย"
}
```

ใช้ทั้งสอง tool อย่างละไม่เกินหนึ่งครั้ง ตอบพร้อม `sources` และ `storeIds`. ร้าน/Coins ยังค้นจาก Backend เท่านั้น ไม่ใช้ร้านจากอินเทอร์เน็ต

### 4. ถามนอกเรื่อง

```json
{ "message": "หมาผมน่ารักไหม" }
```

ตัวอย่างอื่น: “ช่วยแต่งเพลงรักให้หน่อย”, “ฟุตบอลคืนนี้ใครจะชนะ”. ตอบขอบเขตอย่างสุภาพ เช่น “ผมช่วยเรื่อง THAI Please การใช้จ่ายและแนะนำร้านในระบบครับ คำถามนี้อยู่นอกขอบเขตที่ช่วยได้”. ไม่ใช้ tool; `storeIds: []`, `sources: []`

### กรณีข้อมูลไม่ครบหรือระบบค้นไม่ได้

| คำถาม/สถานการณ์                                        | พฤติกรรมที่คาดหวัง                                                            |
| ------------------------------------------------------ | ----------------------------------------------------------------------------- |
| “แนะนำร้านหน่อย” และไม่มีประวัติ                       | ถามประเภทเพิ่มเติม ไม่สุ่มประเภท                                              |
| “แนะนำร้านอาหาร” แต่ตรงโควตาเพียง 2 ใหม่ + 1 เดิม      | คืน 3 IDs ไม่เติมข้ามโควตา                                                    |
| ไม่มีร้านตรงประเภท/ไม่มีประเภทที่รองรับ                | แจ้งข้อจำกัดหรือถามเพิ่ม; IDs ว่าง                                            |
| “ตอนนี้ฉันเหลือเงินเท่าไร”                             | แจ้งว่ายังไม่มีเครื่องมืออ่านยอด ไม่เดายอด                                    |
| Search ปิด/timeout/ถูกจำกัด/ไม่มีแหล่งทางการ           | ตอบข้อจำกัด `sources: []` ไม่แต่งเงื่อนไข หากถามร้านด้วยยังคืน IDs ที่ค้นได้  |
| คำถามหรือคำค้นเว็บมี email/เลขบัญชี/เบอร์โทร/token/URL | บล็อก outbound search และขอคำถามข้อมูลสาธารณะ ไม่ส่งข้อมูลเหล่านี้ไป provider |
| /chat ไม่มี token/ผิดบทบาท                             | 401/403 ก่อนเรียกโมเดลและ Search; /chat/test ไม่ต้องใช้ token                 |

## ขอบเขต Search และการตั้งค่า

ติดตั้งจาก `requirements.lock.txt` จะได้ [DDGS](https://github.com/deedy5/ddgs) และ dependencies ที่ pin ไว้แล้ว ไม่ต้องเพิ่ม API key. ถ้ามี `.venv` เดิม ให้รันคำสั่ง pip install เดิมอีกครั้งหลังดึงโค้ดนี้ และเพิ่มตัวแปร WEB_SEARCH ใน `.env` หากต้องการเปลี่ยนค่าเริ่มต้น

Search ใช้เฉพาะเรื่องโครงการรัฐช่วยใช้จ่ายและการชำระเงินดิจิทัลที่มีคำระบุในขอบเขต เช่น คนละครึ่ง/ไทยพลัส/พร้อมเพย์. Server ตรวจทั้งข้อความและคำค้น; lexical guard ยังไม่ครอบคลุมทุกการสะกดหรือทุกเจตนา. ใช้ DDGS เรียก DuckDuckGo แล้ว Yahoo สำรองได้สูงสุดสองครั้ง ด้วยคำค้นเดิมที่จำกัดโดเมน. ผลที่คืนต้องเป็น HTTPS จาก `*.go.th`, `bot.or.th` หรือ `krungthai.com` รวม subdomains; ไม่เปิด URL arbitrary และไม่ดึงหน้าเว็บเต็ม

โมเดลรับเฉพาะ title/snippet/reference ของผลค้น ไม่มี token/profile/history ถูกส่งให้ provider. Server สร้างลิงก์จากผลที่ตรวจแล้ว หากโมเดลสร้าง URL หรือเลขอ้างอิงผิด จะคืนข้อความให้เปิดแหล่งข้อมูลแทน. การตรวจนี้ยืนยันลิงก์และเลขอ้างอิง ไม่รับรองว่าทุกข้อความสรุปถูกต้องหรือเป็นข้อมูลล่าสุด ต้องประเมิน grounding เพิ่ม

จำกัด Search พร้อมกัน 2 งานต่อ process ไม่มี queue ไม่จำกัด; ตั้ง timeout รวมและจำนวนแหล่งด้วย WEB_SEARCH_* ข้างต้น. DDGS แบบไม่ใช้ key อาจพบ rate limit/challenge หรือผลค้นเก่าได้ จึงไม่รับประกัน availability. ไม่มี endpoint `/search` แยก ให้เรียกผ่าน `/chat`. รวมหนึ่งคำขอได้ไม่เกินสอง tool reads และสาม inference calls; timeout Ollama เป็นต่อ inference call

## ไฟล์และจุดต่อยอด

- `main.py`: app, lifespan, health และ router registration
- `router/chat.py`: POST /chat และ /chat/test, การแปลง provider error เป็น HTTP status
- `schemas/chat.py`: request/response validation
- `config.py` / `.env.example`: model/Backend URLs และ timeouts
- `services/backend.py`: ตรวจ DTO และส่ง token ให้ Backend read APIs; ไม่ส่ง credential เข้า prompt
- `services/web_search.py`: DDGS, public-scope guard, worker/timeout limits, official sources และ server-rendered citation links
- `services/llm.py`: async HTTP adapter เรียก Ollama `/api/chat` ด้วย `stream:false`, `think:false` และคืนข้อความคำตอบสุดท้ายจาก `message.content`; แยก inline thinking ของบาง template และปฏิเสธคำตอบที่ยังคิดไม่จบ/ไม่มีข้อความสุดท้าย
- `prompts/system.py`: system prompt ที่ส่งให้โมเดลทุก request
- `tests/test_api.py`, `tests/test_recommendations.py`: HTTP/provider/auth/tool regression ด้วย mock transports
- `tests/smoke_ollama.py`: smoke กับโมเดลจริงและ Backend fixture; ไม่ใช่ live DB E2E
- `tests/test_web_search.py`: Search, mixed tools, privacy/scope/citations/error/worker-limit regression
- `tests/test_chat_test.py`: token-free HTTP/auth separation, no Backend/shop tools, validation/Search/error checks
- `tests/smoke_chat_test.py`: /chat/test HTTP กับ Qwen/DDGS จริง ไม่ใช้ token/Backend
- `tests/smoke_web_search.py`: opt-in DDGS จริงและ Qwen + DDGS ด้วย fixture context
- `requirements.txt`: ขอบเขตเวอร์ชัน runtime; `requirements.lock.txt`: เวอร์ชัน dependencies ที่ทดสอบจริง

แต่ละ request ยังไม่มีประวัติบทสนทนา แต่มีประวัติซื้อจาก Backend สูงสุด 20 ร้านล่าสุดสำหรับบริบทโมเดล การตรวจเคยซื้อใช้ประวัติทุกเดือนรวมร้านที่ซื้อสำเร็จแล้วคืนเงิน ไม่ขึ้นกับข้อจำกัด 20 ร้านนี้. ไม่มีรายละเอียดสินค้าใน purchase schema จึงรู้เฉพาะร้าน/ประเภท/จำนวนครั้ง/วันที่ ไม่รู้ว่าซื้อสินค้าชิ้นใด. ยังไม่กรองระยะทาง ราคา หรือสินค้าเฉพาะ

System prompt มี `/no_think` ตาม [คำแนะนำของ Qwen3](https://huggingface.co/Qwen/Qwen3-4B) ร่วมกับ `think:false` เนื่องจาก template ที่ดาวน์โหลดอาจยังส่ง thinking ปนใน content ตัว adapter จึงตัดส่วนก่อน `</think>` ออกด้วยและไม่คืน `message.thinking` ให้ frontend

ผลทดสอบก่อนเพิ่ม CUDA บนเครื่องนี้วันที่ 12 ต.ค. 2569: Ollama 0.40.3 + `qwen3:4b` ทำงานแบบ CPU ผ่าน FastAPI `/chat` ได้ 200 พร้อมข้อความภาษาไทยและไม่มี thinking tags ใช้เวลาประมาณ 70 วินาทีสำหรับคำทักทายหนึ่งครั้ง เวลานี้เป็นตัวอย่างการรันจริง ไม่ใช่ผล benchmark; timeout เริ่มต้น 120 วินาทีอาจไม่พอสำหรับคำตอบยาว ยังไม่ได้ประเมิน intent/recommendation หรือความถูกต้องของข้อมูลระบบครบชุด

ผลล่าสุดหลังเพิ่ม CUDA 13: Qwen3 4B offload 37/37 layers ตาม server log ไป RTX 3050; `ollama ps` แสดง `100% GPU`, `/api/ps` รายงาน model size/size_vram เท่ากันประมาณ 3.2 GB. ทดสอบ FastAPI/Uvicorn `/chat` จริงได้ 200 ใน 101.55 วินาทีรวมโหลดและ warm-up ครั้งแรก; ส่งคำทักทายเดิมผ่าน FastAPI TestClient โดยใช้ Ollama จริงและไม่ override dependency หลังโมเดลโหลดแล้วได้ 200 ใน 9.17 วินาที ทั้งสองครั้งตอบภาษาไทย ไม่มี thinking tags. เป็น smoke tests สองคำขอ ไม่ใช่ benchmark หรือการรับประกันเวลา; GPU warm-up ครั้งแรกอาจใช้เวลานาน คง Ollama background server ไว้และหยุดเฉพาะ Uvicorn ชั่วคราวที่ใช้ทดสอบแล้ว

สรุป Backend API/Token/Auth อยู่ใน [DESIGN.md](DESIGN.md). `/chat` ตรวจ token ผ่าน authenticated context ซึ่ง Backend เรียก AuthService.me ก่อนอ่านประวัติ ไม่ต้องเรียก `/me` ซ้ำอีกครั้ง

เว็บและ AI รันบนเครื่องนี้ทั้งคู่ แต่ Next chat proxy/UI ยังไม่ได้ต่อ. ขั้นต่อไปให้ Next.js อ่าน HttpOnly cookie ฝั่ง server แล้วส่ง Bearer ไป AI ผ่าน loopback8000; AI เรียก Ollama loopback11434 และ Backend ตาม BACKEND_BASE_URL. ห้ามให้โมเดลหรือ request body ระบุ URL/actor เอง

## ตรวจงาน

จากโฟลเดอร์ `ai-service` ไม่ต้องเปิด Uvicorn ก่อนรัน tests:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
.\.venv\Scripts\python.exe -m pip check
.\.venv\Scripts\python.exe -m black --workers 1 --no-cache main.py config.py router schemas services prompts tests
.\.venv\Scripts\python.exe -m black --workers 1 --no-cache --check main.py config.py router schemas services prompts tests
# ต้องมี Ollama จริง; Backend เป็น fixture ไม่ใช้ประวัติผู้ใช้จริง
.\.venv\Scripts\python.exe -X utf8 tests/smoke_ollama.py
# ต้องใช้อินเทอร์เน็ต; ค้นข้อมูลสาธารณะ ไม่ใช้ข้อมูลผู้ใช้จริง
.\.venv\Scripts\python.exe -X utf8 tests/smoke_web_search.py
# ใช้ Qwen + DDGS จริง; Backend เป็น fixture
.\.venv\Scripts\python.exe -X utf8 tests/smoke_web_search.py --model
# ทดสอบ HTTP /chat/test กับ Qwen/DDGS จริง ไม่ต้องมี token หรือ Backend
.\.venv\Scripts\python.exe -X utf8 tests/smoke_chat_test.py
```

จาก repo root ตรวจ Backend ด้วย `pnpm --filter api lint`, `pnpm --filter api test`, `pnpm --filter api build`. SQL integration opt-in ใช้ development DATABASE_URL ที่มี master categories อย่างน้อยสองประเภท: `cd apps/api`, ตั้ง `$env:RECOMMENDATION_DB_TEST="1"` แล้ว `pnpm exec vitest run src/recommendations/recommendations.database.spec.ts`. Test สร้างเฉพาะ TEMP tables ใน transaction ไม่แก้ business tables จริง. รอบนี้ tests ปกติและ Qwen smoke ใช้ fixtures; live SQL/E2E ต้องรอ DATABASE_URL ที่พร้อม

ผลตรวจ Search วันที่ 12 ต.ค. 2569: unit tests 42 กรณีผ่าน (รวม mixed tools, failure/privacy/citations/worker bounds), `pip check` ผ่าน. Real Qwen smoke ผ่านทักทาย/ร้านอาหารหรือคาเฟ่/นอกเรื่อง; Qwen + DDGS จริงคืน 3 แหล่งทางการและไม่มี storeIds ในคำถามค้นเว็บ ผ่านรอบสุดท้ายประมาณ 24 วินาที. ช่วงแรกพบ challenge202/rate-limit429 และ DDGS multi-backend ไม่คืนผล จึงใช้ DuckDuckGo แล้ว Yahoo แยก attempts. ผลค้นมีประกาศหลายปี จึงเพิ่มข้อกำกับวันที่; smoke ยืนยันการเชื่อมต่อและรูปแบบ ไม่ใช่ full factual/freshness evaluation หรือ live Backend DB E2E. Postman ตรวจ JSON/scripts syntax; ยังไม่ได้รัน collection runner กับ Backend จริง

Prettier ไม่รองรับ Python ในการตั้งค่าปัจจุบัน จึงใช้ Black สำหรับ `.py` และ Prettier ของ package API สำหรับ Markdown/JSON ที่แก้ เอกสารอ้างอิง: [Ollama chat API](https://docs.ollama.com/api/chat), [Thinking controls](https://docs.ollama.com/capabilities/thinking), [TestClient](https://fastapi.tiangolo.com/tutorial/testing/)

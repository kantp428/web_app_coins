# AI chatbot service

FastAPI chatbot ใช้ Python 3.12+ เชื่อม **Qwen3 4B ผ่าน Ollama native API** แยกจาก NestJS และ pnpm workspace การเรียก `/chat` ใช้โมเดลจริง ไม่มี mock fallback ส่วนแนะนำร้าน/Tool Calling/Database Filtering/Search ยังเป็น [แบบสำหรับคุยก่อน implement](DESIGN.md)

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

รอบนี้เตรียม [Ollama standalone สำหรับ Windows](https://docs.ollama.com/windows) เวอร์ชัน 0.40.3 แบบ CPU ไว้ใน `ai-service/.tools/ollama/` และเก็บ weights ใน `ai-service/.tools/ollama-models/` ทั้งสองอยู่ใน ignored directory และไม่ได้เพิ่ม executable เข้า PATH จึงใช้คำสั่งเต็มด้านล่างแทน `ollama` บนเครื่องนี้ ไฟล์เหล่านี้ไม่ติดไปกับการ clone repository

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
& .\ai-service\.tools\ollama\ollama.exe serve
```

คง terminal นี้ไว้ระหว่างใช้งานและกด `Ctrl+C` เพื่อหยุด ห้ามเปิด `serve` ซ้ำเมื่อ port 11434 มี server อยู่แล้ว หากยังไม่มีโมเดล ใช้ `& .\ai-service\.tools\ollama\ollama.exe pull qwen3:4b` หลังเปิด server

### เปิด FastAPI

```powershell
cd ai-service
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.lock.txt
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --env-file .env --host 127.0.0.1 --port 8000
```

หากมี `.venv` แล้ว ข้ามคำสั่งสร้าง environment ได้ ใช้ Python จาก `.venv` โดยตรงโดยไม่ต้อง activate คง terminal ที่รัน Uvicorn ไว้ระหว่างทดสอบ และกด `Ctrl+C` เพื่อหยุด service

| Environment              | ค่าเริ่มต้น              | ความหมาย                                                               |
| ------------------------ | ------------------------ | ---------------------------------------------------------------------- |
| `OLLAMA_BASE_URL`        | `http://127.0.0.1:11434` | URL server Ollama ไม่รวม `/api`                                        |
| `OLLAMA_MODEL`           | `qwen3:4b`               | ชื่อ model tag ที่ server มี                                           |
| `OLLAMA_TIMEOUT_SECONDS` | `120`                    | HTTP timeout มากกว่า 0 และไม่เกิน 600 วินาที; connect timeout 5 วินาที |

ต้อง restart service หลังเปลี่ยน environment การใช้ `.env` ต้องมี `--env-file .env` ตามคำสั่งด้านบน ค่าที่ตั้งใน process environment มีลำดับก่อน `.env` ตัว service ใช้ local server เป็นค่าเริ่มต้นและไม่มี API key ในการตั้งค่าปัจจุบัน

เปิด [Swagger UI](http://127.0.0.1:8000/docs) แล้วเลือก `POST /chat` → **Try it out** → **Execute** หรือทดสอบจาก PowerShell อีกหน้าต่าง:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/health

$body = @{ message = "สวัสดี คุณช่วยเรื่องอะไรได้บ้าง" } | ConvertTo-Json
Invoke-RestMethod -Uri http://127.0.0.1:8000/chat -Method Post -ContentType "application/json; charset=utf-8" -Body ([System.Text.Encoding]::UTF8.GetBytes($body))
```

ตัวอย่างรูปแบบคำตอบ (ข้อความจริงขึ้นอยู่กับโมเดล):

```json
{
  "reply": "สวัสดีครับ ผมช่วยตอบคำถามเกี่ยวกับ THAI Please และการใช้จ่ายได้ครับ",
  "mode": "model",
  "model": "qwen3:4b"
}
```

| Route               | ผลลัพธ์                                                                |
| ------------------- | ---------------------------------------------------------------------- |
| `GET /health`       | 200 พร้อม `status`, `service`, `mode`                                  |
| `POST /chat`        | 200 พร้อม `reply`, `mode`, `model`; 422 เมื่อ input ไม่ผ่าน validation |
| `GET /docs`         | Swagger UI                                                             |
| `GET /openapi.json` | API schema                                                             |

`/health` ตรวจเฉพาะ app liveness; `mode: "model"` หมายถึงโหมดที่ตั้งไว้ ไม่ยืนยันว่า Ollama หรือโมเดลพร้อมใช้งาน คง `/test` เป็น alias ของ health ตามโค้ดล่าสุด โดยไม่แสดงซ้ำใน Swagger

ข้อผิดพลาดจากโมเดลตอบเป็น `{ "detail": "..." }`: 503 เชื่อมต่อ Ollama ไม่ได้/ไม่พบโมเดลหรือ endpoint, 504 model timeout, 502 upstream error/คำตอบผิดรูปแบบหรือว่าง ไม่มีการเปลี่ยนเป็นคำตอบ mock เมื่อโมเดลล่ม

`message` ต้องเป็น string หลัง trim ยาว 1–2000 ตัวอักษร; ไม่รับฟิลด์อื่น ข้อผิดพลาดใช้ FastAPI `detail` ตาม [contract](../docs/api-contract.md) Postman อยู่ใน `apps/api/postman/THAI-Please.postman_collection.json` หมวด **AI service (Qwen3 4B)** ใช้ตัวแปร `aiBaseUrl` แยกจาก NestJS

ใน Postman ให้ import collection แล้วตั้ง collection variable `aiBaseUrl` เป็น `http://127.0.0.1:8000` และ `aiModel` ให้ตรงกับ OLLAMA_MODEL มี requests สำหรับ health/chat/docs/schema, validation และ provider error กรณี success ต้องมี model server ที่พร้อม; error scenarios ให้ตั้ง server จำลองตามคำอธิบายแต่ละ request และส่งเฉพาะ request นั้น ทดสอบทุก error แบบอัตโนมัติได้ผ่าน unit tests

## ไฟล์และจุดต่อยอด

- `main.py`: app, lifespan, health และ router registration
- `router/chat.py`: POST /chat และการแปลง provider error เป็น HTTP status
- `schemas/chat.py`: request/response validation
- `config.py` / `.env.example`: model server, model tag และ timeout
- `services/llm.py`: async HTTP adapter เรียก Ollama `/api/chat` ด้วย `stream:false`, `think:false` และคืนข้อความคำตอบสุดท้ายจาก `message.content`; แยก inline thinking ของบาง template และปฏิเสธคำตอบที่ยังคิดไม่จบ/ไม่มีข้อความสุดท้าย
- `prompts/system.py`: system prompt ที่ส่งให้โมเดลทุก request
- `tests/test_api.py`: ตรวจ HTTP contract และ adapter ด้วย mock transport; ไม่ต้องมี model server
- `requirements.txt`: ขอบเขตเวอร์ชัน runtime; `requirements.lock.txt`: เวอร์ชัน dependencies ที่ทดสอบจริง

แต่ละ request ทำงานอิสระ ไม่มี memory/history/auth/ข้อมูลร้าน/Coins และยังไม่เรียก Search หรือ DB tools ข้อความจะส่งไปยัง model server ที่ตั้งค่าไว้ prompt กำหนดขอบเขตเรื่องระบบ/การใช้จ่ายและให้แจ้งเมื่อไม่มีข้อมูล แต่การทำงานตาม prompt ยังต้องประเมินกับโมเดลจริง การต่อเว็บ/NestJS และสิทธิ์เข้าถึง service ต้องกำหนดก่อน integration ตาม [decisions](../docs/decisions.md)

System prompt มี `/no_think` ตาม [คำแนะนำของ Qwen3](https://huggingface.co/Qwen/Qwen3-4B) ร่วมกับ `think:false` เนื่องจาก template ที่ดาวน์โหลดอาจยังส่ง thinking ปนใน content ตัว adapter จึงตัดส่วนก่อน `</think>` ออกด้วยและไม่คืน `message.thinking` ให้ frontend

ผลทดสอบบนเครื่องนี้วันที่ 12 ต.ค. 2569: Ollama 0.40.3 + `qwen3:4b` ทำงานแบบ CPU ผ่าน FastAPI `/chat` ได้ 200 พร้อมข้อความภาษาไทยและไม่มี thinking tags ใช้เวลาประมาณ 70 วินาทีสำหรับคำทักทายหนึ่งครั้ง เวลานี้เป็นตัวอย่างการรันจริง ไม่ใช่ผล benchmark; timeout เริ่มต้น 120 วินาทีอาจไม่พอสำหรับคำตอบยาว ยังไม่ได้ประเมิน intent/recommendation หรือความถูกต้องของข้อมูลระบบครบชุด

## ตรวจงาน

จากโฟลเดอร์ `ai-service` ไม่ต้องเปิด Uvicorn ก่อนรัน tests:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
.\.venv\Scripts\python.exe -m pip check
.\.venv\Scripts\python.exe -m black --workers 1 --no-cache main.py config.py router/chat.py schemas/chat.py services/llm.py prompts/system.py tests/test_api.py
.\.venv\Scripts\python.exe -m black --workers 1 --no-cache --check main.py config.py router/chat.py schemas/chat.py services/llm.py prompts/system.py tests/test_api.py
```

Prettier ไม่รองรับ Python ในการตั้งค่าปัจจุบัน จึงใช้ Black สำหรับ `.py` และ Prettier ของ package API สำหรับ Markdown/JSON ที่แก้ เอกสารอ้างอิง: [Ollama chat API](https://docs.ollama.com/api/chat), [Thinking controls](https://docs.ollama.com/capabilities/thinking), [TestClient](https://fastapi.tiangolo.com/tutorial/testing/)

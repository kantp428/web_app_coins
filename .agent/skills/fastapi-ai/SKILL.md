---
name: fastapi-ai
description: Create or change the standalone Python FastAPI chatbot API, reply adapter, prompts and tests under ai-service. Use nest-api for NestJS business endpoints.
---

# FastAPI AI service

Read `PLAN/PLAN.md`, `PLAN/AI_DEV.md`, `PLAN/INTEGRATION.md`, `docs/api-contract.md` and the relevant decisions before changing the service. The user selected a standalone `ai-service/`; this extends the AI file scope beyond the original NestJS plan.

- `main.py` owns app/lifespan/health; `router/chat.py` owns chat; `schemas/chat.py` owns Pydantic v2 contracts. Preserve the user's package separation. `services/llm.py` owns the async Ollama adapter and `prompts/system.py` provides the system prompt sent to the model.
- `/chat` is stateless, local development only and returns `{reply, mode:"model", model}` from Qwen3 4B. Do not fall back to fabricated mock replies or invent shops/Coins/financial actions. Intent routing, tools, DB filters and Search are discussion-only in `ai-service/DESIGN.md`; retained history and authenticated NestJS integration remain pending.
- Use Python 3.12+ and the local `.venv`. Install `requirements.lock.txt`, copy `.env.example` without overwriting local config, then run `.venv/Scripts/python.exe -m uvicorn main:app --reload --env-file .env --host 127.0.0.1 --port 8000`. Ollama must separately serve `qwen3:4b`; OLLAMA_BASE_URL/MODEL/TIMEOUT_SECONDS configure the adapter. Keep runtime constraints, dependency lock and separate developer requirements aligned. Do not install a system runtime or download model weights implicitly.
- Install `requirements-dev.txt` to run `.venv/Scripts/python.exe -m unittest discover -s tests -v`. Check success/validation, Thai text and OpenAPI routes without requiring a provider or DB. Use Black write/check for edited Python; use installed API package Prettier write/check for supported Markdown/JSON. Preserve existing formatter configuration.
- Update `docs/api-contract.md` and the existing shared Postman collection for API changes; use `aiBaseUrl` rather than the NestJS `baseUrl`. Append actual checks/limitations and the next step to the shared plan; scaffold checks do not complete F07 recommendation acceptance.
- Keep `ai-service/README.md` current in every task that changes installation, dependencies, startup/shutdown, port/configuration, API testing or automated checks. This service has its own README, so do not duplicate its usage instructions in root `Test.md`. Keep examples aligned with the contract and Postman, as required by `AGENTS.md`.

Example: “Extend the Qwen3 connection in ai-service with transport tests and matching API docs/Postman; leave proposed recommendation tools unimplemented until agreed.”

See `ai-service/README.md` for commands and `docs/decisions.md` for unresolved integration rules.

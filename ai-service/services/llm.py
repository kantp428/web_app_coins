"""Async Ollama adapter. No tools, database retrieval or mock fallback yet."""

from collections.abc import AsyncIterator

import httpx

from config import get_settings
from prompts.system import SYSTEM_PROMPT


class LLMServiceError(Exception):
    def __init__(self, status_code: int, detail: str):
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


class LLMService:
    def __init__(self, client: httpx.AsyncClient, model: str):
        self.client = client
        self.model = model

    async def generate_reply(self, message: str) -> str:
        try:
            response = await self.client.post(
                "api/chat",
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": message},
                    ],
                    "stream": False,
                    "think": False,
                },
            )
        except httpx.TimeoutException as error:
            raise LLMServiceError(504, "โมเดลตอบกลับไม่ทันเวลาที่กำหนด") from error
        except httpx.RequestError as error:
            raise LLMServiceError(
                503, "เชื่อมต่อ Ollama ไม่ได้ กรุณาตรวจสอบ model server"
            ) from error

        if response.status_code == 404:
            raise LLMServiceError(
                503, "ไม่พบโมเดลหรือ endpoint กรุณาตรวจสอบ Ollama และดาวน์โหลดโมเดลก่อน"
            )
        if not response.is_success:
            raise LLMServiceError(502, "Model server ตอบกลับด้วยข้อผิดพลาด")

        try:
            body = response.json()
            assistant = body["message"]
            content = assistant["content"]
            if (
                body.get("done") is not True
                or body.get("done_reason") == "length"
                or assistant.get("role") != "assistant"
                or not isinstance(content, str)
                or not content.strip()
            ):
                raise ValueError("Invalid final assistant message")
            # Some Qwen templates prefill <think> and put the closing tag in
            # content instead of separating message.thinking. Keep only the
            # final answer; incomplete thinking must never become a reply.
            if "</think>" in content:
                content = content.rsplit("</think>", 1)[1]
            if "<think>" in content or not content.strip():
                raise ValueError("Missing final answer after thinking")
        except (ValueError, KeyError, TypeError, AttributeError) as error:
            raise LLMServiceError(
                502, "Model server ส่งคำตอบที่ไม่ถูกต้องหรือว่างเปล่า"
            ) from error

        return content.strip()


async def get_llm_service() -> AsyncIterator[LLMService]:
    settings = get_settings()
    timeout = httpx.Timeout(settings.ollama_timeout_seconds, connect=5)
    async with httpx.AsyncClient(
        base_url=str(settings.ollama_base_url).rstrip("/") + "/",
        timeout=timeout,
        trust_env=False,
        follow_redirects=False,
    ) as client:
        yield LLMService(client, settings.ollama_model)

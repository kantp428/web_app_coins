"""Request and response contracts for the development API."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    message: str = Field(
        min_length=1,
        max_length=2000,
        strict=True,
        description="ข้อความที่ต้องการส่งให้ chatbot",
        examples=["สวัสดี ช่วยแนะนำร้านอาหารหน่อย"],
    )


class Source(BaseModel):
    title: str
    url: str


class ChatResponse(BaseModel):
    reply: str
    storeIds: list[str] = Field(default_factory=list, max_length=5)
    sources: list[Source] = Field(default_factory=list, max_length=5)
    mode: Literal["model"] = "model"
    model: str


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    service: Literal["ai-service"] = "ai-service"
    mode: Literal["model"] = "model"

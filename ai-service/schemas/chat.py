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


class StoreLocation(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    latitude: float = Field(ge=-90, le=90, allow_inf_nan=False)
    longitude: float = Field(ge=-180, le=180, allow_inf_nan=False)
    radiusKm: float = Field(default=5, ge=0.1, le=50, allow_inf_nan=False)


class RecommendationChatRequest(ChatRequest):
    location: StoreLocation | None = None


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

"""Server-only model connection settings, loaded from environment variables."""

import os
from functools import lru_cache

from pydantic import BaseModel, Field, HttpUrl


class Settings(BaseModel):
    ollama_base_url: HttpUrl = HttpUrl("http://127.0.0.1:11434")
    ollama_model: str = Field(default="qwen3:4b", min_length=1, max_length=200)
    ollama_timeout_seconds: float = Field(
        default=120, gt=0, le=600, allow_inf_nan=False
    )


@lru_cache
def get_settings() -> Settings:
    return Settings(
        ollama_base_url=os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434"),
        ollama_model=os.getenv("OLLAMA_MODEL", "qwen3:4b").strip(),
        ollama_timeout_seconds=os.getenv("OLLAMA_TIMEOUT_SECONDS", "120"),
    )

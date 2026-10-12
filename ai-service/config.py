"""Server-only model connection settings, loaded from environment variables."""

import os
from functools import lru_cache

from pydantic import BaseModel, Field, HttpUrl


class Settings(BaseModel):
    web_search_enabled: bool = True
    web_search_timeout_seconds: int = Field(default=15, ge=1, le=30)
    web_search_max_results: int = Field(default=3, ge=1, le=5)
    backend_base_url: HttpUrl = HttpUrl("http://127.0.0.1:3000")
    backend_timeout_seconds: float = Field(
        default=15, gt=0, le=120, allow_inf_nan=False
    )
    ollama_base_url: HttpUrl = HttpUrl("http://127.0.0.1:11434")
    ollama_model: str = Field(default="qwen3:4b", min_length=1, max_length=200)
    ollama_timeout_seconds: float = Field(
        default=120, gt=0, le=600, allow_inf_nan=False
    )


@lru_cache
def get_settings() -> Settings:
    return Settings(
        web_search_enabled=os.getenv("WEB_SEARCH_ENABLED", "true"),
        web_search_timeout_seconds=os.getenv("WEB_SEARCH_TIMEOUT_SECONDS", "15"),
        web_search_max_results=os.getenv("WEB_SEARCH_MAX_RESULTS", "3"),
        backend_base_url=os.getenv("BACKEND_BASE_URL", "http://127.0.0.1:3000"),
        backend_timeout_seconds=os.getenv("BACKEND_TIMEOUT_SECONDS", "15"),
        ollama_base_url=os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434"),
        ollama_model=os.getenv("OLLAMA_MODEL", "qwen3:4b").strip(),
        ollama_timeout_seconds=os.getenv("OLLAMA_TIMEOUT_SECONDS", "120"),
    )

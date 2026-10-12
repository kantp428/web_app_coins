"""FastAPI entry point. Model calls are isolated in services/llm.py."""

from contextlib import asynccontextmanager

from fastapi import FastAPI

from config import get_settings
from router.chat import router as chat_router
from schemas.chat import HealthResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    get_settings()
    yield


app = FastAPI(
    title="THAI Please AI Service",
    description="Authenticated Qwen3 4B recommendations, related public Search and token-free /chat/test for local model evaluation.",
    version="0.4.1",
    lifespan=lifespan,
)
app.include_router(chat_router)


@app.get(
    "/test", response_model=HealthResponse, tags=["health"], include_in_schema=False
)
@app.get("/health", response_model=HealthResponse, tags=["health"])
async def health() -> HealthResponse:
    """App liveness only; this does not load or probe the model."""
    return HealthResponse()

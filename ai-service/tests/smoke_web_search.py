"""Opt-in live DDGS / Qwen smoke; public query and fixture user context only."""

import argparse
import asyncio
import sys
from pathlib import Path
from time import perf_counter

import httpx
from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from config import get_settings
from services.backend import RecommendationContext
from services.llm import LLMService
from services.web_search import WebSearchService


async def run(with_model=False):
    load_dotenv(Path(__file__).resolve().parents[1] / ".env")
    settings = get_settings()
    web = WebSearchService(timeout_seconds=20)
    message = "ช่วยค้นข้อมูลโครงการคนละครึ่งจากแหล่งข้อมูลทางการหน่อย"
    started = perf_counter()
    if with_model:
        context = RecommendationContext.model_validate(
            {
                "user": {"id": "99", "role": "CUSTOMER", "displayName": "Fixture"},
                "categories": [{"id": "1", "name": "อาหาร", "slug": "food"}],
                "purchaseHistory": [],
            }
        )

        async def no_shop_read(ids):
            raise AssertionError("Web-only question must not recommend stores")

        async with httpx.AsyncClient(
            base_url=str(settings.ollama_base_url), timeout=180, trust_env=False
        ) as client:
            reply, ids, sources = await LLMService(
                client, settings.ollama_model
            ).generate_chat(message, context, no_shop_read, web)
            assert ids == [] and sources, "Expected web sources and no stores"
            assert "<think>" not in reply and "</think>" not in reply
            print(reply, flush=True)
    else:
        result = await web.search("คนละครึ่ง โครงการ กระทรวงการคลัง", message)
        print("Search status:", result.status, flush=True)
        assert (
            result.status == "ok" and result.sources
        ), "No live official results; check network/provider"
        sources = result.sources
    print(
        f"PASS ({perf_counter()-started:.2f}s); official sources: {len(sources)}",
        flush=True,
    )
    for source in sources:
        print(source.url, flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", action="store_true")
    args = parser.parse_args()
    asyncio.run(run(args.model))

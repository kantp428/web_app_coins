"""Opt-in real Ollama description relevance smoke; no Backend, token or DB."""

import asyncio

import httpx

from config import get_settings
from services.backend import NearbyShop
from services.llm import LLMService


async def main():
    settings = get_settings()
    shops = [
        NearbyShop(
            id="1",
            name="ร้านกะเพรา",
            description="ผัดกะเพราหมู ไข่ดาว",
            categories=["อาหาร"],
            distanceKm=1,
        ),
        NearbyShop(
            id="2",
            name="ร้านตามสั่ง",
            description="อาหารตามสั่ง",
            categories=["อาหาร"],
            distanceKm=1,
        ),
        NearbyShop(
            id="3",
            name="ครัวไทย",
            description="ร้านอาหารไทย",
            categories=["อาหาร"],
            distanceKm=1,
        ),
        NearbyShop(
            id="4",
            name="น้ำผลไม้",
            description="ขายเฉพาะน้ำผลไม้และเครื่องดื่ม ไม่มีอาหารจานหลัก",
            categories=["อาหาร"],
            distanceKm=1,
        ),
    ]
    async with httpx.AsyncClient(
        base_url=str(settings.ollama_base_url).rstrip("/") + "/",
        timeout=httpx.Timeout(60, connect=3),
        trust_env=False,
        follow_redirects=False,
    ) as client:
        service = LLMService(client, settings.ollama_model)
        ids = await service.related_shops("อยากกินผัดกะเพรา", shops)
        print({"model": settings.ollama_model, "selectedFixtureIds": ids})
        if set(ids) != {"1", "2", "3"}:
            raise AssertionError(
                "Expected exact and broad plausible fixtures, excluding beverage-only fixture"
            )
        print(
            "Description relevance smoke PASS (one fixture query; not a general evaluation)"
        )


if __name__ == "__main__":
    asyncio.run(main())

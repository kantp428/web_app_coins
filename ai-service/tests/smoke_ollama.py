"""Optional real-model evaluation with fixture Backend data, no real user history.

Run explicitly: .venv/Scripts/python.exe tests/smoke_ollama.py
Requires an already-running Ollama/qwen3:4b. Does not start/install services.
"""

import asyncio
import sys
from pathlib import Path
from time import perf_counter

import httpx

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from config import get_settings
from services.backend import Candidates, RecommendationContext
from services.llm import LLMService


async def main():
    settings = get_settings()
    context = RecommendationContext.model_validate(
        {
            "user": {"id": "99", "role": "CUSTOMER", "displayName": "Fixture"},
            "categories": [
                {"id": "1", "name": "อาหารและร้านอาหาร", "slug": "food"},
                {"id": "2", "name": "เครื่องดื่มและคาเฟ่", "slug": "drinks"},
                {"id": "3", "name": "ของใช้ในบ้าน", "slug": "household"},
            ],
            "purchaseHistory": [
                {
                    "storeId": "6",
                    "categoryIds": ["1"],
                    "purchaseCount": "2",
                    "lastPurchasedAt": "2026-09-01T00:00:00Z",
                }
            ],
        }
    )
    async with httpx.AsyncClient(
        base_url=str(settings.ollama_base_url), timeout=180, trust_env=False
    ) as client:
        service = LLMService(client, settings.ollama_model)
        for message, expected in [
            ("สวัสดีครับ", None),
            ("ช่วยแนะนำร้านกินข้าวหรือดื่มกาแฟหน่อย", {"1", "2"}),
            ("หมาผมน่ารักไหม", None),
        ]:
            searches = []

            async def search(ids):
                searches.append(set(ids))
                return Candidates.model_validate(
                    {
                        "stores": [
                            {"id": "3", "visited": False, "coins": 10},
                            {"id": "4", "visited": False, "coins": 8},
                            {"id": "5", "visited": False, "coins": 5},
                            {"id": "6", "visited": True, "coins": 1},
                            {"id": "7", "visited": True, "coins": 1},
                        ]
                    }
                )

            start = perf_counter()
            reply, ids = await service.generate_chat(message, context, search)
            assert "<think>" not in reply and "</think>" not in reply
            if expected is None:
                assert searches == [] and ids == [], (searches, ids)
            else:
                assert searches == [expected] and len(ids) == 5, searches
                assert "เคยซื้อ" in reply and "เคยแนะนำ" not in reply, reply
            print(
                f"PASS ({perf_counter()-start:.2f}s): {message} -> {reply}", flush=True
            )


if __name__ == "__main__":
    asyncio.run(main())

"""Opt-in /chat/test HTTP smoke with real Ollama/DDGS, no token or Backend."""

import sys
from pathlib import Path
from time import perf_counter

from dotenv import load_dotenv
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
load_dotenv(Path(__file__).resolve().parents[1] / ".env")
from main import app

if __name__ == "__main__":
    with TestClient(app) as client:
        for kind, message in (
            ("plain", "สวัสดี คุณช่วยเรื่องอะไรได้บ้าง"),
            ("search", "ช่วยค้นข้อมูลโครงการคนละครึ่งจากแหล่งข้อมูลทางการหน่อย"),
            ("off-topic", "หมาผมน่ารักไหม"),
            ("no-recommendation", "ช่วยแนะนำร้านอาหารหน่อย"),
        ):
            started = perf_counter()
            response = client.post("/chat/test", json={"message": message})
            assert response.status_code == 200, (
                kind,
                response.status_code,
                response.text,
            )
            body = response.json()
            assert body["storeIds"] == [] and body["reply"].strip()
            assert "<think>" not in body["reply"]
            if kind == "search":
                assert body["sources"], "Search unavailable; verify internet/provider"
                for source in body["sources"]:
                    assert source["url"] in body["reply"]
            else:
                assert body["sources"] == []
            if kind == "no-recommendation":
                assert "token" in body["reply"].lower() or "/chat" in body["reply"]
            print(
                f"PASS {kind}: HTTP200, sources={len(body['sources'])}, {perf_counter()-started:.2f}s",
                flush=True,
            )

"""Explore HTTP + real adapter orchestration with isolated Backend/Ollama transports."""

import json
import unittest

import httpx
from fastapi.testclient import TestClient

from main import app
from services.backend import BackendService, get_backend_service
from services.llm import LLMService, get_llm_service


class StoreSearchTests(unittest.TestCase):
    def setUp(self):
        self.reads = []
        self.payloads = []
        self.role = "CUSTOMER"
        self.auth_status = 200
        self.model_status = 200
        self.selection = None
        self.page_override = None
        self.shops = [
            dict(
                id=str(i),
                name="ร้านทดสอบ",
                description="ร้านอาหารตามสั่ง",
                categories=["อาหาร"],
                distanceKm=1.0,
            )
            for i in range(1, 252)
        ]

        def backend(request):
            self.reads.append(request)
            self.assertEqual(request.headers["Authorization"], "Bearer fixture-token")
            if request.url.path == "/me":
                return httpx.Response(
                    self.auth_status,
                    json=dict(id="1", role=self.role, displayName="Fixture"),
                )
            self.assertEqual(request.method, "GET")
            self.assertEqual(request.url.path, "/stores")
            self.assertNotIn("categoryIds", request.url.params)
            page = int(request.url.params["page"])
            self.assertEqual(request.url.params["pageSize"], "50")
            return httpx.Response(
                200,
                json=self.page_override
                or dict(
                    radiusKm=float(request.url.params["radiusKm"]),
                    stores=self.shops[(page - 1) * 50 : page * 50],
                    meta=dict(
                        page=page,
                        pageSize=50,
                        total=len(self.shops),
                        hasNextPage=page * 50 < len(self.shops),
                    ),
                ),
            )

        def model(request):
            payload = json.loads(request.content)
            self.payloads.append(payload)
            data = json.loads(payload["messages"][-1]["content"])
            ids = (
                self.selection
                if self.selection is not None
                else [shop["id"] for shop in reversed(data["shops"])]
            )
            return httpx.Response(
                self.model_status,
                json=dict(
                    done=True,
                    message=dict(
                        role="assistant", content=json.dumps(dict(shopIds=ids))
                    ),
                ),
            )

        async def backend_dep():
            async with httpx.AsyncClient(
                base_url="http://backend.test/", transport=httpx.MockTransport(backend)
            ) as client:
                yield BackendService(client)

        async def model_dep():
            async with httpx.AsyncClient(
                base_url="http://model.test/", transport=httpx.MockTransport(model)
            ) as client:
                yield LLMService(client, "fixture-model")

        app.dependency_overrides[get_backend_service] = backend_dep
        app.dependency_overrides[get_llm_service] = model_dep
        self.addCleanup(app.dependency_overrides.pop, get_backend_service)
        self.addCleanup(app.dependency_overrides.pop, get_llm_service)
        self.client = self.enterContext(TestClient(app))
        self.client.headers["Authorization"] = "Bearer fixture-token"
        self.body = dict(
            query="  อยากกินผัดกะเพรา  ", latitude=13.75, longitude=100.5, radiusKm=5
        )

    def post(self, **changes):
        return self.client.post("/stores/search", json={**self.body, **changes})

    def test_all_pages_return_more_than_five_and_more_than_chat_pool(self):
        ids = []
        for page in range(1, 7):
            response = self.post(page=page)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.headers["cache-control"], "no-store")
            body = response.json()
            ids.extend(body["shopIds"])
            self.assertEqual(body["meta"]["hasNextPage"], page < 6)
            self.assertEqual(body["meta"]["total"], 251)
        self.assertEqual(ids, [str(i) for i in range(1, 252)])
        self.assertEqual({str(r.url.path) for r in self.reads}, {"/me", "/stores"})
        for payload in self.payloads:
            data = json.loads(payload["messages"][-1]["content"])
            self.assertEqual(data["query"], "อยากกินผัดกะเพรา")
            self.assertTrue(
                all(s["description"] == "ร้านอาหารตามสั่ง" for s in data["shops"])
            )
            for secret in (
                "fixture-token",
                "purchaseHistory",
                "latitude",
                "displayName",
                "coins",
            ):
                self.assertNotIn(secret, json.dumps(payload))

    def test_authentication_and_role_fail_before_discovery_or_model(self):
        self.client.headers.pop("Authorization")
        self.assertEqual(self.post().status_code, 401)
        self.assertEqual(self.reads, [])
        self.client.headers["Authorization"] = "Bearer fixture-token"
        for role in ("SELLER", "GOVERNMENT"):
            self.role = role
            self.assertEqual(self.post().status_code, 403)
        self.auth_status = 401
        self.assertEqual(self.post().status_code, 401)
        self.assertEqual(self.payloads, [])
        self.assertTrue(all(r.url.path == "/me" for r in self.reads))

    def test_validation(self):
        for changes in (
            dict(query=" "),
            dict(query="x" * 501),
            dict(page=0),
            dict(page=True),
            dict(latitude="13.75"),
            dict(radiusKm=51),
            dict(categoryIds=[]),
        ):
            with self.subTest(changes=changes):
                self.assertEqual(self.post(**changes).status_code, 422)
        self.assertEqual(self.reads, [])

    def test_unrelated_and_empty_discovery_are_empty_without_fallback(self):
        self.selection = []
        self.assertEqual(self.post().json()["shopIds"], [])
        self.shops = []
        self.payloads.clear()
        self.assertEqual(self.post().json()["shopIds"], [])
        self.assertEqual(self.payloads, [])

    def test_invalid_model_selection_and_outage_are_errors(self):
        for ids in (["999"], ["1", "1"], [1]):
            self.selection = ids
            self.assertEqual(self.post().status_code, 502)
        self.model_status = 503
        self.assertEqual(self.post().status_code, 502)

    def test_invalid_discovery_scope_and_pagination_never_reach_model(self):
        valid = dict(
            radiusKm=5.0,
            stores=[self.shops[0]],
            meta=dict(page=1, pageSize=50, total=1, hasNextPage=False),
        )
        for body in (
            {**valid, "radiusKm": 6.0},
            {**valid, "stores": [{**self.shops[0], "distanceKm": 6.0}]},
            {**valid, "stores": [self.shops[0], self.shops[0]]},
            {**valid, "meta": {**valid["meta"], "hasNextPage": True}},
            {**valid, "meta": {**valid["meta"], "total": 2}},
            {**valid, "meta": {**valid["meta"], "page": 2}},
        ):
            self.page_override = body
            self.assertEqual(self.post().status_code, 502)
        self.assertEqual(self.payloads, [])

    def test_radius_forwarded_and_model_receives_only_page_candidates(self):
        self.assertEqual(self.post(page=6, radiusKm=2).json()["shopIds"], ["251"])
        self.assertEqual(self.reads[-1].url.params["radiusKm"], "2.0")
        self.selection = ["1"]
        self.assertEqual(self.post(page=6).status_code, 502)

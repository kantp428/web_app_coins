"""Transport-level chat -> Ollama tool -> authenticated Backend regression."""

import json
import unittest

import httpx

import test_api

LOCATION = {"latitude": 13.75, "longitude": 100.5, "radiusKm": 5}


def assistant(content="", calls=None):
    message = {"role": "assistant", "content": content}
    if calls is not None:
        message["tool_calls"] = calls
    return {"done": True, "message": message}


def tool(ids=None, name="search_system_shops", **extra):
    return {
        "function": {"name": name, "arguments": {"categoryIds": ids or ["1"], **extra}}
    }


class RecommendationTests(unittest.TestCase):
    def setUp(self):
        test_api.ChatAPITests.setUp(self)
        self.context["categories"] = [
            {"id": "1", "name": "อาหาร", "slug": "food"},
            {"id": "2", "name": "เครื่องดื่ม", "slug": "drinks"},
        ]
        self.context["purchaseHistory"] = [
            {
                "storeId": "6",
                "categoryIds": ["1"],
                "purchaseCount": "2",
                "lastPurchasedAt": "2026-09-01T00:00:00.000Z",
            }
        ]

    def post(self):
        return self.client.post(
            "/chat",
            json={"message": "ช่วยแนะนำร้านอาหารหรือกาแฟหน่อย", "location": LOCATION},
        )

    def test_tool_categories_and_verified_ids_only(self):
        self.candidates = {
            "stores": [
                {"id": "3", "visited": False, "coins": 10},
                {"id": "4", "visited": False, "coins": 8},
                {"id": "5", "visited": False, "coins": None},
                {"id": "6", "visited": True, "coins": 1},
                {"id": "7", "visited": True, "coins": None},
            ]
        }
        self.model_responses = [
            assistant(calls=[tool(["1", "2"])]),
            assistant("พบร้านใหม่ 3 ร้านและร้านเดิม 2 ร้านครับ"),
        ]
        response = self.post()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["storeIds"], ["3", "4", "5", "6", "7"])
        self.assertEqual(
            json.loads(self.backend_requests[-1].content),
            {"categoryIds": ["1", "2"], **LOCATION},
        )
        self.assertEqual(len(self.payloads), 2)
        self.assertNotIn("tools", self.payloads[-1])
        model_data = json.dumps(self.payloads, ensure_ascii=False)
        self.assertIn("purchaseHistory", model_data)
        self.assertNotIn("test-customer-token", model_data)
        self.assertNotIn("displayName", model_data)
        self.assertNotIn("latitude", model_data)
        self.assertNotIn("longitude", model_data)
        self.assertEqual(
            set(response.json()), {"reply", "storeIds", "sources", "mode", "model"}
        )

    def test_shortage_does_not_fill_other_quota(self):
        self.candidates = {"stores": [{"id": "3", "visited": False, "coins": None}]}
        self.model_responses = [
            assistant(calls=[tool()]),
            assistant("พบร้านใหม่ 1 ร้านครับ"),
        ]
        self.assertEqual(self.post().json()["storeIds"], ["3"])

    def test_location_defaults_radius_and_binds_request_scope(self):
        self.model_responses = [assistant(calls=[tool()]), assistant("พบร้านในระยะ")]
        response = self.client.post(
            "/chat",
            json={
                "message": "ช่วยแนะนำร้านอาหาร",
                "location": {"latitude": 0, "longitude": 0},
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            json.loads(self.backend_requests[-1].content),
            {"categoryIds": ["1"], "latitude": 0, "longitude": 0, "radiusKm": 5},
        )

    def test_missing_location_disables_shops_but_preserves_chat(self):
        self.model_responses = [assistant("กรุณาเลือกจุดค้นหาและรัศมี")]
        response = self.client.post("/chat", json={"message": "แนะนำร้านอาหาร"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["storeIds"], [])
        self.assertEqual(len(self.backend_requests), 1)
        self.assertNotIn("tools", self.payloads[0])
        self.assertIn("ยังไม่มีจุดค้นหาร้าน", str(self.payloads[0]))

    def test_location_validation_before_backend_or_model(self):
        for location in (
            {},
            {"latitude": 0},
            {**LOCATION, "latitude": 91},
            {**LOCATION, "longitude": -181},
            {**LOCATION, "latitude": "13.75"},
            {**LOCATION, "latitude": True},
            {**LOCATION, "radiusKm": 0},
            {**LOCATION, "radiusKm": 50.1},
            {**LOCATION, "shopIds": ["1"]},
        ):
            with self.subTest(location=location):
                response = self.client.post(
                    "/chat", json={"message": "แนะนำร้าน", "location": location}
                )
                self.assertEqual(response.status_code, 422)
        self.assertEqual(self.backend_requests, [])
        self.assertEqual(self.payloads, [])

    def test_model_cannot_override_location_in_tool_arguments(self):
        self.model_responses = [
            assistant(calls=[tool(latitude=0, longitude=0, radiusKm=50)])
        ]
        self.assertEqual(self.post().status_code, 502)
        self.assertEqual(len(self.backend_requests), 1)

    def test_empty_search_returns_grounded_empty_without_second_inference(self):
        self.model_responses = [assistant(calls=[tool()])]
        response = self.post()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["storeIds"], [])
        self.assertIn("ยังไม่พบร้าน", response.json()["reply"])
        self.assertEqual(len(self.payloads), 1)

    def test_normal_chat_or_clarification_does_not_search(self):
        self.model_responses = [assistant("ต้องการร้านประเภทไหนครับ")]
        self.assertEqual(self.post().json()["storeIds"], [])
        self.assertEqual(len(self.backend_requests), 1)

    def test_missing_or_wrong_auth_scheme_never_calls_backend_or_model(self):
        for authorization in (None, "Basic secret", "Bearer "):
            self.client.headers.pop("Authorization", None)
            if authorization is not None:
                self.client.headers["Authorization"] = authorization
            self.assertEqual(self.post().status_code, 401)
        self.assertEqual(self.backend_requests, [])
        self.assertEqual(self.payloads, [])

    def test_expired_token_role_and_backend_failure_stop_before_model(self):
        for upstream, expected in ((401, 401), (403, 403), (500, 502), (302, 502)):
            self.backend_status = upstream
            response = self.post()
            self.assertEqual(response.status_code, expected)
            self.assertNotIn("private backend error", response.text)
        self.assertEqual(self.payloads, [])

    def test_unknown_tool_injected_user_and_invalid_categories_never_search(self):
        calls = [
            tool(name="http_request"),
            tool(["999"]),
            tool(["1", "1"]),
            tool(userId="999"),
            tool([1]),
            tool(["1"] * 11),
        ]
        for call in calls:
            self.model_responses = [assistant(calls=[call])]
            self.assertEqual(self.post().status_code, 502)
        self.assertTrue(
            all(request.method == "GET" for request in self.backend_requests)
        )

    def test_parallel_or_recursive_tool_calls_are_rejected(self):
        self.model_responses = [assistant(calls=[tool(), tool()])]
        self.assertEqual(self.post().status_code, 502)
        self.candidates = {"stores": [{"id": "3", "visited": False, "coins": 1}]}
        self.model_responses = [assistant(calls=[tool()]), assistant(calls=[tool()])]
        self.assertEqual(self.post().status_code, 502)

    def test_bad_backend_history_and_bad_candidates_are_not_trusted(self):
        self.context["purchaseHistory"] = [{"userId": "another-user"}]
        self.assertEqual(self.post().status_code, 502)
        self.assertEqual(self.payloads, [])
        self.context["purchaseHistory"] = []
        for stores in (
            [{"id": "3", "visited": False, "coins": 1}] * 2,
            [{"id": str(i), "visited": False, "coins": 1} for i in range(3, 7)],
            [{"id": str(i), "visited": True, "coins": 1} for i in range(3, 6)],
            [{"id": "3", "visited": False, "coins": 99}],
        ):
            self.candidates = {"stores": stores}
            self.model_responses = [assistant(calls=[tool()])]
            self.assertEqual(self.post().status_code, 502)

    def test_backend_search_auth_failure_does_not_fabricate_ids(self):
        async def expire_after_context(request):
            if request.method == "GET":
                return httpx.Response(200, json=self.context)
            return httpx.Response(401)

        from services.backend import BackendService, get_backend_service
        from main import app

        async def override():
            async with httpx.AsyncClient(
                base_url="http://backend.test/",
                transport=httpx.MockTransport(expire_after_context),
            ) as client:
                yield BackendService(client)

        app.dependency_overrides[get_backend_service] = override
        self.model_responses = [assistant(calls=[tool()])]
        self.assertEqual(self.post().status_code, 401)

    def test_openapi_exposes_bearer_security(self):
        schema = self.client.get("/openapi.json").json()
        self.assertEqual(
            schema["paths"]["/chat"]["post"]["security"], [{"HTTPBearer": []}]
        )

"""HTTP contract and Ollama adapter checks using an isolated mock transport."""

import json
import unittest

import httpx
from fastapi.testclient import TestClient
from pydantic import ValidationError

from config import Settings
from main import app
from prompts.system import SYSTEM_PROMPT
from services.llm import LLMService, get_llm_service
from services.backend import BackendService, get_backend_service


class ChatAPITests(unittest.TestCase):
    def setUp(self) -> None:
        self.upstream_response = None
        self.upstream_error = None
        self.payloads = []
        self.backend_requests = []
        self.backend_status = 200
        self.context = {
            "user": {"id": "1", "role": "CUSTOMER", "displayName": "Test"},
            "categories": [],
            "purchaseHistory": [],
        }
        self.candidates = {"stores": []}
        self.model_responses = []

        def backend_handler(request: httpx.Request) -> httpx.Response:
            self.backend_requests.append(request)
            self.assertEqual(
                request.headers["Authorization"], "Bearer test-customer-token"
            )
            if self.backend_status != 200:
                return httpx.Response(
                    self.backend_status, json={"message": "private backend error"}
                )
            if request.method == "GET":
                self.assertEqual(request.url.path, "/recommendations/context")
                return httpx.Response(200, json=self.context)
            self.assertEqual(request.url.path, "/recommendations/candidates")
            return httpx.Response(201, json=self.candidates)

        async def override_backend():
            async with httpx.AsyncClient(
                base_url="http://backend.test/",
                transport=httpx.MockTransport(backend_handler),
            ) as client:
                yield BackendService(client)

        def handler(request: httpx.Request) -> httpx.Response:
            self.assertEqual(str(request.url), "http://model.test/api/chat")
            payload = json.loads(request.content)
            self.payloads.append(payload)
            if self.model_responses:
                return httpx.Response(200, json=self.model_responses.pop(0))
            if self.upstream_error is not None:
                raise self.upstream_error("test failure", request=request)
            if self.upstream_response is not None:
                return self.upstream_response
            return httpx.Response(
                200,
                json={
                    "done": True,
                    "message": {
                        "role": "assistant",
                        "content": "คำตอบทดสอบ: " + payload["messages"][-1]["content"],
                        "thinking": "internal trace must not be returned",
                    },
                },
            )

        async def override_service():
            async with httpx.AsyncClient(
                base_url="http://model.test/", transport=httpx.MockTransport(handler)
            ) as client:
                yield LLMService(client, "qwen3:4b")

        app.dependency_overrides[get_llm_service] = override_service
        app.dependency_overrides[get_backend_service] = override_backend
        self.addCleanup(app.dependency_overrides.pop, get_llm_service)
        self.addCleanup(app.dependency_overrides.pop, get_backend_service)
        self.client = self.enterContext(TestClient(app))
        self.client.headers["Authorization"] = "Bearer test-customer-token"

    def test_health_is_liveness_without_model_call(self) -> None:
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {"status": "ok", "service": "ai-service", "mode": "model"},
        )
        self.assertEqual(self.payloads, [])

    def test_test_alias_is_preserved(self) -> None:
        self.assertEqual(self.client.get("/test").status_code, 200)

    def test_chat_returns_only_final_model_answer(self) -> None:
        message = "สวัสดี"
        response = self.client.post("/chat", json={"message": message})
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["mode"], "model")
        self.assertEqual(body["model"], "qwen3:4b")
        self.assertIn(message, body["reply"])
        self.assertEqual(set(body), {"reply", "storeIds", "mode", "model"})
        self.assertEqual(body["storeIds"], [])
        self.assertNotIn("internal trace", response.text)
        self.assertEqual(
            self.payloads[0]["messages"][0],
            {"role": "system", "content": SYSTEM_PROMPT},
        )
        self.assertEqual(
            self.payloads[0]["messages"][-1], {"role": "user", "content": message}
        )
        self.assertFalse(self.payloads[0]["think"])
        self.assertNotIn("test-customer-token", json.dumps(self.payloads))

    def test_chat_trims_message(self) -> None:
        response = self.client.post("/chat", json={"message": "  สวัสดี \n"})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["reply"].endswith("สวัสดี"))

    def test_legacy_inline_thinking_returns_only_final_answer(self) -> None:
        for content in (
            "<think>internal trace</think>\nคำตอบจริง",
            "internal trace from prefilled tag</think>\nคำตอบจริง",
            "</think>\nคำตอบจริง",
        ):
            with self.subTest(content=content):
                self.upstream_response = httpx.Response(
                    200,
                    json={
                        "done": True,
                        "message": {"role": "assistant", "content": content},
                    },
                )
                response = self.client.post("/chat", json={"message": "สวัสดี"})
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json()["reply"], "คำตอบจริง")

    def test_incomplete_or_empty_inline_thinking_returns_502(self) -> None:
        for content in ("<think>unfinished", "trace</think>  ", "<think></think>"):
            with self.subTest(content=content):
                self.upstream_response = httpx.Response(
                    200,
                    json={
                        "done": True,
                        "message": {"role": "assistant", "content": content},
                    },
                )
                response = self.client.post("/chat", json={"message": "สวัสดี"})
                self.assertEqual(response.status_code, 502)
                self.assertNotIn(content, response.text)

    def test_chat_accepts_length_limit(self) -> None:
        response = self.client.post("/chat", json={"message": "ก" * 2000})
        self.assertEqual(response.status_code, 200)

    def test_chat_rejects_invalid_input(self) -> None:
        cases = [
            {},
            {"message": ""},
            {"message": " \t\n "},
            {"message": "ก" * 2001},
            {"message": 123},
            {"message": None},
            {"message": "hello", "userId": "untrusted"},
        ]
        for payload in cases:
            with self.subTest(payload_keys=list(payload)):
                response = self.client.post("/chat", json=payload)
                self.assertEqual(response.status_code, 422)
                self.assertIsInstance(response.json()["detail"], list)
        self.assertEqual(self.payloads, [])

    def test_chat_rejects_malformed_json(self) -> None:
        response = self.client.post(
            "/chat", content="{", headers={"Content-Type": "application/json"}
        )
        self.assertEqual(response.status_code, 422)
        self.assertEqual(self.payloads, [])

    def test_model_connection_error_returns_503(self) -> None:
        self.upstream_error = httpx.ConnectError
        response = self.client.post("/chat", json={"message": "hello"})
        self.assertEqual(response.status_code, 503)
        self.assertIsInstance(response.json()["detail"], str)

    def test_model_timeout_returns_504(self) -> None:
        self.upstream_error = httpx.ReadTimeout
        response = self.client.post("/chat", json={"message": "hello"})
        self.assertEqual(response.status_code, 504)

    def test_upstream_http_errors_are_mapped_without_exposing_body(self) -> None:
        for upstream, expected in ((404, 503), (400, 502), (500, 502), (302, 502)):
            with self.subTest(upstream=upstream):
                self.upstream_response = httpx.Response(
                    upstream, json={"error": "sensitive upstream details"}
                )
                response = self.client.post("/chat", json={"message": "hello"})
                self.assertEqual(response.status_code, expected)
                self.assertNotIn("sensitive upstream", response.text)

    def test_malformed_or_empty_model_results_return_502(self) -> None:
        cases = [
            {},
            [],
            {"done": True, "message": None},
            {"done": True, "message": {"role": "assistant", "content": "  "}},
            {"done": True, "message": {"role": "assistant", "content": 123}},
            {"done": True, "message": {"role": "user", "content": "wrong role"}},
            {"done": False, "message": {"role": "assistant", "content": "partial"}},
            {
                "done": True,
                "done_reason": "length",
                "message": {
                    "role": "assistant",
                    "content": "unfinished thinking from prefilled tag",
                },
            },
        ]
        for body in cases:
            with self.subTest(body=body):
                self.upstream_response = httpx.Response(200, json=body)
                response = self.client.post("/chat", json={"message": "hello"})
                self.assertEqual(response.status_code, 502)

    def test_invalid_json_from_model_returns_502(self) -> None:
        self.upstream_response = httpx.Response(200, content=b"not JSON")
        response = self.client.post("/chat", json={"message": "hello"})
        self.assertEqual(response.status_code, 502)

    def test_docs_and_openapi_are_available(self) -> None:
        self.assertEqual(self.client.get("/docs").status_code, 200)
        response = self.client.get("/openapi.json")
        self.assertEqual(response.status_code, 200)
        paths = response.json()["paths"]
        self.assertIn("post", paths["/chat"])
        self.assertIn("get", paths["/health"])
        self.assertNotIn("/test", paths)
        self.assertTrue(
            {"502", "503", "504"}.issubset(paths["/chat"]["post"]["responses"])
        )


class SettingsTests(unittest.TestCase):
    def test_default_model_is_qwen3_4b(self) -> None:
        self.assertEqual(Settings().ollama_model, "qwen3:4b")

    def test_invalid_server_url_and_timeout_are_rejected(self) -> None:
        for values in (
            {"ollama_base_url": "file:///tmp/model"},
            {"ollama_model": ""},
            {"ollama_timeout_seconds": 0},
            {"ollama_timeout_seconds": float("nan")},
        ):
            with self.subTest(values=values), self.assertRaises(ValidationError):
                Settings(**values)


if __name__ == "__main__":
    unittest.main()

"""Token-free chat must never depend on or read authenticated Backend data."""

import json
import unittest

import httpx

import test_recommendations as rec
import test_web_search as web
from main import app
from services.backend import get_backend_service


class TokenFreeChatTests(unittest.TestCase):
    def setUp(self):
        web.WebSearchAPITests.setUp(self)
        self.client.headers.pop("Authorization")

        def forbidden_backend():
            raise AssertionError(
                "Token-free chat must not resolve the Backend dependency"
            )

        app.dependency_overrides[get_backend_service] = forbidden_backend

    def post(self, message="สวัสดี คุณช่วยเรื่องอะไรได้บ้าง"):
        return self.client.post("/chat/test", json={"message": message})

    def test_plain_chat_and_off_topic_need_no_token_or_backend(self):
        for message, reply in (
            ("สวัสดี", "ผมช่วยเรื่องระบบและการใช้จ่ายได้ครับ"),
            ("หมาผมน่ารักไหม", "คำถามนี้อยู่นอกขอบเขตของระบบครับ"),
        ):
            self.model_responses = [rec.assistant(reply)]
            response = self.post(message)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()["reply"], reply)
            self.assertEqual(response.json()["storeIds"], [])
            self.assertEqual(response.json()["sources"], [])
            self.assertNotIn("tools", self.payloads[-1])
            self.assertNotIn("DATA (", json.dumps(self.payloads[-1]))
        self.assertEqual(self.backend_requests, [])
        self.provider.assert_not_called()

    def test_public_search_uses_same_guard_and_sources_without_user_context(self):
        self.model_responses = [
            rec.assistant(calls=[web.web_call()]),
            rec.assistant("ควรตรวจตามประกาศของหน่วยงาน [1]"),
        ]
        response = self.post("ช่วยค้นข้อมูลโครงการคนละครึ่งจากเว็บทางการหน่อย")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["storeIds"], [])
        self.assertEqual(response.json()["sources"][0]["url"], web.ROWS[0]["href"])
        self.assertIn(web.ROWS[0]["href"], response.json()["reply"])
        self.assertEqual(
            [tool["function"]["name"] for tool in self.payloads[0]["tools"]],
            ["search_related_web"],
        )
        self.assertNotIn("tools", self.payloads[1])
        self.assertNotIn("purchaseHistory", json.dumps(self.payloads))
        self.provider.assert_called_once()
        self.assertEqual(self.backend_requests, [])

    def test_search_disabled_failure_and_blocked_queries_return_limitations(self):
        for status in ("disabled", "unavailable", "blocked"):
            self.provider.reset_mock()
            self.web.enabled = status != "disabled"
            self.provider.side_effect = RuntimeError("private upstream details")
            query = (
                "โครงการคนละครึ่ง me@example.com"
                if status == "blocked"
                else "โครงการคนละครึ่ง"
            )
            self.model_responses = [
                rec.assistant(calls=[web.web_call(query)]),
                rec.assistant("ข้อมูลที่โมเดลเดาเอง [1]"),
            ]
            response = self.post("ช่วยค้นข้อมูลโครงการคนละครึ่ง")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()["sources"], [])
            self.assertEqual(response.json()["storeIds"], [])
            self.assertNotIn("โมเดลเดาเอง", response.text)
            self.assertNotIn("private upstream", response.text)
            self.assertEqual(
                self.provider.call_count, 1 if status == "unavailable" else 0
            )

    def test_recommendation_request_has_no_shop_tool_or_fabricated_context(self):
        self.model_responses = [
            rec.assistant(
                "กรุณาใช้ /chat พร้อม CUSTOMER Bearer token เพื่อแนะนำร้านครับ"
            )
        ]
        response = self.post("ช่วยแนะนำร้านอาหารหน่อย")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["storeIds"], [])
        prompt = json.dumps(self.payloads[0]["messages"], ensure_ascii=False)
        self.assertIn("โหมดทดสอบโดยไม่มี token", prompt)
        self.assertIn("/chat พร้อม CUSTOMER Bearer token", prompt)
        self.assertNotIn("tools", self.payloads[0])
        self.provider.assert_not_called()

    def test_unexpected_shop_or_repeated_web_calls_fail_before_any_read(self):
        for calls in (
            [rec.tool(["1"])],
            [web.web_call(), rec.tool(["1"])],
            [web.web_call(), web.web_call()],
        ):
            self.model_responses = [rec.assistant(calls=calls)]
            response = self.post("ค้นข้อมูลโครงการคนละครึ่งและแนะนำร้านอาหาร")
            self.assertEqual(response.status_code, 502)
        self.provider.assert_not_called()
        self.assertEqual(self.backend_requests, [])

    def test_request_validation_matches_authenticated_chat(self):
        for body in (
            {},
            {"message": " "},
            {"message": 123},
            {"message": "x" * 2001},
            {"message": "สวัสดี", "userId": "1"},
            {"message": "สวัสดี", "history": []},
        ):
            self.assertEqual(self.client.post("/chat/test", json=body).status_code, 422)
        self.assertEqual(
            self.client.post(
                "/chat/test", content="{", headers={"Content-Type": "application/json"}
            ).status_code,
            422,
        )
        self.assertEqual(self.payloads, [])
        self.provider.assert_not_called()

    def test_model_errors_keep_existing_http_mapping(self):
        for error, expected in ((httpx.ConnectError, 503), (httpx.ReadTimeout, 504)):
            self.upstream_error = error
            self.assertEqual(self.post().status_code, expected)
        self.upstream_error = None
        self.upstream_response = httpx.Response(200, content="not json")
        self.assertEqual(self.post().status_code, 502)
        self.assertEqual(self.backend_requests, [])

    def test_openapi_has_no_security_requirement_but_chat_keeps_bearer(self):
        paths = self.client.get("/openapi.json").json()["paths"]
        self.assertFalse(paths["/chat/test"]["post"].get("security"))
        self.assertTrue(paths["/chat"]["post"]["security"])

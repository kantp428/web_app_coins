"""Authenticated read tools. Tokens never enter model messages or arguments."""

from collections.abc import AsyncIterator
from typing import Annotated, Literal

import httpx
from pydantic import BaseModel, ConfigDict, Field, ValidationError, model_validator

from config import get_settings
from schemas.chat import StoreLocation

Identifier = Annotated[str, Field(pattern=r"^[1-9][0-9]{0,18}$", strict=True)]


class DataModel(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)


class User(DataModel):
    id: Identifier
    role: Literal["CUSTOMER"]
    displayName: str


class Category(DataModel):
    id: Identifier
    name: str
    slug: str


class Purchase(DataModel):
    storeId: Identifier
    categoryIds: list[Identifier]
    purchaseCount: Annotated[str, Field(pattern=r"^[1-9][0-9]*$")]
    lastPurchasedAt: str


class RecommendationContext(DataModel):
    user: User
    categories: list[Category]
    purchaseHistory: list[Purchase] = Field(max_length=20)


class Candidate(DataModel):
    id: Identifier
    visited: bool
    coins: Annotated[int, Field(ge=1, le=10)] | None


class Candidates(DataModel):
    stores: list[Candidate] = Field(max_length=5)

    @model_validator(mode="after")
    def verify_quotas(self):
        ids = [store.id for store in self.stores]
        repeat = sum(store.visited for store in self.stores)
        if len(set(ids)) != len(ids) or repeat > 2 or len(ids) - repeat > 3:
            raise ValueError("Invalid candidate quotas or duplicate IDs")
        return self


class BackendServiceError(Exception):
    def __init__(self, status_code: int, detail: str):
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


class BackendService:
    def __init__(self, client: httpx.AsyncClient):
        self.client = client

    async def _read(self, method: str, path: str, token: str, body=None):
        try:
            response = await self.client.request(
                method,
                path,
                headers={"Authorization": f"Bearer {token}"},
                **({"json": body} if body is not None else {}),
            )
        except httpx.TimeoutException as error:
            raise BackendServiceError(504, "Backend ตอบกลับไม่ทันเวลา") from error
        except httpx.RequestError as error:
            raise BackendServiceError(503, "เชื่อมต่อ Backend ไม่ได้") from error
        if response.status_code in (401, 403):
            raise BackendServiceError(
                response.status_code, "กรุณาเข้าสู่ระบบด้วยบัญชีลูกค้าที่มีสิทธิ์"
            )
        if not response.is_success:
            raise BackendServiceError(502, "Backend อ่านข้อมูลแนะนำร้านไม่สำเร็จ")
        try:
            return response.json()
        except ValueError as error:
            raise BackendServiceError(502, "Backend ส่งข้อมูลไม่ถูกต้อง") from error

    async def context(self, token: str) -> RecommendationContext:
        body = await self._read("GET", "recommendations/context", token)
        try:
            return RecommendationContext.model_validate(body)
        except ValidationError as error:
            raise BackendServiceError(
                502, "Backend ส่งบริบทผู้ใช้ไม่ถูกต้อง"
            ) from error

    async def search(
        self, token: str, category_ids: list[str], location: StoreLocation
    ) -> Candidates:
        body = await self._read(
            "POST",
            "recommendations/candidates",
            token,
            {"categoryIds": category_ids, **location.model_dump()},
        )
        try:
            return Candidates.model_validate(body)
        except ValidationError as error:
            raise BackendServiceError(502, "Backend ส่งรายการร้านไม่ถูกต้อง") from error


async def get_backend_service() -> AsyncIterator[BackendService]:
    settings = get_settings()
    async with httpx.AsyncClient(
        base_url=str(settings.backend_base_url).rstrip("/") + "/",
        timeout=httpx.Timeout(settings.backend_timeout_seconds, connect=5),
        trust_env=False,
        follow_redirects=False,
    ) as client:
        yield BackendService(client)

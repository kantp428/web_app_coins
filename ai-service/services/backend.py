"""Authenticated read tools. Tokens never enter model messages or arguments."""

from collections.abc import AsyncIterator
from typing import Annotated, Literal

import httpx
from pydantic import BaseModel, ConfigDict, Field, ValidationError, model_validator

from config import get_settings
from schemas.chat import StoreLocation

Identifier = Annotated[str, Field(pattern=r"^[1-9][0-9]{0,18}$", strict=True)]
RECOMMENDATION_POOL_MAX = 200


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


class ShopSummary(BaseModel):
    # Discovery includes address/coordinates; do not retain or send those to AI.
    model_config = ConfigDict(extra="ignore", strict=True)
    id: Identifier
    name: str = Field(max_length=200)
    description: str | None = Field(max_length=2000)
    categories: list[str] = Field(max_length=10)


class NearbyShop(ShopSummary):
    distanceKm: float = Field(ge=0, allow_inf_nan=False)


class DiscoveryMeta(DataModel):
    page: int = Field(ge=1)
    pageSize: int = Field(ge=1, le=100)
    total: int = Field(ge=0)
    hasNextPage: bool


class DiscoveryPage(DataModel):
    radiusKm: float = Field(ge=0.1, le=50, allow_inf_nan=False)
    stores: list[NearbyShop] = Field(max_length=100)
    meta: DiscoveryMeta


class CatalogPage(DataModel):
    shops: list[ShopSummary] = Field(max_length=100)
    meta: DiscoveryMeta


class BackendServiceError(Exception):
    def __init__(self, status_code: int, detail: str):
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


class BackendService:
    def __init__(self, client: httpx.AsyncClient):
        self.client = client

    async def _read(
        self, method: str, path: str, token: str, body=None, *, params=None
    ):
        try:
            response = await self.client.request(
                method,
                path,
                headers={"Authorization": f"Bearer {token}"},
                params=params,
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

    async def require_customer(self, token: str) -> None:
        body = await self._read("GET", "me", token)
        if isinstance(body, dict) and body.get("role") in ("SELLER", "GOVERNMENT"):
            raise BackendServiceError(403, "ใช้ได้เฉพาะบัญชีลูกค้า")
        try:
            User.model_validate(body)
        except ValidationError as error:
            raise BackendServiceError(
                502, "Backend ส่งข้อมูลผู้ใช้ไม่ถูกต้อง"
            ) from error

    async def nearby_page(
        self, token: str, location: StoreLocation, page_number: int
    ) -> DiscoveryPage:
        body = await self._read(
            "GET",
            "stores",
            token,
            params={**location.model_dump(), "page": page_number, "pageSize": 50},
        )
        try:
            page = DiscoveryPage.model_validate(body)
            remaining = max(0, page.meta.total - (page_number - 1) * 50)
            if (
                page.meta.page != page_number
                or page.meta.pageSize != 50
                or page.radiusKm != location.radiusKm
                or len(page.stores) != min(50, remaining)
                or page.meta.hasNextPage != (remaining > 50)
                or len({shop.id for shop in page.stores}) != len(page.stores)
                or any(shop.distanceKm > location.radiusKm for shop in page.stores)
            ):
                raise ValueError("Invalid discovery scope or pagination")
            return page
        except (ValidationError, ValueError) as error:
            raise BackendServiceError(
                502, "Backend ส่งขอบเขตร้านไม่ถูกต้อง กรุณาลองใหม่"
            ) from error

    async def nearby(
        self, token: str, category_ids: list[str], location: StoreLocation
    ) -> list[NearbyShop]:
        shops: list[NearbyShop] = []
        seen: set[str] = set()
        page_number = 1
        total = None
        while True:
            body = await self._read(
                "GET",
                "stores",
                token,
                params={
                    **location.model_dump(),
                    "categoryIds": ",".join(category_ids),
                    "page": page_number,
                    "pageSize": 100,
                },
            )
            try:
                page = DiscoveryPage.model_validate(body)
                if page.meta.total > RECOMMENDATION_POOL_MAX:
                    raise BackendServiceError(
                        503,
                        "ร้านในขอบเขตมีจำนวนมาก กรุณาลดรัศมีหรือเลือกประเภทให้แคบลง",
                    )
                if (
                    page.meta.page != page_number
                    or page.meta.pageSize != 100
                    or page.radiusKm != location.radiusKm
                    or (total is not None and page.meta.total != total)
                ):
                    raise ValueError("Invalid or changed discovery pagination")
                total = page.meta.total
                for shop in page.stores:
                    if shop.id in seen or shop.distanceKm > location.radiusKm:
                        raise ValueError("Duplicate or out-of-scope discovery shop")
                    seen.add(shop.id)
                    shops.append(shop)
                if len(shops) > RECOMMENDATION_POOL_MAX or len(shops) > total:
                    raise ValueError("Invalid discovery count")
                if not page.meta.hasNextPage:
                    if len(shops) != total:
                        raise ValueError("Incomplete discovery")
                    return shops
                if not page.stores or len(shops) >= total or page_number >= 2:
                    raise ValueError("Invalid discovery next page")
            except (ValidationError, ValueError) as error:
                raise BackendServiceError(
                    502, "Backend ส่งขอบเขตร้านไม่ถูกต้อง กรุณาลองใหม่"
                ) from error
            page_number += 1

    async def search(
        self,
        token: str,
        category_ids: list[str],
        location: StoreLocation | None,
        shop_ids: list[str],
    ) -> Candidates:
        body = await self._read(
            "POST",
            "recommendations/candidates",
            token,
            {
                "categoryIds": category_ids,
                **(location.model_dump() if location else {}),
                "shopIds": shop_ids,
            },
        )
        try:
            candidates = Candidates.model_validate(body)
            if any(shop.id not in set(shop_ids) for shop in candidates.stores):
                raise ValueError("Backend returned an unselected shop")
            return candidates
        except (ValidationError, ValueError) as error:
            raise BackendServiceError(502, "Backend ส่งรายการร้านไม่ถูกต้อง") from error

    async def catalog(self, token: str, category_ids: list[str]) -> list[ShopSummary]:
        shops = []
        seen = set()
        total = None
        page_number = 1
        while True:
            body = await self._read(
                "GET",
                "recommendations/catalog",
                token,
                params={
                    "categoryIds": ",".join(category_ids),
                    "page": page_number,
                    "pageSize": 50,
                },
            )
            try:
                page = CatalogPage.model_validate(body)
                if page.meta.total > RECOMMENDATION_POOL_MAX:
                    raise BackendServiceError(
                        503,
                        "ร้านประเภทนี้มีจำนวนมาก กรุณาระบุประเภทหรือสิ่งที่ต้องการให้ชัดขึ้น",
                    )
                if (
                    page.meta.page != page_number
                    or page.meta.pageSize != 50
                    or (total is not None and page.meta.total != total)
                ):
                    raise ValueError("Changed catalog pagination")
                total = page.meta.total
                remaining = max(0, total - (page_number - 1) * 50)
                if len(page.shops) != min(50, remaining) or page.meta.hasNextPage != (
                    remaining > 50
                ):
                    raise ValueError("Incomplete catalog")
                for shop in page.shops:
                    if shop.id in seen:
                        raise ValueError("Duplicate catalog shop")
                    seen.add(shop.id)
                    shops.append(shop)
                if not page.meta.hasNextPage:
                    return shops
            except (ValidationError, ValueError) as error:
                raise BackendServiceError(
                    502, "Backend ส่งรายการร้านไม่ถูกต้อง กรุณาลองใหม่"
                ) from error
            page_number += 1


async def get_backend_service() -> AsyncIterator[BackendService]:
    settings = get_settings()
    async with httpx.AsyncClient(
        base_url=str(settings.backend_base_url).rstrip("/") + "/",
        timeout=httpx.Timeout(settings.backend_timeout_seconds, connect=5),
        trust_env=False,
        follow_redirects=False,
    ) as client:
        yield BackendService(client)

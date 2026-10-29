"""Explore relevance search; pagination does not impose a total result limit."""

from typing import Literal

from pydantic import Field, field_validator

from schemas.chat import StoreLocation
from services.backend import DataModel, DiscoveryMeta, Identifier


class StoreSearchRequest(StoreLocation):
    query: str = Field(min_length=1, max_length=500, strict=True)
    page: int = Field(default=1, ge=1, strict=True)

    @field_validator("query")
    @classmethod
    def trim_query(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Query must not be blank")
        return value


class StoreSearchResponse(DataModel):
    shopIds: list[Identifier] = Field(max_length=50)
    source: Literal["llm"] = "llm"
    meta: DiscoveryMeta

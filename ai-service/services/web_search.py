"""Bounded public search. No arbitrary page fetching or account context."""

import asyncio
import html
import re
import threading
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field
from typing import Literal
from urllib.parse import quote, urlsplit, urlunsplit

from pydantic import BaseModel, ConfigDict, Field

from config import get_settings
from schemas.chat import Source

PUBLIC_TOPIC = re.compile(
    r"คนละครึ่ง|ไทยพลัส|ไทยช่วยไทย|ไทยบวก|สวัสดิการแห่งรัฐ|บัตรสวัสดิการ|"
    r"โครงการ.{0,35}(?:ช่วยจ่าย|ช่วยเหลือ|การใช้จ่าย|กระตุ้นเศรษฐกิจ|ดิจิทัล)|"
    r"เงินดิจิทัล|ดิจิทัลวอลเล็ต|พร้อมเพย์|promptpay|cashless|digital payment|"
    r"government.{0,30}(?:spending|benefit|subsid|support)|half.?half|thai.?plus",
    re.IGNORECASE,
)
PRIVATE_QUERY = re.compile(
    r"coins?|คอยน์|thai\s*please|ไทยช่วยไทยพลีส|ประวัติ(?:ซื้อ|จ่าย|ชำระ)|"
    r"ยอดเงิน|แนะนำ.{0,20}ร้าน|ร้าน.{0,20}(?:แนะนำ|ในระบบ)|"
    r"user[_ ]?id|store[_ ]?id|purchase[_ ]?id",
    re.IGNORECASE,
)
PERSONAL_DATA = re.compile(
    r"bearer\s|eyJ[A-Za-z0-9_-]+\.|sk-[A-Za-z0-9]+|"
    r"[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}|(?:[0-9][ -]?){10,}|https?://",
    re.IGNORECASE,
)
_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="public-search")
_slots = threading.BoundedSemaphore(2)


def public_topic(text: str) -> bool:
    return bool(PUBLIC_TOPIC.search(text))


class WebSearchArguments(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True, str_strip_whitespace=True)
    query: str = Field(min_length=3, max_length=300)


@dataclass
class WebSearchResult:
    status: Literal["ok", "empty", "unavailable", "blocked", "disabled"]
    sources: list[Source] = field(default_factory=list)
    snippets: list[dict[str, str]] = field(default_factory=list)


def official_url(value: str) -> str | None:
    if not isinstance(value, str) or len(value) > 2000:
        return None
    try:
        url = urlsplit(value)
        host = (url.hostname or "").lower()
        allowed = host.endswith(".go.th") or any(
            host == domain or host.endswith("." + domain)
            for domain in ("bot.or.th", "krungthai.com")
        )
        if (
            url.scheme != "https"
            or not allowed
            or url.username
            or url.password
            or url.port not in (None, 443)
            or re.search(r"[\s\x00-\x1f]", value)
        ):
            return None
        return urlunsplit(
            (
                "https",
                url.netloc,
                quote(url.path, safe="/%:@-._~"),
                quote(url.query, safe="=&%/?-._~:"),
                "",
            )
        )
    except (ValueError, TypeError):
        return None


def clean_text(value: str, limit: int) -> str:
    value = html.unescape(re.sub(r"<[^>]*>", "", value))
    return re.sub(r"\s+", " ", re.sub(r"[\x00-\x1f]", " ", value)).strip()[:limit]


def normalize_results(rows, limit: int) -> WebSearchResult:
    sources, snippets, seen = [], [], set()
    if not isinstance(rows, list):
        return WebSearchResult("unavailable")
    for row in rows[:20]:
        if not isinstance(row, dict):
            continue
        url = official_url(row.get("href", ""))
        title, body = row.get("title"), row.get("body")
        if (
            not url
            or url in seen
            or not isinstance(title, str)
            or not isinstance(body, str)
        ):
            continue
        title, body = clean_text(title, 200), clean_text(body, 700)
        if not title or not body:
            continue
        seen.add(url)
        sources.append(Source(title=title, url=url))
        snippets.append(
            {"reference": str(len(sources)), "title": title, "snippet": body}
        )
        if len(sources) == limit:
            break
    return WebSearchResult("ok" if sources else "empty", sources, snippets)


class WebSearchService:
    def __init__(self, enabled=True, timeout_seconds=15, max_results=3):
        self.enabled = enabled
        self.timeout_seconds = timeout_seconds
        self.max_results = max_results

    def _search_sync(self, query: str):
        from ddgs import DDGS

        # Backend/region are server-owned, not tool arguments. Search snippets
        # only: never fetch URLs returned by a provider or requested by a model.
        # Explicit attempts avoid DDGS skipping engines with shared providers.
        # Keep the same scoped query; never solve a challenge by broadening it.
        received_results = False
        for engine in ("duckduckgo", "yahoo"):
            try:
                with DDGS(timeout=min(5, self.timeout_seconds)) as provider:
                    rows = provider.text(
                        query + " (site:go.th OR site:bot.or.th OR site:krungthai.com)",
                        region="th-th",
                        safesearch="on",
                        max_results=10,
                        backend=engine,
                    )
                received_results = True
                if normalize_results(rows, self.max_results).sources:
                    return rows
            except Exception:
                continue
        if not received_results:
            raise RuntimeError("Public search providers unavailable")
        return []

    async def search(self, query: str, user_message: str) -> WebSearchResult:
        if not self.enabled:
            return WebSearchResult("disabled")
        if (
            not public_topic(user_message)
            or not public_topic(query)
            or PRIVATE_QUERY.search(query)
            or PERSONAL_DATA.search(query)
            or PERSONAL_DATA.search(user_message)
        ):
            return WebSearchResult("blocked")
        if not _slots.acquire(blocking=False):
            return WebSearchResult("unavailable")
        try:
            future = _executor.submit(self._search_sync, query)
        except Exception:
            _slots.release()
            return WebSearchResult("unavailable")
        # Release only when the actual worker exits, even if HTTP callers time
        # out/cancel. No unbounded queue or early-release extra workers.
        future.add_done_callback(lambda _: _slots.release())
        wrapped = asyncio.wrap_future(future)
        # Retrieve late failures after a caller timeout/cancellation as well.
        wrapped.add_done_callback(
            lambda done: done.exception() if not done.cancelled() else None
        )
        try:
            rows = await asyncio.wait_for(asyncio.shield(wrapped), self.timeout_seconds)
        except Exception:
            return WebSearchResult("unavailable")
        return normalize_results(rows, self.max_results)


def search_limitation(status: str) -> str:
    return {
        "empty": "ยังไม่พบแหล่งข้อมูลทางการที่ตรงคำถาม จึงยังยืนยันข้อมูลล่าสุดไม่ได้ครับ",
        "blocked": "ค้นเว็บได้เฉพาะข้อมูลสาธารณะเรื่องโครงการช่วยใช้จ่ายและการชำระเงิน กรุณาถามโดยไม่ใส่ข้อมูลส่วนตัว ข้อมูลร้านและ Coins ต้องตรวจจากระบบครับ",
        "disabled": "ตอนนี้ปิดการค้นอินเทอร์เน็ตอยู่ จึงยังตรวจสอบข้อมูลล่าสุดไม่ได้ครับ",
        "unavailable": "ตอนนี้ค้นอินเทอร์เน็ตไม่สำเร็จ กรุณาลองใหม่อีกครั้งครับ",
    }[status]


def cited_reply(reply: str, result: WebSearchResult, store_summary: str = "") -> str:
    if result.status != "ok":
        return (search_limitation(result.status) + " " + store_summary).strip()
    references = re.findall(r"\[([0-9]+)\]", reply)
    allowed_references = {str(index) for index in range(1, len(result.sources) + 1)}
    if (
        not references
        or any(index not in allowed_references for index in references)
        or re.search(r"https?://|www\.|\]\(", reply, re.IGNORECASE)
    ):
        reply = (
            "พบแหล่งข้อมูลทางการที่เกี่ยวข้อง กรุณาอ่านรายละเอียดล่าสุดจากลิงก์ด้านล่างครับ "
            + store_summary
        ).strip()
    links = []
    for index, source in enumerate(result.sources, 1):
        title = re.sub(r"([\\\[\]()`*_])", r"\\\1", source.title)
        links.append(f"[{index}] [{title}]({source.url})")
    return (
        "ผลค้นอาจมีประกาศเก่า โปรดตรวจวันที่และช่วงโครงการจากแหล่งอ้างอิงครับ\n\n"
        + reply
        + "\n\n"
        + "\n".join(links)
    )


def get_web_search_service() -> WebSearchService:
    settings = get_settings()
    return WebSearchService(
        settings.web_search_enabled,
        settings.web_search_timeout_seconds,
        settings.web_search_max_results,
    )

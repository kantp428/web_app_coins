"""Authenticated chat and recommendation orchestration."""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from schemas.chat import ChatRequest, ChatResponse, RecommendationChatRequest
from services.llm import LLMService, LLMServiceError, get_llm_service
from services.backend import BackendService, BackendServiceError, get_backend_service
from services.web_search import WebSearchService, get_web_search_service

router = APIRouter(tags=["chat"])
bearer = HTTPBearer(auto_error=False)


@router.post(
    "/chat",
    response_model=ChatResponse,
    responses={
        401: {"description": "Missing, invalid or expired Bearer token"},
        403: {"description": "CUSTOMER role required"},
        502: {"description": "Backend/model error, invalid data or tool call"},
        503: {"description": "Backend/model unavailable or model not found"},
        504: {"description": "Backend/model response timeout"},
    },
)
async def chat(
    request: RecommendationChatRequest,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    service: LLMService = Depends(get_llm_service),
    backend: BackendService = Depends(get_backend_service),
    web_search: WebSearchService = Depends(get_web_search_service),
) -> ChatResponse:
    if credentials is None or len(credentials.credentials) > 8192:
        raise HTTPException(
            401, "กรุณาแนบ Bearer token", headers={"WWW-Authenticate": "Bearer"}
        )
    try:
        token = credentials.credentials
        context = await backend.context(token)

        async def search(category_ids: list[str]):
            shops = await backend.catalog(token, category_ids)
            shop_ids = await service.related_shops(request.message, shops)
            return await backend.search(token, category_ids, None, shop_ids)

        reply, store_ids, sources = await service.generate_chat(
            request.message,
            context,
            search,
            web_search,
        )
    except (LLMServiceError, BackendServiceError) as error:
        raise HTTPException(
            status_code=error.status_code, detail=error.detail
        ) from error
    return ChatResponse(
        reply=reply, storeIds=store_ids, sources=sources, model=service.model
    )


@router.post(
    "/chat/test",
    response_model=ChatResponse,
    summary="Test model chat and public Search without a token",
    description="Local development: no user context, Backend reads or shop recommendations. Use /chat with a CUSTOMER token for recommendations.",
    responses={
        502: {"description": "Model error, invalid data or unavailable tool call"},
        503: {"description": "Model unavailable or not found"},
        504: {"description": "Model response timeout"},
    },
)
async def test_chat(
    request: ChatRequest,
    service: LLMService = Depends(get_llm_service),
    web_search: WebSearchService = Depends(get_web_search_service),
) -> ChatResponse:
    try:
        reply, _, sources = await service.generate_chat(
            request.message, web_search=web_search
        )
    except LLMServiceError as error:
        raise HTTPException(error.status_code, error.detail) from error
    return ChatResponse(reply=reply, storeIds=[], sources=sources, model=service.model)

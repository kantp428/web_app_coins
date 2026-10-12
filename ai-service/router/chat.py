"""Authenticated chat and recommendation orchestration."""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from schemas.chat import ChatRequest, ChatResponse
from services.llm import LLMService, LLMServiceError, get_llm_service
from services.backend import BackendService, BackendServiceError, get_backend_service

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
    request: ChatRequest,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    service: LLMService = Depends(get_llm_service),
    backend: BackendService = Depends(get_backend_service),
) -> ChatResponse:
    if credentials is None or len(credentials.credentials) > 8192:
        raise HTTPException(
            401, "กรุณาแนบ Bearer token", headers={"WWW-Authenticate": "Bearer"}
        )
    try:
        token = credentials.credentials
        context = await backend.context(token)

        async def search(category_ids: list[str]):
            return await backend.search(token, category_ids)

        reply, store_ids = await service.generate_chat(request.message, context, search)
    except (LLMServiceError, BackendServiceError) as error:
        raise HTTPException(
            status_code=error.status_code, detail=error.detail
        ) from error
    return ChatResponse(reply=reply, storeIds=store_ids, model=service.model)

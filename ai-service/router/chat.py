"""Chat HTTP route. Business recommendation workflow will be added separately."""

from fastapi import APIRouter, Depends, HTTPException

from schemas.chat import ChatRequest, ChatResponse
from services.llm import LLMService, LLMServiceError, get_llm_service

router = APIRouter(tags=["chat"])


@router.post(
    "/chat",
    response_model=ChatResponse,
    responses={
        502: {"description": "Model server error or invalid response"},
        503: {"description": "Model server unavailable or model not found"},
        504: {"description": "Model response timeout"},
    },
)
async def chat(
    request: ChatRequest, service: LLMService = Depends(get_llm_service)
) -> ChatResponse:
    try:
        reply = await service.generate_reply(request.message)
    except LLMServiceError as error:
        raise HTTPException(
            status_code=error.status_code, detail=error.detail
        ) from error
    return ChatResponse(reply=reply, model=service.model)

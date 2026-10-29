"""All-match Explore search, independent of chat purchase-history quotas."""

from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from schemas.chat import StoreLocation
from schemas.store_search import StoreSearchRequest, StoreSearchResponse
from services.backend import BackendService, BackendServiceError, get_backend_service
from services.llm import LLMService, LLMServiceError, get_llm_service

router = APIRouter(tags=["stores"])
bearer = HTTPBearer(auto_error=False)


@router.post(
    "/stores/search",
    response_model=StoreSearchResponse,
    responses={
        401: {"description": "Missing, invalid or expired Bearer token"},
        403: {"description": "CUSTOMER role required"},
        502: {"description": "Invalid discovery/model data or upstream failure"},
        503: {"description": "Backend/model unavailable"},
        504: {"description": "Backend/model timeout"},
    },
)
async def search_stores(
    request: StoreSearchRequest,
    response: Response,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    service: LLMService = Depends(get_llm_service),
    backend: BackendService = Depends(get_backend_service),
) -> StoreSearchResponse:
    response.headers["Cache-Control"] = "no-store"
    if credentials is None or len(credentials.credentials) > 8192:
        raise HTTPException(
            401, "กรุณาแนบ Bearer token", headers={"WWW-Authenticate": "Bearer"}
        )
    try:
        token = credentials.credentials
        await backend.require_customer(token)
        location = StoreLocation(
            latitude=request.latitude,
            longitude=request.longitude,
            radiusKm=request.radiusKm,
        )
        page = await backend.nearby_page(token, location, request.page)
        ids = await service.related_shops(request.query, page.stores)
        selected = set(ids)
        # Preserve discovery's nearest/ID order across model batches and pages.
        return StoreSearchResponse(
            shopIds=[shop.id for shop in page.stores if shop.id in selected],
            meta=page.meta,
        )
    except (BackendServiceError, LLMServiceError) as error:
        raise HTTPException(error.status_code, error.detail) from error

from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse

from app.middleware.auth import decode_access_token
from app.services.sse_service import sse_service

router = APIRouter(prefix="/api/stores/{store_id}/sse", tags=["sse"])


@router.get("/orders")
async def stream_orders(
    store_id: int,
    token: str = Query(..., description="JWT 인증 토큰"),
):
    payload = decode_access_token(token)
    if payload.get("role") != "admin":
        raise HTTPException(403, detail="접근 권한이 없습니다")
    if payload.get("store_id") != store_id:
        raise HTTPException(403, detail="접근 권한이 없습니다")

    return StreamingResponse(
        sse_service.subscribe(store_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

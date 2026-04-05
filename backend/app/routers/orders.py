from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import require_role
from app.schemas.order import (
    OrderCreateRequest,
    OrderResponse,
    CurrentSessionOrdersResponse,
)
from app.services import order_service

router = APIRouter(prefix="/api/stores/{store_id}/orders", tags=["orders"])


@router.post("", response_model=OrderResponse, status_code=201)
async def create_order(
    store_id: int,
    data: OrderCreateRequest,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("table")),
):
    items = [{"menu_id": item.menu_id, "quantity": item.quantity} for item in data.items]
    order = await order_service.create_order(db, store_id, data.table_id, items)
    return order


@router.get(
    "/table/{table_id}/current",
    response_model=CurrentSessionOrdersResponse,
)
async def get_current_session_orders(
    store_id: int,
    table_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("table")),
):
    result = await order_service.get_current_session_orders(db, store_id, table_id)
    return result

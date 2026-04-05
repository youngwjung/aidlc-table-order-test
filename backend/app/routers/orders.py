from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import require_role
from app.schemas.order import (
    OrderCreateRequest,
    OrderResponse,
    CurrentSessionOrdersResponse,
    OrderStatusUpdate,
    OrderHistoryResponse,
)
from app.services import order_service
from app.services.sse_service import sse_service

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


@router.get("", response_model=list[OrderResponse])
async def get_orders(
    store_id: int,
    table_id: int | None = Query(None),
    status: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("admin")),
):
    return await order_service.get_orders(db, store_id, table_id, status)


@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    store_id: int,
    order_id: int,
    data: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("admin")),
):
    order = await order_service.update_order_status(db, store_id, order_id, data.status)
    await sse_service.broadcast(store_id, "order_status_changed", {
        "order_id": order.id,
        "table_id": order.table_id,
        "status": order.status,
    })
    return order


@router.delete("/{order_id}", status_code=204)
async def delete_order(
    store_id: int,
    order_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("admin")),
):
    deleted_info = await order_service.delete_order(db, store_id, order_id)
    await sse_service.broadcast(store_id, "order_deleted", deleted_info)


@router.get("/table/{table_id}/history", response_model=list[OrderHistoryResponse])
async def get_order_history(
    store_id: int,
    table_id: int,
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("admin")),
):
    return await order_service.get_order_history(db, store_id, table_id, date_from, date_to)

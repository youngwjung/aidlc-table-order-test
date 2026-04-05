import uuid
from datetime import date, datetime, timezone

from sqlalchemy import select, and_, func, cast, Date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException

from app.models.order import Order, OrderItem
from app.models.order_history import OrderHistory, OrderHistoryItem
from app.models.table import Table
from app.models.menu import Menu


VALID_TRANSITIONS = {
    "pending": "preparing",
    "preparing": "completed",
}


async def create_order(
    db: AsyncSession, store_id: int, table_id: int, items: list[dict]
) -> Order:
    if not items:
        raise HTTPException(422, detail="장바구니가 비어있습니다")

    table = await db.execute(
        select(Table).where(Table.id == table_id, Table.store_id == store_id)
    )
    table = table.scalar_one_or_none()
    if not table:
        raise HTTPException(404, detail="테이블을 찾을 수 없습니다")

    menu_ids = [item["menu_id"] for item in items]
    result = await db.execute(
        select(Menu).where(Menu.id.in_(menu_ids), Menu.store_id == store_id)
    )
    menus = {m.id: m for m in result.scalars().all()}

    invalid_ids = [mid for mid in menu_ids if mid not in menus]
    if invalid_ids:
        raise HTTPException(422, detail=f"유효하지 않은 메뉴: {invalid_ids}")

    if not table.session_id:
        table.session_id = str(uuid.uuid4())
        table.session_started_at = datetime.now(timezone.utc)

    today = date.today()
    count_result = await db.execute(
        select(func.count(Order.id)).where(
            Order.store_id == store_id,
            func.date(Order.created_at) == today,
        )
    )
    order_count = count_result.scalar() or 0
    order_number = f"{order_count + 1:03d}"

    total_amount = 0
    order_items = []
    for item in items:
        menu = menus[item["menu_id"]]
        quantity = item["quantity"]
        total_amount += menu.price * quantity
        order_items.append(OrderItem(
            menu_name=menu.name,
            quantity=quantity,
            unit_price=menu.price,
        ))

    order = Order(
        store_id=store_id,
        table_id=table_id,
        session_id=table.session_id,
        order_number=order_number,
        status="pending",
        total_amount=total_amount,
    )
    order.items = order_items
    db.add(order)
    await db.flush()
    await db.refresh(order, ["items"])
    return order


async def get_current_session_orders(
    db: AsyncSession, store_id: int, table_id: int
) -> dict:
    table = await db.execute(
        select(Table).where(Table.id == table_id, Table.store_id == store_id)
    )
    table = table.scalar_one_or_none()
    if not table:
        raise HTTPException(404, detail="테이블을 찾을 수 없습니다")

    if not table.session_id:
        return {"orders": [], "session_total": 0}

    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(
            Order.store_id == store_id,
            Order.table_id == table_id,
            Order.session_id == table.session_id,
        )
        .order_by(Order.created_at.desc())
    )
    orders = result.scalars().all()

    session_total = sum(o.total_amount for o in orders)
    return {"orders": orders, "session_total": session_total}


async def get_orders(
    db: AsyncSession, store_id: int, table_id: int | None = None, status: str | None = None
) -> list[Order]:
    query = select(Order).options(selectinload(Order.items)).where(Order.store_id == store_id)
    if table_id is not None:
        query = query.where(Order.table_id == table_id)
    if status is not None:
        query = query.where(Order.status == status)
    query = query.order_by(Order.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


async def update_order_status(db: AsyncSession, store_id: int, order_id: int, new_status: str) -> Order:
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(
            and_(Order.id == order_id, Order.store_id == store_id)
        )
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(404, detail="주문을 찾을 수 없습니다")

    expected_next = VALID_TRANSITIONS.get(order.status)
    if expected_next != new_status:
        raise HTTPException(400, detail="현재 상태에서 해당 상태로 변경할 수 없습니다")

    order.status = new_status
    await db.flush()
    return order


async def delete_order(db: AsyncSession, store_id: int, order_id: int) -> dict:
    result = await db.execute(
        select(Order).where(and_(Order.id == order_id, Order.store_id == store_id))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(404, detail="주문을 찾을 수 없습니다")

    deleted_info = {
        "order_id": order.id,
        "table_id": order.table_id,
        "deleted_amount": order.total_amount,
    }
    await db.delete(order)
    await db.flush()
    return deleted_info


async def get_order_history(
    db: AsyncSession,
    store_id: int,
    table_id: int,
    date_from: str | None = None,
    date_to: str | None = None,
) -> list[OrderHistory]:
    query = (
        select(OrderHistory)
        .options(selectinload(OrderHistory.items))
        .where(and_(OrderHistory.store_id == store_id, OrderHistory.table_id == table_id))
    )
    if date_from:
        query = query.where(OrderHistory.completed_at >= datetime.strptime(date_from, "%Y-%m-%d"))
    if date_to:
        next_day = datetime.strptime(date_to, "%Y-%m-%d").replace(hour=23, minute=59, second=59)
        query = query.where(OrderHistory.completed_at <= next_day)

    query = query.order_by(OrderHistory.completed_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


async def move_orders_to_history(db: AsyncSession, store_id: int, table_id: int, session_id: str, table_number: int) -> None:
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(
            and_(Order.store_id == store_id, Order.table_id == table_id, Order.session_id == session_id)
        )
    )
    orders = list(result.scalars().all())

    now = datetime.now(timezone.utc)
    for order in orders:
        history = OrderHistory(
            store_id=store_id,
            table_id=table_id,
            table_number=table_number,
            session_id=session_id,
            order_number=order.order_number,
            total_amount=order.total_amount,
            ordered_at=order.created_at,
            completed_at=now,
        )
        db.add(history)
        await db.flush()

        for item in order.items:
            history_item = OrderHistoryItem(
                order_history_id=history.id,
                menu_name=item.menu_name,
                quantity=item.quantity,
                unit_price=item.unit_price,
            )
            db.add(history_item)

        await db.delete(order)

    await db.flush()

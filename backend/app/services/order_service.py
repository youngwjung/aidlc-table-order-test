import uuid
from datetime import date, datetime, timezone

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException

from app.models.order import Order, OrderItem
from app.models.table import Table
from app.models.menu import Menu


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

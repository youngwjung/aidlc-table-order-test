from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException

from app.models.table import Table
from app.models.order import Order
from app.services import order_service
from app.services.sse_service import sse_service


async def get_tables(db: AsyncSession, store_id: int) -> list[Table]:
    result = await db.execute(
        select(Table).where(Table.store_id == store_id).order_by(Table.table_number)
    )
    return list(result.scalars().all())


async def get_table(db: AsyncSession, store_id: int, table_id: int) -> Table:
    result = await db.execute(
        select(Table).where(and_(Table.id == table_id, Table.store_id == store_id))
    )
    table = result.scalar_one_or_none()
    if not table:
        raise HTTPException(404, detail="테이블을 찾을 수 없습니다")
    return table


async def create_table(db: AsyncSession, store_id: int, table_number: int, password: str) -> Table:
    existing = await db.execute(
        select(Table).where(and_(Table.store_id == store_id, Table.table_number == table_number))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(409, detail="이미 존재하는 테이블 번호입니다")

    table = Table(store_id=store_id, table_number=table_number, password=password)
    db.add(table)
    await db.flush()
    return table


async def update_table(db: AsyncSession, store_id: int, table_id: int, data: dict) -> Table:
    table = await get_table(db, store_id, table_id)

    if "table_number" in data and data["table_number"] is not None and data["table_number"] != table.table_number:
        existing = await db.execute(
            select(Table).where(
                and_(Table.store_id == store_id, Table.table_number == data["table_number"], Table.id != table_id)
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(409, detail="이미 존재하는 테이블 번호입니다")
        table.table_number = data["table_number"]

    if "password" in data and data["password"] is not None:
        table.password = data["password"]

    await db.flush()
    return table


async def delete_table(db: AsyncSession, store_id: int, table_id: int) -> None:
    table = await get_table(db, store_id, table_id)

    if table.session_id is not None:
        raise HTTPException(400, detail="활성 세션이 있는 테이블은 삭제할 수 없습니다. 이용 완료 후 삭제해 주세요")

    order_result = await db.execute(
        select(Order).where(and_(Order.store_id == store_id, Order.table_id == table_id)).limit(1)
    )
    if order_result.scalar_one_or_none():
        raise HTTPException(400, detail="현재 주문이 있는 테이블은 삭제할 수 없습니다")

    await db.delete(table)
    await db.flush()


async def complete_session(db: AsyncSession, store_id: int, table_id: int) -> dict:
    table = await get_table(db, store_id, table_id)

    if table.session_id is None:
        raise HTTPException(400, detail="활성 세션이 없습니다")

    session_id = table.session_id
    table_number = table.table_number

    await order_service.move_orders_to_history(db, store_id, table_id, session_id, table_number)

    table.session_id = None
    table.session_started_at = None
    await db.flush()

    from datetime import datetime, timezone
    completed_at = datetime.now(timezone.utc).isoformat()

    await sse_service.broadcast(store_id, "table_completed", {
        "table_id": table_id,
        "table_number": table_number,
        "completed_at": completed_at,
    })

    return {"message": "이용 완료 처리되었습니다", "completed_at": completed_at}

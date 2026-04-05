from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.models.store import Store
from app.models.admin_user import AdminUser
from app.middleware.auth import hash_password
from app.schemas.store import SetupRequest


async def check_setup_required(db: AsyncSession) -> bool:
    result = await db.execute(select(func.count(Store.id)))
    count = result.scalar()
    return count == 0


async def setup_store(db: AsyncSession, data: SetupRequest) -> Store:
    existing = await db.execute(select(func.count(Store.id)))
    if existing.scalar() > 0:
        raise HTTPException(400, detail="초기 설정이 이미 완료되었습니다")

    identifier_check = await db.execute(
        select(Store).where(Store.identifier == data.store_identifier)
    )
    if identifier_check.scalar_one_or_none():
        raise HTTPException(400, detail="이미 사용 중인 매장 식별자입니다")

    store = Store(name=data.store_name, identifier=data.store_identifier)
    db.add(store)
    await db.flush()

    admin = AdminUser(
        store_id=store.id,
        username=data.admin_username,
        password_hash=hash_password(data.admin_password),
    )
    db.add(admin)
    return store


async def get_store(db: AsyncSession, store_id: int) -> Store:
    result = await db.execute(select(Store).where(Store.id == store_id))
    store = result.scalar_one_or_none()
    if not store:
        raise HTTPException(404, detail="매장을 찾을 수 없습니다")
    return store

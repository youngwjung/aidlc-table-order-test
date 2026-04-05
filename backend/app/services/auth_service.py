from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import JWT_EXPIRE_HOURS
from app.models.store import Store
from app.models.admin_user import AdminUser
from app.models.table import Table
from app.middleware.auth import verify_password, create_access_token
from app.middleware.rate_limiter import check_rate_limit, record_failed_attempt, clear_attempts
from app.schemas.auth import TokenResponse

from fastapi import HTTPException

ADMIN_LOGIN_ERROR = "매장 식별자, 사용자명 또는 비밀번호가 올바르지 않습니다"
TABLE_LOGIN_ERROR = "인증에 실패했습니다"


async def authenticate_admin(
    db: AsyncSession, store_identifier: str, username: str, password: str
) -> TokenResponse:
    rate_key = f"{store_identifier}:{username}"
    check_rate_limit(rate_key)

    result = await db.execute(select(Store).where(Store.identifier == store_identifier))
    store = result.scalar_one_or_none()
    if not store:
        record_failed_attempt(rate_key)
        raise HTTPException(401, detail=ADMIN_LOGIN_ERROR)

    result = await db.execute(
        select(AdminUser).where(AdminUser.store_id == store.id, AdminUser.username == username)
    )
    admin = result.scalar_one_or_none()
    if not admin:
        record_failed_attempt(rate_key)
        raise HTTPException(401, detail=ADMIN_LOGIN_ERROR)

    if not verify_password(password, admin.password_hash):
        record_failed_attempt(rate_key)
        raise HTTPException(401, detail=ADMIN_LOGIN_ERROR)

    clear_attempts(rate_key)
    token = create_access_token({"sub": admin.id, "store_id": store.id, "role": "admin"})
    return TokenResponse(
        access_token=token,
        expires_in=JWT_EXPIRE_HOURS * 3600,
    )


async def authenticate_table(
    db: AsyncSession, store_identifier: str, table_number: int, password: str
) -> TokenResponse:
    result = await db.execute(select(Store).where(Store.identifier == store_identifier))
    store = result.scalar_one_or_none()
    if not store:
        raise HTTPException(401, detail=TABLE_LOGIN_ERROR)

    result = await db.execute(
        select(Table).where(Table.store_id == store.id, Table.table_number == table_number)
    )
    table = result.scalar_one_or_none()
    if not table:
        raise HTTPException(401, detail=TABLE_LOGIN_ERROR)

    if table.password != password:
        raise HTTPException(401, detail=TABLE_LOGIN_ERROR)

    token = create_access_token({
        "sub": table.id,
        "store_id": store.id,
        "table_number": table.table_number,
        "role": "table",
    })
    return TokenResponse(
        access_token=token,
        store_id=store.id,
        table_id=table.id,
    )

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.auth import AdminLoginRequest, TableLoginRequest, TokenResponse
from app.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/admin/login", response_model=TokenResponse)
async def admin_login(data: AdminLoginRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.authenticate_admin(
        db, data.store_identifier, data.username, data.password
    )


@router.post("/table/login", response_model=TokenResponse)
async def table_login(data: TableLoginRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.authenticate_table(
        db, data.store_identifier, data.table_number, data.password
    )

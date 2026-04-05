from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import require_role
from app.schemas.table import TableCreate, TableUpdate, TableResponse
from app.services import table_service

router = APIRouter(prefix="/api/stores/{store_id}/tables", tags=["tables"])


@router.get("", response_model=list[TableResponse])
async def get_tables(
    store_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("admin")),
):
    return await table_service.get_tables(db, store_id)


@router.post("", response_model=TableResponse, status_code=201)
async def create_table(
    store_id: int,
    data: TableCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("admin")),
):
    return await table_service.create_table(db, store_id, data.table_number, data.password)


@router.put("/{table_id}", response_model=TableResponse)
async def update_table(
    store_id: int,
    table_id: int,
    data: TableUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("admin")),
):
    return await table_service.update_table(db, store_id, table_id, data.model_dump(exclude_none=True))


@router.delete("/{table_id}", status_code=204)
async def delete_table(
    store_id: int,
    table_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("admin")),
):
    await table_service.delete_table(db, store_id, table_id)


@router.post("/{table_id}/complete")
async def complete_session(
    store_id: int,
    table_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("admin")),
):
    return await table_service.complete_session(db, store_id, table_id)

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user, require_role
from app.schemas.category import (
    CategoryCreate,
    CategoryReorderRequest,
    CategoryResponse,
    CategoryUpdate,
)
from app.services import category_service

router = APIRouter(prefix="/api/stores/{store_id}/categories", tags=["categories"])


@router.get("/", response_model=list[CategoryResponse])
async def get_categories(
    store_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    return await category_service.get_categories(db, store_id)


@router.post("/", response_model=CategoryResponse)
async def create_category(
    store_id: int,
    data: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("admin")),
):
    return await category_service.create_category(db, store_id, data)


@router.put("/reorder", response_model=list[CategoryResponse])
async def reorder_categories(
    store_id: int,
    data: CategoryReorderRequest,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("admin")),
):
    return await category_service.reorder_categories(db, store_id, data)


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    store_id: int,
    category_id: int,
    data: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("admin")),
):
    return await category_service.update_category(db, store_id, category_id, data)


@router.delete("/{category_id}", status_code=204)
async def delete_category(
    store_id: int,
    category_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("admin")),
):
    await category_service.delete_category(db, store_id, category_id)

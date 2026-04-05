from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user, require_role
from app.schemas.menu import (
    MenuCreate,
    MenuReorderRequest,
    MenuResponse,
    MenuUpdate,
)
from app.services import menu_service

router = APIRouter(prefix="/api/stores/{store_id}/menus", tags=["menus"])


@router.get("/", response_model=list[MenuResponse])
async def get_menus(
    store_id: int,
    category_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    return await menu_service.get_menus(db, store_id, category_id)


@router.post("/", response_model=MenuResponse)
async def create_menu(
    store_id: int,
    name: str = Form(...),
    price: int = Form(...),
    category_id: int = Form(...),
    description: str | None = Form(None),
    display_order: int = Form(0),
    image: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("admin")),
):
    data = MenuCreate(
        name=name,
        price=price,
        category_id=category_id,
        description=description,
        display_order=display_order,
    )
    return await menu_service.create_menu(db, store_id, data, image)


@router.put("/reorder", response_model=list[MenuResponse])
async def reorder_menus(
    store_id: int,
    data: MenuReorderRequest,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("admin")),
):
    return await menu_service.reorder_menus(db, store_id, data)


@router.put("/{menu_id}", response_model=MenuResponse)
async def update_menu(
    store_id: int,
    menu_id: int,
    name: str | None = Form(None),
    price: int | None = Form(None),
    category_id: int | None = Form(None),
    description: str | None = Form(None),
    display_order: int | None = Form(None),
    image: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("admin")),
):
    data = MenuUpdate(
        name=name,
        price=price,
        category_id=category_id,
        description=description,
        display_order=display_order,
    )
    return await menu_service.update_menu(db, store_id, menu_id, data, image)


@router.delete("/{menu_id}", status_code=204)
async def delete_menu(
    store_id: int,
    menu_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("admin")),
):
    await menu_service.delete_menu(db, store_id, menu_id)

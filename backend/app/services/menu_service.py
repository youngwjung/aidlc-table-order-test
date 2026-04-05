import os

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, UploadFile

from app.models.menu import Menu
from app.models.category import Category
from app.schemas.menu import MenuCreate, MenuUpdate
from app.services import image_service


async def create_menu(
    db: AsyncSession, store_id: int, data: MenuCreate, image_file: UploadFile | None = None
) -> Menu:
    result = await db.execute(
        select(Category).where(Category.store_id == store_id, Category.id == data.category_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(400, detail="해당 카테고리가 존재하지 않습니다")

    image_url = None
    if image_file:
        image_url = await image_service.upload_image(image_file)

    menu = Menu(
        store_id=store_id,
        category_id=data.category_id,
        name=data.name,
        price=data.price,
        description=data.description,
        image_url=image_url,
        display_order=data.display_order,
    )
    db.add(menu)
    await db.commit()
    await db.refresh(menu)
    return menu


async def get_menus(
    db: AsyncSession, store_id: int, category_id: int | None = None
) -> list[Menu]:
    query = select(Menu).where(Menu.store_id == store_id)
    if category_id is not None:
        query = query.where(Menu.category_id == category_id)
    query = query.order_by(Menu.display_order.asc())

    result = await db.execute(query)
    return list(result.scalars().all())


async def get_menu(db: AsyncSession, store_id: int, menu_id: int) -> Menu:
    result = await db.execute(
        select(Menu).where(Menu.store_id == store_id, Menu.id == menu_id)
    )
    menu = result.scalar_one_or_none()
    if not menu:
        raise HTTPException(404, detail="메뉴를 찾을 수 없습니다")
    return menu


async def update_menu(
    db: AsyncSession,
    store_id: int,
    menu_id: int,
    data: MenuUpdate,
    image_file: UploadFile | None = None,
) -> Menu:
    menu = await get_menu(db, store_id, menu_id)

    if data.category_id is not None and data.category_id != menu.category_id:
        result = await db.execute(
            select(Category).where(Category.store_id == store_id, Category.id == data.category_id)
        )
        if not result.scalar_one_or_none():
            raise HTTPException(400, detail="해당 카테고리가 존재하지 않습니다")

    if image_file:
        if menu.image_url:
            old_filename = os.path.basename(menu.image_url)
            await image_service.delete_image(old_filename)
        menu.image_url = await image_service.upload_image(image_file)

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(menu, key, value)

    await db.commit()
    await db.refresh(menu)
    return menu


async def delete_menu(db: AsyncSession, store_id: int, menu_id: int) -> None:
    menu = await get_menu(db, store_id, menu_id)

    if menu.image_url:
        filename = os.path.basename(menu.image_url)
        await image_service.delete_image(filename)

    await db.delete(menu)
    await db.commit()


async def reorder_menus(
    db: AsyncSession, store_id: int, menu_ids: list[int]
) -> list[Menu]:
    result = await db.execute(
        select(Menu).where(Menu.store_id == store_id)
    )
    menus = {m.id: m for m in result.scalars().all()}

    for mid in menu_ids:
        if mid not in menus:
            raise HTTPException(400, detail=f"메뉴 ID {mid}이(가) 해당 매장에 존재하지 않습니다")

    for index, mid in enumerate(menu_ids):
        menus[mid].display_order = index

    await db.commit()

    return await get_menus(db, store_id)

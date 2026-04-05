from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.models.category import Category
from app.models.menu import Menu
from app.schemas.category import CategoryCreate, CategoryUpdate


async def create_category(db: AsyncSession, store_id: int, data: CategoryCreate) -> Category:
    result = await db.execute(
        select(Category).where(Category.store_id == store_id, Category.name == data.name)
    )
    if result.scalar_one_or_none():
        raise HTTPException(409, detail="이미 존재하는 카테고리 이름입니다")

    category = Category(store_id=store_id, name=data.name, display_order=data.display_order)
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


async def get_categories(db: AsyncSession, store_id: int) -> list[Category]:
    result = await db.execute(
        select(Category).where(Category.store_id == store_id).order_by(Category.display_order.asc())
    )
    return list(result.scalars().all())


async def get_category(db: AsyncSession, store_id: int, category_id: int) -> Category:
    result = await db.execute(
        select(Category).where(Category.store_id == store_id, Category.id == category_id)
    )
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(404, detail="카테고리를 찾을 수 없습니다")
    return category


async def update_category(
    db: AsyncSession, store_id: int, category_id: int, data: CategoryUpdate
) -> Category:
    category = await get_category(db, store_id, category_id)

    if data.name is not None and data.name != category.name:
        result = await db.execute(
            select(Category).where(Category.store_id == store_id, Category.name == data.name)
        )
        if result.scalar_one_or_none():
            raise HTTPException(409, detail="이미 존재하는 카테고리 이름입니다")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(category, key, value)

    await db.commit()
    await db.refresh(category)
    return category


async def delete_category(db: AsyncSession, store_id: int, category_id: int) -> None:
    category = await get_category(db, store_id, category_id)

    result = await db.execute(
        select(func.count()).select_from(Menu).where(
            Menu.category_id == category_id, Menu.store_id == store_id
        )
    )
    menu_count = result.scalar()
    if menu_count and menu_count > 0:
        raise HTTPException(400, detail="메뉴가 존재하는 카테고리는 삭제할 수 없습니다")

    await db.delete(category)
    await db.commit()


async def reorder_categories(
    db: AsyncSession, store_id: int, category_ids: list[int]
) -> list[Category]:
    result = await db.execute(
        select(Category).where(Category.store_id == store_id)
    )
    categories = {c.id: c for c in result.scalars().all()}

    for cid in category_ids:
        if cid not in categories:
            raise HTTPException(400, detail=f"카테고리 ID {cid}이(가) 해당 매장에 존재하지 않습니다")

    for index, cid in enumerate(category_ids):
        categories[cid].display_order = index

    await db.commit()

    return await get_categories(db, store_id)

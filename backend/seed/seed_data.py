"""
Seed script for Unit 3 development.
Inserts test categories and menus for order flow testing.

Usage:
  docker exec -it backend python -m seed.seed_data
  OR
  cd backend && python -m seed.seed_data
"""

import asyncio

from sqlalchemy import select, func
from app.database import async_session_maker, engine
from app.models import Base
from app.models.store import Store
from app.models.category import Category
from app.models.menu import Menu


SEED_DATA = [
    {
        "category": "메인 메뉴",
        "display_order": 0,
        "menus": [
            {"name": "김치찌개", "price": 9000, "description": "돼지고기 김치찌개", "display_order": 0},
            {"name": "된장찌개", "price": 8000, "description": "두부 된장찌개", "display_order": 1},
            {"name": "비빔밥", "price": 10000, "description": "야채 비빔밥", "display_order": 2},
        ],
    },
    {
        "category": "사이드 메뉴",
        "display_order": 1,
        "menus": [
            {"name": "공기밥", "price": 1000, "description": None, "display_order": 0},
            {"name": "계란말이", "price": 7000, "description": "치즈 계란말이", "display_order": 1},
            {"name": "김치전", "price": 8000, "description": "바삭한 김치전", "display_order": 2},
        ],
    },
    {
        "category": "음료",
        "display_order": 2,
        "menus": [
            {"name": "콜라", "price": 2000, "description": None, "display_order": 0},
            {"name": "사이다", "price": 2000, "description": None, "display_order": 1},
            {"name": "맥주", "price": 5000, "description": "생맥주 500ml", "display_order": 2},
        ],
    },
]


async def seed():
    async with async_session_maker() as db:
        result = await db.execute(select(Store).limit(1))
        store = result.scalar_one_or_none()
        if not store:
            print("ERROR: No store found. Please complete initial setup first.")
            return

        existing = await db.execute(
            select(func.count(Category.id)).where(Category.store_id == store.id)
        )
        if existing.scalar() > 0:
            print(f"Seed data already exists for store '{store.name}'. Skipping.")
            return

        for cat_data in SEED_DATA:
            category = Category(
                store_id=store.id,
                name=cat_data["category"],
                display_order=cat_data["display_order"],
            )
            db.add(category)
            await db.flush()

            for menu_data in cat_data["menus"]:
                menu = Menu(
                    store_id=store.id,
                    category_id=category.id,
                    name=menu_data["name"],
                    price=menu_data["price"],
                    description=menu_data["description"],
                    display_order=menu_data["display_order"],
                )
                db.add(menu)

        await db.commit()
        print(f"Seed data inserted for store '{store.name}':")
        print(f"  - {len(SEED_DATA)} categories")
        print(f"  - {sum(len(c['menus']) for c in SEED_DATA)} menus")


if __name__ == "__main__":
    asyncio.run(seed())

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.schemas.store import SetupRequest, StoreResponse, CheckSetupResponse
from app.services import store_service

router = APIRouter(prefix="/api/stores", tags=["stores"])


@router.get("/check-setup", response_model=CheckSetupResponse)
async def check_setup(db: AsyncSession = Depends(get_db)):
    required = await store_service.check_setup_required(db)
    return CheckSetupResponse(setup_required=required)


@router.post("/setup", response_model=StoreResponse)
async def setup(data: SetupRequest, db: AsyncSession = Depends(get_db)):
    store = await store_service.setup_store(db, data)
    return store


@router.get("/{store_id}", response_model=StoreResponse)
async def get_store(
    store_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    return await store_service.get_store(db, store_id)

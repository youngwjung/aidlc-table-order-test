from pydantic import BaseModel, Field


class MenuCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    price: int = Field(..., ge=0, le=10000000)
    description: str | None = None
    category_id: int
    display_order: int = Field(default=0, ge=0)


class MenuUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    price: int | None = Field(None, ge=0, le=10000000)
    description: str | None = None
    category_id: int | None = None
    display_order: int | None = Field(None, ge=0)


class MenuResponse(BaseModel):
    id: int
    store_id: int
    category_id: int
    name: str
    price: int
    description: str | None
    image_url: str | None
    display_order: int

    model_config = {"from_attributes": True}


class MenuReorderRequest(BaseModel):
    menu_ids: list[int]

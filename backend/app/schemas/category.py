from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    display_order: int = Field(default=0, ge=0)


class CategoryUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=50)
    display_order: int | None = Field(None, ge=0)


class CategoryResponse(BaseModel):
    id: int
    store_id: int
    name: str
    display_order: int

    model_config = {"from_attributes": True}


class CategoryReorderRequest(BaseModel):
    category_ids: list[int]

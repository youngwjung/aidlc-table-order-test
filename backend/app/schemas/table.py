from pydantic import BaseModel, Field
from datetime import datetime


class TableCreate(BaseModel):
    table_number: int = Field(..., ge=1)
    password: str = Field(..., min_length=1, max_length=20)


class TableUpdate(BaseModel):
    table_number: int | None = Field(None, ge=1)
    password: str | None = Field(None, min_length=1, max_length=20)


class TableResponse(BaseModel):
    id: int
    store_id: int
    table_number: int
    session_id: str | None
    session_started_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}

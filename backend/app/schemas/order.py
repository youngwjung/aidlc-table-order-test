from pydantic import BaseModel, Field
from datetime import datetime


class OrderItemCreate(BaseModel):
    menu_id: int
    menu_name: str = Field(..., min_length=1, max_length=100)
    quantity: int = Field(..., ge=1, le=99)
    unit_price: int = Field(..., ge=0)


class OrderCreate(BaseModel):
    table_id: int
    session_id: str | None = None
    items: list[OrderItemCreate] = Field(..., min_length=1)


class OrderItemResponse(BaseModel):
    id: int
    menu_name: str
    quantity: int
    unit_price: int

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: int
    store_id: int
    table_id: int
    session_id: str
    order_number: str
    status: str
    total_amount: int
    created_at: datetime
    items: list[OrderItemResponse] = []

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., pattern=r"^(pending|preparing|completed)$")


class OrderCreateRequestItem(BaseModel):
    menu_id: int
    quantity: int = Field(..., ge=1, le=99)


class OrderCreateRequest(BaseModel):
    table_id: int
    items: list[OrderCreateRequestItem] = Field(..., min_length=1)


class CurrentSessionOrdersResponse(BaseModel):
    orders: list[OrderResponse] = []
    session_total: int = 0


class OrderHistoryItemResponse(BaseModel):
    id: int
    menu_name: str
    quantity: int
    unit_price: int

    model_config = {"from_attributes": True}


class OrderHistoryResponse(BaseModel):
    id: int
    store_id: int
    table_id: int
    table_number: int
    session_id: str
    order_number: str
    total_amount: int
    ordered_at: datetime
    completed_at: datetime
    items: list[OrderHistoryItemResponse] = []

    model_config = {"from_attributes": True}

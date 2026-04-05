from pydantic import BaseModel, Field


class AdminLoginRequest(BaseModel):
    store_identifier: str = Field(..., min_length=3, max_length=50)
    username: str = Field(..., min_length=2, max_length=50)
    password: str = Field(..., min_length=4)


class TableLoginRequest(BaseModel):
    store_identifier: str = Field(..., min_length=3, max_length=50)
    table_number: int = Field(..., ge=1)
    password: str = Field(..., min_length=1, max_length=20)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int | None = None
    store_id: int | None = None
    table_id: int | None = None

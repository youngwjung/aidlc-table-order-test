from pydantic import BaseModel, Field
import re


class SetupRequest(BaseModel):
    store_name: str = Field(..., min_length=1, max_length=100)
    store_identifier: str = Field(..., min_length=3, max_length=30, pattern=r"^[a-z0-9\-]+$")
    admin_username: str = Field(..., min_length=2, max_length=30, pattern=r"^[a-z0-9_]+$")
    admin_password: str = Field(..., min_length=4)


class StoreResponse(BaseModel):
    id: int
    name: str
    identifier: str

    model_config = {"from_attributes": True}


class CheckSetupResponse(BaseModel):
    setup_required: bool

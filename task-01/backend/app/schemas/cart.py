from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class CartItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0, description="Quantity must be greater than 0")

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., gt=0)

class CartItemResponse(CartItemBase):
    id: int
    cart_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    id: str
    status: str
    created_at: datetime
    updated_at: datetime
    items: List[CartItemResponse] = []

    class Config:
        from_attributes = True

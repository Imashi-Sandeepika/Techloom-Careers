from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReservationResponse(BaseModel):
    id: str
    cart_id: str
    order_id: Optional[str]
    product_id: int
    quantity: int
    status: str
    expires_at: datetime
    created_at: datetime
    released_at: Optional[datetime]

    class Config:
        from_attributes = True

class CheckoutResponse(BaseModel):
    order: "OrderResponse"
    reservations: list[ReservationResponse]

# Avoiding circular import by keeping this minimal and handling import if necessary
from app.schemas.order import OrderResponse
CheckoutResponse.model_rebuild()

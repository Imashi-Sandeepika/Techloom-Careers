from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PaymentRequest(BaseModel):
    order_id: str = Field(..., description="The ID of the order to pay for")
    outcome: str = Field(..., description="Simulated outcome: 'success', 'failure', or 'timeout'")
    idempotency_key: str = Field(..., description="Unique key to prevent duplicate processing")

class PaymentResponse(BaseModel):
    id: str
    order_id: str
    idempotency_key: str
    amount: float
    status: str
    transaction_reference: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True

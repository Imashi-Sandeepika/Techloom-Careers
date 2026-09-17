from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False, index=True)
    idempotency_key = Column(String, unique=True, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    status = Column(String, nullable=False, default="PENDING") # SUCCESS, FAILED, TIMEOUT, PENDING, REFUNDED
    transaction_reference = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

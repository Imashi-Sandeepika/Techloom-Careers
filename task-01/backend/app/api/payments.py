from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.payment import PaymentRequest, PaymentResponse
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("", response_model=PaymentResponse)
def create_payment(request: PaymentRequest, db: Session = Depends(get_db)):
    return PaymentService.process_payment(db, request)

@router.post("/{payment_id}/refund", response_model=PaymentResponse)
def refund_payment(payment_id: str, db: Session = Depends(get_db)):
    return PaymentService.refund_payment(db, payment_id)

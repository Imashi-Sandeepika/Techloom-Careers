from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.order import CheckoutRequest
from app.schemas.reservation import CheckoutResponse
from app.services.order_service import OrderService

router = APIRouter(prefix="/checkout", tags=["Checkout"])

@router.post("", response_model=CheckoutResponse)
def checkout(request: CheckoutRequest, db: Session = Depends(get_db)):
    order, reservations = OrderService.checkout(db, request.cart_id)
    return {"order": order, "reservations": reservations}

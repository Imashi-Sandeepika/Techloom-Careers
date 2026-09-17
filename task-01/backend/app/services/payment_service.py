from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException
from app.models.payment import Payment
from app.models.order import Order
from app.models.reservation import Reservation
from app.models.product import Product
from app.schemas.payment import PaymentRequest
import uuid
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

class PaymentService:
    @staticmethod
    def process_payment(db: Session, request: PaymentRequest) -> Payment:
        # Idempotency check:
        existing_payment = db.query(Payment).filter(Payment.idempotency_key == request.idempotency_key).first()
        if existing_payment:
            return existing_payment

        try:
            # 1. Lock Order
            order = db.query(Order).filter(Order.id == request.order_id).with_for_update().first()
            if not order:
                raise HTTPException(status_code=404, detail="Order not found")
            
            # If the order is already in a final state, we can't process a payment.
            if order.status != "RESERVED":
                raise HTTPException(status_code=400, detail=f"Cannot process payment for order in {order.status} status")

            payment = Payment(
                id=str(uuid.uuid4()),
                order_id=request.order_id,
                idempotency_key=request.idempotency_key,
                amount=order.total_amount,
                status="PENDING",
            )
            db.add(payment)
            
            reservations = db.query(Reservation).filter(Reservation.order_id == order.id).with_for_update().all()

            if request.outcome == "success":
                # Verify reservation is still ACTIVE
                if any(r.status != "ACTIVE" for r in reservations):
                    # If not active, it might have expired. Payment succeeds but we must rollback or fail order.
                    # Since it's a mock system, we will mark payment as FAILED because order expired.
                    payment.status = "FAILED"
                    order.status = "FAILED"
                    # No stock to release as it was already released during expiry
                else:
                    payment.status = "SUCCESS"
                    payment.completed_at = datetime.now(timezone.utc)
                    payment.transaction_reference = f"TXN-{uuid.uuid4().hex[:8].upper()}"
                    order.status = "PAID"
                    
                    for res in reservations:
                        res.status = "CONSUMED"

            elif request.outcome == "failure":
                payment.status = "FAILED"
                payment.completed_at = datetime.now(timezone.utc)
                order.status = "FAILED"
                
                # Release reserved stock
                product_ids = [r.product_id for r in reservations]
                products = db.query(Product).filter(Product.id.in_(product_ids)).order_by(Product.id).with_for_update().all()
                product_map = {p.id: p for p in products}
                
                for res in reservations:
                    if res.status == "ACTIVE":
                        res.status = "RELEASED"
                        res.released_at = datetime.now(timezone.utc)
                        p = product_map.get(res.product_id)
                        if p:
                            p.stock_quantity += res.quantity

            elif request.outcome == "timeout":
                payment.status = "TIMEOUT"
                # Do not incorrectly mark order as PAID.
                # Leave order as RESERVED. Reservation will expire eventually.
                pass
            
            else:
                raise HTTPException(status_code=400, detail="Invalid outcome")

            db.commit()
            db.refresh(payment)
            return payment

        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error processing payment: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

    @staticmethod
    def refund_payment(db: Session, payment_id: str) -> Payment:
        try:
            payment = db.query(Payment).filter(Payment.id == payment_id).with_for_update().first()
            if not payment:
                raise HTTPException(status_code=404, detail="Payment not found")
            
            if payment.status != "SUCCESS":
                raise HTTPException(status_code=400, detail="Only successful payments can be refunded")
                
            order = db.query(Order).filter(Order.id == payment.order_id).with_for_update().first()
            if not order:
                raise HTTPException(status_code=404, detail="Order not found")
            
            if order.status != "PAID":
                raise HTTPException(status_code=400, detail="Order is not paid")

            payment.status = "REFUNDED"
            order.status = "CANCELLED"
            
            # Refund should restore stock
            reservations = db.query(Reservation).filter(Reservation.order_id == order.id).with_for_update().all()
            product_ids = [r.product_id for r in reservations]
            products = db.query(Product).filter(Product.id.in_(product_ids)).order_by(Product.id).with_for_update().all()
            product_map = {p.id: p for p in products}

            for res in reservations:
                if res.status == "CONSUMED":
                    p = product_map.get(res.product_id)
                    if p:
                        p.stock_quantity += res.quantity
                    res.status = "RELEASED"
                    res.released_at = datetime.now(timezone.utc)

            db.commit()
            db.refresh(payment)
            return payment

        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error refunding payment: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

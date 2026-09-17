from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.order import OrderResponse
from app.models.order import Order
from app.models.reservation import Reservation
from app.models.product import Product
from typing import List
from datetime import datetime, timezone

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.get("", response_model=List[OrderResponse])
def get_orders(db: Session = Depends(get_db)):
    return db.query(Order).all()

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("/{order_id}/cancel", response_model=OrderResponse)
def cancel_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).with_for_update().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if order.status == "CANCELLED":
        return order
        
    if order.status not in ["RESERVED", "PAID"]:
        raise HTTPException(status_code=400, detail=f"Cannot cancel order with status {order.status}")

    try:
        # Restore stock if RESERVED or simulate refund by restoring stock if PAID
        reservations = db.query(Reservation).filter(Reservation.order_id == order.id).with_for_update().all()
        product_ids = [r.product_id for r in reservations]
        products = db.query(Product).filter(Product.id.in_(product_ids)).order_by(Product.id).with_for_update().all()
        product_map = {p.id: p for p in products}

        for res in reservations:
            if res.status in ["ACTIVE", "CONSUMED"]: # Release stock
                p = product_map.get(res.product_id)
                if p:
                    p.stock_quantity += res.quantity
                res.status = "RELEASED"
                res.released_at = datetime.now(timezone.utc)
        
        order.status = "CANCELLED"
        db.commit()
        db.refresh(order)
        return order
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.reservation import Reservation
from app.models.product import Product
from app.models.order import Order
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

class ReservationService:
    @staticmethod
    def expire_reservations(db: Session):
        """Background task logic to expire active reservations that are past their expires_at"""
        now = datetime.now(timezone.utc)
        
        # We need to find active reservations that are expired
        # Lock them, and lock the associated products to safely restore stock
        try:
            # 1. Find candidates (no lock yet to avoid long transactions)
            candidates = db.query(Reservation).filter(
                Reservation.status == "ACTIVE",
                Reservation.expires_at <= now
            ).all()

            if not candidates:
                return

            candidate_ids = [res.id for res in candidates]
            
            # 2. Begin a transaction and lock rows
            reservations = db.query(Reservation).filter(
                Reservation.id.in_(candidate_ids)
            ).order_by(Reservation.id).with_for_update().all()
            
            # Get associated products and orders
            product_ids = list(set([r.product_id for r in reservations]))
            products = db.query(Product).filter(
                Product.id.in_(product_ids)
            ).order_by(Product.id).with_for_update().all()
            product_map = {p.id: p for p in products}

            order_ids = list(set([r.order_id for r in reservations if r.order_id]))
            orders = db.query(Order).filter(
                Order.id.in_(order_ids)
            ).with_for_update().all()
            order_map = {o.id: o for o in orders}

            for res in reservations:
                if res.status != "ACTIVE":
                    continue # Already processed
                
                # Restore stock
                product = product_map.get(res.product_id)
                if product:
                    product.stock_quantity += res.quantity
                
                # Mark expired
                res.status = "EXPIRED"
                res.released_at = datetime.now(timezone.utc)

                # Update order to expired if it exists and is still RESERVED
                if res.order_id and res.order_id in order_map:
                    order = order_map[res.order_id]
                    if order.status == "RESERVED":
                        order.status = "EXPIRED"
            
            db.commit()

        except Exception as e:
            db.rollback()
            logger.error(f"Error expiring reservations: {e}")

    @staticmethod
    def manual_expire(db: Session, reservation_id: str):
        """Admin endpoint for testing to manually expire a reservation"""
        try:
            res = db.query(Reservation).filter(Reservation.id == reservation_id).with_for_update().first()
            if not res:
                raise ValueError("Reservation not found")
            if res.status != "ACTIVE":
                raise ValueError("Reservation is not active")
                
            product = db.query(Product).filter(Product.id == res.product_id).with_for_update().first()
            if product:
                product.stock_quantity += res.quantity
                
            res.status = "EXPIRED"
            res.released_at = datetime.now(timezone.utc)
            
            if res.order_id:
                order = db.query(Order).filter(Order.id == res.order_id).with_for_update().first()
                if order and order.status == "RESERVED":
                    order.status = "EXPIRED"
                    
            db.commit()
        except Exception as e:
            db.rollback()
            raise e

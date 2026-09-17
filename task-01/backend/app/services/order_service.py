from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException
from app.models.product import Product
from app.models.cart import Cart
from app.models.order import Order, OrderItem
from app.models.reservation import Reservation
import uuid
from datetime import datetime, timedelta, timezone

class OrderService:
    @staticmethod
    def checkout(db: Session, cart_id: str):
        # 1. Validate cart exists
        cart = db.query(Cart).filter(Cart.id == cart_id).first()
        if not cart:
            raise HTTPException(status_code=404, detail="Cart not found")
        
        # 2. Validate cart is not already completed
        if cart.status != "ACTIVE":
            raise HTTPException(status_code=400, detail="Cart is not active")
            
        # 3. Validate cart has items
        if not cart.items:
            raise HTTPException(status_code=400, detail="Cart is empty")

        # Start explicit transaction (SQLAlchemy does this automatically but we make it explicit for logic)
        try:
            # 5. Lock relevant product rows
            product_ids = sorted([item.product_id for item in cart.items])
            
            # Using SELECT FOR UPDATE to prevent overselling
            # Note: with_for_update() might fail on SQLite. If using SQLite, this might raise an error 
            # or silently ignore depending on dialect. For Postgres, it will properly row-lock.
            # Using a subquery or direct query
            products = db.query(Product).filter(Product.id.in_(product_ids)).order_by(Product.id).with_for_update().all()
            product_map = {p.id: p for p in products}
            
            # 6. Re-check stock inside the transaction
            for item in cart.items:
                product = product_map.get(item.product_id)
                if not product:
                    raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
                
                # 7. Prevent overselling
                if product.stock_quantity < item.quantity:
                    raise HTTPException(
                        status_code=409, 
                        detail={"success": False, "message": f"Insufficient stock for {product.name}", "error_code": "INSUFFICIENT_STOCK"}
                    )
            
            # 8. Create order
            order_id = str(uuid.uuid4())
            total_amount = sum([product_map[item.product_id].price * item.quantity for item in cart.items])
            
            order = Order(
                id=order_id,
                cart_id=cart_id,
                status="RESERVED",
                total_amount=total_amount
            )
            db.add(order)
            db.flush() # flush to get order registered in session
            
            # 9. Create order items & 10. Decrease stock & 11. Create ACTIVE reservations
            reservations = []
            for item in cart.items:
                product = product_map[item.product_id]
                
                # Create OrderItem
                order_item = OrderItem(
                    order_id=order_id,
                    product_id=product.id,
                    product_name=product.name,
                    unit_price=product.price,
                    quantity=item.quantity,
                    subtotal=product.price * item.quantity
                )
                db.add(order_item)
                
                # Decrease stock
                product.stock_quantity -= item.quantity
                
                # Create Reservation (12. Expiry = now + 5 min)
                reservation = Reservation(
                    id=str(uuid.uuid4()),
                    cart_id=cart_id,
                    order_id=order_id,
                    product_id=product.id,
                    quantity=item.quantity,
                    status="ACTIVE",
                    expires_at=datetime.now(timezone.utc) + timedelta(minutes=5)
                )
                db.add(reservation)
                reservations.append(reservation)
                
            # Update cart status
            cart.status = "COMPLETED"
            
            # 14. Commit transaction
            db.commit()
            
            # Refresh to return
            db.refresh(order)
            
            return order, reservations

        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=str(e))

from sqlalchemy.orm import Session
from app.models.cart import Cart, CartItem
from app.schemas.cart import CartItemCreate, CartItemUpdate
from app.services.inventory_service import InventoryService
from fastapi import HTTPException
import uuid

class CartService:
    @staticmethod
    def create_cart(db: Session) -> Cart:
        cart_id = str(uuid.uuid4())
        new_cart = Cart(id=cart_id)
        db.add(new_cart)
        db.commit()
        db.refresh(new_cart)
        return new_cart

    @staticmethod
    def get_cart(db: Session, cart_id: str) -> Cart:
        cart = db.query(Cart).filter(Cart.id == cart_id).first()
        if not cart:
            raise HTTPException(status_code=404, detail="Cart not found")
        return cart

    @staticmethod
    def add_item(db: Session, cart_id: str, item: CartItemCreate) -> Cart:
        cart = CartService.get_cart(db, cart_id)
        
        # Verify product exists
        product = InventoryService.get_product(db, item.product_id)

        # Check if item already in cart
        cart_item = db.query(CartItem).filter(CartItem.cart_id == cart_id, CartItem.product_id == item.product_id).first()
        
        if cart_item:
            cart_item.quantity += item.quantity
        else:
            cart_item = CartItem(cart_id=cart_id, product_id=item.product_id, quantity=item.quantity)
            db.add(cart_item)
            
        db.commit()
        db.refresh(cart)
        return cart

    @staticmethod
    def update_item(db: Session, cart_id: str, item_id: int, item_update: CartItemUpdate) -> Cart:
        cart_item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart_id).first()
        if not cart_item:
            raise HTTPException(status_code=404, detail="Cart item not found")
        
        cart_item.quantity = item_update.quantity
        db.commit()
        
        return CartService.get_cart(db, cart_id)

    @staticmethod
    def remove_item(db: Session, cart_id: str, item_id: int) -> Cart:
        cart_item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart_id).first()
        if not cart_item:
            raise HTTPException(status_code=404, detail="Cart item not found")
        
        db.delete(cart_item)
        db.commit()
        
        return CartService.get_cart(db, cart_id)

    @staticmethod
    def delete_cart(db: Session, cart_id: str):
        cart = CartService.get_cart(db, cart_id)
        db.delete(cart)
        db.commit()

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.cart import CartResponse, CartItemCreate, CartItemUpdate
from app.services.cart_service import CartService

router = APIRouter(prefix="/carts", tags=["Carts"])

@router.post("", response_model=CartResponse)
def create_cart(db: Session = Depends(get_db)):
    return CartService.create_cart(db)

@router.get("/{cart_id}", response_model=CartResponse)
def get_cart(cart_id: str, db: Session = Depends(get_db)):
    return CartService.get_cart(db, cart_id)

@router.post("/{cart_id}/items", response_model=CartResponse)
def add_item(cart_id: str, item: CartItemCreate, db: Session = Depends(get_db)):
    return CartService.add_item(db, cart_id, item)

@router.put("/{cart_id}/items/{item_id}", response_model=CartResponse)
def update_item(cart_id: str, item_id: int, item_update: CartItemUpdate, db: Session = Depends(get_db)):
    return CartService.update_item(db, cart_id, item_id, item_update)

@router.delete("/{cart_id}/items/{item_id}", response_model=CartResponse)
def remove_item(cart_id: str, item_id: int, db: Session = Depends(get_db)):
    return CartService.remove_item(db, cart_id, item_id)

@router.delete("/{cart_id}")
def delete_cart(cart_id: str, db: Session = Depends(get_db)):
    CartService.delete_cart(db, cart_id)
    return {"success": True}

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductStockResponse
from app.services.inventory_service import InventoryService
from typing import List

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=List[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    return InventoryService.get_all_products(db)

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    return InventoryService.get_product(db, product_id)

@router.post("", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    return InventoryService.create_product(db, product)

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product_update: ProductUpdate, db: Session = Depends(get_db)):
    return InventoryService.update_product(db, product_id, product_update)

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    InventoryService.delete_product(db, product_id)
    return {"success": True}

@router.get("/{product_id}/stock", response_model=ProductStockResponse)
def get_product_stock(product_id: int, db: Session = Depends(get_db)):
    product = InventoryService.get_product(db, product_id)
    return {"id": product.id, "stock_quantity": product.stock_quantity}

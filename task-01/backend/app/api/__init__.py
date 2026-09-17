from fastapi import APIRouter
from app.api.products import router as products_router
from app.api.carts import router as carts_router
from app.api.checkout import router as checkout_router
from app.api.payments import router as payments_router
from app.api.orders import router as orders_router
from app.api.reservations import router as reservations_router

api_router = APIRouter(prefix="/api")

api_router.include_router(products_router)
api_router.include_router(carts_router)
api_router.include_router(checkout_router)
api_router.include_router(payments_router)
api_router.include_router(orders_router)
api_router.include_router(reservations_router)

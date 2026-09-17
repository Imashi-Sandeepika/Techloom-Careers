from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import asyncio
from app.config import settings
from app.database import Base, engine, SessionLocal
from app.api import api_router
from app.services.reservation_service import ReservationService

# Initialize database
Base.metadata.create_all(bind=engine)

# Background task for expiring reservations
async def expire_reservations_task():
    while True:
        try:
            db = SessionLocal()
            ReservationService.expire_reservations(db)
            db.close()
        except Exception as e:
            print(f"Error in background task: {e}")
        await asyncio.sleep(10) # Run every 10 seconds

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start the background task
    task = asyncio.create_task(expire_reservations_task())
    yield
    # Shutdown
    task.cancel()

app = FastAPI(title="POS Order & Inventory System", lifespan=lifespan)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

# Exception handler for consistent API errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": str(exc), "error_code": "INTERNAL_SERVER_ERROR"}
    )

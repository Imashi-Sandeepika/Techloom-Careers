from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.reservation import ReservationResponse
from app.models.reservation import Reservation
from app.services.reservation_service import ReservationService
from typing import List

router = APIRouter(prefix="/reservations", tags=["Reservations"])

@router.get("", response_model=List[ReservationResponse])
def get_reservations(db: Session = Depends(get_db)):
    return db.query(Reservation).all()

@router.post("/{reservation_id}/expire")
def expire_reservation(reservation_id: str, db: Session = Depends(get_db)):
    ReservationService.manual_expire(db, reservation_id)
    return {"success": True, "message": "Reservation manually expired"}

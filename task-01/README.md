# Techloom.ai - Task 01
POS Order & Inventory System

## Live Demo
Backend: [https://pos-backend-demo.up.railway.app](https://pos-backend-demo.up.railway.app) (Placeholder)
Frontend: [https://pos-frontend-demo.vercel.app](https://pos-frontend-demo.vercel.app) (Placeholder)

## Repository
[https://github.com/techloom/pos-inventory-system](https://github.com/techloom/pos-inventory-system) (Placeholder)

---

## 1. Project Overview
A complete, production-quality POS (Point of Sale) Order and Inventory System built for a technical assessment. It handles real-time concurrency for inventory reservations, preventing overselling using database-level locks, and simulates payment processing with strict idempotency controls.

## 2. Features
- **Strict Concurrency Control**: Uses PostgreSQL `SELECT FOR UPDATE` to lock product rows during checkout, ensuring overselling is impossible even with concurrent requests.
- **Reservation System**: Items are reserved upon checkout for 5 minutes. If a payment is not completed, a background task automatically releases the stock.
- **Idempotency**: The mock payment gateway uses unique `idempotency_key` constraints to guarantee that duplicate requests don't cause double charges or duplicate order fulfillment.
- **Transactional Integrity**: All critical logic paths use SQLAlchemy explicit transactions.
- **Modern Dashboard**: A fully responsive dark-green themed POS dashboard built with React and Vite.

## 3. Architecture
- **Backend**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Frontend**: React (Vite)
- **Deployment**: Hosted Backend, Static Frontend.

## 4. Technology Stack
- **Backend**: Python 3.12+, FastAPI, SQLAlchemy 2.0, PostgreSQL (asyncpg/psycopg), Pydantic.
- **Frontend**: React, Vite, JavaScript, Axios, React Router, Vanilla CSS, Lucide React (Icons).

## 5. Database Design
- **Products**: Basic inventory.
- **Carts / CartItems**: Temporary holding before checkout.
- **Orders / OrderItems**: Confirmed purchases.
- **Reservations**: Tracks locked stock and expiration times.
- **Payments**: Tracks idempotent transaction states.

## 6. Concurrency Strategy
At the moment of checkout, product IDs are sorted and locked using `with_for_update()` inside a transaction block. This creates row-level locks on the PostgreSQL DB, forcing concurrent checkouts for the same product to evaluate sequentially.

## 7. Stock Reservation Logic
Stock is immediately deducted upon successful checkout and placed into an `ACTIVE` reservation. A background worker periodically finds expired reservations and restores the stock.

## 8. Payment Simulation
Simulates success, failure, and timeout states. Validates that the reservation is still active before marking an order as `PAID`.

## 9. Order Lifecycle
`PENDING -> RESERVED -> (PAID | FAILED | EXPIRED) -> CANCELLED`

## 10. API Endpoints
- `GET /api/products`: List products
- `POST /api/carts`: Create cart
- `POST /api/checkout`: Reserve stock
- `POST /api/payments`: Process payment

## 11. Local Setup

### Database Setup
Ensure PostgreSQL is installed locally or you have a hosted PostgreSQL URI. Set the URI in your `.env` file.

### Backend Setup
Open a new terminal and run:
```bash
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload
```
*The backend will be available at http://127.0.0.1:8000/docs*

### Frontend Setup
Open another new terminal and run:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will be available at http://localhost:5173*

## 12. Deployment
## Live Deployment

Frontend: https://techloom-careers-9v7e.vercel.app

Backend: https://techloom-careers.onrender.com

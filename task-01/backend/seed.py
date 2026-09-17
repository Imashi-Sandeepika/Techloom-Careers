from app.database import SessionLocal, Base, engine
from app.models.product import Product
import random

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if products exist
    if db.query(Product).count() == 0:
        products = [
            {"name": "Laptop", "price": 1200.0, "stock_quantity": 15, "description": "High performance laptop"},
            {"name": "Keyboard", "price": 100.0, "stock_quantity": 50, "description": "Mechanical keyboard"},
            {"name": "Mouse", "price": 50.0, "stock_quantity": 100, "description": "Wireless gaming mouse"},
            {"name": "Monitor", "price": 300.0, "stock_quantity": 20, "description": "27-inch 4K monitor"},
            {"name": "Headphones", "price": 150.0, "stock_quantity": 30, "description": "Noise-cancelling headphones"},
            {"name": "Webcam", "price": 80.0, "stock_quantity": 40, "description": "1080p HD webcam"},
            {"name": "USB Hub", "price": 25.0, "stock_quantity": 200, "description": "7-port USB 3.0 hub"},
            {"name": "Demo Mouse", "price": 10.0, "stock_quantity": 1, "description": "Product for concurrency test"},
            {"name": "Demo Keyboard", "price": 15.0, "stock_quantity": 5, "description": "Product for expiry test"},
        ]
        
        for p in products:
            db.add(Product(**p))
            
        db.commit()
        print("Database seeded with products.")
    else:
        print("Database already seeded.")
        
    db.close()

if __name__ == "__main__":
    seed_db()

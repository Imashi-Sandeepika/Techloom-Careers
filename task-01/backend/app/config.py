from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg://pos_user:pos_password@localhost:5432/pos_db"
    SECRET_KEY: str = "supersecretkey"
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()

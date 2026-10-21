from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Reschool - Ngân hàng đồ cũ & SGK luân chuyển API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    
    # Firebase
    FIREBASE_PROJECT_ID: Optional[str] = "reschool-reused-app"
    FIREBASE_SERVICE_ACCOUNT_PATH: Optional[str] = "./serviceAccountKey.json"
    
    # CORS (Hỗ trợ Localhost, Vercel và Render)
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:8001",
        "http://127.0.0.1:8001",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "https://reschool.vercel.app"
    ]
    CORS_ORIGIN_REGEX: Optional[str] = r"https:\/\/.*\.vercel\.app"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

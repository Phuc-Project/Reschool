import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from app.core.config import settings
from app.core.firebase import firebase_manager
from app.api.endpoints import items, matchmaking, stats, users, requests

# Cấu hình logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("reschool.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Đang khởi động Reschool API Server...")
    firebase_manager.initialize()
    logger.info("Reschool Backend đã sẵn sàng phục vụ tại %s:%s", settings.HOST, settings.PORT)
    yield
    logger.info("Đang dừng Reschool API Server...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Hệ thống Backend cho Reschool - Ngân hàng đồ cũ và SGK luân chuyển dành cho học sinh",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Include Routers
app.include_router(items.router, prefix=settings.API_V1_PREFIX)
app.include_router(matchmaking.router, prefix=settings.API_V1_PREFIX)
app.include_router(stats.router, prefix=settings.API_V1_PREFIX)
app.include_router(users.router, prefix=settings.API_V1_PREFIX)
app.include_router(requests.router, prefix=settings.API_V1_PREFIX)

@app.get("/", tags=["Health Check"])
def root_check():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "firebase_connected": not firebase_manager.is_mock,
        "environment": settings.ENVIRONMENT,
        "docs_url": "/docs"
    }

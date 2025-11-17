from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from sqlalchemy import text
from database import get_db, engine
from config import get_settings
import logging
from pathlib import Path

# Import routers
from routers import auth, products

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup
    logger.info("Starting E-Commerce Shop API...")
    logger.info(f"Environment: {settings.environment}")
    
    # Test database connection
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("✓ Database connection successful")
    except Exception as e:
        logger.error(f"✗ Database connection failed: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down E-Commerce Shop API...")
    await engine.dispose()


# Create FastAPI app
app = FastAPI(
    title="E-Commerce Shop API",
    description="Backend API for E-Commerce Shop with FastAPI",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://localhost:3000"],  # Angular dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================
# Include Routers
# =============================================

app.include_router(auth.router)
app.include_router(products.router)


# =============================================
# Static Files
# =============================================

# Create static directory if it doesn't exist
STATIC_DIR = Path(__file__).parent / "static"
STATIC_DIR.mkdir(exist_ok=True)
(STATIC_DIR / "images" / "products").mkdir(parents=True, exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


# =============================================
# Health Check Endpoints
# =============================================

@app.get("/")
async def root():
    """Root endpoint - API information."""
    return {
        "message": "E-Commerce Shop API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "environment": settings.environment
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    try:
        # Test database connection
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        
        return {
            "status": "healthy",
            "database": "connected",
            "environment": settings.environment
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "database": "disconnected",
                "error": str(e)
            }
        )


@app.get("/api/test")
async def test_endpoint():
    """Simple test endpoint."""
    return {
        "message": "API is working!",
        "timestamp": "2025-11-17"
    }


# =============================================
# Error Handlers
# =============================================

@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Custom 404 handler."""
    return JSONResponse(
        status_code=404,
        content={"detail": "Resource not found"}
    )


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Custom 500 handler."""
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

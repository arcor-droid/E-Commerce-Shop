# E-Commerce Shop Backend

FastAPI-based REST API for the E-Commerce Shop.

## Structure

```
backend/
├── main.py              # FastAPI application entry point
├── config.py            # Configuration and settings
├── database.py          # Database connection and session management
├── pyproject.toml      # Python project dependencies (uv)
├── uv.lock             # Lockfile for reproducible builds
├── Dockerfile          # Docker container configuration
└── README.md           # This file
```

## Local Development

### With Nix (Recommended)

```bash
# From project root
nix develop

# Navigate to backend
cd backend

# Sync dependencies (creates venv automatically)
uv sync

# Run the server with uv
uv run uvicorn main:app --reload

# Or activate venv and run directly
source .venv/bin/activate
uvicorn main:app --reload
```

### Without Nix

```bash
cd backend

# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Sync dependencies
uv sync

# Set environment variables
export DATABASE_URL="mysql+aiomysql://ecommerce_user:ecommerce_password@localhost:3306/ecommerce_db"
export SECRET_KEY="your-secret-key"

# Run the server with uv
uv run uvicorn main:app --reload
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Available Endpoints

### Health & Testing
- `GET /` - API information
- `GET /health` - Health check
- `GET /api/test` - Simple test endpoint

### (Coming Soon)
- Authentication endpoints
- Product endpoints
- Cart endpoints
- Order endpoints
- Admin endpoints

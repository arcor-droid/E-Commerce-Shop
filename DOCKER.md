# Docker Setup for E-Commerce Shop

## Quick Start

1. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

2. **Start all services**
   ```bash
   docker compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Services

### MySQL Database
- Port: 3306
- Database: `ecommerce_db`
- User: `ecommerce_user`
- Schema automatically initialized on first run

### Backend (FastAPI)
- Port: 8000
- Hot-reload enabled in development
- Auto-generates API documentation

### Frontend (Angular)
- Port: 4200
- Hot-reload enabled
- Auto-reloads on file changes (polling mode for Docker compatibility)

## Useful Commands

### Start services
```bash
docker compose up
```

### Start in background
```bash
docker compose up -d
```

### Stop services
```bash
docker compose down
```

### Stop and remove volumes (clean slate)
```bash
docker compose down -v
```

### View logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f mysql
```

### Rebuild containers
```bash
docker compose up --build
```

### Access container shell
```bash
# Frontend
docker compose exec frontend sh

# Backend
docker compose exec backend bash

# MySQL
docker compose exec mysql mysql -u ecommerce_user -p ecommerce_db
```

## Troubleshooting

### Port already in use
If you get errors about ports already in use:

1. Check running processes:
   ```bash
   # Linux/Mac
   lsof -i :4200
   lsof -i :8000
   lsof -i :3306
   
   # Windows (PowerShell)
   netstat -ano | findstr :4200
   netstat -ano | findstr :8000
   netstat -ano | findstr :3306
   ```

2. Stop other services or change ports in `docker-compose.yml`

### Frontend not loading
- Make sure backend is healthy: `docker compose ps`
- Check frontend logs: `docker compose logs frontend`
- Wait 30-60 seconds for initial npm install

### Database connection issues
- Wait for MySQL health check to pass
- Check logs: `docker compose logs mysql`
- Verify credentials in `.env`

### Hot-reload not working
The frontend uses polling mode (`--poll 2000`) for Docker compatibility.
If changes still don't reflect:
1. Save the file
2. Wait 2-3 seconds
3. Refresh browser

### Clear everything and start fresh
```bash
# Stop all containers
docker compose down

# Remove volumes (deletes database data!)
docker compose down -v

# Remove all images
docker compose down --rmi all

# Rebuild from scratch
docker compose up --build
```

## Development Workflow

1. **Make changes** to code in your editor
2. **Containers auto-reload** (no restart needed)
3. **View changes** in browser
4. **Check logs** if something breaks: `docker compose logs -f`

## Default Credentials

### Admin Account
- Email: `admin@shop.com`
- Password: `admin123`

### Test Customer
- Email: `customer@example.com`
- Password: `customer123`

## Environment Variables

Edit `.env` to customize:
- Database credentials
- JWT secret key
- API token expiration
- Environment (development/production)

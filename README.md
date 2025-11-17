# E-Commerce Shop

A full-stack e-commerce application built with Angular, FastAPI, and MySQL.

## Technology Stack

- **Frontend**: Angular, HTML5, CSS3, TypeScript
- **Backend**: Python 3.12+, FastAPI
- **Database**: MySQL 8.0
- **Deployment**: Docker & Docker Compose

## Project Structure

```
├── backend/          # FastAPI backend application
├── frontend/         # Angular frontend application
├── database/         # MySQL schema and initialization scripts
├── docker-compose.yml
└── README.md
```

## Development Setup

### Prerequisites

- Docker & Docker Compose
- Git
- (For local development) Nix with flakes enabled

### Quick Start with Docker

1. Copy environment file:
   ```bash
   cp .env.example .env
   ```

2. Start all services:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Local Development with Nix

1. Enter development environment:
   ```bash
   nix develop
   ```

2. This provides:
   - Python 3.12 with uv
   - Node.js with npm
   - Development tools

## Features

### Customer Features
- Browse products by category
- View product details
- Shopping cart management
- User registration and authentication
- Order placement and tracking
- Order history

### Admin Features
- Product management (CRUD)
- Order management
- Order status updates
- Dashboard views

## Order Status Workflow

1. Pending
2. Confirmed
3. Payment Pending
4. Payment Received
5. Delivered
6. Canceled

## API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation.

## License

Educational project for university coursework.

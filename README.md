# 🛍️ E-Commerce Shop

A modern, full-stack e-commerce application built with Angular, FastAPI, and MySQL. This project demonstrates a complete implementation of an online shop with user authentication, shopping cart, order management, and admin dashboard.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Angular](https://img.shields.io/badge/Angular-19.2-red.svg)](https://angular.io/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Development](#development)
- [Deployment](#deployment)
- [License](#license)

---

## 🎯 Overview

This e-commerce platform is a university project that implements all essential features of a modern online shop:

- **Customer-facing storefront** with product browsing, cart management, and checkout
- **Admin dashboard** for product and order management
- **RESTful API** with FastAPI for backend operations
- **JWT-based authentication** for secure user sessions
- **Responsive design** that works on desktop and mobile devices

**Live Demo:** (Add your deployment URL here)

---

## ✨ Features

### 👥 Customer Features

- **User Management**
  - User registration with email and password
  - Secure login with JWT tokens
  - Profile management (update address, payment method)
  - Password change functionality

- **Product Catalog**
  - Browse products by category
  - View detailed product information
  - Product images and descriptions
  - Stock availability display

- **Shopping Cart**
  - Add/remove products to cart
  - Update product quantities
  - Select product options (size, color)
  - Cart persistence across sessions
  - Real-time cart total calculation

- **Order Management**
  - Simple checkout process
  - Order history viewing
  - Order status tracking
  - Order detail pages with item breakdown

### 🔐 Admin Features

- **Product Management (CRUD)**
  - Create new products with categories
  - Edit existing product details
  - Delete products
  - Manage product stock levels
  - Upload product images
  - Set product availability

- **Order Management**
  - View all customer orders
  - Filter orders by status
  - Update order status
  - View customer details (email, nickname, user ID)
  - View admin notes on orders
  - View order item details and totals

- **Order Status Workflow**
  1. **Pending** - Order placed, awaiting confirmation
  2. **Confirmed** - Order confirmed by admin
  3. **Payment Pending** - Waiting for payment
  4. **Payment Received** - Payment confirmed
  5. **Delivered** - Order delivered to customer
  6. **Canceled** - Order canceled

---

## 🚀 Technology Stack

### Frontend
- **Framework:** Angular 19.2 (Standalone Components)
- **Language:** TypeScript 5.7
- **Styling:** SCSS
- **HTTP Client:** Angular HttpClient with Interceptors
- **Routing:** Angular Router with Guards
- **State Management:** RxJS + Services

### Backend
- **Framework:** FastAPI 0.115+
- **Language:** Python 3.12+
- **ORM:** SQLAlchemy (Async)
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Pydantic v2
- **Password Hashing:** bcrypt
- **CORS:** FastAPI CORS Middleware

### Database
- **Database:** MySQL 8.0
- **Schema:** Relational design with foreign keys
- **Tables:** Users, Products, ProductCategories, CartItems, Orders, OrderItems

### DevOps & Tools
- **Containerization:** Docker & Docker Compose
- **Development Environment:** Nix Flakes (optional)
- **Package Management:** 
  - Frontend: npm
  - Backend: uv (Python)
- **API Documentation:** Auto-generated with Swagger/OpenAPI

---

## 🏗️ Architecture

### System Architecture

This project follows a **monolithic architecture with feature-based modularization**, inspired by micro-frontend concepts but implemented pragmatically for a project of this scale.

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                    (Angular SPA)                             │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Customer   │  │    Admin     │  │   Shared     │     │
│  │   Features   │  │   Features   │  │  Services    │     │
│  │              │  │              │  │              │     │
│  │ • Products   │  │ • Product    │  │ • Auth       │     │
│  │ • Cart       │  │   Management │  │ • Cart       │     │
│  │ • Orders     │  │ • Order      │  │ • Products   │     │
│  │ • Profile    │  │   Management │  │ • Orders     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│                    ▼ HTTP/REST API ▼                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│                    (FastAPI REST API)                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │     Auth     │  │   Products   │  │    Orders    │     │
│  │   Endpoints  │  │   Endpoints  │  │   Endpoints  │     │
│  │              │  │              │  │              │     │
│  │ /auth/*      │  │ /products/*  │  │ /orders/*    │     │
│  │ /cart/*      │  │              │  │ /orders/     │     │
│  │              │  │              │  │  admin/*     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│         ┌──────────────────────────────────┐               │
│         │    Dependencies & Middleware     │               │
│         │ • JWT Auth                       │               │
│         │ • Admin Guards                   │               │
│         │ • CORS                           │               │
│         └──────────────────────────────────┘               │
│                                                              │
│                    ▼ SQLAlchemy ORM ▼                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        DATABASE                              │
│                      (MySQL 8.0)                             │
│                                                              │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐           │
│  │ Users  │  │Products│  │ Orders │  │  Cart  │           │
│  │        │  │Categories│ │ Items  │  │  Items │           │
│  └────────┘  └────────┘  └────────┘  └────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### Design Decisions

**Why Monolith over Micro-Frontends?**

While Practice 08 introduces the concept of micro-frontends, this project uses a **feature-modular monolith** for the following reasons:

✅ **Appropriate for project scale** - Suitable for small to medium teams (1-10 developers)  
✅ **Simplified development** - Single build process, shared code is trivial  
✅ **Faster time-to-market** - Less infrastructure overhead  
✅ **Easier debugging** - No cross-app communication complexity  
✅ **Cost-effective** - Single deployment, lower hosting costs  

The architecture still maintains:
- Clear separation between customer and admin features
- Lazy loading with Angular route-based code splitting
- Reusable shared services and components
- Independent feature development paths

**When to consider Micro-Frontends:**
- Teams with 50+ developers
- Need for different tech stacks (React + Vue + Angular)
- Independent deployment schedules for different business units
- Legacy application migration scenarios

---

## 🏁 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Docker** (v20.10+) and **Docker Compose** (v2.0+)
- **Git**
- *Optional:* **Nix** with flakes enabled (for reproducible dev environment)

### Quick Start with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/arcor-droid/E-Commerce-Shop.git
   cd E-Commerce-Shop
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration if needed
   ```

3. **Start all services** (first time will take a few minutes)
   ```bash
   docker compose up --build
   ```
   
   Wait for the build to complete. You'll see:
   - MySQL: Initializing database schema
   - Backend: Installing Python dependencies and starting FastAPI
   - Frontend: Installing npm packages and starting Angular dev server

4. **Access the application**
   - 🌐 Frontend: [http://localhost:4200](http://localhost:4200)
   - 🔧 Backend API: [http://localhost:8000](http://localhost:8000)
   - 📚 API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   - 📘 Alternative API Docs: [http://localhost:8000/redoc](http://localhost:8000/redoc)

5. **Default Login Credentials**
   - **Admin Account:**
     - Email: `admin@shop.com`
     - Password: `admin123`
   - **Test Customer:**
     - Email: `customer@example.com`
     - Password: `customer123`

**🎉 That's it! The application is now running in Docker containers.**

> **Note:** First startup takes 2-3 minutes as npm installs packages. Subsequent startups are much faster.

### Docker Commands

```bash
# Start services in background
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Rebuild containers after code changes
docker compose up --build

# Clean slate (removes all data!)
docker compose down -v
```

For detailed Docker usage, see [DOCKER.md](DOCKER.md)

### Local Development Setup

If you prefer running services locally without Docker:

#### Backend Setup

```bash
cd backend

# Install dependencies with uv (recommended)
uv sync

# Or install from pyproject.toml
uv pip install -e .

# Set up database (requires MySQL running)
mysql -u root -p < ../database/schema.sql

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm start
# or
ng serve
```

#### With Nix Flakes (Reproducible Environment)

```bash
# Enter development shell with all tools
nix develop

# This provides:
# - Python 3.12 with uv
# - Node.js 20 with npm
# - MySQL client
# - Development tools
```

---

## 📁 Project Structure

```
E-Commerce-Shop/
├── backend/                    # FastAPI Backend
│   ├── main.py                # Application entry point
│   ├── config.py              # Configuration management
│   ├── database.py            # Database connection & session
│   ├── models.py              # SQLAlchemy ORM models
│   ├── schemas.py             # Pydantic schemas for validation
│   ├── auth_utils.py          # Password hashing utilities
│   ├── jwt_utils.py           # JWT token creation/validation
│   ├── dependencies.py        # FastAPI dependencies (auth, admin)
│   ├── routers/               # API route handlers
│   │   ├── auth.py           # Authentication endpoints
│   │   ├── products.py       # Product CRUD endpoints
│   │   ├── cart.py           # Shopping cart endpoints
│   │   └── orders.py         # Order management endpoints
│   ├── static/               # Static files (product images)
│   ├── pyproject.toml        # Python dependencies
│   └── Dockerfile            # Backend container config
│
├── frontend/                   # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── features/     # Feature modules
│   │   │   │   ├── home/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── login/
│   │   │   │   │   └── register/
│   │   │   │   ├── products/
│   │   │   │   ├── product-detail/
│   │   │   │   ├── cart/
│   │   │   │   ├── orders/
│   │   │   │   ├── order-detail/
│   │   │   │   ├── profile/
│   │   │   │   └── admin/
│   │   │   │       ├── product-form/
│   │   │   │       └── admin-orders/
│   │   │   ├── core/         # Core services & guards
│   │   │   │   ├── guards/
│   │   │   │   │   ├── auth.guard.ts
│   │   │   │   │   └── unsaved-changes.guard.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   └── auth.interceptor.ts
│   │   │   │   ├── models/
│   │   │   │   └── services/
│   │   │   │       ├── auth.service.ts
│   │   │   │       ├── product.service.ts
│   │   │   │       ├── cart.service.ts
│   │   │   │       └── order.service.ts
│   │   │   ├── shared/       # Shared components
│   │   │   │   └── navbar/
│   │   │   ├── app.component.ts
│   │   │   ├── app.config.ts
│   │   │   └── app.routes.ts
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.scss
│   ├── package.json
│   ├── angular.json
│   └── tsconfig.json
│
├── database/                   # Database scripts
│   └── schema.sql             # MySQL schema & sample data
│
├── docker-compose.yml          # Multi-container orchestration
├── flake.nix                  # Nix development environment
├── flake.lock
├── README.md                  # This file
└── TODO.md                    # Project tasks

```

---

## 📚 API Documentation

The backend provides auto-generated interactive API documentation:

### Swagger UI
Visit [http://localhost:8000/docs](http://localhost:8000/docs) for an interactive API explorer.

### ReDoc
Visit [http://localhost:8000/redoc](http://localhost:8000/redoc) for alternative documentation format.

### Key API Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with credentials
- `GET /auth/me` - Get current user profile
- `PUT /auth/me` - Update user profile
- `POST /auth/change-password` - Change password

#### Products
- `GET /products` - List all products (with filters)
- `GET /products/{id}` - Get product details
- `POST /products` - Create product (admin only)
- `PUT /products/{id}` - Update product (admin only)
- `DELETE /products/{id}` - Delete product (admin only)
- `GET /products/categories` - List all categories

#### Shopping Cart
- `GET /cart` - Get user's cart
- `POST /cart/items` - Add item to cart
- `PUT /cart/items/{id}` - Update cart item
- `DELETE /cart/items/{id}` - Remove cart item
- `DELETE /cart` - Clear entire cart

#### Orders
- `POST /orders/checkout` - Create order from cart
- `GET /orders` - Get user's order history
- `GET /orders/{id}` - Get order details
- `GET /orders/admin/all` - Get all orders (admin only)
- `PUT /orders/admin/{id}/status` - Update order status (admin only)

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
Users (1) ──────< (N) Orders (1) ──────< (N) OrderItems (N) >────── (1) Products
  │                                                                        │
  │                                                                        │
  └────< (N) CartItems (N) >──────────────────────────────────────────────┘
                                                                           │
                                                                           │
                                                      ProductCategories (1) ──────< (N)
```

### Key Tables

**Users**
- Stores user accounts with authentication credentials
- Includes role (CUSTOMER/ADMIN) for authorization
- Optional address and payment information

**Products**
- Product catalog with title, description, pricing
- JSON field for flexible options (sizes, colors)
- Stock tracking and active/inactive status
- Linked to categories

**ProductCategories**
- Organizes products into categories
- Display order for frontend presentation

**CartItems**
- Shopping cart persistence for logged-in users
- Links users to products with quantity and options

**Orders**
- Customer orders with status tracking
- Captures totals, shipping info, and notes
- Immutable order history

**OrderItems**
- Line items within orders
- Denormalized product data (preserves historical prices)

For detailed schema, see [`database/schema.sql`](database/schema.sql)

---

## 🛠️ Development

### Building for Production

```bash
# Frontend build
cd frontend
ng build --configuration production
# Output: dist/

# Backend (no build needed, Python)
# Just ensure dependencies are installed with: uv sync
```

---

## 🚢 Deployment

### Docker Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Run in production mode
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

**Frontend** (Static files - can be served by NGINX, Apache, or CDN)
```bash
cd frontend
ng build --configuration production
# Deploy dist/ folder to web server
```

**Backend** (ASGI server)
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
# Or use gunicorn with uvicorn workers
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

**Database**
- Set up MySQL 8.0 server
- Run `schema.sql` to create tables
- Configure connection in backend environment variables

### Environment Variables

Create a `.env` file with:

```env
# Database
DATABASE_URL=mysql+aiomysql://user:password@localhost:3306/ecommerce

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Environment
ENVIRONMENT=production
```

---

## 📝 License

This project is an educational project for university coursework.

**MIT License** - See LICENSE file for details.



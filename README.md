# 🛍️ E-Commerce Shop

Full-stack e-commerce application with **Angular 19**, **FastAPI**, and **MySQL**. Features customer storefront, shopping cart, order management, and admin dashboard.

[![Angular](https://img.shields.io/badge/Angular-19.2-red.svg)](https://angular.io/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)

---

## 🚀 Quick Start

### Prerequisites
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/))
- **Git**

### Start Application

```bash
git clone https://github.com/arcor-droid/E-Commerce-Shop.git
cd E-Commerce-Shop
docker compose up --build
```

⏱️ **First run:** 2-4 minutes (downloading images & installing dependencies)

Wait for:
```
frontend-1  | ✔ Browser application bundle generation complete.
backend-1   | INFO:     Application startup complete.
```

### Access & Login

🌐 **Application:** [http://localhost:4200](http://localhost:4200)  
📚 **API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

**Test Accounts:**
- **Admin:** `admin@shop.com` / `admin123`
- **Customer:** `customer@example.com` / `customer123`

---

## 🧪 What to Test

### Customer Features
- Browse products by category (Hoodies, Shirts, Joggers, Posters, Schnick Schnack)
- Add products to cart with options (size, color)
- Checkout and create orders
- View order history
- Update profile and password
- New user registration

### Admin Features
- Create/edit/delete products
- Manage stock and categories
- View all customer orders
- Update order status (Pending → Confirmed → Payment Pending → Payment Received → Delivered)
- Add admin notes to orders

---

## 📚 Tech Stack

**Frontend:** Angular 19.2 (Standalone Components), TypeScript, SCSS  
**Backend:** FastAPI, Python 3.12, SQLAlchemy (Async), JWT Authentication  
**Database:** MySQL 8.0 with 6 tables (Users, Products, ProductCategories, CartItems, Orders, OrderItems)  
**DevOps:** Docker & Docker Compose

---

## 🏗️ Architecture

**Monolithic architecture** with feature-based modularization:
- Frontend: Angular SPA with customer and admin features
- Backend: REST API with endpoint routers (`/auth`, `/products`, `/cart`, `/orders`)
- Database: MySQL with relational schema

**Sample Data:** 2 users, 5 categories, 10 products (auto-loaded on first start)

---

## 🔧 Docker Commands

```bash
# Stop
docker compose down

# Restart (fast)
docker compose up

# Fresh database
docker compose down -v && docker compose up --build

# View logs
docker compose logs -f [backend|frontend|db]
```

---

## 📁 Project Structure

```
backend/
  ├── main.py          # FastAPI app
  ├── models.py        # SQLAlchemy models
  ├── schemas.py       # Pydantic schemas
  └── routers/         # API endpoints
      ├── auth.py
      ├── products.py
      ├── cart.py
      └── orders.py

frontend/src/app/
  ├── features/        # Feature modules
  │   ├── auth/
  │   ├── products/
  │   ├── cart/
  │   ├── orders/
  │   └── admin/
  └── core/            # Services, guards, interceptors

database/
  └── schema.sql       # MySQL schema & sample data
```

---

## 📖 API Documentation

Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

**Key Endpoints:**
- `POST /auth/register` - Register user
- `POST /auth/login` - Login (returns JWT)
- `GET /products` - List products
- `POST /cart/items` - Add to cart
- `POST /orders/checkout` - Create order
- `GET /orders/admin/all` - View all orders (admin only)

---

## 🗄️ Database Schema

**Relationships:**
```
Users → CartItems → Products
Users → Orders → OrderItems → Products
Products → ProductCategories
```

**Sample Data:** Pre-loaded with admin user, customer user, 5 categories, 10 products

---

## 🛠️ Development

**Hot Reload:** Edit files in `frontend/src/` or `backend/` - changes apply automatically

**Production Build:**
```bash
cd frontend && ng build --configuration production
```

---

## 📝 License

MIT License - University project for educational purposes


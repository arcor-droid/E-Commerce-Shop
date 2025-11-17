# **1. Project Overview**

Build a fully functional **e-commerce web application** with modern frontend technologies, a Python backend, a MySQL database, and complete Docker-based deployment.
The system includes both **customer-facing** and **admin-facing** functionality, implements a multi-step order workflow, and provides a responsive, production-ready UI.

The final deliverable must run anywhere using **Docker Compose**.

---

# **2. Core Objectives**

* Develop a **full-stack** e-commerce application.
* Use **HTML5, CSS3, JavaScript and Angular** for the frontend.
* Use **Python and FastAPI** for backend logic and REST API development.
* Use **MySQL** as the relational database.
* Implement **user authentication**, **authorization**, and **role-based access**.
* Provide a complete **order lifecycle** with multiple statuses.
* Deliver a system deployable on any machine via **Docker**.

---

# **3. Functional Requirements**

## **3.1 Customer Features**

### **Navigation**

* Header includes:

  * Shopping Cart
  * Profile menu (Overview, Shopping Cart, Orders, Login/Logout)
* Under-header category navigation (except on homepage):

  * Hoodies, Shirts, Joggers, Posters, “Schnick Schnack”

### **Homepage**

* Grid layout showing all product categories with images/titles.

### **Product Category Page**

* Grid layout of products:

  * Title, image, price, options
* Actions:

  * Add directly to cart
  * Open product detail page

### **Product Detail View**

* Product image
* Price
* Description
* Add-to-cart button

### **Registration**

* Email
* Nickname
* Password + password confirmation
* Address fields (optional)
* Payment fields (optional / potentially omitted)

### **Login**

* Email **or** nickname
* Password

### **Shopping Cart**

* List of items with quantities and prices
* “Place Order” button → requests missing data (e.g., address)

### **Order Summary / Order View**

* Static overview of ordered items, prices, and date

### **Order History & Tracking**

* Customers can:

  * See past orders
  * Track current order status
    Status values include:
    **Pending, Confirmed, Payment Pending, Payment Received, Delivered, Canceled**

---

## **3.2 Admin Features**

* Add new products
* Edit product details
* Modify order status
* View order details
* Product management dashboard
* Order management dashboard with CRUD operations

---

# **4. API Specification**

### **Public Endpoints**

| Method | Endpoint                        | Description                                 |
| ------ | ------------------------------- | ------------------------------------------- |
| GET    | `/productcategories`            | Returns all categories (image, name, title) |
| GET    | `/productsByCategory/:category` | Returns products for a category             |
| GET    | `/product/:id`                  | Returns full product info                   |
| POST   | `/register`                     | Register a new user                         |
| POST   | `/login`                        | Log in existing user                        |
| POST   | `/order`                        | Create an order                             |

### **Admin Endpoints**

| Method | Endpoint                                 | Description              |
| ------ | ---------------------------------------- | ------------------------ |
| POST   | `/admin/addProduct`                      | Create new product       |
| PUT    | `/admin/changeProductDetails/:productId` | Update product fields    |
| PUT    | `/admin/changeOrderStatus/:orderId`      | Update order status      |
| GET    | `/admin/getOrderDetails/:orderId`        | Retrieve full order data |

### **Authentication**

* JWT or session-token-based authentication
* Authorization required for admin endpoints

---

# **5. Database Design (MySQL)**

## **Tables**

### **Users**

* id
* email
* nickname
* password_hash
* role (customer/admin)
* address fields (optional)
* payment fields (optional)

### **ProductCategories**

* id
* name
* title
* image

### **Products**

* id
* category_id
* title
* description
* image
* base_price
* options (JSON or dedicated table)

### **CartItems**

* id
* user_id
* product_id
* quantity

### **Orders**

* id
* user_id
* order_date
* status

### **OrderItems**

* id
* order_id
* product_id
* quantity
* price (captured at purchase time)

---

# **6. Order Status Workflow**

Status values:

1. **Pending**
2. **Confirmed**
3. **Payment Pending**
4. **Payment Received**
5. **Delivered**
6. **Canceled**

Each transition must be validated appropriately in the backend.

---

# **7. Technology Stack**

## **Frontend**

* HTML5
* CSS3
* JavaScript
* Angular

## **Backend**

* **Python** (FastAPI)
* REST API
* Authentication and authorization
* Business logic for orders, carts, products

## **Database**

* **MySQL**
* Persistence via Docker volume
* SQL schema + optional migrations

## **Version Control**

* Git
---

# **8. Docker Deployment Requirements**

### **General**

* Application must run fully via **Docker Compose**.
* Must support one-command deployment:
  `docker-compose up --build`

### **Services**

#### **1. Backend Container**

* Python base image (e.g., `python:3.12-slim`)
* Contains API code
* Installs dependencies via uv
* Uses environment variables for DB connection
* Exposes API port (e.g., 8000)

#### **2. MySQL Container**

* Based on official `mysql` image
* Root password, user, and database from `.env`
* Uses persistent volume for storage
* Loads initial schema from `/docker-entrypoint-initdb.d/` scripts

#### **3. (Optional) Nginx Container**

* Serves static frontend assets
* Reverse proxy to Python backend if required

### **Internal Networking**

* Containers communicate through a dedicated internal network
* Backend connects to DB using container name (e.g., `mysql:3306`)

### **Environment Management**

* `.env` file for:

  * DB credentials
  * Secret keys
  * JWT/session settings

---

# **9. Implementation Roadmap (10 Steps)**

1. Development environment setup
2. Basic frontend structure (HTML/CSS)
3. Add JavaScript interactivity (cart, DOM logic)
4. Implement backend foundation (Python + MySQL)
5. User authentication (secure password storage, sessions/tokens)
6. Order placement + cart persistence
7. Admin product management
8. Admin order management
9. Customer order history & tracking
10. Final integration + Docker-based deployment


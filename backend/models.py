from sqlalchemy import Column, Integer, String, Text, DECIMAL, Boolean, Enum, TIMESTAMP, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class UserRole(str, enum.Enum):
    """User role enumeration."""
    CUSTOMER = "customer"
    ADMIN = "admin"


class OrderStatus(str, enum.Enum):
    """Order status enumeration."""
    PENDING = "Pending"
    CONFIRMED = "Confirmed"
    PAYMENT_PENDING = "Payment Pending"
    PAYMENT_RECEIVED = "Payment Received"
    DELIVERED = "Delivered"
    CANCELED = "Canceled"


class User(Base):
    """User model for authentication and profile."""
    __tablename__ = "Users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    nickname = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.CUSTOMER, index=True)
    
    # Address fields (optional)
    street_address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    country = Column(String(100), nullable=True)
    
    # Payment fields (optional)
    payment_method = Column(String(50), nullable=True)
    
    # Metadata
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    cart_items = relationship("CartItem", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user")


class ProductCategory(Base):
    """Product category model."""
    __tablename__ = "ProductCategories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    image = Column(String(500), nullable=True)
    display_order = Column(Integer, default=0)
    
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    products = relationship("Product", back_populates="category", cascade="all, delete-orphan")


class Product(Base):
    """Product model."""
    __tablename__ = "Products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    category_id = Column(Integer, ForeignKey("ProductCategories.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    image = Column(String(500), nullable=True)
    base_price = Column(DECIMAL(10, 2), nullable=False)
    
    # Options stored as JSON (e.g., {"sizes": ["S", "M", "L"], "colors": ["red", "blue"]})
    options = Column(JSON, nullable=True)
    
    # Inventory
    stock_quantity = Column(Integer, default=0)
    is_active = Column(Boolean, default=True, index=True)
    
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    category = relationship("ProductCategory", back_populates="products")
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")


class CartItem(Base):
    """Shopping cart item model."""
    __tablename__ = "CartItems"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("Users.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("Products.id", ondelete="CASCADE"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False, default=1)
    
    # Store selected options (e.g., {"size": "M", "color": "blue"})
    selected_options = Column(JSON, nullable=True)
    
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")


class Order(Base):
    """Order model."""
    __tablename__ = "Orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("Users.id", ondelete="RESTRICT"), nullable=False, index=True)
    order_date = Column(TIMESTAMP, server_default=func.now(), nullable=False, index=True)
    status = Column(Enum(OrderStatus), nullable=False, default=OrderStatus.PENDING, index=True)
    
    # Shipping information (captured at order time)
    shipping_street = Column(String(255), nullable=True)
    shipping_city = Column(String(100), nullable=True)
    shipping_postal_code = Column(String(20), nullable=True)
    shipping_country = Column(String(100), nullable=True)
    
    # Order totals
    subtotal = Column(DECIMAL(10, 2), nullable=False)
    tax = Column(DECIMAL(10, 2), default=0.00)
    shipping_cost = Column(DECIMAL(10, 2), default=0.00)
    total = Column(DECIMAL(10, 2), nullable=False)
    
    # Notes
    customer_notes = Column(Text, nullable=True)
    admin_notes = Column(Text, nullable=True)
    
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    """Order item model."""
    __tablename__ = "OrderItems"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("Orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("Products.id", ondelete="RESTRICT"), nullable=False, index=True)
    
    # Capture product details at purchase time (denormalized for history)
    product_title = Column(String(255), nullable=False)
    product_image = Column(String(500), nullable=True)
    
    quantity = Column(Integer, nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)  # Price at time of purchase
    
    # Selected options at time of purchase
    selected_options = Column(JSON, nullable=True)
    
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    
    # Relationships
    order = relationship("Order", back_populates="order_items")
    product = relationship("Product", back_populates="order_items")

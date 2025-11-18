from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Dict, Any
from datetime import datetime
from models import UserRole


# =============================================
# Authentication Schemas
# =============================================

class UserRegister(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    nickname: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8, max_length=100)
    password_confirm: str = Field(..., min_length=8, max_length=100)
    
    # Optional address fields
    street_address: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=100)
    
    # Optional payment fields
    payment_method: Optional[str] = Field(None, max_length=50)
    
    @field_validator('password_confirm')
    @classmethod
    def passwords_match(cls, v, info):
        """Validate that password and password_confirm match."""
        if 'password' in info.data and v != info.data['password']:
            raise ValueError('Passwords do not match')
        return v
    
    @field_validator('nickname')
    @classmethod
    def nickname_alphanumeric(cls, v):
        """Validate that nickname contains only alphanumeric characters and underscores."""
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('Nickname must contain only letters, numbers, hyphens, and underscores')
        return v


class UserLogin(BaseModel):
    """Schema for user login."""
    username: str = Field(..., description="Email or nickname")
    password: str


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for decoded token data."""
    user_id: Optional[int] = None
    role: Optional[UserRole] = None


class UserResponse(BaseModel):
    """Schema for user response (without sensitive data)."""
    id: int
    email: str
    nickname: str
    role: UserRole
    
    # Address fields
    street_address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    
    # Payment fields
    payment_method: Optional[str] = None
    
    # Metadata
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    email: Optional[EmailStr] = None
    nickname: Optional[str] = Field(None, min_length=3, max_length=100)
    
    # Address fields
    street_address: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=100)
    
    # Payment fields
    payment_method: Optional[str] = Field(None, max_length=50)
    
    @field_validator('nickname')
    @classmethod
    def nickname_alphanumeric(cls, v):
        """Validate that nickname contains only alphanumeric characters and underscores."""
        if v and not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('Nickname must contain only letters, numbers, hyphens, and underscores')
        return v


class PasswordChange(BaseModel):
    """Schema for changing user password."""
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)
    new_password_confirm: str = Field(..., min_length=8, max_length=100)
    
    @field_validator('new_password_confirm')
    @classmethod
    def passwords_match(cls, v, info):
        """Validate that new_password and new_password_confirm match."""
        if 'new_password' in info.data and v != info.data['new_password']:
            raise ValueError('Passwords do not match')
        return v


# =============================================
# Product Category Schemas
# =============================================

class ProductCategoryResponse(BaseModel):
    """Schema for product category response."""
    id: int
    name: str
    title: str
    image: Optional[str] = None
    display_order: int
    
    class Config:
        from_attributes = True


# =============================================
# Product Schemas
# =============================================

class ProductCreate(BaseModel):
    """Schema for creating a new product."""
    category_id: int
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    base_price: float = Field(..., gt=0, description="Base price must be greater than 0")
    image: Optional[str] = Field(None, max_length=500)
    options: Optional[Dict[str, Any]] = Field(default_factory=dict)
    stock_quantity: int = Field(default=0, ge=0)
    is_active: bool = Field(default=True)


class ProductUpdate(BaseModel):
    """Schema for updating a product."""
    category_id: Optional[int] = None
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    base_price: Optional[float] = Field(None, gt=0)
    image: Optional[str] = Field(None, max_length=500)
    options: Optional[Dict[str, Any]] = None
    stock_quantity: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class ProductResponse(BaseModel):
    """Schema for product response."""
    id: int
    category_id: int
    category: ProductCategoryResponse
    title: str
    description: Optional[str] = None
    base_price: float
    image: Optional[str] = None
    options: Optional[Dict[str, Any]] = Field(default_factory=dict)
    stock_quantity: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True



# =============================================
# Cart Schemas
# =============================================

class CartItemCreate(BaseModel):
    """Schema for creating a cart item."""
    product_id: int
    quantity: int = Field(..., gt=0, description="Quantity must be greater than 0")
    selected_options: Optional[Dict[str, Any]] = None  # e.g. {"size": "M", "color": "black"}


class CartItemUpdate(BaseModel):
    """Schema for updating a cart item."""
    quantity: int = Field(..., gt=0, description="Quantity must be greater than 0")
    selected_options: Optional[Dict[str, Any]] = None


class CartItemResponse(BaseModel):
    """Schema for cart item response."""
    id: int
    user_id: int
    product_id: int
    product: ProductResponse  # Include full product details
    quantity: int
    selected_options: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CartSummary(BaseModel):
    """Schema for cart summary with totals."""
    items: list[CartItemResponse]
    total_items: int
    subtotal: float  # Sum of (product.base_price * quantity)


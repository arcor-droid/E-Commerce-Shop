from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
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

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from database import get_db
from models import User, UserRole
from schemas import UserRegister, UserLogin, Token, UserResponse, UserUpdate, PasswordChange
from auth_utils import hash_password, verify_password
from jwt_utils import create_access_token
from dependencies import get_current_active_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_db)):
    """
    Register a new user account.
    
    - **email**: Valid email address (unique)
    - **nickname**: Username (unique, 3-100 characters)
    - **password**: Password (minimum 8 characters)
    - **password_confirm**: Password confirmation (must match password)
    - Optional address and payment fields
    """
    # Check if email already exists
    result = await db.execute(select(User).filter(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if nickname already exists
    result = await db.execute(select(User).filter(User.nickname == user_data.nickname))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nickname already taken"
        )
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    new_user = User(
        email=user_data.email,
        nickname=user_data.nickname,
        password_hash=hashed_password,
        role=UserRole.CUSTOMER,  # Default role
        street_address=user_data.street_address,
        city=user_data.city,
        postal_code=user_data.postal_code,
        country=user_data.country,
        payment_method=user_data.payment_method
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    logger.info(f"New user registered: {new_user.email} (ID: {new_user.id})")
    return new_user


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """
    Login with email or nickname and password.
    
    Returns JWT access token for authenticated requests.
    """
    # Find user by email or nickname
    result = await db.execute(
        select(User).filter(
            or_(User.email == form_data.username, User.nickname == form_data.username)
        )
    )
    user = result.scalar_one_or_none()
    
    # Verify user exists and password is correct
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/nickname or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value}
    )
    
    logger.info(f"User logged in: {user.email} (ID: {user.id})")
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """
    Get current authenticated user's profile information.
    
    Requires valid JWT token in Authorization header.
    """
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update current user's profile information.
    
    Requires valid JWT token in Authorization header.
    """
    # Check if email is being changed and if it's already taken
    if user_update.email and user_update.email != current_user.email:
        result = await db.execute(select(User).filter(User.email == user_update.email))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        current_user.email = user_update.email
    
    # Check if nickname is being changed and if it's already taken
    if user_update.nickname and user_update.nickname != current_user.nickname:
        result = await db.execute(select(User).filter(User.nickname == user_update.nickname))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nickname already taken"
            )
        current_user.nickname = user_update.nickname
    
    # Update other fields if provided
    if user_update.street_address is not None:
        current_user.street_address = user_update.street_address
    if user_update.city is not None:
        current_user.city = user_update.city
    if user_update.postal_code is not None:
        current_user.postal_code = user_update.postal_code
    if user_update.country is not None:
        current_user.country = user_update.country
    if user_update.payment_method is not None:
        current_user.payment_method = user_update.payment_method
    
    await db.commit()
    await db.refresh(current_user)
    
    logger.info(f"User profile updated: {current_user.email} (ID: {current_user.id})")
    return current_user


@router.post("/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Change current user's password.
    
    Requires valid JWT token and correct current password.
    """
    # Verify current password
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    current_user.password_hash = hash_password(password_data.new_password)
    await db.commit()
    
    logger.info(f"Password changed for user: {current_user.email} (ID: {current_user.id})")
    return {"message": "Password changed successfully"}

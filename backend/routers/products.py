"""
Product API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from pathlib import Path
import uuid
import shutil

from database import get_db
from models import Product, ProductCategory, User
from schemas import ProductCreate, ProductUpdate, ProductResponse, ProductCategoryResponse
from dependencies import get_current_user, require_admin

router = APIRouter(prefix="/products", tags=["products"])

# Configure upload directory
UPLOAD_DIR = Path(__file__).parent.parent / "static" / "images" / "products"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Allowed image extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def set_product_image_url(product: Product) -> None:
    """Set the image URL for a product if it has image_data."""
    if product.image_data:
        product.image = f"/products/{product.id}/image"


# =============================================
# Image Upload Endpoint
# =============================================

@router.post("/upload-image")
async def upload_product_image(
    file: UploadFile = File(...),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload a product image and store it in the database.
    Admin only endpoint.
    Returns the product ID after creation or an image identifier.
    """
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Validate file extension
    file_ext = Path(file.filename or "").suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File extension must be one of: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Read file and validate size
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size must not exceed {MAX_FILE_SIZE / (1024*1024)}MB"
        )
    
    # Generate a unique identifier for the image
    image_id = str(uuid.uuid4())
    
    # Return image data to be stored when product is saved
    # Frontend will include this in the product creation/update request
    return {
        "image_id": image_id,
        "image_data": file_content.hex(),  # Send as hex string
        "mime_type": file.content_type,
        "size": len(file_content),
        "filename": file.filename
    }


@router.get("/{product_id}/image")
async def get_product_image(
    product_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get product image from database.
    Public endpoint - returns the image binary data.
    """
    result = await db.execute(
        select(Product).filter(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    if not product.image_data or not product.image_mime_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product has no image"
        )
    
    # Return image as binary response
    return Response(
        content=product.image_data,
        media_type=product.image_mime_type,
        headers={
            "Cache-Control": "public, max-age=31536000",  # Cache for 1 year
        }
    )


# =============================================
# Product Category Endpoints
# =============================================

@router.get("/categories", response_model=List[ProductCategoryResponse])
async def get_categories(db: AsyncSession = Depends(get_db)):
    """
    Get all product categories.
    Public endpoint - no authentication required.
    """
    result = await db.execute(
        select(ProductCategory).order_by(ProductCategory.display_order)
    )
    categories = result.scalars().all()
    return categories


# =============================================
# Product Endpoints
# =============================================

@router.get("", response_model=List[ProductResponse])
async def get_products(
    category_id: int = None,
    is_active: Optional[bool] = True,  # Default to True for public users
    show_all: bool = False,  # If True, ignore is_active filter (for admins)
    db: AsyncSession = Depends(get_db)
):
    """
    Get all products with optional filtering.
    Public endpoint - no authentication required.
    By default, returns only active products.
    Use show_all=true to get both active and inactive products (useful for admins).
    """
    query = select(Product).options(selectinload(Product.category))
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    # Only filter by is_active if show_all is False
    if not show_all and is_active is not None:
        query = query.filter(Product.is_active == is_active)
    
    query = query.order_by(Product.created_at.desc())
    
    result = await db.execute(query)
    products = result.scalars().all()
    
    # Set image URLs for products with DB-stored images
    for product in products:
        set_product_image_url(product)
    
    return products


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get a specific product by ID.
    Public endpoint - no authentication required.
    """
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.category))
        .filter(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Set image URL if stored in DB
    set_product_image_url(product)
    
    return product


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Create a new product.
    Admin only endpoint.
    """
    # Check if category exists
    category_result = await db.execute(
        select(ProductCategory).filter(ProductCategory.id == product_data.category_id)
    )
    category = category_result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Prepare product data
    product_dict = product_data.model_dump(exclude={'image_data_hex'})
    
    # Convert hex image data to binary if provided
    if product_data.image_data_hex:
        try:
            product_dict['image_data'] = bytes.fromhex(product_data.image_data_hex)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image data format"
            )
    
    # Create product
    product = Product(**product_dict)
    db.add(product)
    await db.commit()
    await db.refresh(product)
    
    # Load category relationship
    await db.refresh(product, ["category"])
    
    # Set image URL if stored in DB
    set_product_image_url(product)
    
    return product


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Update a product.
    Admin only endpoint.
    """
    # Get product
    result = await db.execute(
        select(Product).filter(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # If category is being changed, verify it exists
    if product_data.category_id is not None:
        category_result = await db.execute(
            select(ProductCategory).filter(ProductCategory.id == product_data.category_id)
        )
        category = category_result.scalar_one_or_none()
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
    
    # Update product fields
    update_data = product_data.model_dump(exclude_unset=True, exclude={'image_data_hex'})
    
    # Convert hex image data to binary if provided
    if product_data.image_data_hex:
        try:
            update_data['image_data'] = bytes.fromhex(product_data.image_data_hex)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image data format"
            )
    
    for field, value in update_data.items():
        setattr(product, field, value)
    
    await db.commit()
    await db.refresh(product)
    
    # Load category relationship
    await db.refresh(product, ["category"])
    
    # Set image URL if image data exists
    set_product_image_url(product)
    
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Delete a product.
    Admin only endpoint.
    """
    result = await db.execute(
        select(Product).filter(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    await db.delete(product)
    await db.commit()
    
    return None

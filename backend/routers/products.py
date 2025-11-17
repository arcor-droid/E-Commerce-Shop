"""
Product API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List

from database import get_db
from models import Product, ProductCategory, User
from schemas import ProductCreate, ProductUpdate, ProductResponse, ProductCategoryResponse
from dependencies import get_current_user, require_admin

router = APIRouter(prefix="/products", tags=["products"])


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
    is_active: bool = True,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all products with optional filtering.
    Public endpoint - no authentication required.
    """
    query = select(Product).options(selectinload(Product.category))
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    if is_active is not None:
        query = query.filter(Product.is_active == is_active)
    
    query = query.order_by(Product.created_at.desc())
    
    result = await db.execute(query)
    products = result.scalars().all()
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
    
    # Create product
    product = Product(**product_data.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    
    # Load category relationship
    await db.refresh(product, ["category"])
    
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
    update_data = product_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    await db.commit()
    await db.refresh(product)
    
    # Load category relationship
    await db.refresh(product, ["category"])
    
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

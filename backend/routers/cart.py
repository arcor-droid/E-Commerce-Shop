"""Cart routes for managing shopping cart items."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from database import get_db
from dependencies import get_current_user
from models import User, CartItem, Product
from schemas import CartItemCreate, CartItemUpdate, CartItemResponse, CartSummary

router = APIRouter(prefix="/cart", tags=["cart"])


@router.get("", response_model=CartSummary)
async def get_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get the current user's shopping cart with all items."""
    # Fetch cart items with product details
    result = await db.execute(
        select(CartItem)
        .where(CartItem.user_id == current_user.id)
        .order_by(CartItem.created_at.desc())
    )
    cart_items = result.scalars().all()
    
    # Load product details for each cart item
    items_with_products = []
    subtotal = 0
    
    for cart_item in cart_items:
        # Fetch product details with category
        product_result = await db.execute(
            select(Product)
            .options(selectinload(Product.category))
            .where(Product.id == cart_item.product_id)
        )
        product = product_result.scalar_one_or_none()
        
        if not product:
            # Product was deleted, skip this cart item
            continue
        
        # Calculate item subtotal (convert Decimal to float)
        item_total = float(product.base_price) * cart_item.quantity
        subtotal += item_total
        
        items_with_products.append({
            "id": cart_item.id,
            "user_id": cart_item.user_id,
            "product_id": cart_item.product_id,
            "product": product,
            "quantity": cart_item.quantity,
            "selected_options": cart_item.selected_options,
            "created_at": cart_item.created_at,
            "updated_at": cart_item.updated_at
        })
    
    return CartSummary(
        items=items_with_products,
        total_items=len(items_with_products),
        subtotal=round(subtotal, 2)
    )


@router.post("/items", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    cart_item_data: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a product to the shopping cart."""
    # Check if product exists and is active
    product_result = await db.execute(
        select(Product)
        .options(selectinload(Product.category))
        .where(Product.id == cart_item_data.product_id)
    )
    product = product_result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    if not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product is not available for purchase"
        )
    
    # Check if product already exists in cart with same options
    existing_result = await db.execute(
        select(CartItem).where(
            CartItem.user_id == current_user.id,
            CartItem.product_id == cart_item_data.product_id
        )
    )
    existing_item = existing_result.scalar_one_or_none()
    
    if existing_item:
        # Check if options match
        if existing_item.selected_options == cart_item_data.selected_options:
            # Update quantity instead of creating new item
            existing_item.quantity += cart_item_data.quantity
            await db.commit()
            await db.refresh(existing_item)
            
            # Load product details
            existing_item.product = product
            return existing_item
    
    # Create new cart item
    new_cart_item = CartItem(
        user_id=current_user.id,
        product_id=cart_item_data.product_id,
        quantity=cart_item_data.quantity,
        selected_options=cart_item_data.selected_options
    )
    
    db.add(new_cart_item)
    await db.commit()
    await db.refresh(new_cart_item)
    
    # Attach product details
    new_cart_item.product = product
    return new_cart_item


@router.put("/items/{cart_item_id}", response_model=CartItemResponse)
async def update_cart_item(
    cart_item_id: int,
    cart_item_data: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a cart item's quantity or selected options."""
    # Fetch cart item
    result = await db.execute(
        select(CartItem).where(
            CartItem.id == cart_item_id,
            CartItem.user_id == current_user.id
        )
    )
    cart_item = result.scalar_one_or_none()
    
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    
    # Update fields
    cart_item.quantity = cart_item_data.quantity
    if cart_item_data.selected_options is not None:
        cart_item.selected_options = cart_item_data.selected_options
    
    await db.commit()
    await db.refresh(cart_item)
    
    # Load product details with category
    product_result = await db.execute(
        select(Product)
        .options(selectinload(Product.category))
        .where(Product.id == cart_item.product_id)
    )
    product = product_result.scalar_one_or_none()
    cart_item.product = product
    
    return cart_item


@router.delete("/items/{cart_item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_cart_item(
    cart_item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove an item from the shopping cart."""
    # Fetch cart item
    result = await db.execute(
        select(CartItem).where(
            CartItem.id == cart_item_id,
            CartItem.user_id == current_user.id
        )
    )
    cart_item = result.scalar_one_or_none()
    
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    
    await db.delete(cart_item)
    await db.commit()
    
    return None


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove all items from the shopping cart."""
    result = await db.execute(
        select(CartItem).where(CartItem.user_id == current_user.id)
    )
    cart_items = result.scalars().all()
    
    for item in cart_items:
        await db.delete(item)
    
    await db.commit()
    return None

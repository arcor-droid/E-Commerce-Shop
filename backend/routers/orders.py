"""Orders routes for checkout and order management."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from decimal import Decimal
from database import get_db
from dependencies import get_current_user
from models import User, Order, OrderItem, CartItem, Product, OrderStatus
from schemas import OrderResponse, CheckoutResponse

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("/checkout", response_model=CheckoutResponse, status_code=status.HTTP_201_CREATED)
async def checkout(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Simple checkout: Convert cart items to an order.
    No payment processing - just creates the order and clears the cart.
    """
    # Get user's cart items
    cart_result = await db.execute(
        select(CartItem)
        .where(CartItem.user_id == current_user.id)
        .order_by(CartItem.created_at)
    )
    cart_items = cart_result.scalars().all()
    
    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty"
        )
    
    # Calculate order totals
    subtotal = Decimal('0.00')
    order_items_data = []
    
    for cart_item in cart_items:
        # Load product details
        product_result = await db.execute(
            select(Product).where(Product.id == cart_item.product_id)
        )
        product = product_result.scalar_one_or_none()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {cart_item.product_id} not found"
            )
        
        if not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product '{product.title}' is no longer available"
            )
        
        if product.stock_quantity < cart_item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not enough stock for '{product.title}'. Available: {product.stock_quantity}"
            )
        
        # Calculate item total
        item_total = product.base_price * cart_item.quantity
        subtotal += item_total
        
        # Prepare order item data
        order_items_data.append({
            'product_id': product.id,
            'product_title': product.title,
            'product_image': product.image,
            'quantity': cart_item.quantity,
            'price': product.base_price,
            'selected_options': cart_item.selected_options
        })
        
        # Update product stock
        product.stock_quantity -= cart_item.quantity
    
    # For university project: No tax, no shipping cost
    tax = Decimal('0.00')
    shipping_cost = Decimal('0.00')
    total = subtotal + tax + shipping_cost
    
    # Create order
    new_order = Order(
        user_id=current_user.id,
        status=OrderStatus.PENDING,  # Use enum value
        subtotal=subtotal,
        tax=tax,
        shipping_cost=shipping_cost,
        total=total
    )
    
    db.add(new_order)
    await db.flush()  # Get order ID
    
    # Create order items
    for item_data in order_items_data:
        order_item = OrderItem(
            order_id=new_order.id,
            **item_data
        )
        db.add(order_item)
    
    # Clear the cart
    for cart_item in cart_items:
        await db.delete(cart_item)
    
    # Commit all changes
    await db.commit()
    
    # Reload order with items for response
    order_result = await db.execute(
        select(Order)
        .options(selectinload(Order.order_items))
        .where(Order.id == new_order.id)
    )
    order = order_result.scalar_one()
    
    return CheckoutResponse(
        message="Order placed successfully!",
        order=order
    )


@router.get("", response_model=List[OrderResponse])
async def get_user_orders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all orders for the current user."""
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.order_items))
        .where(Order.user_id == current_user.id)
        .order_by(Order.order_date.desc())
    )
    orders = result.scalars().all()
    return orders


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific order by ID."""
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.order_items))
        .where(Order.id == order_id, Order.user_id == current_user.id)
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return order

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService, CartSummary, CartItem } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit, OnDestroy {
  cart: CartSummary = {
    items: [],
    total_items: 0,
    subtotal: 0
  };
  loading = true;
  error = '';
  checkoutLoading = false;
  
  private cartSubscription?: Subscription;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to cart updates from the service
    this.cartSubscription = this.cartService.cart$.subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        this.error = 'Failed to load cart. Please try again.';
        this.loading = false;
      }
    });
    
    // Load cart initially
    this.loadCart();
  }
  
  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
  }

  /**
   * Load cart data from the service
   */
  loadCart(): void {
    this.loading = true;
    this.error = '';
    
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        this.error = 'Failed to load cart. Please try again.';
        this.loading = false;
      }
    });
  }

  /**
   * Increase quantity of an item
   */
  increaseQuantity(item: CartItem): void {
    const newQuantity = item.quantity + 1;
    this.updateQuantity(item, newQuantity);
  }

  /**
   * Decrease quantity of an item
   */
  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      const newQuantity = item.quantity - 1;
      this.updateQuantity(item, newQuantity);
    }
  }

  /**
   * Update item quantity
   */
  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1) return;
    
    this.cartService.updateCartItem(item.id, newQuantity, item.selected_options).subscribe({
      next: () => {
        // Cart will be reloaded automatically by the service
      },
      error: (err) => {
        console.error('Error updating quantity:', err);
        this.error = 'Failed to update quantity. Please try again.';
      }
    });
  }

  /**
   * Remove item from cart
   */
  removeItem(item: CartItem): void {
    if (confirm(`Remove "${item.product.title}" from cart?`)) {
      this.cartService.removeCartItem(item.id).subscribe({
        next: () => {
          // Cart will be reloaded automatically by the service
        },
        error: (err) => {
          console.error('Error removing item:', err);
          this.error = 'Failed to remove item. Please try again.';
        }
      });
    }
  }

  /**
   * Clear entire cart
   */
  clearCart(): void {
    if (confirm('Clear all items from your cart?')) {
      this.cartService.clearCart().subscribe({
        next: () => {
          this.cart = {
            items: [],
            total_items: 0,
            subtotal: 0
          };
        },
        error: (err) => {
          console.error('Error clearing cart:', err);
          this.error = 'Failed to clear cart. Please try again.';
        }
      });
    }
  }

  /**
   * Calculate item total
   */
  getItemTotal(item: CartItem): number {
    return item.product.base_price * item.quantity;
  }

  /**
   * Format selected options for display
   */
  formatOptions(options: { [key: string]: any } | undefined): string {
    if (!options) return '';
    return Object.entries(options)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }

  /**
   * Navigate to checkout
   */
  proceedToCheckout(): void {
    if (this.cart.items.length === 0) {
      this.error = 'Your cart is empty!';
      return;
    }

    this.checkoutLoading = true;
    this.error = '';

    this.orderService.checkout().subscribe({
      next: (response) => {
        console.log('Order placed successfully:', response);
        // Refresh cart to update the badge count to 0
        this.cartService.refreshCart();
        // Navigate to order confirmation with order ID
        this.router.navigate(['/orders', response.order.id]);
      },
      error: (err) => {
        console.error('Checkout error:', err);
        this.error = err.error?.detail || 'Failed to complete checkout. Please try again.';
        this.checkoutLoading = false;
      }
    });
  }

  /**
   * Continue shopping
   */
  continueShopping(): void {
    this.router.navigate(['/products']);
  }
}

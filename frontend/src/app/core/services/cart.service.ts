import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  product: any; // Product details
  quantity: number;
  selected_options?: { [key: string]: any };
  created_at: string;
  updated_at: string;
}

export interface CartSummary {
  items: CartItem[];
  total_items: number;
  subtotal: number;
}

export interface AddToCartRequest {
  product_id: number;
  quantity: number;
  selected_options?: { [key: string]: any };
}

export interface UpdateCartItemRequest {
  quantity: number;
  selected_options?: { [key: string]: any };
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:8000/cart';
  
  // BehaviorSubject to manage cart state
  private cartSubject = new BehaviorSubject<CartSummary>({
    items: [],
    total_items: 0,
    subtotal: 0
  });
  
  // Observable for components to subscribe to
  public cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load cart on service initialization if user is logged in
    const token = localStorage.getItem('access_token');
    if (token) {
      this.loadCart();
    }
  }

  /**
   * Load the user's cart from the backend
   */
  private loadCart(): void {
    this.http.get<CartSummary>(this.apiUrl).subscribe({
      next: (cart) => {
        this.cartSubject.next(cart);
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        // Reset cart on error
        this.cartSubject.next({
          items: [],
          total_items: 0,
          subtotal: 0
        });
      }
    });
  }

  /**
   * Get the current cart (returns Observable)
   */
  getCart(): Observable<CartSummary> {
    return this.http.get<CartSummary>(this.apiUrl).pipe(
      tap((cart) => this.cartSubject.next(cart))
    );
  }

  /**
   * Get the current cart count
   */
  getCartCount(): number {
    return this.cartSubject.value.total_items;
  }

  /**
   * Add a product to the cart
   */
  addToCart(productId: number, quantity: number, selectedOptions?: { [key: string]: any }): Observable<CartItem> {
    const request: AddToCartRequest = {
      product_id: productId,
      quantity: quantity,
      selected_options: selectedOptions
    };

    return this.http.post<CartItem>(`${this.apiUrl}/items`, request).pipe(
      tap(() => {
        // Reload cart after adding item
        this.loadCart();
      })
    );
  }

  /**
   * Update a cart item's quantity or options
   */
  updateCartItem(cartItemId: number, quantity: number, selectedOptions?: { [key: string]: any }): Observable<CartItem> {
    const request: UpdateCartItemRequest = {
      quantity: quantity,
      selected_options: selectedOptions
    };

    return this.http.put<CartItem>(`${this.apiUrl}/items/${cartItemId}`, request).pipe(
      tap(() => {
        // Reload cart after updating item
        this.loadCart();
      })
    );
  }

  /**
   * Remove an item from the cart
   */
  removeCartItem(cartItemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/items/${cartItemId}`).pipe(
      tap(() => {
        // Reload cart after removing item
        this.loadCart();
      })
    );
  }

  /**
   * Clear all items from the cart
   */
  clearCart(): Observable<void> {
    return this.http.delete<void>(this.apiUrl).pipe(
      tap(() => {
        // Reset cart state
        this.cartSubject.next({
          items: [],
          total_items: 0,
          subtotal: 0
        });
      })
    );
  }

  /**
   * Refresh cart data (call after login or when needed)
   */
  refreshCart(): void {
    this.loadCart();
  }

  /**
   * Reset cart state (call after logout)
   */
  resetCart(): void {
    this.cartSubject.next({
      items: [],
      total_items: 0,
      subtotal: 0
    });
  }
}

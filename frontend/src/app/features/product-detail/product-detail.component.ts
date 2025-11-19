import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  readonly authService = inject(AuthService);
  private readonly assetBaseUrl = environment.assetFallbackBaseUrl || environment.apiUrl;

  product: Product | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // Cart-related properties
  quantity = 1;
  selectedOptions: { [key: string]: any } = {};
  isAddingToCart = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(+id);
    } else {
      this.errorMessage = 'Invalid product ID';
    }
  }

  loadProduct(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.product = product;
        this.isLoading = false;
        // Initialize selected options with first available option for each key
        this.initializeOptions();
      },
      error: (error) => {
        this.errorMessage = 'Product not found';
        this.isLoading = false;
        console.error('Failed to load product:', error);
      }
    });
  }

  /**
   * Initialize selected options with defaults (first option for each)
   */
  initializeOptions(): void {
    if (!this.product?.options) return;
    
    Object.entries(this.product.options).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        this.selectedOptions[key] = value[0];
      } else {
        this.selectedOptions[key] = value;
      }
    });
  }

  /**
   * Add product to cart
   */
  addToCart(): void {
    if (!this.product || !this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.quantity < 1) {
      this.errorMessage = 'Please enter a valid quantity';
      return;
    }

    this.isAddingToCart = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Only pass options if product has options defined
    const options = Object.keys(this.selectedOptions).length > 0 
      ? this.selectedOptions 
      : undefined;

    this.cartService.addToCart(this.product.id, this.quantity, options).subscribe({
      next: () => {
        this.successMessage = `Added ${this.quantity} × ${this.product!.title} to cart!`;
        this.isAddingToCart = false;
        // Reset quantity to 1 after successful add
        this.quantity = 1;
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = 'Failed to add to cart. Please try again.';
        this.isAddingToCart = false;
        console.error('Failed to add to cart:', error);
      }
    });
  }

  /**
   * Increase quantity
   */
  increaseQuantity(): void {
    this.quantity++;
  }

  /**
   * Decrease quantity
   */
  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  /**
   * Get product image URL with fallback to placeholder
   */
  getProductImageUrl(product: Product): string {
    if (product.image) {
      if (product.image.startsWith('http://') || product.image.startsWith('https://')) {
        return product.image;
      }
      const normalizedBase = this.assetBaseUrl.replace(/\/$/, '');
      return `${normalizedBase}${product.image}`;
    }
    return `https://placehold.co/600x600/4f46e5/white?text=${encodeURIComponent(product.title.substring(0, 20))}`;
  }

  /**
   * Get available options as array for display
   */
  getOptions(): Array<{key: string, value: any}> {
    if (!this.product?.options) return [];
    return Object.entries(this.product.options).map(([key, value]) => ({key, value}));
  }

  /**
   * Check if a value is an array
   */
  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  /**
   * Delete product (admin only)
   */
  deleteProduct(): void {
    if (!this.product) return;
    
    if (confirm(`Are you sure you want to delete "${this.product.title}"?`)) {
      this.productService.deleteProduct(this.product.id).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete product';
          console.error('Failed to delete product:', error);
        }
      });
    }
  }

  /**
   * Navigate back to products list
   */
  goBack(): void {
    this.router.navigate(['/products']);
  }
}


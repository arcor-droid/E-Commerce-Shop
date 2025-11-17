import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  readonly authService = inject(AuthService);

  product: Product | null = null;
  isLoading = false;
  errorMessage = '';

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
      },
      error: (error) => {
        this.errorMessage = 'Product not found';
        this.isLoading = false;
        console.error('Failed to load product:', error);
      }
    });
  }

  /**
   * Get product image URL with fallback to placeholder
   */
  getProductImageUrl(product: Product): string {
    if (product.image) {
      if (product.image.startsWith('http://') || product.image.startsWith('https://')) {
        return product.image;
      }
      return `http://localhost:8000${product.image}`;
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


import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { Product, ProductCategory } from '../../core/models/product.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  private readonly productService = inject(ProductService);
  readonly authService = inject(AuthService);
  private readonly assetBaseUrl = environment.assetFallbackBaseUrl || environment.apiUrl;

  products: Product[] = [];
  categories: ProductCategory[] = [];
  selectedCategory: number | null = null;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Failed to load categories:', error);
      }
    });
  }

  loadProducts(categoryId?: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Admins see all products (active + inactive)
    const showAll = this.authService.isAdmin();

    this.productService.getProducts(categoryId, showAll).subscribe({
      next: (products) => {
        this.products = products;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load products';
        this.isLoading = false;
        console.error('Failed to load products:', error);
      }
    });
  }

  filterByCategory(categoryId: number | null): void {
    this.selectedCategory = categoryId;
    if (categoryId === null) {
      this.loadProducts();
    } else {
      this.loadProducts(categoryId);
    }
  }

  /**
   * Get product image URL with fallback to placeholder
   */
  getProductImageUrl(product: Product): string {
    // If product has an image path, construct full URL to backend
    if (product.image) {
      // If it's already a full URL, use it
      if (product.image.startsWith('http://') || product.image.startsWith('https://')) {
        return product.image;
      }
      // Otherwise, prepend backend URL
      const normalizedBase = this.assetBaseUrl.replace(/\/$/, '');
      return `${normalizedBase}${product.image}`;
    }
    
    // Fallback to placeholder
    return `https://placehold.co/400x400/4f46e5/white?text=${encodeURIComponent(product.title.substring(0, 20))}`;
  }

  /**
   * Handle image load errors by replacing with placeholder
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://placehold.co/400x400/gray/white?text=No+Image';
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductCategory, ProductCreate, ProductUpdate } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8000';

  /**
   * Get all product categories
   */
  getCategories(): Observable<ProductCategory[]> {
    return this.http.get<ProductCategory[]>(`${this.API_URL}/products/categories`);
  }

  /**
   * Get all products with optional filtering
   */
  getProducts(categoryId?: number, isActive?: boolean): Observable<Product[]> {
    let params = new HttpParams();
    
    if (categoryId !== undefined) {
      params = params.set('category_id', categoryId.toString());
    }
    
    if (isActive !== undefined) {
      params = params.set('is_active', isActive.toString());
    }

    return this.http.get<Product[]>(`${this.API_URL}/products`, { params });
  }

  /**
   * Get a specific product by ID
   */
  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/products/${id}`);
  }

  /**
   * Create a new product (admin only)
   */
  createProduct(product: ProductCreate): Observable<Product> {
    return this.http.post<Product>(`${this.API_URL}/products`, product);
  }

  /**
   * Update a product (admin only)
   */
  updateProduct(id: number, product: ProductUpdate): Observable<Product> {
    return this.http.put<Product>(`${this.API_URL}/products/${id}`, product);
  }

  /**
   * Delete a product (admin only)
   */
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/products/${id}`);
  }
}

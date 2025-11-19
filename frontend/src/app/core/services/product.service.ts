import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductCategory, ProductCreate, ProductUpdate } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  /**
   * Get all product categories
   */
  getCategories(): Observable<ProductCategory[]> {
    return this.http.get<ProductCategory[]>(`${this.API_URL}/products/categories`);
  }

  /**
   * Get all products with optional filtering
   */
  getProducts(categoryId?: number, showAll: boolean = false): Observable<Product[]> {
    let params = new HttpParams();
    
    if (categoryId !== undefined && categoryId !== null) {
      params = params.set('category_id', categoryId.toString());
    }
    
    if (showAll) {
      params = params.set('show_all', 'true');
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

  /**
   * Upload a product image (admin only)
   */
  uploadProductImage(file: File): Observable<{ 
    image_id: string;
    image_data: string; 
    mime_type: string; 
    size: number; 
    filename: string 
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<{ 
      image_id: string;
      image_data: string; 
      mime_type: string; 
      size: number; 
      filename: string 
    }>(
      `${this.API_URL}/products/upload-image`,
      formData
    );
  }
}

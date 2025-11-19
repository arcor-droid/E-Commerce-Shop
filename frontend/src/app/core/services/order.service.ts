import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OrderItem {
  id: number;
  product_title: string;
  product_image: string | null;
  quantity: number;
  price: number;
  selected_options: { [key: string]: any } | null;
}

export interface Order {
  id: number;
  user_id: number;
  order_date: string;
  status: string;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total: number;
  customer_notes: string | null;
  order_items: OrderItem[];
}

export interface AdminOrder extends Order {
  user_email: string;
  user_nickname: string;
  admin_notes: string | null;
  updated_at: string;
}

export interface OrderStatusUpdate {
  status: string;
  admin_notes?: string;
}

export interface CheckoutResponse {
  message: string;
  order: Order;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly API_URL = environment.apiUrl;
  private readonly ordersEndpoint = `${this.API_URL}/orders`;

  constructor(private http: HttpClient) {}

  /**
   * Checkout - convert cart to order
   */
  checkout(): Observable<CheckoutResponse> {
  return this.http.post<CheckoutResponse>(`${this.ordersEndpoint}/checkout`, {});
  }

  /**
   * Get all orders for the current user
   */
  getOrders(): Observable<Order[]> {
  return this.http.get<Order[]>(this.ordersEndpoint);
  }

  /**
   * Get a specific order by ID
   */
  getOrder(orderId: number): Observable<Order> {
  return this.http.get<Order>(`${this.ordersEndpoint}/${orderId}`);
  }

  // Admin methods

  /**
   * Get all orders (admin only)
   */
  getAllOrders(): Observable<AdminOrder[]> {
  return this.http.get<AdminOrder[]>(`${this.ordersEndpoint}/admin/all`);
  }

  /**
   * Get a specific order with user details (admin only)
   */
  getAdminOrder(orderId: number): Observable<AdminOrder> {
  return this.http.get<AdminOrder>(`${this.ordersEndpoint}/admin/${orderId}`);
  }

  /**
   * Update order status (admin only)
   */
  updateOrderStatus(orderId: number, update: OrderStatusUpdate): Observable<AdminOrder> {
  return this.http.put<AdminOrder>(`${this.ordersEndpoint}/admin/${orderId}/status`, update);
  }
}

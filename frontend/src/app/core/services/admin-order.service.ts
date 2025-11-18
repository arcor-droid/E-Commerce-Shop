import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderItem } from './order.service';

export interface AdminOrder {
  id: number;
  user_id: number;
  user_email: string;
  user_nickname: string;
  order_date: string;
  status: string;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total: number;
  customer_notes: string | null;
  admin_notes: string | null;
  order_items: OrderItem[];
  updated_at: string;
}

export interface OrderStatusUpdate {
  status: string;
  admin_notes?: string;
}

export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Payment Pending',
  'Payment Received',
  'Delivered',
  'Canceled'
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

@Injectable({
  providedIn: 'root'
})
export class AdminOrderService {
  private apiUrl = 'http://localhost:8000/orders/admin';

  constructor(private http: HttpClient) {}

  /**
   * Get all orders (admin only)
   * @param status Optional status filter
   */
  getAllOrders(status?: string): Observable<AdminOrder[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<AdminOrder[]>(`${this.apiUrl}/all`, { params });
  }

  /**
   * Get a specific order by ID (admin only)
   */
  getOrderDetails(orderId: number): Observable<AdminOrder> {
    return this.http.get<AdminOrder>(`${this.apiUrl}/${orderId}`);
  }

  /**
   * Update order status (admin only)
   */
  updateOrderStatus(orderId: number, statusUpdate: OrderStatusUpdate): Observable<AdminOrder> {
    return this.http.put<AdminOrder>(`${this.apiUrl}/${orderId}/status`, statusUpdate);
  }
}

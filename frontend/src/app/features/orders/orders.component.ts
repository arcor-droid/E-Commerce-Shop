import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OrderService, Order } from '../../core/services/order.service';

@Component({
  selector: 'app-orders',
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  error = '';

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = '';

    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders.sort((a, b) => 
          new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
        );
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.error = err.error?.detail || 'Failed to load orders.';
        this.loading = false;
      }
    });
  }

  viewOrder(orderId: number): void {
    this.router.navigate(['/orders', orderId]);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Confirmed':
        return 'status-confirmed';
      case 'Payment Pending':
        return 'status-payment-pending';
      case 'Payment Received':
        return 'status-payment-received';
      case 'Delivered':
        return 'status-delivered';
      case 'Canceled':
        return 'status-canceled';
      default:
        return 'status-default';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }
}

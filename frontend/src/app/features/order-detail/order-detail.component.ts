import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrderService, Order } from '../../core/services/order.service';

@Component({
  selector: 'app-order-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    const orderId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (orderId) {
      this.loadOrder(orderId);
    } else {
      this.error = 'Invalid order ID';
      this.loading = false;
    }
  }

  loadOrder(orderId: number): void {
    this.loading = true;
    this.error = '';

    this.orderService.getOrder(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading order:', err);
        this.error = err.error?.detail || 'Failed to load order details.';
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('pending')) return 'status-pending';
    if (statusLower.includes('confirmed')) return 'status-confirmed';
    if (statusLower.includes('delivered')) return 'status-delivered';
    if (statusLower.includes('canceled')) return 'status-canceled';
    return 'status-default';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatOptions(options: { [key: string]: any } | null): string {
    if (!options) return '';
    return Object.entries(options)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }

  viewAllOrders(): void {
    this.router.navigate(['/orders']);
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OrderService, Order } from '../../core/services/order.service';

@Component({
  selector: 'app-orders',
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  loading = true;
  error = '';
  autoRefreshEnabled = true;
  lastUpdated: Date | null = null;
  private refreshInterval: any;
  private readonly REFRESH_INTERVAL_MS = 30000; // 30 seconds

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  startAutoRefresh(): void {
    this.stopAutoRefresh(); // Clear any existing interval
    if (this.autoRefreshEnabled) {
      this.refreshInterval = setInterval(() => {
        this.loadOrders(true); // Silent refresh
      }, this.REFRESH_INTERVAL_MS);
    }
  }

  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  toggleAutoRefresh(): void {
    this.autoRefreshEnabled = !this.autoRefreshEnabled;
    if (this.autoRefreshEnabled) {
      this.startAutoRefresh();
      this.loadOrders(true);
    } else {
      this.stopAutoRefresh();
    }
  }

  loadOrders(silent = false): void {
    if (!silent) {
      this.loading = true;
    }
    this.error = '';

    this.orderService.getOrders().subscribe({
      next: (orders) => {
        // Check for status changes
        if (this.orders.length > 0) {
          this.checkForStatusChanges(orders);
        }
        
        this.orders = orders.sort((a, b) => 
          new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
        );
        this.loading = false;
        this.lastUpdated = new Date();
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        if (!silent) {
          this.error = err.error?.detail || 'Failed to load orders.';
        }
        this.loading = false;
      }
    });
  }

  private checkForStatusChanges(newOrders: Order[]): void {
    newOrders.forEach(newOrder => {
      const oldOrder = this.orders.find(o => o.id === newOrder.id);
      if (oldOrder && oldOrder.status !== newOrder.status) {
        console.log(`Order #${newOrder.id} status changed: ${oldOrder.status} → ${newOrder.status}`);
        // You could show a toast notification here
      }
    });
  }

  viewOrder(orderId: number): void {
    this.router.navigate(['/orders', orderId]);
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

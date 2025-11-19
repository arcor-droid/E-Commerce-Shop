import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrderService, Order } from '../../core/services/order.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-order-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  order: Order | null = null;
  previousStatus: string | null = null;
  statusChanged = false;
  loading = true;
  error = '';
  lastUpdated: Date | null = null;
  autoRefreshEnabled = true;
  private orderId: number | null = null;
  private refreshInterval: any;
  private readonly REFRESH_INTERVAL_MS = 15000; // 15 seconds
  private readonly assetBaseUrl = environment.assetFallbackBaseUrl || environment.apiUrl;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (this.orderId) {
      this.loadOrder(this.orderId);
      this.startAutoRefresh();
    } else {
      this.error = 'Invalid order ID';
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  startAutoRefresh(): void {
    this.stopAutoRefresh();
    if (this.autoRefreshEnabled && this.orderId) {
      this.refreshInterval = setInterval(() => {
        this.loadOrder(this.orderId!, true);
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
      if (this.orderId) {
        this.loadOrder(this.orderId, true);
      }
    } else {
      this.stopAutoRefresh();
    }
  }

  loadOrder(orderId: number, silent = false): void {
    if (!silent) {
      this.loading = true;
    }
    this.error = '';

    this.orderService.getOrder(orderId).subscribe({
      next: (order) => {
        // Check for status change
        if (this.order && this.order.status !== order.status) {
          this.previousStatus = this.order.status;
          this.statusChanged = true;
          console.log(`Order #${order.id} status changed: ${this.previousStatus} → ${order.status}`);
          
          // Reset status change indicator after 5 seconds
          setTimeout(() => {
            this.statusChanged = false;
            this.previousStatus = null;
          }, 5000);
        }
        
        this.order = order;
        this.loading = false;
        this.lastUpdated = new Date();
      },
      error: (err) => {
        console.error('Error loading order:', err);
        if (!silent) {
          this.error = err.error?.detail || 'Failed to load order details.';
        }
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

  getProductImageUrl(imagePath: string | null): string {
    if (imagePath) {
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      const normalizedBase = this.assetBaseUrl.replace(/\/$/, '');
      return `${normalizedBase}${imagePath}`;
    }
    return 'https://via.placeholder.com/100';
  }
}

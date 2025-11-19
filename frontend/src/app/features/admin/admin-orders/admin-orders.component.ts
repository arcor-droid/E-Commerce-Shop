import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, AdminOrder } from '../../../core/services/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-orders',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss'
})
export class AdminOrdersComponent implements OnInit, OnDestroy {
  orders: AdminOrder[] = [];
  filteredOrders: AdminOrder[] = [];
  loading = true;
  error: string | null = null;
  expandedOrderId: number | null = null;
  
  // Filter options
  statusFilter = 'all';
  searchQuery = '';
  
  // Auto-refresh for live updates
  autoRefreshEnabled = true;
  lastUpdated: Date | null = null;
  private refreshInterval: any = null;
  newOrdersCount = 0;
  changedOrderIds = new Set<number>();
  
  // Status options for dropdown
  statusOptions = [
    'Pending',
    'Confirmed',
    'Payment Pending',
    'Payment Received',
    'Delivered',
    'Canceled'
  ];

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
    if (this.refreshInterval) {
      return; // Already running
    }
    
    this.refreshInterval = setInterval(() => {
      if (this.autoRefreshEnabled) {
        this.loadOrders(true); // Silent refresh
      }
    }, 15000); // 15 seconds for admin - faster for live demo!
  }

  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  toggleAutoRefresh(): void {
    this.autoRefreshEnabled = !this.autoRefreshEnabled;
    if (!this.autoRefreshEnabled) {
      this.newOrdersCount = 0;
      this.changedOrderIds.clear();
    }
  }

  loadOrders(silent = false): void {
    if (!silent) {
      this.loading = true;
    }
    this.error = null;
    
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        // Detect new orders and changes
        this.checkForChanges(orders);
        
        this.orders = orders.sort((a, b) => 
          new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
        );
        this.applyFilters();
        this.loading = false;
        this.lastUpdated = new Date();
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.error = 'Failed to load orders. Please try again.';
        this.loading = false;
      }
    });
  }

  checkForChanges(newOrders: AdminOrder[]): void {
    if (this.orders.length === 0) {
      return; // First load, no comparison
    }

    // Check for new orders
    const oldOrderIds = new Set(this.orders.map(o => o.id));
    const newOrdersList = newOrders.filter(o => !oldOrderIds.has(o.id));
    
    if (newOrdersList.length > 0) {
      this.newOrdersCount += newOrdersList.length;
      newOrdersList.forEach(o => this.changedOrderIds.add(o.id));
      console.log(`🆕 ${newOrdersList.length} new order(s) received!`, newOrdersList.map(o => `#${o.id}`));
    }

    // Check for status changes
    const oldOrdersMap = new Map(this.orders.map(o => [o.id, o]));
    newOrders.forEach(newOrder => {
      const oldOrder = oldOrdersMap.get(newOrder.id);
      if (oldOrder && oldOrder.status !== newOrder.status) {
        this.changedOrderIds.add(newOrder.id);
        console.log(`📝 Order #${newOrder.id} status changed: ${oldOrder.status} → ${newOrder.status}`);
      }
    });
  }

  applyFilters(): void {
    this.filteredOrders = this.orders.filter(order => {
      // Status filter
      const matchesStatus = this.statusFilter === 'all' || order.status === this.statusFilter;
      
      // Search filter (customer email, nickname, or order ID)
      const matchesSearch = !this.searchQuery || 
        order.user_email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        order.user_nickname.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        order.id.toString().includes(this.searchQuery);
      
      return matchesStatus && matchesSearch;
    });
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  toggleOrderDetails(orderId: number): void {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }

  onStatusChange(order: AdminOrder, newStatus: string): void {
    if (newStatus === order.status) {
      return; // No change
    }

    const confirmation = confirm(`Change order #${order.id} status from "${order.status}" to "${newStatus}"?`);
    if (!confirmation) {
      // Reset the select to original value
      return;
    }

    this.orderService.updateOrderStatus(order.id, { status: newStatus }).subscribe({
      next: (updatedOrder) => {
        // Update the order in the list
        const index = this.orders.findIndex(o => o.id === order.id);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
        }
        this.applyFilters();
        alert(`Order #${order.id} status updated to "${newStatus}"`);
      },
      error: (err) => {
        console.error('Error updating order status:', err);
        alert('Failed to update order status. Please try again.');
        // Reload orders to reset the UI
        this.loadOrders();
      }
    });
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
        return '';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPrice(price: number): string {
    return `€${price.toFixed(2)}`;
  }
}

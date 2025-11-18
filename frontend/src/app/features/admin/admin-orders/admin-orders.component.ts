import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminOrderService, AdminOrder, ORDER_STATUSES, OrderStatus, OrderStatusUpdate } from '../../../core/services/admin-order.service';

@Component({
  selector: 'app-admin-orders',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss'
})
export class AdminOrdersComponent implements OnInit {
  orders: AdminOrder[] = [];
  filteredOrders: AdminOrder[] = [];
  isLoading = false;
  error: string | null = null;
  
  // Filter options
  statusFilter: string = '';
  ORDER_STATUSES = ORDER_STATUSES;
  
  // For inline status updates
  updatingOrderId: number | null = null;

  constructor(private adminOrderService: AdminOrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(status?: string): void {
    this.isLoading = true;
    this.error = null;
    
    this.adminOrderService.getAllOrders(status).subscribe({
      next: (orders) => {
        this.orders = orders;
        this.filteredOrders = orders;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.error = 'Failed to load orders. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onFilterChange(): void {
    if (this.statusFilter) {
      this.loadOrders(this.statusFilter);
    } else {
      this.loadOrders();
    }
  }

  onStatusChange(order: AdminOrder, newStatus: string): void {
    if (newStatus === order.status) {
      return; // No change
    }

    this.updatingOrderId = order.id;
    
    const statusUpdate: OrderStatusUpdate = {
      status: newStatus
    };

    this.adminOrderService.updateOrderStatus(order.id, statusUpdate).subscribe({
      next: (updatedOrder) => {
        // Update the order in the list
        const index = this.orders.findIndex(o => o.id === order.id);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
        }
        
        const filteredIndex = this.filteredOrders.findIndex(o => o.id === order.id);
        if (filteredIndex !== -1) {
          this.filteredOrders[filteredIndex] = updatedOrder;
        }
        
        this.updatingOrderId = null;
      },
      error: (err) => {
        console.error('Error updating order status:', err);
        alert('Failed to update order status. Please try again.');
        this.updatingOrderId = null;
      }
    });
  }

  getStatusBadgeClass(status: string): string {
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
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }
}


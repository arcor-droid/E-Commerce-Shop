import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminOrderService, AdminOrder, ORDER_STATUSES, OrderStatusUpdate } from '../../../core/services/admin-order.service';

@Component({
  selector: 'app-admin-order-detail',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-order-detail.component.html',
  styleUrl: './admin-order-detail.component.scss'
})
export class AdminOrderDetailComponent implements OnInit {
  order: AdminOrder | null = null;
  isLoading = false;
  error: string | null = null;
  
  selectedStatus: string = '';
  adminNotes: string = '';
  isUpdating = false;
  
  ORDER_STATUSES = ORDER_STATUSES;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminOrderService: AdminOrderService
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(parseInt(orderId, 10));
    } else {
      this.error = 'Invalid order ID';
    }
  }

  loadOrder(orderId: number): void {
    this.isLoading = true;
    this.error = null;
    
    this.adminOrderService.getOrderDetails(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.selectedStatus = order.status;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading order:', err);
        this.error = 'Failed to load order details. Please try again.';
        this.isLoading = false;
      }
    });
  }

  updateOrderStatus(): void {
    if (!this.order || this.selectedStatus === this.order.status) {
      return;
    }

    this.isUpdating = true;
    
    const statusUpdate: OrderStatusUpdate = {
      status: this.selectedStatus,
      admin_notes: this.adminNotes || undefined
    };

    this.adminOrderService.updateOrderStatus(this.order.id, statusUpdate).subscribe({
      next: (updatedOrder) => {
        this.order = updatedOrder;
        this.selectedStatus = updatedOrder.status;
        this.adminNotes = '';
        this.isUpdating = false;
        alert('Order status updated successfully!');
      },
      error: (err) => {
        console.error('Error updating order:', err);
        alert('Failed to update order status. Please try again.');
        this.isUpdating = false;
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

  getImageUrl(imagePath: string | null): string {
    if (!imagePath) return '/placeholder.jpg';
    return `http://localhost:8000${imagePath}`;
  }
}


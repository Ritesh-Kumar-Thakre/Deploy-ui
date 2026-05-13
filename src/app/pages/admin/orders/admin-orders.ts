import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-orders',
  imports: [CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css'
})
export class AdminOrders implements OnInit {
  private orderService = inject(OrderService);
  private toast = inject(ToastService);

  orders: any[] = [];
  loading = true;

  statuses = ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.orderService.getAllOrders().subscribe({
      next: (res) => {
        this.orders = [...res].sort((a, b) => b.orderId - a.orderId);
        this.loading = false;
      },
      error: () => {
        this.orders = [];
        this.loading = false;
        this.toast.show('Failed to load orders', 'error');
      }
    });
  }

  updateStatus(orderId: number, event: Event) {
    const status = (event.target as HTMLSelectElement).value;
    this.orderService.updateStatus(orderId, status).subscribe({
      next: () => {
        this.toast.show(`Order #${orderId} marked as ${status}`, 'success');
      },
      error: (err) => {
        this.toast.show(err.error?.message || 'Failed to update status', 'error');
        this.loadOrders(); // Reload to reset dropdown if failed
      }
    });
  }
}

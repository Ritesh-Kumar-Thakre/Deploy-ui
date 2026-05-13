import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { BookService } from '../../../core/services/book.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  private orderService = inject(OrderService);
  private bookService = inject(BookService);
  private auth = inject(AuthService);

  totalSales = 0;
  totalOrders = 0;
  activeUsers = 0;
  totalBooks = 0;
  recentOrders: any[] = [];
  lowStockBooks: any[] = [];

  ngOnInit() {
    this.orderService.getAllOrders().subscribe({
      next: (orders: any[]) => {
        const validOrders = orders.filter(o => o.orderStatus !== 'CANCELLED');
        this.totalOrders = validOrders.length;
        this.totalSales = validOrders.reduce((sum: number, o: any) => sum + (o.amountPaid || 0), 0);
        // Sort by date desc (assuming higher ID is newer if no date)
        this.recentOrders = [...orders].sort((a: any, b: any) => b.orderId - a.orderId).slice(0, 5);
      }
    });

    this.bookService.getAll(0, 1000).subscribe({
      next: (res: any) => {
        const books: any[] = Array.isArray(res) ? res : (res?.content || []);
        this.totalBooks = books.length;
        this.lowStockBooks = books.filter((b: any) => b.stock < 10).sort((a: any, b: any) => a.stock - b.stock).slice(0, 5);
      }
    });

    this.auth.getAllUsers().subscribe({
      next: (users) => this.activeUsers = users.length,
      error: () => this.activeUsers = 0
    });
  }
}
import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-notifications',
  imports: [DatePipe],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class Notifications implements OnInit {
  private notifService = inject(NotificationService);
  private toast = inject(ToastService);
  notifications: any[] = [];

  ngOnInit() {
    this.notifService.getAll().subscribe({ next: (res: any) => this.notifications = res?.content || res || [], error: () => this.notifications = [] });
    this.notifService.getUnreadCount().subscribe();
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = { ORDER_PLACED: 'shopping_bag', ORDER_CONFIRMED: 'check_circle', ORDER_DISPATCHED: 'local_shipping', ORDER_DELIVERED: 'inventory', ORDER_CANCELLED: 'cancel', PAYMENT_SUCCESS: 'payment', WALLET_CREDIT: 'account_balance_wallet', SYSTEM: 'info' };
    return icons[type] || 'notifications';
  }

  markRead(n: any) {
    if (n.isRead) return;
    this.notifService.markAsRead(n.id).subscribe({ next: () => n.isRead = true });
  }

  markAllRead() {
    this.notifService.markAllAsRead().subscribe({ next: () => { this.notifications.forEach(n => n.isRead = true); this.toast.show('All marked as read', 'info'); } });
  }

  remove(n: any) {
    this.notifService.delete(n.id).subscribe({ next: () => this.notifications = this.notifications.filter(i => i.id !== n.id) });
  }
}

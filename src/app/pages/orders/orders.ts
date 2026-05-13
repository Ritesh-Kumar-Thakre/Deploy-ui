import { Component, inject, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-orders',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {
  private orderService = inject(OrderService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  orders: any[] = [];
  expandedOrderId: number | null = null;

  ngOnInit() {
    const userId = this.auth.getUserId()!;
    this.orderService.getByUser(userId).subscribe({
      next: o => this.orders = (o || []).sort((a: any, b: any) => b.orderId - a.orderId),
      error: () => this.orders = []
    });
  }

  cancel(order: any) {
    if (!confirm('Cancel this order?')) return;
    this.orderService.cancelOrder(order.orderId).subscribe({
      next: () => { order.orderStatus = 'CANCELLED'; this.toast.show('Order cancelled', 'info'); },
      error: err => this.toast.show(err.error?.message || err.error || 'Failed', 'error')
    });
  }

  toggleExpand(orderId: number) {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }

  getStatusClass(status: string): string {
    return (status || '').toLowerCase();
  }

  /** Generate and download a printable invoice for this order */
  downloadInvoice(order: any) {
    const shippingAddr = [order.flatNumber, order.city, order.state, order.pincode].filter(Boolean).join(', ') || 'N/A';
    const unitPrice = order.quantity > 0 ? (order.amountPaid / order.quantity).toFixed(2) : order.amountPaid;

    const invoiceHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Invoice #${order.orderId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; color: #1a1a2e; background: #fff; }
    .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #6C63FF; padding-bottom: 20px; margin-bottom: 30px; }
    .brand h1 { font-size: 28px; color: #6C63FF; }
    .brand p { color: #666; font-size: 12px; }
    .invoice-meta { text-align: right; }
    .invoice-meta h2 { font-size: 16px; color: #333; }
    .invoice-meta p { font-size: 13px; color: #555; margin-top: 4px; }
    .section-title { font-size: 14px; font-weight: 700; color: #6C63FF; margin: 20px 0 10px; text-transform: uppercase; letter-spacing: 1px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .info-box p { font-size: 13px; color: #333; line-height: 1.8; }
    .info-box strong { color: #111; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0 24px; }
    th { background: #f8f7ff; color: #6C63FF; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 12px; text-align: left; border-bottom: 2px solid #e0e0e0; }
    td { padding: 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #333; }
    .text-right { text-align: right; }
    .totals { margin-top: 16px; padding-top: 16px; border-top: 2px solid #6C63FF; }
    .total-row { display: flex; justify-content: flex-end; gap: 40px; font-size: 14px; margin: 4px 0; color: #333; }
    .total-row.grand { font-size: 20px; font-weight: 800; color: #6C63FF; margin-top: 8px; }
    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; padding-top: 20px; border-top: 1px solid #eee; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="invoice-header">
    <div class="brand"><h1>📚 BookNest</h1><p>Your Premium Bookstore</p></div>
    <div class="invoice-meta">
      <h2>INVOICE</h2>
      <p><strong>#INV-${String(order.orderId).padStart(5, '0')}</strong></p>
      <p>Date: ${new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>
  </div>
  <div class="info-grid">
    <div class="info-box">
      <p class="section-title">Shipping Address</p>
      <p><strong>${order.fullName || ''}</strong></p>
      <p>${shippingAddr}</p>
      ${order.mobileNumber ? '<p>Phone: ' + order.mobileNumber + '</p>' : ''}
    </div>
    <div class="info-box" style="text-align:right">
      <p class="section-title">Payment Info</p>
      <p><strong>Method:</strong> ${order.modeOfPayment}</p>
      <p><strong>Status:</strong> ${order.orderStatus}</p>
      <p><strong>Order ID:</strong> #${order.orderId}</p>
    </div>
  </div>
  <p class="section-title">Order Items</p>
  <table>
    <thead><tr><th>#</th><th>Item</th><th>Qty</th><th class="text-right">Unit Price</th><th class="text-right">Total</th></tr></thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>${order.productName || 'Book'}</td>
        <td>${order.quantity || 1}</td>
        <td class="text-right">₹${unitPrice}</td>
        <td class="text-right">₹${order.amountPaid}</td>
      </tr>
    </tbody>
  </table>
  <div class="totals">
    <div class="total-row grand"><span>Total Amount Paid:</span><span>₹${order.amountPaid}</span></div>
  </div>
  <div class="footer">
    <p>Thank you for shopping with BookNest! 📚</p>
    <p>This is a computer-generated invoice and does not require a signature.</p>
  </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceHtml);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  }
}

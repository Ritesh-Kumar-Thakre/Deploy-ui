import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-cart',
  imports: [RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit {
  private cartService = inject(CartService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  cart: any = null;

  ngOnInit() { this.loadCart(); }

  loadCart() {
    const userId = this.auth.getUserId();
    if (userId) this.cartService.getCart(userId).subscribe({ next: c => this.cart = c, error: () => this.cart = { items: [] } });
  }

  updateQty(item: any, delta: number) {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    const userId = this.auth.getUserId()!;
    this.cartService.updateQuantity(userId, item.itemId, newQty).subscribe({
      next: () => { item.quantity = newQty; this.recalcTotal(); },
      error: (err) => {
        const msg = err.error?.message || err.error || 'Cannot update quantity';
        this.toast.show(msg, 'error');
      }
    });
  }

  removeItem(item: any) {
    const userId = this.auth.getUserId()!;
    this.cartService.removeItem(userId, item.itemId).subscribe({
      next: () => {
        this.cart.items = this.cart.items.filter((i: any) => i.itemId !== item.itemId);
        this.recalcTotal();
        this.toast.show('Item removed', 'info');
      }
    });
  }

  private recalcTotal() {
    this.cart.totalPrice = this.cart.items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
  }
}

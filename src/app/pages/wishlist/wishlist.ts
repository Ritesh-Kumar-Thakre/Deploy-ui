import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-wishlist',
  imports: [RouterLink],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css'
})
export class Wishlist implements OnInit {
  private wishlistService = inject(WishlistService);
  private cartService = inject(CartService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  items: any[] = [];

  ngOnInit() {
    this.wishlistService.getAll().subscribe({
      next: (res: any) => this.items = res?.content || res || [],
      error: () => this.items = []
    });
  }

  moveToCart(item: any) {
    this.wishlistService.moveToCart(item.id).subscribe({
      next: (removed: any) => {
        this.cartService.addItem(this.auth.getUserId()!, removed.bookId || item.bookId, 1).subscribe({
          next: () => { this.items = this.items.filter(i => i.id !== item.id); this.toast.show('Moved to cart!', 'success'); }
        });
      },
      error: err => this.toast.show(err.error?.message || err.error || 'Failed', 'error')
    });
  }

  remove(item: any) {
    this.wishlistService.remove(item.bookId).subscribe({
      next: () => { this.items = this.items.filter(i => i.id !== item.id); this.toast.show('Removed from wishlist', 'info'); },
      error: err => this.toast.show(err.error?.message || err.error || 'Failed to remove item', 'error')
    });
  }
}

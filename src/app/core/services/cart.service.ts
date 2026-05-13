import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CartService {
  private api = `${environment.apiUrl}/api/v1/cart`;
  cartCount$ = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {}

  getCart(userId: number) {
    return this.http.get<any>(`${this.api}`).pipe(
      tap(cart => this.cartCount$.next(cart?.items?.length || 0))
    );
  }

  addItem(userId: number, bookId: number, quantity: number) {
    return this.http.post(`${this.api}/add`, { bookId, quantity }).pipe(
      tap((cart: any) => this.cartCount$.next(cart?.items?.length || 0))
    );
  }

  removeItem(userId: number, itemId: number) {
    return this.http.delete(`${this.api}/remove/${itemId}`).pipe(
      tap((cart: any) => this.cartCount$.next(cart?.items?.length || 0))
    );
  }

  updateQuantity(userId: number, itemId: number, quantity: number) {
    return this.http.patch(`${this.api}/update/${itemId}/${quantity}`, {});
  }

  clearCart(userId: number) {
    return this.http.delete(`${this.api}/clear`).pipe(
      tap(() => this.cartCount$.next(0))
    );
  }
}

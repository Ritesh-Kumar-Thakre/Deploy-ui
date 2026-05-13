import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private api = `${environment.apiUrl}/api/v1/wishlist`;
  wishlistCount$ = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {}

  add(bookId: number) {
    return this.http.post(`${this.api}`, { bookId });
  }

  remove(bookId: number) {
    return this.http.delete(`${this.api}/${bookId}`);
  }

  getAll(page = 0, size = 10) {
    return this.http.get<any>(`${this.api}`, { params: { page, size } }).pipe(
      tap((res: any) => this.wishlistCount$.next(res?.totalElements || 0))
    );
  }

  check(bookId: number) {
    return this.http.get<boolean>(`${this.api}/check/${bookId}`);
  }

  moveToCart(itemId: number) {
    return this.http.post(`${this.api}/move-to-cart/${itemId}`, {});
  }
}

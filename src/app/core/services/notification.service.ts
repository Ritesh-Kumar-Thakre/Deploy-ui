import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api = `${environment.apiUrl}/api/v1/notifications`;
  unreadCount$ = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10) {
    return this.http.get<any>(`${this.api}`, { params: { page, size } });
  }

  getUnreadCount() {
    return this.http.get<number>(`${this.api}/unread-count`).pipe(
      tap(count => this.unreadCount$.next(count))
    );
  }

  markAsRead(id: number) {
    return this.http.put(`${this.api}/read/${id}`, {});
  }

  markAllAsRead() {
    return this.http.put(`${this.api}/read-all`, {}).pipe(
      tap(() => this.unreadCount$.next(0))
    );
  }

  delete(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }
}

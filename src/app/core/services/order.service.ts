import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private api = `${environment.apiUrl}/api/v1/orders`;

  constructor(private http: HttpClient) {}

  placeOrder(order: any) {
    return this.http.post(`${this.api}/place`, order);
  }

  onlinePayment(order: any) {
    // Backend endpoint is /online not /online-payment
    return this.http.post(`${this.api}/online`, order);
  }

  getByUser(userId: number) {
    return this.http.get<any[]>(`${this.api}/user/${userId}`);
  }

  getById(orderId: number) {
    return this.http.get<any>(`${this.api}/${orderId}`);
  }

  getAllOrders() {
    // Backend is GET /orders (no /all)
    return this.http.get<any[]>(`${this.api}`);
  }

  updateStatus(orderId: number, status: string) {
    return this.http.put(`${this.api}/status`, { orderId, orderStatus: status });
  }

  cancelOrder(orderId: number) {
    return this.http.put(`${this.api}/status`, { orderId, orderStatus: 'CANCELLED' });
  }

  deleteOrder(orderId: number) {
    return this.http.delete(`${this.api}/${orderId}`);
  }
}

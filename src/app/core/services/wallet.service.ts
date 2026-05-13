import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private api = `${environment.apiUrl}/api/v1/wallet`;

  constructor(private http: HttpClient) {}

  getWallet(walletId: number) {
    return this.http.get<any>(`${this.api}/${walletId}`);
  }

  getUserWallet() {
    return this.http.get<any>(`${this.api}/me`);
  }

  getAllWallets() {
    return this.http.get<any[]>(`${this.api}/all`);
  }

  addWallet(wallet: any) {
    return this.http.post(`${this.api}/add`, wallet);
  }

  addMoney(walletId: number, amount: number) {
    return this.http.put(`${this.api}/addmoney/${walletId}?amount=${amount}&remarks=TopUp`, {});
  }

  withdrawMoney(walletId: number, amount: number) {
    return this.http.put(`${this.api}/withdraw/${walletId}?amount=${amount}&remarks=Withdrawal`, {});
  }

  getBalance() {
    return this.http.get<{balance: number}>(`${this.api}/balance`);
  }

  getStatements(walletId: number) {
    // Backend endpoint is /statement/{walletId} not /statements/
    return this.http.get<any[]>(`${this.api}/statement/${walletId}`);
  }

  // ─── Razorpay ─────────────────────────────────────────────
  createRazorpayOrder(amount: number) {
    return this.http.post<any>(`${this.api}/razorpay/create-order?amount=${amount}`, {});
  }

  verifyRazorpayPayment(payload: {
    walletId: number;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    return this.http.post<any>(`${this.api}/razorpay/verify`, payload);
  }

  /** Verify Razorpay signature only (for order checkout, no wallet credit) */
  verifyRazorpaySignature(payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    return this.http.post<any>(`${this.api}/razorpay/verify-signature`, payload);
  }
}

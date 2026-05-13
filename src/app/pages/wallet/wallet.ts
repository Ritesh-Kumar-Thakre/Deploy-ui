import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { WalletService } from '../../core/services/wallet.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';

declare var Razorpay: any;

@Component({
  selector: 'app-wallet',
  imports: [FormsModule, DatePipe],
  templateUrl: './wallet.html',
  styleUrl: './wallet.css'
})
export class Wallet implements OnInit {
  private walletService = inject(WalletService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  wallet: any = null;
  statements: any[] = [];
  amount: number | null = null;
  withdrawAmount: number | null = null;
  razorpayLoading = false;
  activeTab: 'topup' | 'withdraw' = 'topup';

  ngOnInit() {
    const userId = this.auth.getUserId()!;
    this.walletService.getUserWallet().subscribe({
      next: w => {
        this.wallet = w;
        this.loadStatements(w.walletId);
      },
      error: (err) => {
        if (err.status === 404 || err.error?.message?.includes('not found')) {
          this.walletService.addWallet({ userId: userId, currentBalance: 0 }).subscribe({
            next: (newWallet: any) => {
              this.wallet = newWallet;
              this.loadStatements(newWallet.walletId);
            },
            error: () => this.toast.show('Failed to create wallet', 'error')
          });
        } else {
          this.toast.show('Failed to fetch wallet', 'error');
        }
      }
    });
  }

  loadStatements(walletId: number) {
    this.walletService.getStatements(walletId).subscribe({
      next: s => this.statements = s,
      error: () => this.statements = []
    });
  }

  /** Launch Razorpay checkout modal */
  payViaRazorpay() {
    if (!this.amount || this.amount < 1 || !this.wallet) {
      this.toast.show('Enter a valid amount first', 'error');
      return;
    }

    this.razorpayLoading = true;

    this.walletService.createRazorpayOrder(this.amount).subscribe({
      next: (order) => {
        this.razorpayLoading = false;
        const options = {
          key: environment.razorpayKey,
          amount: order.amount,
          currency: order.currency,
          name: 'BookNest',
          description: 'Wallet Top-Up',
          order_id: order.orderId,
          handler: (response: any) => {
            this.verifyRazorpayPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
          },
          prefill: {
            name: (this.auth as any).getUserName?.() || '',
            email: (this.auth as any).getUserEmail?.() || ''
          },
          theme: {
            color: '#6C63FF'
          },
          modal: {
            ondismiss: () => {
              this.toast.show('Payment cancelled', 'error');
            }
          }
        };

        const rzp = new Razorpay(options);
        rzp.on('payment.failed', (resp: any) => {
          this.toast.show('Payment failed: ' + (resp.error?.description || 'Unknown error'), 'error');
        });
        rzp.open();
      },
      error: (err) => {
        this.razorpayLoading = false;
        const msg = err.error?.message || 'Failed to create Razorpay order';
        this.toast.show(msg, 'error');
      }
    });
  }

  private verifyRazorpayPayment(orderId: string, paymentId: string, signature: string) {
    this.walletService.verifyRazorpayPayment({
      walletId: this.wallet.walletId,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature
    }).subscribe({
      next: () => {
        this.amount = null;
        this.toast.show('Payment successful! Wallet credited.', 'success');
        this.ngOnInit();
      },
      error: (err) => {
        const msg = err.error?.message || 'Payment verification failed';
        this.toast.show(msg, 'error');
      }
    });
  }

  /** Withdraw money from wallet */
  withdraw() {
    if (!this.withdrawAmount || this.withdrawAmount < 1 || !this.wallet) {
      this.toast.show('Enter a valid withdrawal amount', 'error');
      return;
    }
    if (this.withdrawAmount > this.wallet.currentBalance) {
      this.toast.show('Insufficient balance for withdrawal', 'error');
      return;
    }
    this.walletService.withdrawMoney(this.wallet.walletId, this.withdrawAmount).subscribe({
      next: () => {
        this.withdrawAmount = null;
        this.toast.show('Withdrawal successful!', 'success');
        this.ngOnInit();
      },
      error: err => {
        const msg = err.error?.message || (typeof err.error === 'string' ? err.error : err.message) || 'Withdrawal failed';
        this.toast.show(msg, 'error');
      }
    });
  }
}

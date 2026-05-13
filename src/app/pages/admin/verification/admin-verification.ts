import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { BookService } from '../../../core/services/book.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-verification',
  imports: [CurrencyPipe],
  templateUrl: './admin-verification.html',
  styleUrl: '../books/admin-books.css'
})
export class AdminVerification implements OnInit {
  private bookService = inject(BookService);
  private toast = inject(ToastService);

  pendingBooks: any[] = [];
  loading = true;

  ngOnInit() {
    this.loadPendingBooks();
  }

  loadPendingBooks() {
    this.loading = true;
    this.bookService.getPendingBooks().subscribe({
      next: (res: any) => {
        this.pendingBooks = Array.isArray(res) ? res : [];
        this.loading = false;
      },
      error: () => {
        this.pendingBooks = [];
        this.loading = false;
        this.toast.show('Failed to load pending books', 'error');
      }
    });
  }

  verifyBook(bookId: number) {
    if (confirm('Approve and publish this book?')) {
      this.bookService.verifyBook(bookId).subscribe({
        next: () => {
          this.toast.show('Book verified and published!', 'success');
          this.loadPendingBooks();
        },
        error: () => this.toast.show('Failed to verify book', 'error')
      });
    }
  }

  rejectBook(bookId: number) {
    if (confirm('Reject and delete this book?')) {
      this.bookService.deleteBook(bookId).subscribe({
        next: () => {
          this.toast.show('Book rejected and deleted', 'info');
          this.loadPendingBooks();
        },
        error: () => this.toast.show('Failed to reject book', 'error')
      });
    }
  }
}

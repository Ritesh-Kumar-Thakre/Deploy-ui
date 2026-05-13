import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReviewService } from '../../../core/services/review.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-reviews',
  imports: [DatePipe],
  templateUrl: './admin-reviews.html',
  styleUrl: './admin-reviews.css'
})
export class AdminReviews implements OnInit {
  private reviewService = inject(ReviewService);
  private toast = inject(ToastService);
  reviews: any[] = [];

  ngOnInit() {
    this.loadReviews();
  }

  loadReviews() {
    this.reviewService.getAll().subscribe({
      next: (res: any) => this.reviews = res?.content || res || [],
      error: () => this.reviews = []
    });
  }

  deleteReview(reviewId: number) {
    if (!confirm('Delete this review permanently?')) return;
    this.reviewService.delete(reviewId).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.reviewId !== reviewId);
        this.toast.show('Review deleted', 'success');
      },
      error: err => this.toast.show(err.error?.message || 'Failed to delete', 'error')
    });
  }

  getRatingFill(star: number, rating: number): string {
    return star <= Math.round(rating || 0) ? "'FILL' 1" : "'FILL' 0";
  }

  getInitial(name: string | undefined): string {
    if (!name || name.trim() === '') return '?';
    return name.trim().charAt(0).toUpperCase();
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private api = `${environment.apiUrl}/api/v1/reviews`;

  constructor(private http: HttpClient) {}

  addReview(review: any) {
    return this.http.post(`${this.api}`, review);
  }

  getByBook(bookId: number, page = 0, size = 10) {
    return this.http.get<any>(`${this.api}/book/${bookId}`, { params: { page, size } });
  }

  getByUser(userId: number) {
    return this.http.get<any[]>(`${this.api}/user/${userId}`);
  }

  getAverage(bookId: number) {
    return this.http.get<number>(`${this.api}/average/${bookId}`);
  }

  update(reviewId: number, data: any) {
    return this.http.put(`${this.api}/${reviewId}`, data);
  }

  delete(reviewId: number) {
    return this.http.delete(`${this.api}/${reviewId}`);
  }

  getAll(page = 0, size = 100) {
    return this.http.get<any>(`${this.api}`, { params: { page, size } });
  }
}

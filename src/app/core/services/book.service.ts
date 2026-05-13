import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookService {
  private api = `${environment.apiUrl}/api/v1/books`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 12) {
    return this.http.get<any>(`${this.api}/all`, { params: { page, size } });
  }

  getById(id: number) {
    return this.http.get<any>(`${this.api}/${id}`);
  }

  search(category: string, value: string) {
    return this.http.get<any[]>(`${this.api}/search`, { params: { category, value } });
  }

  getByGenre(genre: string) {
    return this.http.get<any[]>(`${this.api}/genre/${genre}`);
  }

  getFeatured() {
    return this.http.get<any[]>(`${this.api}/featured`);
  }

  addBook(book: any) {
    return this.http.post(`${this.api}/addBook`, book);
  }

  updateBook(book: any) {
    return this.http.patch(`${this.api}/update`, book);
  }

  deleteBook(id: number) {
    return this.http.delete(`${this.api}/delete/${id}`);
  }

  getPendingBooks() {
    return this.http.get<any[]>(`${this.api}/pending`);
  }

  verifyBook(bookId: number) {
    return this.http.patch(`${this.api}/${bookId}/verify`, {});
  }

  updateStock(bookId: number, stock: number) {
    return this.http.patch(`${this.api}/updateStock`, { bookId: String(bookId), stock: String(stock) });
  }

  // Image upload methods
  uploadImage(bookId: number, file: File, isPrimary = false) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isPrimary', String(isPrimary));
    return this.http.post(`${this.api}/upload-image/${bookId}`, formData);
  }

  getImages(bookId: number) {
    return this.http.get<any[]>(`${this.api}/images/${bookId}`);
  }

  deleteImage(imageId: number) {
    return this.http.delete(`${this.api}/images/delete/${imageId}`);
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../../core/services/book.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-books',
  imports: [CurrencyPipe, FormsModule],
  templateUrl: './admin-books.html',
  styleUrl: './admin-books.css'
})
export class AdminBooks implements OnInit {
  private bookService = inject(BookService);
  private toast = inject(ToastService);

  books: any[] = [];
  loading = true;
  showModal = false;
  isEditMode = false;
  uploadingImage = false;

  newBook: any = {
    title: '', author: '', description: '', isbn: '',
    price: 0, publisher: '',
    coverImageUrl: '', stock: 0, genre: 'Fiction',
    featured: false, isVerified: true, rating: 0.0
  };

  genres = ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Romance', 'Mystery', 'Fantasy'];

  // Multi-image upload support
  pendingImageFiles: File[] = [];
  imagePreviewUrls: string[] = [];

  ngOnInit() {
    this.loadBooks();
  }

  loadBooks() {
    this.loading = true;
    this.bookService.getAll(0, 1000).subscribe({
      next: (res) => {
        this.books = Array.isArray(res) ? res : (res?.content || []);
        this.loading = false;
      },
      error: () => {
        this.books = [];
        this.loading = false;
        this.toast.show('Failed to load books', 'error');
      }
    });
  }

  openAddModal() {
    this.isEditMode = false;
    this.newBook = {
      title: '', author: '', description: '', isbn: '',
      price: 0, publisher: '', coverImageUrl: '', stock: 0, genre: 'Fiction',
      featured: false, isVerified: true, rating: 0.0
    };
    this.pendingImageFiles = [];
    this.imagePreviewUrls = [];
    this.showModal = true;
  }

  openEditModal(book: any) {
    this.isEditMode = true;
    this.newBook = { ...book };
    this.pendingImageFiles = [];
    this.imagePreviewUrls = [];
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      this.pendingImageFiles.push(file);

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviewUrls.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
    input.value = '';
  }

  removePreviewImage(index: number) {
    this.pendingImageFiles.splice(index, 1);
    this.imagePreviewUrls.splice(index, 1);
  }

  saveBook() {
    if (this.isEditMode) {
      // Ensure defaults on edit too
      if (this.newBook.featured === null || this.newBook.featured === undefined) this.newBook.featured = false;
      if (this.newBook.isVerified === null || this.newBook.isVerified === undefined) this.newBook.isVerified = true;
      if (this.newBook.rating === null || this.newBook.rating === undefined) this.newBook.rating = 0.0;

      this.bookService.updateBook(this.newBook).subscribe({
        next: () => {
          // Upload pending images for edit mode
          if (this.pendingImageFiles.length > 0 && this.newBook.bookId) {
            this.uploadImagesSequentially(this.newBook.bookId, 0, true);
          } else {
            this.toast.show('Book updated successfully', 'success');
            this.closeModal();
            this.loadBooks();
          }
        },
        error: (err) => this.toast.show(err.error?.message || 'Failed to update book', 'error')
      });
    } else {
      const bookToSend = { ...this.newBook };
      // Auto-generate ISBN if not provided
      if (!bookToSend.isbn || bookToSend.isbn.trim() === '') {
        bookToSend.isbn = 'A' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100);
      }
      // Ensure required defaults
      bookToSend.featured = bookToSend.featured ?? false;
      bookToSend.isVerified = true; // Admin bypasses verification
      bookToSend.rating = bookToSend.rating ?? 0.0;

      this.uploadingImage = true;
      this.bookService.addBook(bookToSend).subscribe({
        next: (savedBook: any) => {
          const bookId = savedBook.bookId;
          if (this.pendingImageFiles.length > 0 && bookId) {
            this.uploadImagesSequentially(bookId, 0, false);
          } else {
            this.uploadingImage = false;
            this.toast.show('Book added successfully', 'success');
            this.closeModal();
            this.loadBooks();
          }
        },
        error: (err) => {
          this.uploadingImage = false;
          this.toast.show(err.error?.message || err.error || 'Failed to add book', 'error');
        }
      });
    }
  }

  private uploadImagesSequentially(bookId: number, index: number, isEdit: boolean) {
    if (index >= this.pendingImageFiles.length) {
      this.uploadingImage = false;
      this.toast.show(isEdit ? 'Book updated with images!' : 'Book added with images!', 'success');
      this.closeModal();
      this.loadBooks();
      return;
    }

    const isPrimary = index === 0 && !isEdit; // First image is primary only for new books
    this.bookService.uploadImage(bookId, this.pendingImageFiles[index], isPrimary).subscribe({
      next: () => this.uploadImagesSequentially(bookId, index + 1, isEdit),
      error: () => {
        this.toast.show('Some images failed to upload', 'error');
        this.uploadImagesSequentially(bookId, index + 1, isEdit);
      }
    });
  }

  deleteBook(id: number) {
    if (confirm('Are you sure you want to delete this book?')) {
      this.bookService.deleteBook(id).subscribe({
        next: () => {
          this.toast.show('Book deleted', 'success');
          this.loadBooks();
        },
        error: () => this.toast.show('Failed to delete book', 'error')
      });
    }
  }
}

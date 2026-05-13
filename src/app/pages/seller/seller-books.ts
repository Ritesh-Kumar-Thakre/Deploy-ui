import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../core/services/book.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-seller-books',
  imports: [FormsModule],
  templateUrl: './seller-books.html',
  styleUrl: './seller-books.css'
})
export class SellerBooks {
  private bookService = inject(BookService);
  private toast = inject(ToastService);

  newBook: any = {
    title: '', author: '', description: '', isbn: '',
    price: 0, publisher: '',
    coverImageUrl: '', stock: 0, genre: 'Fiction',
    featured: false, isVerified: false, rating: 0.0
  };

  genres = ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Romance', 'Mystery', 'Fantasy'];

  pendingImageFiles: File[] = [];
  imagePreviewUrls: string[] = [];
  uploading = false;

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      this.pendingImageFiles.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviewUrls.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
    // Reset the input so the same file can be re-selected
    input.value = '';
  }

  removeImage(index: number) {
    this.pendingImageFiles.splice(index, 1);
    this.imagePreviewUrls.splice(index, 1);
  }

  saveBook() {
    const bookToSend = { ...this.newBook };
    // Generate a unique ISBN if seller didn't provide one
    if (!bookToSend.isbn || bookToSend.isbn.trim() === '') {
      bookToSend.isbn = 'S' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100);
    }
    // Ensure required defaults to prevent DB constraint violations
    bookToSend.featured = bookToSend.featured ?? false;
    bookToSend.isVerified = false; // Seller books need verification
    bookToSend.rating = bookToSend.rating ?? 0.0;

    this.uploading = true;
    this.bookService.addBook(bookToSend).subscribe({
      next: (savedBook: any) => {
        const bookId = savedBook.bookId;

        // Upload images if any were selected
        if (this.pendingImageFiles.length > 0 && bookId) {
          this.uploadImagesSequentially(bookId, 0);
        } else {
          this.uploading = false;
          this.toast.show('Book submitted for verification!', 'success');
          this.resetForm();
        }
      },
      error: (err) => {
        this.uploading = false;
        this.toast.show(err.error?.message || err.error || 'Failed to submit book', 'error');
      }
    });
  }

  private uploadImagesSequentially(bookId: number, index: number) {
    if (index >= this.pendingImageFiles.length) {
      this.uploading = false;
      this.toast.show('Book submitted with ' + this.pendingImageFiles.length + ' image(s)!', 'success');
      this.resetForm();
      return;
    }

    const isPrimary = index === 0; // First image is the cover
    this.bookService.uploadImage(bookId, this.pendingImageFiles[index], isPrimary).subscribe({
      next: () => this.uploadImagesSequentially(bookId, index + 1),
      error: () => {
        this.toast.show('Some images failed to upload', 'error');
        this.uploadImagesSequentially(bookId, index + 1);
      }
    });
  }

  private resetForm() {
    this.newBook = {
      title: '', author: '', description: '', isbn: '',
      price: 0, publisher: '', coverImageUrl: '', stock: 0, genre: 'Fiction',
      featured: false, isVerified: false, rating: 0.0
    };
    this.pendingImageFiles = [];
    this.imagePreviewUrls = [];
  }
}

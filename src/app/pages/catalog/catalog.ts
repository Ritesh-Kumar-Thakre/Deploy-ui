import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { BookService } from '../../core/services/book.service';

@Component({
  selector: 'app-catalog',
  imports: [RouterLink],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css'
})
export class Catalog implements OnInit {
  private bookService = inject(BookService);
  private route = inject(ActivatedRoute);
  books: any[] = [];
  selectedGenre = '';
  loading = true;
  genres = ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Romance', 'Mystery', 'Fantasy'];

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      if (p['genre']) { this.filterGenre(p['genre']); }
      else { this.loadAll(); }
    });
  }

  loadAll() {
    this.selectedGenre = '';
    this.loading = true;
    this.bookService.getAll().subscribe({
      next: res => { this.books = Array.isArray(res) ? res : (res?.content || []); this.loading = false; },
      error: () => { this.books = []; this.loading = false; }
    });
  }

  filterGenre(genre: string) {
    this.selectedGenre = genre;
    this.loading = true;
    this.bookService.getByGenre(genre).subscribe({
      next: (res: any) => { this.books = Array.isArray(res) ? res : (res?.content || []); this.loading = false; },
      error: () => { this.books = []; this.loading = false; }
    });
  }
}

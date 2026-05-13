import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookService } from '../../core/services/book.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private bookService = inject(BookService);
  featured: any[] = [];
  mostOrdered: any[] = [];
  discoverBooks: any[] = [];
  genres = ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Romance', 'Mystery', 'Fantasy'];

  ngOnInit() {
    this.bookService.getFeatured().subscribe({
      next: books => this.featured = books,
      error: () => this.featured = []
    });

    this.bookService.getAll().subscribe({
      next: res => {
        const books: any[] = Array.isArray(res) ? res : (res?.content || []);
        
        // --- Calculate "Most Popular" ---
        // We sort by Rating (highest first) and Stock (highest first as a proxy for availability/popularity)
        this.mostOrdered = [...books].sort((a, b) => {
          const scoreA = (a.rating || 0) * 10 + (a.stock || 0) * 0.1;
          const scoreB = (b.rating || 0) * 10 + (b.stock || 0) * 0.1;
          return scoreB - scoreA;
        }).slice(0, 15); // Take top 15 for a better carousel feel

        this.discoverBooks = [...books].sort(() => 0.5 - Math.random()).slice(0, 12);
      },
      error: () => {
        this.mostOrdered = [];
        this.discoverBooks = [];
      }
    });
  }
}

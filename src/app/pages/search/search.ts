import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { BookService } from '../../core/services/book.service';

@Component({
  selector: 'app-search',
  imports: [RouterLink, FormsModule, DecimalPipe],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class Search implements OnInit {
  private bookService = inject(BookService);
  private route = inject(ActivatedRoute);
  query = '';
  searchCategory = 'keyword';
  results: any[] = [];
  searched = false;

  categories = [
    { value: 'keyword', label: 'All', icon: 'search' },
    { value: 'author', label: 'Author', icon: 'person' },
    { value: 'genre', label: 'Genre', icon: 'category' },
    { value: 'rating', label: 'Top Rated', icon: 'star' },
    { value: 'price', label: 'Price: Low→High', icon: 'payments' }
  ];

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.query = params['q'];
        this.searchCategory = params['cat'] || 'keyword';
        this.search();
      }
    });
  }

  search() {
    // Rating and price sorts don't need a query
    if (this.searchCategory === 'rating' || this.searchCategory === 'price') {
      this.searched = true;
      this.bookService.search(this.searchCategory, '').subscribe({
        next: books => this.results = books,
        error: () => this.results = []
      });
      return;
    }
    if (!this.query.trim()) return;
    this.searched = true;
    this.bookService.search(this.searchCategory, this.query).subscribe({
      next: books => this.results = books,
      error: () => this.results = []
    });
  }

  selectCategory(cat: string) {
    this.searchCategory = cat;
    if (cat === 'rating' || cat === 'price') {
      this.search();
    } else if (this.query.trim()) {
      this.search();
    }
  }
}

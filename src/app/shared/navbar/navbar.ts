import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, AsyncPipe, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  auth = inject(AuthService);
  cart = inject(CartService);
  notification = inject(NotificationService);
  private router = inject(Router);
  menuOpen = false;
  searchQuery = '';

  toggleMenu() { this.menuOpen = !this.menuOpen; }

  onLogout() {
    this.menuOpen = false;
    this.auth.logout().subscribe({ complete: () => this.router.navigate(['/login']) });
  }

  isAdmin() {
    return this.auth.getRole() === 'ADMIN';
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      // Pass the query as a query param, assuming search component handles it
      // Actually the original search was internal state, but let's navigate to search page with param
      // if not supported yet, at least navigate there
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
      this.searchQuery = '';
    }
  }
}

import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { Navbar } from './shared/navbar/navbar';
import { Footer } from './shared/footer/footer';
import { LoadingSpinner } from './shared/loading-spinner/loading-spinner';
import { Toast } from './shared/toast/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, LoadingSpinner, Toast],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private router = inject(Router);

  get isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }
}

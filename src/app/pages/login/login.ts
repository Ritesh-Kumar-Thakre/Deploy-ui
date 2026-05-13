import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

declare var google: any;

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  email = '';
  password = '';
  error = '';
  loading = false;

  ngOnInit() {
    this.initGoogleSignIn();
  }

  initGoogleSignIn() {
    // Wait for the script to load
    setTimeout(() => {
      if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
          client_id: '563587738271-s18qva9m9nvdk5n81n0flus9t87seakq.apps.googleusercontent.com',
          callback: this.handleGoogleCredentialResponse.bind(this)
        });
        
        google.accounts.id.renderButton(
          document.getElementById('googleSignInBtn'),
          { theme: 'outline', size: 'large', width: '100%' } // custom settings
        );
      }
    }, 1000);
  }

  handleGoogleCredentialResponse(response: any) {
    if (response.credential) {
      this.loading = true;
      this.error = '';
      this.auth.loginWithGoogle(response.credential).subscribe({
        next: () => {
          this.toast.show('Welcome to BookNest!', 'success');
          if (this.auth.getRole() === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: err => {
          this.loading = false;
          this.error = err.error?.message || 'Google authentication failed';
        }
      });
    }
  }

  onLogin() {
    this.error = '';
    this.loading = true;
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.toast.show('Welcome back!', 'success');
        if (this.auth.getRole() === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: err => {
        this.loading = false;
        this.error = err.error || 'Invalid email or password';
      }
    });
  }
}

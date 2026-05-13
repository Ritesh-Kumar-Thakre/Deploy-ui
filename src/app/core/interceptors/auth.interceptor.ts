import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);
  const authService = inject(AuthService);
  const token = localStorage.getItem('token');

  // Attach token if exists and NOT expired
  if (token && !authService.isTokenExpired(token)) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only handle 401 for non-auth endpoints (don't wipe session on login/register failure)
      if (error.status === 401) {
        // User requested to remove automatic logout on session expired
        // Just show the error without logging out
        toast.show('Unauthorized request (401). Please try again or re-login.', 'error');
      } else if (error.status === 403) {
        router.navigate(['/']);
        toast.show('Access denied.', 'error');
      } else if (error.status >= 500) {
        toast.show('Something went wrong. Please try again.', 'error');
      }
      return throwError(() => error);
    })
  );
};

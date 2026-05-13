import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  if (auth.isLoggedIn() && auth.getRole() === 'ADMIN') {
    return true;
  }

  // Not logged in or not admin
  toast.show('Access denied. Admins only.', 'error');
  router.navigate(['/']);
  return false;
};

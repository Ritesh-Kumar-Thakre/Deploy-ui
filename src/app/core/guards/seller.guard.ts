import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const sellerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  const role = authService.getRole();
  if (authService.isLoggedIn() && (role === 'SELLER' || role === 'ADMIN')) {
    return true;
  }

  toast.show('Access Denied: Seller access required', 'error');
  router.navigate(['/']);
  return false;
};

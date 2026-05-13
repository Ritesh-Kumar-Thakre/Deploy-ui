import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const toast = inject(ToastService);

  if (auth.isLoggedIn()) {
    return true;
  }

  toast.show('Please login to continue.', 'info');
  router.navigate(['/login']);
  return false;
};

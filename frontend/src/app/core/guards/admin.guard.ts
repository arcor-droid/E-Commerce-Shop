import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Admin guard to protect admin-only routes.
 * Checks if the current user has the 'ADMIN' role.
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.getCurrentUser();

  if (currentUser && currentUser.role === 'admin') {
    return true;
  }

  // If not admin, redirect to home
  console.warn('Access denied: Admin privileges required');
  router.navigate(['/']);
  return false;
};

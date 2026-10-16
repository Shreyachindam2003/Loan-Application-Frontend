import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  if (typeof window === 'undefined') return true;
  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('appRole');
  const requiredRole = route.data['role'] as string | undefined;
  if (!token) return router.createUrlTree(['/login']);
  if (requiredRole && role !== requiredRole) {
    return router.createUrlTree([role === 'OFFICER' ? '/officer/dashboard' : '/customer/dashboard']);
  }
  return true;
};

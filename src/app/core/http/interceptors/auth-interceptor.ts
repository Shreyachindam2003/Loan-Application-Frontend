import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (typeof window === 'undefined') return next(req);
  const token = localStorage.getItem('accessToken');
  if (!token || req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register')) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

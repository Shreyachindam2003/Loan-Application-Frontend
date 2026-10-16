import { Injectable, inject } from '@angular/core';
import { Observable, finalize, tap, timeout } from 'rxjs';
import { AuthApi, AuthResponse } from './auth-api';

export type AppRole = 'CUSTOMER' | 'OFFICER';

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly authApi = inject(AuthApi);

  login(email: string, password: string, twoFactorCode?: string): Observable<AuthResponse> {
    return this.authApi.login({
      email,
      password,
      ...(twoFactorCode ? { twoFactorCode } : {})
    }).pipe(timeout(20000), tap(response => this.saveTokens(response)));
  }

  verifyOAuth2TwoFactor(email: string, code: string): Observable<AuthResponse> {
    return this.authApi.verifyOAuth2TwoFactor(email, code).pipe(
      timeout(20000),
      tap(response => this.saveTokens(response))
    );
  }

  saveTokens(response: AuthResponse): void {
    if (response.twoFactorRequired || !response.accessToken || typeof window === 'undefined') return;
    localStorage.setItem('accessToken', response.accessToken);
    if (response.refreshToken) localStorage.setItem('refreshToken', response.refreshToken);
  }

  setRole(role: AppRole): void {
    if (typeof window !== 'undefined') localStorage.setItem('appRole', role);
  }

  getRole(): AppRole | null {
    if (typeof window === 'undefined') return null;
    const role = localStorage.getItem('appRole');
    return role === 'CUSTOMER' || role === 'OFFICER' ? role : null;
  }

  getPendingGoogleEmail(): string {
    if (typeof window === 'undefined') return '';
    return sessionStorage.getItem('pendingGoogleEmail') || '';
  }

  setPendingGoogleEmail(email: string): void {
    if (typeof window !== 'undefined') sessionStorage.setItem('pendingGoogleEmail', email);
  }

  clearPendingGoogleEmail(): void {
    if (typeof window !== 'undefined') sessionStorage.removeItem('pendingGoogleEmail');
  }

  logout(): Observable<unknown> | null {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    if (!refreshToken) {
      this.clearSession();
      return null;
    }
    return this.authApi.logout(refreshToken).pipe(
      timeout(10000),
      finalize(() => this.clearSession())
    );
  }

  clearSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('appRole');
    sessionStorage.removeItem('pendingGoogleEmail');
  }

  getAccessToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  }

  isLoggedIn(): boolean { return !!this.getAccessToken(); }
}


import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, TimeoutError } from 'rxjs';
import * as QRCode from 'qrcode';

import { Auth, AppRole } from '../../services/auth';
import { AuthResponse } from '../../services/auth-api';

interface GoogleLoginMessage {
  type: string;
  email?: string;
  twoFactorRequired?: boolean;
  message?: string;
  twoFactorSetupUri?: string | null;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  private googlePopup: Window | null = null;

  email = '';
  password = '';
  twoFactorCode = '';

  needsTwoFactor = false;
  googleTwoFactor = false;
  googleSetupUri = '';
  googleQrDataUrl = '';
  qrLoading = false;
  qrError = '';

  loading = false;
  errorMessage = '';
  successMessage = '';

  onSubmit(): void {
    if (this.loading) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email.trim()) {
      this.errorMessage = 'Please enter your email address.';
      return;
    }

    if (!this.needsTwoFactor && !this.password) {
      this.errorMessage = 'Please enter your password.';
      return;
    }

    if (
      this.needsTwoFactor &&
      !/^\d{6}$/.test(this.twoFactorCode.trim())
    ) {
      this.errorMessage = 'Enter a valid 6-digit authenticator code.';
      return;
    }

    if (this.needsTwoFactor && this.googleTwoFactor) {
      this.verifyGoogleCode();
      return;
    }

    this.loading = true;

    this.auth.login(
      this.email.trim(),
      this.password,
      this.needsTwoFactor ? this.twoFactorCode.trim() : undefined
    ).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: response => {
        if (response.twoFactorRequired) {
          this.needsTwoFactor = true;
          this.googleTwoFactor = false;
          this.twoFactorCode = '';
          this.successMessage =
            'Enter the current code from your authenticator app.';
          return;
        }

        if (!response.accessToken) {
          this.errorMessage =
            response.message ||
            'The server did not return an access token.';
          return;
        }

        this.completeLogin(response.role);
      },
      error: (error: unknown) => {
        if (error instanceof TimeoutError) {
          this.errorMessage =
            'Login request timed out. Check that Spring Boot is running.';
          return;
        }

        if (error instanceof HttpErrorResponse) {
          this.errorMessage = error.error?.message ||
            (error.status === 0
              ? 'Cannot connect to backend. Check port 8080 and CORS.'
              : 'Login failed (HTTP ' + error.status + ').');
          return;
        }

        this.errorMessage = 'An unexpected error occurred during login.';
      }
    });
  }

  loginWithGoogle(): void {
    if (this.loading || this.needsTwoFactor) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.googleTwoFactor = false;
    this.googleSetupUri = '';
    this.googleQrDataUrl = '';
    this.qrError = '';

    const popup = window.open(
      'http://localhost:8080/oauth2/authorization/google',
      'loanapp-google-login',
      'popup=yes,width=520,height=720,left=200,top=80'
    );

    if (!popup) {
      this.errorMessage =
        'Google login popup was blocked. Allow popups for localhost:4200 and try again.';
      return;
    }

    this.googlePopup = popup;
    this.successMessage = 'Complete Google sign-in in the popup.';
  }

  @HostListener('window:message', ['$event'])
  onGoogleLoginMessage(event: MessageEvent): void {
    // Accept messages only from the configured backend origin.
    if (event.origin !== 'http://localhost:8080') {
      return;
    }

    // Accept a message only from the popup opened by this page.
    if (this.googlePopup && event.source !== this.googlePopup) {
      return;
    }

    const data = event.data as GoogleLoginMessage | null;

    if (
      !data ||
      typeof data !== 'object' ||
      typeof data.type !== 'string'
    ) {
      return;
    }

    if (data.type === 'GOOGLE_LOGIN_ERROR') {
      this.errorMessage =
        data.message || 'Google login failed. Please try again.';
      this.successMessage = '';
      this.googlePopup = null;
      return;
    }

    if (data.type !== 'GOOGLE_LOGIN_2FA_REQUIRED') {
      return;
    }

    if (
      typeof data.email !== 'string' ||
      !data.email.trim() ||
      data.twoFactorRequired !== true
    ) {
      this.errorMessage =
        'Google login response was incomplete. Please try again.';
      this.googlePopup = null;
      return;
    }

    this.email = data.email.trim();
    this.password = '';
    this.twoFactorCode = '';

    this.needsTwoFactor = true;
    this.googleTwoFactor = true;

    this.googleSetupUri =
      typeof data.twoFactorSetupUri === 'string'
        ? data.twoFactorSetupUri.trim()
        : '';

    this.googleQrDataUrl = '';
    this.qrError = '';

    if (this.googleSetupUri) {
      void this.generateGoogleQrCode(this.googleSetupUri);
    } else {
      this.qrError =
        'The backend did not provide an authenticator setup URI. Please contact the application administrator.';
    }

    if (data.message === 'FIRST_TIME_2FA_SETUP_REQUIRED') {
      this.successMessage =
        'Google sign-in succeeded. Scan the QR code with your authenticator app, then enter its current 6-digit code.';
    } else {
      this.successMessage =
        'Google sign-in succeeded. Enter your current 6-digit authenticator code.';
    }

    this.googlePopup = null;
  }

  private async generateGoogleQrCode(uri: string): Promise<void> {
    this.qrLoading = true;
    this.qrError = '';
    this.googleQrDataUrl = '';

    try {
      if (!uri.startsWith('otpauth://totp/')) {
        throw new Error('Invalid authenticator setup URI.');
      }

      const dataUrl = await QRCode.toDataURL(uri, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 240,
        color: {
          dark: '#111827',
          light: '#FFFFFF'
        }
      });

      // Do not show a QR generated for an older login attempt.
      if (this.googleSetupUri === uri) {
        this.googleQrDataUrl = dataUrl;
      }
    } catch (error) {
      console.error('Could not generate authenticator QR code:', error);
      this.qrError =
        'Could not generate the QR code. Please try Google sign-in again.';
    } finally {
      this.qrLoading = false;
    }
  }

  verifyGoogleCode(): void {
    if (this.loading) {
      return;
    }

    if (!this.email.trim()) {
      this.errorMessage = 'Google account email is missing.';
      return;
    }

    if (!/^\d{6}$/.test(this.twoFactorCode.trim())) {
      this.errorMessage = 'Enter a valid 6-digit authenticator code.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.auth.verifyOAuth2TwoFactor(
      this.email.trim(),
      this.twoFactorCode.trim()
    ).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (response: AuthResponse) => {
        if (response.twoFactorRequired || !response.accessToken) {
          this.errorMessage =
            response.message || 'Authenticator verification failed.';
          this.twoFactorCode = '';
          return;
        }

        this.auth.clearPendingGoogleEmail();
        this.googleTwoFactor = false;
        this.needsTwoFactor = false;
        this.googleSetupUri = '';
        this.googleQrDataUrl = '';
        this.qrError = '';
        this.twoFactorCode = '';

        this.completeLogin(response.role);
      },
      error: (error: unknown) => {
        if (error instanceof TimeoutError) {
          this.errorMessage =
            'Google verification timed out. Please try again.';
          return;
        }

        if (error instanceof HttpErrorResponse) {
          this.errorMessage = error.error?.message ||
            (error.status === 0
              ? 'Cannot connect to backend. Check that Spring Boot is running.'
              : 'Google verification failed (HTTP ' + error.status + ').');
          return;
        }

        this.errorMessage =
          'An unexpected error occurred during Google verification.';
      }
    });
  }

  private completeLogin(
    serverRole: string | null | undefined
  ): void {
    const roleName = (serverRole || '').trim().toLowerCase();
    let appRole: AppRole | null = null;

    if (
      roleName === 'user' ||
      roleName === 'customer' ||
      roleName === 'role_user'
    ) {
      appRole = 'CUSTOMER';
    } else if (
      roleName === 'loan officer' ||
      roleName === 'officer' ||
      roleName === 'credit officer' ||
      roleName === 'loan_officer' ||
      roleName === 'role_loan_officer'
    ) {
      appRole = 'OFFICER';
    }

    if (!appRole) {
      this.errorMessage =
        'Login succeeded, but the backend returned an unrecognized role. Check the AuthResponse role field.';
      return;
    }

    this.auth.setRole(appRole);

    void this.router.navigate([
      appRole === 'OFFICER'
        ? '/officer/dashboard'
        : '/customer/dashboard'
    ]);
  }

  backToLogin(): void {
    this.needsTwoFactor = false;
    this.googleTwoFactor = false;
    this.twoFactorCode = '';
    this.password = '';
    this.googleSetupUri = '';
    this.googleQrDataUrl = '';
    this.qrLoading = false;
    this.qrError = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.googlePopup = null;
  }
}

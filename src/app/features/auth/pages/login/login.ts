import {
  Component,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, TimeoutError } from 'rxjs';

import { Auth, AppRole } from '../../services/auth';

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
  private readonly cdr = inject(ChangeDetectorRef);

  email = '';
  password = '';
  twoFactorCode = '';

  needsTwoFactor = false;

  googleVerification = false;
  googleEmail = '';
  googleCode = '';
  googleSetupUri = '';

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

    // When 2FA is active, submit the saved password and TOTP code.
    if (this.needsTwoFactor) {
      this.verifyTwoFactorLogin();
      return;
    }

    if (!this.password) {
      this.errorMessage = 'Please enter your password.';
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.auth.login(
      this.email.trim(),
      this.password
    ).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
        console.log('LOGIN REQUEST FINISHED');
      })
    ).subscribe({
      next: response => {
        console.log('LOGIN RESPONSE:', response);

        if (response.twoFactorRequired) {
          // IMPORTANT: Do not clear the password here.
          this.needsTwoFactor = true;
          this.twoFactorCode = '';

          this.successMessage =
            'Two-factor authentication is required. Enter the current 6-digit code from your authenticator app.';

          this.cdr.markForCheck();
          return;
        }

        if (!response.accessToken) {
          this.errorMessage =
            response.message ||
            'The server did not return an access token.';

          this.cdr.markForCheck();
          return;
        }

        this.completeLogin(response.role);
      },

      error: (error: unknown) => {
        console.error('LOGIN ERROR:', error);

        if (error instanceof TimeoutError) {
          this.errorMessage =
            'Login timed out. Check that Spring Boot is running and try again.';
        } else if (error instanceof HttpErrorResponse) {
          this.errorMessage =
            error.error?.message ||
            (error.status === 0
              ? 'Cannot connect to backend. Check port 8080 and CORS.'
              : 'Login failed (HTTP ' +
                error.status +
                '). Check your credentials and try again.');
        } else {
          this.errorMessage =
            'An unexpected error occurred during login.';
        }

        this.cdr.markForCheck();
      }
    });
  }

  private verifyTwoFactorLogin(): void {
    if (this.loading) {
      return;
    }

    if (!this.password) {
      this.errorMessage =
        'Your password is missing. Please go back and enter your password again.';
      return;
    }

    if (!/^\d{6}$/.test(this.twoFactorCode.trim())) {
      this.errorMessage =
        'Enter a valid 6-digit authenticator code.';
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.auth.login(
      this.email.trim(),
      this.password,
      this.twoFactorCode.trim()
    ).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
        console.log('2FA LOGIN REQUEST FINISHED');
      })
    ).subscribe({
      next: response => {
        console.log('2FA LOGIN RESPONSE:', response);

        if (response.twoFactorRequired) {
          this.errorMessage =
            response.message ||
            'Invalid authenticator code. Please try again.';

          this.twoFactorCode = '';
          this.cdr.markForCheck();
          return;
        }

        if (!response.accessToken) {
          this.errorMessage =
            response.message ||
            'The server did not return an access token.';

          this.cdr.markForCheck();
          return;
        }

        this.completeLogin(response.role);
      },

      error: (error: unknown) => {
        console.error('2FA LOGIN ERROR:', error);

        if (error instanceof TimeoutError) {
          this.errorMessage =
            '2FA verification timed out. Please try again.';
        } else if (error instanceof HttpErrorResponse) {
          this.errorMessage =
            error.error?.message ||
            (error.status === 0
              ? 'Cannot connect to backend. Check port 8080 and CORS.'
              : '2FA verification failed (HTTP ' +
                error.status +
                '). Check your code and try again.');
        } else {
          this.errorMessage =
            'An unexpected error occurred during 2FA verification.';
        }

        this.cdr.markForCheck();
      }
    });
  }

  loginWithGoogle(): void {
    if (this.loading) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.googleVerification = true;
    this.googleEmail = this.email.trim();

    this.auth.setPendingGoogleEmail(this.googleEmail);

    this.cdr.markForCheck();

    const popup = window.open(
      'http://localhost:8080/oauth2/authorization/google',
      'loanapp-google-login',
      'popup=yes,width=520,height=720,left=200,top=80'
    );

    if (!popup) {
      this.googleVerification = false;
      this.errorMessage =
        'Google login popup was blocked. Allow popups for localhost:4200 and try again.';

      this.cdr.markForCheck();
      return;
    }

    this.successMessage =
      'Complete Google sign-in in the popup. Then enter the Google account email and current authenticator code below.';

    this.cdr.markForCheck();
  }

  verifyGoogleCode(): void {
    if (this.loading) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.googleEmail.trim()) {
      this.errorMessage = 'Enter your Google account email.';
      return;
    }

    if (!/^\d{6}$/.test(this.googleCode.trim())) {
      this.errorMessage =
        'Enter the 6-digit authenticator code.';
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.auth.verifyOAuth2TwoFactor(
      this.googleEmail.trim(),
      this.googleCode.trim()
    ).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
        console.log('GOOGLE 2FA REQUEST FINISHED');
      })
    ).subscribe({
      next: response => {
        console.log('GOOGLE 2FA RESPONSE:', response);

        if (response.twoFactorRequired) {
          this.errorMessage =
            response.message ||
            'Authenticator verification is still required.';

          this.cdr.markForCheck();
          return;
        }

        if (!response.accessToken) {
          this.errorMessage =
            response.message ||
            'Verification did not return an access token.';

          this.cdr.markForCheck();
          return;
        }

        this.auth.clearPendingGoogleEmail();
        this.completeLogin(response.role);
      },

      error: (error: unknown) => {
        console.error('GOOGLE 2FA ERROR:', error);

        if (error instanceof TimeoutError) {
          this.errorMessage =
            'Google verification timed out. Try again.';
        } else if (error instanceof HttpErrorResponse) {
          this.errorMessage =
            error.error?.message ||
            (error.status === 0
              ? 'Cannot connect to backend.'
              : 'Google 2FA verification failed (HTTP ' +
                error.status +
                ').');
        } else {
          this.errorMessage =
            'An unexpected error occurred during Google verification.';
        }

        this.cdr.markForCheck();
      }
    });
  }

  private completeLogin(
    serverRole: string | null | undefined
  ): void {
    const roleName = (serverRole || '')
      .trim()
      .toLowerCase();

    let appRole: AppRole | null = null;

    if (
      roleName === 'user' ||
      roleName === 'customer' ||
      roleName === 'role_user' ||
      roleName === 'role_customer'
    ) {
      appRole = 'CUSTOMER';
    } else if (
      roleName === 'loan officer' ||
      roleName === 'officer' ||
      roleName === 'credit officer' ||
      roleName === 'role_loan_officer' ||
      roleName === 'role_officer'
    ) {
      appRole = 'OFFICER';
    }

    if (!appRole) {
      this.errorMessage =
        'Login succeeded, but the backend response has no recognized role. Check the AuthResponse role field.';

      this.cdr.markForCheck();
      return;
    }

    this.auth.setRole(appRole);
    this.cdr.markForCheck();

    void this.router.navigate([
      appRole === 'OFFICER'
        ? '/officer/dashboard'
        : '/customer/dashboard'
    ]);
  }

  backToLogin(): void {
    this.needsTwoFactor = false;
    this.twoFactorCode = '';
    this.errorMessage = '';
    this.successMessage = '';

    // Keep the email, but ask for the password again only if necessary.
    this.password = '';

    this.cdr.markForCheck();
  }
}

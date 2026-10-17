
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { AuthApi } from '../../services/auth-api';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './otp.html',
  styleUrl: './otp.css'
})
export class Otp {
  private readonly authApi = inject(AuthApi);
  private readonly router = inject(Router);

  email = '';
  otp = '';
  loading = false;
  resending = false;
  errorMessage = '';
  successMessage = '';

  constructor() {
    if (typeof window !== 'undefined') {
      this.email = sessionStorage.getItem('pendingVerificationEmail') || '';
    }
  }

  verifyOtp(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email.trim()) {
      this.errorMessage =
        'No verification email found. Please register again.';
      return;
    }

    if (!/^\d{6}$/.test(this.otp.trim())) {
      this.errorMessage = 'Enter the 6-digit OTP sent to your email.';
      return;
    }

    this.loading = true;

    this.authApi.verifyEmail(this.email.trim(), this.otp.trim()).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: response => {
        this.successMessage =
          response.message || 'Email verified successfully.';

        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('pendingVerificationEmail');
        }

        this.router.navigate(['/login']);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage =
          error.error?.message ||
          (error.status === 0
            ? 'Cannot connect to backend.'
            : `OTP verification failed (HTTP ${error.status}).`);
      }
    });
  }

  resendOtp(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email.trim()) {
      this.errorMessage = 'Email address is missing. Register again.';
      return;
    }

    this.resending = true;

    this.authApi.resendOtp(this.email.trim()).pipe(
      finalize(() => this.resending = false)
    ).subscribe({
      next: response => {
        this.successMessage =
          response.message || 'A new OTP has been requested.';
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage =
          error.error?.message ||
          (error.status === 0
            ? 'Cannot connect to backend.'
            : `Could not resend OTP (HTTP ${error.status}).`);
      }
    });
  }
}

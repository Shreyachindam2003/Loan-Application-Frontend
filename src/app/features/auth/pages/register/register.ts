
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { AuthApi, RegisterRequest } from '../../services/auth-api';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private readonly authApi = inject(AuthApi);
  private readonly router = inject(Router);

  firstName = '';
  lastName = '';
  age: number | null = null;
  email = '';
  password = '';
  confirmPassword = '';
  mobileNumber = '';
  panNo = '';
  aadhaarNo = '';
  employmentType = '';
  salary: number | null = null;
  monthlyInvestment: number | null = null;

  loading = false;
  errorMessage = '';
  successMessage = '';

  onSubmit(): void {
    if (this.loading) return;

    this.errorMessage = '';
    this.successMessage = '';

    if (this.password.length < 8) {
      this.errorMessage = 'Password must contain at least 8 characters.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Password and confirm password do not match.';
      return;
    }

    if (!/^\d{10}$/.test(this.mobileNumber.trim())) {
      this.errorMessage = 'Enter a valid 10-digit mobile number.';
      return;
    }

    if (!/^[A-Za-z]{5}\d{4}[A-Za-z]$/.test(this.panNo.trim())) {
      this.errorMessage = 'Enter a valid PAN number.';
      return;
    }

    if (!/^\d{12}$/.test(this.aadhaarNo.trim())) {
      this.errorMessage = 'Enter a valid 12-digit Aadhaar number.';
      return;
    }

    if (
      this.age === null ||
      this.salary === null ||
      this.monthlyInvestment === null ||
      this.age <= 0 ||
      this.salary < 0 ||
      this.monthlyInvestment < 0
    ) {
      this.errorMessage = 'Enter valid age, salary and monthly investment.';
      return;
    }

    const data: RegisterRequest = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      age: this.age,
      email: this.email.trim(),
      password: this.password,
      mobileNumber: this.mobileNumber.trim(),
      panNo: this.panNo.trim().toUpperCase(),
      aadhaarNo: this.aadhaarNo.trim(),
      employmentType: this.employmentType,
      salary: this.salary,
      monthlyInvestment: this.monthlyInvestment
    };

    this.loading = true;

    this.authApi.register(data).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: response => {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('pendingVerificationEmail', data.email);
        }

        this.successMessage =
          response.message || 'Registration successful. Verify your email.';

        this.router.navigate(['/otp']);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage =
          error.error?.message ||
          (error.status === 0
            ? 'Cannot connect to backend. Check that Spring Boot is running.'
            : `Registration failed (HTTP ${error.status}).`);
      }
    });
  }
}


import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8080/api/auth';

export interface MessageResponse {
  message: string;
}

export interface AuthResponse {
  accessToken: string | null;
  refreshToken: string | null;
  twoFactorRequired: boolean;
  message: string | null;
  twoFactorSetupUri: string | null;
  role: string | null;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  password: string;
  mobileNumber: string;
  panNo: string;
  aadhaarNo: string;
  employmentType: string;
  salary: number;
  monthlyInvestment: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthApi {
  private readonly http = inject(HttpClient);

  register(data: RegisterRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${API_URL}/register`,
      data
    );
  }

  verifyEmail(email: string, otp: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${API_URL}/verify-email`,
      { email, otp }
    );
  }

  resendOtp(email: string): Observable<MessageResponse> {
    const params = new HttpParams().set('email', email);

    return this.http.post<MessageResponse>(
      `${API_URL}/resend-otp`,
      null,
      { params }
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${API_URL}/login`,
      data
    );
  }

  verifyOAuth2TwoFactor(
    email: string,
    code: string
  ): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${API_URL}/oauth2/2fa/verify`,
      { email, code }
    );
  }

  refresh(refreshToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${API_URL}/refresh`,
      { refreshToken }
    );
  }

  logout(refreshToken: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${API_URL}/logout`,
      { refreshToken }
    );
  }

  setup2fa(): Observable<{ message: string; otpauthUri: string }> {
    return this.http.post<{ message: string; otpauthUri: string }>(
      `${API_URL}/2fa/setup`,
      {}
    );
  }

  enable2fa(code: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${API_URL}/2fa/enable`,
      { code }
    );
  }

  disable2fa(code: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${API_URL}/2fa/disable`,
      { code }
    );
  }
}

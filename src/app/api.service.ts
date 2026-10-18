import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface ApiEnvelope<T> { success: boolean; message: string; data: T; }
export interface PageData<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number; first: boolean; last: boolean; }
export interface LoanDeal {
  dealId: number; customerId: number; scoreCardId: number; loanType: string; loanAmount: number;
  eligibleLoanAmount: number; annualInterestRate: number; tenureMonths: number; emiAmount: number;
  requestedDisbursementDate: string; emiDay: number; status: string; createdAt: string;
}
export interface KycDocument {
  documentId: number; customerId: number; documentType: string; filePath: string; verificationStatus: string;
}
export interface ScoreCard {
  scoreCardId: number; customerId: number; riskCategory: string; eligibleLoanAmount: number;
  cibilScore: number; status: string; generatedAt: string;
}
export interface NotificationItem {
  notificationId: number; customerId: number; message: string; read: boolean; createdAt: string;
}
export interface EligibilityReview {
  eligibilityId: number; customerId: number; cibilScore: number; eligible: boolean;
  eligibleLoanAmount: number; riskCategory: string; reviewStatus: string; rejectionReason?: string;
}
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  readonly base = environment.apiUrl;
  get<T>(path: string, params?: Record<string, string | number>): Observable<ApiEnvelope<T>> {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params ?? {})) httpParams = httpParams.set(key, value);
    return this.http.get<ApiEnvelope<T>>(`${this.base}${path}`, { params: httpParams });
  }
  post<T>(path: string, body?: unknown): Observable<ApiEnvelope<T>> {
    return this.http.post<ApiEnvelope<T>>(`${this.base}${path}`, body ?? {});
  }
  put<T>(path: string, body?: unknown): Observable<ApiEnvelope<T>> {
    return this.http.put<ApiEnvelope<T>>(`${this.base}${path}`, body ?? {});
  }
  patch<T>(path: string, body?: unknown): Observable<ApiEnvelope<T>> {
    return this.http.patch<ApiEnvelope<T>>(`${this.base}${path}`, body ?? {});
  }
  delete<T>(path: string): Observable<ApiEnvelope<T>> {
    return this.http.delete<ApiEnvelope<T>>(`${this.base}${path}`);
  }
  upload<T>(path: string, body: FormData): Observable<ApiEnvelope<T>> {
    return this.http.post<ApiEnvelope<T>>(`${this.base}${path}`, body);
  }
  fileUrl(path: string): string { return `${this.base}${path}`; }
  downloadPdf(path: string, filename: string): void {
    this.http.get(`${this.base}${path}`, { responseType: 'blob', observe: 'response' }).subscribe({
      next: response => {
        const blob = response.body;
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url; anchor.download = filename; anchor.click();
        URL.revokeObjectURL(url);
      },
      error: () => window.alert('Download failed. Check backend status and sanction ID.')
    });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ClosureType = 'FULL' | 'PARTIAL';

export interface ClosureItem {
  requestId: number;
  loanAccountId: number;
  foreClosureType: ClosureType;
  foreClosureAmount: number | null;
  partialAmount: number | null;
  partialTenureMonths: number | null;
  remainingPrincipal: number | null;
  revisedEmiAmount: number | null;
  reason: string | null;
  status: string;
  isPaid: boolean;
  requestedDate: string;
  paidDate: string | null;
  closedBy: number | string | null;
  expectedClosureDate?: string | null;
}

export interface CreateClosureRequest {
  loanAccountId: number;
  foreClosureType: ClosureType;
  reason: string;
  partialAmount?: number;
  partialTenureMonths?: number;
}

export interface ClosureResponse {
  requestId: number;
  loanAccountId: number;
  foreClosureType: ClosureType;
  foreClosureAmount: number | null;
  partialAmount: number | null;
  requestedDate: string;
  status: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ClosureApi {
  private readonly baseUrl = 'http://localhost:8080/api/closure';

  constructor(private readonly http: HttpClient) {}

  getRequests(): Observable<ClosureItem[]> {
    return this.http.get<ClosureItem[]>(
      `${this.baseUrl}/requests`
    );
  }

  createRequest(
    payload: CreateClosureRequest
  ): Observable<ClosureResponse> {
    return this.http.post<ClosureResponse>(
      `${this.baseUrl}/request`,
      payload
    );
  }

  approveRequest(
    requestId: number
  ): Observable<ClosureResponse> {
    return this.http.patch<ClosureResponse>(
      `${this.baseUrl}/requests/${requestId}/approve`,
      null
    );
  }

  rejectRequest(
    requestId: number
  ): Observable<ClosureResponse> {
    return this.http.patch<ClosureResponse>(
      `${this.baseUrl}/requests/${requestId}/reject`,
      null
    );
  }
}

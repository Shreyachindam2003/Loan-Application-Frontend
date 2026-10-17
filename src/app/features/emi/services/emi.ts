
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EmiScheduleItem {
  emiScheduleId: number;
  loanAccountId: number;
  installmentNo: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  openingBalance: number;
  closingBalance: number;
  emiAmount: number;
  status: string;
  paidDate: string | null;
  cancellationReason: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class Emi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/v1/emi-schedules';

  getMySchedules(): Observable<EmiScheduleItem[]> {
    return this.http.get<EmiScheduleItem[]>(
      `${this.apiUrl}/my`
    );
  }
}

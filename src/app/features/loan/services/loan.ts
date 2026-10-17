import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoanAccount {
  loanAccountId: number;
  customerId: number;
  dealId: number;
  loanAccountNo: string;
  loanAmount: number;
  outstandingPrincipal: number;
  loanStatus: string;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  disbursementDate: string | null;
  totalPaidAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class Loan {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:8080/api/v1/loan-accounts';

  getMyLoans(): Observable<LoanAccount[]> {
    return this.http.get<LoanAccount[]>(`${this.apiUrl}/my`);
  }
}
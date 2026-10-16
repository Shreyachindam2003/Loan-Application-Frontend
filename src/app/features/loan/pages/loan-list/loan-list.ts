import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { finalize } from 'rxjs';
import { Loan, LoanAccount } from '../../services/loan';

@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loan-list.html',
  styleUrl: './loan-list.css'
})
export class LoanList implements OnInit {
  private readonly loanService = inject(Loan);
  private readonly cdr = inject(ChangeDetectorRef);

  loans: LoanAccount[] = [];
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadLoans();
  }

  loadLoans(): void {
    if (this.loading) return;

    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.loanService.getMyLoans()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response) => {
          console.log('MY LOANS API RESPONSE:', response);

          if (Array.isArray(response)) {
            this.loans = response;
          } else {
            this.loans = [];
            this.errorMessage = 'The server returned an unexpected loan response.';
          }

          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('MY LOANS API ERROR:', error);

          this.loans = [];

          if (error.status === 401) {
            this.errorMessage =
              'Your session has expired. Please log in again.';
          } else if (error.status === 403) {
            this.errorMessage =
              'You are not authorized to view these loans.';
          } else if (error.status === 0) {
            this.errorMessage =
              'Cannot connect to the backend. Check whether Spring Boot is running on port 8080.';
          } else {
            this.errorMessage =
              error.error?.message ||
              `Unable to load your loans (HTTP ${error.status}).`;
          }

          this.cdr.markForCheck();
        }
      });
  }

  get totalLoanAmount(): number {
    return this.loans.reduce(
      (total, loan) => total + Number(loan.loanAmount || 0),
      0
    );
  }

  get totalOutstanding(): number {
    return this.loans.reduce(
      (total, loan) => total + Number(loan.outstandingPrincipal || 0),
      0
    );
  }

  get totalPaid(): number {
    return this.loans.reduce(
      (total, loan) => total + Number(loan.totalPaidAmount || 0),
      0
    );
  }

  getStatusClass(status: string | null | undefined): string {
    const normalized = (status || '').toUpperCase();

    if (normalized.includes('ACTIVE')) return 'status-active';
    if (normalized.includes('CLOSED')) return 'status-closed';
    if (normalized.includes('PENDING')) return 'status-pending';
    if (normalized.includes('OVERDUE')) return 'status-overdue';
    if (normalized.includes('REJECTED')) return 'status-rejected';

    return 'status-default';
  }

  trackByLoanId(index: number, loan: LoanAccount): number {
    return loan.loanAccountId;
  }
}

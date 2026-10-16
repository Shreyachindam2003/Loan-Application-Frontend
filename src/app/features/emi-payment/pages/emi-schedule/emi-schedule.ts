
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { EmiPayment } from '../../services/emi-payment';

interface EmiInstallment {
  emiScheduleId: number;
  installmentNo: number;
  dueDate: string;
  openingBalance: number;
  emiAmount: number;
  principalAmount: number;
  interestAmount: number;
  closingBalance: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
}

@Component({
  selector: 'app-emi-schedule',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatTableModule
  ],
  templateUrl: './emi-schedule.html',
  styleUrl: './emi-schedule.css'
})
export class EmiSchedule implements OnInit {

  selectedLoan = 'LN-TEST-007';
  loanAccountId = 7;

  emiSchedules: EmiInstallment[] = [];
  loading = false;
  errorMessage = '';

  displayedColumns = [
    'installment', 'dueDate', 'emi', 'principal', 'interest',
    'openingBalance', 'closingBalance', 'status', 'action'
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private emiPayment: EmiPayment,
    @Inject(PLATFORM_ID) private platformId: object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.route.queryParams.subscribe(params => {
      const id = Number(params['loanAccountId']);
      this.loanAccountId = id > 0 ? id : 7;
      this.loadEmiSchedule();
    });
  }

  loadEmiSchedule(): void {
    this.loading = true;
    this.errorMessage = '';

    this.emiPayment.getEmiSchedule(this.loanAccountId).subscribe({
      next: (response: any) => {
        const data = response?.data ?? response;
        this.emiSchedules = Array.isArray(data) ? data : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('EMI Schedule API error:', error);
        this.errorMessage = error?.error?.message ||
          'EMI schedule could not be loaded. Check the loan account ID and backend.';
        this.emiSchedules = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get paidCount(): number {
    let count = 0;
    for (const emi of this.emiSchedules) {
      if (emi.status === 'PAID') count++;
    }
    return count;
  }

  get pendingCount(): number {
    let count = 0;
    for (const emi of this.emiSchedules) {
      if (emi.status === 'PENDING' || emi.status === 'OVERDUE') count++;
    }
    return count;
  }

  get paidAmount(): number {
    let total = 0;
    for (const emi of this.emiSchedules) {
      if (emi.status === 'PAID') {
        total += Number(emi.emiAmount || 0);
      }
    }
    return total;
  }

  get pendingAmount(): number {
    let total = 0;
    for (const emi of this.emiSchedules) {
      if (emi.status === 'PENDING' || emi.status === 'OVERDUE') {
        total += Number(emi.emiAmount || 0);
      }
    }
    return total;
  }

  get remainingBalance(): number {
    for (const emi of this.emiSchedules) {
      if (emi.status === 'PENDING' || emi.status === 'OVERDUE') {
        return Number(emi.openingBalance || 0);
      }
    }
    return 0;
  }

  isPayEnabled(emi: EmiInstallment): boolean {
    if (emi.status !== 'PENDING' && emi.status !== 'OVERDUE') {
      return false;
    }

    const today = new Date();
    const dueDate = new Date(emi.dueDate + 'T00:00:00');

    const currentMonth = today.getFullYear() * 12 + today.getMonth();
    const dueMonth = dueDate.getFullYear() * 12 + dueDate.getMonth();

    return currentMonth >= dueMonth;
  }

  payEmi(emi: EmiInstallment): void {
    if (!this.isPayEnabled(emi)) return;

    this.router.navigate(['/customer/emi/make-payment'], {
      queryParams: {
        loanAccountId: this.loanAccountId,
        emiScheduleId: emi.emiScheduleId,
        installment: emi.installmentNo
      }
    });
  }

  onLoanChange(loanAccount: string): void {
    this.selectedLoan = loanAccount;
    this.loadEmiSchedule();
  }
}

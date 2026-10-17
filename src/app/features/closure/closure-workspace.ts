
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import {
  ClosureApi,
  ClosureItem,
  ClosureType,
  CreateClosureRequest
} from './closure-api';

@Component({
  selector: 'app-closure-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './closure-workspace.html',
  styleUrl: './closure-workspace.css'
})
export class ClosureWorkspace implements OnInit {
  requests: ClosureItem[] = [];
  readonly isOfficer: boolean;

  loadingRequests = false;
  submitting = false;
  error = '';
  success = '';
  selectedActionRequestId: number | null = null;

  closureType: ClosureType = 'PARTIAL';
  loanAccountId: number | null = null;
  partialAmount: number | null = null;
  partialTenureMonths: number | null = 12;
  reason = '';

  constructor(
    private readonly api: ClosureApi,
    private readonly cdr: ChangeDetectorRef,
    router: Router
  ) {
    this.isOfficer = router.url.startsWith('/officer/');
  }

  ngOnInit(): void {
    this.loadRequests();
  }

  get pendingCount(): number {
    return this.requests.filter(
      r => r.status?.toUpperCase() === 'PENDING'
    ).length;
  }

  get completedCount(): number {
    return this.requests.filter(
      r => r.status?.toUpperCase() === 'COMPLETED'
    ).length;
  }

  selectType(type: ClosureType): void {
    this.closureType = type;
    this.error = '';
    this.success = '';

    if (type === 'FULL') {
      this.partialAmount = null;
      this.partialTenureMonths = null;
    } else {
      this.partialTenureMonths = 12;
    }
  }

  loadRequests(): void {
    if (this.loadingRequests) {
      return;
    }

    this.loadingRequests = true;
    this.cdr.markForCheck();

    this.api.getRequests()
      .pipe(
        finalize(() => {
          this.loadingRequests = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: data => {
          this.requests = Array.isArray(data) ? data : [];
          this.cdr.markForCheck();
        },
        error: err => {
          this.error =
            err?.error?.message ||
            'Could not load closure requests. Please refresh and try again.';

          console.error(
            'Failed to load closure requests:',
            err?.status,
            err?.error
          );

          this.cdr.markForCheck();
        }
      });
  }

  submitRequest(): void {
    if (this.submitting) {
      return;
    }

    this.error = '';
    this.success = '';

    if (
      this.loanAccountId === null ||
      !Number.isInteger(this.loanAccountId) ||
      this.loanAccountId <= 0
    ) {
      this.error = 'Enter a valid loan account ID.';
      return;
    }

    if (!this.reason.trim()) {
      this.error = 'Please enter a reason for the closure request.';
      return;
    }

    const payload: CreateClosureRequest = {
      loanAccountId: this.loanAccountId,
      foreClosureType: this.closureType,
      reason: this.reason.trim()
    };

    if (this.closureType === 'PARTIAL') {
      if (
        this.partialAmount === null ||
        !Number.isFinite(this.partialAmount) ||
        this.partialAmount <= 0
      ) {
        this.error = 'Partial amount must be greater than zero.';
        return;
      }

      if (
        this.partialTenureMonths === null ||
        !Number.isInteger(this.partialTenureMonths) ||
        this.partialTenureMonths <= 0
      ) {
        this.error =
          'Revised tenure must be a positive whole number of months.';
        return;
      }

      payload.partialAmount = this.partialAmount;
      payload.partialTenureMonths = this.partialTenureMonths;
    }

    this.submitting = true;
    this.cdr.markForCheck();

    this.api.createRequest(payload)
      .pipe(
        finalize(() => {
          this.submitting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: response => {
          this.success =
            response?.message ||
            'Closure request submitted successfully.';

          this.reason = '';
          this.partialAmount = null;
          this.partialTenureMonths = 12;

          this.cdr.markForCheck();
          this.loadRequests();
        },
        error: err => {
          this.error =
            err?.error?.message ||
            'Request failed. Please check the details and try again.';

          console.error(
            'Failed to create closure request:',
            err?.status,
            err?.error
          );

          this.cdr.markForCheck();
        }
      });
  }

  approveRequest(item: ClosureItem): void {
    if (
      !this.isOfficer ||
      item.status?.toUpperCase() !== 'PENDING' ||
      this.selectedActionRequestId !== null
    ) {
      return;
    }

    this.selectedActionRequestId = item.requestId;
    this.error = '';
    this.success = '';
    this.cdr.markForCheck();

    this.api.approveRequest(item.requestId)
      .pipe(
        finalize(() => {
          this.selectedActionRequestId = null;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: response => {
          this.success =
            response?.message ||
            `Closure request #${item.requestId} approved successfully.`;

          this.cdr.markForCheck();
          this.loadRequests();
        },
        error: err => {
          this.error =
            err?.error?.message ||
            `Could not approve closure request #${item.requestId}. Please try again.`;

          console.error(
            'Failed to approve closure request:',
            err?.status,
            err?.error
          );

          this.cdr.markForCheck();
        }
      });
  }

  rejectRequest(item: ClosureItem): void {
    if (
      !this.isOfficer ||
      item.status?.toUpperCase() !== 'PENDING' ||
      this.selectedActionRequestId !== null
    ) {
      return;
    }

    this.selectedActionRequestId = item.requestId;
    this.error = '';
    this.success = '';
    this.cdr.markForCheck();

    this.api.rejectRequest(item.requestId)
      .pipe(
        finalize(() => {
          this.selectedActionRequestId = null;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: response => {
          this.success =
            response?.message ||
            `Closure request #${item.requestId} rejected successfully.`;

          this.cdr.markForCheck();
          this.loadRequests();
        },
        error: err => {
          this.error =
            err?.error?.message ||
            `Could not reject closure request #${item.requestId}. Please try again.`;

          console.error(
            'Failed to reject closure request:',
            err?.status,
            err?.error
          );

          this.cdr.markForCheck();
        }
      });
  }

  refresh(): void {
    this.loadRequests();
  }

  formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '—';
    }

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(value);
  }

  formatDate(value: string | null | undefined): string {
    if (!value) {
      return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  trackByRequestId(_: number, item: ClosureItem): number {
    return item.requestId;
  }
}

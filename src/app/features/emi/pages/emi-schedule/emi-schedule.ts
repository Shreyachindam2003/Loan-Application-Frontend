
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { finalize } from 'rxjs';
import { Emi, EmiScheduleItem } from '../../services/emi';

@Component({
  selector: 'app-emi-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './emi-schedule.html',
  styleUrl: './emi-schedule.css'
})
export class EmiSchedule implements OnInit {
  private readonly emiService = inject(Emi);
  private readonly cdr = inject(ChangeDetectorRef);

  schedules: EmiScheduleItem[] = [];
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadSchedules();
  }

  loadSchedules(): void {
    this.loading = true;
    this.errorMessage = '';

    this.emiService.getMySchedules()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: response => {
          this.schedules = Array.isArray(response) ? response : [];
          this.cdr.markForCheck();
        },
        error: error => {
          this.schedules = [];

          if (error.status === 401) {
            this.errorMessage = 'Please log in again to view your EMI schedule.';
          } else if (error.status === 403) {
            this.errorMessage = 'You are not authorized to view this schedule.';
          } else if (error.status === 0) {
            this.errorMessage = 'Cannot connect to the backend on port 8080.';
          } else {
            this.errorMessage =
              error.error?.message ||
              `Unable to load EMI schedule (HTTP ${error.status}).`;
          }

          this.cdr.markForCheck();
        }
      });
  }

  get totalEmiAmount(): number {
    return this.schedules.reduce(
      (sum, item) => sum + Number(item.emiAmount || 0), 0
    );
  }

  get paidCount(): number {
    return this.schedules.filter(
      item => (item.status || '').toUpperCase() === 'PAID'
    ).length;
  }

  get pendingCount(): number {
    return this.schedules.filter(
      item => (item.status || '').toUpperCase() === 'PENDING'
    ).length;
  }

  statusClass(status: string): string {
    switch ((status || '').toUpperCase()) {
      case 'PAID': return 'paid';
      case 'PENDING': return 'pending';
      case 'OVERDUE': return 'overdue';
      case 'CANCELLED': return 'cancelled';
      default: return 'other';
    }
  }

  trackByScheduleId(index: number, item: EmiScheduleItem): number {
    return item.emiScheduleId;
  }
}

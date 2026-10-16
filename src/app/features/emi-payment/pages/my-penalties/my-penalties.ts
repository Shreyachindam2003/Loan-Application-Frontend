import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-my-penalties',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-penalties.html',
  styleUrl: './my-penalties.css'
})
export class MyPenalties implements OnInit {

  loanAccountId = 7;
  penalties: any[] = [];
  loading = false;

  showInvoice = false;
  invoice: any = {};

  private penaltyUrl = 'http://localhost:8080/api/v1/penalties';
  private paymentUrl = 'http://localhost:8080/api/v1/payments';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.loanAccountId = Number(params['loanAccountId']) || 7;
      this.loadPenalties();
    });
  }

  loadPenalties(): void {
    this.loading = true;

    this.http.get<any>(
      `${this.penaltyUrl}/loan/${this.loanAccountId}`
    )
    .pipe(finalize(() => {
      this.loading = false;
      this.cdr.detectChanges();
    }))
    .subscribe({
      next: response => {
        const data = response?.data ?? response;
        this.penalties = [];

        if (Array.isArray(data)) {
          for (const item of data) {
            this.penalties.push({
              chargeId: item.penaltyChargeId ?? '-',
              emiScheduleId: item.emiScheduleId,
              penalty: Number(item.penaltyAmount ?? 0),
              bonus: Number(item.bonusAmount ?? 0),
              lateDays: Number(item.daysLate ?? 0)
            });
          }
        }
      },
      error: error => {
        console.error('Penalty API error:', error);
        this.penalties = [];
      }
    });
  }

  get totalPenalty(): number {
    let total = 0;

    for (const item of this.penalties) {
      total += Number(item.penalty || 0);
    }

    return total;
  }

  get totalBonus(): number {
    let total = 0;

    for (const item of this.penalties) {
      total += Number(item.bonus || 0);
    }

    return total;
  }

  viewInvoice(item: any): void {
    this.showInvoice = true;
    this.invoice = { loading: true };

    this.http.get<any>(
      `${this.paymentUrl}/emi/${item.emiScheduleId}/breakup`
    ).subscribe({
      next: response => {
        this.invoice = response?.data ?? response;
        this.invoice.loading = false;
      },
      error: error => {
        console.error('Invoice API error:', error);

        this.invoice = {
          loading: false,
          error: error?.error?.message ?? 'Invoice details load nahi hui.'
        };
      }
    });
  }

  closeInvoice(): void {
    this.showInvoice = false;
  }
}
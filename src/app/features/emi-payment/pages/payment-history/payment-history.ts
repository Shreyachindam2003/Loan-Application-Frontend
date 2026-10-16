
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-history.html',
  styleUrl: './payment-history.css'
})
export class PaymentHistory implements OnInit {

  payments: any[] = [];
  loading = true;
  errorMessage = '';
  loanAccountId = 0;

  private paymentUrl = 'http://localhost:8080/api/v1/payments';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object,
    private cdr: ChangeDetectorRef
  ) {}

  
ngOnInit(): void {
  if (!isPlatformBrowser(this.platformId)) return;

  this.route.queryParams.subscribe(params => {
    const id = Number(params['loanAccountId']);

    // Query parameter nahi mila toh testing ke liye loan ID 1
    // this.loanAccountId = id > 0 ? id : 1;

    this.loanAccountId = id > 0 ? id : 5;

    this.loadPaymentHistory();
  });
}


  loadPaymentHistory(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http
      .get<any>(
        `${this.paymentUrl}/loan/${this.loanAccountId}/history`
      )
      .subscribe({
        next: (res) => {
          this.payments = Array.isArray(res?.data) ? res.data : [];
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Payment history error:', err);
          this.errorMessage = 'Unable to load payment history.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }
}

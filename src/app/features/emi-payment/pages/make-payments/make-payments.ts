
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmiPayment } from '../../services/emi-payment';
import { environment } from '../../../../../environments/environment';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open(): void;
  on(event: string, callback: (response: any) => void): void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

@Component({
  selector: 'app-make-payments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './make-payments.html',
  styleUrl: './make-payments.css'
})
export class MakePayments implements OnInit {

  loanAccountId = 0;
  emiScheduleId = 0;
  emi: any = null;
  breakup: any = null;
  loading = false;
  showBreakup = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: EmiPayment,
    @Inject(PLATFORM_ID) private platformId: object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.route.queryParams.subscribe(params => {
      const id = Number(params['loanAccountId']);
      this.loanAccountId = id > 0 ? id : 7;
      this.emiScheduleId = Number(params['emiScheduleId']) || 0;
      this.loadEmi();
    });
  }

  loadEmi(): void {
    this.loading = true;
    this.errorMessage = '';
    this.emi = null;
    this.emiScheduleId = 0;

    this.paymentService.getCurrentEmi(this.loanAccountId).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res;
        const selectedId = Number(
          this.route.snapshot.queryParamMap.get('emiScheduleId')
        );

        if (data?.emiScheduleId &&
            (!selectedId || Number(data.emiScheduleId) === selectedId)) {
          this.emi = data;
          this.emiScheduleId = Number(data.emiScheduleId);
        } else {
          this.errorMessage = 'No EMI is currently due for payment';
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Current EMI API error:', err);
        this.errorMessage = 'No EMI is currently due for payment';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  viewBreakup(): void {
    if (!this.emiScheduleId) {
      this.errorMessage = 'EMI Schedule ID is missing.';
      return;
    }

    this.showBreakup = true;
    this.breakup = null;

    this.paymentService.getPaymentBreakup(this.emiScheduleId).subscribe({
      next: (res: any) => this.breakup = res?.data ?? res,
      error: (err: any) => {
        console.error('Breakup API error:', err);
        this.errorMessage = 'Unable to load payment breakup.';
        this.showBreakup = false;
      }
    });
  }

  payNow(): void {
    if (!this.emi || !this.loanAccountId || !this.emiScheduleId) {
      this.errorMessage = 'EMI details are not loaded.';
      return;
    }

    if (!isPlatformBrowser(this.platformId)) return;

    this.errorMessage = '';
    this.loading = true;

    this.paymentService.createOrder({
      loanAccountId: this.loanAccountId,
      emiScheduleId: this.emiScheduleId,
      idempotencyKey: crypto.randomUUID()
    }).subscribe({
      next: (res: any) => {
        const order = res?.data ?? res;

        if (!order?.razorpayOrderId || order.amount == null) {
          this.loading = false;
          this.errorMessage = 'Invalid Razorpay order response.';
          return;
        }

        if (!window.Razorpay) {
          this.loading = false;
          this.errorMessage = 'Razorpay Checkout script is not loaded.';
          return;
        }

        const checkout = new window.Razorpay({
          key: environment.razorpayKeyId,
          amount: Math.round(Number(order.amount) * 100),
          currency: 'INR',
          name: 'Loan Management System',
          description: `EMI Payment - ${this.emi.installmentNo}`,
          order_id: order.razorpayOrderId,

          handler: (response: RazorpayResponse) => {
            this.loading = true;

            this.paymentService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            }).subscribe({
              next: (verifyRes: any) => {
                this.loading = false;

                if (verifyRes?.success !== true) {
                  this.errorMessage = 'Payment verification failed.';
                  return;
                }

                alert('Payment verified successfully!');

                this.router.navigate(['/customer/emi/payment-history'], {
                  queryParams: { loanAccountId: this.loanAccountId }
                });
              },
              error: (err: any) => {
                this.loading = false;
                console.error('Verify error:', err);
                this.errorMessage =
                  'Payment verification failed. Please check payment status.';
              }
            });
          },

          modal: {
            ondismiss: () => this.loading = false
          }
        });

        checkout.on('payment.failed', (response: any) => {
          this.loading = false;
          this.errorMessage =
            response?.error?.description ?? 'Payment failed.';
        });

        this.loading = false;
        checkout.open();
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Create order error:', err);
        this.errorMessage = 'Unable to create Razorpay order.';
      }
    });
  }
}

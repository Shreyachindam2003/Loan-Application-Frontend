
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EmiPayment {
  private scheduleUrl =
    'http://localhost:8080/api/v1/emi-schedules';

  private paymentUrl = 'http://localhost:8080/api/v1/payments';

  constructor(private http: HttpClient) {}

  getEmiSchedule(loanAccountId: number) {
    return this.http.get<any>(
      `${this.scheduleUrl}/loan/${loanAccountId}`
    );
  }

  getCurrentEmi(loanAccountId: number) {
  return this.http.get<any>(
    `${this.paymentUrl}/loan/${loanAccountId}/current-emi`
  );
}

  getPaymentBreakup(emiScheduleId: number) {
    return this.http.get<any>(
      `${this.paymentUrl}/emi/${emiScheduleId}/breakup`
    );
  }

  createOrder(request: {
  loanAccountId: number;
  emiScheduleId: number;
  idempotencyKey: string;
}) {
  return this.http.post<any>(
    `${this.paymentUrl}/create-order`,
    request
  );
}

verifyPayment(request: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  return this.http.post<any>(
    `${this.paymentUrl}/verify`,
    request
  );
}

getInvoice(paymentId: number) {
  return this.http.get(
    `${this.paymentUrl}/${paymentId}/invoice`,
    { responseType: 'blob' }
  );
}
}

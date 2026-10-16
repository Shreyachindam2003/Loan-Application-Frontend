import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'customer',
    loadComponent: () =>
      import('./features/customer/pages/customer-dashboard/customer-dashboard')
        .then(m => m.CustomerDashboard),

    children: [
      {
        path: 'emi/schedule',
        loadComponent: () =>
          import('./features/emi-payment/pages/emi-schedule/emi-schedule')
            .then(m => m.EmiSchedule)
      },
      {
        path: 'emi/make-payment',
        loadComponent: () =>
          import('./features/emi-payment/pages/make-payments/make-payments')
            .then(m => m.MakePayments)
      },
      {
        path: 'emi/payment-history',
        loadComponent: () =>
          import('./features/emi-payment/pages/payment-history/payment-history')
            .then(m => m.PaymentHistory)
      },
      {
        path: 'emi/my-penalties',
        loadComponent: () =>
          import('./features/emi-payment/pages/my-penalties/my-penalties')
            .then(m => m.MyPenalties)
      },
      {
        path: '',
        redirectTo: 'emi/schedule',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'customer/emi/schedule',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'customer/emi/schedule'
  }
];

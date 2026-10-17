import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth-guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/pages/login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./features/auth/pages/register/register').then(m => m.Register) },
  { path: 'otp', loadComponent: () => import('./features/auth/pages/otp/otp').then(m => m.Otp) },
  {
    path: 'customer/dashboard',
    canActivate: [authGuard], data: { role: 'CUSTOMER' },
    loadComponent: () => import('./features/customer/pages/customer-dashboard/customer-dashboard').then(m => m.CustomerDashboard)
  },
  {
    path: 'officer/dashboard',
    canActivate: [authGuard], data: { role: 'OFFICER' },
    loadComponent: () => import('./features/credit-officer/pages/credit-officer-dashboard/credit-officer-dashboard').then(m => m.CreditOfficerDashboard)
  },
  {
    path: 'customer/closure',
    canActivate: [authGuard], data: { role: 'CUSTOMER' },
    loadComponent: () => import('./features/closure/closure-workspace').then(m => m.ClosureWorkspace)
  },
  {
    path: 'officer/closure',
    canActivate: [authGuard], data: { role: 'OFFICER' },
    loadComponent: () => import('./features/closure/closure-workspace').then(m => m.ClosureWorkspace)
  },
  {
    path: 'loan',
    canActivate: [authGuard], data: { role: 'CUSTOMER' },
    loadComponent: () => import('./features/loan/pages/loan-list/loan-list').then(m => m.LoanList)
  },
  {
    path: 'emi/schedule',
    canActivate: [authGuard], data: { role: 'CUSTOMER' },
    loadComponent: () => import('./features/emi/pages/emi-schedule/emi-schedule').then(m => m.EmiSchedule)
  },
  {
    path: 'emi/payment',
    canActivate: [authGuard], data: { role: 'CUSTOMER' },
    loadComponent: () => import('./features/emi/pages/make-payment/make-payment').then(m => m.MakePayment)
  },
  {
    path: 'emi/history',
    canActivate: [authGuard], data: { role: 'CUSTOMER' },
    loadComponent: () => import('./features/emi/pages/payment-history/payment-history').then(m => m.PaymentHistory)
  },
  { path: 'logout', loadComponent: () => import('./features/auth/pages/logout/logout').then(m => m.Logout) },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];

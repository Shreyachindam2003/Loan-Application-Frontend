
import { Component } from '@angular/core';
import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: 'customer/dashboard',
    loadComponent: () =>
      import('./features/customer/pages/customer-dashboard/customer-dashboard')
        .then(m => m.CustomerDashboard)
  },



  {
    path: 'officer/dashboard',
    loadComponent: () =>
      import('./features/credit-officer/pages/credit-officer-dashboard/credit-officer-dashboard')
        .then(m => m.CreditOfficerDashboard)
  },
{
    path:'customer/cibil-score',
    loadComponent:()=>
    import('./features/cibil/pages/cibil-score/cibil-score')
    .then(m=>m.CibilScore)
  },

  {
    path:'customer/eligibility-check',
    loadComponent:()=>
    import('./features/cibil/pages/eligibility-check/eligibility-check')
    .then(m=>m.EligibilityCheck)
},
{
path:'officer/kyc-verification',
loadComponent:()=>
import('./features/Kyc/pages/officer-verify-kyc/officer-verify-kyc')
.then(m=>m.OfficerVerifyKyc)
  
},
{
path:'customer/kyc',
loadComponent:()=>
import('./features/Kyc/pages/customer-kyc/customer-kyc')
.then(m=>m.CustomerKyc)

},




{
path:'officer/customers',
loadComponent:()=>
    import('./features/cibil/pages/cibil-officer/cibil-officer')
    .then(m=>m.CibilOfficer)
},



  {
    path: '',
    redirectTo: 'customer/dashboard',
    pathMatch: 'full'
  }
  
  // {
  //   path: '',
  //   redirectTo: 'officer/dashboard',
  //   pathMatch: 'full'
  // }
  ,

  {
    path: '**',
    redirectTo: 'customer/dashboard'
  }

  // {
  //   path: '**',
  //   redirectTo: 'officer/dashboard'
  // }

    
];


import { Component } from '@angular/core';
import { CustomerSidebar } from '../../../../core/theme/customer-sidebar/customer-sidebar';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CustomerSidebar],
  templateUrl: './customer-dashboard.html',
  styleUrl: './customer-dashboard.css'
})
export class CustomerDashboard {}

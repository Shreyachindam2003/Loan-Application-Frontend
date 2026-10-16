import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomerSidebar } from '../../../../core/theme/customer-sidebar/customer-sidebar';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CustomerSidebar, RouterLink],
  templateUrl: './customer-dashboard.html',
  styleUrl: './customer-dashboard.css'
})
export class CustomerDashboard {}

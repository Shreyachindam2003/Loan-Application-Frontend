
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CustomerSidebar } from '../../../../core/theme/customer-sidebar/customer-sidebar';
import { Header } from '../../../../core/theme/header/header';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CustomerSidebar, RouterOutlet, Header],
  templateUrl: './customer-dashboard.html',
  styleUrl: './customer-dashboard.css'
})
export class CustomerDashboard {}

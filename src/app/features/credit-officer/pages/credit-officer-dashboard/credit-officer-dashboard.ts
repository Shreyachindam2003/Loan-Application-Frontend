
import { Component } from '@angular/core';
import { CreditOfficerSidebar } from '../../../../core/theme/credit-officer-sidebar/credit-officer-sidebar';

@Component({
  selector: 'app-credit-officer-dashboard',
  standalone: true,
  imports: [CreditOfficerSidebar],
  templateUrl: './credit-officer-dashboard.html',
  styleUrl: './credit-officer-dashboard.css'
})
export class CreditOfficerDashboard {}

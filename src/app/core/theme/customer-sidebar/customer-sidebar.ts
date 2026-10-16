
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-customer-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './customer-sidebar.html',
  styleUrl: './customer-sidebar.css'
})
export class CustomerSidebar {
  paymentsOpen = false;

  togglePayments(): void {
    this.paymentsOpen = !this.paymentsOpen;
  }
}

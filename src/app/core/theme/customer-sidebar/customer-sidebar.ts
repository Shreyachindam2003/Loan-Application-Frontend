
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-customer-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './customer-sidebar.html',
  styleUrl: './customer-sidebar.css'
})
export class CustomerSidebar {

  isOpen = false;
customerMenuOpen = true;
}

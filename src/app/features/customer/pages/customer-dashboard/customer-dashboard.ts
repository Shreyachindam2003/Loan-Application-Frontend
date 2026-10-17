
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Auth } from '../../../auth/services/auth';
import { CustomerSidebar } from '../../../../core/theme/customer-sidebar/customer-sidebar';

interface CustomerNotification {
  notificationId: number;
  customerId: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CustomerSidebar],
  templateUrl: './customer-dashboard.html',
  styleUrl: './customer-dashboard.css'
})
export class CustomerDashboard implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);
  private readonly cdr = inject(ChangeDetectorRef);

  notifications: CustomerNotification[] = [];
  loadingNotifications = false;
  notificationError = '';

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    if (this.loadingNotifications) {
      return;
    }

    const token = this.auth.getAccessToken();

    if (!token) {
      this.notifications = [];
      this.notificationError = 'Please sign in again.';
      this.loadingNotifications = false;
      this.cdr.detectChanges();
      return;
    }

    this.loadingNotifications = true;
    this.notificationError = '';
    this.cdr.detectChanges();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    });

    this.http.get<CustomerNotification[]>(
      'http://localhost:8080/api/notifications/me',
      { headers }
    ).pipe(
      finalize(() => {
        this.loadingNotifications = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: response => {
        this.notifications = Array.isArray(response)
          ? response
          : [];

        this.notificationError = '';
        this.cdr.detectChanges();

        console.log('Customer notifications:', this.notifications);
      },
      error: error => {
        console.error('Notification API error:', error);

        this.notificationError =
          error.status === 401 || error.status === 403
            ? 'Your session has expired. Please sign in again.'
            : 'Unable to load notifications. Please try again.';

        this.cdr.detectChanges();
      }
    });
  }
}

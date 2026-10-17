
import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../../features/notifications/notification.service';
import { Notification } from '../../../features/notifications/notification.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {

  // Notifications hamesha array se initialize hongi
  notifications: Notification[] = [];
  showNotifications = false;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  // Unread notifications ka count
  get unreadCount(): number {
    if (!Array.isArray(this.notifications)) {
      return 0;
    }

    return this.notifications.filter(
      item => !item.isRead
    ).length;
  }

  // Notifications API se load karna
  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (response: any) => {

        // Backend direct array return kare
        if (Array.isArray(response)) {
          this.notifications = response;
        }

        // Backend { data: [...] } return kare
        else if (Array.isArray(response?.data)) {
          this.notifications = response.data;
        }

        // Backend { content: [...] } return kare
        else if (Array.isArray(response?.content)) {
          this.notifications = response.content;
        }

        // Unexpected response aaye toh empty array
        else {
          this.notifications = [];
          console.error(
            'Unexpected notification response:',
            response
          );
        }
      },

      error: (error) => {
        console.error('Notification loading failed', error);
        this.notifications = [];
      }
    });
  }

  // Notification dropdown open/close
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;

    if (this.showNotifications) {
      this.loadNotifications();
    }
  }

  // Notification par click karna
  openNotification(item: Notification): void {
    if (item.isRead) {
      this.showNotifications = false;
      this.router.navigate(['/payments']);
      return;
    }

    this.notificationService
      .markAsRead(item.notificationId)
      .subscribe({
        next: () => {
          item.isRead = true;
          this.showNotifications = false;
          this.router.navigate(['/payments']);
        },

        error: (error) => {
          console.error('Mark as read failed', error);
        }
      });
  }

  // Dropdown ke bahar click hone par close karna
  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.notification-area')) {
      this.showNotifications = false;
    }
  }
}

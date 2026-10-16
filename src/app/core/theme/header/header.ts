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

  notifications: Notification[] = [];
  showNotifications = false;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  get unreadCount(): number {
    let count = 0;

    for (const item of this.notifications) {
      if (!item.isRead) {
        count++;
      }
    }

    return count;
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (response) => {
        this.notifications = response || [];
      },
      error: (error) => {
        console.error('Notification loading failed', error);
      }
    });
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;

    if (this.showNotifications) {
      this.loadNotifications();
    }
  }

  openNotification(item: Notification): void {
    if (item.isRead) {
      this.showNotifications = false;
      this.router.navigate(['/payments']);
      return;
    }

    this.notificationService.markAsRead(item.notificationId).subscribe({
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

  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.notification-area')) {
      this.showNotifications = false;
    }
  }
}

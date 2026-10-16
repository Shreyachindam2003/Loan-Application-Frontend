import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../../features/notifications/notification.service';
import { Notification } from '../../../features/notifications/models/notification';

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
    private router: Router,
      private cdr: ChangeDetectorRef

  ) {}

  ngOnInit(): void {
    this.loadNotifications();



  
  }
 userId = 1;
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
    this.notificationService.getNotifications(this.userId).subscribe({
      next: (response: any) => {
        this.notifications = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];
      },
      error: (error: any) => {
        console.error('Notification loading failed', error);
      }
    });
  }toggleNotifications(): void {
  this.showNotifications = !this.showNotifications;
}
openNotification(item: Notification): void {
  if (item.isRead) {
    return;
  }

  this.notificationService.markAsRead(item.notificationId).subscribe({
    next: () => {
      item.isRead = true;
    },
    error: (error: any) => {
      console.error('Mark as read failed', error);
    }
  });



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
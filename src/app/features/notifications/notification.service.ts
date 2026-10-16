
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private http: HttpClient) { }

  url = 'http://localhost:8080/api/v1/notifications/customer/';

  // Get all notifications
  getNotifications(customerId: number) {
    return this.http.get(
      this.url + customerId
    );
  }

  // Get unread notifications
  getUnreadNotifications(customerId: number) {
    return this.http.get(
      this.url + customerId + '/unread'
    );
  }

  // Mark notification as read
  markAsRead(notificationId: number) {
    return this.http.put(
      'http://localhost:8080/api/v1/notifications/' +
      notificationId + '/read',
      {}
    );
  }


}

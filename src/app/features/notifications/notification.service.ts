import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from './notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = 'http://localhost:8080/api/v1/notifications';

  constructor(private http: HttpClient) {}

  // getNotifications(): Observable<Notification[]> {
  //   const customerId = 1; // Actual customer ID use karna

  //   return this.http.get<Notification[]>(
  //     `${this.apiUrl}/customer/${customerId}`
  //   );
  // }

  getNotifications(): Observable<Notification[]> {
  const customerId = 6; // Testing ke liye
  return this.http.get<Notification[]>(
    `${this.apiUrl}/customer/${customerId}`
  );

  
}

  getUnreadNotifications(): Observable<Notification[]> {
    const customerId = 6; // Same customer ID

    return this.http.get<Notification[]>(
      `${this.apiUrl}/customer/${customerId}/unread`
    );
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${id}/read`,
      {}
    );
  }
}

export interface Notification {
  notificationId: number;
  title: string;
  message: string;
  notificationType: string;
  referenceId: number;
  isRead: boolean;
  createdAt: string;
}

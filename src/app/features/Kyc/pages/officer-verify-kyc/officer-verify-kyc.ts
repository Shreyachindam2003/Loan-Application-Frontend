
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { VerifyKycOfficer } from '../../kyc-services/verify-kyc-officer';
import { CreditOfficerSidebar } from '../../../../core/theme/credit-officer-sidebar/credit-officer-sidebar';
import { NotificationService } from '../../../notifications/notification.service';
import { Header } from '../../../../core/theme/header/header';

@Component({
  standalone: true,
  imports: [ CommonModule, FormsModule, RouterLink,CreditOfficerSidebar,Header],
  selector: 'app-officer-verify-kyc',
  styleUrl: './officer-verify-kyc.css',
  templateUrl: './officer-verify-kyc.html'
})
export class OfficerVerifyKyc implements OnInit {

  documents: any[] = [];

  selectedCustomer: any = null;
  customerDocuments: any[] = [];

  message = '';
  rejectionReason = '';

  allSelected = false;
  showRejectForm = false;
  loading = false;

  constructor(
    private service: VerifyKycOfficer,
        private service1:NotificationService,
  
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.getDocuments();
      this.getOfficerNotifications();

  }

  getDocuments() {
    this.service.getListCustomers().subscribe({
      next: (res: any) => {
        console.log('KYC Response:', res);

        this.documents = res.data;

        this.cdr.detectChanges();

        console.log('Documents:', this.documents);
      },
      error: (err) => {
        console.log('KYC Error:', err);
        this.message = 'Unable to load KYC documents.';
        this.cdr.detectChanges();
      }
    });
  }

  viewKyc(customer: any) {
    this.selectedCustomer = customer;

    this.customerDocuments = this.documents
      .filter(doc => doc.customerId === customer.customerId)
      .map(doc => ({ ...doc, selected: false }));

    this.allSelected = false;
    this.showRejectForm = false;
    this.rejectionReason = '';
    this.message = '';

    this.cdr.detectChanges();
  }

  selectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    this.allSelected = checked;

    this.customerDocuments.forEach(doc => {
      doc.selected = checked;
    });

    this.cdr.detectChanges();
  }

  updateSelection() {
    this.allSelected =
      this.customerDocuments.length > 0 &&
      this.customerDocuments.every(doc => doc.selected);

    this.cdr.detectChanges();
  }

  viewDocument(documentId: number) {
    this.service.viewDocument(documentId).subscribe({
      next: (file: Blob) => {
        const url = URL.createObjectURL(file);
        window.open(url, '_blank');
      },
      error: (err) => {
        console.log('View document error:', err);
        this.message = 'Unable to open document.';
        this.cdr.detectChanges();
      }
    });
  }

  getSelected() {
    return this.customerDocuments.filter(doc => doc.selected);
  }

  approveSelected() {
    this.reviewSelected('APPROVED');
  }

  rejectSelected() {
    if (this.getSelected().length === 0) {
      this.message = 'Please select at least one document.';
      return;
    }

    this.showRejectForm = true;
    this.message = '';

    this.cdr.detectChanges();
  }

  confirmReject() {
    if (!this.rejectionReason.trim()) {
      this.message = 'Please enter rejection reason.';
      return;
    }

    this.reviewSelected('REJECTED');
  }

  reviewSelected(status: string) {
    const selected = this.getSelected();

    if (selected.length === 0) {
      this.message = 'Please select at least one document.';
      return;
    }

    this.loading = true;
    this.message = '';

    this.cdr.detectChanges();

    this.reviewOneByOne(selected, 0, status);
  }

  reviewOneByOne(docs: any[], index: number, status: string) {

    if (index >= docs.length) {
      this.loading = false;

      this.backToList();
      this.getDocuments();

      this.cdr.detectChanges();
      return;
    }

    const data: any = {
      status: status
    };

    if (status === 'REJECTED') {
      data.rejectionReason = this.rejectionReason.trim();
    }

    this.service.reviewDocument(docs[index].documentId, data).subscribe({
      next: (res: any) => {
        console.log('Review response:', res);

        this.reviewOneByOne(docs, index + 1, status);
      },
      error: (err: any) => {
        console.log('Review error:', err);

        this.loading = false;
        this.message =
          err?.error?.message || 'Unable to review document.';

        this.cdr.detectChanges();
      }
    });
  }

  backToList() {
    this.selectedCustomer = null;
    this.customerDocuments = [];
    this.allSelected = false;
    this.showRejectForm = false;
    this.rejectionReason = '';
    this.message = '';

    this.cdr.detectChanges();
  }

notifications: any[] = [];
unreadCount = 0;
notificationMessage = '';

officerUserId = 3; 

getOfficerNotifications(): void {
  this.service1.getNotifications(this.officerUserId)
    .subscribe({
      next: (res: any) => {
        this.notifications = res.data || res || [];

        this.unreadCount = this.notifications.filter(
          (notification: any) => !notification.isRead
        ).length;
      },
      error: (err: any) => {
        console.error('Unable to load officer notifications', err);
      }
    });
}

markAsRead(notification: any): void {
  this.service1
    .markAsRead(notification.notificationId)
    .subscribe({
      next: () => {
        notification.isRead = true;

        this.unreadCount = this.notifications.filter(
          (item: any) => !item.isRead
        ).length;
      },
      error: (err: any) => {
        console.error('Unable to mark as read', err);
      }
    });
}


}

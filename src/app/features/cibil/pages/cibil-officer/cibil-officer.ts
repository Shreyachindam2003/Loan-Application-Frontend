
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CreditOfficerSidebar } from '../../../../core/theme/credit-officer-sidebar/credit-officer-sidebar';
import { EligibiltyService } from '../../services/eligibilty-service';
import { Header } from '../../../../core/theme/header/header';

@Component({
  selector: 'app-cibil-officer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CreditOfficerSidebar,
    Header
  ],
  templateUrl: './cibil-officer.html',
  styleUrl: './cibil-officer.css'
})
export class CibilOfficer implements OnInit {

  pendingList: any[] = [];

  selectedEligibilityId: number | string | null = null;
  selectedCustomer: any = null;

  rejectionReason = '';
  message = '';

  constructor(
    private service: EligibiltyService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getPendingDetails();
  }

  getPendingDetails(): void {
    this.service.getPendingDetails().subscribe({
      next: (res: any) => {
        this.pendingList = res?.data ?? [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Pending API error:', err);
        this.message = 'Unable to load pending customers.';
        this.cdr.detectChanges();
      }
    });
  }

  getEligibilityId(customer: any): number | string | null {
    return customer?.eligibilityId ?? null;
  }

  checkEligibility(): void {
    this.message = '';
    this.rejectionReason = '';

    if (this.selectedEligibilityId == null ||
      this.selectedEligibilityId === '') {
      this.message = 'Please select a customer first.';
      return;
    }

    this.selectedCustomer = this.pendingList.find(
      customer =>
        String(customer.eligibilityId) ===
        String(this.selectedEligibilityId)
    ) ?? null;

    if (!this.selectedCustomer) {
      this.message = 'Customer not found.';
    }

    this.cdr.detectChanges();
  }

  approveEligibility(): void {
    if (!this.selectedCustomer) {
      this.message = 'Please select a customer first.';
      return;
    }

    const id = this.getEligibilityId(this.selectedCustomer);

    if (id == null) {
      this.message = 'Eligibility ID is missing.';
      return;
    }

    this.service.getEligibiltyApproved(Number(id)).subscribe({
      next: () => {
        alert('Eligibility approved successfully.');

        this.closeDetails();
        this.getPendingDetails();
      },
      error: (err: any) => {
        console.error('Approve API error:', err);
        this.message =
          err?.error?.message || 'Unable to approve eligibility.';
        this.cdr.detectChanges();
      }
    });
  }

  rejectEligibility(): void {
    if (!this.selectedCustomer) {
      this.message = 'Please select a customer first.';
      return;
    }

    if (!this.rejectionReason.trim()) {
      this.message = 'Please enter the rejection reason.';
      return;
    }

    const id = this.getEligibilityId(this.selectedCustomer);

    if (id == null) {
      this.message = 'Eligibility ID is missing.';
      return;
    }

    this.service.getEligibiltyReject(
      Number(id),
      this.rejectionReason.trim()
    ).subscribe({
      next: () => {
        alert('Eligibility rejected successfully.');

        this.closeDetails();
        this.getPendingDetails();
      },
      error: (err: any) => {
        console.error('Reject API error:', err);
        this.message =
          err?.error?.message || 'Unable to reject eligibility.';
        this.cdr.detectChanges();
      }
    });
  }

  closeDetails(): void {
    this.selectedCustomer = null;
    this.selectedEligibilityId = null;
    this.rejectionReason = '';
    this.message = '';

    this.cdr.detectChanges();
  }
}

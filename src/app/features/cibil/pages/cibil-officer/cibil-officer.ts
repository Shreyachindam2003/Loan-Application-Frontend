
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CreditOfficerSidebar } from '../../../../core/theme/credit-officer-sidebar/credit-officer-sidebar';
import { EligibiltyService } from '../../services/eligibilty-service';

@Component({
  selector: 'app-cibil-officer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CreditOfficerSidebar
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

  constructor(private service: EligibiltyService) { }

  ngOnInit(): void {
    this.getPendingDetails();
  }

  getPendingDetails(): void {
    this.service.getPendingDetails().subscribe({
      next: (res: any) => {
        console.log('Pending API response:', res);

        const data =
          res?.data?.data ??
          res?.data?.content ??
          res?.data ??
          res?.content ??
          res;

        if (Array.isArray(data)) {
          this.pendingList = data;
        } else if (Array.isArray(data?.content)) {
          this.pendingList = data.content;
        } else {
          this.pendingList = [];
          console.error('Unexpected pending response:', data);
        }
      },

      error: (err: any) => {
        console.error('Pending API error:', err);
        this.message = 'Unable to load pending customers.';
      }
    });
  }

  getEligibilityId(customer: any): number | string | null {
    const id =
      customer?.eligibilityId ??
      customer?.EligibilityId ??
      customer?.eligibilityID ??
      customer?.eligibility_id ??
      customer?.eligibilityid;

    return id ?? null;
  }

  // Show selected customer details
  checkEligibility(): void {
    this.message = '';
    this.rejectionReason = '';

    if (
      this.selectedEligibilityId == null ||
      this.selectedEligibilityId === ''
    ) {
      this.message = 'Please select a customer first.';
      return;
    }

    const customer = this.pendingList.find(
      (item: any) =>
        String(this.getEligibilityId(item)) ===
        String(this.selectedEligibilityId)
    );

    if (!customer) {
      this.message = 'Customer not found. Please refresh the list.';
      return;
    }

    this.selectedCustomer = customer;
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

    this.message = '';

    this.service.getEligibiltyApproved(Number(id)).subscribe({
      next: (res: any) => {

        console.log('Approve response:', res);
        alert('Eligibility approved successfully.');

        this.selectedCustomer = null;
        this.selectedEligibilityId = null;
        this.rejectionReason = '';

        this.getPendingDetails();
      },

      error: (err: any) => {
        console.error('Approve API error:', err);

        this.message =
          err?.error?.message ||
          'Unable to approve eligibility.';
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

    this.message = '';

    this.service.getEligibiltyReject(
      Number(id),
      this.rejectionReason.trim()
    ).subscribe({
      next: (res: any) => {
        console.log('Reject response:', res);

        alert('Eligibility rejected successfully.');


        this.selectedCustomer = null;
        this.selectedEligibilityId = null;
        this.rejectionReason = '';

        this.getPendingDetails();
      },

      error: (err: any) => {
        console.error('Reject API error:', err);

        this.message =
          err?.error?.message ||
          'Unable to reject eligibility.';
      }
    });
  }

  closeDetails(): void {
    this.selectedCustomer = null;
    this.selectedEligibilityId = null;
    this.rejectionReason = '';
    this.message = '';
  }
}

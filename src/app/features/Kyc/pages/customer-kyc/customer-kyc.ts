

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerSidebar } from '../../../../core/theme/customer-sidebar/customer-sidebar';
import { KycCustomer } from '../../kyc-services/kyc-customer';

@Component({
  standalone: true,
  selector: 'app-customer-kyc',
  imports: [CommonModule, FormsModule, CustomerSidebar],
  templateUrl: './customer-kyc.html',
  styleUrl: './customer-kyc.css'
})
export class CustomerKyc implements OnInit {

  constructor(
    private service: KycCustomer,
    private cdr: ChangeDetectorRef
  ) { }

  userId = 4;

  documentTypes = [
    { name: 'Aadhaar Card', value: 'AADHAAR' },
    { name: 'PAN Card', value: 'PAN' },
    { name: 'Salary Slip', value: 'SALARY_SLIP' }
  ];

  selectedType = '';
  selectedFile: File | null = null;
  documents: any[] = [];
  message = '';

  ngOnInit(): void {
    this.getDocuments();
  }

  getDocuments(): void {
    this.service.getDocuments(this.userId).subscribe({
      next: (res: any) => {
        this.documents = res.data || [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.message = 'Unable to load documents';
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    console.log(
      'File size in MB:',
      file ? file.size / (1024 * 1024) : 0
    );

    if (file && file.size > 5 * 1024 * 1024) {
      this.message = 'File size is too large! Maximum allowed size is 5 MB.';
      input.value = '';
      this.selectedFile = null;
      this.cdr.detectChanges();
      return;
    }

    this.selectedFile = file;
  }

  getAvailableTypes() {
    return this.documentTypes.filter(type =>
      !this.documents.some(doc => doc.documentType === type.value)
    );
  }

  uploadDocument(): void {
    if (!this.selectedType || !this.selectedFile) {
      this.message = 'Please select document type and file!';
      return;
    }

    if (this.selectedFile.size > 5 * 1024 * 1024) {
      this.message = 'File size is too large! Maximum allowed size is 5 MB.';
      return;
    }

    const formData = new FormData();
    formData.append('documentType', this.selectedType);
    formData.append('file', this.selectedFile);

    const documentName = this.documentTypes.find(
      type => type.value === this.selectedType
    )?.name || this.selectedType;

    this.service.uploadDocument(this.userId, formData).subscribe({
      next: (res: any) => {
        this.message = res.message || 'Document uploaded successfully';

        this.selectedType = '';
        this.selectedFile = null;

        const fileInput = document.getElementById('kycFile') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }

        this.getDocuments();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.message = err?.error?.message || 'Upload failed';
        this.cdr.detectChanges();
      }
    });
  }

  viewDocument(documentId: number): void {
    this.service.viewDocument(this.userId, documentId).subscribe({
      next: (file: Blob) => {
        const url = URL.createObjectURL(file);
        window.open(url, '_blank');
      },
      error: () => {
        this.message = 'Unable to open document';
        this.cdr.detectChanges();
      }
    });
  }

  deleteDocument(documentId: number): void {
    if (!confirm('Do you want to delete this document?')) {
      return;
    }

    this.service.deleteDocument(this.userId, documentId).subscribe({
      next: (res: any) => {
        this.message = res.message || 'Document deleted successfully';

        this.documents = this.documents.filter(
          doc => doc.documentId !== documentId
        );

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.message = err?.error?.message || 'Delete failed';
        this.cdr.detectChanges();
      }
    });
  }

  getStatusClass(status: string): string {
    if (status === 'APPROVED' || status === 'VERIFIED') {
      return 'bg-success';
    }

    if (status === 'REJECTED') {
      return 'bg-danger';
    }

    return 'bg-warning text-dark';
  }
}

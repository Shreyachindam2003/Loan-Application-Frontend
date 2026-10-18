import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, ApiEnvelope, KycDocument, LoanDeal, ScoreCard, NotificationItem, EligibilityReview, PageData } from './api.service';

type PageKey = 'overview'|'kyc'|'cibil'|'eligibility'|'apply'|'applications'|'scorecard'|'sanction'|'accounts'|'notifications'|'kyc-review'|'eligibility-review'|'loan-review';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly api = inject(ApiService);
  page: PageKey = 'overview';
  workspace: 'customer'|'officer' = 'customer';
  customerId = '';
  officerId = '';
  busy = false;
  message = '';
  error = '';
  documents: KycDocument[] = [];
  pendingKyc: KycDocument[] = [];
  selectedFile: File | null = null;
  documentType = 'AADHAAR';
  cibilDetails: Record<string, unknown> | null = null;
  cibilResult: Record<string, unknown> | null = null;
  eligibility: Record<string, unknown> | null = null;
  scorecard: ScoreCard | null = null;
  applications: LoanDeal[] = [];
  pendingDeals: LoanDeal[] = [];
  eligibilityReviews: EligibilityReview[] = [];
  accounts: Record<string, unknown>[] = [];
  notifications: NotificationItem[] = [];
  loanType = 'HOME_LOAN';
  loanAmount = 1000000;
  tenureMonths = 120;
  bankName = '';
  bankAccountNumber = '';
  ifscCode = '';
  disbursementDate = '';
  emiDay = 5;
  propertyAddress = '';
  decisionRemarks: Record<number, string> = {};
  selectedBankPartner = 'SBI';
  disbursementDealId = '';
  sanctionDealId = '';
  sanction: Record<string, unknown> | null = null;
  pageNumber = 0;
  totalPages = 0;
  readonly customerNav: { key: PageKey; label: string; icon: string; group: string }[] = [
    {key:'overview',label:'Overview',icon:'◫',group:'WORKSPACE'},
    {key:'kyc',label:'KYC documents',icon:'▤',group:'MY LOAN'},
    {key:'cibil',label:'CIBIL & eligibility',icon:'◈',group:'MY LOAN'},
    {key:'scorecard',label:'Scorecard',icon:'▦',group:'MY LOAN'},
    {key:'apply',label:'Apply for loan',icon:'＋',group:'MY LOAN'},
    {key:'applications',label:'My applications',icon:'▣',group:'MY LOAN'},
    {key:'sanction',label:'Sanction letter',icon:'▧',group:'MY LOAN'},
    {key:'accounts',label:'Loan accounts',icon:'◷',group:'MY LOAN'},
    {key:'notifications',label:'Notifications',icon:'♧',group:'MY LOAN'}
  ];
  readonly officerNav: { key: PageKey; label: string; icon: string; group: string }[] = [
    {key:'overview',label:'Overview',icon:'◫',group:'WORKSPACE'},
    {key:'kyc-review',label:'KYC review',icon:'▤',group:'OPERATIONS'},
    {key:'eligibility-review',label:'Eligibility review',icon:'◈',group:'OPERATIONS'},
    {key:'loan-review',label:'Loan processing',icon:'▣',group:'OPERATIONS'}
  ];

  get navItems() { return this.workspace === 'customer' ? this.customerNav : this.officerNav; }
  get pageTitle(): string {
    const labels: Record<PageKey, string> = {
      overview: 'Overview', kyc: 'KYC documents', cibil: 'CIBIL & eligibility',
      eligibility: 'Eligibility', apply: 'Apply for a loan', applications: 'My applications',
      scorecard: 'Scorecard', sanction: 'Sanction letter', accounts: 'Loan accounts',
      notifications: 'Notifications', 'kyc-review': 'KYC review',
      'eligibility-review': 'Eligibility review', 'loan-review': 'Loan processing'
    };
    return labels[this.page];
  }
  get customerNumber(): number | null { const n = Number(this.customerId); return Number.isInteger(n) && n > 0 ? n : null; }
  get officerNumber(): number | null { const n = Number(this.officerId); return Number.isInteger(n) && n > 0 ? n : null; }
  get pendingKycCount(): number { return this.pendingKyc.length; }
  get pendingLoanCount(): number { return this.pendingDeals.length; }

  dateValue(value: unknown): string | number | Date | null {
    if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) return value;
    return null;
  }

  switchWorkspace(mode: 'customer'|'officer'): void {
    this.workspace = mode; this.page = 'overview'; this.clearNotice();
    if (mode === 'officer') this.loadOfficerOverview();
    else this.loadCustomerOverview();
  }
  navigate(page: PageKey): void {
    this.page = page; this.clearNotice();
    switch (page) {
      case 'overview': this.workspace === 'customer' ? this.loadCustomerOverview() : this.loadOfficerOverview(); break;
      case 'kyc': this.loadKyc(); break;
      case 'cibil': this.loadCibil(); this.loadEligibility(); break;
      case 'eligibility': this.loadEligibility(); break;
      case 'scorecard': this.loadScorecard(); break;
      case 'applications': this.loadApplications(); break;
      case 'accounts': this.loadAccounts(); break;
      case 'notifications': this.loadNotifications(); break;
      case 'kyc-review': this.loadPendingKyc(); break;
      case 'eligibility-review': this.loadPendingEligibility(); break;
      case 'loan-review': this.loadPendingDeals(); break;
      default: break;
    }
  }
  private clearNotice(): void { this.message = ''; this.error = ''; }
  private fail(err: unknown, fallback: string): void {
    const e = err as { error?: { message?: string; error?: string }; message?: string };
    this.error = e?.error?.message || e?.error?.error || e?.message || fallback;
    this.busy = false;
  }
  private done(message: string): void { this.message = message; this.busy = false; }
  private requireCustomer(): number | null {
    if (!this.customerNumber) { this.error = 'Enter a valid customer ID first.'; return null; }
    return this.customerNumber;
  }
  private loadCustomerOverview(): void {
    if (!this.customerNumber) return;
    this.api.get<LoanDeal>(`/loan-deals/customer/${this.customerNumber}/latest`).subscribe({
      next: r => { this.applications = r.data ? [r.data] : []; },
      error: () => { this.applications = []; }
    });
    this.loadScorecard(); this.loadKyc();
  }
  private loadOfficerOverview(): void { this.loadPendingKyc(); this.loadPendingDeals(); this.loadPendingEligibility(); }
  loadKyc(): void {
    const id = this.requireCustomer(); if (!id) return;
    this.api.get<KycDocument[]>(`/kyc/customers/${id}/documents`).subscribe({
      next: r => this.documents = r.data ?? [], error: e => this.fail(e, 'Could not load KYC documents.')
    });
  }
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }
  uploadKyc(): void {
    const id = this.requireCustomer(); if (!id) return;
    if (!this.selectedFile) { this.error = 'Choose a PDF or image file first.'; return; }
    if (!['application/pdf','image/jpeg','image/png','image/webp'].includes(this.selectedFile.type)) {
      this.error = 'Only PDF, JPG, PNG or WEBP files are supported.'; return;
    }
    const form = new FormData(); form.append('documentType', this.documentType); form.append('file', this.selectedFile);
    this.busy = true;
    this.api.upload<KycDocument>(`/kyc/customers/${id}/documents`, form).subscribe({
      next: r => { this.done(r.message || 'Document uploaded.'); this.selectedFile = null; this.loadKyc(); },
      error: e => this.fail(e, 'Document upload failed.')
    });
  }
  deleteKyc(doc: KycDocument): void {
    const id = this.requireCustomer(); if (!id || !confirm(`Delete ${doc.documentType} document?`)) return;
    this.deleteDocumentRequest(id, doc.documentId);
  }
  private deleteDocumentRequest(customerId: number, documentId: number): void {
    this.api.delete<void>(`/kyc/customers/${customerId}/documents/${documentId}`).subscribe({
      next: r => { this.done(r.message || 'Document deleted.'); this.loadKyc(); },
      error: e => this.fail(e, 'Document could not be deleted.')
    });
  }
  viewKyc(doc: KycDocument, officer = false): void {
    const path = officer ? `/kyc/officer/documents/${doc.documentId}/view` : `/kyc/customers/${doc.customerId}/documents/${doc.documentId}/view`;
    window.open(this.api.fileUrl(path), '_blank', 'noopener');
  }
  loadPendingKyc(): void {
    this.api.get<KycDocument[]>('/kyc/officer/pending').subscribe({ next: r => this.pendingKyc = r.data ?? [], error: e => this.fail(e, 'Could not load pending KYC.') });
  }
  reviewKyc(doc: KycDocument, status: 'APPROVED'|'REJECTED'): void {
    const reason = this.decisionRemarks[doc.documentId] || '';
    if (status === 'REJECTED' && !reason.trim()) { this.error = 'Enter a rejection reason.'; return; }
    this.busy = true;
    this.api.put<KycDocument>(`/kyc/officer/documents/${doc.documentId}/review`, { status, rejectionReason: status === 'REJECTED' ? reason.trim() : null }).subscribe({
      next: r => { this.done(r.message || `Document ${status.toLowerCase()}.`); this.loadPendingKyc(); },
      error: e => this.fail(e, 'KYC review failed.')
    });
  }
  loadCibil(): void {
    const id = this.requireCustomer(); if (!id) return;
    this.api.get<Record<string, unknown>>(`/cibil/customer/${id}/details`).subscribe({
      next: r => this.cibilDetails = r.data ?? null, error: e => this.fail(e, 'Could not load customer CIBIL details.')
    });
  }
  calculateCibil(): void {
    const id = this.requireCustomer(); if (!id) return;
    this.busy = true;
    this.api.post<Record<string, unknown>>(`/cibil/customer/${id}/calculate`).subscribe({
      next: r => { this.cibilResult = r.data ?? null; this.done(r.message || 'CIBIL score calculated.'); this.loadCibil(); this.loadEligibility(); },
      error: e => this.fail(e, 'CIBIL calculation failed.')
    });
  }
  loadEligibility(): void {
    const id = this.requireCustomer(); if (!id) return;
    this.api.get<Record<string, unknown>>(`/eligibility/customer/${id}`).subscribe({
      next: r => this.eligibility = r.data ?? null, error: e => { this.eligibility = null; }
    });
  }
  loadPendingEligibility(): void {
    this.api.get<EligibilityReview[]>('/eligibility/pending').subscribe({ next: r => this.eligibilityReviews = r.data ?? [], error: e => this.fail(e, 'Could not load eligibility reviews.') });
  }
  reviewEligibility(item: EligibilityReview, decision: 'APPROVED'|'REJECTED'): void {
    const officer = this.officerNumber;
    if (!officer) { this.error = 'Enter the actual officer ID in the top bar.'; return; }
    const remarks = this.decisionRemarks[item.eligibilityId] || '';
    if (decision === 'REJECTED' && !remarks.trim()) { this.error = 'Rejection remarks are required.'; return; }
    this.busy = true;
    this.api.post<EligibilityReview>(`/eligibility/${item.eligibilityId}/review?officerId=${officer}`, { decision, remarks }).subscribe({
      next: r => { this.done(r.message || 'Eligibility review saved.'); this.loadPendingEligibility(); },
      error: e => this.fail(e, 'Eligibility review failed.')
    });
  }
  loadScorecard(): void {
    const id = this.requireCustomer(); if (!id) return;
    this.api.get<ScoreCard>(`/scorecards/customer/${id}/latest`).subscribe({
      next: r => this.scorecard = r.data ?? null, error: () => this.scorecard = null
    });
  }
  generateScorecard(): void {
    const id = this.requireCustomer(); if (!id) return;
    this.busy = true;
    this.api.post<ScoreCard>(`/scorecards/customers/${id}`).subscribe({
      next: r => { this.scorecard = r.data ?? null; this.done(r.message || 'Scorecard generated.'); },
      error: e => this.fail(e, 'Scorecard generation failed.')
    });
  }
  applyForLoan(): void {
    const id = this.requireCustomer(); if (!id) return;
    if (!this.scorecard?.scoreCardId) { this.error = 'Generate or load a scorecard before applying.'; return; }
    if (!this.bankName.trim() || !/^\d{6,50}$/.test(this.bankAccountNumber) || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(this.ifscCode)) {
      this.error = 'Enter bank name, 6–50 digit account number and valid uppercase IFSC.'; return;
    }
    if (!this.disbursementDate || this.disbursementDate < new Date().toISOString().slice(0,10)) { this.error = 'Choose a disbursement date today or later.'; return; }
    const body = { scoreCardId: this.scorecard.scoreCardId, loanType: this.loanType, loanAmount: this.loanAmount, tenureMonths: this.tenureMonths,
      bankName: this.bankName.trim(), bankAccountNumber: this.bankAccountNumber, ifscCode: this.ifscCode,
      requestedDisbursementDate: this.disbursementDate, emiDay: this.emiDay, propertyAddress: this.propertyAddress.trim() || null };
    this.busy = true;
    this.api.post<LoanDeal>(`/loan-deals/customers/${id}`, body).subscribe({
      next: r => { this.done(r.message || 'Loan application submitted.'); this.page = 'applications'; this.loadApplications(); },
      error: e => this.fail(e, 'Loan application failed.')
    });
  }
  loadApplications(): void {
    const id = this.requireCustomer(); if (!id) return;
    this.api.get<PageData<LoanDeal>>(`/loan-deals/customer/${id}`, { page: this.pageNumber, size: 10 }).subscribe({
      next: r => { this.applications = r.data?.content ?? []; this.totalPages = r.data?.totalPages ?? 0; },
      error: e => this.fail(e, 'Could not load applications.')
    });
  }
  changePage(delta: number): void { this.pageNumber = Math.max(0, Math.min(Math.max(this.totalPages - 1, 0), this.pageNumber + delta)); this.loadApplications(); }
  loadPendingDeals(): void {
    this.api.get<LoanDeal[]>('/loan-deals/pending').subscribe({ next: r => this.pendingDeals = r.data ?? [], error: e => this.fail(e, 'Could not load pending loan applications.') });
  }
  reviewDeal(deal: LoanDeal, decision: 'APPROVED'|'REJECTED'): void {
    const officer = this.officerNumber;
    if (!officer) { this.error = 'Enter the actual officer ID in the top bar.'; return; }
    const remarks = this.decisionRemarks[deal.dealId] || '';
    if (decision === 'REJECTED' && !remarks.trim()) { this.error = 'Rejection remarks are required.'; return; }
    this.busy = true;
    this.api.post<LoanDeal>(`/loan-deals/${deal.dealId}/review?officerId=${officer}`, { decision, remarks: remarks.trim() || null }).subscribe({
      next: r => { this.done(r.message || 'Application reviewed.'); this.loadPendingDeals(); },
      error: e => this.fail(e, 'Loan review failed.')
    });
  }
  loadAccounts(): void {
    const id = this.requireCustomer(); if (!id) return;
    this.api.get<Record<string, unknown>[]>(`/loan-accounts/customers/${id}`).subscribe({
      next: r => this.accounts = r.data ?? [], error: e => this.fail(e, 'Could not load loan accounts.')
    });
  }
  loadNotifications(): void {
    const id = this.requireCustomer(); if (!id) return;
    this.api.get<NotificationItem[]>(`/customers/${id}/notifications`).subscribe({
      next: r => this.notifications = r.data ?? [], error: e => this.fail(e, 'Could not load notifications.')
    });
  }
  markNotificationRead(item: NotificationItem): void {
    const id = this.requireCustomer(); if (!id) return;
    this.api.patch<void>(`/customers/${id}/notifications/${item.notificationId}/read`).subscribe({
      next: () => { item.read = true; this.done('Notification marked as read.'); },
      error: e => this.fail(e, 'Could not mark notification as read.')
    });
  }
  generateSanction(): void {
    const id = Number(this.sanctionDealId);
    if (!Number.isInteger(id) || id <= 0) { this.error = 'Enter a valid deal ID.'; return; }
    this.busy = true;
    this.api.post<Record<string, unknown>>(`/sanction-letters/deals/${id}`).subscribe({
      next: r => { this.sanction = r.data ?? null; this.done(r.message || 'Sanction letter ready.'); },
      error: e => this.fail(e, 'Sanction letter generation failed.')
    });
  }
  loadSanction(): void {
    const id = Number(this.sanctionDealId);
    if (!Number.isInteger(id) || id <= 0) { this.error = 'Enter a valid deal ID.'; return; }
    this.api.get<Record<string, unknown>>(`/sanction-letters/deal/${id}`).subscribe({
      next: r => { this.sanction = r.data ?? null; this.done('Sanction letter loaded.'); },
      error: e => this.fail(e, 'Sanction letter not found.')
    });
  }
  downloadSanction(): void {
    const id = Number(this.sanction?.['sanctionId']);
    if (!id) { this.error = 'Load or generate a sanction letter first.'; return; }
    this.api.downloadPdf(`/sanction-letters/${id}/pdf`, `sanction-${id}.pdf`);
  }
  disburse(deal: LoanDeal): void { this.disburseById(String(deal.dealId)); }
  disburseById(dealIdText = this.disbursementDealId): void {
    const dealId = Number(dealIdText);
    if (!Number.isInteger(dealId) || dealId <= 0) { this.error = 'Enter a valid approved deal ID.'; return; }
    if (!confirm(`Confirm disbursement for application #${dealId}?`)) return;
    this.busy = true;
    this.api.post<Record<string, unknown>>(`/disbursements/deals/${dealId}`, { bankPartner: this.selectedBankPartner }).subscribe({
      next: r => { this.done(r.message || 'Disbursement completed. Loan account should now be available.'); this.disbursementDealId = String(dealId); },
      error: e => this.fail(e, 'Disbursement failed. Check whether this deal is approved and not already disbursed.')
    });
  }
  money(value: unknown): string {
    const amount = Number(value);
    return Number.isFinite(amount) ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount) : '—';
  }
  pretty(value: unknown): string {
    if (value === null || value === undefined || value === '') return '—';
    return String(value).replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, m => m.toUpperCase());
  }
  entries(value: Record<string, unknown> | null): [string, unknown][] {
    return value ? Object.entries(value).filter(([key]) => !key.toLowerCase().includes('filepath')) : [];
  }
}
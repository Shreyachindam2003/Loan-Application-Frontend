import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CustomerSidebar } from '../../../../core/theme/customer-sidebar/customer-sidebar';
import { EligibiltyService } from '../../services/eligibilty-service';

@Component({
  imports: [CommonModule, CustomerSidebar],
  selector: 'app-eligibility-check',
  styleUrl: './eligibility-check.css',
  templateUrl: './eligibility-check.html',
})
export class EligibilityCheck implements OnInit {

  constructor(private service: EligibiltyService, private cdr: ChangeDetectorRef) {

  }

  mssg: any;
  customerName: any;
  panNumber: any;
  montlyIncome: any;
  CibilScore: any;
  loanAmount: any;
  Status: any;

  ngOnInit(): void {
    this.getEligibiltyResult();
  }
  getEligibiltyResult() {
    this.service.getElibilityDetails(1).subscribe({
      next: (res: any) => {
          console.log('Eligibility API Response:', res);
  console.log('Backend Status:', res.data.status);

  
        this.customerName = res.data.FullName;
        this.panNumber = res.data.panNo;
        this.montlyIncome = res.data.monthlyIncome;
        this.CibilScore = res.data.Score;
        this.Status = res.data.status;
        this.loanAmount = res.data.loanAmount;
            this.cdr.detectChanges();


        if (this.Status?.toUpperCase() === 'APPROVED') {
          this.mssg = 'Congratulations! Your loan eligibility is approved.';
        } else if (this.Status?.toUpperCase() === 'REJECTED') {
          this.mssg = 'Sorry! Your loan eligibility has been rejected.';
        } else {
          this.mssg = 'Your loan eligibility is pending.';
        }
      },
      error: (err: any) => {
        console.error(err);
        this.mssg = 'Unable to fetch eligibility details.';
      }
    });
  }

}

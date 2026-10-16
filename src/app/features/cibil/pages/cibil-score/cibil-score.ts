import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CibilScoreService } from '../../services/cibil-score-service';
import { CustomerSidebar } from '../../../../core/theme/customer-sidebar/customer-sidebar';
import { CommonModule } from '@angular/common';
import { Header } from '../../../../core/theme/header/header';

@Component({
  selector: 'app-cibil-score',
  standalone: true,
  imports: [ReactiveFormsModule,CustomerSidebar,CommonModule,Header],
  templateUrl: './cibil-score.html',
  styleUrl: './cibil-score.css'
})
export class CibilScore implements OnInit {
 Math = Math; 
  customerName = new FormControl('');
  panNumber = new FormControl('');

  constructor(private service: CibilScoreService) {}
  ngOnInit(): void {
  this.service.getCibilReport(1).subscribe({
    next: (res: any) => {
      this.customerName.setValue(res.data.FullName);
      this.panNumber.setValue(res.data.PanNumber);
    },
    error: (err: any) => console.error(err)
  });
}

checkDate:any;
cibilScore:any;
status:any;
  checkScore(): void {
this.service.getCibilScore(2).subscribe({
  next: (res: any) => {
this.checkDate=res.data.CheckDate;
this.cibilScore=res.data.CibilScore;
this.status=res.data.Status;
  },
  error: (err: any) =>{
 console.error(err)
  }
    
});




  }
}
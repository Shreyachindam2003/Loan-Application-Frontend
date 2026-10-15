import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerKyc } from './customer-kyc';

describe('CustomerKyc', () => {
  let component: CustomerKyc;
  let fixture: ComponentFixture<CustomerKyc>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerKyc],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerKyc);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';
import { EmiPayment } from './emi-payment';

describe('EmiPayment', () => {
  let service: EmiPayment;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmiPayment);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

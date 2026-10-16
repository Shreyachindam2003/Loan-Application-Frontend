import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MakePayments } from './make-payments';

describe('MakePayments', () => {
  let component: MakePayments;
  let fixture: ComponentFixture<MakePayments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MakePayments],
    }).compileComponents();

    fixture = TestBed.createComponent(MakePayments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

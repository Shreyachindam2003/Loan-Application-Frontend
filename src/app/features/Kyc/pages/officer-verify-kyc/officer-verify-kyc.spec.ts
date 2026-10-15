import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OfficerVerifyKyc } from './officer-verify-kyc';

describe('OfficerVerifyKyc', () => {
  let component: OfficerVerifyKyc;
  let fixture: ComponentFixture<OfficerVerifyKyc>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfficerVerifyKyc],
    }).compileComponents();

    fixture = TestBed.createComponent(OfficerVerifyKyc);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

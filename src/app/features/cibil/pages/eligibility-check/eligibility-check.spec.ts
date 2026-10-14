import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EligibilityCheck } from './eligibility-check';

describe('EligibilityCheck', () => {
  let component: EligibilityCheck;
  let fixture: ComponentFixture<EligibilityCheck>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EligibilityCheck],
    }).compileComponents();

    fixture = TestBed.createComponent(EligibilityCheck);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

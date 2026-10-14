import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CibilOfficer } from './cibil-officer';

describe('CibilOfficer', () => {
  let component: CibilOfficer;
  let fixture: ComponentFixture<CibilOfficer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CibilOfficer],
    }).compileComponents();

    fixture = TestBed.createComponent(CibilOfficer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

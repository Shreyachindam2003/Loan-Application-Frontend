import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CibilScore } from './cibil-score';

describe('CibilScore', () => {
  let component: CibilScore;
  let fixture: ComponentFixture<CibilScore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CibilScore],
    }).compileComponents();

    fixture = TestBed.createComponent(CibilScore);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

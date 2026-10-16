import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyPenalties } from './my-penalties';

describe('MyPenalties', () => {
  let component: MyPenalties;
  let fixture: ComponentFixture<MyPenalties>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPenalties],
    }).compileComponents();

    fixture = TestBed.createComponent(MyPenalties);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

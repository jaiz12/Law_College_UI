import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EligibilityAdmissionProcessAndIntakeComponent } from './eligibility-admission-process-and-intake.component';

describe('EligibilityAdmissionProcessAndIntakeComponent', () => {
  let component: EligibilityAdmissionProcessAndIntakeComponent;
  let fixture: ComponentFixture<EligibilityAdmissionProcessAndIntakeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EligibilityAdmissionProcessAndIntakeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EligibilityAdmissionProcessAndIntakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

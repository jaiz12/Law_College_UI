import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EligibilityAdmissionProcessAndIntakeModalComponent } from './eligibility-admission-process-and-intake-modal.component';

describe('EligibilityAdmissionProcessAndIntakeModalComponent', () => {
  let component: EligibilityAdmissionProcessAndIntakeModalComponent;
  let fixture: ComponentFixture<EligibilityAdmissionProcessAndIntakeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EligibilityAdmissionProcessAndIntakeModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EligibilityAdmissionProcessAndIntakeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

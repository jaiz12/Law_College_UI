import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicPoliciesComponent } from './academic-policies.component';

describe('AcademicPoliciesComponent', () => {
  let component: AcademicPoliciesComponent;
  let fixture: ComponentFixture<AcademicPoliciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcademicPoliciesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcademicPoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

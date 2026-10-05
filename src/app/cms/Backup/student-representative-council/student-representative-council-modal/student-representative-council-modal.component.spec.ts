import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentRepresentativeCouncilModalComponent } from './student-representative-council-modal.component';

describe('StudentRepresentativeCouncilModalComponent', () => {
  let component: StudentRepresentativeCouncilModalComponent;
  let fixture: ComponentFixture<StudentRepresentativeCouncilModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentRepresentativeCouncilModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentRepresentativeCouncilModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

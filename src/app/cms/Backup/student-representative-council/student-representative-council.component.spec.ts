import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentRepresentativeCouncilComponent } from './student-representative-council.component';

describe('StudentRepresentativeCouncilComponent', () => {
  let component: StudentRepresentativeCouncilComponent;
  let fixture: ComponentFixture<StudentRepresentativeCouncilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentRepresentativeCouncilComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentRepresentativeCouncilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

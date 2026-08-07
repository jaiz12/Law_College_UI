import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentAchieversComponent } from './student-achievers.component';

describe('StudentAchieversComponent', () => {
  let component: StudentAchieversComponent;
  let fixture: ComponentFixture<StudentAchieversComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentAchieversComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentAchieversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

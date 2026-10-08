import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentAchieversModalComponent } from './student-achievers-modal.component';

describe('StudentAchieversModalComponent', () => {
  let component: StudentAchieversModalComponent;
  let fixture: ComponentFixture<StudentAchieversModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentAchieversModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentAchieversModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentClubModalComponent } from './student-club-modal.component';

describe('StudentClubModalComponent', () => {
  let component: StudentClubModalComponent;
  let fixture: ComponentFixture<StudentClubModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentClubModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentClubModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

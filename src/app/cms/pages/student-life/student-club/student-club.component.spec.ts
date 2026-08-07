import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentClubComponent } from './student-club.component';

describe('StudentClubComponent', () => {
  let component: StudentClubComponent;
  let fixture: ComponentFixture<StudentClubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentClubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentClubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamSchedulesComponent } from './exam-schedules.component';

describe('ExamSchedulesComponent', () => {
  let component: ExamSchedulesComponent;
  let fixture: ComponentFixture<ExamSchedulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamSchedulesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamSchedulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

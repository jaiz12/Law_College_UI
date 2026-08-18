import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicCalendarModalComponent } from './academic-calendar-modal.component';

describe('AcademicCalendarModalComponent', () => {
  let component: AcademicCalendarModalComponent;
  let fixture: ComponentFixture<AcademicCalendarModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcademicCalendarModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcademicCalendarModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

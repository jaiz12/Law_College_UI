import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeminarsAndWebinarsModalComponent } from './seminars-and-webinars-modal.component';

describe('SeminarsAndWebinarsModalComponent', () => {
  let component: SeminarsAndWebinarsModalComponent;
  let fixture: ComponentFixture<SeminarsAndWebinarsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeminarsAndWebinarsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeminarsAndWebinarsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

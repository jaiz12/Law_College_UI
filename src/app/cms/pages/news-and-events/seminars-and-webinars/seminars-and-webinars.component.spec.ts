import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeminarsAndWebinarsComponent } from './seminars-and-webinars.component';

describe('SeminarsAndWebinarsComponent', () => {
  let component: SeminarsAndWebinarsComponent;
  let fixture: ComponentFixture<SeminarsAndWebinarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeminarsAndWebinarsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeminarsAndWebinarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeminarsWebinarsComponent } from './seminars-webinars.component';

describe('SeminarsWebinarsComponent', () => {
  let component: SeminarsWebinarsComponent;
  let fixture: ComponentFixture<SeminarsWebinarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeminarsWebinarsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeminarsWebinarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

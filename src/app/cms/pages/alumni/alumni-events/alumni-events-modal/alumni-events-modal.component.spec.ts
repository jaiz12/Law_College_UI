import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlumniEventsModalComponent } from './alumni-events-modal.component';

describe('AlumniEventsModalComponent', () => {
  let component: AlumniEventsModalComponent;
  let fixture: ComponentFixture<AlumniEventsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlumniEventsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlumniEventsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

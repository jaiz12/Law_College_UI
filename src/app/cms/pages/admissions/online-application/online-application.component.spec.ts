import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineApplicationComponent } from './online-application.component';

describe('OnlineApplicationComponent', () => {
  let component: OnlineApplicationComponent;
  let fixture: ComponentFixture<OnlineApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnlineApplicationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnlineApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

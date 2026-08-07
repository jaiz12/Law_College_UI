import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationPolicyComponent } from './reservation-policy.component';

describe('ReservationPolicyComponent', () => {
  let component: ReservationPolicyComponent;
  let fixture: ComponentFixture<ReservationPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationPolicyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

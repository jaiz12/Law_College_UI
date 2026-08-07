import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrativeStaffComponent } from './administrative-staff.component';

describe('AdministrativeStaffComponent', () => {
  let component: AdministrativeStaffComponent;
  let fixture: ComponentFixture<AdministrativeStaffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministrativeStaffComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministrativeStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

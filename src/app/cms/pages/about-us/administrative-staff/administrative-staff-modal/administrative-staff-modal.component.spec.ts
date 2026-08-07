import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrativeStaffModalComponent } from './administrative-staff-modal.component';

describe('AdministrativeStaffModalComponent', () => {
  let component: AdministrativeStaffModalComponent;
  let fixture: ComponentFixture<AdministrativeStaffModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministrativeStaffModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministrativeStaffModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

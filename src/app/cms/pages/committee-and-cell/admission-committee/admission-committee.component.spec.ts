import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmissionCommitteeComponent } from './admission-committee.component';

describe('AdmissionCommitteeComponent', () => {
  let component: AdmissionCommitteeComponent;
  let fixture: ComponentFixture<AdmissionCommitteeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmissionCommitteeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmissionCommitteeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

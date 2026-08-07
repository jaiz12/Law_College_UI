import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrievancesRedressalCommitteeComponent } from './grievances-redressal-committee.component';

describe('GrievancesRedressalCommitteeComponent', () => {
  let component: GrievancesRedressalCommitteeComponent;
  let fixture: ComponentFixture<GrievancesRedressalCommitteeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrievancesRedressalCommitteeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrievancesRedressalCommitteeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

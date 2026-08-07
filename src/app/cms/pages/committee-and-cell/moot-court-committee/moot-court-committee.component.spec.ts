import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MootCourtCommitteeComponent } from './moot-court-committee.component';

describe('MootCourtCommitteeComponent', () => {
  let component: MootCourtCommitteeComponent;
  let fixture: ComponentFixture<MootCourtCommitteeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MootCourtCommitteeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MootCourtCommitteeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExaminationCommitteeComponent } from './examination-committee.component';

describe('ExaminationCommitteeComponent', () => {
  let component: ExaminationCommitteeComponent;
  let fixture: ComponentFixture<ExaminationCommitteeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExaminationCommitteeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExaminationCommitteeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

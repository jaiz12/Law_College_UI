import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollegeManagementCommitteeComponent } from './college-management-committee.component';

describe('CollegeManagementCommitteeComponent', () => {
  let component: CollegeManagementCommitteeComponent;
  let fixture: ComponentFixture<CollegeManagementCommitteeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollegeManagementCommitteeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollegeManagementCommitteeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

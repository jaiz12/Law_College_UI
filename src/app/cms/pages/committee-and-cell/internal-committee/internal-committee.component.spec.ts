import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalCommitteeComponent } from './internal-committee.component';

describe('InternalCommitteeComponent', () => {
  let component: InternalCommitteeComponent;
  let fixture: ComponentFixture<InternalCommitteeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InternalCommitteeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InternalCommitteeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

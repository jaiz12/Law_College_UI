import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BciComplianceComponent } from './bci-compliance.component';

describe('BciComplianceComponent', () => {
  let component: BciComplianceComponent;
  let fixture: ComponentFixture<BciComplianceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BciComplianceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BciComplianceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

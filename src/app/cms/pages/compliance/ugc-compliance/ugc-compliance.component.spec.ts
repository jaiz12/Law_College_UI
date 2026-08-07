import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UgcComplianceComponent } from './ugc-compliance.component';

describe('UgcComplianceComponent', () => {
  let component: UgcComplianceComponent;
  let fixture: ComponentFixture<UgcComplianceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UgcComplianceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UgcComplianceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

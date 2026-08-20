import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalAidCellModalComponent } from './legal-aid-cell-modal.component';

describe('LegalAidCellModalComponent', () => {
  let component: LegalAidCellModalComponent;
  let fixture: ComponentFixture<LegalAidCellModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalAidCellModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegalAidCellModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

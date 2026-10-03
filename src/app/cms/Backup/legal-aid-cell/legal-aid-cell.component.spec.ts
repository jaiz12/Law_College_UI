import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalAidCellComponent } from './legal-aid-cell.component';

describe('LegalAidCellComponent', () => {
  let component: LegalAidCellComponent;
  let fixture: ComponentFixture<LegalAidCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalAidCellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegalAidCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

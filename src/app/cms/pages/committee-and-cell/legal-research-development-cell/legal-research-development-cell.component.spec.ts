import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalResearchDevelopmentCellComponent } from './legal-research-development-cell.component';

describe('LegalResearchDevelopmentCellComponent', () => {
  let component: LegalResearchDevelopmentCellComponent;
  let fixture: ComponentFixture<LegalResearchDevelopmentCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalResearchDevelopmentCellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegalResearchDevelopmentCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

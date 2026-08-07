import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalQualityAssuranceCellComponent } from './internal-quality-assurance-cell.component';

describe('InternalQualityAssuranceCellComponent', () => {
  let component: InternalQualityAssuranceCellComponent;
  let fixture: ComponentFixture<InternalQualityAssuranceCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InternalQualityAssuranceCellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InternalQualityAssuranceCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

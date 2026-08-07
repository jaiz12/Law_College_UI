import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenderSensitizationCellComponent } from './gender-sensitization-cell.component';

describe('GenderSensitizationCellComponent', () => {
  let component: GenderSensitizationCellComponent;
  let fixture: ComponentFixture<GenderSensitizationCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenderSensitizationCellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenderSensitizationCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

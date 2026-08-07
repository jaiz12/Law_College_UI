import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CareerCounsellingPlacementCellComponent } from './career-counselling-placement-cell.component';

describe('CareerCounsellingPlacementCellComponent', () => {
  let component: CareerCounsellingPlacementCellComponent;
  let fixture: ComponentFixture<CareerCounsellingPlacementCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CareerCounsellingPlacementCellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CareerCounsellingPlacementCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

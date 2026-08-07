import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScStMinorityCellComponent } from './sc-st-minority-cell.component';

describe('ScStMinorityCellComponent', () => {
  let component: ScStMinorityCellComponent;
  let fixture: ComponentFixture<ScStMinorityCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScStMinorityCellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScStMinorityCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalAidCellComponent } from './medical-aid-cell.component';

describe('MedicalAidCellComponent', () => {
  let component: MedicalAidCellComponent;
  let fixture: ComponentFixture<MedicalAidCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicalAidCellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalAidCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

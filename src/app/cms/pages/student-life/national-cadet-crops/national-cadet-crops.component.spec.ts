import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NationalCadetCropsComponent } from './national-cadet-crops.component';

describe('NationalCadetCropsComponent', () => {
  let component: NationalCadetCropsComponent;
  let fixture: ComponentFixture<NationalCadetCropsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NationalCadetCropsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NationalCadetCropsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

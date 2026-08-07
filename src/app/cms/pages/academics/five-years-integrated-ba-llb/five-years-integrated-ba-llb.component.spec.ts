import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiveYearsIntegratedBaLlbComponent } from './five-years-integrated-ba-llb.component';

describe('FiveYearsIntegratedBaLlbComponent', () => {
  let component: FiveYearsIntegratedBaLlbComponent;
  let fixture: ComponentFixture<FiveYearsIntegratedBaLlbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiveYearsIntegratedBaLlbComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiveYearsIntegratedBaLlbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

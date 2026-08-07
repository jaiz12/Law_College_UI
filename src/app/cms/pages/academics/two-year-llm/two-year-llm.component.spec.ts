import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoYearLlmComponent } from './two-year-llm.component';

describe('TwoYearLlmComponent', () => {
  let component: TwoYearLlmComponent;
  let fixture: ComponentFixture<TwoYearLlmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TwoYearLlmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TwoYearLlmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

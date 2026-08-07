import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AisheComponent } from './aishe.component';

describe('AisheComponent', () => {
  let component: AisheComponent;
  let fixture: ComponentFixture<AisheComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AisheComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AisheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NirfComponent } from './nirf.component';

describe('NirfComponent', () => {
  let component: NirfComponent;
  let fixture: ComponentFixture<NirfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NirfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NirfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

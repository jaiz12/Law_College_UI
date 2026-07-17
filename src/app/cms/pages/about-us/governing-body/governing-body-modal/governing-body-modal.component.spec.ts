import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoverningBodyModalComponent } from './governing-body-modal.component';

describe('GoverningBodyModalComponent', () => {
  let component: GoverningBodyModalComponent;
  let fixture: ComponentFixture<GoverningBodyModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoverningBodyModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoverningBodyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

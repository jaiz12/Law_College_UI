import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatutoryBodiesModalComponent } from './statutory-bodies-modal.component';

describe('StatutoryBodiesModalComponent', () => {
  let component: StatutoryBodiesModalComponent;
  let fixture: ComponentFixture<StatutoryBodiesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatutoryBodiesModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatutoryBodiesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatutoryBodiesComponent } from './statutory-bodies.component';

describe('StatutoryBodiesComponent', () => {
  let component: StatutoryBodiesComponent;
  let fixture: ComponentFixture<StatutoryBodiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatutoryBodiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatutoryBodiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

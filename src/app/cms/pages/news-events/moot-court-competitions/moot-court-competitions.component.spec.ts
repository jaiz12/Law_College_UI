import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MootCourtCompetitionsComponent } from './moot-court-competitions.component';

describe('MootCourtCompetitionsComponent', () => {
  let component: MootCourtCompetitionsComponent;
  let fixture: ComponentFixture<MootCourtCompetitionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MootCourtCompetitionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MootCourtCompetitionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AntiRaggingCommitteeAndSquadComponent } from './anti-ragging-committee-and-squad.component';

describe('AntiRaggingCommitteeAndSquadComponent', () => {
  let component: AntiRaggingCommitteeAndSquadComponent;
  let fixture: ComponentFixture<AntiRaggingCommitteeAndSquadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AntiRaggingCommitteeAndSquadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AntiRaggingCommitteeAndSquadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

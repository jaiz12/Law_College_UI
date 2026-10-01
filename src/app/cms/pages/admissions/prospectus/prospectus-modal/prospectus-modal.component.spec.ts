import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProspectusModalComponent } from './prospectus-modal.component';

describe('ProspectusModalComponent', () => {
  let component: ProspectusModalComponent;
  let fixture: ComponentFixture<ProspectusModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProspectusModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProspectusModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

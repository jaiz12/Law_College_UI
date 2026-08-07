import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramsOfferedModalComponent } from './programs-offered-modal.component';

describe('ProgramsOfferedModalComponent', () => {
  let component: ProgramsOfferedModalComponent;
  let fixture: ComponentFixture<ProgramsOfferedModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramsOfferedModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramsOfferedModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

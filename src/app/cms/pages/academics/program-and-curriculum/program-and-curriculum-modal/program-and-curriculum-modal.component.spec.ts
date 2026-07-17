import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramAndCurriculumModalComponent } from './program-and-curriculum-modal.component';

describe('ProgramAndCurriculumModalComponent', () => {
  let component: ProgramAndCurriculumModalComponent;
  let fixture: ComponentFixture<ProgramAndCurriculumModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramAndCurriculumModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramAndCurriculumModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
